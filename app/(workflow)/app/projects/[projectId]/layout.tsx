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
  Search,
  Settings,
  ShieldAlert,
  Users,
  CheckSquare,
  ChevronDown,
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
      setLoading(false);
    }

    if (projectId) {
      loadShellData();
    }
  }, [projectId, router]);

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
      <div className="flex min-h-screen bg-slate-50">
        <div className="w-[280px] border-r border-slate-200 bg-[#182B63]" />
        <div className="flex-1 p-10">
          <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
            Loading project workspace...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-[280px] flex-col border-r border-white/10 bg-[#182B63] text-white">
        <div className="border-b border-white/10 px-8 py-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
              <div className="h-6 w-6 rotate-45 rounded-md bg-gradient-to-br from-violet-300 to-blue-300" />
            </div>
            <div>
              <p className="text-[18px] font-semibold tracking-tight">RiskBases</p>
            </div>
          </div>
        </div>

        <div className="px-4 py-5">
          <Link
            href="/app"
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] text-white/90 transition hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Workspace
          </Link>
        </div>

        <nav className="flex-1 px-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] transition ${
                    active
                      ? "bg-white/12 text-white"
                      : "text-white/80 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-4">
          <Link
            href={`/app/projects/${projectId}/settings`}
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] text-white/80 transition hover:bg-white/8 hover:text-white"
          >
            <Settings className="h-5 w-5" />
            Settings
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
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
              <div className="relative hidden w-[280px] lg:block">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  placeholder="Search projects..."
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-[15px] text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || "User"}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                    {(profile?.full_name || "R")
                      .slice(0, 1)
                      .toUpperCase()}
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

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}