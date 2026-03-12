"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams, useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Project = {
  id: string;
  name: string;
  probability_scale: string | null;
  impact_scale: string | null;
  risk_threshold: string | null;
  review_frequency: string | null;
  risk_owner_required: boolean | null;
  mitigation_required: boolean | null;
};

export default function Step6Page() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

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

  useEffect(() => {
    async function loadProject() {
      const { data, error } = await supabase
        .from("projects")
        .select(
          "id, name, probability_scale, impact_scale, risk_threshold, review_frequency, risk_owner_required, mitigation_required"
        )
        .eq("id", projectId)
        .single();

      if (error) {
        setMessage("Could not load project.");
        setLoading(false);
        return;
      }

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
      setLoading(false);
    }

    if (projectId) loadProject();
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
          riskOwnerRequired === ""
            ? null
            : riskOwnerRequired === "yes",
        mitigation_required:
          mitigationRequired === ""
            ? null
            : mitigationRequired === "yes",
      })
      .eq("id", projectId);

    return error;
  }

  async function handleSaveDraft() {
    setSaving(true);
    setMessage("");

    const error = await saveStep();

    if (error) {
      setMessage(error.message || "Could not save draft.");
      setSaving(false);
      return;
    }

    setMessage("Draft saved.");
    setSaving(false);
  }

  async function handleNext() {
    setSaving(true);
    setMessage("");

    const error = await saveStep();

    if (error) {
      setMessage(error.message || "Could not continue.");
      setSaving(false);
      return;
    }

    router.push(`/app/projects/${projectId}/intake/step-7`);
  }

  if (loading) {
    return (
      <section className="flex-1 bg-slate-50 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
            Loading step 6...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 bg-slate-50 py-16">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-10">
          <p className="text-sm font-semibold text-violet-600">
            Step 6 of 8
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
            Risk Setup
          </h1>

          <p className="mt-2 text-slate-500">
            Configure the basic risk scoring setup for{" "}
            <span className="font-medium text-slate-700">
              {project?.name}
            </span>
            .
          </p>

          <div className="mt-6 flex items-center gap-6">
            <div className="h-3 flex-1 rounded-full bg-slate-200">
              <div className="h-3 w-[75%] rounded-full bg-violet-500" />
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
              75%
            </div>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
            {message}
          </div>
        )}

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Scoring configuration
          </h2>

          <p className="mt-1 mb-6 text-sm text-slate-500">
            Everything in this step is optional. Use simple defaults now and refine later.
          </p>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Probability scale
              </label>
              <select
                value={probabilityScale}
                onChange={(e) => setProbabilityScale(e.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-violet-400 focus:bg-white"
              >
                <option value="">Select probability scale</option>
                <option value="1-3">1–3</option>
                <option value="1-5">1–5</option>
                <option value="1-10">1–10</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Impact scale
              </label>
              <select
                value={impactScale}
                onChange={(e) => setImpactScale(e.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-violet-400 focus:bg-white"
              >
                <option value="">Select impact scale</option>
                <option value="1-3">1–3</option>
                <option value="1-5">1–5</option>
                <option value="1-10">1–10</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Risk threshold
              </label>
              <select
                value={riskThreshold}
                onChange={(e) => setRiskThreshold(e.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-violet-400 focus:bg-white"
              >
                <option value="">Select risk threshold</option>
                <option value="low-medium-high">Low / Medium / High</option>
                <option value="green-amber-red">Green / Amber / Red</option>
                <option value="custom">Custom later</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Review frequency
              </label>
              <select
                value={reviewFrequency}
                onChange={(e) => setReviewFrequency(e.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-violet-400 focus:bg-white"
              >
                <option value="">Select review frequency</option>
                <option value="weekly">Weekly</option>
                <option value="bi-weekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
                <option value="per_phase">Per project phase</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Risk owner required?
              </label>
              <select
                value={riskOwnerRequired}
                onChange={(e) => setRiskOwnerRequired(e.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-violet-400 focus:bg-white"
              >
                <option value="">Unknown / not set</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
              <p className="mt-2 text-xs text-slate-400">
                Decide if every risk should always have a named owner.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Mitigation action required?
              </label>
              <select
                value={mitigationRequired}
                onChange={(e) => setMitigationRequired(e.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-violet-400 focus:bg-white"
              >
                <option value="">Unknown / not set</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
              <p className="mt-2 text-xs text-slate-400">
                Decide if medium/high risks should always include an action.
              </p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6">
            <button
              onClick={() => router.push(`/app/projects/${projectId}/intake/step-5`)}
              className="rounded-xl border border-slate-200 px-5 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Back
            </button>

            <div className="flex gap-3">
              <button
                onClick={handleSaveDraft}
                disabled={saving}
                className="rounded-xl border border-slate-200 px-5 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save draft"}
              </button>

              <button
                onClick={handleNext}
                disabled={saving}
                className="rounded-xl bg-violet-500 px-6 py-2 text-sm font-semibold text-white hover:bg-violet-600 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Next step"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}