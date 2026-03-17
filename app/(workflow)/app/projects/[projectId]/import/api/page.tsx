"use client";

import { useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams, useRouter } from "next/navigation";
import {
  PlugZap,
  ArrowRight,
  Loader2,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type ApiRow = Record<string, any>;

type MappingState = {
  title: string;
  description: string;
  task_duration_days: string;
  labor_required: string;
  equipment_units: string;
  material_cost_usd: string;
  start_constraint: string;
  risk_level: string;
  resource_constraint_score: string;
  site_constraint_score: string;
  dependency_count: string;
};

const DB_FIELDS: { key: keyof MappingState; label: string; required?: boolean }[] = [
  { key: "title", label: "Task title", required: true },
  { key: "description", label: "Description" },
  { key: "task_duration_days", label: "Task duration (days)" },
  { key: "labor_required", label: "Labor required" },
  { key: "equipment_units", label: "Equipment units" },
  { key: "material_cost_usd", label: "Material cost (USD)" },
  { key: "start_constraint", label: "Start constraint" },
  { key: "risk_level", label: "Risk level" },
  { key: "resource_constraint_score", label: "Resource constraint score" },
  { key: "site_constraint_score", label: "Site constraint score" },
  { key: "dependency_count", label: "Dependency count" },
];

function guessMapping(keys: string[]): MappingState {
  const lower = keys.map((k) => k.toLowerCase());

  const find = (patterns: string[]) => {
    const idx = lower.findIndex((k) => patterns.some((p) => k.includes(p)));
    return idx >= 0 ? keys[idx] : "";
  };

  return {
    title: find(["title", "task", "name", "activity"]),
    description: find(["description", "desc", "details"]),
    task_duration_days: find(["duration", "days"]),
    labor_required: find(["labor", "labour", "workers"]),
    equipment_units: find(["equipment", "units"]),
    material_cost_usd: find(["material_cost", "cost", "budget"]),
    start_constraint: find(["start_constraint", "start"]),
    risk_level: find(["risk_level", "risk", "priority"]),
    resource_constraint_score: find(["resource_constraint", "resource_score"]),
    site_constraint_score: find(["site_constraint", "site_score"]),
    dependency_count: find(["dependency_count", "dependencies"]),
  };
}

function toInt(value: any) {
  if (value === null || value === undefined || value === "") return null;
  const n = parseInt(String(value).replace(/[^\d-]/g, ""), 10);
  return Number.isFinite(n) ? n : null;
}

function toNumeric(value: any) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

export default function ApiImportPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [endpoint, setEndpoint] = useState("");
  const [bearerToken, setBearerToken] = useState("");
  const [rootPath, setRootPath] = useState("");
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState("");
  const [rows, setRows] = useState<ApiRow[]>([]);
  const [keys, setKeys] = useState<string[]>([]);
  const [mapping, setMapping] = useState<MappingState>({
    title: "",
    description: "",
    task_duration_days: "",
    labor_required: "",
    equipment_units: "",
    material_cost_usd: "",
    start_constraint: "",
    risk_level: "",
    resource_constraint_score: "",
    site_constraint_score: "",
    dependency_count: "",
  });

  async function handlePreview() {
    if (!endpoint.trim()) {
      setMessage("Vul eerst een endpoint in.");
      return;
    }

    setLoadingPreview(true);
    setMessage("");
    setRows([]);
    setKeys([]);

    try {
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          ...(bearerToken.trim()
            ? { Authorization: `Bearer ${bearerToken.trim()}` }
            : {}),
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();

      let extracted: any = data;

      if (rootPath.trim()) {
        const parts = rootPath.split(".").map((p) => p.trim()).filter(Boolean);
        for (const part of parts) {
          extracted = extracted?.[part];
        }
      }

      if (!Array.isArray(extracted)) {
        throw new Error("De response moet een array zijn of via root path naar een array wijzen.");
      }

      const cleaned = extracted.filter((item) => item && typeof item === "object");
      const detectedKeys = Object.keys(cleaned[0] || {});

      setRows(cleaned);
      setKeys(detectedKeys);
      setMapping(guessMapping(detectedKeys));

      if (!cleaned.length) {
        setMessage("API gaf een lege array terug.");
      }
    } catch (error: any) {
      setMessage(error?.message || "API preview mislukt.");
    } finally {
      setLoadingPreview(false);
    }
  }

  const previewRows = useMemo(() => rows.slice(0, 5), [rows]);

  async function handleImport() {
    if (!mapping.title) {
      setMessage("Map minimaal een kolom naar Task title.");
      return;
    }

    if (!rows.length) {
      setMessage("Haal eerst preview data op.");
      return;
    }

    setImporting(true);
    setMessage("");

    try {
      const { data: existingTasks, error: existingError } = await supabase
        .from("project_tasks")
        .select("task_code")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });

      if (existingError) throw existingError;

      const startIndex = (existingTasks?.length || 0) + 1;

      const payload = rows
        .map((row, index) => {
          const title = mapping.title ? String(row[mapping.title] ?? "").trim() : "";
          if (!title) return null;

          return {
            project_id: projectId,
            task_code: `T${String(startIndex + index).padStart(3, "0")}`,
            title,
            description: mapping.description ? String(row[mapping.description] ?? "") || null : null,
            task_duration_days: toInt(row[mapping.task_duration_days]),
            labor_required: toInt(row[mapping.labor_required]),
            equipment_units: toInt(row[mapping.equipment_units]),
            material_cost_usd: toNumeric(row[mapping.material_cost_usd]),
            start_constraint: toInt(row[mapping.start_constraint]),
            risk_level: mapping.risk_level ? String(row[mapping.risk_level] ?? "") || null : null,
            resource_constraint_score: toNumeric(row[mapping.resource_constraint_score]),
            site_constraint_score: toNumeric(row[mapping.site_constraint_score]),
            dependency_count: toInt(row[mapping.dependency_count]),
            status: "planned",
          };
        })
        .filter(Boolean);

      if (!payload.length) {
        throw new Error("Geen geldige tasks gevonden voor import.");
      }

      const { error: insertError } = await supabase
        .from("project_tasks")
        .insert(payload);

      if (insertError) throw insertError;

      await supabase
        .from("projects")
        .update({
          intake_method: "api",
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectId);

      router.push(`/app/projects/${projectId}/intake/step-7`);
    } catch (error: any) {
      setMessage(error?.message || "API import mislukt.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <section className="flex-1 bg-slate-50 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10">
          <p className="text-sm font-semibold text-violet-600">Project import</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
            API Import
          </h1>
          <p className="mt-2 max-w-3xl text-slate-500">
            Connect een JSON API, preview de data, map de velden en importeer direct
            naar <span className="font-medium text-slate-700">project_tasks</span>.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                <PlugZap className="h-4 w-4" />
                Connect & preview
              </div>

              <h2 className="mt-4 text-2xl font-semibold text-slate-900">
                API connection
              </h2>

              <div className="mt-6 grid grid-cols-1 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Endpoint URL
                  </label>
                  <input
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    placeholder="https://api.example.com/tasks"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-violet-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Bearer token
                  </label>
                  <input
                    value={bearerToken}
                    onChange={(e) => setBearerToken(e.target.value)}
                    placeholder="Optional"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-violet-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Root path
                  </label>
                  <input
                    value={rootPath}
                    onChange={(e) => setRootPath(e.target.value)}
                    placeholder="bijv. data.items"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-violet-400"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Laat leeg als de response direct een array is.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handlePreview}
                  disabled={loadingPreview}
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loadingPreview ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading preview...
                    </>
                  ) : (
                    <>
                      Preview API data
                      <RefreshCw className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {keys.length > 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900">Field mapping</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Koppel de JSON velden aan jouw task-velden.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {DB_FIELDS.map((field) => (
                    <div key={field.key}>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        {field.label} {field.required ? "*" : ""}
                      </label>
                      <select
                        value={mapping[field.key]}
                        onChange={(e) =>
                          setMapping((prev) => ({
                            ...prev,
                            [field.key]: e.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-violet-400"
                      >
                        <option value="">Not mapped</option>
                        {keys.map((key) => (
                          <option key={key} value={key}>
                            {key}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">API summary</h3>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm font-medium text-slate-700">Detected fields</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {keys.length}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm font-medium text-slate-700">Rows found</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {rows.length}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm font-medium text-slate-700">Required mapped</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {mapping.title ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Preview</h3>

              {rows.length === 0 ? (
                <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
                  Haal eerst preview data op.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {previewRows.map((row, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                    >
                      <p className="text-sm font-semibold text-slate-900">
                        {mapping.title ? String(row[mapping.title] ?? "Untitled task") : "Untitled task"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {mapping.description
                          ? String(row[mapping.description] ?? "No description")
                          : "No description"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Import</h3>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Na import wordt de projectdata opgeslagen als tasks en sturen we je
                door naar de risk generation flow.
              </p>

              <div className="mt-6 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={importing || !rows.length || !mapping.title}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {importing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      Import API data
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => router.push(`/app/projects/${projectId}`)}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                Ready for generic JSON APIs
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}