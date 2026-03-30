"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  ArrowUpRight,
  Bell,
  Check,
  ChevronDown,
  Copy,
  CreditCard,
  Download,
  Globe,
  Hash,
  Home,
  LogOut,
  MessageSquare,
  Paperclip,
  Plus,
  Receipt,
  Search,
  Send,
  Settings,
  Shield,
  Users,
  X,
  Zap,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Workspace = {
  id: string;
  name: string;
  company_name: string | null;
  join_key: string | null;
};

type Profile = {
  full_name: string | null;
  avatar_url: string | null;
};

type TeamMember = {
  user_id: string;
  role: string;
  full_name: string | null;
  avatar_url: string | null;
};

type ModalType = "team" | "billing" | "settings" | null;

type NotificationItem = {
  id: string;
  title: string | null;
  message: string | null;
  project_id: string | null;
  is_read: boolean | null;
  created_at: string;
  type: string | null;
};

type Conversation = {
  id: string;
  workspace_id: string;
  type: "workspace" | "direct" | "group";
  title: string | null;
  created_by: string | null;
  updated_at: string;
};

type ConversationMember = {
  id: string;
  conversation_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  last_read_at: string | null;
};

type ChatMessage = {
  id: string;
  conversation_id: string;
  user_id: string | null;
  content: string;
  message_type: "text" | "system" | "file" | "image";
  sender_name: string | null;
  sender_avatar: string | null;
  created_at: string;
  updated_at: string;
};

const ROLES = ["owner", "co-owner", "worker"] as const;
type Role = (typeof ROLES)[number];

const ROLE_COLORS: Record<string, string> = {
  owner: "bg-violet-100 text-violet-700",
  "co-owner": "bg-blue-100 text-blue-700",
  worker: "bg-slate-100 text-slate-600",
};

function getInitials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
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

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelative(dateStr: string) {
  const now = Date.now();
  const d = new Date(dateStr).getTime();
  const diff = Math.max(0, now - d);

  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 60) return `${mins || 1}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function AvatarCircle({
  name,
  avatarUrl,
  size = "md",
  userId = "",
}: {
  name: string | null;
  avatarUrl: string | null;
  size?: "xs" | "sm" | "md";
  userId?: string;
}) {
  const dim =
    size === "xs"
      ? "h-7 w-7 text-[10px]"
      : size === "sm"
      ? "h-9 w-9 text-xs"
      : "h-11 w-11 text-sm";

  const bg = userId ? hashColor(userId) : "bg-violet-500";

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name || "User"}
        className={`${dim} rounded-full object-cover shrink-0 border border-white/70`}
      />
    );
  }

  return (
    <div
      className={`${dim} flex shrink-0 items-center justify-center rounded-full ${bg} font-semibold text-white`}
    >
      {getInitials(name)}
    </div>
  );
}

function BillingContent({ onContactSales }: { onContactSales: () => void }) {
  const plans = [
    {
      name: "Starter",
      subtitle: "For smaller teams getting started with a structured risk workflow",
      features: [
        "Project intake & baseline setup",
        "Workspace risk collaboration",
        "Project overview with risk visibility",
        "Core team access",
      ],
      badge: null,
      highlighted: false,
    },
    {
      name: "Professional",
      subtitle: "For teams managing project risk in a more structured way",
      features: [
        "Everything in Starter",
        "Advanced risk workflows",
        "Stronger team collaboration",
        "Reporting and broader project control",
      ],
      badge: "Most popular",
      highlighted: true,
    },
    {
      name: "Enterprise",
      subtitle: "For larger organisations with governance, security and scale requirements",
      features: [
        "Everything in Professional",
        "Custom implementation",
        "Enterprise support & governance",
        "Integrations and scalable rollout",
      ],
      badge: null,
      highlighted: false,
    },
  ];

  const reasons = [
    {
      title: "What fits your team?",
      text: "We tailor the setup to your project type, team structure and workflow requirements.",
    },
    {
      title: "Implementation & onboarding",
      text: "We review setup, project intake, roles and adoption across your organisation.",
    },
    {
      title: "Integrations & custom needs",
      text: "For larger environments we align on integrations, governance and rollout needs.",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 via-white to-white p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
              Sales-led pricing
            </p>
            <h4 className="mt-1 text-[22px] font-bold text-slate-900">
              Book a short sales conversation
            </h4>
            <p className="mt-2 max-w-[620px] text-sm leading-6 text-slate-600">
              RiskBases is configured around your projects, team structure and desired
              workflow. That is why we use a sales-led pricing model instead of fixed
              public pricing.
            </p>
          </div>

          <button
            onClick={onContactSales}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Contact sales
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-base font-semibold text-slate-800">Plans</h4>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-500">
            Custom proposal per team
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-5 ${
                plan.highlighted
                  ? "border-violet-400 bg-violet-50/40 shadow-[0_8px_30px_rgba(109,40,217,0.08)]"
                  : "border-slate-200 bg-white"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-2.5 left-4 rounded-full bg-violet-600 px-2.5 py-1 text-[10px] font-semibold text-white">
                  {plan.badge}
                </span>
              )}

              <p className="text-[18px] font-bold text-slate-900">{plan.name}</p>
              <p className="mt-2 min-h-[54px] text-[13px] leading-6 text-slate-500">
                {plan.subtitle}
              </p>

              <div className="mt-5 h-px bg-slate-100" />

              <ul className="mt-5 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13px] leading-6 text-slate-700">
                    <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-violet-500" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={onContactSales}
                className={`mt-6 w-full rounded-xl border py-2.5 text-sm font-semibold transition ${
                  plan.highlighted
                    ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                Contact sales
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-4 text-base font-semibold text-slate-800">Why teams book a call</h4>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {reasons.map((item) => (
            <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-800">{item.title}</p>
              <p className="mt-2 text-[13px] leading-6 text-slate-500">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-base font-semibold text-slate-800">Current workspace usage</h4>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            { label: "Projects", used: 4, max: "Custom" },
            { label: "Team members", used: 3, max: "Scalable" },
            { label: "Risks logged", used: 47, max: "Scalable" },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">{item.label}</p>
              <p className="mt-2 text-[26px] font-bold text-slate-900">
                {item.used}
                <span className="ml-2 text-xs font-medium text-slate-400">{item.max}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-base font-semibold text-slate-800">Recent invoices</h4>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {[
            { date: "1 Feb 2025", status: "Paid" },
            { date: "1 Jan 2025", status: "Paid" },
            { date: "1 Dec 2024", status: "Paid" },
          ].map((inv, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between px-4 py-3.5 ${
                idx < 2 ? "border-b border-slate-100" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
                  <Receipt className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{inv.date}</p>
                  <p className="text-xs text-slate-400">Invoice available on request</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                  {inv.status}
                </span>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
                  <Download className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsContent({ workspace }: { workspace: Workspace | null }) {
  const [workspaceName, setWorkspaceName] = useState(workspace?.name || "");
  const [companyName, setCompanyName] = useState(workspace?.company_name || "");
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-7">
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Globe className="h-4 w-4 text-slate-400" />
          <h4 className="text-base font-semibold text-slate-800">Workspace</h4>
        </div>

        <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Workspace name</label>
            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Company name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center gap-2">
          <Bell className="h-4 w-4 text-slate-400" />
          <h4 className="text-base font-semibold text-slate-800">Notifications</h4>
        </div>

        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-5">
          {[
            {
              label: "Email notifications",
              desc: "Receive updates on changes across your workspace",
              value: emailNotifs,
              onChange: setEmailNotifs,
            },
            {
              label: "Weekly digest",
              desc: "Receive a summary of activity every week",
              value: weeklyDigest,
              onChange: setWeeklyDigest,
            },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-800">{item.label}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>

              <button
                onClick={() => item.onChange(!item.value)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  item.value ? "bg-blue-500" : "bg-slate-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    item.value ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center gap-2">
          <Shield className="h-4 w-4 text-slate-400" />
          <h4 className="text-base font-semibold text-slate-800">Security</h4>
        </div>

        <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm text-slate-600">
            SSO, audit controls and advanced governance can be discussed for Enterprise setups.
          </p>
          <button className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100">
            <Zap className="h-3.5 w-3.5 text-blue-500" />
            Contact sales
          </button>
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-base font-semibold text-red-600">Danger zone</h4>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-slate-700">
            Deleting a workspace is permanent and cannot be undone.
          </p>
          <button className="mt-3 inline-flex h-8 items-center rounded-lg border border-red-300 bg-white px-3 text-xs font-semibold text-red-600 transition hover:bg-red-50">
            Delete workspace
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700"
          onClick={handleSave}
        >
          {saved ? (
            <>
              <Check className="h-4 w-4" />
              Saved!
            </>
          ) : (
            "Save changes"
          )}
        </button>
      </div>
    </div>
  );
}

function NotificationsDropdown({
  items,
  loading,
  onRefresh,
  onOpenProject,
}: {
  items: NotificationItem[];
  loading: boolean;
  onRefresh: () => void;
  onOpenProject: (projectId: string | null) => void;
}) {
  return (
    <div className="absolute right-0 top-[calc(100%+10px)] z-[120] w-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.14)]">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
        <div>
          <p className="text-sm font-bold text-slate-900">Notifications</p>
          <p className="text-[11px] text-slate-400">Recent workspace updates</p>
        </div>
        <button
          onClick={onRefresh}
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      <div className="max-h-[420px] overflow-y-auto">
        {loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
              <Bell className="h-5 w-5 text-slate-400" />
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-700">No notifications yet</p>
            <p className="mt-1 text-xs text-slate-400">Everything is quiet for now.</p>
          </div>
        ) : (
          <div className="p-2">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => onOpenProject(item.project_id)}
                className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-50"
              >
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-[11px] font-bold text-violet-700">
                  {item.type?.[0]?.toUpperCase() || "N"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-slate-800">
                    {item.title || "Notification"}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-[12px] leading-5 text-slate-500">
                    {item.message || "No details available."}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">{formatRelative(item.created_at)}</span>
                    {!item.is_read && (
                      <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600">
                        New
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ChatPanel({
  workspaceId,
  currentUserId,
  currentProfile,
  teamMembers,
  sidebarWidth,
  onClose,
}: {
  workspaceId: string;
  currentUserId: string;
  currentProfile: Profile | null;
  teamMembers: TeamMember[];
  sidebarWidth: number;
  onClose: () => void;
}) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationMembers, setConversationMembers] = useState<ConversationMember[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [search, setSearch] = useState("");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [newGroupTitle, setNewGroupTitle] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const teamMap = useMemo(() => {
    const map = new Map<string, TeamMember>();
    for (const member of teamMembers) map.set(member.user_id, member);
    return map;
  }, [teamMembers]);

  async function loadConversations() {
    setLoadingConversations(true);
    try {
      await supabase.rpc("create_workspace_default_chat", {
        p_workspace_id: workspaceId,
        p_user_id: currentUserId,
      });

      const { data: convData, error: convError } = await supabase
        .from("chat_conversations")
        .select("id, workspace_id, type, title, created_by, updated_at")
        .eq("workspace_id", workspaceId)
        .order("updated_at", { ascending: false });

      if (convError) {
        console.error(convError);
        return;
      }

      const conversationsList = (convData || []) as Conversation[];
      setConversations(conversationsList);

      if (conversationsList.length > 0) {
        const ids = conversationsList.map((c) => c.id);

        const { data: membersData, error: membersError } = await supabase
          .from("chat_conversation_members")
          .select("id, conversation_id, user_id, role, joined_at, last_read_at")
          .in("conversation_id", ids);

        if (!membersError) {
          setConversationMembers((membersData || []) as ConversationMember[]);
        }

        if (!activeConversationId) {
          const workspaceConv =
            conversationsList.find((c) => c.type === "workspace") || conversationsList[0];
          setActiveConversationId(workspaceConv.id);
        }
      }
    } finally {
      setLoadingConversations(false);
    }
  }

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  useEffect(() => {
    if (!activeConversationId) return;

    async function loadMessages() {
      setLoadingMessages(true);

      const { data, error } = await supabase
        .from("chat_messages")
        .select(
          "id, conversation_id, user_id, content, message_type, sender_name, sender_avatar, created_at, updated_at"
        )
        .eq("conversation_id", activeConversationId)
        .is("deleted_at", null)
        .order("created_at", { ascending: true });

      if (!error) {
        setMessages((data || []) as ChatMessage[]);
      } else {
        console.error(error);
      }

      setLoadingMessages(false);
    }

    loadMessages();

    const channel = supabase
      .channel(`conversation-${activeConversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `conversation_id=eq.${activeConversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeConversationId]);

  const conversationById = useMemo(() => {
    const map = new Map<string, Conversation>();
    for (const c of conversations) map.set(c.id, c);
    return map;
  }, [conversations]);

  const workspaceConversation = conversations.find((c) => c.type === "workspace") || null;
  const groupConversations = conversations.filter((c) => c.type === "group");

  const directConversations = conversations
    .filter((c) => c.type === "direct")
    .map((conv) => {
      const members = conversationMembers.filter((m) => m.conversation_id === conv.id);
      const other = members.find((m) => m.user_id !== currentUserId);
      const otherProfile = other ? teamMap.get(other.user_id) : null;

      return {
        ...conv,
        otherUserId: other?.user_id || null,
        otherName: otherProfile?.full_name || "Direct message",
        otherAvatar: otherProfile?.avatar_url || null,
        otherRole: otherProfile?.role || null,
      };
    })
    .filter((conv) =>
      (conv.otherName || "").toLowerCase().includes(search.toLowerCase())
    );

  const filteredTeamMembers = teamMembers
    .filter((member) => member.user_id !== currentUserId)
    .filter((member) =>
      (member.full_name || "").toLowerCase().includes(search.toLowerCase())
    );

  const activeConversation =
    activeConversationId ? conversationById.get(activeConversationId) || null : null;

  const activeConversationMembers = activeConversationId
    ? conversationMembers.filter((m) => m.conversation_id === activeConversationId)
    : [];

  const activeDirectOther =
    activeConversation?.type === "direct"
      ? teamMap.get(
          activeConversationMembers.find((m) => m.user_id !== currentUserId)?.user_id || ""
        ) || null
      : null;

  const groupedMessages = messages.map((msg, i) => ({
    ...msg,
    isMe: msg.user_id === currentUserId,
    showAvatar: i === 0 || messages[i - 1].user_id !== msg.user_id,
    showName: i === 0 || messages[i - 1].user_id !== msg.user_id,
  }));

  async function startDirectMessage(otherUserId: string) {
    const { data, error } = await supabase.rpc("create_direct_conversation", {
      p_workspace_id: workspaceId,
      p_other_user_id: otherUserId,
    });

    if (error) {
      console.error(error);
      return;
    }

    await loadConversations();
    if (data) setActiveConversationId(data as string);
  }

  async function createGroupConversation() {
    const title = newGroupTitle.trim();
    if (!title) return;

    const { data, error } = await supabase.rpc("create_group_conversation", {
      p_workspace_id: workspaceId,
      p_title: title,
      p_member_ids: selectedMembers,
    });

    if (error) {
      console.error(error);
      return;
    }

    setCreateGroupOpen(false);
    setNewGroupTitle("");
    setSelectedMembers([]);
    await loadConversations();
    if (data) setActiveConversationId(data as string);
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || sending || !activeConversationId) return;

    setSending(true);
    setInput("");

    try {
      const { error } = await supabase.from("chat_messages").insert({
        conversation_id: activeConversationId,
        user_id: currentUserId,
        content: text,
        message_type: "text",
        sender_name: currentProfile?.full_name ?? "User",
        sender_avatar: currentProfile?.avatar_url ?? null,
      });

      if (error) {
        console.error("Message send error:", error);
      }
    } finally {
      setSending(false);
    }
  }

  async function deleteMessage(messageId: string) {
    const { error } = await supabase
      .from("chat_messages")
      .delete()
      .eq("id", messageId)
      .eq("user_id", currentUserId);

    if (!error) {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div
      className="fixed top-0 bottom-0 z-40 flex overflow-hidden border-r border-slate-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.12)]"
      style={{
        left: sidebarWidth,
        width: 430,
        transition: "left 220ms ease",
      }}
    >
      <div className="flex w-[150px] flex-col border-r border-slate-200 bg-slate-50/70">
        <div className="flex h-[72px] items-center justify-between border-b border-slate-200 px-4">
          <div>
            <p className="text-[14px] font-bold text-slate-900">Chat</p>
            <p className="text-[11px] text-slate-400">Workspace messaging</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-3">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="w-full bg-transparent text-[12px] text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="px-3 pb-2">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Channels
            </p>
            <button
              onClick={() => setCreateGroupOpen(true)}
              className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {workspaceConversation && (
            <button
              onClick={() => setActiveConversationId(workspaceConversation.id)}
              className={`mb-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left transition ${
                activeConversationId === workspaceConversation.id
                  ? "bg-violet-100 text-violet-700"
                  : "text-slate-700 hover:bg-white"
              }`}
            >
              <Hash className="h-4 w-4 shrink-0" />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold">workspace</p>
                <p className="truncate text-[10px] text-slate-400">All workspace members</p>
              </div>
            </button>
          )}

          {groupConversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setActiveConversationId(conv.id)}
              className={`mb-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left transition ${
                activeConversationId === conv.id
                  ? "bg-violet-100 text-violet-700"
                  : "text-slate-700 hover:bg-white"
              }`}
            >
              <Hash className="h-4 w-4 shrink-0" />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold">{conv.title || "Group chat"}</p>
                <p className="truncate text-[10px] text-slate-400">Custom group</p>
              </div>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Direct messages
            </p>
            <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
              {directConversations.length}
            </span>
          </div>

          <div className="space-y-1">
            {loadingConversations ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded-xl bg-slate-100" />
              ))
            ) : directConversations.length > 0 ? (
              directConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left transition ${
                    activeConversationId === conv.id ? "bg-violet-100" : "hover:bg-white"
                  }`}
                >
                  <AvatarCircle
                    name={conv.otherName}
                    avatarUrl={conv.otherAvatar}
                    size="xs"
                    userId={conv.otherUserId || ""}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-medium text-slate-700">
                      {conv.otherName}
                    </p>
                    <p className="truncate text-[10px] text-slate-400">Direct message</p>
                  </div>
                </button>
              ))
            ) : (
              filteredTeamMembers.map((member) => (
                <button
                  key={member.user_id}
                  onClick={() => startDirectMessage(member.user_id)}
                  className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left transition hover:bg-white"
                >
                  <AvatarCircle
                    name={member.full_name}
                    avatarUrl={member.avatar_url}
                    size="xs"
                    userId={member.user_id}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-medium text-slate-700">
                      {member.full_name || "User"}
                    </p>
                    <p className="truncate text-[10px] capitalize text-slate-400">{member.role}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="border-t border-slate-200 p-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Team
          </p>
          <div className="space-y-1">
            {filteredTeamMembers.slice(0, 3).map((member) => (
              <button
                key={member.user_id}
                onClick={() => startDirectMessage(member.user_id)}
                className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left transition hover:bg-white"
              >
                <AvatarCircle
                  name={member.full_name}
                  avatarUrl={member.avatar_url}
                  size="xs"
                  userId={member.user_id}
                />
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-medium text-slate-700">
                    {member.full_name || "User"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col bg-white">
        <div className="flex h-[72px] items-center justify-between border-b border-slate-100 px-5">
          {activeConversation?.type === "workspace" && (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100">
                <MessageSquare className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-slate-900"># workspace</h2>
                <p className="text-[11px] text-slate-400">Open group chat for the whole team</p>
              </div>
            </div>
          )}

          {activeConversation?.type === "group" && (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-slate-900">
                  {activeConversation.title || "Group chat"}
                </h2>
                <p className="text-[11px] text-slate-400">Custom group conversation</p>
              </div>
            </div>
          )}

          {activeConversation?.type === "direct" && (
            <div className="flex items-center gap-3">
              <AvatarCircle
                name={activeDirectOther?.full_name || "User"}
                avatarUrl={activeDirectOther?.avatar_url || null}
                size="sm"
                userId={activeDirectOther?.user_id || ""}
              />
              <div>
                <h2 className="text-[15px] font-bold text-slate-900">
                  {activeDirectOther?.full_name || "Direct message"}
                </h2>
                <p className="text-[11px] text-slate-400">Private conversation</p>
              </div>
            </div>
          )}

          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
            Live
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {loadingMessages ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : groupedMessages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100">
                <MessageSquare className="h-8 w-8 text-violet-500" />
              </div>
              <p className="text-sm font-semibold text-slate-700">No messages yet</p>
              <p className="mt-1 text-xs text-slate-400">Start the conversation here.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {groupedMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.isMe ? "flex-row-reverse" : ""} ${
                    msg.showAvatar ? "mt-3" : "mt-0.5"
                  }`}
                  onMouseEnter={() => setHoveredMessageId(msg.id)}
                  onMouseLeave={() => setHoveredMessageId(null)}
                >
                  <div className="flex-shrink-0 self-end">
                    {msg.showAvatar ? (
                      <AvatarCircle
                        name={msg.sender_name}
                        avatarUrl={msg.sender_avatar}
                        size="xs"
                        userId={msg.user_id || ""}
                      />
                    ) : (
                      <div className="h-7 w-7" />
                    )}
                  </div>

                  <div
                    className={`flex max-w-[220px] flex-col ${
                      msg.isMe ? "items-end" : "items-start"
                    }`}
                  >
                    {msg.showName && !msg.isMe && (
                      <span className="mb-1 ml-1 text-[11px] font-semibold text-slate-500">
                        {msg.sender_name ?? "User"}
                      </span>
                    )}

                    <div
                      style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        flexDirection: msg.isMe ? "row" : "row-reverse",
                      }}
                    >
                      {msg.isMe && hoveredMessageId === msg.id && (
                        <button
                          onClick={() => deleteMessage(msg.id)}
                          title="Delete message"
                          style={{
                            flexShrink: 0,
                            padding: "2px 4px",
                            borderRadius: 6,
                            border: "none",
                            background: "#f1f5f9",
                            cursor: "pointer",
                            color: "#94a3b8",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <X style={{ height: 12, width: 12 }} />
                        </button>
                      )}

                      <div
                        className={`break-words rounded-2xl px-3.5 py-2.5 text-[13px] leading-snug ${
                          msg.isMe
                            ? "rounded-br-sm bg-violet-600 text-white"
                            : "rounded-bl-sm bg-slate-100 text-slate-800"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>

                    <span className="mx-1 mt-0.5 text-[10px] text-slate-400">
                      {formatTime(msg.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-slate-100 px-4 py-3">
          <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 transition focus-within:border-violet-400 focus-within:bg-white">
            <button
              className="mb-0.5 flex-shrink-0 text-slate-400 transition hover:text-violet-500"
              onClick={() => fileRef.current?.click()}
            >
              <Paperclip className="h-4 w-4" />
            </button>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="max-h-[100px] flex-1 resize-none bg-transparent text-[13px] text-slate-800 outline-none placeholder:text-slate-400"
              style={{ minHeight: 20 }}
            />

            <button
              onClick={sendMessage}
              disabled={!input.trim() || sending || !activeConversationId}
              className="mb-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*,.pdf,.doc,.docx"
            className="hidden"
          />

          <p className="mt-1.5 text-center text-[10px] text-slate-400">
            Enter to send · Shift+Enter for a new line
          </p>
        </div>
      </div>

      {createGroupOpen && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="w-[320px] rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">Create group chat</p>
                <p className="text-[11px] text-slate-400">Select teammates and a title</p>
              </div>
              <button
                onClick={() => setCreateGroupOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-slate-600">
                Group name
              </label>
              <input
                value={newGroupTitle}
                onChange={(e) => setNewGroupTitle(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400"
                placeholder="Site coordination"
              />
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-[12px] font-medium text-slate-600">
                Members
              </label>
              <div className="max-h-[180px] space-y-1 overflow-y-auto rounded-xl border border-slate-200 p-2">
                {teamMembers
                  .filter((m) => m.user_id !== currentUserId)
                  .map((member) => {
                    const checked = selectedMembers.includes(member.user_id);
                    return (
                      <button
                        key={member.user_id}
                        onClick={() =>
                          setSelectedMembers((prev) =>
                            checked
                              ? prev.filter((id) => id !== member.user_id)
                              : [...prev, member.user_id]
                          )
                        }
                        className={`flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left transition ${
                          checked ? "bg-blue-50" : "hover:bg-slate-50"
                        }`}
                      >
                        <AvatarCircle
                          name={member.full_name}
                          avatarUrl={member.avatar_url}
                          size="xs"
                          userId={member.user_id}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[12px] font-medium text-slate-700">
                            {member.full_name || "User"}
                          </p>
                        </div>
                        {checked && (
                          <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                            Added
                          </span>
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setCreateGroupOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={createGroupConversation}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Create group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WorkflowLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isProjectRoute = pathname.startsWith("/app/projects/");

  const [expanded, setExpanded] = useState(false);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [modal, setModal] = useState<ModalType>(null);
  const [loading, setLoading] = useState(true);
  const [teamLoading, setTeamLoading] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");
  const [roleDropdownOpen, setRoleDropdownOpen] = useState<string | null>(null);
  const [roleUpdating, setRoleUpdating] = useState<string | null>(null);

  const [chatOpen, setChatOpen] = useState(false);

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const sidebarWidth = expanded ? 220 : 72;
  const chatWidth = chatOpen ? 430 : 0;

  async function loadNotifications(userId: string) {
    setNotificationsLoading(true);

    const { data, error } = await supabase
      .from("notifications")
      .select("id, title, message, project_id, is_read, created_at, type")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(8);

    if (!error) {
      setNotifications((data || []) as NotificationItem[]);
    } else {
      console.error(error);
    }

    setNotificationsLoading(false);
  }

  useEffect(() => {
    async function loadShellData() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          router.push("/");
          return;
        }

        setCurrentUserId(user.id);

        const { data: membership, error: membershipError } = await supabase
          .from("workspace_members")
          .select("workspace_id, role")
          .eq("user_id", user.id)
          .maybeSingle();

        if (membershipError || !membership?.workspace_id) {
          router.push("/onboarding");
          return;
        }

        setCurrentUserRole(membership.role);

        const { data: workspaceData, error: workspaceError } = await supabase
          .from("workspaces")
          .select("id, name, company_name, join_key")
          .eq("id", membership.workspace_id)
          .single();

        if (!workspaceError && workspaceData) {
          setWorkspace(workspaceData);
        }

        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", user.id)
          .maybeSingle();

        setProfile({
          full_name:
            profileData?.full_name ||
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "User",
          avatar_url: profileData?.avatar_url || null,
        });

        const { data: membersData } = await supabase
          .from("workspace_members")
          .select("user_id, role")
          .eq("workspace_id", membership.workspace_id)
          .order("created_at", { ascending: true });

        const userIds = (membersData ?? []).map((m) => m.user_id);

        let profilesMap = new Map<
          string,
          { full_name: string | null; avatar_url: string | null }
        >();

        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url")
            .in("id", userIds);

          profilesMap = new Map(
            (profilesData ?? []).map((p: any) => [
              p.id,
              { full_name: p.full_name, avatar_url: p.avatar_url },
            ])
          );
        }

        setTeamMembers(
          (membersData ?? []).map((member) => ({
            user_id: member.user_id,
            role: member.role,
            full_name: profilesMap.get(member.user_id)?.full_name || null,
            avatar_url: profilesMap.get(member.user_id)?.avatar_url || null,
          }))
        );

        await loadNotifications(user.id);
      } finally {
        setLoading(false);
      }
    }

    loadShellData();
  }, [router]);

  useEffect(() => {
    if (!currentUserId) return;
    const interval = setInterval(() => {
      loadNotifications(currentUserId);
    }, 30000);

    return () => clearInterval(interval);
  }, [currentUserId]);

  useEffect(() => {
    async function loadTeamMembersForModal() {
      if (modal !== "team" || !workspace?.id) return;

      setTeamLoading(true);

      try {
        const { data: membersData, error: membersError } = await supabase
          .from("workspace_members")
          .select("user_id, role")
          .eq("workspace_id", workspace.id)
          .order("created_at", { ascending: true });

        if (membersError) throw membersError;

        const userIds = (membersData ?? []).map((m) => m.user_id);

        let profilesMap = new Map<
          string,
          { full_name: string | null; avatar_url: string | null }
        >();

        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url")
            .in("id", userIds);

          profilesMap = new Map(
            (profilesData ?? []).map((p: any) => [
              p.id,
              { full_name: p.full_name, avatar_url: p.avatar_url },
            ])
          );
        }

        const mapped = (membersData ?? []).map((member) => ({
          user_id: member.user_id,
          role: member.role,
          full_name: profilesMap.get(member.user_id)?.full_name || null,
          avatar_url: profilesMap.get(member.user_id)?.avatar_url || null,
        }));

        setTeamMembers(mapped);
      } catch {
        setTeamMembers([]);
      } finally {
        setTeamLoading(false);
      }
    }

    loadTeamMembersForModal();
  }, [modal, workspace?.id]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(e.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }

      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(e.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const workspaceLabel = useMemo(() => {
    if (!workspace) return "Workspace";
    return workspace.company_name
      ? `${workspace.company_name} Workspace`
      : workspace.name;
  }, [workspace]);

  const displayName = useMemo(() => profile?.full_name || "User", [profile]);
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const isOwner = currentUserRole === "owner";

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  function goToSales() {
    router.push("/sales");
    setModal(null);
  }

  async function copyWorkspaceKey() {
    if (!workspace?.join_key) return;

    try {
      await navigator.clipboard.writeText(workspace.join_key);
      setCopyMessage("Workspace key copied!");
    } catch {
      setCopyMessage("Could not copy key");
    }

    setTimeout(() => setCopyMessage(""), 2000);
  }

  async function handleRoleChange(userId: string, newRole: Role) {
    if (!workspace?.id) return;

    setRoleUpdating(userId);
    setRoleDropdownOpen(null);

    try {
      const { error } = await supabase
        .from("workspace_members")
        .update({ role: newRole })
        .eq("workspace_id", workspace.id)
        .eq("user_id", userId);

      if (!error) {
        setTeamMembers((prev) =>
          prev.map((m) => (m.user_id === userId ? { ...m, role: newRole } : m))
        );
      }
    } finally {
      setRoleUpdating(null);
    }
  }

  function openNotificationProject(projectId: string | null) {
    setNotificationsOpen(false);
    if (!projectId) return;
    router.push(`/app/projects/${projectId}`);
  }

  const navItems = [
    {
      key: "home",
      label: "Projects",
      icon: Home,
      onClick: () => router.push("/app"),
      active: pathname === "/app",
    },
    {
      key: "team",
      label: "Team",
      icon: Users,
      onClick: () => setModal("team"),
      active: false,
    },
    {
      key: "billing",
      label: "Billing",
      icon: CreditCard,
      onClick: () => setModal("billing"),
      active: false,
    },
    {
      key: "chat",
      label: "Chat",
      icon: MessageSquare,
      onClick: () => setChatOpen((v) => !v),
      active: chatOpen,
    },
    {
      key: "settings",
      label: "Settings",
      icon: Settings,
      onClick: () => setModal("settings"),
      active: false,
    },
  ];

  const modalTitle = {
    team: "Team",
    billing: "Billing",
    settings: "Settings",
  };

  const modalMaxWidth = modal === "billing" ? "max-w-[980px]" : "max-w-[620px]";

  if (isProjectRoute) return <>{children}</>;

  return (
    <main className="min-h-screen bg-[#f6f7fb]">
      <style>{`
        .rb-soft-shadow {
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
        }
      `}</style>

      <div className="flex min-h-screen">
        <aside
          onMouseEnter={() => setExpanded(true)}
          onMouseLeave={() => setExpanded(false)}
          style={{
            width: sidebarWidth,
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            background: "#ffffff",
            borderRight: "1px solid #e8eaf0",
            transition: "width 220ms ease",
            zIndex: 30,
          }}
        >
          <div
            style={{
              height: 72,
              display: "flex",
              alignItems: "center",
              padding: "0 18px",
              borderBottom: "1px solid #f0f0f5",
            }}
          >
            <img
              src="/logo-icon.png"
              alt="RiskBases"
              style={{
                height: 36,
                width: 36,
                borderRadius: 10,
                objectFit: "contain",
                flexShrink: 0,
              }}
            />
            <div
              style={{
                overflow: "hidden",
                transition: "all 220ms",
                marginLeft: expanded ? 12 : 0,
                width: expanded ? 120 : 0,
                opacity: expanded ? 1 : 0,
              }}
            >
              <span
                style={{
                  whiteSpace: "nowrap",
                  fontSize: 17,
                  fontWeight: 700,
                  color: "#111827",
                  letterSpacing: "-0.02em",
                }}
              >
                RiskBases
              </span>
            </div>
          </div>

          <nav
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              padding: "12px 10px",
            }}
          >
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.key}
                  onClick={item.onClick}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    height: 44,
                    borderRadius: 12,
                    padding: "0 12px",
                    background: item.active ? "#ede9fb" : "transparent",
                    border: "none",
                    cursor: "pointer",
                    transition: "background 150ms",
                    width: "100%",
                  }}
                >
                  <Icon
                    style={{
                      height: 18,
                      width: 18,
                      flexShrink: 0,
                      color: item.active ? "#6d28d9" : "#64748b",
                    }}
                  />
                  <span
                    style={{
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textAlign: "left",
                      fontSize: 14,
                      fontWeight: 500,
                      color: item.active ? "#6d28d9" : "#374151",
                      marginLeft: expanded ? 12 : 0,
                      width: expanded ? "auto" : 0,
                      opacity: expanded ? 1 : 0,
                      transition: "all 220ms",
                    }}
                  >
                    {item.label}
                  </span>

                  {item.key === "chat" && chatOpen && expanded && (
                    <span
                      style={{
                        marginLeft: "auto",
                        height: 8,
                        width: 8,
                        borderRadius: "50%",
                        background: "#7c3aed",
                        flexShrink: 0,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          <div
            style={{
              padding: "0 10px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                height: 44,
                borderRadius: 12,
                padding: "0 12px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                width: "100%",
              }}
            >
              <LogOut
                style={{
                  height: 18,
                  width: 18,
                  flexShrink: 0,
                  color: "#94a3b8",
                }}
              />
              <span
                style={{
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#64748b",
                  marginLeft: expanded ? 12 : 0,
                  width: expanded ? "auto" : 0,
                  opacity: expanded ? 1 : 0,
                  transition: "all 220ms",
                }}
              >
                Log out
              </span>
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                height: 44,
                borderRadius: 12,
                padding: "0 12px",
              }}
            >
              <AvatarCircle
                name={displayName}
                avatarUrl={profile?.avatar_url ?? null}
                size="xs"
                userId={currentUserId ?? ""}
              />
              <div
                style={{
                  overflow: "hidden",
                  transition: "all 220ms",
                  marginLeft: expanded ? 10 : 0,
                  width: expanded ? "auto" : 0,
                  opacity: expanded ? 1 : 0,
                }}
              >
                <p
                  style={{
                    whiteSpace: "nowrap",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#1e293b",
                    maxWidth: 130,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {displayName}
                </p>
                <p
                  style={{
                    whiteSpace: "nowrap",
                    fontSize: 11,
                    color: "#94a3b8",
                    textTransform: "capitalize",
                  }}
                >
                  {currentUserRole ?? ""}
                </p>
              </div>
            </div>
          </div>
        </aside>

        {chatOpen && workspace && currentUserId && (
          <ChatPanel
            workspaceId={workspace.id}
            currentUserId={currentUserId}
            currentProfile={profile}
            teamMembers={teamMembers}
            sidebarWidth={sidebarWidth}
            onClose={() => setChatOpen(false)}
          />
        )}

        <div
          className="flex min-h-screen flex-1 flex-col overflow-hidden"
          style={{
            marginLeft: chatWidth,
            transition: "margin-left 220ms ease",
          }}
        >
          <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-7">
            <button className="flex items-center gap-2 rounded-lg px-2 py-1 transition hover:bg-slate-50">
              <span className="text-[17px] font-semibold text-slate-800">
                {loading ? "Loading..." : workspaceLabel}
              </span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            <div className="flex items-center gap-2">
              <div ref={notificationsRef} className="relative">
                <button
                  onClick={() => {
                    setNotificationsOpen((v) => !v);
                    setProfileDropdownOpen(false);
                  }}
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-slate-50"
                >
                  <Bell className="h-5 w-5 text-slate-600" />
                  {unreadCount > 0 && (
                    <span className="absolute right-2 top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-bold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <NotificationsDropdown
                    items={notifications}
                    loading={notificationsLoading}
                    onRefresh={() => currentUserId && loadNotifications(currentUserId)}
                    onOpenProject={openNotificationProject}
                  />
                )}
              </div>

              <div ref={profileDropdownRef} className="relative">
                <button
                  onClick={() => {
                    setProfileDropdownOpen((v) => !v);
                    setNotificationsOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 transition hover:bg-slate-50"
                >
                  <AvatarCircle
                    name={displayName}
                    avatarUrl={profile?.avatar_url ?? null}
                    size="sm"
                    userId={currentUserId ?? ""}
                  />
                  <span className="hidden text-[15px] font-semibold text-slate-700 sm:block">
                    {displayName}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition ${
                      profileDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 top-[calc(100%+10px)] z-[120] w-[220px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.14)]">
                    <div className="border-b border-slate-100 px-4 py-3.5">
                      <p className="text-sm font-bold text-slate-900">{displayName}</p>
                      <p className="mt-0.5 text-[11px] capitalize text-slate-400">
                        {currentUserRole ?? ""}
                      </p>
                    </div>

                    <div className="p-2">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          router.push("/app/profile");
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        <Users className="h-4 w-4 text-slate-500" />
                        Go to profile
                      </button>

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          setModal("settings");
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        <Settings className="h-4 w-4 text-slate-500" />
                        Settings
                      </button>

                      <div className="my-1 h-px bg-slate-100" />

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4 text-red-500" />
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="flex flex-1 overflow-hidden">{children}</div>
        </div>
      </div>

      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setModal(null);
              setRoleDropdownOpen(null);
            }
          }}
        >
          <div
            className={`flex max-h-[90vh] w-full flex-col rounded-2xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)] ${modalMaxWidth}`}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-5">
              <h3 className="text-xl font-bold text-slate-900">
                {modal ? modalTitle[modal] : ""}
              </h3>
              <button
                onClick={() => setModal(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {modal === "team" && (
                <div className="space-y-6">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-700">Workspace key</p>
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-3 font-mono text-[14px] tracking-[0.15em] text-slate-700">
                        {workspace?.join_key || "No key"}
                      </div>
                      <button
                        onClick={copyWorkspaceKey}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        <Copy className="h-4 w-4" />
                        Copy key
                      </button>
                    </div>
                    <p className="mt-2.5 text-sm text-slate-500">
                      Share this key with colleagues so they can join through the onboarding page.
                    </p>
                    {copyMessage && <p className="mt-2 text-sm font-medium text-emerald-600">{copyMessage}</p>}
                  </div>

                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-base font-semibold text-slate-800">Team members</h4>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
                        {teamMembers.length} {teamMembers.length === 1 ? "person" : "people"}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {teamLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <div
                            key={i}
                            className="h-16 animate-pulse rounded-xl border border-slate-200 bg-slate-50"
                          />
                        ))
                      ) : teamMembers.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-slate-500">
                          No team members found yet.
                        </div>
                      ) : (
                        teamMembers.map((member) => {
                          const isMe = member.user_id === currentUserId;
                          const canEdit = isOwner && !isMe;
                          const roleBadge =
                            ROLE_COLORS[member.role] ?? "bg-slate-100 text-slate-600";

                          return (
                            <div
                              key={member.user_id}
                              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"
                            >
                              <div className="min-w-0 flex items-center gap-3">
                                <AvatarCircle
                                  name={member.full_name}
                                  avatarUrl={member.avatar_url}
                                  size="md"
                                  userId={member.user_id}
                                />
                                <div className="min-w-0">
                                  <p className="truncate text-[15px] font-semibold text-slate-800">
                                    {member.full_name || "Unknown member"}
                                    {isMe && (
                                      <span className="ml-2 text-xs font-normal text-slate-400">
                                        (you)
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-sm capitalize text-slate-500">{member.role}</p>
                                </div>
                              </div>

                              <div className="relative ml-3 shrink-0">
                                {canEdit ? (
                                  <>
                                    <button
                                      onClick={() =>
                                        setRoleDropdownOpen(
                                          roleDropdownOpen === member.user_id ? null : member.user_id
                                        )
                                      }
                                      disabled={roleUpdating === member.user_id}
                                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition hover:opacity-80 ${roleBadge}`}
                                    >
                                      {roleUpdating === member.user_id ? "..." : member.role}
                                      <ChevronDown className="h-3 w-3" />
                                    </button>

                                    {roleDropdownOpen === member.user_id && (
                                      <div className="absolute right-0 top-full z-10 mt-1 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                                        {ROLES.map((r) => (
                                          <button
                                            key={r}
                                            onClick={() => handleRoleChange(member.user_id, r)}
                                            className={`flex w-full items-center px-4 py-2.5 text-sm capitalize transition hover:bg-slate-50 ${
                                              member.role === r
                                                ? "font-semibold text-violet-600"
                                                : "text-slate-700"
                                            }`}
                                          >
                                            {r}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <span
                                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${roleBadge}`}
                                  >
                                    {member.role}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {isOwner && (
                      <p className="mt-3 text-xs text-slate-400">
                        Owners can change team roles by clicking the role badge.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {modal === "billing" && <BillingContent onContactSales={goToSales} />}
              {modal === "settings" && <SettingsContent workspace={workspace} />}
            </div>

            <div className="shrink-0 flex justify-end border-t border-slate-100 px-6 py-4">
              <button
                onClick={() => setModal(null)}
                className="h-10 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}