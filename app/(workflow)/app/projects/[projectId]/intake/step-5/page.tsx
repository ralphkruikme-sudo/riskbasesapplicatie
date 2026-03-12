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
  project_phase: string | null;
  key_milestones: string | null;
  critical_dependencies: string | null;
  planning_notes: string | null;
};

export default function Step5Page() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [projectPhase, setProjectPhase] = useState("");
  const [keyMilestones, setKeyMilestones] = useState("");
  const [criticalDependencies, setCriticalDependencies] = useState("");
  const [planningNotes, setPlanningNotes] = useState("");

  useEffect(() => {
    async function loadProject() {
      const { data, error } = await supabase
        .from("projects")
        .select(
          "id, name, project_phase, key_milestones, critical_dependencies, planning_notes"
        )
        .eq("id", projectId)
        .single();

      if (error) {
        setMessage("Could not load project.");
        setLoading(false);
        return;
      }

      setProject(data);
      setProjectPhase(data.project_phase || "");
      setKeyMilestones(data.key_milestones || "");
      setCriticalDependencies(data.critical_dependencies || "");
      setPlanningNotes(data.planning_notes || "");
      setLoading(false);
    }

    if (projectId) loadProject();
  }, [projectId]);

  async function saveStep() {
    const { error } = await supabase
      .from("projects")
      .update({
        project_phase: projectPhase || null,
        key_milestones: keyMilestones || null,
        critical_dependencies: criticalDependencies || null,
        planning_notes: planningNotes || null,
      })
      .eq("id", projectId);

    return error;
  }

  async function handleSaveDraft() {
    setSaving(true);
    setMessage("");

    const error = await saveStep();

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

    const error = await saveStep();

    if (error) {
      setMessage(error.message || "Could not continue.");
      setSaving(false);
      return;
    }

    router.push(`/app/projects/${projectId}/intake/step-6`);
  }

  if (loading) {
    return (
      <section className="flex-1 bg-slate-50 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
            Loading step 5...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 bg-slate-50 py-16">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-10">
          <p className="text-sm font-semibold text-violet-600">
            Step 5 of 8
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
            Project Phase & Planning
          </h1>

          <p className="mt-2 text-slate-500">
            Add the current phase and planning context for{" "}
            <span className="font-medium text-slate-700">
              {project?.name}
            </span>
            .
          </p>

          <div className="mt-6 flex items-center gap-6">
            <div className="h-3 flex-1 rounded-full bg-slate-200">
              <div className="h-3 w-[63%] rounded-full bg-violet-500" />
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
              63%
            </div>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
            {message}
          </div>
        )}

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Planning details
          </h2>

          <p className="mt-1 mb-6 text-sm text-slate-500">
            Everything in this step is optional. Add the most important planning details now and refine later.
          </p>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Current project phase
              </label>
              <select
                value={projectPhase}
                onChange={(e) => setProjectPhase(e.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-violet-400 focus:bg-white"
              >
                <option value="">Select project phase</option>
                <option value="tender">Tender</option>
                <option value="design">Design</option>
                <option value="preparation">Preparation</option>
                <option value="execution">Execution</option>
                <option value="delivery">Delivery</option>
                <option value="aftercare">Aftercare</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Key milestones
              </label>
              <textarea
                value={keyMilestones}
                onChange={(e) => setKeyMilestones(e.target.value)}
                rows={4}
                placeholder="For example: permit approval, design freeze, procurement start, site mobilization, commissioning..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-violet-400 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Critical dependencies
              </label>
              <textarea
                value={criticalDependencies}
                onChange={(e) => setCriticalDependencies(e.target.value)}
                rows={4}
                placeholder="For example: utility connection, supplier lead times, permits, weather windows, subcontractor availability..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-violet-400 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Planning notes
              </label>
              <textarea
                value={planningNotes}
                onChange={(e) => setPlanningNotes(e.target.value)}
                rows={4}
                placeholder="Add any other important planning context or sequencing notes..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-violet-400 focus:bg-white"
              />
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6">
            <button
              onClick={() => router.push(`/app/projects/${projectId}/intake/step-4`)}
              className="rounded-xl border border-slate-200 px-5 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Back
            </button>

            <div className="flex gap-3">
              <button
                onClick={handleSaveDraft}
                disabled={saving}
                className="rounded-xl border border-slate-200 px-5 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save draft"}
              </button>

              <button
                onClick={handleNext}
                disabled={saving}
                className="rounded-xl bg-violet-500 px-6 py-2 text-sm font-semibold text-white hover:bg-violet-600 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Next step"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}