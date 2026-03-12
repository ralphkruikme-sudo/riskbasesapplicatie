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

export default function WorkflowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [expanded, setExpanded] = useState(false);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [modal, setModal] = useState<ModalType>(null);
  const [loading, setLoading] = useState(true);
  const [teamLoading, setTeamLoading] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");

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

        const { data: membership, error: membershipError } = await supabase
          .from("workspace_members")
          .select("workspace_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (membershipError || !membership?.workspace_id) {
          router.push("/onboarding");
          return;
        }

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

        let profilesMap = new Map<string, Profile>();

        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url")
            .in("id", userIds);

          profilesMap = new Map(
            (profilesData ?? []).map((p: any) => [
              p.id,
              {
                full_name: p.full_name,
                avatar_url: p.avatar_url,
              },
            ])
          );
        }

        const merged = (membersData ?? []).map((member) => ({
          user_id: member.user_id,
          role: member.role,
          full_name: profilesMap.get(member.user_id)?.full_name || "Team member",
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

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  async function copyWorkspaceKey() {
    if (!workspace?.join_key) return;

    try {
      await navigator.clipboard.writeText(workspace.join_key);
      setCopyMessage("Workspace key copied");
      setTimeout(() => setCopyMessage(""), 2000);
    } catch {
      setCopyMessage("Could not copy key");
      setTimeout(() => setCopyMessage(""), 2000);
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
      onClick: () => setModal("team" as ModalType),
      active: false,
    },
    {
      key: "billing",
      label: "Billing",
      icon: CreditCard,
      onClick: () => setModal("billing" as ModalType),
      active: false,
    },
    {
      key: "settings",
      label: "Settings",
      icon: Settings,
      onClick: () => setModal("settings" as ModalType),
      active: false,
    },
  ];

  return (
    <main className="min-h-screen bg-[#f7f7fb]">
      <div className="flex min-h-screen">
        <aside
          onMouseEnter={() => setExpanded(true)}
          onMouseLeave={() => setExpanded(false)}
          className={`relative flex shrink-0 flex-col border-r border-white/10 bg-gradient-to-b from-[#2f315f] to-[#232547] text-white transition-all duration-300 ${
            expanded ? "w-[220px]" : "w-[82px]"
          }`}
        >
          <div className="flex h-20 items-center px-5">
            <img
              src="/logo-icon.png"
              alt="RiskBases"
              className="h-9 w-9 shrink-0 object-contain"
            />
            <div
              className={`overflow-hidden transition-all duration-300 ${
                expanded ? "ml-3 w-[110px] opacity-100" : "ml-0 w-0 opacity-0"
              }`}
            >
              <span className="text-[18px] font-semibold tracking-tight">
                RiskBases
              </span>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-2 px-3 py-4">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.key}
                  onClick={item.onClick}
                  className={`flex h-12 items-center rounded-xl px-3 transition ${
                    item.active
                      ? "bg-white/14 text-white"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span
                    className={`overflow-hidden whitespace-nowrap text-left text-[15px] font-medium transition-all duration-300 ${
                      expanded
                        ? "ml-3 w-auto opacity-100"
                        : "ml-0 w-0 opacity-0"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="px-3 pb-4">
            <button
              onClick={handleLogout}
              className={`flex h-12 items-center rounded-xl px-3 text-white/75 transition hover:bg-white/10 hover:text-white ${
                expanded ? "w-full" : "w-12 justify-center"
              }`}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              <span
                className={`overflow-hidden whitespace-nowrap text-[15px] font-medium transition-all duration-300 ${
                  expanded
                    ? "ml-3 w-auto opacity-100"
                    : "ml-0 w-0 opacity-0"
                }`}
              >
                Log out
              </span>
            </button>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-6 md:px-8">
            <div className="flex items-center">
              <button className="flex items-center gap-2">
                <span className="text-[18px] font-medium text-slate-700">
                  {loading ? "Loading..." : workspaceLabel}
                </span>
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-slate-50">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={displayName}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <img
                    src="/avatar.png"
                    alt={displayName}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                )}

                <span className="hidden text-[17px] font-medium text-slate-700 sm:block">
                  {displayName}
                </span>
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </button>
            </div>
          </header>

          <div className="flex flex-1">{children}</div>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 px-4">
          <div className="w-full max-w-[620px] rounded-2xl border border-slate-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.20)]">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h3 className="text-2xl font-semibold text-slate-800">
                {modal === "team" && "Team"}
                {modal === "billing" && "Billing"}
                {modal === "settings" && "Settings"}
              </h3>

              <button
                onClick={() => setModal(null)}
                className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-6">
              {modal === "team" && (
                <div className="space-y-6">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-700">
                      Workspace key
                    </p>
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-3 text-[15px] font-medium tracking-[0.15em] text-slate-700">
                        {workspace?.join_key || "No key"}
                      </div>

                      <button
                        onClick={copyWorkspaceKey}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-violet-500 px-4 text-sm font-semibold text-white transition hover:bg-violet-600"
                      >
                        <Copy className="h-4 w-4" />
                        Copy key
                      </button>
                    </div>

                    <p className="mt-3 text-sm text-slate-500">
                      Share this workspace key with colleagues so they can join
                      from the onboarding page.
                    </p>

                    {copyMessage ? (
                      <p className="mt-2 text-sm text-emerald-600">
                        {copyMessage}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-slate-800">
                      Team members
                    </h4>

                    <div className="mt-4 space-y-3">
                      {teamLoading ? (
                        <div className="space-y-3">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div
                              key={i}
                              className="h-16 animate-pulse rounded-xl border border-slate-200 bg-slate-50"
                            />
                          ))}
                        </div>
                      ) : teamMembers.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-slate-500">
                          No team members found yet.
                        </div>
                      ) : (
                        teamMembers.map((member) => (
                          <div
                            key={member.user_id}
                            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"
                          >
                            <div className="flex items-center gap-3">
                              {member.avatar_url ? (
                                <img
                                  src={member.avatar_url}
                                  alt={member.full_name || "Member"}
                                  className="h-11 w-11 rounded-full object-cover"
                                />
                              ) : (
                                <img
                                  src="/avatar.png"
                                  alt={member.full_name || "Member"}
                                  className="h-11 w-11 rounded-full object-cover"
                                />
                              )}

                              <div>
                                <p className="text-[15px] font-medium text-slate-800">
                                  {member.full_name || "Team member"}
                                </p>
                                <p className="text-sm text-slate-500 capitalize">
                                  {member.role}
                                </p>
                              </div>
                            </div>

                            <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
                              {member.role}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {modal === "billing" && (
                <>
                  <p className="text-[16px] text-slate-600">
                    Billing komt hier straks.
                  </p>
                  <p className="mt-3 text-sm text-slate-400">
                    Hier kun je later subscription, plan, facturen en usage
                    tonen.
                  </p>
                </>
              )}

              {modal === "settings" && (
                <>
                  <p className="text-[16px] text-slate-600">
                    Settings laten we nu nog even leeg.
                  </p>
                  <p className="mt-3 text-sm text-slate-400">
                    Hier kun je later workspace settings beheren.
                  </p>
                </>
              )}
            </div>

            <div className="flex justify-end border-t border-slate-200 px-6 py-4">
              <button
                onClick={() => setModal(null)}
                className="rounded-lg bg-violet-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-600"
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