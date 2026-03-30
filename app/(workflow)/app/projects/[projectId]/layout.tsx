"use client";

import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  ArrowLeft,
  BarChart3,
  ClipboardList,
  FileText,
  Settings,
  GitBranch,
  CheckSquare,
  ChevronDown,
  LogOut,
  Bell,
  BadgeAlert,
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Project = { id: string; name: string; status: string | null };
type Profile = { full_name: string | null; avatar_url: string | null };

function getStatusClasses(status: string | null) {
  switch (status) {
    case "active":
      return "border border-emerald-200 bg-emerald-50 text-emerald-700";
    case "at_risk":
      return "border border-amber-200 bg-amber-50 text-amber-700";
    case "high_risk":
      return "border border-red-200 bg-red-50 text-red-700";
    default:
      return "border border-slate-200 bg-slate-50 text-slate-600";
  }
}

function getStatusLabel(status: string | null) {
  switch (status) {
    case "active":
      return "Healthy";
    case "at_risk":
      return "Watchlist";
    case "high_risk":
      return "Critical";
    default:
      return "Draft";
  }
}

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [expanded, setExpanded] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function loadShellData() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
        return;
      }

      const [{ data: projectData, error: projectError }, { data: profileData }] =
        await Promise.all([
          supabase
            .from("projects")
            .select("id, name, status")
            .eq("id", projectId)
            .single(),
          supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", user.id)
            .maybeSingle(),
        ]);

      if (projectError || !projectData) {
        router.push("/app");
        return;
      }

      setProject(projectData);
      setProfile(profileData || null);

      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("project_id", projectId)
        .eq("is_read", false);

      setUnreadCount(count || 0);
      setLoading(false);
    }

    if (projectId) loadShellData();
  }, [projectId, router]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.push("/auth");
    } finally {
      setLoggingOut(false);
    }
  }

  const navItems = useMemo(
    () => [
      {
        label: "Overview",
        href: `/app/projects/${projectId}`,
        icon: BarChart3,
      },
      {
        label: "Risk Analysis",
        href: `/app/projects/${projectId}/risk-analysis`,
        icon: BadgeAlert,
      },
      {
        label: "Dependencies",
        href: `/app/projects/${projectId}/dependencies`,
        icon: GitBranch,
      },
      {
        label: "Actions",
        href: `/app/projects/${projectId}/actions`,
        icon: CheckSquare,
      },
      {
        label: "Reports",
        href: `/app/projects/${projectId}/reports`,
        icon: FileText,
      },
    ],
    [projectId]
  );

  const bottomItems = useMemo(
    () => [
      {
        label: "Risk Register",
        href: `/app/projects/${projectId}/risk-register`,
        icon: ClipboardList,
      },
      {
        label: "Settings",
        href: `/app/projects/${projectId}/settings`,
        icon: Settings,
      },
    ],
    [projectId]
  );

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f6f7fb]">
        <div className="h-screen w-[84px] shrink-0 border-r border-[#e8ebf2] bg-white" />
        <div className="flex-1 p-8">
          <div className="rounded-2xl border border-[#e8ebf2] bg-white p-10 shadow-sm">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f6f7fb] text-[#111827]">
      <aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className={`${
          expanded ? "w-[250px]" : "w-[84px]"
        } sticky top-0 flex h-screen shrink-0 flex-col border-r border-[#e8ebf2] bg-white transition-all duration-300`}
      >
        <div className="flex h-[76px] items-center border-b border-[#eef1f6] px-4">
          <div className="flex min-w-0 items-center">
            <img
              src="/logo-icon.png"
              alt="RiskBases"
              className="h-9 w-9 shrink-0 rounded-xl object-contain"
            />

            <div
              className={`overflow-hidden transition-all duration-300 ${
                expanded ? "ml-3 w-auto opacity-100" : "ml-0 w-0 opacity-0"
              }`}
            >
              <p className="whitespace-nowrap text-[15px] font-semibold text-[#111827]">
                RiskBases
              </p>
              <p className="whitespace-nowrap text-[11px] text-[#94a3b8]">
                Project workspace
              </p>
            </div>
          </div>
        </div>

        <div className="px-3 pt-4 pb-2">
          <Link
            href="/app"
            className="flex h-11 items-center rounded-xl px-3 text-[13px] font-medium text-[#64748b] transition hover:bg-[#f5f7fb] hover:text-[#111827]"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            <span
              className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                expanded ? "ml-3 w-auto opacity-100" : "ml-0 w-0 opacity-0"
              }`}
            >
              Back to Workspace
            </span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pt-2">
          <div
            className={`mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#94a3b8] transition-all duration-300 ${
              expanded ? "opacity-100" : "opacity-0"
            }`}
          >
            Project
          </div>

          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== `/app/projects/${projectId}` &&
                pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`mb-1 flex h-12 items-center rounded-xl px-3 text-[14px] transition ${
                  active
                    ? "border border-[#e6eaf2] bg-[#f8fafc] text-[#111827] shadow-sm"
                    : "text-[#64748b] hover:bg-[#f5f7fb] hover:text-[#111827]"
                }`}
              >
                <Icon
                  className={`h-[18px] w-[18px] shrink-0 ${
                    active ? "text-[#111827]" : "text-[#94a3b8]"
                  }`}
                />
                <span
                  className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                    expanded ? "ml-3 w-auto opacity-100" : "ml-0 w-0 opacity-0"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[#eef1f6] px-3 pt-4 pb-4">
          <div
            className={`mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#94a3b8] transition-all duration-300 ${
              expanded ? "opacity-100" : "opacity-0"
            }`}
          >
            Management
          </div>

          {bottomItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== `/app/projects/${projectId}` &&
                pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`mb-1 flex h-12 items-center rounded-xl px-3 text-[14px] transition ${
                  active
                    ? "border border-[#e6eaf2] bg-[#f8fafc] text-[#111827] shadow-sm"
                    : "text-[#64748b] hover:bg-[#f5f7fb] hover:text-[#111827]"
                }`}
              >
                <Icon
                  className={`h-[18px] w-[18px] shrink-0 ${
                    active ? "text-[#111827]" : "text-[#94a3b8]"
                  }`}
                />
                <span
                  className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                    expanded ? "ml-3 w-auto opacity-100" : "ml-0 w-0 opacity-0"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="mt-3 flex h-12 w-full items-center rounded-xl px-3 text-[14px] text-[#64748b] transition hover:bg-[#f5f7fb] hover:text-[#111827]"
          >
            <LogOut className="h-[18px] w-[18px] shrink-0 text-[#94a3b8]" />
            <span
              className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                expanded ? "ml-3 w-auto opacity-100" : "ml-0 w-0 opacity-0"
              }`}
            >
              {loggingOut ? "Logging out..." : "Log out"}
            </span>
          </button>

          <div className="mt-4 rounded-2xl border border-[#edf0f5] bg-[#fcfcfd] p-3">
            <div className="flex items-center">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || "User"}
                  className="h-9 w-9 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#111827] text-[12px] font-semibold text-white">
                  {(profile?.full_name || "R").slice(0, 1).toUpperCase()}
                </div>
              )}

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  expanded ? "ml-3 w-auto opacity-100" : "ml-0 w-0 opacity-0"
                }`}
              >
                <p className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-semibold text-[#111827]">
                  {profile?.full_name || "User"}
                </p>
                <p className="text-[11px] text-[#94a3b8]">Workspace member</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-[76px] shrink-0 items-center justify-between border-b border-[#e8ebf2] bg-white px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Link
              href="/app"
              className="text-[14px] text-[#94a3b8] transition hover:text-[#111827]"
            >
              Workspace
            </Link>

            <span className="text-[#d1d5db]">/</span>

            <span className="truncate text-[15px] font-semibold text-[#111827]">
              {project?.name}
            </span>

            <span
              className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-semibold ${getStatusClasses(
                project?.status ?? null
              )}`}
            >
              {getStatusLabel(project?.status ?? null)}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <Link
              href={`/app/projects/${projectId}/notifications`}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#e8ebf2] bg-white text-[#64748b] transition hover:bg-[#f8fafc]"
            >
              <Bell className="h-[18px] w-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>

            <div className="flex items-center gap-3 rounded-xl border border-[#e8ebf2] bg-white px-3 py-2">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || "User"}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#111827] text-[12px] font-semibold text-white">
                  {(profile?.full_name || "R").slice(0, 1).toUpperCase()}
                </div>
              )}

              <span className="hidden text-[14px] font-semibold text-[#111827] sm:block">
                {profile?.full_name || "User"}
              </span>

              <ChevronDown className="h-4 w-4 text-[#94a3b8]" />
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}