"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, Loader2, ShieldAlert, Brain, Rocket } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Project = {
  id: string;
  name: string;
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

  initial_risks: string | null;
  selected_risk_categories: string | null;
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

export default function Step8Page() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

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
      setLoading(true);

      const [
        projectRes,
        risksRes,
        actionsRes,
      ] = await Promise.all([
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
            initial_risks,
            selected_risk_categories
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

      if (projectRes.error) {
        setMessage(projectRes.error.message || "Could not load project review.");
        setLoading(false);
        return;
      }

      if (risksRes.error) {
        setMessage(risksRes.error.message || "Could not load generated risks.");
        setLoading(false);
        return;
      }

      if (actionsRes.error) {
        setMessage(actionsRes.error.message || "Could not load risk actions.");
        setLoading(false);
        return;
      }

      setProject(projectRes.data);

      const risks = risksRes.data || [];
      setRiskCount(risksRes.count || 0);
      setBaselineCount(risks.filter((r) => r.source_type === "template").length);
      setAiCount(risks.filter((r) => r.source_type === "ai").length);
      setHighRiskCount(risks.filter((r) => r.level === "high").length);
      setActionCount(actionsRes.count || 0);

      setLoading(false);
    }

    if (projectId) {
      loadData();
    }
  }, [projectId]);

  async function handleLaunch() {
    setLaunching(true);
    setMessage("");

    const { error } = await supabase
      .from("projects")
      .update({
        intake_completed: true,
        intake_completed_at: new Date().toISOString(),
      })
      .eq("id", projectId);

    if (error) {
      setMessage(error.message || "Could not complete intake.");
      setLaunching(false);
      return;
    }

    router.push(`/app/projects/${projectId}`);
  }

  const completionLabel = useMemo(() => {
    if (riskCount === 0) return "Setup incomplete";
    return "Ready to launch";
  }, [riskCount]);

  if (loading) {
    return (
      <section className="flex-1 bg-slate-50 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
            Loading step 8...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 bg-slate-50 py-16">
      <div className="mx-auto w-full max-w-5xl px-6">
        <div className="mb-10">
          <p className="text-sm font-semibold text-violet-600">Step 8 of 8</p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
            Review & Launch
          </h1>

          <p className="mt-2 max-w-3xl text-slate-500">
            Your intake is almost complete. Review the project setup, confirm the
            generated risk register, and open the project workspace for{" "}
            <span className="font-medium text-slate-700">{project?.name}</span>.
          </p>

          <div className="mt-6 flex items-center gap-6">
            <div className="h-3 flex-1 rounded-full bg-slate-200">
              <div className="h-3 w-full rounded-full bg-violet-500" />
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
              100%
            </div>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    {completionLabel}
                  </div>

                  <h2 className="mt-4 text-2xl font-semibold text-slate-900">
                    Intake completed successfully
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    The project profile has been completed and the initial risk
                    register is ready. You can now launch the workspace and start
                    managing risks, actions, and stakeholders.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">
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
                    {[project?.city, project?.region, project?.country]
                      .filter(Boolean)
                      .join(", ") || "—"}
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

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">
                Governance & settings
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
                onClick={() => router.push(`/app/projects/${projectId}/intake/step-7`)}
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
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">
                Risk register summary
              </h3>

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

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">
                Launch checklist
              </h3>

              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <li>• Project profile is completed</li>
                <li>• Risk register has been generated</li>
                <li>• High-priority actions are created</li>
                <li>• Workspace is ready for active management</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}