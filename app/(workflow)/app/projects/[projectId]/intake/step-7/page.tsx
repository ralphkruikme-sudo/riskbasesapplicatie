"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams, useRouter } from "next/navigation";
import {
  Sparkles,
  Loader2,
  Check,
  AlertTriangle,
  X,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Brain,
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Project = {
  id: string;
  name: string;
  description: string | null;
  project_type: string | null;
  contract_type: string | null;
  project_value: string | null;
  start_date: string | null;
  end_date: string | null;
  client_name: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  site_type: string | null;
  permit_required: boolean | null;
  project_phase: string | null;
  key_milestones: string | null;
  critical_dependencies: string | null;
  initial_risks: string | null;
  selected_risk_categories: string | null;
  client_stakeholder: string | null;
  authority_stakeholder: string | null;
  main_contractor: string | null;
  subcontractors: string | null;
};

type GeneratedRisk = {
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
};

function levelClasses(level: GeneratedRisk["level"]) {
  if (level === "high") {
    return "border-red-200 bg-red-50 text-red-700";
  }
  if (level === "medium") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function sourceClasses(source: GeneratedRisk["source_type"]) {
  if (source === "template") {
    return "border-slate-200 bg-slate-100 text-slate-700";
  }
  return "border-violet-200 bg-violet-100 text-violet-700";
}

export default function Step7Page() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingStep, setSavingStep] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [savingRisks, setSavingRisks] = useState(false);
  const [message, setMessage] = useState("");
  const [generatedRisks, setGeneratedRisks] = useState<GeneratedRisk[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  useEffect(() => {
    async function loadProject() {
      const { data, error } = await supabase
        .from("projects")
        .select(`
          id,
          name,
          description,
          project_type,
          contract_type,
          project_value,
          start_date,
          end_date,
          client_name,
          country,
          region,
          city,
          site_type,
          permit_required,
          project_phase,
          key_milestones,
          critical_dependencies,
          initial_risks,
          selected_risk_categories,
          client_stakeholder,
          authority_stakeholder,
          main_contractor,
          subcontractors
        `)
        .eq("id", projectId)
        .single();

      if (error) {
        setMessage(error.message || "Could not load step 7.");
        setLoading(false);
        return;
      }

      setProject(data);
      setLoading(false);
    }

    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  async function saveStep() {
    setSavingStep(true);

    const { error } = await supabase
      .from("projects")
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId);

    setSavingStep(false);

    if (error) {
      throw new Error(error.message || "Could not save step.");
    }
  }

  async function handleGenerateRisks() {
    if (!project) return;

    setGenerating(true);
    setMessage("");
    setGeneratedRisks([]);

    try {
      await saveStep();

      const response = await fetch(`/api/projects/${projectId}/generate-risks`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Risk generation failed.");
      }

      const combined: GeneratedRisk[] = (data.combined || []).map((risk: any) => ({
        ...risk,
        selected: true,
      }));

      setGeneratedRisks(combined);
      setExpandedIndex(combined.length > 0 ? 0 : null);

      if (combined.length === 0) {
        setMessage("No risks were generated yet.");
      }
    } catch (error: any) {
      setMessage(error?.message || "Could not generate risks.");
    } finally {
      setGenerating(false);
    }
  }

  function toggleRisk(index: number) {
    setGeneratedRisks((prev) =>
      prev.map((risk, i) =>
        i === index ? { ...risk, selected: !risk.selected } : risk
      )
    );
  }

  function toggleExpand(index: number) {
    setExpandedIndex((prev) => (prev === index ? null : index));
  }

  async function handleSaveAndContinue() {
    const selected = generatedRisks.filter((risk) => risk.selected);

    if (selected.length === 0) {
      setMessage("Select at least one generated risk before continuing.");
      return;
    }

    setSavingRisks(true);
    setMessage("");

    try {
      const { data: existingRisks, error: existingError } = await supabase
        .from("project_risks")
        .select("risk_code")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });

      if (existingError) {
        throw new Error(existingError.message);
      }

      const nextIndex = (existingRisks?.length || 0) + 1;

      const rows = selected.map((risk, index) => ({
        project_id: projectId,
        risk_code: `R${String(nextIndex + index).padStart(3, "0")}`,
        title: risk.title,
        description: risk.description,
        category: risk.category,
        probability: risk.probability,
        impact: risk.impact,
        score: risk.score,
        level: risk.level,
        status: "open",
        source_type: risk.source_type,
        source_template_id: risk.source_template_id ?? null,
        generation_reason: risk.generation_reason ?? null,
        review_status: "accepted",
        suggested_action: risk.suggested_action ?? null,
      }));

      const { error: insertError } = await supabase
        .from("project_risks")
        .insert(rows);

      if (insertError) {
        throw new Error(insertError.message);
      }

      const highRiskActions = selected
        .filter((risk) => risk.level === "high" && risk.suggested_action?.trim())
        .map((risk) => ({
          project_id: projectId,
          title: risk.suggested_action,
          description: `Recommended mitigation for: ${risk.title}`,
          status: "open",
          priority: "high",
        }));

      if (highRiskActions.length > 0) {
        const { error: actionError } = await supabase
          .from("risk_actions")
          .insert(highRiskActions);

        if (actionError) {
          throw new Error(actionError.message);
        }
      }

      router.push(`/app/projects/${projectId}/intake/step-8`);
    } catch (error: any) {
      setMessage(error?.message || "Could not save generated risks.");
    } finally {
      setSavingRisks(false);
    }
  }

  const selectedCount = useMemo(
    () => generatedRisks.filter((risk) => risk.selected).length,
    [generatedRisks]
  );

  const baselineCount = useMemo(
    () => generatedRisks.filter((risk) => risk.source_type === "template").length,
    [generatedRisks]
  );

  const aiCount = useMemo(
    () => generatedRisks.filter((risk) => risk.source_type === "ai").length,
    [generatedRisks]
  );

  const highCount = useMemo(
    () => generatedRisks.filter((risk) => risk.level === "high").length,
    [generatedRisks]
  );

  if (loading) {
    return (
      <section className="flex-1 bg-slate-50 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
            Loading step 7...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 bg-slate-50 py-16">
      <div className="mx-auto w-full max-w-5xl px-6">
        <div className="mb-10">
          <p className="text-sm font-semibold text-violet-600">Step 7 of 8</p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
            Generate Initial Risks
          </h1>

          <p className="mt-2 max-w-3xl text-slate-500">
            We combine baseline risk templates with AI-based project-specific
            suggestions for{" "}
            <span className="font-medium text-slate-700">{project?.name}</span>.
            Review the proposed risks, deselect anything irrelevant, and continue.
          </p>

          <div className="mt-6 flex items-center gap-6">
            <div className="h-3 flex-1 rounded-full bg-slate-200">
              <div className="h-3 w-[87.5%] rounded-full bg-violet-500" />
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
              87.5%
            </div>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                    <Sparkles className="h-4 w-4" />
                    Risk Intelligence
                  </div>

                  <h2 className="mt-4 text-2xl font-semibold text-slate-900">
                    Generate your first risk register
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    This step generates baseline risks from your project profile
                    and adds extra AI suggestions for project-specific context.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateRisks}
                  disabled={generating || savingStep}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate risks
                    </>
                  )}
                </button>
              </div>
            </div>

            {generatedRisks.length > 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      Proposed risks
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Select the risks you want to add to the project register.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
                    {selectedCount} selected
                  </div>
                </div>

                <div className="space-y-4">
                  {generatedRisks.map((risk, index) => {
                    const expanded = expandedIndex === index;

                    return (
                      <div
                        key={`${risk.title}-${index}`}
                        className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                      >
                        <div className="flex flex-col gap-4 p-5">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex items-start gap-4">
                              <button
                                type="button"
                                onClick={() => toggleRisk(index)}
                                className={`mt-1 inline-flex h-6 w-6 items-center justify-center rounded-md border transition ${
                                  risk.selected
                                    ? "border-violet-500 bg-violet-600 text-white"
                                    : "border-slate-300 bg-white text-transparent"
                                }`}
                              >
                                <Check className="h-4 w-4" />
                              </button>

                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="text-base font-semibold text-slate-900">
                                    {risk.title}
                                  </h3>

                                  <span
                                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${sourceClasses(
                                      risk.source_type
                                    )}`}
                                  >
                                    {risk.source_type === "template"
                                      ? "Baseline"
                                      : "AI suggestion"}
                                  </span>

                                  <span
                                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${levelClasses(
                                      risk.level
                                    )}`}
                                  >
                                    {risk.level}
                                  </span>
                                </div>

                                <p className="mt-2 text-sm text-slate-500">
                                  {risk.category} • Probability {risk.probability} •
                                  Impact {risk.impact} • Score {risk.score}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => toggleExpand(index)}
                              className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
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
                            <div className="rounded-2xl bg-slate-50 p-4">
                              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Description
                                  </p>
                                  <p className="mt-1 text-sm leading-6 text-slate-700">
                                    {risk.description || "—"}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Suggested action
                                  </p>
                                  <p className="mt-1 text-sm leading-6 text-slate-700">
                                    {risk.suggested_action || "—"}
                                  </p>
                                </div>
                              </div>

                              {risk.generation_reason && (
                                <div className="mt-4">
                                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Why this was included
                                  </p>
                                  <p className="mt-1 text-sm leading-6 text-slate-700">
                                    {risk.generation_reason}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => router.push(`/app/projects/${projectId}/intake/step-6`)}
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveAndContinue}
                    disabled={savingRisks || generating || selectedCount === 0}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingRisks ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Continue to review
                        <Check className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">
                Project context
              </h3>

              <div className="mt-5 space-y-4 text-sm">
                <div>
                  <p className="text-slate-400">Project</p>
                  <p className="mt-1 font-medium text-slate-800">{project?.name || "—"}</p>
                </div>

                <div>
                  <p className="text-slate-400">Type</p>
                  <p className="mt-1 font-medium text-slate-800">
                    {project?.project_type || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400">Contract</p>
                  <p className="mt-1 font-medium text-slate-800">
                    {project?.contract_type || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400">Location</p>
                  <p className="mt-1 font-medium text-slate-800">
                    {[project?.city, project?.region, project?.country]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400">Site type</p>
                  <p className="mt-1 font-medium text-slate-800">
                    {project?.site_type || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400">Permit required</p>
                  <p className="mt-1 font-medium text-slate-800">
                    {project?.permit_required === null
                      ? "Unknown"
                      : project?.permit_required
                      ? "Yes"
                      : "No"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">
                Generation summary
              </h3>

              <div className="mt-5 space-y-3">
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
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <AlertTriangle className="h-4 w-4" />
                    High risks
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    {highCount}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Check className="h-4 w-4" />
                    Selected
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    {selectedCount}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">
                How this works
              </h3>

              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <li>• Baseline risks come from your template library.</li>
                <li>• AI adds only extra project-specific suggestions.</li>
                <li>• High risks can automatically create mitigation actions.</li>
                <li>• You stay in control by selecting what gets saved.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}