"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2, MapPin, Save } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Project = {
  id: string;
  name: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  postal_code: string | null;
  location_description: string | null;
  site_type: string | null;
  permit_required: boolean | null;
  restricted_access_site: boolean | null;
  near_residential_area: boolean | null;
  live_environment: boolean | null;
  environmental_sensitivity: string | null;
  weather_exposure: string | null;
  logistics_complexity: string | null;
};

const ENVIRONMENT_OPTIONS = [
  { value: "city_center", label: "City center" },
  { value: "residential_area", label: "Residential area" },
  { value: "industrial_area", label: "Industrial area" },
  { value: "port_harbor", label: "Port / harbor" },
  { value: "open_rural_area", label: "Open rural area" },
  { value: "offshore_water", label: "Offshore / water" },
  { value: "infrastructure_corridor", label: "Infrastructure corridor" },
  { value: "existing_operational_site", label: "Existing operational site" },
  { value: "mixed_environment", label: "Mixed environment" },
];

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

function getEnvironmentSignal(params: {
  projectEnvironment: string;
  permitsRequired: string;
  restrictedAccessSite: string;
  nearResidentialArea: string;
  liveEnvironment: string;
  environmentalSensitivity: string;
  weatherExposure: string;
  logisticsComplexity: string;
}) {
  const {
    projectEnvironment,
    permitsRequired,
    restrictedAccessSite,
    nearResidentialArea,
    liveEnvironment,
    environmentalSensitivity,
    weatherExposure,
    logisticsComplexity,
  } = params;

  if (
    projectEnvironment === "port_harbor" ||
    projectEnvironment === "offshore_water"
  ) {
    return "This site profile suggests elevated logistics, access, authority and operational coordination exposure.";
  }

  if (
    projectEnvironment === "city_center" ||
    projectEnvironment === "residential_area" ||
    nearResidentialArea === "yes"
  ) {
    return "This site profile suggests increased nuisance, stakeholder, permit and delivery-constraint risk.";
  }

  if (liveEnvironment === "yes" || restrictedAccessSite === "yes") {
    return "This site profile suggests higher sequencing, safety and access-control exposure during execution.";
  }

  if (
    permitsRequired === "yes" ||
    environmentalSensitivity === "high" ||
    weatherExposure === "high" ||
    logisticsComplexity === "high"
  ) {
    return "This site profile is likely to increase permit, planning, logistics and execution-related baseline risk.";
  }

  return "Location and site conditions help RiskBases identify the most relevant baseline risk patterns.";
}

export default function Step3Page() {
  const router = useRouter();
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;

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
  const [restrictedAccessSite, setRestrictedAccessSite] = useState("");
  const [nearResidentialArea, setNearResidentialArea] = useState("");
  const [liveEnvironment, setLiveEnvironment] = useState("");
  const [environmentalSensitivity, setEnvironmentalSensitivity] = useState("medium");
  const [weatherExposure, setWeatherExposure] = useState("medium");
  const [logisticsComplexity, setLogisticsComplexity] = useState("medium");

  const progress = 38;

  const environmentSignal = useMemo(() => {
    return getEnvironmentSignal({
      projectEnvironment,
      permitsRequired,
      restrictedAccessSite,
      nearResidentialArea,
      liveEnvironment,
      environmentalSensitivity,
      weatherExposure,
      logisticsComplexity,
    });
  }, [
    projectEnvironment,
    permitsRequired,
    restrictedAccessSite,
    nearResidentialArea,
    liveEnvironment,
    environmentalSensitivity,
    weatherExposure,
    logisticsComplexity,
  ]);

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
            country,
            region,
            city,
            postal_code,
            location_description,
            site_type,
            permit_required,
            restricted_access_site,
            near_residential_area,
            live_environment,
            environmental_sensitivity,
            weather_exposure,
            logistics_complexity
          `)
          .eq("id", projectId)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Project not found.");

        const loaded = data as Project;

        setProject(loaded);
        setCountry(loaded.country || "");
        setRegion(loaded.region || "");
        setCity(loaded.city || "");
        setPostalCode(loaded.postal_code || "");
        setLocationDescription(loaded.location_description || "");
        setProjectEnvironment(loaded.site_type || "");
        setPermitsRequired(fromNullableBoolean(loaded.permit_required));
        setRestrictedAccessSite(fromNullableBoolean(loaded.restricted_access_site));
        setNearResidentialArea(fromNullableBoolean(loaded.near_residential_area));
        setLiveEnvironment(fromNullableBoolean(loaded.live_environment));
        setEnvironmentalSensitivity(loaded.environmental_sensitivity || "medium");
        setWeatherExposure(loaded.weather_exposure || "medium");
        setLogisticsComplexity(loaded.logistics_complexity || "medium");
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
        country: country.trim() || null,
        region: region.trim() || null,
        city: city.trim() || null,
        postal_code: postalCode.trim().toUpperCase() || null,
        location_description: locationDescription.trim() || null,
        site_type: projectEnvironment || null,
        permit_required: toNullableBoolean(permitsRequired),
        restricted_access_site: toNullableBoolean(restrictedAccessSite),
        near_residential_area: toNullableBoolean(nearResidentialArea),
        live_environment: toNullableBoolean(liveEnvironment),
        environmental_sensitivity: environmentalSensitivity || null,
        weather_exposure: weatherExposure || null,
        logistics_complexity: logisticsComplexity || null,
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

      router.push(`/intake/${projectId}/step-4`);
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
            <p className="text-sm text-slate-600">Loading Step 3...</p>
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
          <p className="text-sm font-semibold text-violet-600">Step 3 of 8</p>

          <h1 className="mt-3 text-5xl font-semibold tracking-[-0.04em] text-slate-950">
            Location & environment
          </h1>

          <p className="mt-3 max-w-4xl text-[15px] leading-7 text-slate-600">
            Add the site context for{" "}
            <span className="font-medium text-slate-800">
              {project?.name || "this project"}
            </span>
            . These details help RiskBases detect permit, logistics, access and execution-related exposure.
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
                <MapPin className="h-4 w-4" />
                Site context
              </div>

              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
                Project location details
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Keep this step structured and location-driven. No stakeholder fields, no commercial fields and no large free-text blocks.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Country
                </label>
                <input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Netherlands"
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 text-[15px] text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Province / region
                </label>
                <input
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="South Holland"
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 text-[15px] text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  City / place
                </label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Rotterdam"
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 text-[15px] text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Postal code
                </label>
                <input
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="3011 AA"
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 uppercase text-[15px] text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Address or project location
                </label>
                <input
                  value={locationDescription}
                  onChange={(e) => setLocationDescription(e.target.value)}
                  placeholder="For example: live inner-city junction, bridge corridor, harbor terminal zone"
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 text-[15px] text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Project environment
                </label>
                <select
                  value={projectEnvironment}
                  onChange={(e) => setProjectEnvironment(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 text-[15px] text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
                >
                  <option value="">Select project environment</option>
                  {ENVIRONMENT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Permits required?
                </label>
                <select
                  value={permitsRequired}
                  onChange={(e) => setPermitsRequired(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 text-[15px] text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
                >
                  <option value="">Unknown / not set</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Restricted site access?
                </label>
                <select
                  value={restrictedAccessSite}
                  onChange={(e) => setRestrictedAccessSite(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 text-[15px] text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
                >
                  <option value="">Unknown / not set</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Near residential area?
                </label>
                <select
                  value={nearResidentialArea}
                  onChange={(e) => setNearResidentialArea(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 text-[15px] text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
                >
                  <option value="">Unknown / not set</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Live operational environment?
                </label>
                <select
                  value={liveEnvironment}
                  onChange={(e) => setLiveEnvironment(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 text-[15px] text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
                >
                  <option value="">Unknown / not set</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Environmental sensitivity
                </label>
                <select
                  value={environmentalSensitivity}
                  onChange={(e) => setEnvironmentalSensitivity(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 text-[15px] text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Weather exposure
                </label>
                <select
                  value={weatherExposure}
                  onChange={(e) => setWeatherExposure(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 text-[15px] text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-800">
                  Logistics complexity
                </label>
                <select
                  value={logisticsComplexity}
                  onChange={(e) => setLogisticsComplexity(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 text-[15px] text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="mt-8 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                Environment signal
              </p>
              <p className="mt-2 text-sm font-medium text-slate-800">
                {environmentSignal}
              </p>
            </div>

            <div className="mt-10 flex items-center justify-between border-t border-slate-200 pt-6">
              <button
                onClick={() => router.push(`/intake/${projectId}/step-2`)}
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
              Location context strongly affects which risks are likely to appear first in the project baseline.
            </p>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Used for
                </p>
                <p className="mt-2 text-sm text-slate-800">
                  Permit and authority risk detection
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Used for
                </p>
                <p className="mt-2 text-sm text-slate-800">
                  Logistics and access exposure
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Used for
                </p>
                <p className="mt-2 text-sm text-slate-800">
                  Better baseline template matching
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                Step rule
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Keep this step fully site-focused. No commercial fields, no stakeholder fields and no long free-text notes.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}