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
  intake_method: "manual" | "csv" | "api" | null;
  project_code: string | null;
  description: string | null;
  client_name: string | null;
  project_type: string | null;
  contract_type: string | null;
};

const PROJECT_TYPES = [
  "Construction",
  "Infrastructure",
  "Renovation",
  "Marine / Offshore",
  "Utilities",
  "Industrial",
  "Other",
];

const CONTRACT_TYPES = [
  "Traditional",
  "Design & Build",
  "UAV-GC",
  "Framework agreement",
  "Cost reimbursable",
  "Other",
];

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
  const [projectType, setProjectType] = useState("");
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
            "id, name, intake_method, project_code, description, client_name, project_type, contract_type"
          )
          .eq("id", projectId)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Project not found.");

        setProject(data);
        setProjectName(data.name ?? "");
        setClientName(data.client_name ?? "");
        setProjectType(data.project_type ?? "");
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
      project_type: projectType || null,
      contract_type: contractType || null,
      description: description.trim() || null,
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
      <section className="min-h-screen bg-[#f5f7fb] px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[28px] border border-slate-200/80 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <p className="text-sm text-slate-600">Loading step 1...</p>
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
              {errorMessage || "We could not load this project for the intake flow."}
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
          <p className="text-sm font-semibold text-violet-600">Step 1 of 8</p>

          <h1 className="mt-3 text-5xl font-semibold tracking-[-0.04em] text-slate-950">
            Project foundation
          </h1>

          <p className="mt-3 max-w-3xl text-[15px] leading-7 text-slate-600">
            Set the essential project context for RiskBases. These details help
            structure the intake and prepare the project for initial baseline risk generation.
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

        {errorMessage && (
          <div className="mb-6 rounded-[24px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-[32px] border border-slate-200/80 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.04)] md:p-10">
            <div className="mb-8">
              <div className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                Project setup
              </div>

              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
                Core project details
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Start with the minimum project information RiskBases needs to create
                a strong project structure and generate relevant baseline risks later on.
              </p>
            </div>

            <div className="grid gap-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Project name <span className="text-violet-600">*</span>
                </label>
                <input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="For example: Maasvlakte Terminal Expansion"
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 text-[15px] text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Client / opdrachtgever
                </label>
                <input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="For example: Gemeente Rotterdam"
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 text-[15px] text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-800">
                    Project type
                  </label>
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 text-[15px] text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
                  >
                    <option value="">Select project type</option>
                    {PROJECT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-800">
                    Contract type
                  </label>
                  <select
                    value={contractType}
                    onChange={(e) => setContractType(e.target.value)}
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 text-[15px] text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
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
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Short project description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  placeholder="Describe the scope, delivery context, or anything important that should shape the first project setup..."
                  className="w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 py-4 text-[15px] text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
                />
              </div>

              <div className="grid gap-6 border-t border-slate-200 pt-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-800">
                    Project code
                  </label>
                  <div className="flex h-14 items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500">
                    {project.project_code || "Not generated"}
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Internal reference code for this project.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-800">
                    Intake method
                  </label>
                  <div className="flex h-14 items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm capitalize text-slate-500">
                    {project.intake_method ?? "manual"}
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    This project is currently following the manual intake flow.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 flex items-center justify-between border-t border-slate-200 pt-6">
              <button
                onClick={() => router.push("/app")}
                className="inline-flex h-12 items-center rounded-2xl border border-slate-200 px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Back to projects
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
                  disabled={saving || !projectName.trim()}
                  className="inline-flex h-12 items-center rounded-2xl bg-violet-500 px-6 text-sm font-semibold text-white transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Next step
                </button>
              </div>
            </div>
          </div>

          <aside className="h-fit rounded-[32px] border border-slate-200/80 bg-white p-7 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <h3 className="text-lg font-semibold text-slate-950">Why this step matters</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              RiskBases uses these core project details to shape the intake flow and
              improve the relevance of the first generated risk baseline.
            </p>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Used for
                </p>
                <p className="mt-2 text-sm text-slate-800">
                  Risk template matching
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Used for
                </p>
                <p className="mt-2 text-sm text-slate-800">
                  Better project classification
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Used for
                </p>
                <p className="mt-2 text-sm text-slate-800">
                  Stronger initial baseline generation
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}