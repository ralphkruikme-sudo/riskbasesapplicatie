"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams, useRouter } from "next/navigation";
import {
  Sparkles,
  Loader2,
  Check,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Brain,
  WandSparkles,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Cpu,
  FileSearch,
  Layers3,
  CheckCircle2,
  Filter,
  Gauge,
  ClipboardList,
  Bot,
  Database,
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Project = {
  id: string;
  name: string | null;
  description: string | null;
  project_type: string | null;
  contract_type: string | null;
  project_value: number | null;
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
  authority_stakeholder: string | null;
  main_contractor: string | null;
  subcontractors: string | null;
  sector: string | null;
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
  applied_rule_codes?: string[];
  confidence?: number | null;
  learning_score?: number;
  ranking_score?: number;
  final_reason?: string | null;
  included_by_ai?: boolean;
  included_by_template?: boolean;
};

type GenerateResponse = {
  success?: boolean;
  baselineGenerationId?: string | null;
  baseline?: any[];
  ai?: any[];
  combined?: any[];
  matchedRuleCount?: number;
  matchedTemplateCount?: number;
  learningStatsUsedCount?: number;
  projectContextBlob?: string;
  error?: string;
};

type FilterKey = "all" | "baseline" | "ai" | "high" | "selected";

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
  return "border-[#C9D8FF] bg-[#EEF4FF] text-[#2457FF]";
}

function cardAccent(level: GeneratedRisk["level"]) {
  if (level === "high") return "border-l-red-500";
  if (level === "medium") return "border-l-amber-500";
  return "border-l-emerald-500";
}

function formatLocation(project: Project | null) {
  if (!project) return "—";
  return [project.city, project.region, project.country].filter(Boolean).join(", ") || "—";
}

function formatProjectValue(value: number | null) {
  if (value === null || value === undefined) return "—";
  return `€ ${new Intl.NumberFormat("nl-NL").format(value)}`;
}

function dedupeByTitle(risks: GeneratedRisk[]) {
  const seen = new Set<string>();
  return risks.filter((risk) => {
    const key = risk.title.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeRiskResponseRisk(risk: any): GeneratedRisk {
  const probability = Number(risk.probability ?? 3);
  const impact = Number(risk.impact ?? 3);
  const score = Number(risk.score ?? probability * impact);

  let level: "low" | "medium" | "high" = "medium";
  if (score >= 15) level = "high";
  else if (score <= 6) level = "low";

  return {
    title: risk.title ?? "",
    description: risk.description ?? "",
    category: risk.category ?? "Technical",
    probability,
    impact,
    score,
    level: (risk.level ?? level) as "low" | "medium" | "high",
    suggested_action: risk.suggested_action ?? "",
    source_type: (risk.source_type ?? "ai") as "template" | "ai",
    source_template_id: risk.source_template_id ?? null,
    generation_reason: risk.generation_reason ?? null,
    selected: true,
    applied_rule_codes: risk.applied_rule_codes ?? [],
    confidence: typeof risk.confidence === "number" ? risk.confidence : null,
    learning_score: typeof risk.learning_score === "number" ? risk.learning_score : 0,
    ranking_score: typeof risk.ranking_score === "number" ? risk.ranking_score : 0,
    final_reason: risk.final_reason ?? null,
    included_by_ai: !!risk.included_by_ai,
    included_by_template: !!risk.included_by_template,
  };
}

function formatConfidence(value?: number | null) {
  if (typeof value !== "number") return "—";
  return `${Math.round(value * 100)}%`;
}

function formatLearningScore(value?: number | null) {
  if (typeof value !== "number") return "—";
  return value.toFixed(2);
}

function getStorageKey(projectId: string) {
  return `riskbases_step7_selection_${projectId}`;
}

export default function Step7Page() {
  const router = useRouter();
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [savingSelection, setSavingSelection] = useState(false);
  const [message, setMessage] = useState("");
  const [generatedRisks, setGeneratedRisks] = useState<GeneratedRisk[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const [matchedRuleCount, setMatchedRuleCount] = useState(0);
  const [matchedTemplateCount, setMatchedTemplateCount] = useState(0);
  const [learningStatsUsedCount, setLearningStatsUsedCount] = useState(0);
  const [baselineGenerationId, setBaselineGenerationId] = useState<string | null>(null);
  const [projectContextBlob, setProjectContextBlob] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  useEffect(() => {
    async function loadProject() {
      try {
        setLoading(true);
        setMessage("");

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
            authority_stakeholder,
            main_contractor,
            subcontractors,
            sector
          `)
          .eq("id", projectId)
          .single();

        if (error) throw error;
        setProject(data);

        const savedSelection = sessionStorage.getItem(getStorageKey(projectId));
        if (savedSelection) {
          const parsed = JSON.parse(savedSelection);
          if (Array.isArray(parsed.generatedRisks)) {
            setGeneratedRisks(parsed.generatedRisks);
            setBaselineGenerationId(parsed.baselineGenerationId ?? null);
            setMatchedRuleCount(Number(parsed.matchedRuleCount ?? 0));
            setMatchedTemplateCount(Number(parsed.matchedTemplateCount ?? 0));
            setLearningStatsUsedCount(Number(parsed.learningStatsUsedCount ?? 0));
            setProjectContextBlob(parsed.projectContextBlob ?? "");
            setExpandedIndex(parsed.generatedRisks.length > 0 ? 0 : null);
          }
        }
      } catch (error: any) {
        console.error("LOAD STEP 7 PROJECT ERROR:", error);
        setProject(null);
        setMessage(error?.message || "Could not load Step 7.");
      } finally {
        setLoading(false);
      }
    }

    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  async function handleGenerateRisks() {
    if (!project) return;

    setGenerating(true);
    setMessage("");
    setGeneratedRisks([]);
    setBaselineGenerationId(null);
    setMatchedRuleCount(0);
    setMatchedTemplateCount(0);
    setLearningStatsUsedCount(0);
    setProjectContextBlob("");

    try {
      const response = await fetch(`/api/generate-risk/${projectId}`, {
        method: "POST",
      });

      const data: GenerateResponse = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Risk generation failed.");
      }

      const combined = dedupeByTitle((data.combined || []).map(normalizeRiskResponseRisk));

      setBaselineGenerationId(data.baselineGenerationId ?? null);
      setMatchedRuleCount(Number(data.matchedRuleCount ?? 0));
      setMatchedTemplateCount(Number(data.matchedTemplateCount ?? 0));
      setLearningStatsUsedCount(Number(data.learningStatsUsedCount ?? 0));
      setProjectContextBlob(data.projectContextBlob ?? "");
      setGeneratedRisks(combined);
      setExpandedIndex(combined.length > 0 ? 0 : null);
      setActiveFilter("all");

      sessionStorage.setItem(
        getStorageKey(projectId),
        JSON.stringify({
          baselineGenerationId: data.baselineGenerationId ?? null,
          matchedRuleCount: Number(data.matchedRuleCount ?? 0),
          matchedTemplateCount: Number(data.matchedTemplateCount ?? 0),
          learningStatsUsedCount: Number(data.learningStatsUsedCount ?? 0),
          projectContextBlob: data.projectContextBlob ?? "",
          generatedRisks: combined,
        })
      );

      if (combined.length === 0) {
        setMessage(
          "No baseline risks were generated. Check your template logic, rules and project context."
        );
      } else {
        setMessage(
          "Initial baseline generated. Review the proposed risks and continue to Step 8 for final publishing."
        );
      }
    } catch (error: any) {
      console.error("GENERATE RISKS ERROR:", error);
      setMessage(error?.message || "Could not generate risks.");
    } finally {
      setGenerating(false);
    }
  }

  function persistSelection(nextRisks: GeneratedRisk[]) {
    sessionStorage.setItem(
      getStorageKey(projectId),
      JSON.stringify({
        baselineGenerationId,
        matchedRuleCount,
        matchedTemplateCount,
        learningStatsUsedCount,
        projectContextBlob,
        generatedRisks: nextRisks,
      })
    );
  }

  function toggleRisk(index: number) {
    setGeneratedRisks((prev) => {
      const next = prev.map((risk, i) =>
        i === index ? { ...risk, selected: !risk.selected } : risk
      );
      persistSelection(next);
      return next;
    });
  }

  function toggleAllVisible(checked: boolean) {
    setGeneratedRisks((prev) => {
      const next = prev.map((risk) => {
        const shouldAffect =
          activeFilter === "all" ||
          (activeFilter === "baseline" && risk.source_type === "template") ||
          (activeFilter === "ai" && risk.source_type === "ai") ||
          (activeFilter === "high" && risk.level === "high") ||
          (activeFilter === "selected" && risk.selected);

        return shouldAffect ? { ...risk, selected: checked } : risk;
      });
      persistSelection(next);
      return next;
    });
  }

  function toggleExpand(index: number) {
    setExpandedIndex((prev) => (prev === index ? null : index));
  }

  async function handleContinueToStep8() {
    const selected = generatedRisks.filter((risk) => risk.selected);

    if (selected.length === 0) {
      setMessage("Select at least one generated risk before continuing.");
      return;
    }

    setSavingSelection(true);
    setMessage("");

    try {
      persistSelection(generatedRisks);
      router.push(`/intake/${projectId}/step-8`);
    } catch (error: any) {
      console.error("STEP 7 CONTINUE ERROR:", error);
      setMessage(error?.message || "Could not continue to Step 8.");
    } finally {
      setSavingSelection(false);
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

  const mediumCount = useMemo(
    () => generatedRisks.filter((risk) => risk.level === "medium").length,
    [generatedRisks]
  );

  const lowCount = useMemo(
    () => generatedRisks.filter((risk) => risk.level === "low").length,
    [generatedRisks]
  );

  const filteredRisks = useMemo(() => {
    switch (activeFilter) {
      case "baseline":
        return generatedRisks.filter((risk) => risk.source_type === "template");
      case "ai":
        return generatedRisks.filter((risk) => risk.source_type === "ai");
      case "high":
        return generatedRisks.filter((risk) => risk.level === "high");
      case "selected":
        return generatedRisks.filter((risk) => risk.selected);
      case "all":
      default:
        return generatedRisks;
    }
  }, [generatedRisks, activeFilter]);

  const visibleSelectedCount = useMemo(
    () => filteredRisks.filter((risk) => risk.selected).length,
    [filteredRisks]
  );

  const allVisibleSelected =
    filteredRisks.length > 0 && filteredRisks.every((risk) => risk.selected);

  if (loading) {
    return (
      <section className="min-h-screen bg-[#F4F7FB] px-6 py-10">
        <div className="mx-auto max-w-[1240px]">
          <div className="rounded-[30px] border border-[#D8E1EC] bg-white p-8 shadow-[0_12px_32px_rgba(15,23,42,0.05)]">
            <div className="flex items-center gap-3 text-sm font-medium text-[#4B5B73]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading step 7...
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!project) {
    return (
      <section className="min-h-screen bg-[#F4F7FB] px-6 py-10">
        <div className="mx-auto max-w-[1240px]">
          <div className="rounded-[30px] border border-[#D8E1EC] bg-white p-8 shadow-[0_12px_32px_rgba(15,23,42,0.05)]">
            <h1 className="text-2xl font-semibold tracking-tight text-[#0F172A]">
              Project not found
            </h1>
            <p className="mt-2 text-sm text-[#4B5B73]">
              {message || "We could not load this project for the intake flow."}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#F4F7FB] px-6 py-10">
      <div className="mx-auto w-full max-w-[1240px]">
        <div className="mb-8">
          <p className="text-sm font-semibold tracking-[0.02em] text-[#2457FF]">
            Step 7 of 8
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-[#081226] md:text-[54px]">
            Generate initial baseline
          </h1>

          <p className="mt-4 max-w-4xl text-[15px] leading-7 text-[#4B5B73]">
            RiskBases combines template matching, rules intelligence and restrained AI enrichment
            to generate the first version of your project baseline. Review the proposed risks here,
            then continue to Step 8 for final publish into the live project environment.
          </p>

          <div className="mt-8 flex items-center gap-4">
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#DCE4EE]">
              <div className="h-full w-[88%] rounded-full bg-[#2457FF]" />
            </div>

            <div className="flex h-11 min-w-[74px] items-center justify-center rounded-2xl border border-[#D8E1EC] bg-white px-4 text-sm font-semibold text-[#0F172A]">
              88%
            </div>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-[22px] border border-[#D8E1EC] bg-white px-5 py-4 text-sm text-[#4B5B73] shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.45fr_0.55fr]">
          <div className="space-y-6">
            <div className="rounded-[32px] border border-[#D8E1EC] bg-white p-8 shadow-[0_14px_36px_rgba(15,23,42,0.05)] md:p-10">
              <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#C9D8FF] bg-[#EEF4FF] px-3 py-1 text-xs font-semibold text-[#2457FF]">
                    <WandSparkles className="h-4 w-4" />
                    Baseline generation cockpit
                  </div>

                  <h2 className="mt-4 text-[30px] font-semibold tracking-[-0.03em] text-[#081226]">
                    Generate and review your first project baseline
                  </h2>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-[#4B5B73]">
                    This step translates project intake context into a practical first baseline.
                    You can review, compare and pre-select which risks should move to Step 8.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleGenerateRisks}
                    disabled={generating}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#2457FF] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(36,87,255,0.22)] transition hover:bg-[#1D4BE0] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Generate baseline
                      </>
                    )}
                  </button>

                  {generatedRisks.length > 0 && (
                    <button
                      type="button"
                      onClick={handleGenerateRisks}
                      disabled={generating}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#D8E1EC] bg-white px-5 py-3 text-sm font-semibold text-[#1E293B] transition hover:bg-[#F8FAFC]"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Regenerate
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
                    <Database className="h-4 w-4 text-[#2457FF]" />
                    Template library
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#4B5B73]">
                    Risks matched to sector, project type, site context and delivery phase.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
                    <Cpu className="h-4 w-4 text-[#2457FF]" />
                    Rules intelligence
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#4B5B73]">
                    Active rules suppress nonsense and boost risks that structurally matter more.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
                    <Bot className="h-4 w-4 text-[#2457FF]" />
                    AI enrichment
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#4B5B73]">
                    AI only adds project-specific gaps beyond the baseline, not random noise.
                  </p>
                </div>
              </div>
            </div>

            {generatedRisks.length > 0 && (
              <div className="rounded-[32px] border border-[#D8E1EC] bg-white p-8 shadow-[0_14px_36px_rgba(15,23,42,0.05)] md:p-10">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                      <h2 className="text-[30px] font-semibold tracking-[-0.03em] text-[#081226]">
                        Proposed baseline risks
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-[#4B5B73]">
                        Deselect any irrelevant risks. Step 8 will be the final publish checkpoint.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {([
                        ["all", "All"],
                        ["baseline", "Baseline"],
                        ["ai", "AI"],
                        ["high", "High"],
                        ["selected", "Selected"],
                      ] as [FilterKey, string][]).map(([key, label]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setActiveFilter(key)}
                          className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                            activeFilter === key
                              ? "border-[#2457FF] bg-[#2457FF] text-white"
                              : "border-[#D8E1EC] bg-white text-[#4B5B73] hover:bg-[#F8FAFC]"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7A90]">
                        Total risks
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-[#081226]">
                        {generatedRisks.length}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7A90]">
                        Selected
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-[#081226]">
                        {selectedCount}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7A90]">
                        High severity
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-[#081226]">
                        {highCount}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7A90]">
                        Visible selected
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-[#081226]">
                        {visibleSelectedCount}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-[#1E293B]">
                      <Filter className="h-4 w-4 text-[#2457FF]" />
                      Bulk selection for current filter
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleAllVisible(true)}
                        className="rounded-xl border border-[#D8E1EC] bg-white px-3 py-2 text-sm font-semibold text-[#1E293B] hover:bg-[#FDFEFF]"
                      >
                        Select visible
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleAllVisible(false)}
                        className="rounded-xl border border-[#D8E1EC] bg-white px-3 py-2 text-sm font-semibold text-[#1E293B] hover:bg-[#FDFEFF]"
                      >
                        Deselect visible
                      </button>
                      <div className="rounded-xl border border-[#D8E1EC] bg-white px-3 py-2 text-sm font-medium text-[#4B5B73]">
                        {allVisibleSelected ? "All visible selected" : "Partial selection"}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {filteredRisks.map((risk) => {
                      const realIndex = generatedRisks.findIndex(
                        (r) =>
                          r.title === risk.title &&
                          r.source_type === risk.source_type &&
                          r.score === risk.score
                      );
                      const expanded = expandedIndex === realIndex;

                      return (
                        <div
                          key={`${risk.title}-${risk.source_type}-${realIndex}`}
                          className={`overflow-hidden rounded-[24px] border border-[#D8E1EC] border-l-4 bg-white ${cardAccent(
                            risk.level
                          )}`}
                        >
                          <div className="p-5 md:p-6">
                            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                              <div className="flex items-start gap-4">
                                <button
                                  type="button"
                                  onClick={() => toggleRisk(realIndex)}
                                  className={`mt-1 inline-flex h-6 w-6 items-center justify-center rounded-md border transition ${
                                    risk.selected
                                      ? "border-[#2457FF] bg-[#2457FF] text-white"
                                      : "border-slate-300 bg-white text-transparent"
                                  }`}
                                >
                                  <Check className="h-4 w-4" />
                                </button>

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

                                    {risk.selected && (
                                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                        selected
                                      </span>
                                    )}
                                  </div>

                                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#6B7A90]">
                                    <span>{risk.category}</span>
                                    <span>Probability {risk.probability}</span>
                                    <span>Impact {risk.impact}</span>
                                    <span>Score {risk.score}</span>
                                    <span>Confidence {formatConfidence(risk.confidence)}</span>
                                    <span>Learning {formatLearningScore(risk.learning_score)}</span>
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => toggleExpand(realIndex)}
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
                              <div className="mt-5 rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] p-4 md:p-5">
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

                                <div className="mt-5 grid gap-4 md:grid-cols-3">
                                  <div className="rounded-xl border border-[#D8E1EC] bg-white p-3">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7A90]">
                                      Source
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-[#0F172A]">
                                      {risk.source_type === "template" ? "Baseline template" : "AI enrichment"}
                                    </p>
                                  </div>

                                  <div className="rounded-xl border border-[#D8E1EC] bg-white p-3">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7A90]">
                                      Confidence
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-[#0F172A]">
                                      {formatConfidence(risk.confidence)}
                                    </p>
                                  </div>

                                  <div className="rounded-xl border border-[#D8E1EC] bg-white p-3">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7A90]">
                                      Ranking score
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-[#0F172A]">
                                      {typeof risk.ranking_score === "number"
                                        ? risk.ranking_score.toFixed(2)
                                        : "—"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 flex flex-col gap-3 rounded-[24px] border border-[#D8E1EC] bg-[#F8FAFC] p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#0F172A]">
                        Continue to final review
                      </p>
                      <p className="mt-1 text-sm text-[#6B7A90]">
                        {selectedCount} of {generatedRisks.length} risks are pre-selected for Step 8.
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => router.push(`/intake/${projectId}/step-6`)}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#D8E1EC] bg-white px-5 py-3 text-sm font-semibold text-[#1E293B] transition hover:bg-[#F8FAFC]"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                      </button>

                      <button
                        type="button"
                        onClick={handleContinueToStep8}
                        disabled={savingSelection || generating || selectedCount === 0}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#2457FF] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(36,87,255,0.22)] transition hover:bg-[#1D4BE0] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {savingSelection ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving selection...
                          </>
                        ) : (
                          <>
                            Continue to Step 8
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] border border-[#D8E1EC] bg-white p-7 shadow-[0_14px_36px_rgba(15,23,42,0.05)]">
              <h3 className="text-xl font-semibold tracking-tight text-[#081226]">
                Project snapshot
              </h3>

              <div className="mt-5 space-y-4 text-sm">
                <div>
                  <p className="text-[#6B7A90]">Project</p>
                  <p className="mt-1 font-medium text-[#0F172A]">{project.name || "—"}</p>
                </div>

                <div>
                  <p className="text-[#6B7A90]">Sector</p>
                  <p className="mt-1 font-medium text-[#0F172A]">{project.sector || "—"}</p>
                </div>

                <div>
                  <p className="text-[#6B7A90]">Type</p>
                  <p className="mt-1 font-medium text-[#0F172A]">{project.project_type || "—"}</p>
                </div>

                <div>
                  <p className="text-[#6B7A90]">Contract</p>
                  <p className="mt-1 font-medium text-[#0F172A]">{project.contract_type || "—"}</p>
                </div>

                <div>
                  <p className="text-[#6B7A90]">Project value</p>
                  <p className="mt-1 font-medium text-[#0F172A]">
                    {formatProjectValue(project.project_value || null)}
                  </p>
                </div>

                <div>
                  <p className="text-[#6B7A90]">Location</p>
                  <p className="mt-1 font-medium text-[#0F172A]">{formatLocation(project)}</p>
                </div>

                <div>
                  <p className="text-[#6B7A90]">Site type</p>
                  <p className="mt-1 font-medium text-[#0F172A]">{project.site_type || "—"}</p>
                </div>

                <div>
                  <p className="text-[#6B7A90]">Permit required</p>
                  <p className="mt-1 font-medium text-[#0F172A]">
                    {project.permit_required === null
                      ? "Unknown"
                      : project.permit_required
                      ? "Yes"
                      : "No"}
                  </p>
                </div>

                <div>
                  <p className="text-[#6B7A90]">Project phase</p>
                  <p className="mt-1 font-medium text-[#0F172A]">{project.project_phase || "—"}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-[#D8E1EC] bg-white p-7 shadow-[0_14px_36px_rgba(15,23,42,0.05)]">
              <h3 className="text-xl font-semibold tracking-tight text-[#081226]">
                Generation summary
              </h3>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-[#F8FAFC] px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-[#1E293B]">
                    <ShieldAlert className="h-4 w-4" />
                    Baseline risks
                  </div>
                  <span className="text-sm font-semibold text-[#0F172A]">{baselineCount}</span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-[#F8FAFC] px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-[#1E293B]">
                    <Brain className="h-4 w-4" />
                    AI suggestions
                  </div>
                  <span className="text-sm font-semibold text-[#0F172A]">{aiCount}</span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-[#F8FAFC] px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-[#1E293B]">
                    <AlertTriangle className="h-4 w-4" />
                    High risks
                  </div>
                  <span className="text-sm font-semibold text-[#0F172A]">{highCount}</span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-[#F8FAFC] px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-[#1E293B]">
                    <Gauge className="h-4 w-4" />
                    Medium risks
                  </div>
                  <span className="text-sm font-semibold text-[#0F172A]">{mediumCount}</span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-[#F8FAFC] px-4 py-3">
                  <span className="text-sm font-medium text-[#1E293B]">Low risks</span>
                  <span className="text-sm font-semibold text-[#0F172A]">{lowCount}</span>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-[#D8E1EC] bg-white p-7 shadow-[0_14px_36px_rgba(15,23,42,0.05)]">
              <h3 className="text-xl font-semibold tracking-tight text-[#081226]">
                Intelligence summary
              </h3>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-[#F8FAFC] px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-[#1E293B]">
                    <Layers3 className="h-4 w-4" />
                    Matched templates
                  </div>
                  <span className="text-sm font-semibold text-[#0F172A]">
                    {matchedTemplateCount}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-[#F8FAFC] px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-[#1E293B]">
                    <Cpu className="h-4 w-4" />
                    Matched rules
                  </div>
                  <span className="text-sm font-semibold text-[#0F172A]">
                    {matchedRuleCount}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-[#F8FAFC] px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-[#1E293B]">
                    <Brain className="h-4 w-4" />
                    Learning signals used
                  </div>
                  <span className="text-sm font-semibold text-[#0F172A]">
                    {learningStatsUsedCount}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-[#F8FAFC] px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-[#1E293B]">
                    <ClipboardList className="h-4 w-4" />
                    Baseline generation ID
                  </div>
                  <span className="max-w-[145px] truncate text-right text-sm font-semibold text-[#0F172A]">
                    {baselineGenerationId || "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-[#DCE7FF] bg-[#F7FAFF] p-7 shadow-[0_14px_36px_rgba(15,23,42,0.05)]">
              <div className="flex items-center gap-2 text-[#2457FF]">
                <FileSearch className="h-4 w-4" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em]">
                  RiskBases logic
                </p>
              </div>

              <p className="mt-3 text-sm leading-6 text-[#36506C]">
                The quality of this baseline depends on three layers working together:
                strong templates, strong rules and restrained AI enrichment. Step 7 is generation and pre-selection.
                Step 8 is your final publish checkpoint.
              </p>

              {projectContextBlob && (
                <div className="mt-5 rounded-2xl border border-[#D8E7FF] bg-white p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7A90]">
                    Context snapshot used
                  </p>
                  <p className="mt-2 max-h-[180px] overflow-auto whitespace-pre-line text-sm leading-6 text-[#36506C]">
                    {projectContextBlob}
                  </p>
                </div>
              )}
            </div>

            {generatedRisks.length > 0 && (
              <div className="rounded-[32px] border border-emerald-200 bg-emerald-50 p-7 shadow-[0_14px_36px_rgba(15,23,42,0.05)]">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-[#0F172A]">
                      Ready for final review
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[#36506C]">
                      Your current selection is stored for Step 8, where you can do the final review and publish into the live project environment.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}