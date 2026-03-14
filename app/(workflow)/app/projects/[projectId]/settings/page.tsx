"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  AlertTriangle,
  Loader2,
  RefreshCw,
  Save,
  Settings,
  Shield,
  Trash2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type ProjectStatus = "active" | "at_risk" | "high_risk" | "completed" | "on_hold";

type ProjectRecord = {
  id: string;
  name: string;
  status: ProjectStatus | null;
  description: string | null;
  workspace_id: string;
  updated_at?: string | null;
};

type SettingsFormState = {
  name: string;
  status: ProjectStatus;
  description: string;
};

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getStatusClasses(status: ProjectStatus | null | undefined) {
  switch (status) {
    case "active":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "at_risk":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "high_risk":
      return "bg-red-50 text-red-700 border-red-200";
    case "completed":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "on_hold":
      return "bg-slate-100 text-slate-700 border-slate-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

function formatStatusLabel(status: ProjectStatus | null | undefined) {
  switch (status) {
    case "active":
      return "Active";
    case "at_risk":
      return "At Risk";
    case "high_risk":
      return "High Risk";
    case "completed":
      return "Completed";
    case "on_hold":
      return "On Hold";
    default:
      return "Unknown";
  }
}

const defaultForm: SettingsFormState = {
  name: "",
  status: "active",
  description: "",
};

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [form, setForm] = useState<SettingsFormState>(defaultForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadProjectSettings() {
    setLoading(true);
    setErrorMessage(null);
    setSaveMessage(null);

    const { data, error } = await supabase
      .from("projects")
      .select("id, name, status, description, workspace_id, updated_at")
      .eq("id", projectId)
      .single();

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    const nextProject = data as ProjectRecord;
    setProject(nextProject);
    setForm({
      name: nextProject.name || "",
      status: (nextProject.status as ProjectStatus) || "active",
      description: nextProject.description || "",
    });
    setLoading(false);
  }

  useEffect(() => {
    if (projectId) {
      loadProjectSettings();
    }
  }, [projectId]);

  const hasChanges = useMemo(() => {
    if (!project) return false;

    return (
      form.name !== (project.name || "") ||
      form.status !== ((project.status as ProjectStatus) || "active") ||
      form.description !== (project.description || "")
    );
  }, [form, project]);

  async function handleSave() {
    if (!form.name.trim()) {
      setErrorMessage("Project name is required.");
      return;
    }

    setSaving(true);
    setErrorMessage(null);
    setSaveMessage(null);

    const payload = {
      name: form.name.trim(),
      status: form.status,
      description: form.description.trim() || null,
    };

    const { error } = await supabase
      .from("projects")
      .update(payload)
      .eq("id", projectId);

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    setSaveMessage("Project settings saved successfully.");
    await loadProjectSettings();
    setSaving(false);
  }

  async function handleArchiveProject() {
    setArchiving(true);
    setErrorMessage(null);
    setSaveMessage(null);

    const { error } = await supabase
      .from("projects")
      .update({ status: "on_hold" })
      .eq("id", projectId);

    if (error) {
      setErrorMessage(error.message);
      setArchiving(false);
      return;
    }

    setSaveMessage("Project moved to on hold.");
    await loadProjectSettings();
    setArchiving(false);
  }

  async function handleDeleteProject() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project? This will also remove linked risks, actions and stakeholders."
    );

    if (!confirmed) return;

    setDeleting(true);
    setErrorMessage(null);
    setSaveMessage(null);

    const { error } = await supabase.from("projects").delete().eq("id", projectId);

    if (error) {
      setErrorMessage(error.message);
      setDeleting(false);
      return;
    }

    router.push("/app");
  }

  if (loading) {
    return (
      <section className="p-8">
        <div className="flex min-h-[300px] items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white text-slate-500 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading settings...
        </div>
      </section>
    );
  }

  return (
    <section className="p-8">
      <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
            <Settings className="h-3.5 w-3.5" />
            Settings
          </div>

          <h1 className="mt-4 text-[38px] font-semibold tracking-tight text-slate-900">
            Project Settings
          </h1>
          <p className="mt-2 max-w-3xl text-[17px] text-slate-500">
            Manage the core project details, update the current project status and
            control lifecycle actions like putting a project on hold or deleting it.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={loadProjectSettings}
            className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>

          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#182B63] px-5 text-sm font-medium text-white shadow-sm transition hover:opacity-95 disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {errorMessage ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {saveMessage ? (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {saveMessage}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h3 className="text-xl font-semibold text-slate-900">
                Core Project Details
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Edit the basic project information that shapes the workspace.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Project name
                </label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter project name"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Project status
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      status: e.target.value as ProjectStatus,
                    }))
                  }
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
                >
                  <option value="active">Active</option>
                  <option value="at_risk">At Risk</option>
                  <option value="high_risk">High Risk</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Add a short description of the project..."
                  rows={6}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h3 className="text-xl font-semibold text-slate-900">
                Lifecycle Controls
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Control the state of this project when work slows down or ends.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <button
                onClick={handleArchiveProject}
                disabled={archiving}
                className="flex items-center justify-between rounded-2xl border border-slate-200 px-5 py-4 text-left transition hover:bg-slate-50 disabled:opacity-60"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Put project on hold
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Useful if work pauses or the project is temporarily inactive.
                  </p>
                </div>

                {archiving ? (
                  <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                ) : (
                  <Shield className="h-5 w-5 text-slate-400" />
                )}
              </button>

              <button
                onClick={handleDeleteProject}
                disabled={deleting}
                className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-left transition hover:bg-red-100 disabled:opacity-60"
              >
                <div>
                  <p className="text-sm font-semibold text-red-700">
                    Delete project
                  </p>
                  <p className="mt-1 text-sm text-red-600">
                    This removes the project and all linked operational data.
                  </p>
                </div>

                {deleting ? (
                  <Loader2 className="h-5 w-5 animate-spin text-red-500" />
                ) : (
                  <Trash2 className="h-5 w-5 text-red-500" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6 xl:col-span-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Current Project Status
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Live summary of the current project state
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Status
                </p>
                <span
                  className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                    form.status
                  )}`}
                >
                  {formatStatusLabel(form.status)}
                </span>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Last updated
                </p>
                <p className="mt-2 text-sm font-medium text-slate-900">
                  {formatDate(project?.updated_at)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Workspace ID
                </p>
                <p className="mt-2 break-all text-sm font-medium text-slate-900">
                  {project?.workspace_id || "—"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-slate-400" />
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Settings Guidance
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Keep this page operationally simple
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm leading-6 text-slate-600">
              <p>
                Use this page for core project metadata only, so the rest of the
                app stays focused on risks, actions, stakeholders and reporting.
              </p>
              <p>
                Later, you can expand this page with BIM/API integrations, project
                templates, review cadence defaults and AI generator settings.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5">
            <h3 className="text-lg font-semibold text-slate-900">
              Next build step
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              After this settings page works, the next smart move is rebuilding the
              main dashboard page with real project data and then layering the AI
              risk generator on top.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
