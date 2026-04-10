"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCheck,
  Loader2,
  Save,
  SlidersHorizontal,
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Project = {
  id: string;
  name: string | null;
  probability_scale: string | null;
  impact_scale: string | null;
  risk_threshold: string | null;
  review_frequency: string | null;
  risk_owner_required: boolean | null;
  mitigation_required: boolean | null;
  managed_scoring_enabled: boolean | null;
  baseline_publish_mode: string | null;
  severity_model: string | null;
};

function fromNullableBoolean(value: boolean | null | undefined) {
  if (value === true) return "yes";
  if (value === false) return "no";
  return "";
}

function toNullableBoolean(value: string) {
  if (value === "yes") return true;
  if (value === "no") return false;
  return null;
}

function getRiskSetupSignal(input: {
  probabilityScale: string;
  impactScale: string;
  severityModel: string;
  reviewFrequency: string;
  riskOwnerRequired: string;
  mitigationRequired: string;
  managedScoringEnabled: string;
  baselinePublishMode: string;
}) {
  if (
    input.probabilityScale === "1-5" &&
    input.impactScale === "1-5" &&
    input.severityModel === "low-medium-high-critical"
  ) {
    return "This setup gives RiskBases a strong professional scoring foundation for baseline generation and later project governance.";
  }

  if (
    input.managedScoringEnabled === "yes" &&
    input.riskOwnerRequired === "yes" &&
    input.mitigationRequired === "yes"
  ) {
    return "This setup encourages stronger accountability, managed-risk tracking and action-driven follow-up from the first generated baseline.";
  }

  if (
    input.reviewFrequency === "weekly" ||
    input.reviewFrequency === "bi-weekly"
  ) {
    return "A shorter review cycle usually fits projects with higher delivery speed, tighter planning or more active risk follow-up.";
  }

  if (input.baselinePublishMode === "review-first") {
    return "This setup creates a safer launch flow by requiring review before risks are published into the live project environment.";
  }

  return "These defaults help RiskBases shape the first risk register and the expected follow-up workflow.";
}

export default function Step6Page() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.projectId as string | undefined;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [probabilityScale, setProbabilityScale] = useState("");
  const [impactScale, setImpactScale] = useState("");
  const [riskThreshold, setRiskThreshold] = useState("");
  const [reviewFrequency, setReviewFrequency] = useState("");
  const [riskOwnerRequired, setRiskOwnerRequired] = useState("");
  const [mitigationRequired, setMitigationRequired] = useState("");
  const [managedScoringEnabled, setManagedScoringEnabled] = useState("");
  const [baselinePublishMode, setBaselinePublishMode] = useState("");
  const [severityModel, setSeverityModel] = useState("");

  const progress = 75;

  const riskSetupSignal = useMemo(() => {
    return getRiskSetupSignal({
      probabilityScale,
      impactScale,
      severityModel,
      reviewFrequency,
      riskOwnerRequired,
      mitigationRequired,
      managedScoringEnabled,
      baselinePublishMode,
    });
  }, [
    probabilityScale,
    impactScale,
    severityModel,
    reviewFrequency,
    riskOwnerRequired,
    mitigationRequired,
    managedScoringEnabled,
    baselinePublishMode,
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
          .select(
            "id, name, probability_scale, impact_scale, risk_threshold, review_frequency, risk_owner_required, mitigation_required, managed_scoring_enabled, baseline_publish_mode, severity_model"
          )
          .eq("id", projectId)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Project not found.");

        const loaded = data as Project;

        setProject(loaded);
        setProbabilityScale(loaded.probability_scale || "");
        setImpactScale(loaded.impact_scale || "");
        setRiskThreshold(loaded.risk_threshold || "");
        setReviewFrequency(loaded.review_frequency || "");
        setSeverityModel(loaded.severity_model || "");
        setBaselinePublishMode(loaded.baseline_publish_mode || "");
        setRiskOwnerRequired(fromNullableBoolean(loaded.risk_owner_required));
        setMitigationRequired(fromNullableBoolean(loaded.mitigation_required));
        setManagedScoringEnabled(
          fromNullableBoolean(loaded.managed_scoring_enabled)
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
        probability_scale: probabilityScale || null,
        impact_scale: impactScale || null,
        risk_threshold: riskThreshold || null,
        review_frequency: reviewFrequency || null,
        severity_model: severityModel || null,
        baseline_publish_mode: baselinePublishMode || null,
        risk_owner_required:
          riskOwnerRequired === "" ? null : riskOwnerRequired === "yes",
        mitigation_required:
          mitigationRequired === "" ? null : mitigationRequired === "yes",
        managed_scoring_enabled:
          managedScoringEnabled === ""
            ? null
            : managedScoringEnabled === "yes",
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId);

    return error;
  }

  function handleApplyRecommended() {
    setProbabilityScale("1-5");
    setImpactScale("1-5");
    setRiskThreshold("score-based");
    setSeverityModel("low-medium-high-critical");
    setReviewFrequency("weekly");
    setRiskOwnerRequired("yes");
    setMitigationRequired("yes");
    setManagedScoringEnabled("yes");
    setBaselinePublishMode("review-first");
    setMessage("Recommended defaults applied.");
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

      if (!probabilityScale || !impactScale || !severityModel) {
        throw new Error(
          "Please complete the scoring setup before continuing."
        );
      }

      const error = await saveStep();
      if (error) throw error;

      router.push(`/intake/${projectId}/step-7`);
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
            <p className="text-sm font-medium text-[#4B5B73]">Loading step 6...</p>
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
            Step 6 of 8
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-[#081226] md:text-[52px]">
            Risk defaults
          </h1>

          <p className="mt-4 max-w-4xl text-[15px] leading-7 text-[#4B5B73]">
            Set the initial scoring and workflow defaults for{" "}
            <span className="font-semibold text-[#0F172A]">
              {project.name || "this project"}
            </span>
            . These defaults define how the first generated baseline should be
            scored, reviewed and prepared for launch.
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
                <SlidersHorizontal className="h-4 w-4" />
                Workflow defaults
              </div>

              <h2 className="mt-4 text-[30px] font-semibold tracking-[-0.03em] text-[#081226]">
                Initial scoring configuration
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#4B5B73]">
                Keep this step practical. Use recommended defaults now and refine
                advanced scoring logic later inside the project workspace.
              </p>

              <div className="mt-5">
                <button
                  type="button"
                  onClick={handleApplyRecommended}
                  className="inline-flex h-11 items-center gap-2 rounded-2xl border border-[#C9D8FF] bg-[#EEF4FF] px-4 text-sm font-semibold text-[#2457FF] transition hover:bg-[#E5EEFF]"
                >
                  <CheckCheck className="h-4 w-4" />
                  Apply recommended defaults
                </button>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Probability scale
                </label>
                <select
                  value={probabilityScale}
                  onChange={(e) => setProbabilityScale(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                >
                  <option value="">Select probability scale</option>
                  <option value="1-3">1–3</option>
                  <option value="1-5">1–5</option>
                  <option value="1-10">1–10</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Impact scale
                </label>
                <select
                  value={impactScale}
                  onChange={(e) => setImpactScale(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                >
                  <option value="">Select impact scale</option>
                  <option value="1-3">1–3</option>
                  <option value="1-5">1–5</option>
                  <option value="1-10">1–10</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Severity model
                </label>
                <select
                  value={severityModel}
                  onChange={(e) => setSeverityModel(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                >
                  <option value="">Select severity model</option>
                  <option value="low-medium-high-critical">
                    Low / Medium / High / Critical
                  </option>
                  <option value="low-medium-high">
                    Low / Medium / High
                  </option>
                  <option value="custom">Custom later</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Risk threshold
                </label>
                <select
                  value={riskThreshold}
                  onChange={(e) => setRiskThreshold(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                >
                  <option value="">Select threshold style</option>
                  <option value="score-based">Score-based</option>
                  <option value="band-based">Band-based</option>
                  <option value="custom">Custom later</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Review frequency
                </label>
                <select
                  value={reviewFrequency}
                  onChange={(e) => setReviewFrequency(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                >
                  <option value="">Select review frequency</option>
                  <option value="weekly">Weekly</option>
                  <option value="bi-weekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="per_phase">Per project phase</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Baseline publish mode
                </label>
                <select
                  value={baselinePublishMode}
                  onChange={(e) => setBaselinePublishMode(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                >
                  <option value="">Select publish mode</option>
                  <option value="review-first">Review before publish</option>
                  <option value="direct-draft">Publish as draft items</option>
                  <option value="manual-only">Manual acceptance only</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Risk owner required?
                </label>
                <select
                  value={riskOwnerRequired}
                  onChange={(e) => setRiskOwnerRequired(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                >
                  <option value="">Unknown / not set</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>

                <p className="mt-2 text-xs leading-5 text-[#6B7A90]">
                  Decide whether every identified risk should have a named owner from the start.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Mitigation action required?
                </label>
                <select
                  value={mitigationRequired}
                  onChange={(e) => setMitigationRequired(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                >
                  <option value="">Unknown / not set</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>

                <p className="mt-2 text-xs leading-5 text-[#6B7A90]">
                  Decide whether identified risks should directly trigger follow-up actions.
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Managed scoring enabled?
                </label>
                <select
                  value={managedScoringEnabled}
                  onChange={(e) => setManagedScoringEnabled(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                >
                  <option value="">Unknown / not set</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>

                <p className="mt-2 text-xs leading-5 text-[#6B7A90]">
                  Enable inherent versus managed scoring from the first generated project baseline.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-[24px] border border-[#D8E1EC] bg-[#F8FAFC] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7A90]">
                Setup signal
              </p>
              <p className="mt-2 text-sm font-medium text-[#0F172A]">
                {riskSetupSignal}
              </p>
            </div>

            <div className="mt-10 flex flex-col gap-3 border-t border-[#E2E8F0] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={() => router.push(`/intake/${projectId}/step-5`)}
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
              These defaults shape how the first generated risk register is scored,
              reviewed and prepared for project execution.
            </p>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl bg-[#F8FAFC] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7A90]">
                  Used for
                </p>
                <p className="mt-2 text-sm font-medium text-[#0F172A]">
                  Initial scoring consistency
                </p>
              </div>

              <div className="rounded-2xl bg-[#F8FAFC] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7A90]">
                  Used for
                </p>
                <p className="mt-2 text-sm font-medium text-[#0F172A]">
                  Review and ownership defaults
                </p>
              </div>

              <div className="rounded-2xl bg-[#F8FAFC] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7A90]">
                  Used for
                </p>
                <p className="mt-2 text-sm font-medium text-[#0F172A]">
                  Better baseline launch setup
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-[24px] border border-[#DCE7FF] bg-[#F7FAFF] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2457FF]">
                Step rule
              </p>
              <p className="mt-3 text-sm leading-6 text-[#36506C]">
                Keep this step focused on scoring and workflow defaults only.
                Baseline generation itself comes in the next step.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}