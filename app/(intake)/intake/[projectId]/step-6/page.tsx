"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams, useRouter } from "next/navigation";

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
};

function getRiskSetupSignal(input: {
  probabilityScale: string;
  impactScale: string;
  riskThreshold: string;
  reviewFrequency: string;
  riskOwnerRequired: string;
  mitigationRequired: string;
}) {
  if (
    input.probabilityScale === "1-5" &&
    input.impactScale === "1-5" &&
    input.riskThreshold === "green-amber-red"
  ) {
    return "This setup gives RiskBases a strong default scoring foundation for a professional initial baseline.";
  }

  if (input.reviewFrequency === "weekly" || input.reviewFrequency === "bi-weekly") {
    return "A shorter review cycle usually fits projects with higher delivery speed, tighter planning or more active risk follow-up.";
  }

  if (input.riskOwnerRequired === "yes" && input.mitigationRequired === "yes") {
    return "This setup encourages tighter accountability and faster follow-up on identified risks.";
  }

  return "These defaults help RiskBases shape the first risk register and the expected follow-up workflow.";
}

export default function Step6Page() {
  const router = useRouter();
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;

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

  const progress = 75;

  const riskSetupSignal = useMemo(() => {
    return getRiskSetupSignal({
      probabilityScale,
      impactScale,
      riskThreshold,
      reviewFrequency,
      riskOwnerRequired,
      mitigationRequired,
    });
  }, [
    probabilityScale,
    impactScale,
    riskThreshold,
    reviewFrequency,
    riskOwnerRequired,
    mitigationRequired,
  ]);

  useEffect(() => {
    async function loadProject() {
      try {
        setLoading(true);
        setMessage("");

        const { data, error } = await supabase
          .from("projects")
          .select(
            "id, name, probability_scale, impact_scale, risk_threshold, review_frequency, risk_owner_required, mitigation_required"
          )
          .eq("id", projectId)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Project not found.");

        setProject(data);
        setProbabilityScale(data.probability_scale || "");
        setImpactScale(data.impact_scale || "");
        setRiskThreshold(data.risk_threshold || "");
        setReviewFrequency(data.review_frequency || "");
        setRiskOwnerRequired(
          data.risk_owner_required === null
            ? ""
            : data.risk_owner_required
            ? "yes"
            : "no"
        );
        setMitigationRequired(
          data.mitigation_required === null
            ? ""
            : data.mitigation_required
            ? "yes"
            : "no"
        );
      } catch (error: any) {
        setProject(null);
        setMessage(error?.message || "Could not load project.");
      } finally {
        setLoading(false);
      }
    }

    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  async function saveStep() {
    const { error } = await supabase
      .from("projects")
      .update({
        probability_scale: probabilityScale || null,
        impact_scale: impactScale || null,
        risk_threshold: riskThreshold || null,
        review_frequency: reviewFrequency || null,
        risk_owner_required:
          riskOwnerRequired === "" ? null : riskOwnerRequired === "yes",
        mitigation_required:
          mitigationRequired === "" ? null : mitigationRequired === "yes",
      })
      .eq("id", projectId);

    return error;
  }

  async function handleApplyRecommended() {
    setProbabilityScale("1-5");
    setImpactScale("1-5");
    setRiskThreshold("green-amber-red");
    setReviewFrequency("weekly");
    setRiskOwnerRequired("yes");
    setMitigationRequired("yes");
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
      <section className="min-h-screen bg-[#f5f7fb] px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[28px] border border-slate-200/80 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <p className="text-sm text-slate-600">Loading step 6...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!project) {
    return (
      <section className="min-h-screen bg-[#f5f7fb] px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[28px] border border-slate-200/80 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
              Project not found
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {message || "We could not load this project for the intake flow."}
            </p>

            <button
              onClick={() => router.push("/app")}
              className="mt-6 inline-flex h-11 items-center rounded-2xl border border-slate-200 px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Back to projects
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#f5f7fb] px-6 py-12">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8">
          <p className="text-sm font-semibold text-violet-600">Step 6 of 8</p>

          <h1 className="mt-3 text-5xl font-semibold tracking-[-0.04em] text-slate-950">
            Risk defaults
          </h1>

          <p className="mt-3 max-w-3xl text-[15px] leading-7 text-slate-600">
            Set the initial scoring and follow-up defaults for{" "}
            <span className="font-medium text-slate-800">
              {project?.name || "this project"}
            </span>
            . These can be refined later in project settings.
          </p>

          <div className="mt-8 flex items-center gap-5">
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-violet-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex h-12 min-w-[88px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800">
              {progress}%
            </div>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            {message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-[32px] border border-slate-200/80 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.04)] md:p-10">
            <div className="mb-8">
              <div className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                Workflow defaults
              </div>

              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
                Initial scoring configuration
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Keep this simple. Use recommended defaults now and refine detailed
                scoring logic later inside the project workspace.
              </p>

              <div className="mt-5">
                <button
                  type="button"
                  onClick={handleApplyRecommended}
                  className="inline-flex h-11 items-center rounded-2xl border border-violet-200 bg-violet-50 px-4 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
                >
                  Apply recommended defaults
                </button>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Probability scale
                </label>
                <select
                  value={probabilityScale}
                  onChange={(e) => setProbabilityScale(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 text-[15px] text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
                >
                  <option value="">Select probability scale</option>
                  <option value="1-3">1–3</option>
                  <option value="1-5">1–5</option>
                  <option value="1-10">1–10</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Impact scale
                </label>
                <select
                  value={impactScale}
                  onChange={(e) => setImpactScale(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 text-[15px] text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
                >
                  <option value="">Select impact scale</option>
                  <option value="1-3">1–3</option>
                  <option value="1-5">1–5</option>
                  <option value="1-10">1–10</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Risk threshold
                </label>
                <select
                  value={riskThreshold}
                  onChange={(e) => setRiskThreshold(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 text-[15px] text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
                >
                  <option value="">Select risk threshold</option>
                  <option value="low-medium-high">Low / Medium / High</option>
                  <option value="green-amber-red">Green / Amber / Red</option>
                  <option value="custom">Custom later</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Review frequency
                </label>
                <select
                  value={reviewFrequency}
                  onChange={(e) => setReviewFrequency(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 text-[15px] text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
                >
                  <option value="">Select review frequency</option>
                  <option value="weekly">Weekly</option>
                  <option value="bi-weekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="per_phase">Per project phase</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Risk owner required?
                </label>
                <select
                  value={riskOwnerRequired}
                  onChange={(e) => setRiskOwnerRequired(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 text-[15px] text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
                >
                  <option value="">Unknown / not set</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Decide whether every identified risk should have a named owner from the start.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Mitigation action required?
                </label>
                <select
                  value={mitigationRequired}
                  onChange={(e) => setMitigationRequired(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 text-[15px] text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
                >
                  <option value="">Unknown / not set</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Decide whether medium or high risks should directly trigger follow-up actions.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                Setup signal
              </p>
              <p className="mt-2 text-sm font-medium text-slate-800">
                {riskSetupSignal}
              </p>
            </div>

            <div className="mt-10 flex items-center justify-between border-t border-slate-200 pt-6">
              <button
                onClick={() => router.push(`/intake/${projectId}/step-5`)}
                className="inline-flex h-12 items-center rounded-2xl border border-slate-200 px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Back
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveDraft}
                  disabled={saving}
                  className="inline-flex h-12 items-center rounded-2xl border border-slate-200 px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save draft"}
                </button>

                <button
                  onClick={handleNext}
                  disabled={saving}
                  className="inline-flex h-12 items-center rounded-2xl bg-violet-500 px-6 text-sm font-semibold text-white transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Next step"}
                </button>
              </div>
            </div>
          </div>

          <aside className="h-fit rounded-[32px] border border-slate-200/80 bg-white p-7 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <h3 className="text-lg font-semibold text-slate-950">Why this step matters</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              These defaults shape how the first generated risk register is scored and how follow-up should work once the project starts.
            </p>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Used for
                </p>
                <p className="mt-2 text-sm text-slate-800">
                  Initial scoring consistency
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Used for
                </p>
                <p className="mt-2 text-sm text-slate-800">
                  Review workflow defaults
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Used for
                </p>
                <p className="mt-2 text-sm text-slate-800">
                  Better first project setup
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}