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
  intake_method: string | null;
  project_code: string | null;
  description: string | null;
  client_name: string | null;
  contract_type: string | null;
  sector: string | null;
  project_type: string | null;
  status: string | null;
};

const CONTRACT_TYPES = [
  "Traditional",
  "Design & Build",
  "UAV-GC",
  "Framework Agreement",
  "Cost Reimbursable",
  "Alliance",
  "Other",
];

const SECTORS = [
  "Construction",
  "Infrastructure",
  "Industrial",
  "Utilities",
  "Civil Engineering",
  "Real Estate Development",
  "Public Sector",
  "Other",
];

const PROJECT_TYPES = [
  "New Build",
  "Renovation",
  "Expansion",
  "Replacement",
  "Maintenance",
  "Fit-out",
  "Redevelopment",
  "Other",
];

const DELIVERY_TYPES = [
  "Greenfield",
  "Brownfield",
  "Live Operational Site",
  "Phased Delivery",
  "Shutdown / Turnaround",
  "Mixed",
];

function normalizeIntakeMethod(value: string | null) {
  if (!value) return "Manual";
  if (value === "scratch") return "Start from scratch";
  if (value === "csv") return "Import existing data";
  if (value === "api") return "Connect existing system";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function normalizeStatus(value: string | null) {
  if (!value) return "Draft";
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function Step1Page() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.projectId as string | undefined;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [projectName, setProjectName] = useState("");
  const [clientName, setClientName] = useState("");
  const [sector, setSector] = useState("");
  const [projectType, setProjectType] = useState("");
  const [deliveryType, setDeliveryType] = useState("");
  const [contractType, setContractType] = useState("");
  const [description, setDescription] = useState("");

  const progress = useMemo(() => 13, []);

  useEffect(() => {
    async function loadProject() {
      try {
        setLoading(true);
        setErrorMessage("");

        if (!projectId) {
          throw new Error("Missing project id.");
        }

        const { data, error } = await supabase
          .from("projects")
          .select(
            "id, name, intake_method, project_code, description, client_name, contract_type, sector, project_type, status, site_type"
          )
          .eq("id", projectId)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Project not found.");

        setProject(data);
        setProjectName(data.name ?? "");
        setClientName(data.client_name ?? "");
        setSector(data.sector ?? "");
        setProjectType(data.project_type ?? "");
        setDeliveryType((data as any).site_type ?? "");
        setContractType(data.contract_type ?? "");
        setDescription(data.description ?? "");
      } catch (error: any) {
        setProject(null);
        setErrorMessage(error?.message || "Could not load project.");
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [projectId]);

  async function saveProject() {
    if (!projectId) {
      return { message: "Missing project id." };
    }

    const payload = {
      name: projectName.trim() || null,
      client_name: clientName.trim() || null,
      sector: sector || null,
      project_type: projectType || null,
      site_type: deliveryType || null,
      contract_type: contractType || null,
      description: description.trim() || null,
      status: project?.status || "draft",
    };

    const { error } = await supabase
      .from("projects")
      .update(payload)
      .eq("id", projectId);

    return error;
  }

  async function handleSaveDraft() {
    try {
      setSaving(true);
      setErrorMessage("");

      const error = await saveProject();
      if (error) throw error;
    } catch (error: any) {
      setErrorMessage(error?.message || "Could not save draft.");
    } finally {
      setSaving(false);
    }
  }

  async function handleNext() {
    try {
      setSaving(true);
      setErrorMessage("");

      if (!projectName.trim()) {
        throw new Error("Project name is required.");
      }

      if (!sector) {
        throw new Error("Sector is required.");
      }

      if (!projectType) {
        throw new Error("Project type is required.");
      }

      const error = await saveProject();
      if (error) throw error;

      router.push(`/intake/${projectId}/step-2`);
    } catch (error: any) {
      setErrorMessage(error?.message || "Could not continue to the next step.");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="min-h-screen bg-[#F4F7FB] px-6 py-10">
        <div className="mx-auto max-w-[1160px]">
          <div className="rounded-[28px] border border-[#D8E1EC] bg-white p-8 shadow-[0_12px_32px_rgba(15,23,42,0.05)]">
            <p className="text-sm font-medium text-[#4B5B73]">Loading step 1...</p>
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
              {errorMessage || "We could not load this project for the intake flow."}
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
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold tracking-[0.02em] text-[#2457FF]">
                Step 1 of 8
              </p>

              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-[#081226] md:text-[52px]">
                Project foundation
              </h1>

              <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[#4B5B73]">
                Define the core identity of this project before moving into delivery
                pressure, location, approvals, dependencies and baseline generation.
              </p>
            </div>

            <div className="grid w-full max-w-[230px] gap-4">
              <div className="rounded-[24px] border border-[#D8E1EC] bg-white px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7A90]">
                  Project code
                </p>
                <p className="mt-1 text-sm font-semibold text-[#0F172A]">
                  {project.project_code || "Not generated"}
                </p>
              </div>

              <div className="rounded-[24px] border border-[#D8E1EC] bg-white px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7A90]">
                  Status
                </p>
                <p className="mt-1 text-sm font-semibold text-[#0F172A]">
                  {normalizeStatus(project.status)}
                </p>
              </div>
            </div>
          </div>

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

        {errorMessage && (
          <div className="mb-6 rounded-[22px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="rounded-[32px] border border-[#D8E1EC] bg-white p-8 shadow-[0_14px_36px_rgba(15,23,42,0.05)] md:p-10">
            <div className="mb-8">
              <div className="inline-flex items-center rounded-full border border-[#C9D8FF] bg-[#EEF4FF] px-3 py-1 text-xs font-semibold text-[#2457FF]">
                Project setup
              </div>

              <h2 className="mt-4 text-[30px] font-semibold tracking-[-0.03em] text-[#081226]">
                Core project details
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#4B5B73]">
                Keep this step focused on project identity and commercial setup only.
                Planning, site exposure, approvals and dependencies are captured in the
                next steps.
              </p>
            </div>

            <div className="grid gap-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Project name <span className="text-[#2457FF]">*</span>
                </label>
                <input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="For example: Rotterdam Harbour Logistics Hub Expansion"
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Client / opdrachtgever
                </label>
                <input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="For example: Gemeente Rotterdam"
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                    Sector <span className="text-[#2457FF]">*</span>
                  </label>
                  <select
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                  >
                    <option value="">Select sector</option>
                    {SECTORS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                    Project type <span className="text-[#2457FF]">*</span>
                  </label>
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                  >
                    <option value="">Select project type</option>
                    {PROJECT_TYPES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                    Delivery type
                  </label>
                  <select
                    value={deliveryType}
                    onChange={(e) => setDeliveryType(e.target.value)}
                    className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                  >
                    <option value="">Select delivery type</option>
                    {DELIVERY_TYPES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                    Contract type
                  </label>
                  <select
                    value={contractType}
                    onChange={(e) => setContractType(e.target.value)}
                    className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                  >
                    <option value="">Select contract type</option>
                    {CONTRACT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Short project description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  placeholder="Summarise the scope, main objective and what kind of project this is. Keep it short and specific."
                  className="w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 py-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                />
                <p className="mt-2 text-xs leading-5 text-[#6B7A90]">
                  This short description helps later intake steps and baseline generation
                  stay aligned with the actual project scope.
                </p>
              </div>

              <div className="grid gap-5 border-t border-[#E2E8F0] pt-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                    Project code
                  </label>
                  <div className="flex h-14 items-center rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-sm text-[#64748B]">
                    {project.project_code || "Not generated"}
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[#6B7A90]">
                    Internal reference code for this project.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                    Intake method
                  </label>
                  <div className="flex h-14 items-center rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-sm text-[#64748B]">
                    {normalizeIntakeMethod(project.intake_method)}
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[#6B7A90]">
                    This project is currently following the selected intake path.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-3 border-t border-[#E2E8F0] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={() => router.push("/app")}
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-[#D8E1EC] bg-white px-5 text-sm font-medium text-[#1E293B] transition hover:bg-[#F8FAFC]"
              >
                Back to projects
              </button>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={handleSaveDraft}
                  disabled={saving}
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-[#D8E1EC] bg-white px-5 text-sm font-medium text-[#1E293B] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save draft"}
                </button>

                <button
                  onClick={handleNext}
                  disabled={saving || !projectName.trim() || !sector || !projectType}
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#2457FF] px-6 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(36,87,255,0.22)] transition hover:bg-[#1D4BE0] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Next step
                </button>
              </div>
            </div>
          </div>

          <aside className="h-fit rounded-[32px] border border-[#D8E1EC] bg-white p-7 shadow-[0_14px_36px_rgba(15,23,42,0.05)]">
            <h3 className="text-xl font-semibold tracking-tight text-[#081226]">
              Why this step matters
            </h3>
            <p className="mt-3 text-sm leading-6 text-[#4B5B73]">
              Step 1 should define what this project is, who it is for and what kind
              of delivery context it starts from. It should stay light, but not vague.
            </p>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl bg-[#F8FAFC] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7A90]">
                  Used for
                </p>
                <p className="mt-2 text-sm font-medium text-[#0F172A]">
                  Core project identification
                </p>
              </div>

              <div className="rounded-2xl bg-[#F8FAFC] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7A90]">
                  Used for
                </p>
                <p className="mt-2 text-sm font-medium text-[#0F172A]">
                  Better baseline template fit
                </p>
              </div>

              <div className="rounded-2xl bg-[#F8FAFC] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7A90]">
                  Used for
                </p>
                <p className="mt-2 text-sm font-medium text-[#0F172A]">
                  Stronger intake continuity
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-[24px] border border-[#DCE7FF] bg-[#F7FAFF] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2457FF]">
                RiskBases note
              </p>
              <p className="mt-3 text-sm leading-6 text-[#36506C]">
                Keep Step 1 focused on identity and scope only. Planning pressure,
                location, technical unknowns, delivery parties and dependencies belong
                in the next steps.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}