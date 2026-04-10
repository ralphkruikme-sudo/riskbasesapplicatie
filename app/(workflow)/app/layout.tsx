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
  Home,
  LogOut,
  MessageCircle,
  Receipt,
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
};

type Profile = {
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
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
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
};

const ROLES = ["owner", "co-owner", "worker"] as const;
type Role = (typeof ROLES)[number];

const ROLE_COLORS: Record<string, string> = {
  owner: "bg-violet-100 text-violet-700",
  "co-owner": "bg-blue-100 text-blue-700",
  worker: "bg-slate-100 text-slate-600",
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

function generateWorkspaceCode(length = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);

  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
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
      ? "h-8 w-8 text-[11px]"
      : size === "sm"
      ? "h-10 w-10 text-xs"
      : "h-11 w-11 text-sm";

  const bg = userId ? hashColor(userId) : "bg-violet-500";

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name || "User"}
        className={`${dim} shrink-0 rounded-full border border-white/80 object-cover`}
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
        "Workspace collaboration",
        "Risk visibility per project",
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
        "Advanced workflows",
        "Stronger collaboration",
        "Reporting and broader control",
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
        "Enterprise support",
        "Integrations and scalable rollout",
      ],
      badge: null,
      highlighted: false,
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
              workflow. That is why we use a sales-led pricing model instead of fixed public pricing.
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

function SettingsContent({
  workspace,
  onWorkspaceSaved,
}: {
  workspace: Workspace | null;
  onWorkspaceSaved: (next: Workspace) => void;
}) {
  const [workspaceName, setWorkspaceName] = useState(workspace?.name || "");
  const [companyName, setCompanyName] = useState(workspace?.company_name || "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setWorkspaceName(workspace?.name || "");
    setCompanyName(workspace?.company_name || "");
  }, [workspace?.id, workspace?.name, workspace?.company_name]);

  async function handleSave() {
    if (!workspace?.id) return;

    const payload = {
      name: workspaceName.trim(),
      company_name: companyName.trim() || null,
    };

    const { error } = await supabase
      .from("workspaces")
      .update(payload)
      .eq("id", workspace.id);

    if (error) {
      logSupabaseError("settings save error", error);
      return;
    }

    onWorkspaceSaved({ ...workspace, ...payload });
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
          <Shield className="h-4 w-4 text-slate-400" />
          <h4 className="text-base font-semibold text-slate-800">Security</h4>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm text-slate-600">
            SSO, audit controls and advanced governance can be discussed for Enterprise setups.
          </p>
          <button className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100">
            <Zap className="h-3.5 w-3.5 text-blue-500" />
            Contact sales
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
}: {
  items: NotificationItem[];
  loading: boolean;
}) {
  return (
    <div className="absolute right-0 top-[calc(100%+10px)] z-[120] w-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.14)]">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
        <div>
          <p className="text-sm font-bold text-slate-900">Notifications</p>
          <p className="text-[11px] text-slate-400">Recent workspace updates</p>
        </div>
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
            <p className="mt-1 text-xs text-slate-400">This area is ready for later.</p>
          </div>
        ) : (
          <div className="p-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-50"
              >
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-[11px] font-bold text-violet-700">
                  {item.title?.[0]?.toUpperCase() || "N"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-slate-800">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-[12px] leading-5 text-slate-500">
                    {item.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
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
  const [workspaceCode, setWorkspaceCode] = useState<string | null>(null);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState<string | null>(null);
  const [roleUpdating, setRoleUpdating] = useState<string | null>(null);

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const sidebarWidth = expanded ? 220 : 72;

  async function ensureWorkspaceCode(workspaceId: string, userId: string) {
    const { data: joinCodeRows, error: joinCodeError } = await supabase
      .from("workspace_join_codes")
      .select("id, code")
      .eq("workspace_id", workspaceId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (joinCodeError) {
      logSupabaseError("load workspace join codes error", joinCodeError);
      setWorkspaceCode(null);
      return;
    }

    let code = joinCodeRows?.[0]?.code ?? null;
    if (code) {
      setWorkspaceCode(code);
      return;
    }

    for (let i = 0; i < 5; i++) {
      const newCode = generateWorkspaceCode(6);
      const { error: insertError } = await supabase.from("workspace_join_codes").insert({
        workspace_id: workspaceId,
        code: newCode,
        role: "member",
        is_active: true,
        created_by: userId,
      });

      if (!insertError) {
        setWorkspaceCode(newCode);
        return;
      }

      logSupabaseError("create workspace code error", insertError);
    }

    setWorkspaceCode(null);
  }

  async function loadNotifications() {
    setNotificationsLoading(false);
    setNotifications([]);
  }

  async function loadTeamMembers(workspaceId: string, currentAuthEmail?: string | null) {
    const { data: membersData, error: membersError } = await supabase
      .from("workspace_members")
      .select("user_id, role")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: true });

    if (membersError) {
      logSupabaseError("load workspace members error", membersError);
      setTeamMembers([]);
      return;
    }

    const userIds = (membersData ?? []).map((m) => m.user_id);
    let profilesMap = new Map<
      string,
      { full_name: string | null; avatar_url: string | null }
    >();

    if (userIds.length > 0) {
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      if (profilesError) {
        logSupabaseError("load team profiles error", profilesError);
      }

      profilesMap = new Map(
        (profilesData ?? []).map((p: any) => [
          p.id,
          { full_name: p.full_name, avatar_url: p.avatar_url },
        ])
      );
    }

    const mappedTeam = (membersData ?? []).map((member) => ({
      user_id: member.user_id,
      role: member.role,
      full_name:
        member.user_id === currentUserId
          ? getDisplayName(
              profilesMap.get(member.user_id)?.full_name ?? null,
              currentAuthEmail ?? null
            )
          : getDisplayName(profilesMap.get(member.user_id)?.full_name ?? null),
      avatar_url: profilesMap.get(member.user_id)?.avatar_url ?? null,
    }));

    setTeamMembers(mappedTeam);
  }

  useEffect(() => {
    async function loadShellData() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          if (userError) logSupabaseError("auth.getUser error", userError);
          router.push("/");
          return;
        }

        setCurrentUserId(user.id);

        const { data: membershipList, error: membershipError } = await supabase
          .from("workspace_members")
          .select("workspace_id, role")
          .eq("user_id", user.id);

        if (membershipError || !(membershipList || []).length) {
          if (membershipError) logSupabaseError("load membership error", membershipError);
          router.push("/onboarding");
          return;
        }

        const activeMembership = membershipList?.[0];
        if (!activeMembership?.workspace_id) {
          router.push("/onboarding");
          return;
        }

        setCurrentUserRole(activeMembership.role);

        const { data: workspaceData, error: workspaceError } = await supabase
          .from("workspaces")
          .select("id, name, company_name")
          .eq("id", activeMembership.workspace_id)
          .single();

        if (workspaceError) {
          logSupabaseError("load workspace error", workspaceError);
        } else if (workspaceData) {
          setWorkspace(workspaceData);
        }

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          logSupabaseError("load profile error", profileError);
        }

        setProfile({
          full_name: getDisplayName(profileData?.full_name ?? null, user.email ?? null),
          avatar_url: profileData?.avatar_url ?? null,
          email: user.email ?? null,
        });

        await ensureWorkspaceCode(activeMembership.workspace_id, user.id);
        await loadTeamMembers(activeMembership.workspace_id, user.email ?? null);
        await loadNotifications();
      } finally {
        setLoading(false);
      }
    }

    loadShellData();
  }, [router]);

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

  useEffect(() => {
    async function loadTeamMembersForModal() {
      if (modal !== "team" || !workspace?.id) return;
      setTeamLoading(true);
      try {
        await loadTeamMembers(workspace.id, profile?.email ?? null);
      } finally {
        setTeamLoading(false);
      }
    }

    loadTeamMembersForModal();
  }, [modal, workspace?.id, profile?.email, currentUserId]);

  const workspaceLabel = useMemo(() => {
    if (!workspace) return "Workspace";
    return workspace.company_name
      ? `${workspace.company_name} Workspace`
      : workspace.name;
  }, [workspace]);

  const displayName = useMemo(
    () => getDisplayName(profile?.full_name ?? null, profile?.email ?? null),
    [profile]
  );

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
    if (!workspaceCode) return;

    try {
      await navigator.clipboard.writeText(workspaceCode);
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

      if (error) {
        logSupabaseError("handleRoleChange error", error);
      } else {
        setTeamMembers((prev) =>
          prev.map((m) => (m.user_id === userId ? { ...m, role: newRole } : m))
        );
      }
    } finally {
      setRoleUpdating(null);
    }
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
      key: "chat",
      label: "Chat",
      icon: MessageCircle,
      onClick: () => router.push("/app/chat"),
      active: pathname === "/app/chat",
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

        <div className="flex min-h-screen flex-1 flex-col overflow-hidden">
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
                        {workspaceCode || "No code"}
                      </div>
                      <button
                        onClick={copyWorkspaceKey}
                        disabled={!workspaceCode}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
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
                  </div>
                </div>
              )}

              {modal === "billing" && <BillingContent onContactSales={goToSales} />}
              {modal === "settings" && (
                <SettingsContent
                  workspace={workspace}
                  onWorkspaceSaved={(next) => setWorkspace(next)}
                />
              )}
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
