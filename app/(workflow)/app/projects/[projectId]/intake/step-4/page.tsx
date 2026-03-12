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
  client_stakeholder: string | null;
  authority_stakeholder: string | null;
  main_contractor: string | null;
  subcontractors: string | null;
  suppliers: string | null;
  other_stakeholders: string | null;
};

export default function Step4Page() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [clientStakeholder, setClientStakeholder] = useState("");
  const [authorityStakeholder, setAuthorityStakeholder] = useState("");
  const [mainContractor, setMainContractor] = useState("");
  const [subcontractors, setSubcontractors] = useState("");
  const [suppliers, setSuppliers] = useState("");
  const [otherStakeholders, setOtherStakeholders] = useState("");

  useEffect(() => {
    async function loadProject() {
      const { data, error } = await supabase
        .from("projects")
        .select(
          "id, name, client_stakeholder, authority_stakeholder, main_contractor, subcontractors, suppliers, other_stakeholders"
        )
        .eq("id", projectId)
        .single();

      if (error) {
        setMessage("Could not load project.");
        setLoading(false);
        return;
      }

      setProject(data);
      setClientStakeholder(data.client_stakeholder || "");
      setAuthorityStakeholder(data.authority_stakeholder || "");
      setMainContractor(data.main_contractor || "");
      setSubcontractors(data.subcontractors || "");
      setSuppliers(data.suppliers || "");
      setOtherStakeholders(data.other_stakeholders || "");
      setLoading(false);
    }

    if (projectId) loadProject();
  }, [projectId]);

  async function saveStep() {
    const { error } = await supabase
      .from("projects")
      .update({
        client_stakeholder: clientStakeholder || null,
        authority_stakeholder: authorityStakeholder || null,
        main_contractor: mainContractor || null,
        subcontractors: subcontractors || null,
        suppliers: suppliers || null,
        other_stakeholders: otherStakeholders || null,
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

    router.push(`/app/projects/${projectId}/intake/step-5`);
  }

  if (loading) {
    return (
      <section className="flex-1 bg-slate-50 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
            Loading step 4...
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
            Step 4 of 8
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
            Stakeholders
          </h1>

          <p className="mt-2 text-slate-500">
            Add the main stakeholders involved in{" "}
            <span className="font-medium text-slate-700">
              {project?.name}
            </span>
            .
          </p>

          <div className="mt-6 flex items-center gap-6">
            <div className="h-3 flex-1 rounded-full bg-slate-200">
              <div className="h-3 w-[50%] rounded-full bg-violet-500" />
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
              50%
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
            Main stakeholders
          </h2>

          <p className="mt-1 mb-6 text-sm text-slate-500">
            Everything in this step is optional. Add the most important parties now and refine later.
          </p>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Client / opdrachtgever
              </label>
              <input
                value={clientStakeholder}
                onChange={(e) => setClientStakeholder(e.target.value)}
                placeholder="Gemeente Rotterdam"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-violet-400 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Municipality / authority
              </label>
              <input
                value={authorityStakeholder}
                onChange={(e) => setAuthorityStakeholder(e.target.value)}
                placeholder="Municipality of Rotterdam, Port Authority"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-violet-400 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Main contractor
              </label>
              <input
                value={mainContractor}
                onChange={(e) => setMainContractor(e.target.value)}
                placeholder="BAM, Heijmans, Boskalis..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-violet-400 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Subcontractors
              </label>
              <textarea
                value={subcontractors}
                onChange={(e) => setSubcontractors(e.target.value)}
                rows={4}
                placeholder="List important subcontractors, separated by commas or lines"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-violet-400 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Suppliers
              </label>
              <textarea
                value={suppliers}
                onChange={(e) => setSuppliers(e.target.value)}
                rows={4}
                placeholder="List critical suppliers, material providers or logistics partners"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-violet-400 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Other stakeholders
              </label>
              <textarea
                value={otherStakeholders}
                onChange={(e) => setOtherStakeholders(e.target.value)}
                rows={4}
                placeholder="For example: residents, utility companies, grid operators, inspectors, permit agencies..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-violet-400 focus:bg-white"
              />
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6">
            <button
              onClick={() => router.push(`/app/projects/${projectId}/intake/step-3`)}
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