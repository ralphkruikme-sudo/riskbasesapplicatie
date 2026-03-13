"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { ChevronDown, Search, X, FolderOpen, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Project = {
  id: string;
  name: string;
  status: "active" | "at_risk" | "high_risk" | "today";
  open_risks_count: number;
  updated_at: string;
  intake_method: "manual" | "csv" | "api" | null;
};

type WorkspaceRelation = {
  id: string;
  name: string | null;
  company_name: string | null;
  join_key: string | null;
};

type WorkspaceMembership = {
  workspace_id: string;
  role: string | null;
  workspaces: WorkspaceRelation[] | null;
};

function getStatusBadge(status: Project["status"]) {
  switch (status) {
    case "high_risk":
      return "bg-red-100 text-red-600";
    case "at_risk":
      return "bg-orange-100 text-orange-600";
    case "today":
      return "bg-cyan-100 text-cyan-700";
    default:
      return "bg-emerald-100 text-emerald-700";
  }
}

function getStatusLabel(status: Project["status"]) {
  switch (status) {
    case "high_risk":
      return "High Risk";
    case "at_risk":
      return "At Risk";
    case "today":
      return "Today";
    default:
      return "Active";
  }
}

function timeAgo(dateString: string) {
  const date = new Date(dateString).getTime();
  const now = Date.now();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

export default function ProjectsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingProject, setCreatingProject] = useState(false);
  const [message, setMessage] = useState("");

  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState<string>("");
  const [search, setSearch] = useState("");

  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [intakeMethod, setIntakeMethod] = useState<"manual" | "csv" | "api">(
    "manual"
  );

  const workspaceFromUrl = searchParams.get("workspace");

  useEffect(() => {
    async function loadProjects() {
      setLoading(true);
      setMessage("");

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          router.push("/auth");
          return;
        }

        const { data: memberships, error: membershipsError } = await supabase
          .from("workspace_members")
          .select(
            `
            workspace_id,
            role,
            workspaces (
              id,
              name,
              company_name,
              join_key
            )
            `
          )
          .eq("user_id", user.id);

        if (membershipsError) throw membershipsError;

        const membershipList = (memberships ?? []) as unknown as WorkspaceMembership[];

        if (membershipList.length === 0) {
          router.push("/onboarding");
          return;
        }

        const localStorageWorkspaceId =
          typeof window !== "undefined"
            ? localStorage.getItem("active_workspace_id")
            : null;

        const requestedWorkspaceId =
          workspaceFromUrl || localStorageWorkspaceId || null;

        let activeMembership: WorkspaceMembership | null = null;

        if (requestedWorkspaceId) {
          activeMembership =
            membershipList.find(
              (membership) => membership.workspace_id === requestedWorkspaceId
            ) ?? null;
        }

        if (!activeMembership) {
          activeMembership = membershipList[0];
        }

        if (!activeMembership?.workspace_id) {
          router.push("/onboarding");
          return;
        }

        const activeWorkspace = activeMembership.workspaces?.[0] ?? null;

        setWorkspaceId(activeMembership.workspace_id);
        setWorkspaceName(
          activeWorkspace?.name ||
            activeWorkspace?.company_name ||
            "Workspace"
        );

        if (typeof window !== "undefined") {
          localStorage.setItem("active_workspace_id", activeMembership.workspace_id);

          if (activeWorkspace) {
            localStorage.setItem(
              "active_workspace",
              JSON.stringify({
                id: activeWorkspace.id,
                name: activeWorkspace.name ?? "",
                company_name: activeWorkspace.company_name ?? "",
                join_key: activeWorkspace.join_key ?? "",
              })
            );
          }
        }

        if (workspaceFromUrl !== activeMembership.workspace_id) {
          router.replace(`/app?workspace=${activeMembership.workspace_id}`);
        }

        const { data: projectsData, error: projectsError } = await supabase
          .from("projects")
          .select("id, name, status, open_risks_count, updated_at, intake_method")
          .eq("workspace_id", activeMembership.workspace_id)
          .order("updated_at", { ascending: false });

        if (projectsError) throw projectsError;

        setProjects((projectsData ?? []) as Project[]);
      } catch (error: any) {
        setMessage(error?.message || "Could not load projects.");
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, [router, workspaceFromUrl]);

  function openCreateProjectModal() {
    setMessage("");
    setProjectName("");
    setIntakeMethod("manual");
    setShowCreateModal(true);
  }

  function closeCreateProjectModal() {
    if (creatingProject) return;
    setShowCreateModal(false);
  }

  async function handleCreateProject() {
    if (!workspaceId) return;

    setCreatingProject(true);
    setMessage("");

    try {
      const trimmedName = projectName.trim();

      if (!trimmedName) {
        throw new Error("Please enter a project name.");
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) throw new Error("No user found.");

      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({
          workspace_id: workspaceId,
          name: trimmedName,
          status: "active",
          open_risks_count: 0,
          created_by: user.id,
          intake_method: intakeMethod,
        })
        .select("id, name, status, open_risks_count, updated_at, intake_method")
        .single();

      if (projectError) throw projectError;
      if (!project) throw new Error("Project could not be created.");

      const { error: memberError } = await supabase
        .from("project_members")
        .insert({
          project_id: project.id,
          user_id: user.id,
          role: "owner",
        });

      if (memberError) throw memberError;

      setProjects((prev) => [project as Project, ...prev]);
      setShowCreateModal(false);

      if (intakeMethod === "manual") {
        router.push(`/app/projects/${project.id}/intake/step-1`);
        return;
      }

      if (intakeMethod === "csv") {
        router.push(`/app/projects/${project.id}/import/csv`);
        return;
      }

      if (intakeMethod === "api") {
        router.push(`/app/projects/${project.id}/import/api`);
        return;
      }
    } catch (error: any) {
      setMessage(error?.message || "Could not create project.");
    } finally {
      setCreatingProject(false);
    }
  }

  async function handleDeleteProject(projectId: string) {
    if (!confirm("Weet je zeker dat je dit project definitief wilt verwijderen?")) {
      return;
    }

    setDeletingProjectId(projectId);
    setMessage("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) throw new Error("No user found.");
      if (!workspaceId) throw new Error("No active workspace selected.");

      const { error: membersDeleteError } = await supabase
        .from("project_members")
        .delete()
        .eq("project_id", projectId);

      if (membersDeleteError) throw membersDeleteError;

      const { data: deletedProjects, error: projectDeleteError } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId)
        .eq("workspace_id", workspaceId)
        .select("id");

      if (projectDeleteError) throw projectDeleteError;

      if (!deletedProjects || deletedProjects.length === 0) {
        throw new Error(
          "Project was not deleted in Supabase. Check RLS policies or foreign key constraints."
        );
      }

      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      setMessage("Project deleted permanently.");
    } catch (error: any) {
      setMessage(error?.message || "Could not delete project.");
    } finally {
      setDeletingProjectId(null);
    }
  }

  const filteredProjects = useMemo(() => {
    return projects.filter((project) =>
      project.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [projects, search]);

  return (
    <section className="flex-1">
      <div className="border-b border-slate-200 bg-white px-8 py-8">
        <h1 className="text-[34px] font-semibold tracking-[-0.03em] text-slate-800">
          Projects
        </h1>
        <p className="mt-2 text-[16px] text-slate-500">
          Manage all projects in {workspaceName || "this workspace"}
        </p>
      </div>

      <div className="px-8 py-6">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full max-w-[420px]">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-[15px] text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>

          <button
            type="button"
            onClick={openCreateProjectModal}
            disabled={!workspaceId}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-violet-500 px-5 text-[16px] font-medium text-white transition hover:bg-violet-600 disabled:opacity-60"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
              <path d="M19 11H13V5h-2v6H5v2h6v6h2v-6h6z" />
            </svg>
            Add Project
            <ChevronDown className="h-4 w-4 text-white/90" />
          </button>
        </div>

        {message ? <p className="mb-4 text-sm text-red-500">{message}</p> : null}

        {loading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[220px] animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <h3 className="text-xl font-semibold text-slate-800">
              No projects yet
            </h3>
            <p className="mt-2 text-slate-500">
              Create your first project to start managing risks.
            </p>
            <button
              type="button"
              onClick={openCreateProjectModal}
              className="mt-5 inline-flex h-11 items-center rounded-xl bg-violet-500 px-5 text-white"
            >
              Create first project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start gap-4 p-5">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-100">
                    <img
                      src="/project-icon.png"
                      alt="Project"
                      className="h-12 w-12 object-contain"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[20px] font-semibold text-slate-800">
                      {project.name}
                    </h3>

                    <div className="mt-3 flex items-center gap-2">
                      <img
                        src="/avatar.png"
                        alt="Member"
                        className="h-8 w-8 rounded-full object-cover"
                      />
                      <img
                        src="/avatar.png"
                        alt="Member"
                        className="h-8 w-8 rounded-full object-cover"
                      />
                      <img
                        src="/avatar.png"
                        alt="Member"
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 px-5 py-4">
                  <div className="flex items-center gap-2 text-[16px] text-slate-700">
                    <span className="font-semibold">{project.open_risks_count}</span>
                    <span>Open Risks:</span>
                    <span
                      className={`rounded-lg px-2.5 py-1 text-[14px] font-medium ${getStatusBadge(
                        project.status
                      )}`}
                    >
                      {getStatusLabel(project.status)}
                    </span>
                  </div>

                  <p className="mt-2 text-[15px] text-slate-500">
                    Last updated: {timeAgo(project.updated_at)}
                  </p>

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/app/projects/${project.id}?workspace=${workspaceId}`
                        )
                      }
                      className="inline-flex h-11 items-center gap-2 rounded-xl bg-violet-500 px-4 text-sm font-semibold text-white transition hover:bg-violet-600"
                    >
                      <FolderOpen className="h-4 w-4" />
                      Open
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteProject(project.id)}
                      disabled={deletingProjectId === project.id}
                      className="inline-flex h-11 items-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      {deletingProjectId === project.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 px-4">
          <div className="w-full max-w-[560px] rounded-2xl border border-slate-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.20)]">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h3 className="text-2xl font-semibold text-slate-800">
                Intake Project
              </h3>

              <button
                onClick={closeCreateProjectModal}
                className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 px-6 py-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Project name
                </label>
                <input
                  type="text"
                  placeholder="Offshore Windfarm"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-[15px] text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Selected method
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    {
                      value: "manual",
                      label: "Manual",
                      icon: "/method-manual.png",
                    },
                    {
                      value: "csv",
                      label: "CSV",
                      icon: "/method-csv.png",
                    },
                    {
                      value: "api",
                      label: "API",
                      icon: "/method-api.png",
                    },
                  ].map((option) => {
                    const active = intakeMethod === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          setIntakeMethod(option.value as "manual" | "csv" | "api")
                        }
                        className={`flex flex-col items-center justify-center rounded-xl border px-4 py-4 transition ${
                          active
                            ? "border-violet-400 bg-violet-50"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <img
                          src={option.icon}
                          alt={option.label}
                          className="h-10 w-10 object-contain"
                        />
                        <span className="mt-3 text-sm font-medium text-slate-700">
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={closeCreateProjectModal}
                className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleCreateProject}
                disabled={creatingProject}
                className="rounded-lg bg-violet-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-600 disabled:opacity-60"
              >
                {creatingProject ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}