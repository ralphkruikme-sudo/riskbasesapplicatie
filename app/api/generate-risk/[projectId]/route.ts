import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type ProjectRow = {
  id: string;
  name: string;
  description: string | null;
  project_type: string | null;
  contract_type: string | null;
  project_value: string | null;
  client_name: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  site_type: string | null;
  permit_required: boolean | null;
  project_phase: string | null;
  key_milestones: string | null;
  critical_dependencies: string | null;
  client_stakeholder: string | null;
  authority_stakeholder: string | null;
  main_contractor: string | null;
  subcontractors: string | null;
  initial_risks: string | null;
  selected_risk_categories: string | null;
};

type RiskTemplateRow = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  risk_type: string | null;
  project_type: string | null;
  contract_type: string | null;
  site_type: string | null;
  project_phase: string | null;
  country: string | null;
  permit_required: boolean | null;
  default_probability: number;
  default_impact: number;
  default_level: string | null;
  suggested_action: string | null;
  tags: string[] | null;
  is_active: boolean;
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

function normalizeText(value: string | null | undefined) {
  return (value || "").trim().toLowerCase();
}

function normalizeBoolean(value: boolean | null | undefined) {
  if (value === null || value === undefined) return null;
  return value;
}

function sanitizeText(value: unknown, fallback = "") {
  if (typeof value !== "string") return fallback;
  return value.trim();
}

function sanitizeInt(value: unknown, fallback = 3) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(1, Math.min(5, Math.round(n)));
}

function translateCategoryToEnglish(value: unknown) {
  const raw = sanitizeText(value, "Technical").trim();
  const normalized = raw.toLowerCase();

  const categoryMap: Record<string, string> = {
    permits: "Permits",
    vergunningen: "Permits",

    planning: "Planning",
    planningen: "Planning",
    planningrisico: "Planning",

    financial: "Financial",
    financieel: "Financial",
    financiel: "Financial",

    safety: "Safety",
    veiligheid: "Safety",

    environment: "Environment",
    milieu: "Environment",
    omgeving: "Environment",

    suppliers: "Suppliers",
    leverancier: "Suppliers",
    leveranciers: "Suppliers",

    technical: "Technical",
    technisch: "Technical",
    techniek: "Technical",

    stakeholders: "Stakeholders",
    belanghebbenden: "Stakeholders",

    weather: "Weather",
    weer: "Weather",

    utilities: "Utilities",
    nutsvoorzieningen: "Utilities",
    kabels: "Utilities",
    leidingen: "Utilities",

    quality: "Quality",
    kwaliteit: "Quality",

    contractual: "Contractual",
    contractueel: "Contractual",
    contracten: "Contractual",
  };

  const mapped = categoryMap[normalized] || raw;

  if (ALLOWED_CATEGORIES.has(mapped)) return mapped;
  return "Technical";
}

function sanitizeCategory(value: unknown) {
  return translateCategoryToEnglish(value);
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

function templateMatchesProject(template: RiskTemplateRow, project: ProjectRow) {
  const checks = [
    !template.project_type ||
      normalizeText(template.project_type) === normalizeText(project.project_type),

    !template.contract_type ||
      normalizeText(template.contract_type) === normalizeText(project.contract_type),

    !template.site_type ||
      normalizeText(template.site_type) === normalizeText(project.site_type),

    !template.project_phase ||
      normalizeText(template.project_phase) === normalizeText(project.project_phase),

    !template.country ||
      normalizeText(template.country) === normalizeText(project.country),

    template.permit_required === null ||
      template.permit_required === undefined ||
      normalizeBoolean(template.permit_required) === normalizeBoolean(project.permit_required),
  ];

  return checks.every(Boolean);
}

function templateScore(template: RiskTemplateRow, project: ProjectRow) {
  let score = 0;

  if (
    template.project_type &&
    normalizeText(template.project_type) === normalizeText(project.project_type)
  ) {
    score += 4;
  }

  if (
    template.contract_type &&
    normalizeText(template.contract_type) === normalizeText(project.contract_type)
  ) {
    score += 3;
  }

  if (
    template.site_type &&
    normalizeText(template.site_type) === normalizeText(project.site_type)
  ) {
    score += 3;
  }

  if (
    template.project_phase &&
    normalizeText(template.project_phase) === normalizeText(project.project_phase)
  ) {
    score += 2;
  }

  if (
    template.country &&
    normalizeText(template.country) === normalizeText(project.country)
  ) {
    score += 2;
  }

  if (
    template.permit_required !== null &&
    template.permit_required !== undefined &&
    template.permit_required === project.permit_required
  ) {
    score += 2;
  }

  return score;
}

function replaceDutchTerms(text: string) {
  if (!text) return "";

  const replacements: Array<[RegExp, string]> = [
    [/\bvergunning(en)?\b/gi, "permit"],
    [/\bvertraging\b/gi, "delay"],
    [/\bveiligheid\b/gi, "safety"],
    [/\bkwaliteit\b/gi, "quality"],
    [/\bleverancier(s)?\b/gi, "supplier"],
    [/\bweer(somstandigheden)?\b/gi, "weather conditions"],
    [/\bnutsvoorzieningen\b/gi, "utilities"],
    [/\bbelanghebbenden\b/gi, "stakeholders"],
    [/\bcontractueel\b/gi, "contractual"],
    [/\bmilieu\b/gi, "environment"],
    [/\btechnisch\b/gi, "technical"],
    [/\bfinancieel\b/gi, "financial"],
    [/\bplanning\b/gi, "planning"],
    [/\bmaatregel(en)?\b/gi, "mitigation action"],
    [/\brisico'?s\b/gi, "risks"],
    [/\brisico\b/gi, "risk"],
  ];

  let output = text;
  for (const [pattern, replacement] of replacements) {
    output = output.replace(pattern, replacement);
  }

  return output.trim();
}

function ensureEnglishText(value: unknown, fallback = "") {
  const text = sanitizeText(value, fallback);
  return replaceDutchTerms(text);
}

function mapTemplateToGeneratedRisk(template: RiskTemplateRow): GeneratedRisk {
  const probability = sanitizeInt(template.default_probability, 3);
  const impact = sanitizeInt(template.default_impact, 3);
  const score = probability * impact;

  return {
    title: ensureEnglishText(template.title, "Project risk"),
    description: ensureEnglishText(template.description, "Project risk identified from the baseline template library."),
    category: sanitizeCategory(template.category),
    probability,
    impact,
    score,
    level: computeLevel(score),
    suggested_action:
      ensureEnglishText(
        template.suggested_action,
        "Review this risk and define a mitigation action."
      ),
    source_type: "template",
    source_template_id: template.id,
    generation_reason: "Matched from the baseline risk template library.",
  };
}

function buildProjectContext(project: ProjectRow, baselineTitles: string[]) {
  const lines = [
    `Project name: ${project.name}`,
    project.description ? `Description: ${project.description}` : null,
    project.project_type ? `Project type: ${project.project_type}` : null,
    project.contract_type ? `Contract type: ${project.contract_type}` : null,
    project.project_value ? `Project value: ${project.project_value}` : null,
    project.client_name ? `Client: ${project.client_name}` : null,
    project.city ? `City: ${project.city}` : null,
    project.region ? `Region: ${project.region}` : null,
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
    project.client_stakeholder
      ? `Client stakeholder: ${project.client_stakeholder}`
      : null,
    project.authority_stakeholder
      ? `Authority stakeholder: ${project.authority_stakeholder}`
      : null,
    project.main_contractor ? `Main contractor: ${project.main_contractor}` : null,
    project.subcontractors ? `Subcontractors: ${project.subcontractors}` : null,
    project.selected_risk_categories
      ? `Selected risk categories: ${project.selected_risk_categories}`
      : null,
    project.initial_risks ? `Initial user risks: ${project.initial_risks}` : null,
    baselineTitles.length > 0
      ? `Existing baseline risks: ${baselineTitles.join(", ")}`
      : null,
  ];

  return lines.filter(Boolean).join("\n");
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
  baseline: GeneratedRisk[]
): Promise<GeneratedRisk[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  console.log("AI STEP 1: generateAiRisks called");
  console.log("AI STEP 2: api key exists?", !!apiKey);

  if (!apiKey) {
    console.error("AI STEP FAIL: Missing ANTHROPIC_API_KEY");
    return [];
  }

  const context = buildProjectContext(
    project,
    baseline.map((r) => r.title)
  );

  const prompt = `
You are a senior project risk manager for construction and infrastructure projects.

CRITICAL LANGUAGE RULES:
- Return EVERYTHING in English only.
- Never use Dutch.
- If the project context contains Dutch words, translate them into professional English before generating output.
- Risk titles, descriptions, categories, suggested actions and reasons must all be in English.

OUTPUT RULES:
- There are already baseline risks generated from templates.
- Return ONLY 3 to 5 additional project-specific risks that are NOT duplicates of the baseline.
- Do not repeat generic risks already covered.
- Do not include markdown.
- Return ONLY a valid JSON array.

PROJECT CONTEXT:
${context}

Allowed categories:
Permits, Planning, Financial, Safety, Environment, Suppliers, Technical, Stakeholders, Weather, Utilities, Quality, Contractual

Each JSON item must be exactly:
{
  "title": "Short risk title in English",
  "description": "Short project-specific description in English",
  "category": "One allowed category",
  "probability": 1,
  "impact": 1,
  "suggested_action": "Concrete mitigation action in English",
  "generation_reason": "Why this risk is relevant to this project in English"
}
`.trim();

  console.log("AI STEP 3: calling Anthropic...");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest",
      max_tokens: 1400,
      temperature: 0.2,
      system: `
You are an expert risk analyst.

Always respond in English only.
Never return Dutch.
Translate Dutch project context to English internally before generating the answer.
Return only valid JSON.
      `.trim(),
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  console.log("AI STEP 4: Anthropic status =", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Anthropic error:", errorText);
    return [];
  }

  const data = await response.json();
  console.log("AI STEP 5: raw Anthropic response received");

  const textBlock = data?.content?.find((block: any) => block?.type === "text");
  const rawText = textBlock?.text || "";

  console.log("AI STEP 6: raw text =", rawText);

  const parsed = extractJSONArray(rawText);
  console.log("AI STEP 7: parsed items =", parsed.length);

  const baselineTitles = new Set(baseline.map((r) => normalizeText(r.title)));

  const aiRisks: GeneratedRisk[] = parsed
    .map((item: any) => {
      const probability = sanitizeInt(item?.probability, 3);
      const impact = sanitizeInt(item?.impact, 3);
      const score = probability * impact;

      return {
        title: ensureEnglishText(item?.title, "Project risk"),
        description: ensureEnglishText(item?.description, "Project-specific risk identified by AI."),
        category: sanitizeCategory(item?.category),
        probability,
        impact,
        score,
        level: computeLevel(score),
        suggested_action: ensureEnglishText(
          item?.suggested_action,
          "Review this risk and define a mitigation action."
        ),
        source_type: "ai" as const,
        source_template_id: null,
        generation_reason: ensureEnglishText(
          item?.generation_reason,
          "AI project-specific suggestion."
        ),
      };
    })
    .filter((risk) => risk.title.length > 0)
    .filter((risk) => !baselineTitles.has(normalizeText(risk.title)));

  console.log("AI STEP 8: final ai risks =", aiRisks.length);

  return dedupeRisks(aiRisks).slice(0, 5);
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    console.log("ROUTE HIT: generate-risk");

    const { projectId } = await params;
    console.log("projectId:", projectId);

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
        region,
        country,
        site_type,
        permit_required,
        project_phase,
        key_milestones,
        critical_dependencies,
        client_stakeholder,
        authority_stakeholder,
        main_contractor,
        subcontractors,
        initial_risks,
        selected_risk_categories
      `)
      .eq("id", projectId)
      .single<ProjectRow>();

    if (projectError || !project) {
      console.error("PROJECT ERROR:", projectError);
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    console.log("PROJECT LOADED:", project.name);

    const { data: templates, error: templatesError } = await supabase
      .from("risk_templates")
      .select(`
        id,
        title,
        description,
        category,
        risk_type,
        project_type,
        contract_type,
        site_type,
        project_phase,
        country,
        permit_required,
        default_probability,
        default_impact,
        default_level,
        suggested_action,
        tags,
        is_active
      `)
      .eq("is_active", true)
      .returns<RiskTemplateRow[]>();

    if (templatesError) {
      console.error("TEMPLATES ERROR:", templatesError);
      return NextResponse.json(
        { error: templatesError.message || "Could not load risk templates." },
        { status: 500 }
      );
    }

    console.log("TEMPLATES COUNT:", templates?.length || 0);

    const allTemplates = templates || [];

    const strictMatches = allTemplates
      .filter((template) => templateMatchesProject(template, project))
      .sort((a, b) => templateScore(b, project) - templateScore(a, project));

    const fallbackMatches = allTemplates
      .filter((template) => !strictMatches.some((t) => t.id === template.id))
      .map((template) => ({
        template,
        score: templateScore(template, project),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.template);

    const matchedTemplates = [...strictMatches, ...fallbackMatches].slice(0, 12);

    const baseline = dedupeRisks(
      matchedTemplates.map((template) => mapTemplateToGeneratedRisk(template))
    );

    console.log("BASELINE COUNT:", baseline.length);
    console.log("CALLING AI NOW");
    console.log("ANTHROPIC KEY EXISTS:", !!process.env.ANTHROPIC_API_KEY);

    const ai = await generateAiRisks(project, baseline);
    console.log("AI COUNT:", ai.length);

    const combined = dedupeRisks([...baseline, ...ai]);
    console.log("COMBINED COUNT:", combined.length);

    return NextResponse.json({
      baseline,
      ai,
      combined,
    });
  } catch (error: any) {
    console.error("generate-risk route error:", error);

    return NextResponse.json(
      { error: error?.message || "Unknown error while generating risks." },
      { status: 500 }
    );
  }
}