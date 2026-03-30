"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams, useRouter } from "next/navigation";
import {
  CalendarRange,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Save,
  Wallet,
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Project = {
  id: string;
  name: string | null;
  project_value: string | null;
  start_date: string | null;
  end_date: string | null;
  budget_confidence: string | null;
  schedule_pressure: string | null;
  deadline_criticality: string | null;
  procurement_lead_risk: string | null;
  phasing_complexity: string | null;
  access_window_constraints: string | null;
  working_hour_restrictions: string | null;
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function formatEuroFromDigits(value: string) {
  if (!value) return "";
  return new Intl.NumberFormat("en-GB").format(Number(value));
}

function normalizeDateValue(value: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

function calculateDurationDays(startDate: string, endDate: string) {
  if (!startDate || !endDate) return null;

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;

  const diffMs = end.getTime() - start.getTime();
  if (diffMs < 0) return -1;

  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function calculateDurationLabel(startDate: string, endDate: string) {
  if (!startDate || !endDate) return "Add a planned start and end date to estimate delivery duration.";

  const diffDays = calculateDurationDays(startDate, endDate);

  if (diffDays === null) return "Add valid dates to estimate delivery duration.";
  if (diffDays < 0) return "End date is earlier than the start date.";

  const diffWeeks = Math.round((diffDays / 7) * 10) / 10;
  const diffMonths = Math.round((diffDays / 30.4) * 10) / 10;

  if (diffDays < 21) return `Estimated duration: ${diffDays} days`;
  if (diffDays < 120) return `Estimated duration: ${diffWeeks} weeks`;
  return `Estimated duration: ${diffMonths} months`;
}

function buildPlanningSignal(params: {
  startDate: string;
  endDate: string;
  schedulePressure: string;
  deadlineCriticality: string;
  procurementLeadRisk: string;
  phasingComplexity: string;
  accessWindowConstraints: string;
  workingHourRestrictions: string;
}) {
  const {
    startDate,
    endDate,
    schedulePressure,
    deadlineCriticality,
    procurementLeadRisk,
    phasingComplexity,
    accessWindowConstraints,
    workingHourRestrictions,
  } = params;

  const diffDays = calculateDurationDays(startDate, endDate);

  if (diffDays === -1) {
    return "The end date is before the start date. Fix the schedule window first.";
  }

  if (
    schedulePressure === "high" ||
    deadlineCriticality === "high" ||
    procurementLeadRisk === "high"
  ) {
    return "This commercial and planning profile indicates elevated baseline exposure for schedule, coordination and procurement risks.";
  }

  if (
    phasingComplexity === "high" ||
    accessWindowConstraints === "high" ||
    workingHourRestrictions === "high"
  ) {
    return "This delivery setup suggests additional sequencing and operational planning risk.";
  }

  if (typeof diffDays === "number" && diffDays > 365) {
    return "A longer delivery horizon may increase scope drift, coordination and interface risk.";
  }

  if (typeof diffDays === "number" && diffDays > 0 && diffDays < 90) {
    return "A compressed delivery window can increase schedule, approval and procurement pressure.";
  }

  return "This planning profile currently suggests a moderate baseline with standard delivery exposure.";
}

export default function Step2Page() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.projectId as string | undefined;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [projectValueRaw, setProjectValueRaw] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budgetConfidence, setBudgetConfidence] = useState("medium");
  const [schedulePressure, setSchedulePressure] = useState("medium");
  const [deadlineCriticality, setDeadlineCriticality] = useState("medium");
  const [procurementLeadRisk, setProcurementLeadRisk] = useState("medium");
  const [phasingComplexity, setPhasingComplexity] = useState("medium");
  const [accessWindowConstraints, setAccessWindowConstraints] = useState("low");
  const [workingHourRestrictions, setWorkingHourRestrictions] = useState("low");

  const progress = 25;

  const formattedBudget = useMemo(() => {
    return formatEuroFromDigits(projectValueRaw);
  }, [projectValueRaw]);

  const durationLabel = useMemo(() => {
    return calculateDurationLabel(startDate, endDate);
  }, [startDate, endDate]);

  const planningSignal = useMemo(() => {
    return buildPlanningSignal({
      startDate,
      endDate,
      schedulePressure,
      deadlineCriticality,
      procurementLeadRisk,
      phasingComplexity,
      accessWindowConstraints,
      workingHourRestrictions,
    });
  }, [
    startDate,
    endDate,
    schedulePressure,
    deadlineCriticality,
    procurementLeadRisk,
    phasingComplexity,
    accessWindowConstraints,
    workingHourRestrictions,
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
          .select(`
            id,
            name,
            project_value,
            start_date,
            end_date,
            budget_confidence,
            schedule_pressure,
            deadline_criticality,
            procurement_lead_risk,
            phasing_complexity,
            access_window_constraints,
            working_hour_restrictions
          `)
          .eq("id", projectId)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Project not found.");

        const loaded = data as Project;

        setProject(loaded);
        setProjectValueRaw(loaded.project_value || "");
        setStartDate(normalizeDateValue(loaded.start_date));
        setEndDate(normalizeDateValue(loaded.end_date));
        setBudgetConfidence(loaded.budget_confidence || "medium");
        setSchedulePressure(loaded.schedule_pressure || "medium");
        setDeadlineCriticality(loaded.deadline_criticality || "medium");
        setProcurementLeadRisk(loaded.procurement_lead_risk || "medium");
        setPhasingComplexity(loaded.phasing_complexity || "medium");
        setAccessWindowConstraints(loaded.access_window_constraints || "low");
        setWorkingHourRestrictions(loaded.working_hour_restrictions || "low");
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
        project_value: projectValueRaw || null,
        start_date: startDate || null,
        end_date: endDate || null,
        budget_confidence: budgetConfidence || null,
        schedule_pressure: schedulePressure || null,
        deadline_criticality: deadlineCriticality || null,
        procurement_lead_risk: procurementLeadRisk || null,
        phasing_complexity: phasingComplexity || null,
        access_window_constraints: accessWindowConstraints || null,
        working_hour_restrictions: workingHourRestrictions || null,
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

      router.push(`/intake/${projectId}/step-3`);
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
            <p className="text-sm text-slate-600">Loading Step 2...</p>
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
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-semibold text-violet-600">Step 2 of 8</p>

          <h1 className="mt-3 text-5xl font-semibold tracking-[-0.04em] text-slate-950">
            Commercial & schedule context
          </h1>

          <p className="mt-3 max-w-4xl text-[15px] leading-7 text-slate-600">
            Add the commercial and planning context for{" "}
            <span className="font-medium text-slate-800">
              {project.name || "this project"}
            </span>
            . This helps RiskBases understand delivery scale, timeline pressure and
            early procurement exposure.
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
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                <Wallet className="h-4 w-4" />
                Planning profile
              </div>

              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
                Budget, timeline and delivery pressure
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                This step should stay structured and commercial. No stakeholder fields,
                no site fields, no long text areas.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Project value / budget
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    €
                  </span>

                  <input
                    value={formattedBudget}
                    onChange={(e) => setProjectValueRaw(onlyDigits(e.target.value))}
                    inputMode="numeric"
                    placeholder="2,000,000"
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] pl-9 pr-4 text-[15px] text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
                  />
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Enter numbers only. The amount is formatted automatically.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Budget confidence
                </label>
                <select
                  value={budgetConfidence}
                  onChange={(e) => setBudgetConfidence(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 text-[15px] text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
                >
                  <option value="low">Low confidence</option>
                  <option value="medium">Medium confidence</option>
                  <option value="high">High confidence</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Schedule pressure
                </label>
                <select
                  value={schedulePressure}
                  onChange={(e) => setSchedulePressure(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 text-[15px] text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Start date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 pr-12 text-[15px] text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
                  />
                  <CalendarRange className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  End date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 pr-12 text-[15px] text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
                  />
                  <CalendarRange className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Deadline criticality
                </label>
                <select
                  value={deadlineCriticality}
                  onChange={(e) => setDeadlineCriticality(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 text-[15px] text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Procurement lead-time exposure
                </label>
                <select
                  value={procurementLeadRisk}
                  onChange={(e) => setProcurementLeadRisk(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 text-[15px] text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Phasing complexity
                </label>
                <select
                  value={phasingComplexity}
                  onChange={(e) => setPhasingComplexity(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 text-[15px] text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Access window constraints
                </label>
                <select
                  value={accessWindowConstraints}
                  onChange={(e) => setAccessWindowConstraints(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 text-[15px] text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Working hour restrictions
                </label>
                <select
                  value={workingHourRestrictions}
                  onChange={(e) => setWorkingHourRestrictions(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 text-[15px] text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="mt-8 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                Duration signal
              </p>
              <p className="mt-2 text-sm font-medium text-slate-800">
                {durationLabel}
              </p>

              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                Planning signal
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {planningSignal}
              </p>
            </div>

            <div className="mt-10 flex items-center justify-between border-t border-slate-200 pt-6">
              <button
                onClick={() => router.push(`/app/projects/${projectId}/intake/step-1`)}
                className="inline-flex h-12 items-center gap-2 rounded-2xl border border-slate-200 px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveDraft}
                  disabled={saving}
                  className="inline-flex h-12 items-center gap-2 rounded-2xl border border-slate-200 px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {saving ? "Saving..." : "Save draft"}
                </button>

                <button
                  onClick={handleNext}
                  disabled={saving}
                  className="inline-flex h-12 items-center gap-2 rounded-2xl bg-violet-500 px-6 text-sm font-semibold text-white transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                  {saving ? "Saving..." : "Next step"}
                </button>
              </div>
            </div>
          </div>

          <aside className="h-fit rounded-[32px] border border-slate-200/80 bg-white p-7 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <h3 className="text-lg font-semibold text-slate-950">Why this step matters</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              RiskBases uses project size and timing to estimate which baseline risks
              are more likely to matter during setup.
            </p>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Used for
                </p>
                <p className="mt-2 text-sm text-slate-800">
                  Scale-based risk relevance
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Used for
                </p>
                <p className="mt-2 text-sm text-slate-800">
                  Planning and duration pressure
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Used for
                </p>
                <p className="mt-2 text-sm text-slate-800">
                  Procurement and sequencing signals
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                Step rule
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Keep this step commercial and schedule-focused only. No location, no stakeholders and no long free-text fields.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}