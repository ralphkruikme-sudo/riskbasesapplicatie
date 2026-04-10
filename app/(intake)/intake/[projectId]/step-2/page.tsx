"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarRange,
  Loader2,
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
  project_value: number | null;
  start_date: string | null;
  end_date: string | null;
  budget_confidence: string | null;
  schedule_pressure: string | null;
  deadline_criticality: string | null;
  procurement_lead_risk: string | null;
  phasing_complexity: string | null;
  access_window_constraints: string | null;
  working_hour_restrictions: string | null;
  fixed_completion_deadline: boolean | null;
  client_deadline_sensitivity: string | null;
  ld_penalty_exposure: string | null;
  execution_continuity_required: boolean | null;
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function formatEuroFromDigits(value: string) {
  if (!value) return "";
  return new Intl.NumberFormat("nl-NL").format(Number(value));
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
  if (!startDate || !endDate) {
    return "Add a planned start and end date to estimate delivery duration.";
  }

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
  fixedCompletionDeadline: boolean;
  clientDeadlineSensitivity: string;
  ldPenaltyExposure: string;
  executionContinuityRequired: boolean;
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
    fixedCompletionDeadline,
    clientDeadlineSensitivity,
    ldPenaltyExposure,
    executionContinuityRequired,
  } = params;

  const diffDays = calculateDurationDays(startDate, endDate);

  if (diffDays === -1) {
    return "The end date is before the start date. Fix the planning window first.";
  }

  if (
    fixedCompletionDeadline ||
    clientDeadlineSensitivity === "high" ||
    ldPenaltyExposure === "high"
  ) {
    return "This project shows clear deadline sensitivity, which increases delivery pressure and delay exposure.";
  }

  if (
    schedulePressure === "high" ||
    deadlineCriticality === "high" ||
    procurementLeadRisk === "high"
  ) {
    return "This profile indicates elevated exposure for schedule, procurement and coordination risks.";
  }

  if (
    phasingComplexity === "high" ||
    accessWindowConstraints === "high" ||
    workingHourRestrictions === "high" ||
    executionContinuityRequired
  ) {
    return "This setup suggests additional sequencing, access and operational continuity pressure.";
  }

  if (typeof diffDays === "number" && diffDays > 365) {
    return "A longer delivery horizon may increase coordination, scope drift and interface risk.";
  }

  if (typeof diffDays === "number" && diffDays > 0 && diffDays < 90) {
    return "A compressed delivery window can increase schedule and procurement pressure.";
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
  const [fixedCompletionDeadline, setFixedCompletionDeadline] = useState(false);
  const [clientDeadlineSensitivity, setClientDeadlineSensitivity] = useState("medium");
  const [ldPenaltyExposure, setLdPenaltyExposure] = useState("low");
  const [executionContinuityRequired, setExecutionContinuityRequired] =
    useState(false);

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
      fixedCompletionDeadline,
      clientDeadlineSensitivity,
      ldPenaltyExposure,
      executionContinuityRequired,
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
    fixedCompletionDeadline,
    clientDeadlineSensitivity,
    ldPenaltyExposure,
    executionContinuityRequired,
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
            working_hour_restrictions,
            fixed_completion_deadline,
            client_deadline_sensitivity,
            ld_penalty_exposure,
            execution_continuity_required
          `)
          .eq("id", projectId)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Project not found.");

        const loaded = data as Project;

        setProject(loaded);
        setProjectValueRaw(
          loaded.project_value !== null && loaded.project_value !== undefined
            ? String(loaded.project_value)
            : ""
        );
        setStartDate(normalizeDateValue(loaded.start_date));
        setEndDate(normalizeDateValue(loaded.end_date));
        setBudgetConfidence(loaded.budget_confidence || "medium");
        setSchedulePressure(loaded.schedule_pressure || "medium");
        setDeadlineCriticality(loaded.deadline_criticality || "medium");
        setProcurementLeadRisk(loaded.procurement_lead_risk || "medium");
        setPhasingComplexity(loaded.phasing_complexity || "medium");
        setAccessWindowConstraints(loaded.access_window_constraints || "low");
        setWorkingHourRestrictions(loaded.working_hour_restrictions || "low");
        setFixedCompletionDeadline(Boolean(loaded.fixed_completion_deadline));
        setClientDeadlineSensitivity(
          loaded.client_deadline_sensitivity || "medium"
        );
        setLdPenaltyExposure(loaded.ld_penalty_exposure || "low");
        setExecutionContinuityRequired(
          Boolean(loaded.execution_continuity_required)
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
        project_value: projectValueRaw ? Number(projectValueRaw) : null,
        start_date: startDate || null,
        end_date: endDate || null,
        budget_confidence: budgetConfidence || null,
        schedule_pressure: schedulePressure || null,
        deadline_criticality: deadlineCriticality || null,
        procurement_lead_risk: procurementLeadRisk || null,
        phasing_complexity: phasingComplexity || null,
        access_window_constraints: accessWindowConstraints || null,
        working_hour_restrictions: workingHourRestrictions || null,
        fixed_completion_deadline: fixedCompletionDeadline,
        client_deadline_sensitivity: clientDeadlineSensitivity || null,
        ld_penalty_exposure: ldPenaltyExposure || null,
        execution_continuity_required: executionContinuityRequired,
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

      if (startDate && endDate) {
        const diff = calculateDurationDays(startDate, endDate);
        if (diff !== null && diff < 0) {
          throw new Error("End date cannot be earlier than the start date.");
        }
      }

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
      <section className="min-h-screen bg-[#F4F7FB] px-6 py-10">
        <div className="mx-auto max-w-[1160px]">
          <div className="rounded-[28px] border border-[#D8E1EC] bg-white p-8 shadow-[0_12px_32px_rgba(15,23,42,0.05)]">
            <p className="text-sm font-medium text-[#4B5B73]">Loading step 2...</p>
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
            Step 2 of 8
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-[#081226] md:text-[52px]">
            Commercial & schedule context
          </h1>

          <p className="mt-4 max-w-4xl text-[15px] leading-7 text-[#4B5B73]">
            Add the commercial and delivery pressure context for{" "}
            <span className="font-semibold text-[#0F172A]">
              {project.name || "this project"}
            </span>
            . This helps RiskBases assess schedule sensitivity, deadline exposure,
            procurement pressure and execution continuity.
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
                <Wallet className="h-4 w-4" />
                Planning profile
              </div>

              <h2 className="mt-4 text-[30px] font-semibold tracking-[-0.03em] text-[#081226]">
                Budget, timing and delivery pressure
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#4B5B73]">
                Keep this step structured and commercial. No location fields, no
                stakeholder fields and no long free-text notes here.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Project value / budget
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]">
                    €
                  </span>

                  <input
                    value={formattedBudget}
                    onChange={(e) => setProjectValueRaw(onlyDigits(e.target.value))}
                    inputMode="numeric"
                    placeholder="2.000.000"
                    className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] pl-9 pr-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                  />
                </div>

                <p className="mt-2 text-xs leading-5 text-[#6B7A90]">
                  Enter numbers only. The amount is formatted automatically.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Budget confidence
                </label>
                <select
                  value={budgetConfidence}
                  onChange={(e) => setBudgetConfidence(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                >
                  <option value="low">Low confidence</option>
                  <option value="medium">Medium confidence</option>
                  <option value="high">High confidence</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Schedule pressure
                </label>
                <select
                  value={schedulePressure}
                  onChange={(e) => setSchedulePressure(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Start date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 pr-12 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                  />
                  <CalendarRange className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  End date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 pr-12 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                  />
                  <CalendarRange className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Fixed completion deadline?
                </label>
                <select
                  value={fixedCompletionDeadline ? "yes" : "no"}
                  onChange={(e) => setFixedCompletionDeadline(e.target.value === "yes")}
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Client deadline sensitivity
                </label>
                <select
                  value={clientDeadlineSensitivity}
                  onChange={(e) => setClientDeadlineSensitivity(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Deadline criticality
                </label>
                <select
                  value={deadlineCriticality}
                  onChange={(e) => setDeadlineCriticality(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  LD / penalty exposure
                </label>
                <select
                  value={ldPenaltyExposure}
                  onChange={(e) => setLdPenaltyExposure(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Procurement lead-time exposure
                </label>
                <select
                  value={procurementLeadRisk}
                  onChange={(e) => setProcurementLeadRisk(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Phasing complexity
                </label>
                <select
                  value={phasingComplexity}
                  onChange={(e) => setPhasingComplexity(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Access window constraints
                </label>
                <select
                  value={accessWindowConstraints}
                  onChange={(e) => setAccessWindowConstraints(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Execution continuity required?
                </label>
                <select
                  value={executionContinuityRequired ? "yes" : "no"}
                  onChange={(e) =>
                    setExecutionContinuityRequired(e.target.value === "yes")
                  }
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Working hour restrictions
                </label>
                <select
                  value={workingHourRestrictions}
                  onChange={(e) => setWorkingHourRestrictions(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="mt-8 rounded-[24px] border border-[#D8E1EC] bg-[#F8FAFC] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7A90]">
                Duration signal
              </p>
              <p className="mt-2 text-sm font-medium text-[#0F172A]">
                {durationLabel}
              </p>

              <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7A90]">
                Planning signal
              </p>
              <p className="mt-2 text-sm leading-6 text-[#36506C]">
                {planningSignal}
              </p>
            </div>

            <div className="mt-10 flex flex-col gap-3 border-t border-[#E2E8F0] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={() => router.push(`/intake/${projectId}/step-1`)}
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
              RiskBases uses project size, deadline sensitivity and delivery pressure
              to estimate which baseline risks are most likely to matter early.
            </p>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl bg-[#F8FAFC] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7A90]">
                  Used for
                </p>
                <p className="mt-2 text-sm font-medium text-[#0F172A]">
                  Commercial delivery pressure
                </p>
              </div>

              <div className="rounded-2xl bg-[#F8FAFC] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7A90]">
                  Used for
                </p>
                <p className="mt-2 text-sm font-medium text-[#0F172A]">
                  Deadline and procurement exposure
                </p>
              </div>

              <div className="rounded-2xl bg-[#F8FAFC] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7A90]">
                  Used for
                </p>
                <p className="mt-2 text-sm font-medium text-[#0F172A]">
                  Planning and sequencing signals
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-[24px] border border-[#DCE7FF] bg-[#F7FAFF] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2457FF]">
                Step rule
              </p>
              <p className="mt-3 text-sm leading-6 text-[#36506C]">
                Keep this step commercial and schedule-focused only. Location,
                approvals, technical unknowns and stakeholders belong in later steps.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}