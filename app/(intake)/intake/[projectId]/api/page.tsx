"use client";

import { useEffect, useMemo, useState } from "react"; import { createClient } from "@supabase/supabase-js"; import { useParams, useRouter } from "next/navigation"; import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Cable,
  CheckCircle2,
  Database,
  FileJson,
  Globe,
  KeyRound,
  Link2,
  Loader2,
  RefreshCw,
  Save,
  ShieldCheck,
  TimerReset,
  Webhook,
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Project = {
  id: string;
  name: string | null;
  project_code: string | null;
  intake_method: string | null;
  status: string | null;
};

type ApiConfigRow = {
  id: string;
  project_id: string;
  integration_name: string | null;
  provider_type: string | null;
  base_url: string | null;
  auth_type: string | null;
  auth_header_name: string | null;
  token_reference: string | null;
  external_project_ref: string | null;
  risks_endpoint: string | null;
  actions_endpoint: string | null;
  schedule_endpoint: string | null;
  documents_endpoint: string | null;
  field_mapping_notes: string | null;
  sync_scope: string[] | null;
  sync_frequency: string | null;
  auto_sync_enabled: boolean;
  test_status: string;
  last_tested_at: string | null;
  created_by: string | null;
};

const PROVIDER_OPTIONS = [
  "Custom REST API",
  "Relatics",
  "Autodesk Construction Cloud",
  "Procore",
  "Primavera P6",
  "SAP",
  "Microsoft Dynamics",
  "Other",
];

const AUTH_OPTIONS = [
  "API Key",
  "Bearer Token",
  "Basic Auth",
  "OAuth Placeholder",
  "No Auth",
];

const SYNC_FREQUENCY_OPTIONS = [
  "Manual only",
  "Hourly",
  "Daily",
  "Weekly",
];

const SCOPE_OPTIONS = [
  { key: "risks", label: "Import risks" },
  { key: "actions", label: "Import actions" },
  { key: "schedule", label: "Import schedule / milestones" },
  { key: "documents", label: "Import documents / references" }, ];

function normalizeIntakeMethod(value: string | null) {
  if (!value) return "Connect existing system";
  if (value === "api") return "Connect existing system";
  if (value === "csv") return "Import existing data";
  if (value === "scratch") return "Start from scratch";
  return value;
}

function normalizeStatus(value: string | null) {
  if (!value) return "Draft";
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function isValidUrl(value: string) {
  if (!value.trim()) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function formatDateTime(value: string | null) {
  if (!value) return "Not tested";
  try {
    return new Date(value).toLocaleString("en-GB");
  } catch {
    return value;
  }
}

export default function ProjectApiPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.projectId as string | undefined;

  const [project, setProject] = useState<Project | null>(null);
  const [configId, setConfigId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState("");

  const [integrationName, setIntegrationName] = useState("");
  const [providerType, setProviderType] = useState("Custom REST API");
  const [baseUrl, setBaseUrl] = useState("");
  const [authType, setAuthType] = useState("API Key");
  const [authHeaderName, setAuthHeaderName] = useState("Authorization");
  const [tokenReference, setTokenReference] = useState("");
  const [externalProjectRef, setExternalProjectRef] = useState("");
  const [risksEndpoint, setRisksEndpoint] = useState("");
  const [actionsEndpoint, setActionsEndpoint] = useState("");
  const [scheduleEndpoint, setScheduleEndpoint] = useState("");
  const [documentsEndpoint, setDocumentsEndpoint] = useState("");
  const [fieldMappingNotes, setFieldMappingNotes] = useState("");
  const [syncScope, setSyncScope] = useState<string[]>(["risks"]);
  const [syncFrequency, setSyncFrequency] = useState("Manual only");
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);
  const [testStatus, setTestStatus] = useState("not_tested");
  const [lastTestedAt, setLastTestedAt] = useState<string | null>(null);

  const progress = 38;

  useEffect(() => {
    async function loadPage() {
      try {
        setLoading(true);
        setMessage("");

        if (!projectId) {
          throw new Error("Missing project id.");
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();

        const [projectRes, configRes] = await Promise.all([
          supabase
            .from("projects")
            .select("id, name, project_code, intake_method, status")
            .eq("id", projectId)
            .single(),
          supabase
            .from("project_api_configs")
            .select(`
              id,
              project_id,
              integration_name,
              provider_type,
              base_url,
              auth_type,
              auth_header_name,
              token_reference,
              external_project_ref,
              risks_endpoint,
              actions_endpoint,
              schedule_endpoint,
              documents_endpoint,
              field_mapping_notes,
              sync_scope,
              sync_frequency,
              auto_sync_enabled,
              test_status,
              last_tested_at,
              created_by
            `)
            .eq("project_id", projectId)
            .maybeSingle(),
        ]);

        if (projectRes.error) throw projectRes.error;

        setProject(projectRes.data);

        const cfg = configRes.data as ApiConfigRow | null;
        if (cfg) {
          setConfigId(cfg.id);
          setIntegrationName(cfg.integration_name ?? "");
          setProviderType(cfg.provider_type ?? "Custom REST API");
          setBaseUrl(cfg.base_url ?? "");
          setAuthType(cfg.auth_type ?? "API Key");
          setAuthHeaderName(cfg.auth_header_name ?? "Authorization");
          setTokenReference(cfg.token_reference ?? "");
          setExternalProjectRef(cfg.external_project_ref ?? "");
          setRisksEndpoint(cfg.risks_endpoint ?? "");
          setActionsEndpoint(cfg.actions_endpoint ?? "");
          setScheduleEndpoint(cfg.schedule_endpoint ?? "");
          setDocumentsEndpoint(cfg.documents_endpoint ?? "");
          setFieldMappingNotes(cfg.field_mapping_notes ?? "");
          setSyncScope(Array.isArray(cfg.sync_scope) ? cfg.sync_scope : ["risks"]);
          setSyncFrequency(cfg.sync_frequency ?? "Manual only");
          setAutoSyncEnabled(Boolean(cfg.auto_sync_enabled));
          setTestStatus(cfg.test_status ?? "not_tested");
          setLastTestedAt(cfg.last_tested_at ?? null);
        } else {
          if (user?.id) {
            setConfigId(null);
          }
        }
      } catch (error: any) {
        console.error("LOAD API PAGE ERROR:", error);
        setMessage(error?.message || "Could not load API intake page.");
      } finally {
        setLoading(false);
      }
    }

    loadPage();
  }, [projectId]);

  const configSignal = useMemo(() => {
    if (!baseUrl.trim()) {
      return "Start by defining the base system URL and the integration shape you want RiskBases to consume.";
    }

    if (!isValidUrl(baseUrl)) {
      return "The base URL is not valid yet. Fix the endpoint before continuing.";
    }

    if (!integrationName.trim() || !providerType.trim()) {
      return "Complete the integration identity before moving on to baseline generation.";
    }

    if (syncScope.length === 0) {
      return "Select at least one sync scope so RiskBases knows what data this integration should provide.";
    }

    if (!risksEndpoint.trim() && !actionsEndpoint.trim() && !scheduleEndpoint.trim() && !documentsEndpoint.trim()) {
      return "Add at least one endpoint path so this configuration is useful in practice.";
    }

    if (testStatus === "configured") {
      return "This configuration passed structure validation and is ready for baseline-driven workflow setup.";
    }

    return "This API profile is shaping up well. Validate the structure before continuing.";
  }, [
    baseUrl,
    integrationName,
    providerType,
    syncScope,
    risksEndpoint,
    actionsEndpoint,
    scheduleEndpoint,
    documentsEndpoint,
    testStatus,
  ]);

  const endpointCount = useMemo(() => {
    return [risksEndpoint, actionsEndpoint, scheduleEndpoint, documentsEndpoint]
      .filter((value) => value.trim()).length;
  }, [risksEndpoint, actionsEndpoint, scheduleEndpoint, documentsEndpoint]);

  function toggleScope(key: string) {
    setSyncScope((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  }

  async function upsertConfig(nextTestStatus?: string, nextLastTestedAt?: string | null) {
    if (!projectId) {
      throw new Error("Missing project id.");
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const payload = {
      project_id: projectId,
      integration_name: integrationName.trim() || null,
      provider_type: providerType || null,
      base_url: baseUrl.trim() || null,
      auth_type: authType || null,
      auth_header_name: authHeaderName.trim() || null,
      token_reference: tokenReference.trim() || null,
      external_project_ref: externalProjectRef.trim() || null,
      risks_endpoint: risksEndpoint.trim() || null,
      actions_endpoint: actionsEndpoint.trim() || null,
      schedule_endpoint: scheduleEndpoint.trim() || null,
      documents_endpoint: documentsEndpoint.trim() || null,
      field_mapping_notes: fieldMappingNotes.trim() || null,
      sync_scope: syncScope,
      sync_frequency: syncFrequency || null,
      auto_sync_enabled: autoSyncEnabled,
      test_status: nextTestStatus ?? testStatus,
      last_tested_at: nextLastTestedAt ?? lastTestedAt,
      created_by: user?.id ?? null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("project_api_configs")
      .upsert(payload, { onConflict: "project_id" })
      .select("id")
      .single();

    if (error) throw error;
    if (data?.id) setConfigId(data.id);
  }

  async function handleSaveDraft() {
    try {
      setSaving(true);
      setMessage("");
      await upsertConfig();
      setMessage("API configuration draft saved.");
    } catch (error: any) {
      console.error("SAVE API CONFIG ERROR:", error);
      setMessage(error?.message || "Could not save API configuration.");
    } finally {
      setSaving(false);
    }
  }

  async function handleValidateConfig() {
    try {
      setTesting(true);
      setMessage("");

      if (!integrationName.trim()) {
        throw new Error("Integration name is required.");
      }

      if (!providerType.trim()) {
        throw new Error("Provider type is required.");
      }

      if (!baseUrl.trim()) {
        throw new Error("Base URL is required.");
      }

      if (!isValidUrl(baseUrl)) {
        throw new Error("Base URL is not valid.");
      }

      if (syncScope.length === 0) {
        throw new Error("Select at least one sync scope.");
      }

      if (
        !risksEndpoint.trim() &&
        !actionsEndpoint.trim() &&
        !scheduleEndpoint.trim() &&
        !documentsEndpoint.trim()
      ) {
        throw new Error("Add at least one endpoint path.");
      }

      const testedAt = new Date().toISOString();
      setTestStatus("configured");
      setLastTestedAt(testedAt);

      await upsertConfig("configured", testedAt);

      setMessage(
        "Configuration structure validated. This does not call the external API yet, but the setup is ready to continue."
      );
    } catch (error: any) {
      console.error("VALIDATE API CONFIG ERROR:", error);
      setTestStatus("invalid");
      setMessage(error?.message || "Configuration validation failed.");
    } finally {
      setTesting(false);
    }
  }

  async function handleNext() {
    try {
      setSaving(true);
      setMessage("");

      if (!integrationName.trim()) {
        throw new Error("Integration name is required.");
      }

      if (!baseUrl.trim() || !isValidUrl(baseUrl)) {
        throw new Error("Enter a valid base URL before continuing.");
      }

      if (syncScope.length === 0) {
        throw new Error("Select at least one sync scope before continuing.");
      }

      await upsertConfig();

      router.push(`/intake/${projectId}/step-7`);
    } catch (error: any) {
      console.error("API PAGE NEXT ERROR:", error);
      setMessage(error?.message || "Could not continue.");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="min-h-screen bg-[#F4F7FB] px-6 py-10">
        <div className="mx-auto max-w-[1180px]">
          <div className="rounded-[28px] border border-[#D8E1EC] bg-white p-8 shadow-[0_12px_32px_rgba(15,23,42,0.05)]">
            <p className="text-sm font-medium text-[#4B5B73]">Loading API setup...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#F4F7FB] px-6 py-10">
      <div className="mx-auto w-full max-w-[1180px]">
        <div className="mb-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold tracking-[0.02em] text-[#2457FF]">
                Connect existing system
              </p>

              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-[#081226] md:text-[52px]">
                API integration setup
              </h1>

              <p className="mt-4 max-w-3xl text-[15px] leading-7 text-[#4B5B73]">
                Configure how RiskBases should connect to an external system for{" "}
                <span className="font-semibold text-[#0F172A]">
                  {project?.name || "this project"}
                </span>
                . This page captures integration identity, auth approach, endpoint structure
                and intended sync scope before baseline generation.
              </p>
            </div>

            <div className="grid w-full max-w-[250px] gap-4">
              <div className="rounded-[24px] border border-[#D8E1EC] bg-white px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7A90]">
                  Project code
                </p>
                <p className="mt-1 text-sm font-semibold text-[#0F172A]">
                  {project?.project_code || "Not generated"}
                </p>
              </div>

              <div className="rounded-[24px] border border-[#D8E1EC] bg-white px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7A90]">
                  Intake method
                </p>
                <p className="mt-1 text-sm font-semibold text-[#0F172A]">
                  {normalizeIntakeMethod(project?.intake_method ?? null)}
                </p>
              </div>

              <div className="rounded-[24px] border border-[#D8E1EC] bg-white px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7A90]">
                  Status
                </p>
                <p className="mt-1 text-sm font-semibold text-[#0F172A]">
                  {normalizeStatus(project?.status ?? null)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#DCE4EE]">
              <div
                className="h-full rounded-full bg-[#2457FF]"
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

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-[32px] border border-[#D8E1EC] bg-white p-8 shadow-[0_14px_36px_rgba(15,23,42,0.05)] md:p-10">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#C9D8FF] bg-[#EEF4FF] px-3 py-1 text-xs font-semibold text-[#2457FF]">
                <Cable className="h-4 w-4" />
                Integration profile
              </div>

              <h2 className="mt-4 text-[30px] font-semibold tracking-[-0.03em] text-[#081226]">
                External system connection
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#4B5B73]">
                Keep this page focused on system connectivity and data structure.
                It should explain how RiskBases can consume project context from a connected platform.
              </p>
            </div>

            <div className="grid gap-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                    Integration name
                  </label>
                  <input
                    value={integrationName}
                    onChange={(e) => setIntegrationName(e.target.value)}
                    placeholder="For example: Harbour Logistics API"
                    className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                    Provider type
                  </label>
                  <select
                    value={providerType}
                    onChange={(e) => setProviderType(e.target.value)}
                    className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                  >
                    {PROVIDER_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                    Base URL
                  </label>
                  <div className="relative">
                    <Globe className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                    <input
                      value={baseUrl}
                      onChange={(e) => setBaseUrl(e.target.value)}
                      placeholder="https://api.example.com"
                      className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] pl-11 pr-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                    External project reference
                  </label>
                  <div className="relative">
                    <Link2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                    <input
                      value={externalProjectRef}
                      onChange={(e) => setExternalProjectRef(e.target.value)}
                      placeholder="External project ID / code"
                      className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] pl-11 pr-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                    Auth type
                  </label>
                  <select
                    value={authType}
                    onChange={(e) => setAuthType(e.target.value)}
                    className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                  >
                    {AUTH_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                    Auth header name
                  </label>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                    <input
                      value={authHeaderName}
                      onChange={(e) => setAuthHeaderName(e.target.value)}
                      placeholder="Authorization"
                      className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] pl-11 pr-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                    Token reference
                  </label>
                  <input
                    value={tokenReference}
                    onChange={(e) => setTokenReference(e.target.value)}
                    placeholder="vault:harbour-logistics-token"
                    className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                    Risks endpoint
                  </label>
                  <div className="relative">
                    <FileJson className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                    <input
                      value={risksEndpoint}
                      onChange={(e) => setRisksEndpoint(e.target.value)}
                      placeholder="/projects/{id}/risks"
                      className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] pl-11 pr-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                    Actions endpoint
                  </label>
                  <div className="relative">
                    <FileJson className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                    <input
                      value={actionsEndpoint}
                      onChange={(e) => setActionsEndpoint(e.target.value)}
                      placeholder="/projects/{id}/actions"
                      className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] pl-11 pr-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                    Schedule endpoint
                  </label>
                  <div className="relative">
                    <TimerReset className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                    <input
                      value={scheduleEndpoint}
                      onChange={(e) => setScheduleEndpoint(e.target.value)}
                      placeholder="/projects/{id}/schedule"
                      className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] pl-11 pr-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                    Documents endpoint
                  </label>
                  <div className="relative">
                    <Webhook className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                    <input
                      value={documentsEndpoint}
                      onChange={(e) => setDocumentsEndpoint(e.target.value)}
                      placeholder="/projects/{id}/documents"
                      className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] pl-11 pr-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-[#1E293B]">
                  Sync scope
                </label>

                <div className="grid gap-3 md:grid-cols-2">
                  {SCOPE_OPTIONS.map((option) => {
                    const checked = syncScope.includes(option.key);

                    return (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => toggleScope(option.key)}
                        className={`flex items-center justify-between rounded-2xl border px-4 py-4 text-left transition ${
                          checked
                            ? "border-[#2457FF] bg-[#EEF4FF]"
                            : "border-[#D8E1EC] bg-[#F8FAFC]"
                        }`}
                      >
                        <span className="text-sm font-medium text-[#0F172A]">
                          {option.label}
                        </span>

                        <span
                          className={`inline-flex h-5 w-5 items-center justify-center rounded-md border ${
                            checked
                              ? "border-[#2457FF] bg-[#2457FF] text-white"
                              : "border-slate-300 bg-white text-transparent"
                          }`}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                    Sync frequency
                  </label>
                  <select
                    value={syncFrequency}
                    onChange={(e) => setSyncFrequency(e.target.value)}
                    className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                  >
                    {SYNC_FREQUENCY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                    Auto sync enabled?
                  </label>
                  <select
                    value={autoSyncEnabled ? "yes" : "no"}
                    onChange={(e) => setAutoSyncEnabled(e.target.value === "yes")}
                    className="h-14 w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1E293B]">
                  Field mapping / integration notes
                </label>
                <textarea
                  value={fieldMappingNotes}
                  onChange={(e) => setFieldMappingNotes(e.target.value)}
                  rows={6}
                  placeholder="Describe payload structure, key field mappings, external object names or import assumptions for RiskBases."
                  className="w-full rounded-2xl border border-[#D8E1EC] bg-[#F8FAFC] px-4 py-4 text-[15px] text-[#0F172A] outline-none transition focus:border-[#2457FF] focus:bg-white focus:ring-4 focus:ring-[#2457FF]/10"
                />
              </div>

              <div className="mt-2 rounded-[24px] border border-[#D8E1EC] bg-[#F8FAFC] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7A90]">
                  Integration signal
                </p>
                <p className="mt-2 text-sm font-medium text-[#0F172A]">
                  {configSignal}
                </p>
              </div>

              <div className="mt-10 flex flex-col gap-3 border-t border-[#E2E8F0] pt-6 sm:flex-row sm:items-center sm:justify-between">
                <button
                  onClick={() => router.push("/app")}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-[#D8E1EC] bg-white px-5 text-sm font-medium text-[#1E293B] transition hover:bg-[#F8FAFC]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to projects
                </button>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleValidateConfig}
                    disabled={testing || saving}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-[#D8E1EC] bg-white px-5 text-sm font-medium text-[#1E293B] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {testing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Validating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        Validate config
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={saving || testing}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-[#D8E1EC] bg-white px-5 text-sm font-medium text-[#1E293B] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save draft
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={saving || testing}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#2457FF] px-6 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(36,87,255,0.22)] transition hover:bg-[#1D4BE0] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Continue to baseline
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[32px] border border-[#D8E1EC] bg-white p-7 shadow-[0_14px_36px_rgba(15,23,42,0.05)]">
              <h3 className="text-xl font-semibold tracking-tight text-[#081226]">
                Integration summary
              </h3>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-[#F8FAFC] px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-[#1E293B]">
                    <Database className="h-4 w-4" />
                    Provider
                  </div>
                  <span className="text-sm font-semibold text-[#0F172A]">
                    {providerType || "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-[#F8FAFC] px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-[#1E293B]">
                    <ShieldCheck className="h-4 w-4" />
                    Auth
                  </div>
                  <span className="text-sm font-semibold text-[#0F172A]">
                    {authType || "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-[#F8FAFC] px-4 py-3">
                  <span className="text-sm font-medium text-[#1E293B]">
                    Endpoints configured
                  </span>
                  <span className="text-sm font-semibold text-[#0F172A]">
                    {endpointCount}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-[#F8FAFC] px-4 py-3">
                  <span className="text-sm font-medium text-[#1E293B]">
                    Sync scopes
                  </span>
                  <span className="text-sm font-semibold text-[#0F172A]">
                    {syncScope.length}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-[#D8E1EC] bg-white p-7 shadow-[0_14px_36px_rgba(15,23,42,0.05)]">
              <h3 className="text-xl font-semibold tracking-tight text-[#081226]">
                Validation state
              </h3>

              <div className="mt-5 space-y-4 text-sm">
                <div className="rounded-2xl bg-[#F8FAFC] px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7A90]">
                    Test status
                  </p>
                  <p className="mt-2 font-semibold text-[#0F172A]">
                    {testStatus === "configured"
                      ? "Configured"
                      : testStatus === "invalid"
                      ? "Invalid"
                      : "Not tested"}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#F8FAFC] px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7A90]">
                    Last validated
                  </p>
                  <p className="mt-2 font-semibold text-[#0F172A]">
                    {formatDateTime(lastTestedAt)}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#F8FAFC] px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B7A90]">
                    Saved config id
                  </p>
                  <p className="mt-2 break-all font-semibold text-[#0F172A]">
                    {configId || "Not saved yet"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-[#DCE7FF] bg-[#F7FAFF] p-7 shadow-[0_14px_36px_rgba(15,23,42,0.05)]">
              <div className="flex items-center gap-2 text-[#2457FF]">
                <BadgeCheck className="h-4 w-4" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em]">
                  RiskBases note
                </p>
              </div>

              <p className="mt-3 text-sm leading-6 text-[#36506C]">
                This page captures API structure only. It does not store secret values directly
                in the project. Use a token reference or vault-style pointer instead of pasting
                raw secrets into your database.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
