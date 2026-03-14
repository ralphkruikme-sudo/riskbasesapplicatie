"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams, useRouter } from "next/navigation";
import { Sparkles, X, Check, Loader2, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Project = {
  id: string; name: string; description: string | null;
  project_type: string | null; contract_type: string | null;
  project_value: string | null; start_date: string | null; end_date: string | null;
  client_name: string | null; country: string | null; region: string | null;
  city: string | null; site_type: string | null; permit_required: boolean | null;
  project_phase: string | null; key_milestones: string | null;
  critical_dependencies: string | null; initial_risks: string | null;
  selected_risk_categories: string | null;
  client_stakeholder: string | null; authority_stakeholder: string | null;
  main_contractor: string | null; subcontractors: string | null;
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
  selected: boolean;
};

const riskCategories = [
  "Permits", "Planning", "Financial", "Safety", "Environment",
  "Suppliers", "Technical", "Stakeholders", "Weather", "Utilities",
  "Quality", "Contractual",
];

// ── AI Review Modal ───────────────────────────────────────────────────────────
function AIReviewModal({ risks, onClose, onConfirm, saving }: {
  risks: GeneratedRisk[];
  onClose: () => void;
  onConfirm: (risks: GeneratedRisk[]) => void;
  saving: boolean;
}) {
  const [localRisks, setLocalRisks] = useState(risks);
  const [expanded, setExpanded] = useState<number | null>(null);

  function toggle(i: number) {
    setLocalRisks(prev => prev.map((r, idx) => idx === i ? { ...r, selected: !r.selected } : r));
  }
  function toggleAll(val: boolean) {
    setLocalRisks(prev => prev.map(r => ({ ...r, selected: val })));
  }

  const selectedCount = localRisks.filter(r => r.selected).length;

  const levelColor = (l: string) =>
    l === "high" ? { bg: "#fef2f2", text: "#dc2626", border: "#fecaca", dot: "#ef4444" } :
    l === "medium" ? { bg: "#fffbeb", text: "#d97706", border: "#fde68a", dot: "#f59e0b" } :
    { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0", dot: "#22c55e" };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width: "100%", maxWidth: 680, maxHeight: "90vh", background: "white", borderRadius: 24, border: "1px solid #e8eaf0", boxShadow: "0 32px 80px rgba(15,23,42,0.2)", display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ height: 40, width: 40, borderRadius: 12, background: "linear-gradient(135deg, #7c3aed, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles style={{ height: 20, width: 20, color: "white" }} />
            </div>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a" }}>AI gegenereerde risico's</h3>
              <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 1 }}>{localRisks.length} risico's gevonden · selecteer wat je wil bewaren</p>
            </div>
          </div>
          <button onClick={onClose} style={{ height: 32, width: 32, borderRadius: 8, border: "none", background: "#f8fafc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X style={{ height: 15, width: 15, color: "#64748b" }} />
          </button>
        </div>

        {/* Select all / none */}
        <div style={{ padding: "10px 24px", borderBottom: "1px solid #f8fafc", display: "flex", alignItems: "center", gap: 12, flexShrink: 0, background: "#fafafa" }}>
          <button onClick={() => toggleAll(true)} style={{ fontSize: 12, fontWeight: 600, color: "#7c3aed", background: "none", border: "none", cursor: "pointer", padding: "4px 0" }}>Alles selecteren</button>
          <span style={{ color: "#e2e8f0" }}>|</span>
          <button onClick={() => toggleAll(false)} style={{ fontSize: 12, fontWeight: 600, color: "#64748b", background: "none", border: "none", cursor: "pointer", padding: "4px 0" }}>Alles deselecteren</button>
          <span style={{ marginLeft: "auto", fontSize: 12, color: "#94a3b8" }}><strong style={{ color: "#7c3aed" }}>{selectedCount}</strong> van {localRisks.length} geselecteerd</span>
        </div>

        {/* Risk list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
          {localRisks.map((risk, i) => {
            const lc = levelColor(risk.level);
            const isOpen = expanded === i;
            return (
              <div key={i} style={{
                borderRadius: 14, border: `1.5px solid ${risk.selected ? "#c4b5fd" : "#e8eaf0"}`,
                background: risk.selected ? "#faf8ff" : "white", marginBottom: 8,
                transition: "border-color 150ms, background 150ms",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", cursor: "pointer" }}
                  onClick={() => toggle(i)}>
                  {/* Checkbox */}
                  <div style={{
                    height: 22, width: 22, borderRadius: 6, border: `2px solid ${risk.selected ? "#7c3aed" : "#d1d5db"}`,
                    background: risk.selected ? "#7c3aed" : "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 150ms",
                  }}>
                    {risk.selected && <Check style={{ height: 12, width: 12, color: "white" }} />}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                      <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: lc.bg, color: lc.text, border: `1px solid ${lc.border}` }}>{risk.level.toUpperCase()}</span>
                      <span style={{ fontSize: 11, color: "#94a3b8", background: "#f8fafc", padding: "2px 8px", borderRadius: 20 }}>{risk.category}</span>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>Score: <strong style={{ color: lc.text }}>{risk.score}</strong></span>
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{risk.title}</p>
                  </div>

                  {/* Expand */}
                  <button onClick={e => { e.stopPropagation(); setExpanded(isOpen ? null : i); }}
                    style={{ height: 28, width: 28, borderRadius: 8, border: "1px solid #e8eaf0", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {isOpen ? <ChevronUp style={{ height: 13, width: 13, color: "#64748b" }} /> : <ChevronDown style={{ height: 13, width: 13, color: "#64748b" }} />}
                  </button>
                </div>

                {/* Expanded detail */}
                {isOpen && (
                  <div style={{ padding: "0 16px 14px 50px", display: "flex", flexDirection: "column", gap: 8 }}>
                    <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>{risk.description}</p>
                    <div style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 12px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                      <div><p style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>KANS</p><p style={{ fontSize: 16, fontWeight: 800, color: "#374151" }}>{risk.probability}/5</p></div>
                      <div><p style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>IMPACT</p><p style={{ fontSize: 16, fontWeight: 800, color: "#374151" }}>{risk.impact}/5</p></div>
                      <div><p style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>SCORE</p><p style={{ fontSize: 16, fontWeight: 800, color: lc.text }}>{risk.score}</p></div>
                    </div>
                    <div style={{ background: "#ede9fb", borderRadius: 10, padding: "10px 12px" }}>
                      <p style={{ fontSize: 10, color: "#7c3aed", fontWeight: 700, marginBottom: 3 }}>💡 AANBEVOLEN ACTIE</p>
                      <p style={{ fontSize: 13, color: "#374151" }}>{risk.suggested_action}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <p style={{ fontSize: 13, color: "#94a3b8" }}>
            {selectedCount === 0 ? "Selecteer minimaal 1 risico" : `${selectedCount} risico${selectedCount === 1 ? "" : "'s"} worden opgeslagen`}
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{ height: 40, borderRadius: 10, border: "1px solid #e2e8f0", background: "white", padding: "0 18px", fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer" }}>Annuleren</button>
            <button onClick={() => onConfirm(localRisks.filter(r => r.selected))} disabled={saving || selectedCount === 0}
              style={{ height: 40, borderRadius: 10, border: "none", background: selectedCount > 0 ? "linear-gradient(135deg, #7c3aed, #6d28d9)" : "#e2e8f0", padding: "0 22px", fontSize: 13, fontWeight: 700, color: selectedCount > 0 ? "white" : "#94a3b8", cursor: selectedCount > 0 ? "pointer" : "not-allowed", display: "flex", alignItems: "center", gap: 8 }}>
              {saving ? <><Loader2 style={{ height: 14, width: 14, animation: "spin 1s linear infinite" }} /> Opslaan...</> : `✓ ${selectedCount} risico${selectedCount === 1 ? "" : "'s"} opslaan`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Step7Page() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [initialRisks, setInitialRisks] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // AI state
  const [generating, setGenerating] = useState(false);
  const [generatedRisks, setGeneratedRisks] = useState<GeneratedRisk[] | null>(null);
  const [savingRisks, setSavingRisks] = useState(false);
  const [aiError, setAiError] = useState("");
  const [savedCount, setSavedCount] = useState<number | null>(null);

  useEffect(() => {
    async function loadProject() {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, description, project_type, contract_type, project_value, start_date, end_date, client_name, country, region, city, site_type, permit_required, project_phase, key_milestones, critical_dependencies, initial_risks, selected_risk_categories, client_stakeholder, authority_stakeholder, main_contractor, subcontractors")
        .eq("id", projectId)
        .single();

      if (error) { setMessage("Could not load project."); setLoading(false); return; }
      setProject(data);
      setInitialRisks(data.initial_risks || "");
      if (data.selected_risk_categories) {
        setSelectedCategories(data.selected_risk_categories.split(",").map((s: string) => s.trim()).filter(Boolean));
      }
      setLoading(false);
    }
    if (projectId) loadProject();
  }, [projectId]);

  function toggleCategory(cat: string) {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  }

  async function saveStep() {
    return (await supabase.from("projects").update({
      initial_risks: initialRisks || null,
      selected_risk_categories: selectedCategories.length > 0 ? selectedCategories.join(", ") : null,
    }).eq("id", projectId)).error;
  }

  async function handleGenerateAI() {
    if (!project) return;
    setGenerating(true);
    setAiError("");
    setSavedCount(null);

    // First save current state
    await saveStep();

    // Build context prompt from all project data
    const ctx = [
      `Project naam: ${project.name}`,
      project.description ? `Beschrijving: ${project.description}` : null,
      project.project_type ? `Type: ${project.project_type}` : null,
      project.contract_type ? `Contract: ${project.contract_type}` : null,
      project.project_value ? `Waarde: €${project.project_value}` : null,
      project.client_name ? `Opdrachtgever: ${project.client_name}` : null,
      project.city ? `Locatie: ${project.city}${project.region ? `, ${project.region}` : ""}` : null,
      project.site_type ? `Omgeving: ${project.site_type}` : null,
      project.permit_required !== null ? `Vergunningen vereist: ${project.permit_required ? "ja" : "nee"}` : null,
      project.project_phase ? `Fase: ${project.project_phase}` : null,
      project.key_milestones ? `Mijlpalen: ${project.key_milestones}` : null,
      project.critical_dependencies ? `Afhankelijkheden: ${project.critical_dependencies}` : null,
      project.client_stakeholder ? `Opdrachtgever stakeholder: ${project.client_stakeholder}` : null,
      project.authority_stakeholder ? `Bevoegd gezag: ${project.authority_stakeholder}` : null,
      project.main_contractor ? `Hoofdaannemer: ${project.main_contractor}` : null,
      project.subcontractors ? `Onderaannemers: ${project.subcontractors}` : null,
      selectedCategories.length > 0 ? `Relevante categorieën: ${selectedCategories.join(", ")}` : null,
      initialRisks ? `Door gebruiker genoemde risico's: ${initialRisks}` : null,
    ].filter(Boolean).join("\n");

    const prompt = `Je bent een expert risicomanager voor bouw- en infra projecten in Nederland.

Analyseer dit project en genereer een professionele lijst van 10-15 specifieke risico's.

PROJECTINFORMATIE:
${ctx}

Geef je antwoord ALLEEN als geldige JSON array, geen uitleg, geen markdown, geen backticks.
Elke item heeft exact deze velden:
{
  "title": "Korte risicotitel (max 60 tekens)",
  "description": "Duidelijke beschrijving van het risico en waarom het relevant is voor dit project (2-3 zinnen)",
  "category": "één van: Permits, Planning, Financial, Safety, Environment, Suppliers, Technical, Stakeholders, Weather, Utilities, Quality, Contractual",
  "probability": getal 1-5,
  "impact": getal 1-5,
  "score": probability * impact,
  "level": "low" als score <= 6, "medium" als score 7-14, "high" als score >= 15,
  "suggested_action": "Concrete aanbevolen beheermaatregel (1 zin)"
}

Zorg dat de risico's specifiek zijn voor dit project, niet generiek. Varieer in categorieën. Gebruik de door de gebruiker genoemde risico's als extra input maar voeg ook andere toe.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error?.message || `API error ${response.status}`);
      }

      const text = data.content?.find((b: any) => b.type === "text")?.text || "";
      // Strip any accidental markdown fences
      const clean = text.replace(/```json|```/gi, "").trim();
      const parsed: GeneratedRisk[] = JSON.parse(clean);

      // Mark all selected by default, ensure score/level
      const withSelected = parsed.map(r => ({
        ...r,
        score: r.probability * r.impact,
        level: (r.probability * r.impact >= 15 ? "high" : r.probability * r.impact >= 7 ? "medium" : "low") as "low" | "medium" | "high",
        selected: true,
      }));

      setGeneratedRisks(withSelected);
    } catch (e: any) {
      setAiError(e?.message || "AI generatie mislukt. Probeer opnieuw.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSaveRisks(selected: GeneratedRisk[]) {
    setSavingRisks(true);
    try {
      const riskRows = selected.map((r, i) => ({
        project_id: projectId,
        risk_code: `R${String(i + 1).padStart(3, "0")}`,
        title: r.title,
        description: r.description,
        category: r.category,
        probability: r.probability,
        impact: r.impact,
        score: r.score,
        level: r.level,
        status: "open",
      }));

      const { error } = await supabase.from("project_risks").insert(riskRows);
      if (error) throw error;

      // Also save an action for each high risk
      const highRisks = selected.filter(r => r.level === "high");
      if (highRisks.length > 0) {
        const actionRows = highRisks.map(r => ({
          project_id: projectId,
          title: r.suggested_action,
          description: `Aanbevolen maatregel voor: ${r.title}`,
          status: "open",
          priority: "high",
        }));
        await supabase.from("risk_actions").insert(actionRows);
      }

      setSavedCount(selected.length);
      setGeneratedRisks(null);
    } catch (e: any) {
      setAiError(e?.message || "Opslaan mislukt.");
    } finally {
      setSavingRisks(false);
    }
  }

  async function handleSaveDraft() {
    setSaving(true); setMessage("");
    const error = await saveStep();
    setMessage(error ? (error.message || "Could not save.") : "Draft saved.");
    setSaving(false);
  }

  async function handleNext() {
    setSaving(true); setMessage("");
    const error = await saveStep();
    if (error) { setMessage(error.message || "Could not continue."); setSaving(false); return; }
    router.push(`/app/projects/${projectId}/intake/step-8`);
  }

  if (loading) return (
    <section className="flex-1 bg-slate-50 py-16">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">Loading step 7...</div>
      </div>
    </section>
  );

  return (
    <section className="flex-1 bg-slate-50 py-16">
      <div className="mx-auto w-full max-w-3xl">

        {/* Progress header */}
        <div className="mb-10">
          <p className="text-sm font-semibold text-violet-600">Step 7 of 8</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">Initial Risks</h1>
          <p className="mt-2 text-slate-500">
            Add the first risk signals for <span className="font-medium text-slate-700">{project?.name}</span>.
          </p>
          <div className="mt-6 flex items-center gap-6">
            <div className="h-3 flex-1 rounded-full bg-slate-200">
              <div className="h-3 w-[88%] rounded-full bg-violet-500" />
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">88%</div>
          </div>
        </div>

        {message && <div className="mb-6 rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">{message}</div>}

        {/* Saved confirmation */}
        {savedCount !== null && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 flex-shrink-0">
              <Check style={{ height: 16, width: 16, color: "white" }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-800">{savedCount} risico's opgeslagen in het risicoregister!</p>
              <p className="text-xs text-emerald-600 mt-0.5">De high-risico's hebben ook automatisch een actie gekregen.</p>
            </div>
          </div>
        )}

        {/* ── AI GENERATOR CARD ── */}
        <div className="mb-6 rounded-3xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 p-8 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div style={{ height: 52, width: 52, borderRadius: 16, background: "linear-gradient(135deg, #7c3aed, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Sparkles style={{ height: 26, width: 26, color: "white" }} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Genereer risico's met AI</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Claude analyseert alle projectinfo uit stappen 1–6 en genereert een complete risicolijst. Jij kiest welke je bewaart.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-white/70 border border-violet-100 px-4 py-3">
            <p className="text-xs font-semibold text-violet-700 uppercase tracking-wide mb-2">Wat de AI gebruikt:</p>
            <div className="flex flex-wrap gap-2">
              {[
                project?.name ? `📋 ${project.name}` : null,
                project?.project_type ? `🏗️ ${project.project_type}` : null,
                project?.city ? `📍 ${project.city}` : null,
                project?.project_phase ? `🔄 ${project.project_phase}` : null,
                project?.client_name ? `👤 ${project.client_name}` : null,
                project?.project_value ? `💶 €${parseInt(project.project_value).toLocaleString("nl-NL")}` : null,
                selectedCategories.length > 0 ? `🏷️ ${selectedCategories.length} categorieën` : null,
                initialRisks ? `✍️ Jouw input` : null,
              ].filter(Boolean).map((tag, i) => (
                <span key={i} className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700">{tag}</span>
              ))}
            </div>
          </div>

          {aiError && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-center gap-3">
              <AlertTriangle style={{ height: 16, width: 16, color: "#dc2626", flexShrink: 0 }} />
              <p className="text-sm text-red-700">{aiError}</p>
            </div>
          )}

          <button
            onClick={handleGenerateAI}
            disabled={generating}
            className="mt-5 flex w-full items-center justify-center gap-3 rounded-2xl py-4 text-[16px] font-bold text-white transition disabled:opacity-70"
            style={{ background: generating ? "#a78bfa" : "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)", boxShadow: generating ? "none" : "0 4px 20px rgba(124,58,237,0.3)" }}
          >
            {generating ? (
              <><Loader2 style={{ height: 20, width: 20, animation: "spin 1s linear infinite" }} /> Risico's genereren...</>
            ) : (
              <><Sparkles style={{ height: 20, width: 20 }} /> Genereer risico's met AI</>
            )}
          </button>
        </div>

        {/* ── MANUAL INPUT CARD ── */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Handmatige risico input</h2>
          <p className="mt-1 mb-6 text-sm text-slate-500">
            Vul zelf ook risico's in. De AI gebruikt dit als extra context.
          </p>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-slate-700">Relevante risico categorieën</label>
            <div className="flex flex-wrap gap-3">
              {riskCategories.map(cat => {
                const active = selectedCategories.includes(cat);
                return (
                  <button key={cat} type="button" onClick={() => toggleCategory(cat)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${active ? "border-violet-400 bg-violet-50 text-violet-700" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Initiële risico's</label>
            <textarea value={initialRisks} onChange={e => setInitialRisks(e.target.value)} rows={7}
              placeholder={`Bijv:\n- Vertraging vergunningverlening\n- Leverancier levertijden\n- Weersomstandigheden tijdens uitvoering\n- Afhankelijkheid nutsvoorzieningen`}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-violet-400 focus:bg-white" />
            <p className="mt-2 text-xs text-slate-400">Korte notities of bullets. De AI gebruikt dit als extra input.</p>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6">
            <button onClick={() => router.push(`/app/projects/${projectId}/intake/step-6`)}
              className="rounded-xl border border-slate-200 px-5 py-2 text-sm text-slate-700 hover:bg-slate-50">Back</button>
            <div className="flex gap-3">
              <button onClick={handleSaveDraft} disabled={saving}
                className="rounded-xl border border-slate-200 px-5 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60">
                {saving ? "Saving..." : "Save draft"}
              </button>
              <button onClick={handleNext} disabled={saving}
                className="rounded-xl bg-violet-500 px-6 py-2 text-sm font-semibold text-white hover:bg-violet-600 disabled:opacity-60">
                {saving ? "Saving..." : "Next step"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Review Modal */}
      {generatedRisks && (
        <AIReviewModal
          risks={generatedRisks}
          onClose={() => setGeneratedRisks(null)}
          onConfirm={handleSaveRisks}
          saving={savingRisks}
        />
      )}
    </section>
  );
}
