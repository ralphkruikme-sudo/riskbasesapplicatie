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
  country: string | null;
  region: string | null;
  city: string | null;
  postal_code: string | null;
  location_description: string | null;
  site_type: string | null;
  permit_required: boolean | null;
};

export default function Step3Page() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [locationDescription, setLocationDescription] = useState("");
  const [projectEnvironment, setProjectEnvironment] = useState("");
  const [permitsRequired, setPermitsRequired] = useState("");

  useEffect(() => {
    async function loadProject() {
      const { data, error } = await supabase
        .from("projects")
        .select(
          "id, name, country, region, city, postal_code, location_description, site_type, permit_required"
        )
        .eq("id", projectId)
        .single();

      if (error) {
        setMessage("Could not load project.");
        setLoading(false);
        return;
      }

      setProject(data);
      setCountry(data.country || "");
      setRegion(data.region || "");
      setCity(data.city || "");
      setPostalCode(data.postal_code || "");
      setLocationDescription(data.location_description || "");
      setProjectEnvironment(data.site_type || "");
      setPermitsRequired(
        data.permit_required === null ? "" : data.permit_required ? "yes" : "no"
      );
      setLoading(false);
    }

    if (projectId) loadProject();
  }, [projectId]);

  async function saveStep() {
    const { error } = await supabase
      .from("projects")
      .update({
        country: country || null,
        region: region || null,
        city: city || null,
        postal_code: postalCode || null,
        location_description: locationDescription || null,
        site_type: projectEnvironment || null,
        permit_required:
          permitsRequired === ""
            ? null
            : permitsRequired === "yes",
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

    router.push(`/app/projects/${projectId}/intake/step-4`);
  }

  if (loading) {
    return (
      <section className="flex-1 bg-slate-50 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
            Loading step 3...
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
            Step 3 of 8
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
            Project Location
          </h1>

          <p className="mt-2 text-slate-500">
            Add the project location and environment details for{" "}
            <span className="font-medium text-slate-700">
              {project?.name}
            </span>
            .
          </p>

          <div className="mt-6 flex items-center gap-6">
            <div className="h-3 flex-1 rounded-full bg-slate-200">
              <div className="h-3 w-[38%] rounded-full bg-violet-500" />
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
              38%
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
            Project location details
          </h2>

          <p className="mt-1 mb-6 text-sm text-slate-500">
            Everything in this step is optional. Add what you know now and skip the rest if needed.
          </p>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Country
              </label>
              <input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Netherlands"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-violet-400 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Province / region
              </label>
              <input
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="South Holland"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-violet-400 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                City / place
              </label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Rotterdam"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-violet-400 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Postal code
              </label>
              <input
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="3011 AA"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 uppercase outline-none focus:border-violet-400 focus:bg-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Address or project location
              </label>
              <input
                value={locationDescription}
                onChange={(e) => setLocationDescription(e.target.value)}
                placeholder="Maasvlakte terminal area, Rotterdam harbor"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-violet-400 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Project environment
              </label>
              <select
                value={projectEnvironment}
                onChange={(e) => setProjectEnvironment(e.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-violet-400 focus:bg-white"
              >
                <option value="">Select project environment</option>
                <option value="city_center">City center</option>
                <option value="residential_area">Residential area</option>
                <option value="industrial_area">Industrial area</option>
                <option value="port_harbor">Port / harbor</option>
                <option value="open_rural_area">Open rural area</option>
                <option value="offshore_water">Offshore / water</option>
                <option value="infrastructure_corridor">Infrastructure corridor</option>
                <option value="mixed_environment">Mixed environment</option>
              </select>
              <p className="mt-2 text-xs text-slate-400">
                Example: city center, industrial zone, harbor area, offshore or open field.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Permits required?
              </label>
              <select
                value={permitsRequired}
                onChange={(e) => setPermitsRequired(e.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-violet-400 focus:bg-white"
              >
                <option value="">Unknown / not set</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
              <p className="mt-2 text-xs text-slate-400">
                Think of municipal permits, environmental approvals or authority permissions.
              </p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6">
            <button
              onClick={() => router.push(`/app/projects/${projectId}/intake/step-2`)}
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