"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Hash,
  Lock,
  MessageCircle,
  Paperclip,
  Plus,
  RefreshCw,
  Search,
  Send,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type WorkspaceChannel = {
  id: string;
  workspace_id: string;
  project_id: string | null;
  name: string;
  description: string | null;
  channel_type: string | null;
  is_private: boolean | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

type WorkspaceParticipant = {
  id: string;
  channel_id: string;
  user_id: string;
  role: string | null;
  joined_at: string | null;
};

type WorkspaceMessage = {
  id: string;
  channel_id: string;
  sender_user_id: string | null;
  message_type: string | null;
  body: string | null;
  metadata_json: any;
  created_at: string;
  updated_at: string;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
};

function logSupabaseError(label: string, error: any) {
  console.error(label, {
    message: error?.message ?? null,
    code: error?.code ?? null,
    details: error?.details ?? null,
    hint: error?.hint ?? null,
    full: error ?? null,
  });
}

function titleCaseFromEmail(emailOrName: string | null | undefined) {
  if (!emailOrName) return "User";

  const source = emailOrName.includes("@")
    ? emailOrName.split("@")[0]
    : emailOrName;

  const cleaned = source.replace(/[._-]+/g, " ").trim();
  if (!cleaned) return "User";

  return cleaned
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function getDisplayName(fullName: string | null | undefined, email?: string | null) {
  if (fullName && !fullName.includes("@")) return fullName.trim();
  if (fullName && fullName.includes("@")) return titleCaseFromEmail(fullName);
  if (email) return titleCaseFromEmail(email);
  return "User";
}

function getInitials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function hashColor(uid: string) {
  const colors = [
    "bg-violet-500",
    "bg-blue-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-indigo-500",
  ];
  let h = 0;
  for (let i = 0; i < uid.length; i++) {
    h = ((h << 5) - h + uid.charCodeAt(i)) | 0;
  }
  return colors[Math.abs(h) % colors.length];
}

function Avatar({
  name,
  avatarUrl,
  userId = "",
  size = "md",
}: {
  name: string | null;
  avatarUrl: string | null;
  userId?: string;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-9 w-9 text-xs" : "h-10 w-10 text-sm";
  const bg = userId ? hashColor(userId) : "bg-violet-500";

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name || "User"}
        className={`${dim} shrink-0 rounded-full object-cover`}
      />
    );
  }

  return (
    <div className={`${dim} ${bg} flex shrink-0 items-center justify-center rounded-full font-semibold text-white`}>
      {getInitials(name)}
    </div>
  );
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelative(dateStr: string) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function generateChannelName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

export default function ChatPage() {
  const router = useRouter();

  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  const [profilesMap, setProfilesMap] = useState<Record<string, ProfileRow>>({});
  const [channels, setChannels] = useState<WorkspaceChannel[]>([]);
  const [participants, setParticipants] = useState<WorkspaceParticipant[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [messages, setMessages] = useState<WorkspaceMessage[]>([]);
  const [search, setSearch] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelDescription, setNewChannelDescription] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function ensureGeneralChannel(activeWorkspaceId: string, userId: string) {
    const { data: existing, error: existingError } = await supabase
      .from("workspace_chat_channels")
      .select("id, workspace_id, project_id, name, description, channel_type, is_private, created_by, created_at, updated_at")
      .eq("workspace_id", activeWorkspaceId)
      .eq("is_private", false)
      .eq("name", "general")
      .limit(1)
      .maybeSingle();

    if (existingError) {
      logSupabaseError("ensureGeneralChannel existing error", existingError);
      return null;
    }

    if (existing?.id) {
      const { data: existingParticipant } = await supabase
        .from("workspace_chat_participants")
        .select("id")
        .eq("channel_id", existing.id)
        .eq("user_id", userId)
        .maybeSingle();

      if (!existingParticipant) {
        const { error: participantInsertError } = await supabase
          .from("workspace_chat_participants")
          .insert({
            channel_id: existing.id,
            user_id: userId,
            role: "member",
          });

        if (participantInsertError) {
          logSupabaseError("ensureGeneralChannel participant insert error", participantInsertError);
        }
      }

      return existing as WorkspaceChannel;
    }

    const { data: created, error: createError } = await supabase
      .from("workspace_chat_channels")
      .insert({
        workspace_id: activeWorkspaceId,
        name: "general",
        description: "General workspace discussion",
        channel_type: "workspace",
        is_private: false,
        created_by: userId,
      })
      .select("id, workspace_id, project_id, name, description, channel_type, is_private, created_by, created_at, updated_at")
      .single();

    if (createError) {
      logSupabaseError("ensureGeneralChannel create error", createError);
      return null;
    }

    const { error: participantError } = await supabase
      .from("workspace_chat_participants")
      .insert({
        channel_id: created.id,
        user_id: userId,
        role: "owner",
      });

    if (participantError) {
      logSupabaseError("ensureGeneralChannel owner participant error", participantError);
    }

    return created as WorkspaceChannel;
  }

  async function loadChannels() {
    if (!workspaceId || !currentUserId) return;

    setLoading(true);

    try {
      const generalChannel = await ensureGeneralChannel(workspaceId, currentUserId);

      const { data: participantRows, error: participantError } = await supabase
        .from("workspace_chat_participants")
        .select("id, channel_id, user_id, role, joined_at")
        .eq("user_id", currentUserId);

      if (participantError) {
        logSupabaseError("loadChannels participants error", participantError);
        return;
      }

      const channelIds = [...new Set((participantRows || []).map((row) => row.channel_id))];

      let channelRows: WorkspaceChannel[] = [];
      if (channelIds.length > 0) {
        const { data: channelsData, error: channelsError } = await supabase
          .from("workspace_chat_channels")
          .select("id, workspace_id, project_id, name, description, channel_type, is_private, created_by, created_at, updated_at")
          .eq("workspace_id", workspaceId)
          .in("id", channelIds)
          .order("updated_at", { ascending: false });

        if (channelsError) {
          logSupabaseError("loadChannels channels error", channelsError);
          return;
        }

        channelRows = (channelsData || []) as WorkspaceChannel[];
      }

      if (generalChannel && !channelRows.some((channel) => channel.id === generalChannel.id)) {
        channelRows = [generalChannel, ...channelRows];
      }

      setParticipants((participantRows || []) as WorkspaceParticipant[]);
      setChannels(channelRows);

      setActiveChannelId((prev) => {
        if (prev && channelRows.some((channel) => channel.id === prev)) return prev;
        const general = channelRows.find((channel) => channel.name === "general");
        return general?.id || channelRows[0]?.id || null;
      });
    } finally {
      setLoading(false);
    }
  }

  async function loadProfiles() {
    if (!workspaceId) return;

    const { data: memberRows, error: memberError } = await supabase
      .from("workspace_members")
      .select("user_id")
      .eq("workspace_id", workspaceId);

    if (memberError) {
      logSupabaseError("loadProfiles workspace members error", memberError);
      return;
    }

    const userIds = [...new Set((memberRows || []).map((row) => row.user_id))];
    if (!userIds.length) {
      setProfilesMap({});
      return;
    }

    const { data: profileRows, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", userIds);

    if (profileError) {
      logSupabaseError("loadProfiles profiles error", profileError);
      return;
    }

    const map: Record<string, ProfileRow> = {};
    for (const row of profileRows || []) {
      map[row.id] = row as ProfileRow;
    }
    setProfilesMap(map);
  }

  async function loadMessages(channelId: string) {
    setLoadingMessages(true);

    try {
      const { data, error } = await supabase
        .from("workspace_chat_messages")
        .select("id, channel_id, sender_user_id, message_type, body, metadata_json, created_at, updated_at")
        .eq("channel_id", channelId)
        .is("deleted_at", null)
        .order("created_at", { ascending: true });

      if (error) {
        logSupabaseError("loadMessages error", error);
        return;
      }

      setMessages((data || []) as WorkspaceMessage[]);
    } finally {
      setLoadingMessages(false);
    }
  }

  async function bootstrap() {
    setLoading(true);

    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.push("/");
        return;
      }

      setCurrentUserId(user.id);
      setCurrentUserEmail(user.email ?? null);

      const { data: membershipRows, error: membershipError } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", user.id)
        .limit(1);

      if (membershipError || !(membershipRows || []).length) {
        if (membershipError) logSupabaseError("bootstrap membership error", membershipError);
        router.push("/onboarding");
        return;
      }

      const activeWorkspaceId = membershipRows?.[0]?.workspace_id ?? null;
      setWorkspaceId(activeWorkspaceId);

      if (!activeWorkspaceId) return;

      await loadProfiles();
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    bootstrap();
  }, []);

  useEffect(() => {
    if (!workspaceId || !currentUserId) return;

    async function initializeChat() {
      await loadProfiles();
      await loadChannels();
    }

    initializeChat();
  }, [workspaceId, currentUserId]);

  useEffect(() => {
    if (!activeChannelId) return;
    loadMessages(activeChannelId);

    const channel = supabase
      .channel(`workspace-chat-${activeChannelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "workspace_chat_messages",
          filter: `channel_id=eq.${activeChannelId}`,
        },
        (payload) => {
          setMessages((prev) => {
            const exists = prev.some((msg) => msg.id === payload.new.id);
            if (exists) return prev;
            return [...prev, payload.new as WorkspaceMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChannelId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeChannelId]);

  const filteredChannels = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return channels;
    return channels.filter((channel) => {
      const haystack = `${channel.name} ${channel.description ?? ""}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [channels, search]);

  const activeChannel = channels.find((channel) => channel.id === activeChannelId) || null;

  const groupedMessages = messages.map((message, index) => {
    const senderProfile = message.sender_user_id ? profilesMap[message.sender_user_id] : null;
    const senderName =
      message.sender_user_id === currentUserId
        ? getDisplayName(
            profilesMap[message.sender_user_id || ""]?.full_name ?? null,
            currentUserEmail
          )
        : getDisplayName(senderProfile?.full_name ?? null);

    return {
      ...message,
      senderName,
      senderAvatar: senderProfile?.avatar_url ?? null,
      isMine: message.sender_user_id === currentUserId,
      showMeta:
        index === 0 || messages[index - 1].sender_user_id !== message.sender_user_id,
    };
  });

  async function handleRefresh() {
    if (!workspaceId || !currentUserId) return;
    setRefreshing(true);
    try {
      await loadProfiles();
      await loadChannels();
      if (activeChannelId) await loadMessages(activeChannelId);
    } finally {
      setRefreshing(false);
    }
  }

  async function handleCreateChannel() {
    if (!workspaceId || !currentUserId) return;

    const rawName = newChannelName.trim();
    if (!rawName) return;

    const channelName = generateChannelName(rawName);

    const { data: createdChannel, error: channelError } = await supabase
      .from("workspace_chat_channels")
      .insert({
        workspace_id: workspaceId,
        name: channelName,
        description: newChannelDescription.trim() || null,
        channel_type: "workspace",
        is_private: false,
        created_by: currentUserId,
      })
      .select("id, workspace_id, project_id, name, description, channel_type, is_private, created_by, created_at, updated_at")
      .single();

    if (channelError) {
      logSupabaseError("handleCreateChannel channel error", channelError);
      return;
    }

    const { error: participantError } = await supabase
      .from("workspace_chat_participants")
      .insert({
        channel_id: createdChannel.id,
        user_id: currentUserId,
        role: "owner",
      });

    if (participantError) {
      logSupabaseError("handleCreateChannel participant error", participantError);
      return;
    }

    setCreateModalOpen(false);
    setNewChannelName("");
    setNewChannelDescription("");
    await loadChannels();
    setActiveChannelId(createdChannel.id);
  }

  async function handleSendMessage() {
    if (!activeChannelId || !currentUserId || !input.trim() || sending) return;

    const body = input.trim();
    setSending(true);
    setInput("");

    try {
      const { error } = await supabase.from("workspace_chat_messages").insert({
        channel_id: activeChannelId,
        sender_user_id: currentUserId,
        message_type: "text",
        body,
      });

      if (error) {
        logSupabaseError("handleSendMessage error", error);
        setInput(body);
      }
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }

  return (
    <div className="flex h-full flex-1 overflow-hidden bg-[#f6f7fb]">
      <aside className="flex w-[300px] shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[22px] font-bold tracking-tight text-slate-900">Chat</h1>
              <p className="mt-1 text-sm text-slate-500">Workspace channels</p>
            </div>

            <button
              onClick={handleRefresh}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="relative mt-4">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search channels..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
            />
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New channel
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : filteredChannels.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white">
                <MessageCircle className="h-5 w-5 text-slate-400" />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-700">No channels found</p>
              <p className="mt-1 text-xs text-slate-400">Create your first workspace chat channel.</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {filteredChannels.map((channel) => {
                const isActive = channel.id === activeChannelId;
                const participantCount = participants.filter(
                  (participant) => participant.channel_id === channel.id
                ).length;

                return (
                  <button
                    key={channel.id}
                    onClick={() => setActiveChannelId(channel.id)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                      isActive
                        ? "border-violet-200 bg-violet-50"
                        : "border-transparent bg-white hover:border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100">
                        {channel.is_private ? (
                          <Lock className="h-4 w-4 text-slate-600" />
                        ) : (
                          <Hash className="h-4 w-4 text-slate-600" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-semibold text-slate-900">
                          {channel.name}
                        </p>
                        <p className="mt-0.5 truncate text-[12px] text-slate-500">
                          {channel.description || "Workspace channel"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                        {participantCount} {participantCount === 1 ? "member" : "members"}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatRelative(channel.updated_at)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col bg-white">
        <div className="flex h-[78px] shrink-0 items-center justify-between border-b border-slate-200 px-6">
          {activeChannel ? (
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
                {activeChannel.is_private ? (
                  <Lock className="h-5 w-5 text-slate-600" />
                ) : (
                  <Hash className="h-5 w-5 text-slate-600" />
                )}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-[18px] font-bold text-slate-900">
                  {activeChannel.name}
                </h2>
                <p className="truncate text-sm text-slate-500">
                  {activeChannel.description || "Workspace channel"}
                </p>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-[18px] font-bold text-slate-900">Workspace Chat</h2>
              <p className="text-sm text-slate-500">Select a channel to start messaging.</p>
            </div>
          )}

          {activeChannel && (
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
              <Users className="h-3.5 w-3.5" />
              {participants.filter((participant) => participant.channel_id === activeChannel.id).length}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto bg-[#f8f9fc] px-6 py-6">
          {!activeChannel ? (
            <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <MessageCircle className="h-6 w-6 text-slate-500" />
              </div>
              <h3 className="mt-4 text-[20px] font-semibold text-slate-900">No channel selected</h3>
              <p className="mt-2 max-w-md text-sm text-slate-500">
                Choose an existing channel on the left or create a new one for your workspace.
              </p>
            </div>
          ) : loadingMessages ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-2xl bg-white" />
              ))}
            </div>
          ) : groupedMessages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <Hash className="h-6 w-6 text-slate-500" />
              </div>
              <h3 className="mt-4 text-[20px] font-semibold text-slate-900">No messages yet</h3>
              <p className="mt-2 max-w-md text-sm text-slate-500">
                Start the conversation in {activeChannel.name}.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {groupedMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.isMine ? "justify-end" : "justify-start"}`}
                >
                  {!message.isMine && (
                    <Avatar
                      name={message.senderName}
                      avatarUrl={message.senderAvatar}
                      size="sm"
                      userId={message.sender_user_id || ""}
                    />
                  )}

                  <div className={`max-w-[720px] ${message.isMine ? "items-end" : "items-start"} flex flex-col`}>
                    {message.showMeta && (
                      <div className={`mb-1 flex items-center gap-2 px-1 text-[11px] text-slate-400 ${message.isMine ? "justify-end" : "justify-start"}`}>
                        <span className="font-semibold text-slate-500">{message.senderName}</span>
                        <span>{formatTime(message.created_at)}</span>
                      </div>
                    )}

                    <div
                      className={`rounded-2xl px-4 py-3 text-[14px] leading-6 shadow-sm ${
                        message.isMine
                          ? "rounded-br-md bg-blue-600 text-white"
                          : "rounded-bl-md bg-white text-slate-800"
                      }`}
                    >
                      {message.body || ""}
                    </div>
                  </div>

                  {message.isMine && (
                    <Avatar
                      name={message.senderName}
                      avatarUrl={message.senderAvatar}
                      size="sm"
                      userId={message.sender_user_id || ""}
                    />
                  )}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 bg-white px-6 py-4">
          <div className="flex items-end gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <button
              onClick={() => fileRef.current?.click()}
              className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white hover:text-slate-600"
              title="Attachments later"
            >
              <Paperclip className="h-4 w-4" />
            </button>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={activeChannel ? `Message #${activeChannel.name}` : "Select a channel first"}
              rows={1}
              disabled={!activeChannel}
              className="max-h-[120px] min-h-[24px] flex-1 resize-none bg-transparent text-[14px] text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
            />

            <button
              onClick={handleSendMessage}
              disabled={!activeChannel || !input.trim() || sending}
              className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

          <input
            ref={fileRef}
            type="file"
            className="hidden"
          />
        </div>
      </section>

      {createModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setCreateModalOpen(false);
            }
          }}
        >
          <div className="w-full max-w-[520px] rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[22px] font-bold tracking-tight text-slate-900">Create channel</h3>
                <p className="mt-1 text-sm text-slate-500">Add a clean workspace chat channel.</p>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <Plus className="h-4 w-4 rotate-45" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Channel name</label>
                <input
                  type="text"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="e.g. Site Coordination"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  value={newChannelDescription}
                  onChange={(e) => setNewChannelDescription(e.target.value)}
                  placeholder="What is this channel for?"
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setCreateModalOpen(false)}
                className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateChannel}
                disabled={!newChannelName.trim()}
                className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Create channel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
