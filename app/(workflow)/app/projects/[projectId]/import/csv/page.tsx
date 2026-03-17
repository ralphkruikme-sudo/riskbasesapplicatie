"use client";

import { useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams, useRouter } from "next/navigation";
import {
  Upload,
  FileSpreadsheet,
  Check,
  AlertCircle,
  Loader2,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type CsvRow = Record<string, string>;

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

function parseCsv(text: string): CsvRow[] {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      row.push(current.trim());
      current = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i++;
      row.push(current.trim());
      current = "";
      if (row.some((cell) => cell.length > 0)) {
        rows.push(row);
      }
      row = [];
    } else {
      current += char;
    }
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current.trim());
    rows.push(row);
  }

  if (rows.length === 0) return [];

  const headers = rows[0].map((h) => h.replace(/^"|"$/g, "").trim());
  return rows.slice(1).map((r) => {
    const obj: CsvRow = {};
    headers.forEach((header, idx) => {
      obj[header] = (r[idx] ?? "").replace(/^"|"$/g, "").trim();
    });
    return obj;
  });
}

function guessMapping(headers: string[]): MappingState {
  const lower = headers.map((h) => h.toLowerCase());

  const find = (patterns: string[]) => {
    const idx = lower.findIndex((h) => patterns.some((p) => h.includes(p)));
    return idx >= 0 ? headers[idx] : "";
  };

  return {
    title: find(["title", "task", "task_name", "name", "activity"]),
    description: find(["description", "desc", "details"]),
    task_duration_days: find(["duration", "days", "task_duration"]),
    labor_required: find(["labor", "labour", "workers", "crew"]),
    equipment_units: find(["equipment", "units", "machines"]),
    material_cost_usd: find(["material_cost", "cost", "budget", "usd"]),
    start_constraint: find(["start_constraint", "start", "constraint"]),
    risk_level: find(["risk_level", "risk", "priority"]),
    resource_constraint_score: find(["resource_constraint", "resource_score"]),
    site_constraint_score: find(["site_constraint", "site_score"]),
    dependency_count: find(["dependency_count", "dependencies"]),
  };
}

function toInt(value: string | undefined) {
  if (!value) return null;
  const n = parseInt(value.replace(/[^\d-]/g, ""), 10);
  return Number.isFinite(n) ? n : null;
}

function toNumeric(value: string | undefined) {
  if (!value) return null;
  const cleaned = value.replace(/[^0-9.-]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export default function CsvImportPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<CsvRow[]>([]);
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
  const [loadingFile, setLoadingFile] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState("");

  async function handleFileChange(file: File | null) {
    if (!file) return;

    setLoadingFile(true);
    setMessage("");
    setFileName(file.name);

    try {
      const text = await file.text();
      const parsed = parseCsv(text);

      if (!parsed.length) {
        throw new Error("CSV bevat geen bruikbare rijen.");
      }

      const parsedHeaders = Object.keys(parsed[0] || {});
      setHeaders(parsedHeaders);
      setRows(parsed);
      setMapping(guessMapping(parsedHeaders));
    } catch (error: any) {
      setMessage(error?.message || "CSV kon niet worden gelezen.");
      setHeaders([]);
      setRows([]);
    } finally {
      setLoadingFile(false);
    }
  }

  const previewRows = useMemo(() => rows.slice(0, 5), [rows]);

  const mappedPreview = useMemo(() => {
    return previewRows.map((row, index) => ({
      index: index + 1,
      title: mapping.title ? row[mapping.title] || "" : "",
      description: mapping.description ? row[mapping.description] || "" : "",
      task_duration_days: mapping.task_duration_days
        ? row[mapping.task_duration_days] || ""
        : "",
      risk_level: mapping.risk_level ? row[mapping.risk_level] || "" : "",
    }));
  }, [previewRows, mapping]);

  async function handleImport() {
    if (!mapping.title) {
      setMessage("Map minimaal een kolom naar Task title.");
      return;
    }

    if (!rows.length) {
      setMessage("Upload eerst een CSV-bestand.");
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
          const title = mapping.title ? row[mapping.title]?.trim() : "";
          if (!title) return null;

          return {
            project_id: projectId,
            task_code: `T${String(startIndex + index).padStart(3, "0")}`,
            title,
            description: mapping.description ? row[mapping.description] || null : null,
            task_duration_days: toInt(row[mapping.task_duration_days]),
            labor_required: toInt(row[mapping.labor_required]),
            equipment_units: toInt(row[mapping.equipment_units]),
            material_cost_usd: toNumeric(row[mapping.material_cost_usd]),
            start_constraint: toInt(row[mapping.start_constraint]),
            risk_level: mapping.risk_level ? row[mapping.risk_level] || null : null,
            resource_constraint_score: toNumeric(
              row[mapping.resource_constraint_score]
            ),
            site_constraint_score: toNumeric(row[mapping.site_constraint_score]),
            dependency_count: toInt(row[mapping.dependency_count]),
            status: "planned",
          };
        })
        .filter(Boolean);

      if (!payload.length) {
        throw new Error("Geen geldige taken gevonden om te importeren.");
      }

      const { error: insertError } = await supabase
        .from("project_tasks")
        .insert(payload);

      if (insertError) throw insertError;

      await supabase
        .from("projects")
        .update({
          intake_method: "csv",
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectId);

      router.push(`/app/projects/${projectId}/intake/step-7`);
    } catch (error: any) {
      setMessage(error?.message || "CSV import mislukt.");
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
            CSV Import
          </h1>
          <p className="mt-2 max-w-3xl text-slate-500">
            Upload een CSV, map de kolommen naar jouw task-structuur en importeer
            direct naar <span className="font-medium text-slate-700">project_tasks</span>.
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
              <div className="flex items-start justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                    <FileSpreadsheet className="h-4 w-4" />
                    Upload & map
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold text-slate-900">
                    Upload your CSV file
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Deze importer is bedoeld voor task/activity data zoals planning,
                    resources, duration en constraints.
                  </p>
                </div>
              </div>

              <label className="mt-8 flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center transition hover:border-violet-300 hover:bg-violet-50/50">
                <Upload className="h-8 w-8 text-slate-400" />
                <span className="mt-4 text-base font-semibold text-slate-800">
                  Kies CSV bestand
                </span>
                <span className="mt-2 text-sm text-slate-500">
                  Upload een .csv met task- of activity-data
                </span>
                {fileName && (
                  <span className="mt-4 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">
                    {fileName}
                  </span>
                )}
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                />
              </label>

              {loadingFile && (
                <div className="mt-6 inline-flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  CSV wordt geladen...
                </div>
              )}
            </div>

            {headers.length > 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      Column mapping
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Koppel jouw CSV headers aan de velden van RiskBases.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setMapping(guessMapping(headers))}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Auto-map
                  </button>
                </div>

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
                        {headers.map((header) => (
                          <option key={header} value={header}>
                            {header}
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
              <h3 className="text-lg font-semibold text-slate-900">Import summary</h3>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="text-sm font-medium text-slate-700">Detected headers</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {headers.length}
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

              {mappedPreview.length === 0 ? (
                <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
                  Upload eerst een CSV om preview te zien.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {mappedPreview.map((row) => (
                    <div
                      key={row.index}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {row.title || "Untitled task"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {row.description || "No description"}
                          </p>
                        </div>
                        <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-slate-700">
                          Row {row.index}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        {row.task_duration_days && (
                          <span className="rounded-full bg-white px-2 py-1 text-slate-700">
                            {row.task_duration_days} days
                          </span>
                        )}
                        {row.risk_level && (
                          <span className="rounded-full bg-white px-2 py-1 text-slate-700">
                            Risk {row.risk_level}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Next step</h3>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Na import gaan we direct door naar de risk generation flow, zodat
                je imported projectdata meteen gebruikt kan worden voor slimme risico’s.
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
                      Import tasks
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}