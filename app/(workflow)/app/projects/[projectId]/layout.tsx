"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  ArrowLeft,
  BarChart3,
  ClipboardList,
  FileText,
  Settings,
  ShieldAlert,
  Users,
  CheckSquare,
  ChevronDown,
  LogOut,
  Bell,
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Project = {
  id: string;
  name: string;
  status: string | null;
};

type Profile = {
  full_name: string | null;
  avatar_url: string | null;
};

function getStatusLabel(status: string | null) {
  if (!status) return "Draft";

  switch (status) {
    case "active":
      return "Active";
    case "at_risk":
      return "At Risk";
    case "high_risk":
      return "High Risk";
    default:
      return status;
  }
}

function getStatusClasses(status: string | null) {
  switch (status) {
    case "active":
      return "bg-emerald-100 text-emerald-700";
    case "at_risk":
      return "bg-amber-100 text-amber-700";
    case "high_risk":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
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

  const [project, setProject] = useState<Project | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  async function loadUnreadNotifications(userId: string) {
    if (!projectId || !userId) {
      setUnreadCount(0);
      return;
    }

    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("project_id", projectId)
      .eq("is_read", false);

    if (error) {
      console.error("Failed to load unread notifications:", error.message);
      setUnreadCount(0);
      return;
    }

    setUnreadCount(count || 0);
  }

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
      await loadUnreadNotifications(user.id);
      setLoading(false);
    }

    if (projectId) {
      loadShellData();
    }
  }, [projectId, router]);

  async function handleLogout() {
    try {
      setLoggingOut(true);
      await supabase.auth.signOut();
      router.push("/auth");
    } finally {
      setLoggingOut(false);
    }
  }

  const navItems = useMemo(
    () => [
      {
        label: "Dashboard",
        href: `/app/projects/${projectId}`,
        icon: BarChart3,
      },
      {
        label: "Risk Register",
        href: `/app/projects/${projectId}/risk-register`,
        icon: ClipboardList,
      },
      {
        label: "Risk Analysis",
        href: `/app/projects/${projectId}/risk-analysis`,
        icon: ShieldAlert,
      },
      {
        label: "Actions",
        href: `/app/projects/${projectId}/actions`,
        icon: CheckSquare,
      },
      {
        label: "Stakeholders",
        href: `/app/projects/${projectId}/stakeholders`,
        icon: Users,
      },
      {
        label: "Reports",
        href: `/app/projects/${projectId}/reports`,
        icon: FileText,
      },
    ],
    [projectId]
  );

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <div className="h-screen w-64 shrink-0 border-r border-white/10 bg-[#182B63]" />
        <div className="flex-1 overflow-hidden p-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
            Loading project workspace...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-[#182B63] text-white">
        <div className="border-b border-white/10 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/10">
              <Image
                src="/applogo.png"
                alt="RiskBases logo"
                fill
                className="object-contain p-1.5"
                sizes="44px"
                priority
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-[18px] font-semibold tracking-tight text-white">
                RiskBases
              </p>
              <p className="text-xs text-white/50">Project workspace</p>
            </div>
          </div>
        </div>

        <div className="px-3 py-4">
          <Link
            href="/app"
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] text-white/90 transition hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5 shrink-0" />
            <span className="truncate">Back to Workspace</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          <div className="space-y-1.5">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-medium transition ${
                    active
                      ? "bg-white/12 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                      : "text-white/75 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="mt-auto border-t border-white/10 px-3 py-4">
          <div className="space-y-1.5">
            <Link
              href={`/app/projects/${projectId}/settings`}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-medium text-white/75 transition hover:bg-white/8 hover:text-white"
            >
              <Settings className="h-5 w-5 shrink-0" />
              <span className="truncate">Settings</span>
            </Link>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[15px] font-medium text-white/75 transition hover:bg-white/8 hover:text-white disabled:opacity-60"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              <span className="truncate">
                {loggingOut ? "Logging out..." : "Log out"}
              </span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex items-center justify-between gap-6 px-8 py-5">
            <div className="min-w-0">
              <div className="flex items-center gap-3 text-[15px] text-slate-500">
                <Link href="/app" className="hover:text-slate-700">
                  Workspace
                </Link>

                <span>/</span>

                <span className="truncate font-medium text-slate-800">
                  {project?.name}
                </span>

                <span
                  className={`rounded-xl px-3 py-1 text-sm font-medium ${getStatusClasses(
                    project?.status ?? null
                  )}`}
                >
                  {getStatusLabel(project?.status ?? null)}
                </span>

                <ChevronDown className="h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href={`/app/projects/${projectId}/notifications`}
                className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:bg-slate-50"
              >
                <Bell className="h-5 w-5 text-slate-600" />
                {unreadCount > 0 ? (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                ) : null}
              </Link>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || "User"}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                    {(profile?.full_name || "R").slice(0, 1).toUpperCase()}
                  </div>
                )}

                <div className="hidden sm:block">
                  <p className="text-[15px] font-medium text-slate-800">
                    {profile?.full_name || "Ralph"}
                  </p>
                </div>

                <ChevronDown className="h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}