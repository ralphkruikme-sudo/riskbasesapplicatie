import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type ProjectRow = {
  id: string;
  name: string;
  description: string | null;
  project_type: string | null;
  contract_type: string | null;
  project_value: number | null;
  client_name: string | null;
  city: string | null;
  country: string | null;
  site_type: string | null;
  permit_required: boolean | null;
  project_phase: string | null;
  key_milestones: string | null;
  critical_dependencies: string | null;
  authority_stakeholder: string | null;
  main_contractor: string | null;
  subcontractors: string | null;
  sector: string | null;
  review_frequency?: string | null;
};

type RiskTemplateRow = {
  id: string;
  code?: string | null;
  title: string;
  description: string | null;
  category: string;
  risk_type: string | null;
  sector: string | null;
  project_type: string | null;
  contract_type: string | null;
  site_type: string | null;
  project_phase: string | null;
  permit_required: boolean | null;
  default_probability: number;
  default_impact: number;
  default_level: string | null;
  suggested_action: string | null;
  tags: string[] | null;
  metadata_json?: Record<string, any> | null;
  is_active: boolean;
};

type RiskRuleRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  condition_json: RuleCondition | null;
  outcome_json: RuleOutcome | null;
  weight: number | null;
  is_active: boolean;
};

type LearningStatRow = {
  id: string;
  template_id: string;
  sector: string | null;
  project_type: string | null;
  site_type: string | null;
  project_phase: string | null;
  projects_seen: number | null;
  baseline_included_count: number | null;
  accepted_count: number | null;
  dismissed_count: number | null;
  manually_added_count: number | null;
  occurred_count: number | null;
  avg_delay_days: number | null;
  avg_cost_impact: number | null;
  avg_probability: number | null;
  avg_impact: number | null;
  confidence_score: number | null;
  last_calculated_at: string | null;
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
  applied_rule_codes?: string[];
  confidence?: number;
  risk_type?: string | null;
  tags?: string[] | null;
  learning_score?: number;
  ranking_score?: number;
  final_reason?: string | null;
  included_by_ai?: boolean;
  included_by_template?: boolean;
  excluded_by_rule?: boolean;
  matched_rule_ids?: string[];
};

type RulePredicate = {
  field: string;
  op:
    | "eq"
    | "neq"
    | "gt"
    | "gte"
    | "lt"
    | "lte"
    | "contains"
    | "contains_any"
    | "in"
    | "is_empty"
    | "is_not_empty";
  value: unknown;
};

type RuleCondition = {
  all?: RulePredicate[];
  any?: RulePredicate[];
  not?: RulePredicate[];
};

type RuleOutcome =
  | {
      effect: "exclude_risk_type";
      risk_type: string;
      reason: string;
    }
  | {
      effect: "exclude_tag";
      tag: string;
      reason: string;
    }
  | {
      effect: "boost_category";
      category: string;
      severity_delta?: number;
      confidence_delta?: number;
      reason: string;
    }
  | {
      effect: "boost_multi_category";
      categories: string[];
      severity_delta?: number;
      confidence_delta?: number;
      reason: string;
    }
  | {
      effect: "boost_risk_type";
      risk_type: string;
      severity_delta?: number;
      confidence_delta?: number;
      reason: string;
    }
  | {
      effect: "boost_multi_risk_type";
      risk_types: string[];
      severity_delta?: number;
      confidence_delta?: number;
      reason: string;
    }
  | {
      effect: "boost_tag";
      tag: string;
      severity_delta?: number;
      confidence_delta?: number;
      reason: string;
    }
  | {
      effect: "add_monitoring_risk";
      category: string;
      risk_type: string;
      severity_delta?: number;
      confidence_delta?: number;
      reason: string;
    };

type AppliedRuleMatch = {
  ruleId: string;
  ruleCode: string;
  ruleName: string;
  reason: string;
};

type RuleApplicationResult = {
  risk: GeneratedRisk | null;
  appliedMatches: AppliedRuleMatch[];
  excludedByRule: boolean;
};

type BaselineGenerationItemInsert = {
  baseline_generation_id: string;
  source_type: string;
  source_reference: string | null;
  title: string;
  description: string;
  reason: string;
  category: string;
  risk_type: string | null;
  suggested_probability: number;
  suggested_impact: number;
  suggested_level: string;
  suggested_actions_json: Record<string, any> | null;
  confidence: number | null;
  review_status: string;
  rule_id: string | null;
  suggested_inherent_probability: number;
  suggested_inherent_impact: number;
  suggested_inherent_level: string;
  suggested_inherent_rating: number;
  suggested_managed_probability: number;
  suggested_managed_impact: number;
  suggested_managed_level: string;
  suggested_managed_rating: number;
  learning_score: number;
  ranking_score: number;
  final_reason: string | null;
  excluded_by_rule: boolean;
  included_by_ai: boolean;
  included_by_template: boolean;
};

type BaselineRuleMatchInsert = {
  baseline_generation_id: string;
  rule_id: string;
  matched: boolean;
  match_reason: string;
};

type BaselineGenerationInsert = {
  project_id: string;
  generation_type: string;
  status: string;
  model_provider: string | null;
  model_name: string | null;
  rules_version: string | null;
  prompt_version: string | null;
  started_at: string;
  finished_at: string;
  summary_json: Record<string, any>;
};

type ProjectImportRowDb = {
  id: string;
  row_index: number;
  row_json: Record<string, unknown> | null;
};

type GenerateRiskRequestBody = {
  projectId?: string;
  csvData?: unknown;
  importId?: string | null;
};

const ALLOWED_CATEGORIES = new Set([
  "Permits",
  "Planning",
  "Financial",
  "Safety",
  "Environment",
  "Suppliers",
  "Technical",
  "Stakeholders",
  "Weather",
  "Utilities",
  "Quality",
  "Contractual",
]);

function computeLevel(score: number): "low" | "medium" | "high" {
  if (score >= 15) return "high";
  if (score >= 7) return "medium";
  return "low";
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function normalizeText(value: string | null | undefined) {
  return (value || "").trim().toLowerCase();
}

function normalizeComparableValue(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ");
}

function sanitizeText(value: unknown, fallback = "") {
  if (typeof value !== "string") return fallback;
  return value.trim();
}

function sanitizeInt(value: unknown, fallback = 3) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return clamp(Math.round(n), 1, 5);
}

function sanitizeCategory(value: unknown) {
  const raw = sanitizeText(value, "Technical").trim();
  const normalized = raw.toLowerCase();

  const categoryMap: Record<string, string> = {
    permits: "Permits",
    permit: "Permits",
    planning: "Planning",
    financial: "Financial",
    finance: "Financial",
    safety: "Safety",
    environment: "Environment",
    environmental: "Environment",
    suppliers: "Suppliers",
    supplier: "Suppliers",
    technical: "Technical",
    stakeholders: "Stakeholders",
    stakeholder: "Stakeholders",
    weather: "Weather",
    utilities: "Utilities",
    utility: "Utilities",
    quality: "Quality",
    contractual: "Contractual",
    contract: "Contractual",
  };

  const mapped = categoryMap[normalized] || raw;
  return ALLOWED_CATEGORIES.has(mapped) ? mapped : "Technical";
}

function dedupeRisks(risks: GeneratedRisk[]) {
  const seen = new Set<string>();

  return risks.filter((risk) => {
    const key = normalizeText(risk.title);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getProjectContextBlob(project: ProjectRow) {
  return [
    project.name,
    project.description,
    project.project_type,
    project.contract_type,
    project.client_name,
    project.city,
    project.country,
    project.site_type,
    project.project_phase,
    project.key_milestones,
    project.critical_dependencies,
    project.authority_stakeholder,
    project.main_contractor,
    project.subcontractors,
    project.sector,
  ]
    .filter(Boolean)
    .join(" ");
}

function getProjectFieldValue(project: ProjectRow, field: string) {
  const key = field as keyof ProjectRow;
  return project[key];
}

function evaluatePredicate(project: ProjectRow, predicate: RulePredicate) {
  const fieldValue = getProjectFieldValue(project, predicate.field);
  const op = predicate.op;
  const ruleValue = predicate.value;

  if (op === "is_empty") {
    return (
      fieldValue === null ||
      fieldValue === undefined ||
      String(fieldValue).trim() === ""
    );
  }

  if (op === "is_not_empty") {
    return !(
      fieldValue === null ||
      fieldValue === undefined ||
      String(fieldValue).trim() === ""
    );
  }

  if (op === "eq") {
    return normalizeComparableValue(fieldValue) === normalizeComparableValue(ruleValue);
  }

  if (op === "neq") {
    return normalizeComparableValue(fieldValue) !== normalizeComparableValue(ruleValue);
  }

  if (op === "gt") return Number(fieldValue) > Number(ruleValue);
  if (op === "gte") return Number(fieldValue) >= Number(ruleValue);
  if (op === "lt") return Number(fieldValue) < Number(ruleValue);
  if (op === "lte") return Number(fieldValue) <= Number(ruleValue);

  if (op === "contains") {
    return normalizeComparableValue(fieldValue).includes(
      normalizeComparableValue(ruleValue)
    );
  }

  if (op === "contains_any") {
    const list = Array.isArray(ruleValue) ? ruleValue : [ruleValue];
    return list.some((item) =>
      normalizeComparableValue(fieldValue).includes(normalizeComparableValue(item))
    );
  }

  if (op === "in") {
    const list = Array.isArray(ruleValue) ? ruleValue : [ruleValue];
    return list.some(
      (item) =>
        normalizeComparableValue(fieldValue) === normalizeComparableValue(item)
    );
  }

  return false;
}

function evaluateCondition(
  project: ProjectRow,
  condition: RuleCondition | null | undefined
) {
  if (!condition) return false;

  const allOk =
    !condition.all || condition.all.every((predicate) => evaluatePredicate(project, predicate));

  const anyOk =
    !condition.any || condition.any.length === 0
      ? true
      : condition.any.some((predicate) => evaluatePredicate(project, predicate));

  const notOk =
    !condition.not || condition.not.every((predicate) => !evaluatePredicate(project, predicate));

  return allOk && anyOk && notOk;
}

function templateMatchesProject(template: RiskTemplateRow, project: ProjectRow) {
  const sectorMatch =
    !template.sector ||
    !project.sector ||
    normalizeComparableValue(template.sector) === normalizeComparableValue(project.sector);

  const projectTypeMatch =
    !template.project_type ||
    !project.project_type ||
    normalizeComparableValue(template.project_type) ===
      normalizeComparableValue(project.project_type);

  const contractMatch =
    !template.contract_type ||
    !project.contract_type ||
    normalizeComparableValue(template.contract_type) ===
      normalizeComparableValue(project.contract_type);

  const siteTypeMatch =
    !template.site_type ||
    !project.site_type ||
    normalizeComparableValue(template.site_type) ===
      normalizeComparableValue(project.site_type);

  const phaseMatch =
    !template.project_phase ||
    !project.project_phase ||
    normalizeComparableValue(template.project_phase) ===
      normalizeComparableValue(project.project_phase);

  const permitMatch =
    template.permit_required === null ||
    template.permit_required === undefined ||
    project.permit_required === null ||
    project.permit_required === undefined ||
    template.permit_required === project.permit_required;

  return (
    sectorMatch &&
    projectTypeMatch &&
    contractMatch &&
    siteTypeMatch &&
    phaseMatch &&
    permitMatch
  );
}

function templateBaseScore(template: RiskTemplateRow, project: ProjectRow) {
  let score = 0;

  if (
    template.sector &&
    project.sector &&
    normalizeComparableValue(template.sector) === normalizeComparableValue(project.sector)
  ) {
    score += 4;
  }

  if (
    template.project_type &&
    project.project_type &&
    normalizeComparableValue(template.project_type) ===
      normalizeComparableValue(project.project_type)
  ) {
    score += 5;
  }

  if (
    template.contract_type &&
    project.contract_type &&
    normalizeComparableValue(template.contract_type) ===
      normalizeComparableValue(project.contract_type)
  ) {
    score += 3;
  }

  if (
    template.site_type &&
    project.site_type &&
    normalizeComparableValue(template.site_type) ===
      normalizeComparableValue(project.site_type)
  ) {
    score += 3;
  }

  if (
    template.project_phase &&
    project.project_phase &&
    normalizeComparableValue(template.project_phase) ===
      normalizeComparableValue(project.project_phase)
  ) {
    score += 3;
  }

  if (
    template.permit_required !== null &&
    template.permit_required !== undefined &&
    project.permit_required !== null &&
    project.permit_required !== undefined &&
    template.permit_required === project.permit_required
  ) {
    score += 2;
  }

  if (score === 0) {
    score = 1;
  }

  return score;
}

function getSpecificityScore(stat: LearningStatRow, project: ProjectRow) {
  let specificity = 0;

  if (
    stat.sector &&
    normalizeComparableValue(stat.sector) === normalizeComparableValue(project.sector)
  ) {
    specificity += 1;
  }

  if (
    stat.project_type &&
    normalizeComparableValue(stat.project_type) ===
      normalizeComparableValue(project.project_type)
  ) {
    specificity += 1;
  }

  if (
    stat.site_type &&
    normalizeComparableValue(stat.site_type) === normalizeComparableValue(project.site_type)
  ) {
    specificity += 1;
  }

  if (
    stat.project_phase &&
    normalizeComparableValue(stat.project_phase) ===
      normalizeComparableValue(project.project_phase)
  ) {
    specificity += 1;
  }

  return specificity;
}

function getBestLearningStat(
  stats: LearningStatRow[],
  templateId: string,
  project: ProjectRow
): LearningStatRow | null {
  const relevant = stats.filter((stat) => stat.template_id === templateId);
  if (relevant.length === 0) return null;

  return relevant.sort((a, b) => {
    const aSpecificity = getSpecificityScore(a, project);
    const bSpecificity = getSpecificityScore(b, project);

    if (bSpecificity !== aSpecificity) return bSpecificity - aSpecificity;
    return (b.confidence_score || 0) - (a.confidence_score || 0);
  })[0];
}

function calculateLearningScore(stat: LearningStatRow | null) {
  if (!stat) return 0;

  const baselineIncluded = stat.baseline_included_count || 0;
  const accepted = stat.accepted_count || 0;
  const dismissed = stat.dismissed_count || 0;
  const occurred = stat.occurred_count || 0;
  const manual = stat.manually_added_count || 0;
  const projectsSeen = stat.projects_seen || 0;
  const confidence = stat.confidence_score || 0;

  const acceptanceRate = baselineIncluded > 0 ? accepted / baselineIncluded : 0;
  const dismissalRate = baselineIncluded > 0 ? dismissed / baselineIncluded : 0;
  const occurrenceRate = projectsSeen > 0 ? occurred / projectsSeen : 0;
  const manualRate = projectsSeen > 0 ? manual / projectsSeen : 0;

  const score =
    confidence * 0.35 +
    acceptanceRate * 0.3 +
    occurrenceRate * 0.2 +
    manualRate * 0.15 -
    dismissalRate * 0.2;

  return clamp(Number(score.toFixed(4)), 0, 1);
}

function buildLearningReason(stat: LearningStatRow | null, learningScore: number) {
  if (!stat || learningScore <= 0) return null;

  const parts: string[] = [];

  if ((stat.accepted_count || 0) > 0) {
    parts.push(`historically accepted ${stat.accepted_count} time(s)`);
  }

  if ((stat.occurred_count || 0) > 0) {
    parts.push(`occurred ${stat.occurred_count} time(s) in similar projects`);
  }

  if ((stat.manually_added_count || 0) > 0) {
    parts.push(`manually added ${stat.manually_added_count} time(s)`);
  }

  if ((stat.confidence_score || 0) > 0) {
    parts.push(`learning confidence ${Number(stat.confidence_score || 0).toFixed(2)}`);
  }

  if (parts.length === 0) return null;

  return `Learning signal: ${parts.join(", ")}.`;
}

function mapTemplateToGeneratedRisk(template: RiskTemplateRow): GeneratedRisk {
  const probability = sanitizeInt(template.default_probability, 3);
  const impact = sanitizeInt(template.default_impact, 3);
  const score = probability * impact;

  return {
    title: sanitizeText(template.title, "Project risk"),
    description:
      sanitizeText(
        template.description,
        "Baseline project risk identified from the RiskBases template library."
      ) || "Baseline project risk identified from the RiskBases template library.",
    category: sanitizeCategory(template.category),
    probability,
    impact,
    score,
    level: computeLevel(score),
    suggested_action:
      sanitizeText(
        template.suggested_action,
        "Review this risk and define a mitigation action."
      ) || "Review this risk and define a mitigation action.",
    source_type: "template",
    source_template_id: template.id,
    generation_reason: "Matched from the RiskBases baseline risk template library.",
    applied_rule_codes: [],
    confidence: 0.68,
    risk_type: template.risk_type ?? null,
    tags: template.tags ?? [],
    learning_score: 0,
    ranking_score: 0,
    final_reason: null,
    included_by_ai: false,
    included_by_template: true,
    excluded_by_rule: false,
    matched_rule_ids: [],
  };
}

function riskMatchesTag(risk: GeneratedRisk, tag: string) {
  const haystack = [
    risk.title,
    risk.description,
    risk.category,
    risk.risk_type || "",
    ...(risk.tags || []),
  ].join(" ");

  return normalizeComparableValue(haystack).includes(normalizeComparableValue(tag));
}

function applyRulesToRisk(
  risk: GeneratedRisk,
  project: ProjectRow,
  rules: RiskRuleRow[]
): RuleApplicationResult {
  let nextRisk: GeneratedRisk = {
    ...risk,
    applied_rule_codes: [...(risk.applied_rule_codes || [])],
    matched_rule_ids: [...(risk.matched_rule_ids || [])],
  };

  const appliedMatches: AppliedRuleMatch[] = [];

  for (const rule of rules) {
    if (!rule.is_active) continue;
    if (!evaluateCondition(project, rule.condition_json)) continue;
    if (!rule.outcome_json) continue;

    const outcome = rule.outcome_json;
    const ruleCode = rule.code;
    const ruleName = rule.name || rule.code;

    if (outcome.effect === "exclude_risk_type") {
      if (
        normalizeComparableValue(nextRisk.risk_type) ===
        normalizeComparableValue(outcome.risk_type)
      ) {
        appliedMatches.push({
          ruleId: rule.id,
          ruleCode,
          ruleName,
          reason: outcome.reason,
        });

        return {
          risk: null,
          appliedMatches,
          excludedByRule: true,
        };
      }
    }

    if (outcome.effect === "exclude_tag") {
      if (riskMatchesTag(nextRisk, outcome.tag)) {
        appliedMatches.push({
          ruleId: rule.id,
          ruleCode,
          ruleName,
          reason: outcome.reason,
        });

        return {
          risk: null,
          appliedMatches,
          excludedByRule: true,
        };
      }
    }

    if (outcome.effect === "boost_category") {
      if (
        normalizeComparableValue(nextRisk.category) ===
        normalizeComparableValue(outcome.category)
      ) {
        const delta = outcome.severity_delta ?? 0;
        nextRisk.probability = clamp(nextRisk.probability + delta, 1, 5);
        nextRisk.score = nextRisk.probability * nextRisk.impact;
        nextRisk.level = computeLevel(nextRisk.score);
        nextRisk.confidence = clamp(
          (nextRisk.confidence ?? 0.65) + (outcome.confidence_delta ?? 0),
          0,
          1
        );
        nextRisk.applied_rule_codes?.push(ruleCode);
        nextRisk.matched_rule_ids?.push(rule.id);
        nextRisk.generation_reason = `${nextRisk.generation_reason} ${outcome.reason}`.trim();

        appliedMatches.push({
          ruleId: rule.id,
          ruleCode,
          ruleName,
          reason: outcome.reason,
        });
      }
    }

    if (outcome.effect === "boost_multi_category") {
      if (
        outcome.categories.some(
          (cat) =>
            normalizeComparableValue(cat) === normalizeComparableValue(nextRisk.category)
        )
      ) {
        const delta = outcome.severity_delta ?? 0;
        nextRisk.probability = clamp(nextRisk.probability + delta, 1, 5);
        nextRisk.score = nextRisk.probability * nextRisk.impact;
        nextRisk.level = computeLevel(nextRisk.score);
        nextRisk.confidence = clamp(
          (nextRisk.confidence ?? 0.65) + (outcome.confidence_delta ?? 0),
          0,
          1
        );
        nextRisk.applied_rule_codes?.push(ruleCode);
        nextRisk.matched_rule_ids?.push(rule.id);
        nextRisk.generation_reason = `${nextRisk.generation_reason} ${outcome.reason}`.trim();

        appliedMatches.push({
          ruleId: rule.id,
          ruleCode,
          ruleName,
          reason: outcome.reason,
        });
      }
    }

    if (outcome.effect === "boost_risk_type") {
      if (
        normalizeComparableValue(nextRisk.risk_type) ===
        normalizeComparableValue(outcome.risk_type)
      ) {
        const delta = outcome.severity_delta ?? 0;
        nextRisk.probability = clamp(nextRisk.probability + delta, 1, 5);
        nextRisk.score = nextRisk.probability * nextRisk.impact;
        nextRisk.level = computeLevel(nextRisk.score);
        nextRisk.confidence = clamp(
          (nextRisk.confidence ?? 0.65) + (outcome.confidence_delta ?? 0),
          0,
          1
        );
        nextRisk.applied_rule_codes?.push(ruleCode);
        nextRisk.matched_rule_ids?.push(rule.id);
        nextRisk.generation_reason = `${nextRisk.generation_reason} ${outcome.reason}`.trim();

        appliedMatches.push({
          ruleId: rule.id,
          ruleCode,
          ruleName,
          reason: outcome.reason,
        });
      }
    }

    if (outcome.effect === "boost_multi_risk_type") {
      if (
        outcome.risk_types.some(
          (riskType) =>
            normalizeComparableValue(riskType) === normalizeComparableValue(nextRisk.risk_type)
        )
      ) {
        const delta = outcome.severity_delta ?? 0;
        nextRisk.probability = clamp(nextRisk.probability + delta, 1, 5);
        nextRisk.score = nextRisk.probability * nextRisk.impact;
        nextRisk.level = computeLevel(nextRisk.score);
        nextRisk.confidence = clamp(
          (nextRisk.confidence ?? 0.65) + (outcome.confidence_delta ?? 0),
          0,
          1
        );
        nextRisk.applied_rule_codes?.push(ruleCode);
        nextRisk.matched_rule_ids?.push(rule.id);
        nextRisk.generation_reason = `${nextRisk.generation_reason} ${outcome.reason}`.trim();

        appliedMatches.push({
          ruleId: rule.id,
          ruleCode,
          ruleName,
          reason: outcome.reason,
        });
      }
    }

    if (outcome.effect === "boost_tag") {
      if (riskMatchesTag(nextRisk, outcome.tag)) {
        const delta = outcome.severity_delta ?? 0;
        nextRisk.probability = clamp(nextRisk.probability + delta, 1, 5);
        nextRisk.score = nextRisk.probability * nextRisk.impact;
        nextRisk.level = computeLevel(nextRisk.score);
        nextRisk.confidence = clamp(
          (nextRisk.confidence ?? 0.65) + (outcome.confidence_delta ?? 0),
          0,
          1
        );
        nextRisk.applied_rule_codes?.push(ruleCode);
        nextRisk.matched_rule_ids?.push(rule.id);
        nextRisk.generation_reason = `${nextRisk.generation_reason} ${outcome.reason}`.trim();

        appliedMatches.push({
          ruleId: rule.id,
          ruleCode,
          ruleName,
          reason: outcome.reason,
        });
      }
    }
  }

  return {
    risk: nextRisk,
    appliedMatches,
    excludedByRule: false,
  };
}

function normalizeCsvRows(csvData: unknown): Record<string, unknown>[] {
  if (!Array.isArray(csvData)) return [];

  return csvData
    .map((row) => {
      if (!row || typeof row !== "object" || Array.isArray(row)) return null;

      const normalized: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(row as Record<string, unknown>)) {
        const safeKey = String(key || "").trim();
        if (!safeKey) continue;
        normalized[safeKey] = value;
      }

      return Object.keys(normalized).length > 0 ? normalized : null;
    })
    .filter((row): row is Record<string, unknown> => Boolean(row));
}

function summarizeImportRows(rows: Record<string, unknown>[], maxRows = 20) {
  return rows.slice(0, maxRows).map((row, index) => ({
    row_number: index + 1,
    ...row,
  }));
}

function buildImportContextText(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";

  const lines = rows.slice(0, 40).map((row, index) => {
    const values = Object.entries(row)
      .map(([key, value]) => `${key}: ${String(value ?? "").trim()}`)
      .filter((entry) => !entry.endsWith(":"))
      .join(" | ");

    return `Row ${index + 1}: ${values}`;
  });

  return lines.join("\n");
}

function enrichProjectWithImportContext(project: ProjectRow, importContextText: string): ProjectRow {
  if (!importContextText.trim()) return project;

  const combinedDescription = [project.description, importContextText]
    .filter(Boolean)
    .join("\n\nImported source context:\n");

  const combinedDependencies = [project.critical_dependencies, importContextText]
    .filter(Boolean)
    .join("\n\nImported source context:\n");

  return {
    ...project,
    description: combinedDescription || project.description,
    critical_dependencies: combinedDependencies || project.critical_dependencies,
  };
}

async function loadProjectImportRows(
  supabase: any,
  importId: string
): Promise<Record<string, unknown>[]> {
  const { data, error } = await supabase
    .from("project_import_rows")
    .select("id, row_index, row_json")
    .eq("import_id", importId)
    .order("row_index", { ascending: true });

  if (error) {
    console.error("PROJECT IMPORT ROWS LOAD ERROR:", error);
    return [];
  }

  const rows = (data || []) as ProjectImportRowDb[];

  return rows
    .map((row) => {
      if (!row.row_json || typeof row.row_json !== "object") return null;
      return row.row_json as Record<string, unknown>;
    })
    .filter((row): row is Record<string, unknown> => Boolean(row));
}

function buildProjectContext(
  project: ProjectRow,
  baselineTitles: string[],
  importContextText?: string
) {
  const lines = [
    `Project name: ${project.name}`,
    project.description ? `Description: ${project.description}` : null,
    project.sector ? `Sector: ${project.sector}` : null,
    project.project_type ? `Project type: ${project.project_type}` : null,
    project.contract_type ? `Contract type: ${project.contract_type}` : null,
    project.project_value !== null ? `Project value: ${project.project_value}` : null,
    project.client_name ? `Client: ${project.client_name}` : null,
    project.city ? `City: ${project.city}` : null,
    project.country ? `Country: ${project.country}` : null,
    project.site_type ? `Site type: ${project.site_type}` : null,
    project.permit_required !== null
      ? `Permit required: ${project.permit_required ? "yes" : "no"}`
      : null,
    project.project_phase ? `Project phase: ${project.project_phase}` : null,
    project.key_milestones ? `Key milestones: ${project.key_milestones}` : null,
    project.critical_dependencies
      ? `Critical dependencies: ${project.critical_dependencies}`
      : null,
    project.authority_stakeholder
      ? `Authority stakeholder: ${project.authority_stakeholder}`
      : null,
    project.main_contractor ? `Main contractor: ${project.main_contractor}` : null,
    project.subcontractors ? `Subcontractors: ${project.subcontractors}` : null,
    baselineTitles.length > 0
      ? `Existing baseline risks: ${baselineTitles.join(", ")}`
      : null,
    importContextText?.trim()
      ? `Imported CSV / external source context:\n${importContextText}`
      : null,
  ];

  return lines.filter(Boolean).join("\n");
}

function buildBaselineSummary(baseline: GeneratedRisk[]) {
  return baseline.map((risk, index) => ({
    number: index + 1,
    title: risk.title,
    category: risk.category,
    level: risk.level,
    probability: risk.probability,
    impact: risk.impact,
    score: risk.score,
    description: risk.description,
    suggested_action: risk.suggested_action,
    generation_reason: risk.generation_reason,
  }));
}

function extractJSONArray(text: string) {
  const cleaned = text.replace(/```json|```/gi, "").trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed;
  } catch {}

  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");

  if (start !== -1 && end !== -1 && end > start) {
    const candidate = cleaned.slice(start, end + 1);
    try {
      const parsed = JSON.parse(candidate);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }

  return [];
}

async function generateAiRisks(
  project: ProjectRow,
  baseline: GeneratedRisk[],
  importContextText = ""
): Promise<GeneratedRisk[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn("ANTHROPIC_API_KEY missing, skipping AI generation.");
    return [];
  }

  const context = buildProjectContext(
    project,
    baseline.map((r) => r.title),
    importContextText
  );
  const baselineSummary = buildBaselineSummary(baseline);

  const prompt = `
You are a senior construction and infrastructure risk reviewer.

CRITICAL RULES:
- Return everything in English only.
- Never use Dutch.
- Do not repeat, rename or paraphrase existing baseline risks.
- Add only project-specific risks that materially improve the baseline.
- Consider imported CSV or external source data where available.
- Do not suggest asbestos or hazardous-material risks unless context clearly indicates renovation, demolition, refurbishment or existing buildings.
- Be strict and professional.

PROJECT CONTEXT:
${context}

CURRENT BASELINE RISKS:
${JSON.stringify(baselineSummary, null, 2)}

Allowed categories:
Permits, Planning, Financial, Safety, Environment, Suppliers, Technical, Stakeholders, Weather, Utilities, Quality, Contractual

Return ONLY a valid JSON array.

Each item must be:
[
  {
    "title": "Short professional risk title in English",
    "description": "Specific risk description in English",
    "category": "One allowed category",
    "probability": 1,
    "impact": 1,
    "suggested_action": "Concrete mitigation action in English",
    "generation_reason": "Why this adds value beyond the baseline"
  }
]
  `.trim();

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest",
      max_tokens: 1800,
      temperature: 0.2,
      system: `
You are an expert project risk reviewer.
Always respond in English only.
Return only valid JSON.
      `.trim(),
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Anthropic error:", errorText);
    return [];
  }

  const data = await response.json();
  const textBlock = data?.content?.find((block: any) => block?.type === "text");
  const rawText = textBlock?.text || "";
  const parsed = extractJSONArray(rawText);

  console.log("AI RAW TEXT:", rawText);
  console.log("AI PARSED COUNT:", Array.isArray(parsed) ? parsed.length : 0);

  const baselineTitles = new Set(baseline.map((r) => normalizeText(r.title)));

  const aiRisks: GeneratedRisk[] = parsed
    .map((item: any): GeneratedRisk => {
      const probability = sanitizeInt(item?.probability, 3);
      const impact = sanitizeInt(item?.impact, 3);
      const score = probability * impact;

      return {
        title: sanitizeText(item?.title, "Project-specific risk"),
        description:
          sanitizeText(
            item?.description,
            "Project-specific risk identified after reviewing the baseline."
          ) || "Project-specific risk identified after reviewing the baseline.",
        category: sanitizeCategory(item?.category),
        probability,
        impact,
        score,
        level: computeLevel(score),
        suggested_action:
          sanitizeText(
            item?.suggested_action,
            "Review this risk and define a mitigation action."
          ) || "Review this risk and define a mitigation action.",
        source_type: "ai",
        source_template_id: null,
        generation_reason:
          sanitizeText(
            item?.generation_reason,
            "AI identified this as a meaningful addition beyond the baseline."
          ) || "AI identified this as a meaningful addition beyond the baseline.",
        applied_rule_codes: [],
        confidence: 0.58,
        risk_type: null,
        tags: [],
        learning_score: 0,
        ranking_score: 0,
        final_reason: null,
        included_by_ai: true,
        included_by_template: false,
        excluded_by_rule: false,
        matched_rule_ids: [],
      };
    })
    .filter((risk) => risk.title.length > 0)
    .filter((risk) => !baselineTitles.has(normalizeText(risk.title)));

  return dedupeRisks(aiRisks).slice(0, 6);
}

function sortGeneratedRisks(risks: GeneratedRisk[]) {
  return [...risks].sort((a, b) => {
    const aRank = a.ranking_score ?? 0;
    const bRank = b.ranking_score ?? 0;
    if (bRank !== aRank) return bRank - aRank;

    if (b.score !== a.score) return b.score - a.score;
    return (b.confidence ?? 0) - (a.confidence ?? 0);
  });
}

async function persistBaselineGeneration(params: {
  supabase: any;
  project: ProjectRow;
  baseline: GeneratedRisk[];
  ai: GeneratedRisk[];
  combined: GeneratedRisk[];
  ruleMatches: AppliedRuleMatch[];
  matchedRuleCount: number;
  generationType?: string;
  importRowCount?: number;
}) {
  const {
    supabase,
    project,
    baseline,
    ai,
    combined,
    ruleMatches,
    matchedRuleCount,
    generationType,
    importRowCount,
  } = params;

  const nowIso = new Date().toISOString();

  const generationSummary = {
    project_id: project.id,
    baseline_count: baseline.length,
    ai_count: ai.length,
    combined_count: combined.length,
    matched_rule_count: matchedRuleCount,
    import_row_count: importRowCount || 0,
    generated_at: nowIso,
  };

  const generationInsert: BaselineGenerationInsert = {
    project_id: project.id,
    generation_type: generationType || "initial",
    status: "completed",
    model_provider: ai.length > 0 ? "anthropic" : "rules_only",
    model_name: ai.length > 0 ? process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest" : null,
    rules_version: "v1",
    prompt_version: "v2",
    started_at: nowIso,
    finished_at: nowIso,
    summary_json: generationSummary,
  };

  const { data: generationRow, error: generationError } = await supabase
    .from("baseline_generations")
    .insert(generationInsert as any)
    .select("id")
    .single();

  if (generationError || !generationRow) {
    console.error("BASELINE GENERATION INSERT ERROR:", generationError);
    throw new Error(generationError?.message || "Could not create baseline generation.");
  }

  const generationId = String((generationRow as { id: string }).id);

  const itemRows: BaselineGenerationItemInsert[] = combined.map((risk) => ({
    baseline_generation_id: generationId,
    source_type: risk.source_type,
    source_reference: risk.source_template_id ?? risk.title,
    title: risk.title,
    description: risk.description,
    reason: risk.generation_reason || risk.final_reason || "Generated baseline risk",
    category: risk.category,
    risk_type: risk.risk_type ?? null,
    suggested_probability: risk.probability,
    suggested_impact: risk.impact,
    suggested_level: risk.level,
    suggested_actions_json: risk.suggested_action
      ? { primary_action: risk.suggested_action }
      : null,
    confidence: risk.confidence ?? null,
    review_status: "pending",
    rule_id: risk.matched_rule_ids?.[0] ?? null,
    suggested_inherent_probability: risk.probability,
    suggested_inherent_impact: risk.impact,
    suggested_inherent_level: risk.level,
    suggested_inherent_rating: risk.score,
    suggested_managed_probability: Math.max(1, risk.probability - 1),
    suggested_managed_impact: risk.impact,
    suggested_managed_level: computeLevel(
      Math.max(1, risk.probability - 1) * risk.impact
    ),
    suggested_managed_rating: Math.max(1, risk.probability - 1) * risk.impact,
    learning_score: risk.learning_score ?? 0,
    ranking_score: risk.ranking_score ?? 0,
    final_reason: risk.final_reason ?? risk.generation_reason ?? null,
    excluded_by_rule: risk.excluded_by_rule ?? false,
    included_by_ai: risk.included_by_ai ?? risk.source_type === "ai",
    included_by_template: risk.included_by_template ?? risk.source_type === "template",
  }));

  const { error: itemInsertError } = await supabase
    .from("baseline_generation_items")
    .insert(itemRows as any);

  if (itemInsertError) {
    console.error("BASELINE GENERATION ITEMS INSERT ERROR:", itemInsertError);
    throw new Error(
      itemInsertError.message || "Could not insert baseline generation items."
    );
  }

  const uniqueRuleMatches: BaselineRuleMatchInsert[] = Array.from(
    new Map(
      ruleMatches.map((match) => [
        `${match.ruleId}-${match.reason}`,
        {
          baseline_generation_id: generationId,
          rule_id: match.ruleId,
          matched: true,
          match_reason: match.reason,
        },
      ])
    ).values()
  );

  if (uniqueRuleMatches.length > 0) {
    const { error: ruleMatchInsertError } = await supabase
      .from("baseline_rule_matches")
      .insert(uniqueRuleMatches as any);

    if (ruleMatchInsertError) {
      console.error("BASELINE RULE MATCHES INSERT ERROR:", ruleMatchInsertError);
      throw new Error(
        ruleMatchInsertError.message || "Could not insert baseline rule matches."
      );
    }
  }

  return generationId;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId?: string }> }
) {
  try {
    const routeParams = await params.catch(() => ({ projectId: undefined }));
    let body: GenerateRiskRequestBody = {};

    try {
      body = (await request.json()) as GenerateRiskRequestBody;
    } catch {
      body = {};
    }

    const projectId = routeParams?.projectId || body?.projectId;

    if (!projectId) {
      return NextResponse.json(
        { error: "Missing projectId." },
        { status: 400 }
      );
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json(
        { error: "Missing NEXT_PUBLIC_SUPABASE_URL" },
        { status: 500 }
      );
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "Missing SUPABASE_SERVICE_ROLE_KEY" },
        { status: 500 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select(`
        id,
        name,
        description,
        project_type,
        contract_type,
        project_value,
        client_name,
        city,
        country,
        site_type,
        permit_required,
        project_phase,
        key_milestones,
        critical_dependencies,
        authority_stakeholder,
        main_contractor,
        subcontractors,
        sector,
        review_frequency
      `)
      .eq("id", projectId)
      .single();

    if (projectError || !project) {
      console.error("PROJECT LOAD ERROR:", projectError);
      return NextResponse.json(
        { error: projectError?.message || "Project not found." },
        { status: 404 }
      );
    }

    const projectRow = project as ProjectRow;

    const bodyCsvRows = normalizeCsvRows(body?.csvData);
    let dbImportRows: Record<string, unknown>[] = [];

    if (body?.importId) {
      dbImportRows = await loadProjectImportRows(supabase, body.importId);
    }

    const importRows = bodyCsvRows.length > 0 ? bodyCsvRows : dbImportRows;
    const importContextText = buildImportContextText(importRows);
    const enrichedProjectRow = enrichProjectWithImportContext(projectRow, importContextText);

    const { data: templates, error: templatesError } = await supabase
      .from("risk_templates")
      .select(`
        id,
        code,
        title,
        description,
        category,
        risk_type,
        sector,
        project_type,
        contract_type,
        site_type,
        project_phase,
        permit_required,
        default_probability,
        default_impact,
        default_level,
        suggested_action,
        tags,
        metadata_json,
        is_active
      `)
      .eq("is_active", true);

    if (templatesError) {
      console.error("TEMPLATE LOAD ERROR:", templatesError);
      return NextResponse.json(
        { error: templatesError.message || "Could not load risk templates." },
        { status: 500 }
      );
    }

    const { data: rules, error: rulesError } = await supabase
      .from("risk_rules")
      .select(`
        id,
        code,
        name,
        description,
        condition_json,
        outcome_json,
        weight,
        is_active
      `)
      .eq("is_active", true);

    if (rulesError) {
      console.error("RULE LOAD ERROR:", rulesError);
      return NextResponse.json(
        { error: rulesError.message || "Could not load risk rules." },
        { status: 500 }
      );
    }

    const { data: learningStats, error: learningStatsError } = await supabase
      .from("risk_template_learning_stats")
      .select(`
        id,
        template_id,
        sector,
        project_type,
        site_type,
        project_phase,
        projects_seen,
        baseline_included_count,
        accepted_count,
        dismissed_count,
        manually_added_count,
        occurred_count,
        avg_delay_days,
        avg_cost_impact,
        avg_probability,
        avg_impact,
        confidence_score,
        last_calculated_at
      `);

    if (learningStatsError) {
      console.error("LEARNING STATS LOAD ERROR:", learningStatsError);
    }

    const templateRows = (templates || []) as RiskTemplateRow[];
    const ruleRows = (rules || []) as RiskRuleRow[];
    const statRows = (learningStats || []) as LearningStatRow[];

    const activeRules = ruleRows.filter((rule) => rule.is_active);
    const globalRuleMatches: AppliedRuleMatch[] = [];

    console.log("PROJECT DEBUG:", {
      projectId: enrichedProjectRow.id,
      sector: enrichedProjectRow.sector,
      project_type: enrichedProjectRow.project_type,
      contract_type: enrichedProjectRow.contract_type,
      site_type: enrichedProjectRow.site_type,
      project_phase: enrichedProjectRow.project_phase,
      permit_required: enrichedProjectRow.permit_required,
      importRowCount: importRows.length,
    });

    const matchedTemplates = templateRows
      .filter((template) => template.is_active)
      .filter((template) => templateMatchesProject(template, enrichedProjectRow))
      .map((template) => {
        const baseScore = templateBaseScore(template, enrichedProjectRow);
        const bestLearningStat = getBestLearningStat(statRows, template.id, enrichedProjectRow);
        const learningScore = calculateLearningScore(bestLearningStat);
        const rankingScore = Number((baseScore + learningScore * 10).toFixed(4));
        const learningReason = buildLearningReason(bestLearningStat, learningScore);

        return {
          template,
          baseScore,
          learningScore,
          rankingScore,
          learningReason,
        };
      })
      .filter((item) => item.baseScore > 0 || item.learningScore > 0)
      .sort((a, b) => b.rankingScore - a.rankingScore)
      .slice(0, 30);

    console.log("MATCHED TEMPLATE COUNT:", matchedTemplates.length);

    const baselineRaw: GeneratedRisk[] = [];

    for (const item of matchedTemplates) {
      const mapped = mapTemplateToGeneratedRisk(item.template);

      mapped.learning_score = item.learningScore;
      mapped.ranking_score = item.rankingScore;
      mapped.confidence = clamp(
        (mapped.confidence ?? 0.68) + item.learningScore * 0.2,
        0,
        1
      );

      if (item.learningReason) {
        mapped.generation_reason = `${mapped.generation_reason} ${item.learningReason}`.trim();
      }

      const ruleResult = applyRulesToRisk(mapped, enrichedProjectRow, activeRules);

      if (ruleResult.appliedMatches.length > 0) {
        globalRuleMatches.push(...ruleResult.appliedMatches);
      }

      if (!ruleResult.risk) continue;

      const finalRisk: GeneratedRisk = {
        ...ruleResult.risk,
        final_reason:
          ruleResult.risk.generation_reason ||
          "Included from template + rules + learning ranking.",
        included_by_template: true,
        included_by_ai: false,
        excluded_by_rule: false,
      };

      baselineRaw.push(finalRisk);
    }

    const baseline = sortGeneratedRisks(dedupeRisks(baselineRaw)).slice(0, 20);
    const aiRaw = await generateAiRisks(enrichedProjectRow, baseline, importContextText);
    const aiProcessed: GeneratedRisk[] = [];

    for (const risk of aiRaw) {
      const preppedAiRisk: GeneratedRisk = {
        ...risk,
        confidence: clamp(risk.confidence ?? 0.58, 0, 1),
        learning_score: 0,
        ranking_score: Number((risk.score + (risk.confidence ?? 0.58) * 5).toFixed(4)),
        final_reason: risk.generation_reason || "AI-generated supplemental risk.",
        included_by_ai: true,
        included_by_template: false,
        excluded_by_rule: false,
      };

      const ruleResult = applyRulesToRisk(preppedAiRisk, enrichedProjectRow, activeRules);

      if (ruleResult.appliedMatches.length > 0) {
        globalRuleMatches.push(...ruleResult.appliedMatches);
      }

      if (!ruleResult.risk) continue;

      const duplicateBaseline = baseline.some(
        (baseRisk) =>
          normalizeText(baseRisk.title) === normalizeText(ruleResult.risk?.title) ||
          normalizeComparableValue(baseRisk.description) ===
            normalizeComparableValue(ruleResult.risk?.description)
      );

      if (duplicateBaseline) continue;

      aiProcessed.push({
        ...ruleResult.risk,
        final_reason:
          ruleResult.risk.generation_reason || "AI-generated supplemental risk.",
        included_by_ai: true,
        included_by_template: false,
        excluded_by_rule: false,
      });
    }

    const ai = sortGeneratedRisks(dedupeRisks(aiProcessed)).slice(0, 6);
    const combined = sortGeneratedRisks(dedupeRisks([...baseline, ...ai]));

    const matchedRuleCount = activeRules.filter((rule) =>
      evaluateCondition(enrichedProjectRow, rule.condition_json)
    ).length;

    const baselineGenerationId = await persistBaselineGeneration({
      supabase,
      project: projectRow,
      baseline,
      ai,
      combined,
      ruleMatches: globalRuleMatches,
      matchedRuleCount,
      generationType: importRows.length > 0 ? "csv_import" : "initial",
      importRowCount: importRows.length,
    });

    return NextResponse.json({
      success: true,
      baselineGenerationId,
      projectId,
      projectContextBlob: getProjectContextBlob(enrichedProjectRow),
      baseline,
      ai,
      combined,
      matchedRuleCount,
      matchedTemplateCount: matchedTemplates.length,
      learningStatsUsedCount: matchedTemplates.filter((t) => t.learningScore > 0).length,
      importRowCount: importRows.length,
      importPreview: summarizeImportRows(importRows, 10),
    });
  } catch (error: any) {
    console.error("generate-risk route error:", error);

    return NextResponse.json(
      { error: error?.message || "Unknown error while generating risks." },
      { status: 500 }
    );
  }
}