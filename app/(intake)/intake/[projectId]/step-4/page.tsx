"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Network,
  Save,
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Project = {
  id: string;
  name: string | null;
  authority_stakeholder: string | null;
  main_contractor: string | null;
  subcontractors: string | null;
  suppliers: string | null;
  other_stakeholders: string | null;
  stakeholder_complexity: string | null;
  approval_complexity: string | null;
  supplier_dependency_level: string | null;
};

function countEntries(value: string) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean).length;
}

function buildStakeholderSignal(params: {
  authorityStakeholder: string;
  mainContractor: string;
  subcontractors: string;
  suppliers: string;
  otherStakeholders: string;
  stakeholderComplexity: string;
  approvalComplexity: string;
  supplierDependencyLevel: string;
}) {
  const {
    authorityStakeholder,
    mainContractor,
    subcontractors,
    suppliers,
    otherStakeholders,
    stakeholderComplexity,
    approvalComplexity,
    supplierDependencyLevel,
  } = params;

  const subCount = countEntries(subcontractors);
  const supplierCount = countEntries(suppliers);
  const otherCount = countEntries(otherStakeholders);

  if (
    stakeholderComplexity === "high" ||
    approvalComplexity === "high" ||
    supplierDependencyLevel === "high"
  ) {
    return "This delivery network suggests elevated coordination, approval and dependency-related baseline risk.";
  }

  if (
    authorityStakeholder.trim() &&
    (mainContractor.trim() || subCount > 0 || supplierCount > 0)
  ) {
    return "This setup combines authority exposure with delivery-chain interfaces, which often increases coordination and approval bottleneck risk.";
  }

  if (subCount + supplierCount + otherCount >= 5) {
    return "This project already shows a moderately broad external network. Expect more interface and alignment risk.";
  }

  return "Stakeholder context helps RiskBases detect coordination, approval and dependency-related risk patterns.";
}

export default function Step4Page() {
  const router = useRouter();
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [authorityStakeholder, setAuthorityStakeholder] = useState("");
  const [mainContractor, setMainContractor] = useState("");
  const [subcontractors, setSubcontractors] = useState("");
  const [suppliers, setSuppliers] = useState("");
  const [otherStakeholders, setOtherStakeholders] = useState("");
  const [stakeholderComplexity, setStakeholderComplexity] = useState("medium");
  const [approvalComplexity, setApprovalComplexity] = useState("medium");
  const [supplierDependencyLevel, setSupplierDependencyLevel] = useState("medium");

  const progress = 50;

  const stakeholderSignal = useMemo(() => {
    return buildStakeholderSignal({
      authorityStakeholder,
      mainContractor,
      subcontractors,
      suppliers,
      otherStakeholders,
      stakeholderComplexity,
      approvalComplexity,
      supplierDependencyLevel,
    });
  }, [
    authorityStakeholder,
    mainContractor,
    subcontractors,
    suppliers,
    otherStakeholders,
    stakeholderComplexity,
    approvalComplexity,
    supplierDependencyLevel,
  ]);

  const subcontractorCount = useMemo(
    () => countEntries(subcontractors),
    [subcontractors]
  );

  const supplierCount = useMemo(() => countEntries(suppliers), [suppliers]);

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
            authority_stakeholder,
            main_contractor,
            subcontractors,
            suppliers,
            other_stakeholders,
            stakeholder_complexity,
            approval_complexity,
            supplier_dependency_level
          `)
          .eq("id", projectId)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Project not found.");

        const loaded = data as Project;

        setProject(loaded);
        setAuthorityStakeholder(loaded.authority_stakeholder || "");
        setMainContractor(loaded.main_contractor || "");
        setSubcontractors(loaded.subcontractors || "");
        setSuppliers(loaded.suppliers || "");
        setOtherStakeholders(loaded.other_stakeholders || "");
        setStakeholderComplexity(loaded.stakeholder_complexity || "medium");
        setApprovalComplexity(loaded.approval_complexity || "medium");
        setSupplierDependencyLevel(loaded.supplier_dependency_level || "medium");
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
        authority_stakeholder: authorityStakeholder.trim() || null,
        main_contractor: mainContractor.trim() || null,
        subcontractors: subcontractors.trim() || null,
        suppliers: suppliers.trim() || null,
        other_stakeholders: otherStakeholders.trim() || null,
        stakeholder_complexity: stakeholderComplexity || null,
        approval_complexity: approvalComplexity || null,
        supplier_dependency_level: supplierDependencyLevel || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId);

    return error;
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

      router.push(`/intake/${projectId}/step-5`);
    } catch (error: any) {
      setMessage(error?.message || "Could not continue.");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="min-h-screen bg-[#f5f7fb] px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-[28px] border border-slate-200/80 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <p className="text-sm text-slate-600">Loading Step 4...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!project) {
    return (
      <section className="min-h-screen bg-[#f5f7fb] px-6 py-12">
        <div className="mx-auto max-w-6xl">
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
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-semibold text-violet-600">Step 4 of 8</p>

          <h1 className="mt-3 text-5xl font-semibold tracking-[-0.04em] text-slate-950">
            Delivery network & approvals
          </h1>

          <p className="mt-3 max-w-4xl text-[15px] leading-7 text-slate-600">
            Add the main delivery and approval parties involved in{" "}
            <span className="font-medium text-slate-800">
              {project?.name || "this project"}
            </span>
            . This step should focus on execution interfaces and approval exposure only.
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
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                <Network className="h-4 w-4" />
                Delivery network
              </div>

              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
                Main delivery and approval parties
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Do not repeat the client here. The client belongs in Step 1. This step is for approval bodies, contractors, suppliers and external execution interfaces.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Municipality / authority
                </label>
                <input
                  value={authorityStakeholder}
                  onChange={(e) => setAuthorityStakeholder(e.target.value)}
                  placeholder="Municipality, permit authority, port authority..."
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 text-[15px] text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Main contractor
                </label>
                <input
                  value={mainContractor}
                  onChange={(e) => setMainContractor(e.target.value)}
                  placeholder="BAM, Heijmans, Boskalis..."
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 text-[15px] text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Stakeholder complexity
                </label>
                <select
                  value={stakeholderComplexity}
                  onChange={(e) => setStakeholderComplexity(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 text-[15px] text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Approval complexity
                </label>
                <select
                  value={approvalComplexity}
                  onChange={(e) => setApprovalComplexity(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 text-[15px] text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <div className="mb-2 flex items-center justify-between gap-4">
                  <label className="block text-sm font-medium text-slate-800">
                    Subcontractors
                  </label>
                  <span className="text-xs font-medium text-slate-500">
                    {subcontractorCount} listed
                  </span>
                </div>

                <textarea
                  value={subcontractors}
                  onChange={(e) => setSubcontractors(e.target.value)}
                  rows={4}
                  placeholder="Separate important subcontractors by commas or new lines"
                  className="w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-4 text-[15px] text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <div className="mb-2 flex items-center justify-between gap-4">
                  <label className="block text-sm font-medium text-slate-800">
                    Suppliers
                  </label>
                  <span className="text-xs font-medium text-slate-500">
                    {supplierCount} listed
                  </span>
                </div>

                <textarea
                  value={suppliers}
                  onChange={(e) => setSuppliers(e.target.value)}
                  rows={4}
                  placeholder="List key suppliers, material providers or logistics partners"
                  className="w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-4 text-[15px] text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Supplier dependency level
                </label>
                <select
                  value={supplierDependencyLevel}
                  onChange={(e) => setSupplierDependencyLevel(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 text-[15px] text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Other external parties
                </label>
                <textarea
                  value={otherStakeholders}
                  onChange={(e) => setOtherStakeholders(e.target.value)}
                  rows={4}
                  placeholder="Grid operator, utility owner, inspection body, residents group, permit agency..."
                  className="w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-4 text-[15px] text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
                />
              </div>
            </div>

            <div className="mt-8 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                Stakeholder signal
              </p>
              <p className="mt-2 text-sm font-medium text-slate-800">
                {stakeholderSignal}
              </p>
            </div>

            <div className="mt-10 flex items-center justify-between border-t border-slate-200 pt-6">
              <button
                onClick={() => router.push(`/intake/${projectId}/step-3`)}
                className="inline-flex h-12 items-center gap-2 rounded-2xl border border-slate-200 px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveDraft}
                  disabled={saving}
                  className="inline-flex h-12 items-center gap-2 rounded-2xl border border-slate-200 px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {saving ? "Saving..." : "Save draft"}
                </button>

                <button
                  onClick={handleNext}
                  disabled={saving}
                  className="inline-flex h-12 items-center gap-2 rounded-2xl bg-violet-500 px-6 text-sm font-semibold text-white transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                  {saving ? "Saving..." : "Next step"}
                </button>
              </div>
            </div>
          </div>

          <aside className="h-fit rounded-[32px] border border-slate-200/80 bg-white p-7 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <h3 className="text-lg font-semibold text-slate-950">Why this step matters</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              The project network often determines where delays, coordination gaps and approval bottlenecks first appear.
            </p>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Used for
                </p>
                <p className="mt-2 text-sm text-slate-800">
                  Interface and coordination risk detection
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Used for
                </p>
                <p className="mt-2 text-sm text-slate-800">
                  Authority and approval exposure
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Used for
                </p>
                <p className="mt-2 text-sm text-slate-800">
                  Supplier and subcontractor dependency mapping
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                Step rule
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                The client belongs in Step 1. This step should only cover execution interfaces, approval bodies and external delivery dependencies.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}