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
  name: string;
  client_name: string | null;
  project_type: string | null;
  contract_type: string | null;
  project_value: string | null;
  start_date: string | null;
  end_date: string | null;
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function formatEuroFromDigits(value: string) {
  if (!value) return "";
  return new Intl.NumberFormat("nl-NL").format(Number(value));
}

function normalizeDateValue(value: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

export default function Step2Page() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [clientName, setClientName] = useState("");
  const [projectType, setProjectType] = useState("");
  const [contractType, setContractType] = useState("");
  const [projectValueRaw, setProjectValueRaw] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const formattedBudget = useMemo(() => {
    return formatEuroFromDigits(projectValueRaw);
  }, [projectValueRaw]);

  useEffect(() => {
    async function loadProject() {
      const { data, error } = await supabase
        .from("projects")
        .select(
          "id, name, client_name, project_type, contract_type, project_value, start_date, end_date"
        )
        .eq("id", projectId)
        .single();

      if (error) {
        setMessage("Could not load project.");
        setLoading(false);
        return;
      }

      setProject(data);
      setClientName(data.client_name || "");
      setProjectType(data.project_type || "");
      setContractType(data.contract_type || "");
      setProjectValueRaw(data.project_value || "");
      setStartDate(normalizeDateValue(data.start_date));
      setEndDate(normalizeDateValue(data.end_date));
      setLoading(false);
    }

    if (projectId) loadProject();
  }, [projectId]);

  async function saveStep() {
    const { error } = await supabase
      .from("projects")
      .update({
        client_name: clientName || null,
        project_type: projectType || null,
        contract_type: contractType || null,
        project_value: projectValueRaw || null,
        start_date: startDate || null,
        end_date: endDate || null,
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

    router.push(`/app/projects/${projectId}/intake/step-3`);
  }

  if (loading) {
    return (
      <section className="flex-1 bg-slate-50 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
            Loading step 2...
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
            Step 2 of 8
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
            Project Details
          </h1>

          <p className="mt-2 text-slate-500">
            Add the main project details for{" "}
            <span className="font-medium text-slate-700">
              {project?.name}
            </span>
            .
          </p>

          <div className="mt-6 flex items-center gap-6">
            <div className="h-3 flex-1 rounded-full bg-slate-200">
              <div className="h-3 w-[25%] rounded-full bg-violet-500" />
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
              25%
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
            Main project details
          </h2>

          <p className="mt-1 mb-6 text-sm text-slate-500">
            Everything in this step is optional. You can skip fields and continue.
          </p>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Client / opdrachtgever
              </label>
              <input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Gemeente Rotterdam"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-violet-400 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Project type
              </label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-violet-400 focus:bg-white"
              >
                <option value="">Select project type</option>
                <option value="building">Building</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="civil">Civil</option>
                <option value="renovation">Renovation</option>
                <option value="harbor">Harbor / Port</option>
                <option value="offshore">Offshore</option>
                <option value="industrial">Industrial</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Contract type
              </label>
              <select
                value={contractType}
                onChange={(e) => setContractType(e.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-violet-400 focus:bg-white"
              >
                <option value="">Select contract type</option>
                <option value="uav">UAV</option>
                <option value="uav-gc">UAV-GC</option>
                <option value="design-build">Design & Build</option>
                <option value="epc">EPC</option>
                <option value="alliance">Alliance</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Project value / budget
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  €
                </span>
                <input
                  value={formattedBudget}
                  onChange={(e) => setProjectValueRaw(onlyDigits(e.target.value))}
                  inputMode="numeric"
                  placeholder="2.000.000"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-4 outline-none focus:border-violet-400 focus:bg-white"
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Type numbers only. We format the amount automatically.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Start date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-violet-400 focus:bg-white"
              />
              <p className="mt-2 text-xs text-slate-400">
                Select the exact project start date.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                End date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-violet-400 focus:bg-white"
              />
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6">
            <button
              onClick={() => router.push(`/app/projects/${projectId}/intake/step-1`)}
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