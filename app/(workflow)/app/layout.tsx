"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  ChevronDown,
  Copy,
  CreditCard,
  Home,
  LogOut,
  Settings,
  Users,
  X,
  ChevronDown as ChevronDownSmall,
  Check,
  Bell,
  Globe,
  Shield,
  Zap,
  Receipt,
  Download,
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

function AvatarCircle({
  name,
  avatarUrl,
  size = "md",
}: {
  name: string | null;
  avatarUrl: string | null;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-9 w-9 text-xs" : "h-11 w-11 text-sm";
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name || "Member"}
        className={`${dim} rounded-full object-cover shrink-0`}
      />
    );
  }
  return (
    <div
      className={`${dim} flex shrink-0 items-center justify-center rounded-full bg-violet-500 font-semibold text-white`}
    >
      {getInitials(name)}
    </div>
  );
}

// ─── BILLING MODAL CONTENT ───────────────────────────────────────────────────
function BillingContent() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  const plans = [
    {
      name: "Starter",
      price: { monthly: 0, yearly: 0 },
      description: "Perfect to get started",
      features: ["3 projects", "2 team members", "Basic risk tracking", "Email support"],
      current: false,
      color: "border-slate-200",
      badge: null,
    },
    {
      name: "Pro",
      price: { monthly: 49, yearly: 39 },
      description: "For growing teams",
      features: ["Unlimited projects", "10 team members", "Advanced analytics", "Priority support", "CSV & API import"],
      current: true,
      color: "border-violet-500",
      badge: "Current plan",
    },
    {
      name: "Enterprise",
      price: { monthly: 149, yearly: 119 },
      description: "For large organisations",
      features: ["Unlimited everything", "SSO / SAML", "Custom integrations", "Dedicated support", "SLA guarantee"],
      current: false,
      color: "border-slate-200",
      badge: null,
    },
  ];

  const invoices = [
    { date: "1 Feb 2025", amount: "€49,00", status: "Paid" },
    { date: "1 Jan 2025", amount: "€49,00", status: "Paid" },
    { date: "1 Dec 2024", amount: "€49,00", status: "Paid" },
  ];

  return (
    <div className="space-y-8">
      {/* Plan toggle */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-base font-semibold text-slate-800">Plan</h4>
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${billingPeriod === "monthly" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${billingPeriod === "yearly" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Yearly
              <span className="ml-1.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] text-emerald-700">
                -20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl border-2 p-4 ${plan.color} ${plan.current ? "bg-violet-50/60" : "bg-white"}`}
            >
              {plan.badge && (
                <span className="absolute -top-2.5 left-3 rounded-full bg-violet-600 px-2.5 py-0.5 text-[10px] font-semibold text-white">
                  {plan.badge}
                </span>
              )}
              <p className="text-sm font-bold text-slate-900">{plan.name}</p>
              <p className="mt-1 text-[11px] text-slate-400">{plan.description}</p>
              <p className="mt-3 text-2xl font-bold text-slate-900">
                €{plan.price[billingPeriod]}
                <span className="text-xs font-normal text-slate-400">/mo</span>
              </p>
              <ul className="mt-3 space-y-1.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                    <Check className="mt-0.5 h-3 w-3 shrink-0 text-violet-500" />
                    {f}
                  </li>
                ))}
              </ul>
              {!plan.current && (
                <button className="mt-4 w-full rounded-lg border border-slate-200 bg-white py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                  {plan.name === "Enterprise" ? "Contact sales" : "Upgrade"}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Usage */}
      <div>
        <h4 className="mb-3 text-base font-semibold text-slate-800">Usage this month</h4>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Projects", used: 4, max: "∞" },
            { label: "Team members", used: 3, max: 10 },
            { label: "Risks logged", used: 47, max: "∞" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] text-slate-500">{item.label}</p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {item.used}
                <span className="text-xs font-normal text-slate-400"> / {item.max}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Invoices */}
      <div>
        <h4 className="mb-3 text-base font-semibold text-slate-800">Recent invoices</h4>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {invoices.map((inv, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between px-4 py-3 ${idx < invoices.length - 1 ? "border-b border-slate-100" : ""}`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                  <Receipt className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{inv.date}</p>
                  <p className="text-xs text-slate-400">{inv.amount}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  {inv.status}
                </span>
                <button className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
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

// ─── SETTINGS MODAL CONTENT ──────────────────────────────────────────────────
function SettingsContent({ workspace }: { workspace: Workspace | null }) {
  const [workspaceName, setWorkspaceName] = useState(workspace?.name || "");
  const [companyName, setCompanyName] = useState(workspace?.company_name || "");
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    // In real app: call supabase update
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-7">
      {/* Workspace */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Globe className="h-4 w-4 text-slate-400" />
          <h4 className="text-base font-semibold text-slate-800">Workspace</h4>
        </div>
        <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Workspace name
            </label>
            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Company name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Bell className="h-4 w-4 text-slate-400" />
          <h4 className="text-base font-semibold text-slate-800">Notifications</h4>
        </div>
        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-5">
          {[
            { label: "Email notifications", desc: "Receive updates on risk changes", value: emailNotifs, onChange: setEmailNotifs },
            { label: "Weekly digest", desc: "Summary of all activity every Monday", value: weeklyDigest, onChange: setWeeklyDigest },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-800">{item.label}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
              <button
                onClick={() => item.onChange(!item.value)}
                className={`relative h-6 w-11 rounded-full transition-colors ${item.value ? "bg-violet-500" : "bg-slate-200"}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${item.value ? "translate-x-5" : "translate-x-0"}`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Shield className="h-4 w-4 text-slate-400" />
          <h4 className="text-base font-semibold text-slate-800">Security</h4>
        </div>
        <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm text-slate-600">
            Two-factor authentication and SSO are available on the Enterprise plan.
          </p>
          <button className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100">
            <Zap className="h-3.5 w-3.5 text-violet-500" />
            Upgrade to Enterprise
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div>
        <h4 className="mb-3 text-base font-semibold text-red-600">Danger zone</h4>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-slate-700">
            Deleting the workspace is permanent and cannot be undone.
          </p>
          <button className="mt-3 inline-flex h-8 items-center rounded-lg border border-red-300 bg-white px-3 text-xs font-semibold text-red-600 transition hover:bg-red-50">
            Delete workspace
          </button>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-violet-600 px-6 text-sm font-semibold text-white transition hover:bg-violet-700"
        >
          {saved ? <><Check className="h-4 w-4" /> Saved!</> : "Save changes"}
        </button>
      </div>
    </div>
  );
}

// ─── MAIN LAYOUT ─────────────────────────────────────────────────────────────
export default function WorkflowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      } finally {
        setLoading(false);
      }
    }

    loadShellData();
  }, [router]);

  useEffect(() => {
    async function loadTeamMembers() {
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

        let profilesMap = new Map<string, { full_name: string | null; avatar_url: string | null }>();

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

        const merged = (membersData ?? []).map((member) => ({
          user_id: member.user_id,
          role: member.role,
          full_name: profilesMap.get(member.user_id)?.full_name || null,
          avatar_url: profilesMap.get(member.user_id)?.avatar_url || null,
        }));

        setTeamMembers(merged);
      } catch {
        setTeamMembers([]);
      } finally {
        setTeamLoading(false);
      }
    }

    loadTeamMembers();
  }, [modal, workspace?.id]);

  const workspaceLabel = useMemo(() => {
    if (!workspace) return "Workspace";
    return workspace.company_name
      ? `${workspace.company_name} Workspace`
      : workspace.name;
  }, [workspace]);

  const displayName = useMemo(() => {
    return profile?.full_name || "User";
  }, [profile]);

  const isOwner = currentUserRole === "owner";

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  async function copyWorkspaceKey() {
    if (!workspace?.join_key) return;
    try {
      await navigator.clipboard.writeText(workspace.join_key);
      setCopyMessage("Workspace key gekopieerd!");
      setTimeout(() => setCopyMessage(""), 2000);
    } catch {
      setCopyMessage("Kon key niet kopiëren");
      setTimeout(() => setCopyMessage(""), 2000);
    }
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

  // Wide modals for billing/settings, normal for team
  const modalMaxWidth = modal === "billing" ? "max-w-[760px]" : modal === "settings" ? "max-w-[620px]" : "max-w-[620px]";

  if (isProjectRoute) {
    return <>{children}</>;
  }

  return (
    <main className="min-h-screen bg-[#f7f7fb]">
      <div className="flex min-h-screen">
        {/* ── Sidebar ── */}
        <aside
          onMouseEnter={() => setExpanded(true)}
          onMouseLeave={() => setExpanded(false)}
          className={`relative flex shrink-0 flex-col border-r border-white/10 bg-gradient-to-b from-[#2f315f] to-[#232547] text-white transition-all duration-300 ${
            expanded ? "w-[220px]" : "w-[72px]"
          }`}
        >
          {/* Logo */}
          <div className="flex h-[72px] items-center px-[18px]">
            <img
              src="/logo-icon.png"
              alt="RiskBases"
              className="h-9 w-9 shrink-0 rounded-xl object-contain"
            />
            <div
              className={`overflow-hidden transition-all duration-300 ${
                expanded ? "ml-3 w-[120px] opacity-100" : "ml-0 w-0 opacity-0"
              }`}
            >
              <span className="whitespace-nowrap text-[17px] font-bold tracking-tight">
                RiskBases
              </span>
            </div>
          </div>

          {/* Nav items */}
          <nav className="flex flex-1 flex-col gap-1 px-2.5 py-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={item.onClick}
                  className={`flex h-11 items-center rounded-xl px-3 transition-all ${
                    item.active
                      ? "bg-white/15 text-white"
                      : "text-white/65 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  <span
                    className={`overflow-hidden whitespace-nowrap text-left text-[14px] font-medium transition-all duration-300 ${
                      expanded ? "ml-3 w-auto opacity-100" : "ml-0 w-0 opacity-0"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="px-2.5 pb-4">
            <button
              onClick={handleLogout}
              className="flex h-11 w-full items-center rounded-xl px-3 text-white/55 transition hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-[18px] w-[18px] shrink-0" />
              <span
                className={`overflow-hidden whitespace-nowrap text-[14px] font-medium transition-all duration-300 ${
                  expanded ? "ml-3 w-auto opacity-100" : "ml-0 w-0 opacity-0"
                }`}
              >
                Log out
              </span>
            </button>
          </div>
        </aside>

        {/* ── Main area ── */}
        <div className="flex min-h-screen flex-1 flex-col">
          {/* Header */}
          <header className="flex h-[72px] items-center justify-between border-b border-slate-200 bg-white px-6 md:px-8">
            <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-slate-50">
              <span className="text-[17px] font-semibold text-slate-800">
                {loading ? "Loading..." : workspaceLabel}
              </span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            <button className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition hover:bg-slate-50">
              <AvatarCircle
                name={displayName}
                avatarUrl={profile?.avatar_url ?? null}
                size="sm"
              />
              <span className="hidden text-[15px] font-semibold text-slate-700 sm:block">
                {displayName}
              </span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>
          </header>

          <div className="flex flex-1">{children}</div>
        </div>
      </div>

      {/* ─── MODALS ─────────────────────────────────────────────────────── */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModal(null);
            setRoleDropdownOpen(null);
          }}
        >
          <div className={`w-full ${modalMaxWidth} rounded-2xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)] flex flex-col max-h-[90vh]`}>
            {/* Modal header */}
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

            {/* Modal body (scrollable) */}
            <div className="flex-1 overflow-y-auto px-6 py-6">

              {/* ── TEAM ── */}
              {modal === "team" && (
                <div className="space-y-6">
                  {/* Workspace key */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-700">Workspace key</p>
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-3 font-mono text-[14px] tracking-[0.15em] text-slate-700">
                        {workspace?.join_key || "Geen key"}
                      </div>
                      <button
                        onClick={copyWorkspaceKey}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 text-sm font-semibold text-white transition hover:bg-violet-700"
                      >
                        <Copy className="h-4 w-4" />
                        Copy key
                      </button>
                    </div>
                    <p className="mt-2.5 text-sm text-slate-500">
                      Deel deze key met collega's zodat ze kunnen joinen via de onboarding pagina.
                    </p>
                    {copyMessage && (
                      <p className="mt-2 text-sm font-medium text-emerald-600">{copyMessage}</p>
                    )}
                  </div>

                  {/* Team members */}
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-base font-semibold text-slate-800">Team members</h4>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
                        {teamMembers.length} {teamMembers.length === 1 ? "persoon" : "personen"}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {teamLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="h-16 animate-pulse rounded-xl border border-slate-200 bg-slate-50" />
                        ))
                      ) : teamMembers.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-slate-500">
                          Nog geen teamleden gevonden.
                        </div>
                      ) : (
                        teamMembers.map((member) => {
                          const isMe = member.user_id === currentUserId;
                          const canEdit = isOwner && !isMe;
                          const roleBadge = ROLE_COLORS[member.role] ?? "bg-slate-100 text-slate-600";

                          return (
                            <div
                              key={member.user_id}
                              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <AvatarCircle name={member.full_name} avatarUrl={member.avatar_url} size="md" />
                                <div className="min-w-0">
                                  <p className="text-[15px] font-semibold text-slate-800 truncate">
                                    {member.full_name || "Onbekend lid"}
                                    {isMe && (
                                      <span className="ml-2 text-xs text-slate-400 font-normal">(jij)</span>
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
                                      <ChevronDownSmall className="h-3 w-3" />
                                    </button>

                                    {roleDropdownOpen === member.user_id && (
                                      <div className="absolute right-0 top-full z-10 mt-1 w-36 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                                        {ROLES.map((r) => (
                                          <button
                                            key={r}
                                            onClick={() => handleRoleChange(member.user_id, r)}
                                            className={`flex w-full items-center px-4 py-2.5 text-sm capitalize transition hover:bg-slate-50 ${
                                              member.role === r ? "font-semibold text-violet-600" : "text-slate-700"
                                            }`}
                                          >
                                            {r}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <span className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${roleBadge}`}>
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
                        Als owner kun je rollen wijzigen door op de badge te klikken.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* ── BILLING ── */}
              {modal === "billing" && <BillingContent />}

              {/* ── SETTINGS ── */}
              {modal === "settings" && <SettingsContent workspace={workspace} />}
            </div>

            {/* Modal footer */}
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
