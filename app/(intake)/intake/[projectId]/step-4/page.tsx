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
  approval_bodies: string | null;
  main_contractor: string | null;
  subcontractors: string | null;
  suppliers: string | null;
  other_stakeholders: string | null;
  stakeholder_complexity: string | null;
  approval_complexity: string | null;
  supplier_dependency_level: string | null;
  utility_owner_present: boolean | null;
  inspection_dependency: boolean | null;
  external_coordination_intensity: string | null;
};

function countEntries(value: string) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean).length;
}

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

function buildStakeholderSignal(params: {
  authorityStakeholder: string;
  approvalBodies: string;
  mainContractor: string;
  subcontractors: string;
  suppliers: string;
  otherStakeholders: string;
  stakeholderComplexity: string;
  approvalComplexity: string;
  supplierDependencyLevel: string;
  utilityOwnerPresent: string;
  inspectionDependency: string;
  externalCoordinationIntensity: string;
}) {
  const {
    authorityStakeholder,
    approvalBodies,
    mainContractor,
    subcontractors,
    suppliers,
    otherStakeholders,
    stakeholderComplexity,
    approvalComplexity,
    supplierDependencyLevel,
    utilityOwnerPresent,
    inspectionDependency,
    externalCoordinationIntensity,
  } = params;

  const subCount = countEntries(subcontractors);
  const supplierCount = countEntries(suppliers);
  const otherCount = countEntries(otherStakeholders);
  const approvalBodyCount = countEntries(approvalBodies);

  if (
    stakeholderComplexity === "high" ||
    approvalComplexity === "high" ||
    supplierDependencyLevel === "high" ||
    externalCoordinationIntensity === "high"
  ) {
    return "This delivery network suggests elevated coordination, approval and dependency-related baseline risk.";
  }

  if (
    utilityOwnerPresent === "yes" ||
    inspectionDependency === "yes" ||
    approvalBodyCount >= 2
  ) {
    return "This project shows meaningful third-party control points, which can create approval bottlenecks and execution delay exposure.";
  }

  if (
    authorityStakeholder.trim() &&
    (mainContractor.trim() || subCount > 0 || supplierCount > 0)
  ) {
    return "This setup combines authority exposure with delivery-chain interfaces, which often increases coordination and approval risk.";
  }

  if (subCount + supplierCount + otherCount >= 6) {
    return "This project already shows a broad external network. Expect more interface, sequencing and alignment pressure.";
  }

  return "Stakeholder context helps RiskBases detect coordination, approval and dependency-related risk patterns.";
}

export default function Step4Page() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.projectId as string | undefined;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [authorityStakeholder, setAuthorityStakeholder] = useState("");
  const [approvalBodies, setApprovalBodies] = useState("");
  const [mainContractor, setMainContractor] = useState("");
  const [subcontractors, setSubcontractors] = useState("");
  const [suppliers, setSuppliers] = useState("");
  const [otherStakeholders, setOtherStakeholders] = useState("");
  const [stakeholderComplexity, setStakeholderComplexity] = useState("medium");
  const [approvalComplexity, setApprovalComplexity] = useState("medium");
  const [supplierDependencyLevel, setSupplierDependencyLevel] = useState("medium");
  const [utilityOwnerPresent, setUtilityOwnerPresent] = useState("");
  const [inspectionDependency, setInspectionDependency] = useState("");
  const [externalCoordinationIntensity, setExternalCoordinationIntensity] =
    useState("medium");

  const progress = 50;

  const stakeholderSignal = useMemo(() => {
    return buildStakeholderSignal({
      authorityStakeholder,
      approvalBodies,
      mainContractor,
      subcontractors,
      suppliers,
      otherStakeholders,
      stakeholderComplexity,
      approvalComplexity,
      supplierDependencyLevel,
      utilityOwnerPresent,
      inspectionDependency,
      externalCoordinationIntensity,
    });
  }, [
    authorityStakeholder,
    approvalBodies,
    mainContractor,
    subcontractors,
    suppliers,
    otherStakeholders,
    stakeholderComplexity,
    approvalComplexity,
    supplierDependencyLevel,
    utilityOwnerPresent,
    inspectionDependency,
    externalCoordinationIntensity,
  ]);

  const subcontractorCount = useMemo(
    () => countEntries(subcontractors),
    [subcontractors]
  );

  const supplierCount = useMemo(() => countEntries(suppliers), [suppliers]);

  const approvalBodyCount = useMemo(
    () => countEntries(approvalBodies),
    [approvalBodies]
  );

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
          .select(`
            id,
            name,
            authority_stakeholder,
            approval_bodies,
            main_contractor,
            subcontractors,
            suppliers,
            other_stakeholders,
            stakeholder_complexity,
            approval_complexity,
            supplier_dependency_level,
            utility_owner_present,
            inspection_dependency,
            external_coordination_intensity
          `)
          .eq("id", projectId)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Project not found.");

        const loaded = data as Project;

        setProject(loaded);
        setAuthorityStakeholder(loaded.authority_stakeholder || "");
        setApprovalBodies(loaded.approval_bodies || "");
        setMainContractor(loaded.main_contractor || "");
        setSubcontractors(loaded.subcontractors || "");
        setSuppliers(loaded.suppliers || "");
        setOtherStakeholders(loaded.other_stakeholders || "");
        setStakeholderComplexity(loaded.stakeholder_complexity || "medium");
        setApprovalComplexity(loaded.approval_complexity || "medium");
        setSupplierDependencyLevel(loaded.supplier_dependency_level || "medium");
        setUtilityOwnerPresent(fromNullableBoolean(loaded.utility_owner_present));
        setInspectionDependency(fromNullableBoolean(loaded.inspection_dependency));
        setExternalCoordinationIntensity(
          loaded.external_coordination_intensity || "medium"
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
        authority_stakeholder: authorityStakeholder.trim() || null,
        approval_bodies: approvalBodies.trim() || null,
        main_contractor: mainContractor.trim() || null,
        subcontractors: subcontractors.trim() || null,
        suppliers: suppliers.trim() || null,
        other_stakeholders: otherStakeholders.trim() || null,
        stakeholder_complexity: stakeholderComplexity || null,
        approval_complexity: approvalComplexity || null,
        supplier_dependency_level: supplierDependencyLevel || null,
        utility_owner_present: toNullableBoolean(utilityOwnerPresent),
        inspection_dependency: toNullableBoolean(inspectionDependency),
        external_coordination_intensity: externalCoordinationIntensity || null,
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
      <section className="min-h-screen bg-[#F4F7FB] px-6 py-10">
        <div className="mx-auto max-w-[1160px]">
          <div className="rounded-[28px] border border-[#D8E1EC] bg-white p-8 shadow-[0_12px_32px_rgba(15,23,42,0.05)]">
            <p className="text-sm font-medium text-[#4B5B73]">Loading step 4...</p>
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
            Step 4 of 8
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-[#081226] md:text-[52px]">
            Delivery network & approvals
          </h1>

          <p className="mt-4 max-w-4xl text-[15px] leading-7 text-[#4B5B73]">
            Add the main delivery and approval parties involved in{" "}
            <span className="font-semibold text-[#0F172A]">
              {project.name || "this project"}
            </span>
            . This step should focus on execution interfaces, approval exposure and
            external coordination only.
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
                <Network className="h-4 w-4" />
                Delivery network
              </div>

              <h2 className="mt-4 text-[30px] font-semibold tracking-[-0.03em] text-[#081226]">
                Main delivery and approval parties
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#4B5B73]">
                Do not repeat the client here. The client belongs in Step 1. This
                step is for approval bodies, contractors, suppliers, utility owners
                and execution interfaces.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Main authority / approval lead
                </label>
                <input
                  value={authorityStakeholder}
                  onChange={(e) => setAuthorityStakeholder(e.target.value)}
                  placeholder="Municipality, port authority, water board..."
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Main contractor
                </label>
                <input
                  value={mainContractor}
                  onChange={(e) => setMainContractor(e.target.value)}
                  placeholder="BAM, Heijmans, Boskalis..."
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                />
              </div>

              <div className="md:col-span-2">
                <div className="mb-2 flex items-center justify-between gap-4">
                  <label className="block text-sm font-medium text-[#1E293B]">
                    Approval bodies
                  </label>
                  <span className="text-xs font-medium text-[#6B7A90]">
                    {approvalBodyCount} listed
                  </span>
                </div>

                <textarea
                  value={approvalBodies}
                  onChange={(e) => setApprovalBodies(e.target.value)}
                  rows={4}
                  placeholder="List approval bodies or authorities by comma or new line"
                  className="w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 py-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Stakeholder complexity
                </label>
                <select
                  value={stakeholderComplexity}
                  onChange={(e) => setStakeholderComplexity(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Approval complexity
                </label>
                <select
                  value={approvalComplexity}
                  onChange={(e) => setApprovalComplexity(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Utility / asset owner present?
                </label>
                <select
                  value={utilityOwnerPresent}
                  onChange={(e) => setUtilityOwnerPresent(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                >
                  <option value="">Unknown / not set</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Inspection dependency?
                </label>
                <select
                  value={inspectionDependency}
                  onChange={(e) => setInspectionDependency(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                >
                  <option value="">Unknown / not set</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <div className="mb-2 flex items-center justify-between gap-4">
                  <label className="block text-sm font-medium text-[#1E293B]">
                    Subcontractors
                  </label>
                  <span className="text-xs font-medium text-[#6B7A90]">
                    {subcontractorCount} listed
                  </span>
                </div>

                <textarea
                  value={subcontractors}
                  onChange={(e) => setSubcontractors(e.target.value)}
                  rows={4}
                  placeholder="Separate important subcontractors by commas or new lines"
                  className="w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 py-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                />
              </div>

              <div className="md:col-span-2">
                <div className="mb-2 flex items-center justify-between gap-4">
                  <label className="block text-sm font-medium text-[#1E293B]">
                    Suppliers
                  </label>
                  <span className="text-xs font-medium text-[#6B7A90]">
                    {supplierCount} listed
                  </span>
                </div>

                <textarea
                  value={suppliers}
                  onChange={(e) => setSuppliers(e.target.value)}
                  rows={4}
                  placeholder="List key suppliers, material providers or logistics partners"
                  className="w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 py-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Supplier dependency level
                </label>
                <select
                  value={supplierDependencyLevel}
                  onChange={(e) => setSupplierDependencyLevel(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  External coordination intensity
                </label>
                <select
                  value={externalCoordinationIntensity}
                  onChange={(e) => setExternalCoordinationIntensity(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Other external parties
                </label>
                <textarea
                  value={otherStakeholders}
                  onChange={(e) => setOtherStakeholders(e.target.value)}
                  rows={4}
                  placeholder="Grid operator, utility owner, inspection body, residents group, permit agency..."
                  className="w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 py-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                />
              </div>
            </div>

            <div className="mt-8 rounded-[24px] border border-[#D8E1EC] bg-[#F8FAFC] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7A90]">
                Stakeholder signal
              </p>
              <p className="mt-2 text-sm font-medium text-[#0F172A]">
                {stakeholderSignal}
              </p>
            </div>

            <div className="mt-10 flex flex-col gap-3 border-t border-[#E2E8F0] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={() => router.push(`/intake/${projectId}/step-3`)}
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
              The project network often determines where delays, coordination gaps
              and approval bottlenecks first appear.
            </p>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl bg-[#F8FAFC] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7A90]">
                  Used for
                </p>
                <p className="mt-2 text-sm font-medium text-[#0F172A]">
                  Interface and coordination risk detection
                </p>
              </div>

              <div className="rounded-2xl bg-[#F8FAFC] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7A90]">
                  Used for
                </p>
                <p className="mt-2 text-sm font-medium text-[#0F172A]">
                  Authority and approval exposure
                </p>
              </div>

              <div className="rounded-2xl bg-[#F8FAFC] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7A90]">
                  Used for
                </p>
                <p className="mt-2 text-sm font-medium text-[#0F172A]">
                  Supplier and subcontractor dependency mapping
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-[24px] border border-[#DCE7FF] bg-[#F7FAFF] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2457FF]">
                Step rule
              </p>
              <p className="mt-3 text-sm leading-6 text-[#36506C]">
                The client belongs in Step 1. This step should only cover execution
                interfaces, approval bodies and external delivery dependencies.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}