"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams, useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Project = {
  id: string;
  name: string;
  intake_method: "manual" | "csv" | "api" | null;
  project_code: string | null;
  description: string | null;
};

export default function Step1Page() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [projectTitle, setProjectTitle] = useState("");
  const [projectCode, setProjectCode] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    async function loadProject() {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, intake_method, project_code, description")
        .eq("id", projectId)
        .single();

      if (error) {
        setMessage("Could not load project.");
        setLoading(false);
        return;
      }

      setProject(data);
      setProjectTitle(data.name || "");
      setProjectCode(data.project_code || "");
      setDescription(data.description || "");
      setLoading(false);
    }

    if (projectId) loadProject();
  }, [projectId]);

  async function saveProject() {
    const { error } = await supabase
      .from("projects")
      .update({
        name: projectTitle,
        description: description || null,
      })
      .eq("id", projectId);

    return error;
  }

  async function handleSaveDraft() {
    setSaving(true);
    setMessage("");

    const error = await saveProject();

    if (error) {
      setMessage(error.message || "Could not save draft.");
      setSaving(false);
      return;
    }

    setMessage("Draft saved.");
    setSaving(false);
  }

  async function handleNext() {
    setSaving(true);
    setMessage("");

    const error = await saveProject();

    if (error) {
      setMessage(error.message || "Could not continue.");
      setSaving(false);
      return;
    }

    router.push(`/app/projects/${projectId}/intake/step-2`);
  }

  if (loading) {
    return (
      <section className="flex-1 bg-slate-50 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
            Loading step 1...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 bg-slate-50 py-16">
      <div className="mx-auto w-full max-w-3xl">

        {/* HEADER */}
        <div className="mb-10">
          <p className="text-sm font-semibold text-violet-600">
            Step 1 of 8
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
            Project Basics
          </h1>

          <p className="mt-2 text-slate-500">
            Start the manual intake for{" "}
            <span className="font-medium text-slate-700">
              {project?.name}
            </span>
          </p>

          {/* PROGRESS */}
          <div className="mt-6 flex items-center gap-6">
            <div className="h-3 flex-1 rounded-full bg-slate-200">
              <div className="h-3 w-[12%] rounded-full bg-violet-500" />
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
              10%
            </div>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
            {message}
          </div>
        )}

        {/* CARD */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

          <h2 className="text-xl font-semibold text-slate-900">
            Basic project information
          </h2>

          <p className="mt-1 mb-6 text-sm text-slate-500">
            Fill in the core details before continuing to the next intake step.
          </p>

          <div className="grid grid-cols-1 gap-6">

            {/* PROJECT NAME */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Project name
              </label>

              <input
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-violet-400 focus:bg-white"
              />
            </div>

            {/* CODE + METHOD */}
            <div className="grid grid-cols-2 gap-4">

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Project code
                </label>

                <input
                  value={projectCode}
                  readOnly
                  className="h-12 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 text-slate-500"
                />

                <p className="mt-1 text-xs text-slate-400">
                  Fixed code for internal reference
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Intake method
                </label>

                <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-slate-100 px-4 text-slate-600">
                  Manual
                </div>
              </div>

            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Short description
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                placeholder="Describe the project scope, stakeholders and context..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-violet-400 focus:bg-white"
              />
            </div>

          </div>

          {/* BUTTONS */}
          <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6">

            <button
              onClick={() => router.push("/app")}
              className="rounded-xl border border-slate-200 px-5 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Back to projects
            </button>

            <div className="flex gap-3">

              <button
                onClick={handleSaveDraft}
                disabled={saving}
                className="rounded-xl border border-slate-200 px-5 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                {saving ? "Saving..." : "Save draft"}
              </button>

              <button
                onClick={handleNext}
                disabled={saving}
                className="rounded-xl bg-violet-500 px-6 py-2 text-sm font-semibold text-white hover:bg-violet-600"
              >
                Next step
              </button>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}