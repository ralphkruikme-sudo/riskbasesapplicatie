"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams, useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Project = {
  id: string;
  name: string | null;
  project_phase: string | null;
  key_milestones: string | null;
  critical_dependencies: string | null;
  planning_notes: string | null;
};

const PROJECT_PHASE_OPTIONS = [
  { value: "tender", label: "Tender" },
  { value: "design", label: "Design" },
  { value: "preparation", label: "Preparation" },
  { value: "execution", label: "Execution" },
  { value: "delivery", label: "Delivery" },
  { value: "aftercare", label: "Aftercare" },
];

function countEntries(value: string) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean).length;
}

function getPlanningSignal(input: {
  projectPhase: string;
  keyMilestones: string;
  criticalDependencies: string;
  planningNotes: string;
}) {
  const milestoneCount = countEntries(input.keyMilestones);
  const dependencyCount = countEntries(input.criticalDependencies);

  if (dependencyCount >= 4) {
    return "This project already shows multiple critical dependencies. Expect higher exposure to planning slippage, coordination gaps and milestone risk.";
  }

  if (input.projectPhase === "execution" && dependencyCount > 0) {
    return "Projects already in execution with unresolved dependencies often face higher delivery, sequencing and interface risk.";
  }

  if (milestoneCount >= 3) {
    return "A denser milestone structure usually increases schedule sensitivity and dependency-driven risk exposure.";
  }

  if (input.planningNotes.trim()) {
    return "The added planning context helps RiskBases generate more project-specific baseline risks.";
  }

  return "Planning context helps RiskBases identify sequencing, milestone and dependency-related risk patterns.";
}

export default function Step5Page() {
  const router = useRouter();
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [projectPhase, setProjectPhase] = useState("");
  const [keyMilestones, setKeyMilestones] = useState("");
  const [criticalDependencies, setCriticalDependencies] = useState("");
  const [planningNotes, setPlanningNotes] = useState("");

  const progress = 63;

  const milestoneCount = useMemo(
    () => countEntries(keyMilestones),
    [keyMilestones]
  );

  const dependencyCount = useMemo(
    () => countEntries(criticalDependencies),
    [criticalDependencies]
  );

  const planningSignal = useMemo(() => {
    return getPlanningSignal({
      projectPhase,
      keyMilestones,
      criticalDependencies,
      planningNotes,
    });
  }, [projectPhase, keyMilestones, criticalDependencies, planningNotes]);

  useEffect(() => {
    async function loadProject() {
      try {
        setLoading(true);
        setMessage("");

        const { data, error } = await supabase
          .from("projects")
          .select(
            "id, name, project_phase, key_milestones, critical_dependencies, planning_notes"
          )
          .eq("id", projectId)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Project not found.");

        setProject(data);
        setProjectPhase(data.project_phase || "");
        setKeyMilestones(data.key_milestones || "");
        setCriticalDependencies(data.critical_dependencies || "");
        setPlanningNotes(data.planning_notes || "");
      } catch (error: any) {
        setProject(null);
        setMessage(error?.message || "Could not load project.");
      } finally {
        setLoading(false);
      }
    }

    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  async function saveStep() {
    const { error } = await supabase
      .from("projects")
      .update({
        project_phase: projectPhase || null,
        key_milestones: keyMilestones.trim() || null,
        critical_dependencies: criticalDependencies.trim() || null,
        planning_notes: planningNotes.trim() || null,
      })
      .eq("id", projectId);

    return error;
  }

  async function handleSaveDraft() {
    try {
      setSaving(true);
      setMessage("");

      const error = await saveStep();
      if (error) throw error;

      setMessage("Draft saved.");
    } catch (error: any) {
      setMessage(error?.message || "Could not save draft.");
    } finally {
      setSaving(false);
    }
  }

  async function handleNext() {
    try {
      setSaving(true);
      setMessage("");

      const error = await saveStep();
      if (error) throw error;

      router.push(`/intake/${projectId}/step-6`);
    } catch (error: any) {
      setMessage(error?.message || "Could not continue.");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="min-h-screen bg-[#f5f7fb] px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[28px] border border-slate-200/80 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <p className="text-sm text-slate-600">Loading step 5...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!project) {
    return (
      <section className="min-h-screen bg-[#f5f7fb] px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[28px] border border-slate-200/80 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
              Project not found
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {message || "We could not load this project for the intake flow."}
            </p>

            <button
              onClick={() => router.push("/app")}
              className="mt-6 inline-flex h-11 items-center rounded-2xl border border-slate-200 px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Back to projects
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#f5f7fb] px-6 py-12">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8">
          <p className="text-sm font-semibold text-violet-600">Step 5 of 8</p>

          <h1 className="mt-3 text-5xl font-semibold tracking-[-0.04em] text-slate-950">
            Delivery context
          </h1>

          <p className="mt-3 max-w-3xl text-[15px] leading-7 text-slate-600">
            Add the current phase, milestones and dependencies for{" "}
            <span className="font-medium text-slate-800">
              {project?.name || "this project"}
            </span>
            . This is one of the strongest inputs for initial baseline risk generation.
          </p>

          <div className="mt-8 flex items-center gap-5">
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-violet-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex h-12 min-w-[88px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800">
              {progress}%
            </div>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            {message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-[32px] border border-slate-200/80 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.04)] md:p-10">
            <div className="mb-8">
              <div className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                Planning intelligence
              </div>

              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
                Phase, milestones and dependencies
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Add the most important delivery context now. RiskBases can use this
                to detect milestone pressure, external dependencies and sequencing risk.
              </p>
            </div>

            <div className="grid gap-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Current project phase
                </label>

                <select
                  value={projectPhase}
                  onChange={(e) => setProjectPhase(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 text-[15px] text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
                >
                  <option value="">Select project phase</option>
                  {PROJECT_PHASE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <label className="block text-sm font-medium text-slate-800">
                    Key milestones
                  </label>
                  <span className="text-xs font-medium text-slate-500">
                    {milestoneCount} listed
                  </span>
                </div>

                <textarea
                  value={keyMilestones}
                  onChange={(e) => setKeyMilestones(e.target.value)}
                  rows={5}
                  placeholder="For example: permit approval, design freeze, procurement start, site mobilization, commissioning"
                  className="w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-4 text-[15px] text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
                />

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Add milestones separated by commas or new lines.
                </p>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <label className="block text-sm font-medium text-slate-800">
                    Critical dependencies
                  </label>
                  <span className="text-xs font-medium text-slate-500">
                    {dependencyCount} listed
                  </span>
                </div>

                <textarea
                  value={criticalDependencies}
                  onChange={(e) => setCriticalDependencies(e.target.value)}
                  rows={5}
                  placeholder="For example: utility connection, permits, supplier lead times, weather windows, subcontractor availability"
                  className="w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-4 text-[15px] text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
                />

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  List the dependencies most likely to affect schedule, access or delivery continuity.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Planning notes
                </label>

                <textarea
                  value={planningNotes}
                  onChange={(e) => setPlanningNotes(e.target.value)}
                  rows={5}
                  placeholder="Add any additional sequencing notes, schedule concerns or context that should inform the initial risk baseline"
                  className="w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-4 text-[15px] text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
                />
              </div>
            </div>

            <div className="mt-8 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                Planning signal
              </p>
              <p className="mt-2 text-sm font-medium text-slate-800">
                {planningSignal}
              </p>
            </div>

            <div className="mt-10 flex items-center justify-between border-t border-slate-200 pt-6">
              <button
                onClick={() => router.push(`/intake/${projectId}/step-4`)}
                className="inline-flex h-12 items-center rounded-2xl border border-slate-200 px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Back
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveDraft}
                  disabled={saving}
                  className="inline-flex h-12 items-center rounded-2xl border border-slate-200 px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save draft"}
                </button>

                <button
                  onClick={handleNext}
                  disabled={saving}
                  className="inline-flex h-12 items-center rounded-2xl bg-violet-500 px-6 text-sm font-semibold text-white transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Next step"}
                </button>
              </div>
            </div>
          </div>

          <aside className="h-fit rounded-[32px] border border-slate-200/80 bg-white p-7 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <h3 className="text-lg font-semibold text-slate-950">Why this step matters</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Delivery context is one of the strongest predictors of which baseline risks will actually matter first.
            </p>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Used for
                </p>
                <p className="mt-2 text-sm text-slate-800">
                  Milestone and sequencing risk detection
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Used for
                </p>
                <p className="mt-2 text-sm text-slate-800">
                  Dependency-based baseline generation
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Used for
                </p>
                <p className="mt-2 text-sm text-slate-800">
                  Better project-specific AI suggestions
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}