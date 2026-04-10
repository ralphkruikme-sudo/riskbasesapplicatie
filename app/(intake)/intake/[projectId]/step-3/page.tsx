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
  address_line: string | null;
  site_type: string | null;
  permit_required: boolean | null;
  restricted_access_site: boolean | null;
  near_residential_area: boolean | null;
  live_environment: boolean | null;
  environmental_sensitivity: string | null;
  weather_exposure: string | null;
  logistics_complexity: string | null;
  underground_services_uncertainty: string | null;
  utility_relocation_expected: boolean | null;
  traffic_interface_complexity: string | null;
  site_condition_confidence: string | null;
  noise_nuisance_sensitivity: string | null;
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
  undergroundServicesUncertainty: string;
  utilityRelocationExpected: string;
  trafficInterfaceComplexity: string;
  noiseNuisanceSensitivity: string;
  siteConditionConfidence: string;
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
    undergroundServicesUncertainty,
    utilityRelocationExpected,
    trafficInterfaceComplexity,
    noiseNuisanceSensitivity,
    siteConditionConfidence,
  } = params;

  if (
    projectEnvironment === "port_harbor" ||
    projectEnvironment === "offshore_water"
  ) {
    return "This site profile suggests elevated logistics, authority coordination, access control and operational interface exposure.";
  }

  if (
    projectEnvironment === "city_center" ||
    projectEnvironment === "residential_area" ||
    nearResidentialArea === "yes" ||
    noiseNuisanceSensitivity === "high"
  ) {
    return "This site profile suggests increased nuisance sensitivity, permit pressure, stakeholder exposure and delivery constraints.";
  }

  if (
    liveEnvironment === "yes" ||
    restrictedAccessSite === "yes" ||
    trafficInterfaceComplexity === "high"
  ) {
    return "This site profile suggests higher sequencing, traffic-control, safety and access-management exposure during execution.";
  }

  if (
    undergroundServicesUncertainty === "high" ||
    utilityRelocationExpected === "yes" ||
    siteConditionConfidence === "low"
  ) {
    return "This site profile suggests elevated buried-services, utility-coordination and unknown-condition risk in early delivery stages.";
  }

  if (
    permitsRequired === "yes" ||
    environmentalSensitivity === "high" ||
    weatherExposure === "high" ||
    logisticsComplexity === "high"
  ) {
    return "This site profile is likely to increase permit, logistics, planning and execution-related baseline risk.";
  }

  return "Location and site conditions help RiskBases identify the most relevant baseline risk patterns.";
}

export default function Step3Page() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.projectId as string | undefined;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [projectEnvironment, setProjectEnvironment] = useState("");
  const [permitsRequired, setPermitsRequired] = useState("");
  const [restrictedAccessSite, setRestrictedAccessSite] = useState("");
  const [nearResidentialArea, setNearResidentialArea] = useState("");
  const [liveEnvironment, setLiveEnvironment] = useState("");
  const [environmentalSensitivity, setEnvironmentalSensitivity] = useState("medium");
  const [weatherExposure, setWeatherExposure] = useState("medium");
  const [logisticsComplexity, setLogisticsComplexity] = useState("medium");
  const [undergroundServicesUncertainty, setUndergroundServicesUncertainty] =
    useState("medium");
  const [utilityRelocationExpected, setUtilityRelocationExpected] = useState("");
  const [trafficInterfaceComplexity, setTrafficInterfaceComplexity] =
    useState("medium");
  const [siteConditionConfidence, setSiteConditionConfidence] = useState("medium");
  const [noiseNuisanceSensitivity, setNoiseNuisanceSensitivity] =
    useState("medium");

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
      undergroundServicesUncertainty,
      utilityRelocationExpected,
      trafficInterfaceComplexity,
      noiseNuisanceSensitivity,
      siteConditionConfidence,
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
    undergroundServicesUncertainty,
    utilityRelocationExpected,
    trafficInterfaceComplexity,
    noiseNuisanceSensitivity,
    siteConditionConfidence,
  ]);

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
            country,
            region,
            city,
            postal_code,
            address_line,
            site_type,
            permit_required,
            restricted_access_site,
            near_residential_area,
            live_environment,
            environmental_sensitivity,
            weather_exposure,
            logistics_complexity,
            underground_services_uncertainty,
            utility_relocation_expected,
            traffic_interface_complexity,
            site_condition_confidence,
            noise_nuisance_sensitivity
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
        setAddressLine(loaded.address_line || "");
        setProjectEnvironment(loaded.site_type || "");
        setPermitsRequired(fromNullableBoolean(loaded.permit_required));
        setRestrictedAccessSite(fromNullableBoolean(loaded.restricted_access_site));
        setNearResidentialArea(fromNullableBoolean(loaded.near_residential_area));
        setLiveEnvironment(fromNullableBoolean(loaded.live_environment));
        setEnvironmentalSensitivity(loaded.environmental_sensitivity || "medium");
        setWeatherExposure(loaded.weather_exposure || "medium");
        setLogisticsComplexity(loaded.logistics_complexity || "medium");
        setUndergroundServicesUncertainty(
          loaded.underground_services_uncertainty || "medium"
        );
        setUtilityRelocationExpected(
          fromNullableBoolean(loaded.utility_relocation_expected)
        );
        setTrafficInterfaceComplexity(
          loaded.traffic_interface_complexity || "medium"
        );
        setSiteConditionConfidence(loaded.site_condition_confidence || "medium");
        setNoiseNuisanceSensitivity(
          loaded.noise_nuisance_sensitivity || "medium"
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
        country: country.trim() || null,
        region: region.trim() || null,
        city: city.trim() || null,
        postal_code: postalCode.trim().toUpperCase() || null,
        address_line: addressLine.trim() || null,
        site_type: projectEnvironment || null,
        permit_required: toNullableBoolean(permitsRequired),
        restricted_access_site: toNullableBoolean(restrictedAccessSite),
        near_residential_area: toNullableBoolean(nearResidentialArea),
        live_environment: toNullableBoolean(liveEnvironment),
        environmental_sensitivity: environmentalSensitivity || null,
        weather_exposure: weatherExposure || null,
        logistics_complexity: logisticsComplexity || null,
        underground_services_uncertainty:
          undergroundServicesUncertainty || null,
        utility_relocation_expected:
          toNullableBoolean(utilityRelocationExpected),
        traffic_interface_complexity: trafficInterfaceComplexity || null,
        site_condition_confidence: siteConditionConfidence || null,
        noise_nuisance_sensitivity: noiseNuisanceSensitivity || null,
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
      <section className="min-h-screen bg-[#F4F7FB] px-6 py-10">
        <div className="mx-auto max-w-[1160px]">
          <div className="rounded-[28px] border border-[#D8E1EC] bg-white p-8 shadow-[0_12px_32px_rgba(15,23,42,0.05)]">
            <p className="text-sm font-medium text-[#4B5B73]">Loading step 3...</p>
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
            Step 3 of 8
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-[#081226] md:text-[52px]">
            Location & environment
          </h1>

          <p className="mt-4 max-w-4xl text-[15px] leading-7 text-[#4B5B73]">
            Add the site context for{" "}
            <span className="font-semibold text-[#0F172A]">
              {project.name || "this project"}
            </span>
            . These details help RiskBases detect permit, logistics, access,
            unknown-condition and execution-related exposure.
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
                <MapPin className="h-4 w-4" />
                Site context
              </div>

              <h2 className="mt-4 text-[30px] font-semibold tracking-[-0.03em] text-[#081226]">
                Project location details
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#4B5B73]">
                Keep this step structured and site-focused. No commercial fields,
                no stakeholder fields and no large free-text sections.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Country
                </label>
                <input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Netherlands"
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Province / region
                </label>
                <input
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="South Holland"
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  City / place
                </label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Rotterdam"
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Postal code
                </label>
                <input
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="3011 AA"
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 uppercase text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Address or project location
                </label>
                <input
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="For example: harbor terminal zone, bridge corridor, inner-city junction"
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Project environment
                </label>
                <select
                  value={projectEnvironment}
                  onChange={(e) => setProjectEnvironment(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
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
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Permits required?
                </label>
                <select
                  value={permitsRequired}
                  onChange={(e) => setPermitsRequired(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                >
                  <option value="">Unknown / not set</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Restricted site access?
                </label>
                <select
                  value={restrictedAccessSite}
                  onChange={(e) => setRestrictedAccessSite(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                >
                  <option value="">Unknown / not set</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Near residential area?
                </label>
                <select
                  value={nearResidentialArea}
                  onChange={(e) => setNearResidentialArea(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                >
                  <option value="">Unknown / not set</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Live operational environment?
                </label>
                <select
                  value={liveEnvironment}
                  onChange={(e) => setLiveEnvironment(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                >
                  <option value="">Unknown / not set</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Environmental sensitivity
                </label>
                <select
                  value={environmentalSensitivity}
                  onChange={(e) => setEnvironmentalSensitivity(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Weather exposure
                </label>
                <select
                  value={weatherExposure}
                  onChange={(e) => setWeatherExposure(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Logistics complexity
                </label>
                <select
                  value={logisticsComplexity}
                  onChange={(e) => setLogisticsComplexity(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Underground services uncertainty
                </label>
                <select
                  value={undergroundServicesUncertainty}
                  onChange={(e) =>
                    setUndergroundServicesUncertainty(e.target.value)
                  }
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Utility relocation expected?
                </label>
                <select
                  value={utilityRelocationExpected}
                  onChange={(e) => setUtilityRelocationExpected(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                >
                  <option value="">Unknown / not set</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Traffic interface complexity
                </label>
                <select
                  value={trafficInterfaceComplexity}
                  onChange={(e) => setTrafficInterfaceComplexity(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Site condition confidence
                </label>
                <select
                  value={siteConditionConfidence}
                  onChange={(e) => setSiteConditionConfidence(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                >
                  <option value="low">Low confidence</option>
                  <option value="medium">Medium confidence</option>
                  <option value="high">High confidence</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Noise / nuisance sensitivity
                </label>
                <select
                  value={noiseNuisanceSensitivity}
                  onChange={(e) => setNoiseNuisanceSensitivity(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="mt-8 rounded-[24px] border border-[#D8E1EC] bg-[#F8FAFC] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7A90]">
                Environment signal
              </p>
              <p className="mt-2 text-sm font-medium text-[#0F172A]">
                {environmentSignal}
              </p>
            </div>

            <div className="mt-10 flex flex-col gap-3 border-t border-[#E2E8F0] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={() => router.push(`/intake/${projectId}/step-2`)}
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
              Location context strongly affects which risks are likely to appear
              first in the project baseline.
            </p>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl bg-[#F8FAFC] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7A90]">
                  Used for
                </p>
                <p className="mt-2 text-sm font-medium text-[#0F172A]">
                  Permit and authority risk detection
                </p>
              </div>

              <div className="rounded-2xl bg-[#F8FAFC] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7A90]">
                  Used for
                </p>
                <p className="mt-2 text-sm font-medium text-[#0F172A]">
                  Logistics, access and live-site exposure
                </p>
              </div>

              <div className="rounded-2xl bg-[#F8FAFC] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7A90]">
                  Used for
                </p>
                <p className="mt-2 text-sm font-medium text-[#0F172A]">
                  Better baseline template matching
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-[24px] border border-[#DCE7FF] bg-[#F7FAFF] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2457FF]">
                Step rule
              </p>
              <p className="mt-3 text-sm leading-6 text-[#36506C]">
                Keep this step fully site-focused. No commercial fields, no
                stakeholder fields and no long free-text notes.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}