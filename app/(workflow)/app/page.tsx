"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { ChevronDown, Search, X, FolderOpen, Trash2, Plus } from "lucide-react";
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

// Generate a consistent color + emoji for each project based on its name
const PROJECT_COLORS = [
  { bg: "bg-violet-100", text: "text-violet-700", border: "border-violet-200" },
  { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
  { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
  { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
  { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-200" },
  { bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-200" },
  { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200" },
  { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" },
];

const PROJECT_EMOJIS = ["🏗️", "⚓", "🌊", "🏢", "🔋", "🚢", "🌐", "📡", "🏭", "🛢️", "⚡", "🔩"];

function getProjectStyle(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  }
  const colorIndex = Math.abs(hash) % PROJECT_COLORS.length;
  const emojiIndex = Math.abs(hash >> 3) % PROJECT_EMOJIS.length;
  return {
    color: PROJECT_COLORS[colorIndex],
    emoji: PROJECT_EMOJIS[emojiIndex],
  };
}

function getStatusBadge(status: Project["status"]) {
  switch (status) {
    case "high_risk":
      return "bg-red-100 text-red-600 border border-red-200";
    case "at_risk":
      return "bg-orange-100 text-orange-600 border border-orange-200";
    case "today":
      return "bg-cyan-100 text-cyan-700 border border-cyan-200";
    default:
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
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

function getStatusDot(status: Project["status"]) {
  switch (status) {
    case "high_risk":
      return "bg-red-500";
    case "at_risk":
      return "bg-orange-500";
    case "today":
      return "bg-cyan-500";
    default:
      return "bg-emerald-500";
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

// Project icon component — emoji-based, no broken images
function ProjectIcon({ name, size = "lg" }: { name: string; size?: "sm" | "lg" }) {
  const { color, emoji } = getProjectStyle(name);
  const dim = size === "lg" ? "h-14 w-14 text-2xl" : "h-10 w-10 text-base";
  return (
    <div
      className={`${dim} ${color.bg} ${color.border} shrink-0 flex items-center justify-center rounded-2xl border font-medium select-none`}
    >
      {emoji}
    </div>
  );
}

function ProjectsPageContent() {
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
  const [intakeMethod, setIntakeMethod] = useState<"manual" | "csv" | "api">("manual");

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
    <section className="flex-1 bg-[#f7f7fb]">
      {/* Page header */}
      <div className="border-b border-slate-200 bg-white px-8 py-7">
        <h1 className="text-[32px] font-bold tracking-[-0.03em] text-slate-900">
          Projects
        </h1>
        <p className="mt-1 text-[15px] text-slate-500">
          Manage all projects in {workspaceName || "this workspace"}
        </p>
      </div>

      <div className="px-8 py-6">
        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full max-w-[400px]">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 shadow-sm outline-none placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <button
            type="button"
            onClick={openCreateProjectModal}
            disabled={!workspaceId}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 active:scale-[0.98] disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            Add Project
          </button>
        </div>

        {message ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {message}
          </div>
        ) : null}

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[200px] animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
              🏗️
            </div>
            <h3 className="text-xl font-semibold text-slate-800">
              No projects yet
            </h3>
            <p className="mt-2 text-slate-500">
              Create your first project to start managing risks.
            </p>
            <button
              type="button"
              onClick={openCreateProjectModal}
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white transition hover:bg-violet-700"
            >
              <Plus className="h-4 w-4" />
              Create first project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-slate-300"
              >
                {/* Card top */}
                <div className="flex items-start gap-4 p-5 pb-4">
                  <ProjectIcon name={project.name} />

                  <div className="min-w-0 flex-1 pt-0.5">
                    <h3 className="truncate text-[18px] font-bold text-slate-900 leading-tight">
                      {project.name}
                    </h3>
                    <p className="mt-1 text-[13px] text-slate-400">
                      {timeAgo(project.updated_at)}
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="mx-5 border-t border-slate-100" />

                {/* Stats */}
                <div className="px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[22px] font-bold text-slate-900">
                        {project.open_risks_count}
                      </span>
                      <span className="text-sm text-slate-500">open risks</span>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(
                        project.status
                      )}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${getStatusDot(project.status)}`}
                      />
                      {getStatusLabel(project.status)}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3">
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/app/projects/${project.id}?workspace=${workspaceId}`
                      )
                    }
                    className="inline-flex flex-1 h-9 items-center justify-center gap-1.5 rounded-lg bg-violet-600 px-3 text-sm font-semibold text-white transition hover:bg-violet-700 active:scale-[0.98]"
                  >
                    <FolderOpen className="h-3.5 w-3.5" />
                    Open
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteProject(project.id)}
                    disabled={deletingProjectId === project.id}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {deletingProjectId === project.id ? "..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── CREATE PROJECT MODAL ─── */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeCreateProjectModal();
          }}
        >
          <div className="w-full max-w-[520px] rounded-2xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  New Project
                </h3>
                <p className="mt-0.5 text-sm text-slate-500">
                  Set up your project in seconds
                </p>
              </div>
              <button
                onClick={closeCreateProjectModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5 px-6 py-6">
              {/* Project name */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Project name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Offshore Windfarm Rotterdam"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  autoFocus
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-[15px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
                />
                {/* Preview icon */}
                {projectName.trim() && (
                  <div className="mt-3 flex items-center gap-3">
                    <ProjectIcon name={projectName.trim()} size="sm" />
                    <span className="text-sm text-slate-500">
                      Project icon preview
                    </span>
                  </div>
                )}
              </div>

              {/* Intake method */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  How do you want to add risks?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      value: "manual",
                      label: "Manual",
                      emoji: "✍️",
                      desc: "Enter risks one by one",
                    },
                    {
                      value: "csv",
                      label: "CSV Import",
                      emoji: "📄",
                      desc: "Upload a spreadsheet",
                    },
                    {
                      value: "api",
                      label: "API",
                      emoji: "🔌",
                      desc: "Connect via API",
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
                        className={`flex flex-col items-center rounded-xl border p-4 text-center transition ${
                          active
                            ? "border-violet-400 bg-violet-50 shadow-sm"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <span className="text-2xl">{option.emoji}</span>
                        <span
                          className={`mt-2 text-sm font-semibold ${
                            active ? "text-violet-700" : "text-slate-700"
                          }`}
                        >
                          {option.label}
                        </span>
                        <span className="mt-0.5 text-[11px] text-slate-400 leading-tight">
                          {option.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {message && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
                  {message}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button
                type="button"
                onClick={closeCreateProjectModal}
                className="h-10 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCreateProject}
                disabled={creatingProject || !projectName.trim()}
                className="h-10 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white transition hover:bg-violet-700 active:scale-[0.98] disabled:opacity-60"
              >
                {creatingProject ? "Creating..." : "Create Project →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-500">Loading projects...</div>}>
      <ProjectsPageContent />
    </Suspense>
  );
}
