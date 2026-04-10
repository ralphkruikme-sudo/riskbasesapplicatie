"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  GitBranch,
  Loader2,
  Save,
} from "lucide-react";

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
  long_lead_items_present: boolean | null;
  execution_blockers: string | null;
  operational_handover_sensitivity: string | null;
  commissioning_complexity: string | null;
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

function fromNullableBoolean(value: boolean | null | undefined) {
  if (value === true) return "yes";
  if (value === false) return "no";
  return "";
}

function toNullableBoolean(value: string) {
  if (value === "yes") return true;
  if (value === "no") return false;
  return null;
}

function getPlanningSignal(input: {
  projectPhase: string;
  keyMilestones: string;
  criticalDependencies: string;
  planningNotes: string;
  longLeadItemsPresent: string;
  executionBlockers: string;
  operationalHandoverSensitivity: string;
  commissioningComplexity: string;
}) {
  const milestoneCount = countEntries(input.keyMilestones);
  const dependencyCount = countEntries(input.criticalDependencies);
  const blockerCount = countEntries(input.executionBlockers);

  if (
    blockerCount >= 2 ||
    input.operationalHandoverSensitivity === "high" ||
    input.commissioningComplexity === "high"
  ) {
    return "This project shows elevated execution-readiness, handover and commissioning pressure, which can materially increase delivery risk.";
  }

  if (
    input.longLeadItemsPresent === "yes" ||
    dependencyCount >= 4
  ) {
    return "This project already shows multiple critical dependencies or long-lead exposure. Expect higher planning slippage and milestone risk.";
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
  const params = useParams();
  const projectId = params?.projectId as string | undefined;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [projectPhase, setProjectPhase] = useState("");
  const [keyMilestones, setKeyMilestones] = useState("");
  const [criticalDependencies, setCriticalDependencies] = useState("");
  const [planningNotes, setPlanningNotes] = useState("");
  const [longLeadItemsPresent, setLongLeadItemsPresent] = useState("");
  const [executionBlockers, setExecutionBlockers] = useState("");
  const [operationalHandoverSensitivity, setOperationalHandoverSensitivity] =
    useState("medium");
  const [commissioningComplexity, setCommissioningComplexity] =
    useState("medium");

  const progress = 63;

  const milestoneCount = useMemo(
    () => countEntries(keyMilestones),
    [keyMilestones]
  );

  const dependencyCount = useMemo(
    () => countEntries(criticalDependencies),
    [criticalDependencies]
  );

  const blockerCount = useMemo(
    () => countEntries(executionBlockers),
    [executionBlockers]
  );

  const planningSignal = useMemo(() => {
    return getPlanningSignal({
      projectPhase,
      keyMilestones,
      criticalDependencies,
      planningNotes,
      longLeadItemsPresent,
      executionBlockers,
      operationalHandoverSensitivity,
      commissioningComplexity,
    });
  }, [
    projectPhase,
    keyMilestones,
    criticalDependencies,
    planningNotes,
    longLeadItemsPresent,
    executionBlockers,
    operationalHandoverSensitivity,
    commissioningComplexity,
  ]);

  useEffect(() => {
    async function loadProject() {
      try {
        setLoading(true);
        setMessage("");

        if (!projectId) {
          throw new Error("Missing project id.");
        }

        const { data, error } = await supabase
          .from("projects")
          .select(
            "id, name, project_phase, key_milestones, critical_dependencies, planning_notes, long_lead_items_present, execution_blockers, operational_handover_sensitivity, commissioning_complexity"
          )
          .eq("id", projectId)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Project not found.");

        const loaded = data as Project;

        setProject(loaded);
        setProjectPhase(loaded.project_phase || "");
        setKeyMilestones(loaded.key_milestones || "");
        setCriticalDependencies(loaded.critical_dependencies || "");
        setPlanningNotes(loaded.planning_notes || "");
        setLongLeadItemsPresent(fromNullableBoolean(loaded.long_lead_items_present));
        setExecutionBlockers(loaded.execution_blockers || "");
        setOperationalHandoverSensitivity(
          loaded.operational_handover_sensitivity || "medium"
        );
        setCommissioningComplexity(
          loaded.commissioning_complexity || "medium"
        );
      } catch (error: any) {
        setProject(null);
        setMessage(error?.message || "Could not load project.");
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [projectId]);

  async function saveStep() {
    if (!projectId) {
      return { message: "Missing project id." };
    }

    const { error } = await supabase
      .from("projects")
      .update({
        project_phase: projectPhase || null,
        key_milestones: keyMilestones.trim() || null,
        critical_dependencies: criticalDependencies.trim() || null,
        planning_notes: planningNotes.trim() || null,
        long_lead_items_present: toNullableBoolean(longLeadItemsPresent),
        execution_blockers: executionBlockers.trim() || null,
        operational_handover_sensitivity:
          operationalHandoverSensitivity || null,
        commissioning_complexity: commissioningComplexity || null,
        updated_at: new Date().toISOString(),
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
      <section className="min-h-screen bg-[#F4F7FB] px-6 py-10">
        <div className="mx-auto max-w-[1160px]">
          <div className="rounded-[28px] border border-[#D8E1EC] bg-white p-8 shadow-[0_12px_32px_rgba(15,23,42,0.05)]">
            <p className="text-sm font-medium text-[#4B5B73]">Loading step 5...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!project) {
    return (
      <section className="min-h-screen bg-[#F4F7FB] px-6 py-10">
        <div className="mx-auto max-w-[1160px]">
          <div className="rounded-[28px] border border-[#D8E1EC] bg-white p-8 shadow-[0_12px_32px_rgba(15,23,42,0.05)]">
            <h1 className="text-2xl font-semibold tracking-tight text-[#0F172A]">
              Project not found
            </h1>
            <p className="mt-2 text-sm text-[#4B5B73]">
              {message || "We could not load this project for the intake flow."}
            </p>

            <button
              onClick={() => router.push("/app")}
              className="mt-6 inline-flex h-11 items-center rounded-2xl border border-[#D8E1EC] bg-white px-5 text-sm font-medium text-[#1E293B] transition hover:bg-[#F8FAFC]"
            >
              Back to projects
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#F4F7FB] px-6 py-10">
      <div className="mx-auto w-full max-w-[1160px]">
        <div className="mb-8">
          <p className="text-sm font-semibold tracking-[0.02em] text-[#2457FF]">
            Step 5 of 8
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-[#081226] md:text-[52px]">
            Delivery context
          </h1>

          <p className="mt-4 max-w-4xl text-[15px] leading-7 text-[#4B5B73]">
            Add the current phase, milestones and dependencies for{" "}
            <span className="font-semibold text-[#0F172A]">
              {project.name || "this project"}
            </span>
            . This is one of the strongest inputs for initial baseline risk generation.
          </p>

          <div className="mt-8 flex items-center gap-4">
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#DCE4EE]">
              <div
                className="h-full rounded-full bg-[#2457FF] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex h-11 min-w-[74px] items-center justify-center rounded-2xl border border-[#D8E1EC] bg-white px-4 text-sm font-semibold text-[#0F172A]">
              {progress}%
            </div>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-[22px] border border-[#D8E1EC] bg-white px-5 py-4 text-sm text-[#4B5B73] shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            {message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="rounded-[32px] border border-[#D8E1EC] bg-white p-8 shadow-[0_14px_36px_rgba(15,23,42,0.05)] md:p-10">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#C9D8FF] bg-[#EEF4FF] px-3 py-1 text-xs font-semibold text-[#2457FF]">
                <GitBranch className="h-4 w-4" />
                Planning intelligence
              </div>

              <h2 className="mt-4 text-[30px] font-semibold tracking-[-0.03em] text-[#081226]">
                Phase, milestones and dependencies
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#4B5B73]">
                Add the most important delivery context now. RiskBases can use this
                to detect milestone pressure, external dependencies, handover sensitivity and sequencing risk.
              </p>
            </div>

            <div className="grid gap-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Current project phase
                </label>

                <select
                  value={projectPhase}
                  onChange={(e) => setProjectPhase(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
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
                  <label className="block text-sm font-medium text-[#1E293B]">
                    Key milestones
                  </label>
                  <span className="text-xs font-medium text-[#6B7A90]">
                    {milestoneCount} listed
                  </span>
                </div>

                <textarea
                  value={keyMilestones}
                  onChange={(e) => setKeyMilestones(e.target.value)}
                  rows={5}
                  placeholder="For example: permit approval, design freeze, procurement start, site mobilization, commissioning"
                  className="w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 py-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                />

                <p className="mt-2 text-xs leading-5 text-[#6B7A90]">
                  Add milestones separated by commas or new lines.
                </p>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <label className="block text-sm font-medium text-[#1E293B]">
                    Critical dependencies
                  </label>
                  <span className="text-xs font-medium text-[#6B7A90]">
                    {dependencyCount} listed
                  </span>
                </div>

                <textarea
                  value={criticalDependencies}
                  onChange={(e) => setCriticalDependencies(e.target.value)}
                  rows={5}
                  placeholder="For example: utility connection, permits, supplier lead times, weather windows, subcontractor availability"
                  className="w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 py-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                />

                <p className="mt-2 text-xs leading-5 text-[#6B7A90]">
                  List the dependencies most likely to affect schedule, access or delivery continuity.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                    Long lead items present?
                  </label>
                  <select
                    value={longLeadItemsPresent}
                    onChange={(e) => setLongLeadItemsPresent(e.target.value)}
                    className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                  >
                    <option value="">Unknown / not set</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                    Commissioning complexity
                  </label>
                  <select
                    value={commissioningComplexity}
                    onChange={(e) => setCommissioningComplexity(e.target.value)}
                    className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <label className="block text-sm font-medium text-[#1E293B]">
                    Execution blockers
                  </label>
                  <span className="text-xs font-medium text-[#6B7A90]">
                    {blockerCount} listed
                  </span>
                </div>

                <textarea
                  value={executionBlockers}
                  onChange={(e) => setExecutionBlockers(e.target.value)}
                  rows={4}
                  placeholder="For example: permit approval pending, IFC drawings incomplete, survey missing, procurement not released"
                  className="w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 py-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Operational handover sensitivity
                </label>

                <select
                  value={operationalHandoverSensitivity}
                  onChange={(e) => setOperationalHandoverSensitivity(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Planning notes
                </label>

                <textarea
                  value={planningNotes}
                  onChange={(e) => setPlanningNotes(e.target.value)}
                  rows={5}
                  placeholder="Add sequencing notes, schedule concerns or context that should inform the initial risk baseline"
                  className="w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 py-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                />
              </div>
            </div>

            <div className="mt-8 rounded-[24px] border border-[#D8E1EC] bg-[#F8FAFC] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7A90]">
                Planning signal
              </p>
              <p className="mt-2 text-sm font-medium text-[#0F172A]">
                {planningSignal}
              </p>
            </div>

            <div className="mt-10 flex flex-col gap-3 border-t border-[#E2E8F0] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={() => router.push(`/intake/${projectId}/step-4`)}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-[#D8E1EC] bg-white px-5 text-sm font-medium text-[#1E293B] transition hover:bg-[#F8FAFC]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={handleSaveDraft}
                  disabled={saving}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-[#D8E1EC] bg-white px-5 text-sm font-medium text-[#1E293B] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {saving ? "Saving..." : "Save draft"}
                </button>

                <button
                  onClick={handleNext}
                  disabled={saving}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#2457FF] px-6 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(36,87,255,0.22)] transition hover:bg-[#1D4BE0] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                  {saving ? "Saving..." : "Next step"}
                </button>
              </div>
            </div>
          </div>

          <aside className="h-fit rounded-[32px] border border-[#D8E1EC] bg-white p-7 shadow-[0_14px_36px_rgba(15,23,42,0.05)]">
            <h3 className="text-xl font-semibold tracking-tight text-[#081226]">
              Why this step matters
            </h3>
            <p className="mt-3 text-sm leading-6 text-[#4B5B73]">
              Delivery context is one of the strongest predictors of which baseline
              risks will actually matter first.
            </p>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl bg-[#F8FAFC] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7A90]">
                  Used for
                </p>
                <p className="mt-2 text-sm font-medium text-[#0F172A]">
                  Milestone and sequencing risk detection
                </p>
              </div>

              <div className="rounded-2xl bg-[#F8FAFC] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7A90]">
                  Used for
                </p>
                <p className="mt-2 text-sm font-medium text-[#0F172A]">
                  Dependency-based baseline generation
                </p>
              </div>

              <div className="rounded-2xl bg-[#F8FAFC] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7A90]">
                  Used for
                </p>
                <p className="mt-2 text-sm font-medium text-[#0F172A]">
                  Better project-specific AI suggestions
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-[24px] border border-[#DCE7FF] bg-[#F7FAFF] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2457FF]">
                Step rule
              </p>
              <p className="mt-3 text-sm leading-6 text-[#36506C]">
                Keep this step focused on delivery logic only. No commercial data,
                no site conditions and no stakeholder duplication.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}