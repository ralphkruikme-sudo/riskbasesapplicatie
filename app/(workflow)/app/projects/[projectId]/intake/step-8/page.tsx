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
  description: string | null;
  project_code: string | null;

  client_name: string | null;
  project_type: string | null;
  contract_type: string | null;
  project_value: string | null;
  start_date: string | null;
  end_date: string | null;

  country: string | null;
  region: string | null;
  city: string | null;
  postal_code: string | null;
  location_description: string | null;
  site_type: string | null;
  permit_required: boolean | null;

  client_stakeholder: string | null;
  authority_stakeholder: string | null;
  main_contractor: string | null;
  subcontractors: string | null;
  suppliers: string | null;
  other_stakeholders: string | null;

  project_phase: string | null;
  key_milestones: string | null;
  critical_dependencies: string | null;
  planning_notes: string | null;

  probability_scale: string | null;
  impact_scale: string | null;
  risk_threshold: string | null;
  review_frequency: string | null;
  risk_owner_required: boolean | null;
  mitigation_required: boolean | null;

  initial_risks: string | null;
  selected_risk_categories: string | null;
};

function formatBudget(value: string | null) {
  if (!value) return "—";
  const digits = value.replace(/\D/g, "");
  if (!digits) return "—";
  return `€ ${new Intl.NumberFormat("nl-NL").format(Number(digits))}`;
}

function formatDate(value: string | null) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("en-GB");
  } catch {
    return value;
  }
}

function yesNoUnknown(value: boolean | null) {
  if (value === null) return "Unknown";
  return value ? "Yes" : "No";
}

function displayValue(value: string | null) {
  return value && value.trim() ? value : "—";
}

export default function Step8Page() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProject() {
      const { data, error } = await supabase
        .from("projects")
        .select(`
          id,
          name,
          description,
          project_code,
          client_name,
          project_type,
          contract_type,
          project_value,
          start_date,
          end_date,
          country,
          region,
          city,
          postal_code,
          location_description,
          site_type,
          permit_required,
          client_stakeholder,
          authority_stakeholder,
          main_contractor,
          subcontractors,
          suppliers,
          other_stakeholders,
          project_phase,
          key_milestones,
          critical_dependencies,
          planning_notes,
          probability_scale,
          impact_scale,
          risk_threshold,
          review_frequency,
          risk_owner_required,
          mitigation_required,
          initial_risks,
          selected_risk_categories
        `)
        .eq("id", projectId)
        .single();

      if (error) {
        setMessage("Could not load project review.");
        setLoading(false);
        return;
      }

      setProject(data);
      setLoading(false);
    }

    if (projectId) loadProject();
  }, [projectId]);

  async function handleFinish() {
    setFinishing(true);
    setMessage("");

    const { error } = await supabase
      .from("projects")
      .update({
        intake_completed: true,
        intake_completed_at: new Date().toISOString(),
      })
      .eq("id", projectId);

    if (error) {
      setMessage(error.message || "Could not complete intake.");
      setFinishing(false);
      return;
    }

    router.push(`/app/projects/${projectId}`);
  }

  if (loading) {
    return (
      <section className="flex-1 bg-slate-50 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
            Loading step 8...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 bg-slate-50 py-16">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-10">
          <p className="text-sm font-semibold text-violet-600">
            Step 8 of 8
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
            Review & Generate
          </h1>

          <p className="mt-2 text-slate-500">
            Review the project setup for{" "}
            <span className="font-medium text-slate-700">
              {project?.name}
            </span>{" "}
            before opening the project workspace.
          </p>

          <div className="mt-6 flex items-center gap-6">
            <div className="h-3 flex-1 rounded-full bg-slate-200">
              <div className="h-3 w-full rounded-full bg-violet-500" />
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
              100%
            </div>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              Project basics
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-slate-400">Project name</p>
                <p className="mt-1 text-base font-medium text-slate-800">
                  {displayValue(project?.name ?? null)}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Project code</p>
                <p className="mt-1 text-base font-medium text-slate-800">
                  {displayValue(project?.project_code ?? null)}
                </p>
              </div>

              <div className="md:col-span-2">
                <p className="text-sm text-slate-400">Description</p>
                <p className="mt-1 whitespace-pre-wrap text-base font-medium text-slate-800">
                  {displayValue(project?.description ?? null)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              Project details
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-slate-400">Client</p>
                <p className="mt-1 text-base font-medium text-slate-800">
                  {displayValue(project?.client_name ?? null)}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Project type</p>
                <p className="mt-1 text-base font-medium text-slate-800">
                  {displayValue(project?.project_type ?? null)}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Contract type</p>
                <p className="mt-1 text-base font-medium text-slate-800">
                  {displayValue(project?.contract_type ?? null)}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Project value</p>
                <p className="mt-1 text-base font-medium text-slate-800">
                  {formatBudget(project?.project_value ?? null)}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Start date</p>
                <p className="mt-1 text-base font-medium text-slate-800">
                  {formatDate(project?.start_date ?? null)}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">End date</p>
                <p className="mt-1 text-base font-medium text-slate-800">
                  {formatDate(project?.end_date ?? null)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              Location & context
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-slate-400">Country</p>
                <p className="mt-1 text-base font-medium text-slate-800">
                  {displayValue(project?.country ?? null)}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Province / region</p>
                <p className="mt-1 text-base font-medium text-slate-800">
                  {displayValue(project?.region ?? null)}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">City / place</p>
                <p className="mt-1 text-base font-medium text-slate-800">
                  {displayValue(project?.city ?? null)}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Postal code</p>
                <p className="mt-1 text-base font-medium text-slate-800">
                  {displayValue(project?.postal_code ?? null)}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Project environment</p>
                <p className="mt-1 text-base font-medium text-slate-800">
                  {displayValue(project?.site_type ?? null)}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Permits required?</p>
                <p className="mt-1 text-base font-medium text-slate-800">
                  {yesNoUnknown(project?.permit_required ?? null)}
                </p>
              </div>

              <div className="md:col-span-2">
                <p className="text-sm text-slate-400">Address or project location</p>
                <p className="mt-1 text-base font-medium text-slate-800">
                  {displayValue(project?.location_description ?? null)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              Stakeholders
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-slate-400">Client / opdrachtgever</p>
                <p className="mt-1 text-base font-medium text-slate-800">
                  {displayValue(project?.client_stakeholder ?? null)}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Municipality / authority</p>
                <p className="mt-1 text-base font-medium text-slate-800">
                  {displayValue(project?.authority_stakeholder ?? null)}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Main contractor</p>
                <p className="mt-1 text-base font-medium text-slate-800">
                  {displayValue(project?.main_contractor ?? null)}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Subcontractors</p>
                <p className="mt-1 whitespace-pre-wrap text-base font-medium text-slate-800">
                  {displayValue(project?.subcontractors ?? null)}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Suppliers</p>
                <p className="mt-1 whitespace-pre-wrap text-base font-medium text-slate-800">
                  {displayValue(project?.suppliers ?? null)}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Other stakeholders</p>
                <p className="mt-1 whitespace-pre-wrap text-base font-medium text-slate-800">
                  {displayValue(project?.other_stakeholders ?? null)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              Planning & risk setup
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-slate-400">Project phase</p>
                <p className="mt-1 text-base font-medium text-slate-800">
                  {displayValue(project?.project_phase ?? null)}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Review frequency</p>
                <p className="mt-1 text-base font-medium text-slate-800">
                  {displayValue(project?.review_frequency ?? null)}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Probability scale</p>
                <p className="mt-1 text-base font-medium text-slate-800">
                  {displayValue(project?.probability_scale ?? null)}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Impact scale</p>
                <p className="mt-1 text-base font-medium text-slate-800">
                  {displayValue(project?.impact_scale ?? null)}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Risk threshold</p>
                <p className="mt-1 text-base font-medium text-slate-800">
                  {displayValue(project?.risk_threshold ?? null)}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Risk owner required?</p>
                <p className="mt-1 text-base font-medium text-slate-800">
                  {yesNoUnknown(project?.risk_owner_required ?? null)}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Mitigation required?</p>
                <p className="mt-1 text-base font-medium text-slate-800">
                  {yesNoUnknown(project?.mitigation_required ?? null)}
                </p>
              </div>

              <div className="md:col-span-2">
                <p className="text-sm text-slate-400">Key milestones</p>
                <p className="mt-1 whitespace-pre-wrap text-base font-medium text-slate-800">
                  {displayValue(project?.key_milestones ?? null)}
                </p>
              </div>

              <div className="md:col-span-2">
                <p className="text-sm text-slate-400">Critical dependencies</p>
                <p className="mt-1 whitespace-pre-wrap text-base font-medium text-slate-800">
                  {displayValue(project?.critical_dependencies ?? null)}
                </p>
              </div>

              <div className="md:col-span-2">
                <p className="text-sm text-slate-400">Planning notes</p>
                <p className="mt-1 whitespace-pre-wrap text-base font-medium text-slate-800">
                  {displayValue(project?.planning_notes ?? null)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              Initial risks
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-4">
              <div>
                <p className="text-sm text-slate-400">Selected risk categories</p>
                <p className="mt-1 whitespace-pre-wrap text-base font-medium text-slate-800">
                  {displayValue(project?.selected_risk_categories ?? null)}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">Initial risks</p>
                <p className="mt-1 whitespace-pre-wrap text-base font-medium text-slate-800">
                  {displayValue(project?.initial_risks ?? null)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6">
          <button
            onClick={() => router.push(`/app/projects/${projectId}/intake/step-7`)}
            className="rounded-xl border border-slate-200 px-5 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Back
          </button>

          <button
            onClick={handleFinish}
            disabled={finishing}
            className="rounded-xl bg-violet-500 px-6 py-2 text-sm font-semibold text-white hover:bg-violet-600 disabled:opacity-60"
          >
            {finishing ? "Generating..." : "Open Project Dashboard"}
          </button>
        </div>
      </div>
    </section>
  );
}