"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  Loader2,
  ShieldAlert,
  Brain,
  Rocket,
  ClipboardCheck,
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Project = {
  id: string;
  name: string | null;
  description: string | null;
  project_code: string | null;

  client_name: string | null;
  project_type: string | null;
  contract_type: string | null;
  project_value: string | null;
  start_date: string | null;
  end_date: string | null;

  country: string | null;
  region: string | null;
  city: string | null;
  postal_code: string | null;
  location_description: string | null;
  site_type: string | null;
  permit_required: boolean | null;

  client_stakeholder: string | null;
  authority_stakeholder: string | null;
  main_contractor: string | null;
  subcontractors: string | null;
  suppliers: string | null;
  other_stakeholders: string | null;

  project_phase: string | null;
  key_milestones: string | null;
  critical_dependencies: string | null;
  planning_notes: string | null;

  probability_scale: string | null;
  impact_scale: string | null;
  risk_threshold: string | null;
  review_frequency: string | null;
  risk_owner_required: boolean | null;
  mitigation_required: boolean | null;

  initial_risk_generation_at: string | null;
  intake_completed: boolean | null;
};

function displayValue(value: string | null) {
  return value && value.trim() ? value : "—";
}

function yesNoUnknown(value: boolean | null) {
  if (value === null) return "Unknown";
  return value ? "Yes" : "No";
}

function formatDate(value: string | null) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("en-GB");
  } catch {
    return value;
  }
}

function formatBudget(value: string | null) {
  if (!value) return "—";
  const digits = value.replace(/\D/g, "");
  if (!digits) return value;
  return `€ ${new Intl.NumberFormat("nl-NL").format(Number(digits))}`;
}

function formatLocation(project: Project | null) {
  if (!project) return "—";
  const value = [project.city, project.region, project.country].filter(Boolean).join(", ");
  return value || "—";
}

export default function Step8Page() {
  const router = useRouter();
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;

  const [project, setProject] = useState<Project | null>(null);
  const [riskCount, setRiskCount] = useState(0);
  const [baselineCount, setBaselineCount] = useState(0);
  const [aiCount, setAiCount] = useState(0);
  const [highRiskCount, setHighRiskCount] = useState(0);
  const [actionCount, setActionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [launching, setLaunching] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setMessage("");

        const [projectRes, risksRes, actionsRes] = await Promise.all([
          supabase
            .from("projects")
            .select(`
              id,
              name,
              description,
              project_code,
              client_name,
              project_type,
              contract_type,
              project_value,
              start_date,
              end_date,
              country,
              region,
              city,
              postal_code,
              location_description,
              site_type,
              permit_required,
              client_stakeholder,
              authority_stakeholder,
              main_contractor,
              subcontractors,
              suppliers,
              other_stakeholders,
              project_phase,
              key_milestones,
              critical_dependencies,
              planning_notes,
              probability_scale,
              impact_scale,
              risk_threshold,
              review_frequency,
              risk_owner_required,
              mitigation_required,
              initial_risk_generation_at,
              intake_completed
            `)
            .eq("id", projectId)
            .single(),

          supabase
            .from("project_risks")
            .select("id, source_type, level", { count: "exact" })
            .eq("project_id", projectId),

          supabase
            .from("risk_actions")
            .select("id", { count: "exact" })
            .eq("project_id", projectId),
        ]);

        if (projectRes.error) throw new Error(projectRes.error.message || "Could not load project review.");
        if (risksRes.error) throw new Error(risksRes.error.message || "Could not load generated risks.");
        if (actionsRes.error) throw new Error(actionsRes.error.message || "Could not load risk actions.");

        setProject(projectRes.data);

        const risks = risksRes.data || [];
        setRiskCount(risksRes.count || 0);
        setBaselineCount(risks.filter((r) => r.source_type === "template").length);
        setAiCount(risks.filter((r) => r.source_type === "ai").length);
        setHighRiskCount(risks.filter((r) => r.level === "high").length);
        setActionCount(actionsRes.count || 0);
      } catch (error: any) {
        setMessage(error?.message || "Could not load review step.");
      } finally {
        setLoading(false);
      }
    }

    if (projectId) {
      loadData();
    }
  }, [projectId]);

  async function handleLaunch() {
    try {
      setLaunching(true);
      setMessage("");

      const { error } = await supabase
        .from("projects")
        .update({
          intake_completed: true,
          intake_completed_at: new Date().toISOString(),
        })
        .eq("id", projectId);

      if (error) throw error;

      router.push(`/app/projects/${projectId}`);
    } catch (error: any) {
      setMessage(error?.message || "Could not complete intake.");
      setLaunching(false);
    }
  }

  const completionLabel = useMemo(() => {
    if (riskCount === 0) return "Baseline missing";
    return "Ready to launch";
  }, [riskCount]);

  if (loading) {
    return (
      <section className="min-h-screen bg-[#f5f7fb] px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-[28px] border border-slate-200/80 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <p className="text-sm text-slate-600">Loading step 8...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#f5f7fb] px-6 py-12">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-semibold text-violet-600">Step 8 of 8</p>

          <h1 className="mt-3 text-5xl font-semibold tracking-[-0.04em] text-slate-950">
            Review & launch
          </h1>

          <p className="mt-3 max-w-3xl text-[15px] leading-7 text-slate-600">
            Review the completed project setup and confirm the initial risk baseline
            before opening the project workspace.
          </p>

          <div className="mt-8 flex items-center gap-5">
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-full rounded-full bg-violet-500" />
            </div>

            <div className="flex h-12 min-w-[88px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800">
              100%
            </div>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            <div className="rounded-[32px] border border-slate-200/80 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.04)] md:p-10">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    {completionLabel}
                  </div>

                  <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
                    Project setup is ready
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    Your intake is complete and the first project risk register has been prepared.
                    After launch, the workspace can continue building on this baseline with actions,
                    updates and later AI support during project execution.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200/80 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.04)] md:p-10">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Project summary
              </h2>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-400">Project name</p>
                  <p className="mt-1 text-base font-medium text-slate-800">
                    {displayValue(project?.name ?? null)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">Project code</p>
                  <p className="mt-1 text-base font-medium text-slate-800">
                    {displayValue(project?.project_code ?? null)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">Client</p>
                  <p className="mt-1 text-base font-medium text-slate-800">
                    {displayValue(project?.client_name ?? null)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">Project type</p>
                  <p className="mt-1 text-base font-medium text-slate-800">
                    {displayValue(project?.project_type ?? null)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">Contract type</p>
                  <p className="mt-1 text-base font-medium text-slate-800">
                    {displayValue(project?.contract_type ?? null)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">Project value</p>
                  <p className="mt-1 text-base font-medium text-slate-800">
                    {formatBudget(project?.project_value ?? null)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">Start date</p>
                  <p className="mt-1 text-base font-medium text-slate-800">
                    {formatDate(project?.start_date ?? null)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">End date</p>
                  <p className="mt-1 text-base font-medium text-slate-800">
                    {formatDate(project?.end_date ?? null)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">Location</p>
                  <p className="mt-1 text-base font-medium text-slate-800">
                    {formatLocation(project)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">Site type</p>
                  <p className="mt-1 text-base font-medium text-slate-800">
                    {displayValue(project?.site_type ?? null)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">Permit required</p>
                  <p className="mt-1 text-base font-medium text-slate-800">
                    {yesNoUnknown(project?.permit_required ?? null)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">Project phase</p>
                  <p className="mt-1 text-base font-medium text-slate-800">
                    {displayValue(project?.project_phase ?? null)}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <p className="text-sm text-slate-400">Description</p>
                  <p className="mt-1 whitespace-pre-wrap text-base font-medium text-slate-800">
                    {displayValue(project?.description ?? null)}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <p className="text-sm text-slate-400">Critical dependencies</p>
                  <p className="mt-1 whitespace-pre-wrap text-base font-medium text-slate-800">
                    {displayValue(project?.critical_dependencies ?? null)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200/80 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.04)] md:p-10">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Governance defaults
              </h2>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-400">Probability scale</p>
                  <p className="mt-1 text-base font-medium text-slate-800">
                    {displayValue(project?.probability_scale ?? null)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">Impact scale</p>
                  <p className="mt-1 text-base font-medium text-slate-800">
                    {displayValue(project?.impact_scale ?? null)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">Risk threshold</p>
                  <p className="mt-1 text-base font-medium text-slate-800">
                    {displayValue(project?.risk_threshold ?? null)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">Review frequency</p>
                  <p className="mt-1 text-base font-medium text-slate-800">
                    {displayValue(project?.review_frequency ?? null)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">Risk owner required</p>
                  <p className="mt-1 text-base font-medium text-slate-800">
                    {yesNoUnknown(project?.risk_owner_required ?? null)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">Mitigation required</p>
                  <p className="mt-1 text-base font-medium text-slate-800">
                    {yesNoUnknown(project?.mitigation_required ?? null)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => router.push(`/intake/${projectId}/step-7`)}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleLaunch}
                disabled={launching || riskCount === 0}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {launching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Launching...
                  </>
                ) : (
                  <>
                    Open project dashboard
                    <Rocket className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] border border-slate-200/80 bg-white p-7 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
              <h3 className="text-lg font-semibold text-slate-950">Risk register summary</h3>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm font-medium text-slate-700">
                    Total generated risks
                  </span>
                  <span className="text-sm font-semibold text-slate-900">
                    {riskCount}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <ShieldAlert className="h-4 w-4" />
                    Baseline risks
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    {baselineCount}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Brain className="h-4 w-4" />
                    AI suggestions
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    {aiCount}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm font-medium text-slate-700">
                    High risks
                  </span>
                  <span className="text-sm font-semibold text-slate-900">
                    {highRiskCount}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm font-medium text-slate-700">
                    Auto-created actions
                  </span>
                  <span className="text-sm font-semibold text-slate-900">
                    {actionCount}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200/80 bg-white p-7 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
              <h3 className="text-lg font-semibold text-slate-950">Launch checklist</h3>

              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <div className="flex items-start gap-3">
                  <ClipboardCheck className="mt-0.5 h-4 w-4 text-slate-500" />
                  <p>Project profile is completed</p>
                </div>
                <div className="flex items-start gap-3">
                  <ClipboardCheck className="mt-0.5 h-4 w-4 text-slate-500" />
                  <p>Initial baseline has been generated</p>
                </div>
                <div className="flex items-start gap-3">
                  <ClipboardCheck className="mt-0.5 h-4 w-4 text-slate-500" />
                  <p>High-priority follow-up actions are prepared</p>
                </div>
                <div className="flex items-start gap-3">
                  <ClipboardCheck className="mt-0.5 h-4 w-4 text-slate-500" />
                  <p>Workspace is ready for active risk management</p>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200/80 bg-white p-7 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
              <h3 className="text-lg font-semibold text-slate-950">What happens next</h3>

              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <p>• The project opens with an initial risk register already in place.</p>
                <p>• Teams can start assigning owners, updating scores and tracking actions.</p>
                <p>• Later, AI can support new risk detection, reprioritisation and summaries during execution.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}