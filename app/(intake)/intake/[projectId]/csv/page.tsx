"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Upload,
  FileSpreadsheet,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Sparkles,
  Shield,
  Database,
} from "lucide-react";

type CsvRow = Record<string, string>;

export default function CsvIntakePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = String(params.projectId ?? "");

  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fileMeta = useMemo(() => {
    if (!file) return null;

    return {
      name: file.name,
      sizeKb: Math.max(1, Math.round(file.size / 1024)),
      rows: csvData.length,
      columns: headers.length,
    };
  }, [file, csvData.length, headers.length]);

  function parseCSVLine(line: string) {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const next = line[i + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result.map((value) => value.replace(/^"|"$/g, "").trim());
  }

  async function parseCSV(selectedFile: File) {
    const text = await selectedFile.text();
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      throw new Error("The CSV file must contain at least one header row and one data row.");
    }

    const parsedHeaders = parseCSVLine(lines[0]).map((h) => h.trim());
    if (!parsedHeaders.length) {
      throw new Error("No valid CSV headers were found.");
    }

    const parsedRows: CsvRow[] = lines.slice(1).map((line) => {
      const values = parseCSVLine(line);
      const row: CsvRow = {};

      parsedHeaders.forEach((header, index) => {
        row[header] = values[index] ?? "";
      });

      return row;
    });

    return {
      headers: parsedHeaders,
      rows: parsedRows,
    };
  }

  async function handleSelectedFile(selectedFile: File | null) {
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
      setError("Please upload a valid CSV file.");
      setFile(null);
      setCsvData([]);
      setHeaders([]);
      return;
    }

    try {
      setError("");
      setSuccessMessage("");

      const parsed = await parseCSV(selectedFile);

      setFile(selectedFile);
      setHeaders(parsed.headers);
      setCsvData(parsed.rows);
    } catch (err: any) {
      setFile(null);
      setCsvData([]);
      setHeaders([]);
      setError(err?.message || "Could not parse the CSV file.");
    }
  }

  async function handleGenerate() {
    if (!file || !csvData.length) {
      setError("Please upload a CSV file first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      const response = await fetch(`/api/generate-risks/${projectId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          csvData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Failed to generate risks.");
      }

      setSuccessMessage("Baseline and AI risks generated successfully.");
      router.push(`/app/projects/${projectId}`);
    } catch (err: any) {
      setError(err?.message || "Something went wrong while generating risks.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <button
          type="button"
          onClick={() => router.push("/app")}
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </button>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          {/* Left */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                <Database className="h-3.5 w-3.5" />
                Import Existing Data
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Upload project data from CSV
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                Import existing project information and let RiskBases generate an
                initial baseline plus AI-enriched project risks based on the uploaded data.
              </p>
            </div>

            <div
              onDragEnter={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setDragActive(false);
              }}
              onDrop={async (e) => {
                e.preventDefault();
                setDragActive(false);
                const droppedFile = e.dataTransfer.files?.[0] ?? null;
                await handleSelectedFile(droppedFile);
              }}
              className={`rounded-3xl border-2 border-dashed p-8 transition ${
                dragActive
                  ? "border-blue-400 bg-blue-50/70"
                  : "border-slate-300 bg-slate-50"
              }`}
            >
              <div className="flex flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <Upload className="h-7 w-7 text-blue-600" />
                </div>

                <h2 className="text-lg font-semibold text-slate-900">
                  Drag and drop your CSV file here
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Or choose a file manually. Supported format: CSV
                </p>

                <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
                  <FileSpreadsheet className="h-4 w-4" />
                  Choose CSV File
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={async (e) => {
                      const selectedFile = e.target.files?.[0] ?? null;
                      await handleSelectedFile(selectedFile);
                    }}
                  />
                </label>
              </div>
            </div>

            {fileMeta && (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
                      <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {fileMeta.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {fileMeta.sizeKb} KB · {fileMeta.rows} rows · {fileMeta.columns} columns
                      </p>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Ready
                  </div>
                </div>
              </div>
            )}

            {headers.length > 0 && (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white">
                <div className="border-b border-slate-100 px-5 py-4">
                  <h3 className="text-sm font-semibold text-slate-900">Detected columns</h3>
                </div>
                <div className="flex flex-wrap gap-2 px-5 py-4">
                  {headers.slice(0, 12).map((header) => (
                    <span
                      key={header}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
                    >
                      {header}
                    </span>
                  ))}
                  {headers.length > 12 && (
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
                      +{headers.length - 12} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading || !file || !csvData.length}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating baseline & AI risks...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Baseline & AI Risks
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => router.push("/app")}
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">How this works</h2>
              <div className="mt-5 space-y-4">
                {[
                  {
                    step: "1",
                    title: "Upload your CSV",
                    description:
                      "Add existing project data such as milestones, dependencies, stakeholders or risk inputs.",
                  },
                  {
                    step: "2",
                    title: "RiskBases builds the baseline",
                    description:
                      "The platform matches your project context against the baseline template library and rules layer.",
                  },
                  {
                    step: "3",
                    title: "AI enriches the output",
                    description:
                      "AI reviews the imported context and adds project-specific risks beyond the baseline.",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                      {item.step}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <h2 className="text-lg font-semibold text-slate-900">What gets generated</h2>
              </div>

              <div className="space-y-3">
                {[
                  "Baseline project risks from the RiskBases template library",
                  "AI-enriched project-specific risks based on imported data",
                  "Probability, impact and level suggestions",
                  "Suggested mitigation actions for each generated risk",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span className="text-sm text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6">
              <p className="text-sm font-semibold text-blue-900">Recommended CSV content</p>
              <p className="mt-2 text-sm leading-6 text-blue-800/80">
                The best results usually come from CSV files containing planning data,
                stakeholder context, dependencies, delivery constraints, site details or
                existing risk notes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}