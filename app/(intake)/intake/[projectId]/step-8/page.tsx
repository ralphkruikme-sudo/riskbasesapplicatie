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
  ArrowLeft,
  FolderOpen,
  FileCheck2,
  ListChecks,
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
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
  project_value: number | null;
  start_date: string | null;
  end_date: string | null;

  country: string | null;
  region: string | null;
  city: string | null;
  postal_code: string | null;
  address_line: string | null;
  site_type: string | null;
  permit_required: boolean | null;

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
  managed_scoring_enabled: boolean | null;
  baseline_publish_mode: string | null;
  severity_model: string | null;

  initial_risk_generation_at: string | null;
  intake_completed: boolean | null;
};

type SelectedRisk = {
  title: string;
  description: string;
  category: string;
  probability: number;
  impact: number;
  score: number;
  level: "low" | "medium" | "high";
  suggested_action: string;
  source_type: "template" | "ai";
  source_template_id?: string | null;
  generation_reason?: string | null;
  selected: boolean;
  applied_rule_codes?: string[];
  confidence?: number | null;
  learning_score?: number;
  ranking_score?: number;
  final_reason?: string | null;
  included_by_ai?: boolean;
  included_by_template?: boolean;
};

type StoredSelection = {
  baselineGenerationId: string | null;
  matchedRuleCount: number;
  matchedTemplateCount: number;
  learningStatsUsedCount: number;
  projectContextBlob: string;
  generatedRisks: SelectedRisk[];
};

function getStorageKey(projectId: string) {
  return `riskbases_step7_selection_${projectId}`;
}

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

function formatBudget(value: number | null) {
  if (value === null || value === undefined) return "—";
  return `€ ${new Intl.NumberFormat("nl-NL").format(value)}`;
}

function formatLocation(project: Project | null) {
  if (!project) return "—";
  const value = [project.city, project.region, project.country]
    .filter(Boolean)
    .join(", ");
  return value || "—";
}

function getLaunchStatus(riskCount: number) {
  if (riskCount === 0) {
    return {
      label: "Selection missing",
      tone: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  return {
    label: "Ready to publish",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };
}

function levelClasses(level: SelectedRisk["level"]) {
  if (level === "high") {
    return "border-red-200 bg-red-50 text-red-700";
  }
  if (level === "medium") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function sourceClasses(source: SelectedRisk["source_type"]) {
  if (source === "template") {
    return "border-slate-200 bg-slate-100 text-slate-700";
  }
  return "border-[#C9D8FF] bg-[#EEF4FF] text-[#2457FF]";
}

function formatConfidence(value?: number | null) {
  if (typeof value !== "number") return "—";
  return `${Math.round(value * 100)}%`;
}

export default function Step8Page() {
  const router = useRouter();
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;

  const [project, setProject] = useState<Project | null>(null);
  const [selectedRisks, setSelectedRisks] = useState<SelectedRisk[]>([]);
  const [baselineGenerationId, setBaselineGenerationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [launching, setLaunching] = useState(false);
  const [message, setMessage] = useState("");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setMessage("");

        const { data, error } = await supabase
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
            address_line,
            site_type,
            permit_required,
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
            managed_scoring_enabled,
            baseline_publish_mode,
            severity_model,
            initial_risk_generation_at,
            intake_completed
          `)
          .eq("id", projectId)
          .single();

        if (error) {
          throw new Error(error.message || "Could not load project review.");
        }

        setProject(data);

        const saved = sessionStorage.getItem(getStorageKey(projectId));
        if (!saved) {
          setSelectedRisks([]);
          setBaselineGenerationId(null);
          setMessage(
            "No Step 7 baseline selection was found. Go back to Step 7 and generate your baseline first."
          );
        } else {
          const parsed: StoredSelection = JSON.parse(saved);
          const selected = (parsed.generatedRisks || []).filter((risk) => risk.selected);
          setSelectedRisks(selected);
          setBaselineGenerationId(parsed.baselineGenerationId ?? null);
          setExpandedIndex(selected.length > 0 ? 0 : null);
        }
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

  function toggleExpand(index: number) {
    setExpandedIndex((prev) => (prev === index ? null : index));
  }

  async function handlePublishAndLaunch() {
    if (!project) return;

    if (selectedRisks.length === 0) {
      setMessage("No selected risks found. Go back to Step 7 first.");
      return;
    }

    try {
      setLaunching(true);
      setMessage("");

      const { data: existingRisks, error: existingError } = await supabase
        .from("project_risks")
        .select("risk_code")
        .eq("project_id", projectId);

      if (existingError) throw existingError;

      const startIndex = (existingRisks?.length || 0) + 1;
      const nowIso = new Date().toISOString();

      const rows = selectedRisks.map((risk, index) => {
        const managedProbability = project.managed_scoring_enabled
          ? Math.max(1, risk.probability - 1)
          : risk.probability;

        const managedImpact = risk.impact;
        const managedScore = managedProbability * managedImpact;

        let managedLevel: "low" | "medium" | "high" = "medium";
        if (managedScore >= 15) managedLevel = "high";
        else if (managedScore <= 6) managedLevel = "low";

        return {
          project_id: projectId,
          baseline_item_id: null,
          template_id: risk.source_template_id ?? null,
          risk_code: `R${String(startIndex + index).padStart(3, "0")}`,
          title: risk.title,
          description: risk.description,
          category: risk.category,
          risk_type: null,
          source_type: risk.source_type,
          source_reason: risk.final_reason ?? risk.generation_reason ?? null,
          probability: risk.probability,
          impact: risk.impact,
          score: risk.score,
          level: risk.level,
          status: "open",
          phase: project.project_phase ?? null,
          owner_user_id: null,
          due_review_date: null,
          next_review_at: null,
          is_ai_generated: risk.source_type === "ai",
          ai_confidence: risk.source_type === "ai" ? (risk.confidence ?? 0.58) : null,
          created_by: null,
          created_at: nowIso,
          updated_at: nowIso,
          inherent_probability: risk.probability,
          inherent_impact: risk.impact,
          inherent_score: risk.score,
          inherent_level: risk.level,
          inherent_rating: risk.score,
          managed_probability: managedProbability,
          managed_impact: managedImpact,
          managed_score: managedScore,
          managed_level: managedLevel,
          managed_rating: managedScore,
          scoring_method: "baseline_generation",
          treatment_status: "untreated",
          target_managed_probability: null,
          target_managed_impact: null,
          target_managed_rating: null,
          acceptance_notes: risk.final_reason ?? risk.generation_reason ?? null,
        };
      });

      const { data: insertedRisks, error: insertError } = await supabase
        .from("project_risks")
        .insert(rows)
        .select("id, title, level");

      if (insertError) {
        console.error("PROJECT_RISKS INSERT ERROR:", insertError);
        throw insertError;
      }

      const insertedRiskMap = new Map(
        (insertedRisks || []).map((row: any) => [row.title, row.id])
      );

      const actionRows = selectedRisks
        .filter(
          (risk) =>
            risk.level === "high" &&
            project.mitigation_required &&
            risk.suggested_action?.trim()
        )
        .map((risk) => ({
          project_id: projectId,
          risk_id: insertedRiskMap.get(risk.title) ?? null,
          title: risk.suggested_action,
          description: `Recommended mitigation for: ${risk.title}`,
          action_type: "mitigation",
          owner_user_id: null,
          status: "open",
          priority: "high",
          due_date: null,
          completed_at: null,
          reminder_count: 0,
          last_reminded_at: null,
          escalation_level: 0,
          escalation_started_at: null,
          channel_hint: "in_app",
          created_by: null,
          created_at: nowIso,
          updated_at: nowIso,
          notification_mode: "manual",
          notify_on_create: false,
          notify_on_status_change: false,
          notify_on_due_soon: false,
          notify_on_overdue: false,
        }));

      if (actionRows.length > 0) {
        const { error: actionError } = await supabase
          .from("risk_actions")
          .insert(actionRows);

        if (actionError) {
          console.error("RISK_ACTIONS INSERT ERROR:", actionError);
          throw actionError;
        }
      }

      const { error: projectUpdateError } = await supabase
        .from("projects")
        .update({
          intake_completed: true,
          intake_completed_at: nowIso,
          initial_risk_generation_at: nowIso,
          updated_at: nowIso,
        })
        .eq("id", projectId);

      if (projectUpdateError) throw projectUpdateError;

      sessionStorage.removeItem(getStorageKey(projectId));
      router.push(`/app/projects/${projectId}`);
    } catch (error: any) {
      console.error("STEP 8 PUBLISH ERROR:", error);
      setMessage(error?.message || "Could not publish project baseline.");
      setLaunching(false);
    }
  }

  const riskCount = selectedRisks.length;
  const baselineCount = useMemo(
    () => selectedRisks.filter((r) => r.source_type === "template").length,
    [selectedRisks]
  );
  const aiCount = useMemo(
    () => selectedRisks.filter((r) => r.source_type === "ai").length,
    [selectedRisks]
  );
  const highRiskCount = useMemo(
    () => selectedRisks.filter((r) => r.level === "high").length,
    [selectedRisks]
  );
  const actionCount = useMemo(() => {
    if (!project?.mitigation_required) return 0;
    return selectedRisks.filter(
      (r) => r.level === "high" && r.suggested_action?.trim()
    ).length;
  }, [selectedRisks, project?.mitigation_required]);

  const launchStatus = useMemo(() => getLaunchStatus(riskCount), [riskCount]);

  if (loading) {
    return (
      <section className="min-h-screen bg-[#F4F7FB] px-6 py-10">
        <div className="mx-auto max-w-[1160px]">
          <div className="rounded-[28px] border border-[#D8E1EC] bg-white p-8 shadow-[0_12px_32px_rgba(15,23,42,0.05)]">
            <p className="text-sm font-medium text-[#4B5B73]">Loading step 8...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#F4F7FB] px-6 py-10">
      <div className="mx-auto w-full max-w-[1180px]">
        <div className="mb-8">
          <p className="text-sm font-semibold tracking-[0.02em] text-[#2457FF]">
            Step 8 of 8
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-[#081226] md:text-[52px]">
            Review & launch
          </h1>

          <p className="mt-4 max-w-4xl text-[15px] leading-7 text-[#4B5B73]">
            Review the completed project setup and confirm the selected baseline
            before publishing the initial risk register into the live project workspace.
          </p>

          <div className="mt-8 flex items-center gap-4">
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#DCE4EE]">
              <div className="h-full w-full rounded-full bg-[#2457FF]" />
            </div>

            <div className="flex h-11 min-w-[74px] items-center justify-center rounded-2xl border border-[#D8E1EC] bg-white px-4 text-sm font-semibold text-[#0F172A]">
              100%
            </div>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-[22px] border border-[#D8E1EC] bg-white px-5 py-4 text-sm text-[#4B5B73] shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            <div className="rounded-[32px] border border-[#D8E1EC] bg-white p-8 shadow-[0_14px_36px_rgba(15,23,42,0.05)] md:p-10">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${launchStatus.tone}`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {launchStatus.label}
                  </div>

                  <h2 className="mt-4 text-[30px] font-semibold tracking-[-0.03em] text-[#081226]">
                    Final baseline checkpoint
                  </h2>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-[#4B5B73]">
                    This is the final review before the selected baseline is published into the live project register.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-[#D8E1EC] bg-white p-8 shadow-[0_14px_36px_rgba(15,23,42,0.05)] md:p-10">
              <h2 className="text-[30px] font-semibold tracking-[-0.03em] text-[#081226]">
                Selected baseline risks
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#4B5B73]">
                These are the risks selected in Step 7 that will be published into the project environment.
              </p>

              <div className="mt-6 space-y-4">
                {selectedRisks.length === 0 ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-700">
                    No selected risks found. Go back to Step 7 and generate your baseline first.
                  </div>
                ) : (
                  selectedRisks.map((risk, index) => {
                    const expanded = expandedIndex === index;

                    return (
                      <div
                        key={`${risk.title}-${index}`}
                        className="overflow-hidden rounded-[24px] border border-[#D8E1EC] bg-white"
                      >
                        <div className="p-5">
                          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-[17px] font-semibold text-[#0F172A]">
                                  {risk.title}
                                </h3>

                                <span
                                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${sourceClasses(
                                    risk.source_type
                                  )}`}
                                >
                                  {risk.source_type === "template" ? "Baseline" : "AI suggestion"}
                                </span>

                                <span
                                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${levelClasses(
                                    risk.level
                                  )}`}
                                >
                                  {risk.level}
                                </span>
                              </div>

                              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#6B7A90]">
                                <span>{risk.category}</span>
                                <span>Probability {risk.probability}</span>
                                <span>Impact {risk.impact}</span>
                                <span>Score {risk.score}</span>
                                <span>Confidence {formatConfidence(risk.confidence)}</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => toggleExpand(index)}
                              className="inline-flex items-center gap-2 self-start rounded-xl border border-[#D8E1EC] bg-white px-3 py-2 text-sm font-medium text-[#4B5B73] transition hover:bg-[#F8FAFC]"
                            >
                              {expanded ? (
                                <>
                                  Hide details <ChevronUp className="h-4 w-4" />
                                </>
                              ) : (
                                <>
                                  Show details <ChevronDown className="h-4 w-4" />
                                </>
                              )}
                            </button>
                          </div>

                          {expanded && (
                            <div className="mt-5 rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] p-4">
                              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                                <div>
                                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7A90]">
                                    Description
                                  </p>
                                  <p className="mt-1 text-sm leading-6 text-[#36506C]">
                                    {risk.description || "—"}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7A90]">
                                    Suggested action
                                  </p>
                                  <p className="mt-1 text-sm leading-6 text-[#36506C]">
                                    {risk.suggested_action || "—"}
                                  </p>
                                </div>
                              </div>

                              {(risk.final_reason || risk.generation_reason) && (
                                <div className="mt-5">
                                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7A90]">
                                    Why this was included
                                  </p>
                                  <p className="mt-1 text-sm leading-6 text-[#36506C]">
                                    {risk.final_reason || risk.generation_reason}
                                  </p>
                                </div>
                              )}

                              {!!risk.applied_rule_codes?.length && (
                                <div className="mt-5">
                                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7A90]">
                                    Applied rules
                                  </p>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {risk.applied_rule_codes.map((ruleCode) => (
                                      <span
                                        key={ruleCode}
                                        className="rounded-full border border-[#D8E1EC] bg-white px-2.5 py-1 text-xs font-medium text-[#4B5B73]"
                                      >
                                        {ruleCode}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="rounded-[32px] border border-[#D8E1EC] bg-white p-8 shadow-[0_14px_36px_rgba(15,23,42,0.05)] md:p-10">
              <h2 className="text-[30px] font-semibold tracking-[-0.03em] text-[#081226]">
                Project summary
              </h2>

              <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <p className="text-sm text-[#6B7A90]">Project name</p>
                  <p className="mt-1 text-base font-medium text-[#0F172A]">
                    {displayValue(project?.name ?? null)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-[#6B7A90]">Project code</p>
                  <p className="mt-1 text-base font-medium text-[#0F172A]">
                    {displayValue(project?.project_code ?? null)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-[#6B7A90]">Client</p>
                  <p className="mt-1 text-base font-medium text-[#0F172A]">
                    {displayValue(project?.client_name ?? null)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-[#6B7A90]">Project type</p>
                  <p className="mt-1 text-base font-medium text-[#0F172A]">
                    {displayValue(project?.project_type ?? null)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-[#6B7A90]">Contract type</p>
                  <p className="mt-1 text-base font-medium text-[#0F172A]">
                    {displayValue(project?.contract_type ?? null)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-[#6B7A90]">Project value</p>
                  <p className="mt-1 text-base font-medium text-[#0F172A]">
                    {formatBudget(project?.project_value ?? null)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-[#6B7A90]">Start date</p>
                  <p className="mt-1 text-base font-medium text-[#0F172A]">
                    {formatDate(project?.start_date ?? null)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-[#6B7A90]">End date</p>
                  <p className="mt-1 text-base font-medium text-[#0F172A]">
                    {formatDate(project?.end_date ?? null)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-[#6B7A90]">Location</p>
                  <p className="mt-1 text-base font-medium text-[#0F172A]">
                    {formatLocation(project)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-[#6B7A90]">Site type</p>
                  <p className="mt-1 text-base font-medium text-[#0F172A]">
                    {displayValue(project?.site_type ?? null)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-[#6B7A90]">Permit required</p>
                  <p className="mt-1 text-base font-medium text-[#0F172A]">
                    {yesNoUnknown(project?.permit_required ?? null)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-[#6B7A90]">Project phase</p>
                  <p className="mt-1 text-base font-medium text-[#0F172A]">
                    {displayValue(project?.project_phase ?? null)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={() => router.push(`/intake/${projectId}/step-7`)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#D8E1EC] bg-white px-5 py-3 text-sm font-semibold text-[#1E293B] transition hover:bg-[#F8FAFC]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              <button
                type="button"
                onClick={handlePublishAndLaunch}
                disabled={launching || riskCount === 0}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#2457FF] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(36,87,255,0.22)] transition hover:bg-[#1D4BE0] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {launching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    Publish & open dashboard
                    <Rocket className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] border border-[#D8E1EC] bg-white p-7 shadow-[0_14px_36px_rgba(15,23,42,0.05)]">
              <h3 className="text-xl font-semibold tracking-tight text-[#081226]">
                Publish summary
              </h3>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-[#F8FAFC] px-4 py-3">
                  <span className="text-sm font-medium text-[#1E293B]">
                    Selected risks
                  </span>
                  <span className="text-sm font-semibold text-[#0F172A]">
                    {riskCount}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-[#F8FAFC] px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-[#1E293B]">
                    <ShieldAlert className="h-4 w-4" />
                    Baseline risks
                  </div>
                  <span className="text-sm font-semibold text-[#0F172A]">
                    {baselineCount}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-[#F8FAFC] px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-[#1E293B]">
                    <Brain className="h-4 w-4" />
                    AI suggestions
                  </div>
                  <span className="text-sm font-semibold text-[#0F172A]">
                    {aiCount}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-[#F8FAFC] px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-[#1E293B]">
                    <AlertTriangle className="h-4 w-4" />
                    High risks
                  </div>
                  <span className="text-sm font-semibold text-[#0F172A]">
                    {highRiskCount}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-[#F8FAFC] px-4 py-3">
                  <span className="text-sm font-medium text-[#1E293B]">
                    Auto-created actions
                  </span>
                  <span className="text-sm font-semibold text-[#0F172A]">
                    {actionCount}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-[#F8FAFC] px-4 py-3">
                  <span className="text-sm font-medium text-[#1E293B]">
                    Baseline generation ID
                  </span>
                  <span className="max-w-[145px] truncate text-right text-sm font-semibold text-[#0F172A]">
                    {baselineGenerationId || "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-[#D8E1EC] bg-white p-7 shadow-[0_14px_36px_rgba(15,23,42,0.05)]">
              <h3 className="text-xl font-semibold tracking-tight text-[#081226]">
                Launch checklist
              </h3>

              <div className="mt-4 space-y-3 text-sm leading-6 text-[#4B5B73]">
                <div className="flex items-start gap-3">
                  <ClipboardCheck className="mt-0.5 h-4 w-4 text-[#2457FF]" />
                  <p>Project profile is completed</p>
                </div>
                <div className="flex items-start gap-3">
                  <ClipboardCheck className="mt-0.5 h-4 w-4 text-[#2457FF]" />
                  <p>Baseline selection from Step 7 is ready</p>
                </div>
                <div className="flex items-start gap-3">
                  <ClipboardCheck className="mt-0.5 h-4 w-4 text-[#2457FF]" />
                  <p>High-priority follow-up actions can be prepared</p>
                </div>
                <div className="flex items-start gap-3">
                  <ClipboardCheck className="mt-0.5 h-4 w-4 text-[#2457FF]" />
                  <p>Workspace is ready for active risk management</p>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-[#D8E1EC] bg-white p-7 shadow-[0_14px_36px_rgba(15,23,42,0.05)]">
              <h3 className="text-xl font-semibold tracking-tight text-[#081226]">
                What happens next
              </h3>

              <div className="mt-4 space-y-3 text-sm leading-6 text-[#4B5B73]">
                <div className="flex items-start gap-3">
                  <FolderOpen className="mt-0.5 h-4 w-4 text-[#2457FF]" />
                  <p>The selected baseline risks are published into the live project register.</p>
                </div>
                <div className="flex items-start gap-3">
                  <ListChecks className="mt-0.5 h-4 w-4 text-[#2457FF]" />
                  <p>High-priority mitigation actions are created where required.</p>
                </div>
                <div className="flex items-start gap-3">
                  <FileCheck2 className="mt-0.5 h-4 w-4 text-[#2457FF]" />
                  <p>The project opens ready for ownership, updates and execution follow-up.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}