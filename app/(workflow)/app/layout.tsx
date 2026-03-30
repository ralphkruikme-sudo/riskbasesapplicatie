"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  ChevronDown, Copy, CreditCard, Home, LogOut, Settings,
  Users, X, Check, Bell, Globe, Shield, Zap, Receipt,
  Download, MessageSquare, Send, Smile, Paperclip, Image,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Workspace = { id: string; name: string; company_name: string | null; join_key: string | null };
type Profile = { full_name: string | null; avatar_url: string | null };
type TeamMember = { user_id: string; role: string; full_name: string | null; avatar_url: string | null };
type ModalType = "team" | "billing" | "settings" | null;
type ProfileDropdownOpen = boolean;
type ChatMessage = {
  id: string; user_id: string; content: string; created_at: string;
  sender_name: string | null; sender_avatar: string | null;
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
  const colors = ["bg-violet-500","bg-blue-500","bg-emerald-500","bg-amber-500","bg-rose-500","bg-indigo-500"];
  let h = 0;
  for (let i = 0; i < uid.length; i++) h = ((h << 5) - h + uid.charCodeAt(i)) | 0;
  return colors[Math.abs(h) % colors.length];
}

function AvatarCircle({ name, avatarUrl, size = "md", userId = "" }: { name: string | null; avatarUrl: string | null; size?: "sm" | "md" | "xs"; userId?: string }) {
  const dim = size === "xs" ? "h-7 w-7 text-[10px]" : size === "sm" ? "h-9 w-9 text-xs" : "h-11 w-11 text-sm";
  const bg = userId ? hashColor(userId) : "bg-violet-500";
  if (avatarUrl) return <img src={avatarUrl} alt={name || "Member"} className={`${dim} rounded-full object-cover shrink-0`}/>;
  return <div className={`${dim} flex shrink-0 items-center justify-center rounded-full ${bg} font-semibold text-white`}>{getInitials(name)}</div>;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
}

// ─── CHAT PANEL ──────────────────────────────────────────────────────────────
function ChatPanel({ workspaceId, currentUserId, currentProfile, onClose }: {
  workspaceId: string; currentUserId: string; currentProfile: Profile | null; onClose: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load messages — we use a simple workspace_chat table
    // Falls back gracefully if table doesn't exist
    async function loadMessages() {
      const { data, error } = await supabase
        .from("workspace_chat")
        .select("id, user_id, content, created_at, sender_name, sender_avatar")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: true })
        .limit(100);
      if (!error && data) setMessages(data as ChatMessage[]);
    }
    loadMessages();

    // Real-time subscription
    const channel = supabase
      .channel(`chat-${workspaceId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "workspace_chat",
        filter: `workspace_id=eq.${workspaceId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as ChatMessage]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [workspaceId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput("");
    try {
      const { error } = await supabase.from("workspace_chat").insert({
        workspace_id: workspaceId,
        user_id: currentUserId,
        content: text,
        sender_name: currentProfile?.full_name ?? "User",
        sender_avatar: currentProfile?.avatar_url ?? null,
      });
      if (error) {
        console.error("Chat error:", error);
      }
    } finally {
      setSending(false);
    }
  }

  async function deleteMessage(messageId: string) {
    const { error } = await supabase.from("workspace_chat").delete().eq("id", messageId).eq("user_id", currentUserId);
    if (!error) setMessages(prev => prev.filter(m => m.id !== messageId));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  // Group messages by sender for visual grouping
  const grouped = messages.map((msg, i) => ({
    ...msg,
    isMe: msg.user_id === currentUserId,
    showAvatar: i === 0 || messages[i-1].user_id !== msg.user_id,
    showName: i === 0 || messages[i-1].user_id !== msg.user_id,
  }));

  return (
    <div className="fixed right-0 top-0 bottom-0 z-40 flex flex-col w-[360px] bg-white border-l border-slate-200 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100">
            <MessageSquare className="h-5 w-5 text-violet-600"/>
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-slate-900">Workspace Chat</h2>
            <p className="text-[11px] text-slate-400">Alle workspace leden</p>
          </div>
        </div>
        <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
          <X className="h-4 w-4"/>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="h-16 w-16 rounded-2xl bg-violet-100 flex items-center justify-center mb-3">
              <MessageSquare className="h-8 w-8 text-violet-500"/>
            </div>
            <p className="text-sm font-semibold text-slate-700">Geen berichten nog</p>
            <p className="text-xs text-slate-400 mt-1">Stuur het eerste bericht naar je team!</p>
          </div>
        )}
        {grouped.map((msg) => (
          <div key={msg.id}
            className={`flex gap-2.5 ${msg.isMe ? "flex-row-reverse" : ""} ${msg.showAvatar ? "mt-3" : "mt-0.5"}`}
            onMouseEnter={() => setHoveredMessageId(msg.id)}
            onMouseLeave={() => setHoveredMessageId(null)}
            style={{ position: "relative" }}>
            {/* Avatar */}
            <div className="flex-shrink-0 self-end">
              {msg.showAvatar
                ? <AvatarCircle name={msg.sender_name} avatarUrl={msg.sender_avatar} size="xs" userId={msg.user_id}/>
                : <div className="h-7 w-7"/>
              }
            </div>
            <div className={`flex flex-col max-w-[230px] ${msg.isMe ? "items-end" : "items-start"}`}>
              {msg.showName && !msg.isMe && (
                <span className="text-[11px] font-semibold text-slate-500 mb-1 ml-1">{msg.sender_name ?? "User"}</span>
              )}
              <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 6, flexDirection: msg.isMe ? "row" : "row-reverse" }}>
                {msg.isMe && hoveredMessageId === msg.id && (
                  <button
                    onClick={() => deleteMessage(msg.id)}
                    title="Verwijder bericht"
                    style={{ flexShrink: 0, padding: "2px 4px", borderRadius: 6, border: "none", background: "#f1f5f9", cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#ef4444"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#94a3b8"; }}>
                    <X style={{ height: 12, width: 12 }}/>
                  </button>
                )}
                <div className={`rounded-2xl px-3.5 py-2.5 text-[13px] leading-snug break-words ${
                  msg.isMe
                    ? "bg-violet-600 text-white rounded-br-sm"
                    : msg.user_id === "system"
                    ? "bg-amber-50 text-amber-800 border border-amber-200 text-[11px]"
                    : "bg-slate-100 text-slate-800 rounded-bl-sm"
                }`}>
                  {msg.content}
                </div>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 mx-1">{formatTime(msg.created_at)}</span>
            </div>
          </div>
        ))}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div className="border-t border-slate-100 px-4 py-3">
        <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-violet-400 focus-within:bg-white transition">
          <button className="flex-shrink-0 text-slate-400 hover:text-violet-500 transition mb-0.5" onClick={() => fileRef.current?.click()}>
            <Paperclip className="h-4 w-4"/>
          </button>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Stuur een bericht..."
            rows={1}
            className="flex-1 resize-none bg-transparent text-[13px] text-slate-800 outline-none placeholder:text-slate-400 max-h-[100px]"
            style={{ minHeight: 20 }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-white transition hover:bg-violet-700 disabled:opacity-40 mb-0.5"
          >
            <Send className="h-3.5 w-3.5"/>
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*,video/*,.pdf,.doc,.docx" className="hidden"/>
        <p className="text-[10px] text-slate-400 mt-1.5 text-center">Enter om te sturen · Shift+Enter voor nieuwe regel</p>
      </div>
    </div>
  );
}

// ─── BILLING CONTENT ─────────────────────────────────────────────────────────
function BillingContent() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly"|"yearly">("monthly");
  const plans = [
    { name:"Starter", price:{monthly:0,yearly:0}, description:"Perfect to get started", features:["3 projects","2 team members","Basic risk tracking","Email support"], current:false, color:"border-slate-200", badge:null },
    { name:"Pro", price:{monthly:49,yearly:39}, description:"For growing teams", features:["Unlimited projects","10 team members","Advanced analytics","Priority support","CSV & API import"], current:true, color:"border-violet-500", badge:"Current plan" },
    { name:"Enterprise", price:{monthly:149,yearly:119}, description:"For large organisations", features:["Unlimited everything","SSO / SAML","Custom integrations","Dedicated support","SLA guarantee"], current:false, color:"border-slate-200", badge:null },
  ];
  const invoices = [
    {date:"1 Feb 2025",amount:"€49,00",status:"Paid"},
    {date:"1 Jan 2025",amount:"€49,00",status:"Paid"},
    {date:"1 Dec 2024",amount:"€49,00",status:"Paid"},
  ];
  return (
    <div className="space-y-8">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-base font-semibold text-slate-800">Plan</h4>
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
            <button onClick={() => setBillingPeriod("monthly")} className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${billingPeriod==="monthly"?"bg-white text-slate-800 shadow-sm":"text-slate-500 hover:text-slate-700"}`}>Monthly</button>
            <button onClick={() => setBillingPeriod("yearly")} className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${billingPeriod==="yearly"?"bg-white text-slate-800 shadow-sm":"text-slate-500 hover:text-slate-700"}`}>
              Yearly <span className="ml-1.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] text-emerald-700">-20%</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {plans.map(plan => (
            <div key={plan.name} className={`relative rounded-xl border-2 p-4 ${plan.color} ${plan.current?"bg-violet-50/60":"bg-white"}`}>
              {plan.badge && <span className="absolute -top-2.5 left-3 rounded-full bg-violet-600 px-2.5 py-0.5 text-[10px] font-semibold text-white">{plan.badge}</span>}
              <p className="text-sm font-bold text-slate-900">{plan.name}</p>
              <p className="mt-1 text-[11px] text-slate-400">{plan.description}</p>
              <p className="mt-3 text-2xl font-bold text-slate-900">€{plan.price[billingPeriod]}<span className="text-xs font-normal text-slate-400">/mo</span></p>
              <ul className="mt-3 space-y-1.5">
                {plan.features.map(f => <li key={f} className="flex items-start gap-1.5 text-[11px] text-slate-600"><Check className="mt-0.5 h-3 w-3 shrink-0 text-violet-500"/>{f}</li>)}
              </ul>
              {!plan.current && <button className="mt-4 w-full rounded-lg border border-slate-200 bg-white py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">{plan.name==="Enterprise"?"Contact sales":"Upgrade"}</button>}
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-3 text-base font-semibold text-slate-800">Usage this month</h4>
        <div className="grid grid-cols-3 gap-3">
          {[{label:"Projects",used:4,max:"∞"},{label:"Team members",used:3,max:10},{label:"Risks logged",used:47,max:"∞"}].map(item => (
            <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] text-slate-500">{item.label}</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{item.used}<span className="text-xs font-normal text-slate-400"> / {item.max}</span></p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-3 text-base font-semibold text-slate-800">Recent invoices</h4>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {invoices.map((inv,idx) => (
            <div key={idx} className={`flex items-center justify-between px-4 py-3 ${idx<invoices.length-1?"border-b border-slate-100":""}`}>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100"><Receipt className="h-4 w-4 text-slate-500"/></div>
                <div><p className="text-sm font-medium text-slate-800">{inv.date}</p><p className="text-xs text-slate-400">{inv.amount}</p></div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">{inv.status}</span>
                <button className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"><Download className="h-3.5 w-3.5"/></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SETTINGS CONTENT ────────────────────────────────────────────────────────
function SettingsContent({ workspace }: { workspace: Workspace | null }) {
  const [workspaceName, setWorkspaceName] = useState(workspace?.name || "");
  const [companyName, setCompanyName] = useState(workspace?.company_name || "");
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [saved, setSaved] = useState(false);
  function handleSave() { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  return (
    <div className="space-y-7">
      <div>
        <div className="mb-4 flex items-center gap-2"><Globe className="h-4 w-4 text-slate-400"/><h4 className="text-base font-semibold text-slate-800">Workspace</h4></div>
        <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div><label className="mb-1.5 block text-sm font-medium text-slate-700">Workspace name</label><input type="text" value={workspaceName} onChange={e=>setWorkspaceName(e.target.value)} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"/></div>
          <div><label className="mb-1.5 block text-sm font-medium text-slate-700">Company name</label><input type="text" value={companyName} onChange={e=>setCompanyName(e.target.value)} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"/></div>
        </div>
      </div>
      <div>
        <div className="mb-4 flex items-center gap-2"><Bell className="h-4 w-4 text-slate-400"/><h4 className="text-base font-semibold text-slate-800">Notifications</h4></div>
        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-5">
          {[{label:"Email notifications",desc:"Receive updates on risk changes",value:emailNotifs,onChange:setEmailNotifs},{label:"Weekly digest",desc:"Summary of all activity every Monday",value:weeklyDigest,onChange:setWeeklyDigest}].map(item=>(
            <div key={item.label} className="flex items-center justify-between">
              <div><p className="text-sm font-medium text-slate-800">{item.label}</p><p className="text-xs text-slate-500">{item.desc}</p></div>
              <button onClick={()=>item.onChange(!item.value)} className={`relative h-6 w-11 rounded-full transition-colors ${item.value?"bg-violet-500":"bg-slate-200"}`}>
                <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${item.value?"translate-x-5":"translate-x-0"}`}/>
              </button>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-4 flex items-center gap-2"><Shield className="h-4 w-4 text-slate-400"/><h4 className="text-base font-semibold text-slate-800">Security</h4></div>
        <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm text-slate-600">Two-factor authentication and SSO are available on the Enterprise plan.</p>
          <button className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"><Zap className="h-3.5 w-3.5 text-violet-500"/>Upgrade to Enterprise</button>
        </div>
      </div>
      <div>
        <h4 className="mb-3 text-base font-semibold text-red-600">Danger zone</h4>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-slate-700">Deleting the workspace is permanent and cannot be undone.</p>
          <button className="mt-3 inline-flex h-8 items-center rounded-lg border border-red-300 bg-white px-3 text-xs font-semibold text-red-600 transition hover:bg-red-50">Delete workspace</button>
        </div>
      </div>
      <div className="flex justify-end">
        <button onClick={handleSave} className="inline-flex h-10 items-center gap-2 rounded-xl bg-violet-600 px-6 text-sm font-semibold text-white transition hover:bg-violet-700">
          {saved?<><Check className="h-4 w-4"/>Saved!</>:"Save changes"}
        </button>
      </div>
    </div>
  );
}

// ─── MAIN LAYOUT ─────────────────────────────────────────────────────────────
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

  useEffect(() => {
    async function loadShellData() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) { router.push("/"); return; }
        setCurrentUserId(user.id);
        const { data: membership, error: membershipError } = await supabase
          .from("workspace_members").select("workspace_id, role").eq("user_id", user.id).maybeSingle();
        if (membershipError || !membership?.workspace_id) { router.push("/onboarding"); return; }
        setCurrentUserRole(membership.role);
        const { data: workspaceData, error: workspaceError } = await supabase
          .from("workspaces").select("id, name, company_name, join_key").eq("id", membership.workspace_id).single();
        if (!workspaceError && workspaceData) setWorkspace(workspaceData);
        const { data: profileData } = await supabase.from("profiles").select("full_name, avatar_url").eq("id", user.id).maybeSingle();
        setProfile({
          full_name: profileData?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
          avatar_url: profileData?.avatar_url || null,
        });
      } finally { setLoading(false); }
    }
    loadShellData();
  }, [router]);

  useEffect(() => {
    async function loadTeamMembers() {
      if (modal !== "team" || !workspace?.id) return;
      setTeamLoading(true);
      try {
        const { data: membersData, error: membersError } = await supabase
          .from("workspace_members").select("user_id, role").eq("workspace_id", workspace.id).order("created_at", { ascending: true });
        if (membersError) throw membersError;
        const userIds = (membersData ?? []).map(m => m.user_id);
        let profilesMap = new Map<string, { full_name: string | null; avatar_url: string | null }>();
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase.from("profiles").select("id, full_name, avatar_url").in("id", userIds);
          profilesMap = new Map((profilesData ?? []).map((p: any) => [p.id, { full_name: p.full_name, avatar_url: p.avatar_url }]));
        }
        setTeamMembers((membersData ?? []).map(member => ({
          user_id: member.user_id, role: member.role,
          full_name: profilesMap.get(member.user_id)?.full_name || null,
          avatar_url: profilesMap.get(member.user_id)?.avatar_url || null,
        })));
      } catch { setTeamMembers([]); }
      finally { setTeamLoading(false); }
    }
    loadTeamMembers();
  }, [modal, workspace?.id]);

  const workspaceLabel = useMemo(() => {
    if (!workspace) return "Workspace";
    return workspace.company_name ? `${workspace.company_name} Workspace` : workspace.name;
  }, [workspace]);

  const displayName = useMemo(() => profile?.full_name || "User", [profile]);
  const isOwner = currentUserRole === "owner";

  async function handleLogout() { await supabase.auth.signOut(); router.push("/"); }

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function copyWorkspaceKey() {
    if (!workspace?.join_key) return;
    try {
      await navigator.clipboard.writeText(workspace.join_key);
      setCopyMessage("Workspace key gekopieerd!");
    } catch { setCopyMessage("Kon key niet kopiëren"); }
    setTimeout(() => setCopyMessage(""), 2000);
  }

  async function handleRoleChange(userId: string, newRole: Role) {
    if (!workspace?.id) return;
    setRoleUpdating(userId); setRoleDropdownOpen(null);
    try {
      const { error } = await supabase.from("workspace_members").update({ role: newRole }).eq("workspace_id", workspace.id).eq("user_id", userId);
      if (!error) setTeamMembers(prev => prev.map(m => m.user_id === userId ? { ...m, role: newRole } : m));
    } finally { setRoleUpdating(null); }
  }

  const navItems = [
    { key:"home", label:"Projects", icon:Home, onClick:() => router.push("/app"), active: pathname === "/app" },
    { key:"team", label:"Team", icon:Users, onClick:() => setModal("team"), active:false },
    { key:"billing", label:"Billing", icon:CreditCard, onClick:() => setModal("billing"), active:false },
    { key:"chat", label:"Chat", icon:MessageSquare, onClick:() => setChatOpen(v => !v), active:chatOpen },
    { key:"settings", label:"Settings", icon:Settings, onClick:() => setModal("settings"), active:false },
  ];

  const modalTitle = { team:"Team", billing:"Billing", settings:"Settings" };
  const modalMaxWidth = modal === "billing" ? "max-w-[760px]" : "max-w-[620px]";

  if (isProjectRoute) return <>{children}</>;

  return (
    <main className="min-h-screen" style={{ background:"#f7f7fb" }}>
      <div className="flex min-h-screen">

        {/* ── LEFT SIDEBAR ── */}
        <aside
          onMouseEnter={() => setExpanded(true)}
          onMouseLeave={() => setExpanded(false)}
          style={{ width: expanded ? 220 : 72, flexShrink: 0, display: "flex", flexDirection: "column", background: "#ffffff", borderRight: "1px solid #e8eaf0", transition: "width 300ms ease" }}
        >
          {/* Logo */}
          <div style={{ height: 72, display: "flex", alignItems: "center", padding: "0 18px", borderBottom: "1px solid #f0f0f5" }}>
            <img src="/logo-icon.png" alt="RiskBases" style={{ height: 36, width: 36, borderRadius: 10, objectFit: "contain", flexShrink: 0 }}/>
            <div style={{ overflow: "hidden", transition: "all 300ms", marginLeft: expanded ? 12 : 0, width: expanded ? 120 : 0, opacity: expanded ? 1 : 0 }}>
              <span style={{ whiteSpace: "nowrap", fontSize: 17, fontWeight: 700, color: "#1a1a2e", letterSpacing: "-0.02em" }}>RiskBases</span>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, padding: "12px 10px" }}>
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <button key={item.key} onClick={item.onClick} style={{
                  display: "flex", alignItems: "center", height: 44, borderRadius: 10, padding: "0 12px",
                  background: item.active ? "#ede9fb" : "transparent",
                  border: "none", cursor: "pointer", transition: "background 150ms", width: "100%",
                }}>
                  <Icon style={{ height: 18, width: 18, flexShrink: 0, color: item.active ? "#6d28d9" : "#64748b" }}/>
                  <span style={{
                    overflow: "hidden", whiteSpace: "nowrap", textAlign: "left", fontSize: 14, fontWeight: 500,
                    color: item.active ? "#6d28d9" : "#374151",
                    marginLeft: expanded ? 12 : 0, width: expanded ? "auto" : 0, opacity: expanded ? 1 : 0,
                    transition: "all 300ms",
                  }}>
                    {item.label}
                  </span>
                  {item.key === "chat" && chatOpen && expanded && (
                    <span style={{ marginLeft: "auto", height: 8, width: 8, borderRadius: "50%", background: "#7c3aed", flexShrink: 0 }}/>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom: logout + user */}
          <div style={{ padding: "0 10px 20px", display: "flex", flexDirection: "column", gap: 2 }}>
            <button onClick={handleLogout} style={{
              display: "flex", alignItems: "center", height: 44, borderRadius: 10, padding: "0 12px",
              background: "transparent", border: "none", cursor: "pointer", width: "100%",
            }}>
              <LogOut style={{ height: 18, width: 18, flexShrink: 0, color: "#94a3b8" }}/>
              <span style={{ overflow: "hidden", whiteSpace: "nowrap", fontSize: 14, fontWeight: 500, color: "#64748b", marginLeft: expanded ? 12 : 0, width: expanded ? "auto" : 0, opacity: expanded ? 1 : 0, transition: "all 300ms" }}>Log out</span>
            </button>
            <div style={{ display: "flex", alignItems: "center", height: 44, borderRadius: 10, padding: "0 12px" }}>
              <AvatarCircle name={displayName} avatarUrl={profile?.avatar_url ?? null} size="xs" userId={currentUserId ?? ""}/>
              <div style={{ overflow: "hidden", transition: "all 300ms", marginLeft: expanded ? 10 : 0, width: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}>
                <p style={{ whiteSpace: "nowrap", fontSize: 13, fontWeight: 600, color: "#1e293b", maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis" }}>{displayName}</p>
                <p style={{ whiteSpace: "nowrap", fontSize: 11, color: "#94a3b8", textTransform: "capitalize" }}>{currentUserRole ?? ""}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* ── MAIN AREA ── */}
        {/* KEY FIX: overflow-hidden here so the right activity sidebar in page.tsx doesn't scroll with main */}
        <div className="flex flex-col flex-1 min-h-screen overflow-hidden">
          {/* Header */}
          <header style={{ height: 72, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e8eaf0", background: "#ffffff", padding: "0 28px", zIndex: 10 }}>
            {/* Left: workspace name */}
            <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 8, background: "transparent", border: "none", cursor: "pointer" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#f8f9fb")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <span style={{ fontSize: 17, fontWeight: 600, color: "#1e293b" }}>{loading ? "Loading..." : workspaceLabel}</span>
              <ChevronDown style={{ height: 16, width: 16, color: "#94a3b8" }}/>
            </button>

            {/* Right: bell + avatar */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 40, width: 40, borderRadius: 10, border: "none", background: "transparent", cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#f8f9fb")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <Bell style={{ height: 20, width: 20, color: "#64748b" }}/>
              </button>
              <div ref={profileDropdownRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setProfileDropdownOpen(v => !v)}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 10px", borderRadius: 10, border: "none", background: profileDropdownOpen ? "#f8f9fb" : "transparent", cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f8f9fb")}
                  onMouseLeave={e => { if (!profileDropdownOpen) e.currentTarget.style.background = "transparent"; }}>
                  <AvatarCircle name={displayName} avatarUrl={profile?.avatar_url ?? null} size="sm" userId={currentUserId ?? ""}/>
                  <span style={{ fontSize: 15, fontWeight: 600, color: "#374151" }} className="hidden sm:block">{displayName}</span>
                  <ChevronDown style={{ height: 16, width: 16, color: "#94a3b8", transform: profileDropdownOpen ? "rotate(180deg)" : "none", transition: "transform 200ms" }}/>
                </button>
                {profileDropdownOpen && (
                  <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 220, background: "#fff", border: "1px solid #e8eaf0", borderRadius: 14, boxShadow: "0 8px 32px rgba(15,23,42,0.12)", zIndex: 100, overflow: "hidden" }}>
                    {/* User info header */}
                    <div style={{ padding: "14px 16px", borderBottom: "1px solid #f0f0f5" }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", margin: 0 }}>{displayName}</p>
                      <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0", textTransform: "capitalize" }}>{currentUserRole ?? ""}</p>
                    </div>
                    {/* Menu items */}
                    <div style={{ padding: "6px" }}>
                      <button onClick={() => { setProfileDropdownOpen(false); router.push("/app/profile"); }}
                        style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 12px", borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", fontSize: 14, color: "#374151", fontWeight: 500 }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#f8f9fb")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                        <Users style={{ height: 16, width: 16, color: "#64748b" }}/> Go to profile
                      </button>
                      <button onClick={() => { setProfileDropdownOpen(false); setModal("settings"); }}
                        style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 12px", borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", fontSize: 14, color: "#374151", fontWeight: 500 }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#f8f9fb")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                        <Settings style={{ height: 16, width: 16, color: "#64748b" }}/> Settings
                      </button>
                      <div style={{ height: 1, background: "#f0f0f5", margin: "4px 0" }}/>
                      <button onClick={() => { setProfileDropdownOpen(false); handleLogout(); }}
                        style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 12px", borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", fontSize: 14, color: "#ef4444", fontWeight: 500 }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#fff5f5")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                        <LogOut style={{ height: 16, width: 16, color: "#ef4444" }}/> Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Page content — flex-1, overflow hidden so children control their own scroll */}
          <div className="flex flex-1 overflow-hidden">
            {children}
          </div>
        </div>
      </div>

      {/* ── CHAT PANEL (slide in from right, over everything) ── */}
      {chatOpen && workspace && currentUserId && (
        <>
          <div className="fixed inset-0 z-30 bg-black/10" onClick={() => setChatOpen(false)}/>
          <ChatPanel
            workspaceId={workspace.id}
            currentUserId={currentUserId}
            currentProfile={profile}
            onClose={() => setChatOpen(false)}
          />
        </>
      )}

      {/* ── MODALS ── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) { setModal(null); setRoleDropdownOpen(null); } }}>
          <div className={`w-full ${modalMaxWidth} rounded-2xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)] flex flex-col max-h-[90vh]`}>
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-5">
              <h3 className="text-xl font-bold text-slate-900">{modal ? modalTitle[modal] : ""}</h3>
              <button onClick={() => setModal(null)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"><X className="h-4 w-4"/></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {modal === "team" && (
                <div className="space-y-6">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-700">Workspace key</p>
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-3 font-mono text-[14px] tracking-[0.15em] text-slate-700">{workspace?.join_key || "Geen key"}</div>
                      <button onClick={copyWorkspaceKey} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 text-sm font-semibold text-white transition hover:bg-violet-700"><Copy className="h-4 w-4"/>Copy key</button>
                    </div>
                    <p className="mt-2.5 text-sm text-slate-500">Deel deze key met collega's zodat ze kunnen joinen via de onboarding pagina.</p>
                    {copyMessage && <p className="mt-2 text-sm font-medium text-emerald-600">{copyMessage}</p>}
                  </div>
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-base font-semibold text-slate-800">Team members</h4>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">{teamMembers.length} {teamMembers.length===1?"persoon":"personen"}</span>
                    </div>
                    <div className="space-y-2">
                      {teamLoading
                        ? Array.from({length:3}).map((_,i) => <div key={i} className="h-16 animate-pulse rounded-xl border border-slate-200 bg-slate-50"/>)
                        : teamMembers.length === 0
                        ? <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-slate-500">Nog geen teamleden gevonden.</div>
                        : teamMembers.map(member => {
                          const isMe = member.user_id === currentUserId;
                          const canEdit = isOwner && !isMe;
                          const roleBadge = ROLE_COLORS[member.role] ?? "bg-slate-100 text-slate-600";
                          return (
                            <div key={member.user_id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <AvatarCircle name={member.full_name} avatarUrl={member.avatar_url} size="md" userId={member.user_id}/>
                                <div className="min-w-0">
                                  <p className="text-[15px] font-semibold text-slate-800 truncate">{member.full_name||"Onbekend lid"}{isMe&&<span className="ml-2 text-xs text-slate-400 font-normal">(jij)</span>}</p>
                                  <p className="text-sm capitalize text-slate-500">{member.role}</p>
                                </div>
                              </div>
                              <div className="relative ml-3 shrink-0">
                                {canEdit ? (
                                  <>
                                    <button onClick={() => setRoleDropdownOpen(roleDropdownOpen===member.user_id?null:member.user_id)} disabled={roleUpdating===member.user_id}
                                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition hover:opacity-80 ${roleBadge}`}>
                                      {roleUpdating===member.user_id?"...":member.role}<ChevronDown className="h-3 w-3"/>
                                    </button>
                                    {roleDropdownOpen===member.user_id && (
                                      <div className="absolute right-0 top-full z-10 mt-1 w-36 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                                        {ROLES.map(r => <button key={r} onClick={() => handleRoleChange(member.user_id,r)} className={`flex w-full items-center px-4 py-2.5 text-sm capitalize transition hover:bg-slate-50 ${member.role===r?"font-semibold text-violet-600":"text-slate-700"}`}>{r}</button>)}
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <span className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${roleBadge}`}>{member.role}</span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      }
                    </div>
                    {isOwner && <p className="mt-3 text-xs text-slate-400">Als owner kun je rollen wijzigen door op de badge te klikken.</p>}
                  </div>
                </div>
              )}
              {modal === "billing" && <BillingContent/>}
              {modal === "settings" && <SettingsContent workspace={workspace}/>}
            </div>
            <div className="shrink-0 flex justify-end border-t border-slate-100 px-6 py-4">
              <button onClick={() => setModal(null)} className="h-10 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Close</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
