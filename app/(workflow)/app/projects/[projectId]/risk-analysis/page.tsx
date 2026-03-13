"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  AlertTriangle,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Shield,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import { useParams } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type RiskStatus = "open" | "monitoring" | "mitigated" | "closed" | "archived";
type RiskLevel = "low" | "medium" | "high";

type ProjectRisk = {
  id: string;
  project_id: string;
  risk_code: string | null;
  title: string;
  description: string | null;
  category: string | null;
  risk_type: string | null;
  source: string | null;
  cause: string | null;
  consequence: string | null;
  probability: number;
  impact: number;
  score: number;
  level: RiskLevel;
  status: RiskStatus;
  owner_user_id: string | null;
  phase: string | null;
  due_review_date: string | null;
  identified_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getLevelClasses(level: RiskLevel) {
  if (level === "high") return "bg-red-50 text-red-700 border-red-200";
  if (level === "medium") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-blue-50 text-blue-700 border-blue-200";
}

function getStatusClasses(status: RiskStatus) {
  switch (status) {
    case "open":
      return "bg-red-50 text-red-700 border-red-200";
    case "monitoring":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "mitigated":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "closed":
      return "bg-slate-100 text-slate-700 border-slate-200";
    case "archived":
      return "bg-slate-50 text-slate-500 border-slate-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

function getScoreBand(score: number) {
  if (score >= 15) return "high";
  if (score >= 6) return "medium";
  return "low";
}

function getMatrixCellClasses(probability: number, impact: number) {
  const score = probability * impact;

  if (score >= 15) return "bg-red-500 text-white border-red-500";
  if (score >= 10) return "bg-orange-400 text-white border-orange-400";
  if (score >= 6) return "bg-amber-300 text-slate-900 border-amber-300";
  return "bg-lime-200 text-slate-900 border-lime-200";
}

function MetricCard({
  title,
  value,
  sublabel,
  icon,
}: {
  title: string;
  value: string;
  sublabel: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-2 text-[34px] font-semibold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-2 text-sm text-slate-500">{sublabel}</p>
        </div>
        <div className="rounded-2xl bg-slate-100 p-3 text-slate-600">{icon}</div>
      </div>
    </div>
  );
}

export default function RiskAnalysisPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [risks, setRisks] = useState<ProjectRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadAnalysis() {
    if (!projectId) return;

    setLoading(true);
    setErrorMessage(null);

    const { data, error } = await supabase
      .from("project_risks")
      .select("*")
      .eq("project_id", projectId)
      .order("score", { ascending: false });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setRisks((data || []) as ProjectRisk[]);
    setLoading(false);
  }

  useEffect(() => {
    loadAnalysis();
  }, [projectId]);

  const stats = useMemo(() => {
    const total = risks.length;
    const high = risks.filter((risk) => risk.level === "high").length;
    const medium = risks.filter((risk) => risk.level === "medium").length;
    const low = risks.filter((risk) => risk.level === "low").length;
    const open = risks.filter((risk) => risk.status === "open").length;
    const monitoring = risks.filter((risk) => risk.status === "monitoring").length;
    const mitigated = risks.filter((risk) => risk.status === "mitigated").length;
    const closed = risks.filter((risk) => risk.status === "closed").length;

    const totalScore = risks.reduce((sum, risk) => sum + risk.score, 0);
    const avgScore = total > 0 ? (totalScore / total).toFixed(1) : "0.0";

    const upcomingReviews = risks.filter((risk) => {
      if (!risk.due_review_date) return false;
      const due = new Date(risk.due_review_date).getTime();
      const now = new Date().getTime();
      const in14Days = now + 14 * 24 * 60 * 60 * 1000;
      return due >= now && due <= in14Days;
    }).length;

    return {
      total,
      high,
      medium,
      low,
      open,
      monitoring,
      mitigated,
      closed,
      avgScore,
      upcomingReviews,
    };
  }, [risks]);

  const topRisks = useMemo(() => {
    return [...risks].sort((a, b) => b.score - a.score).slice(0, 5);
  }, [risks]);

  const categoryDistribution = useMemo(() => {
    const map = new Map<string, number>();

    risks.forEach((risk) => {
      const key = risk.category || "Uncategorized";
      map.set(key, (map.get(key) || 0) + 1);
    });

    return Array.from(map.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }, [risks]);

  const statusDistribution = useMemo(() => {
    const ordered: RiskStatus[] = [
      "open",
      "monitoring",
      "mitigated",
      "closed",
      "archived",
    ];

    return ordered.map((status) => ({
      status,
      count: risks.filter((risk) => risk.status === status).length,
    }));
  }, [risks]);

  const phaseDistribution = useMemo(() => {
    const map = new Map<string, number>();

    risks.forEach((risk) => {
      const key = risk.phase || "No phase";
      map.set(key, (map.get(key) || 0) + 1);
    });

    return Array.from(map.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }, [risks]);

  const matrixCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    for (let p = 1; p <= 5; p += 1) {
      for (let i = 1; i <= 5; i += 1) {
        counts[`${p}-${i}`] = 0;
      }
    }

    risks.forEach((risk) => {
      const key = `${risk.probability}-${risk.impact}`;
      counts[key] = (counts[key] || 0) + 1;
    });

    return counts;
  }, [risks]);

  const upcomingReviewRisks = useMemo(() => {
    return [...risks]
      .filter((risk) => Boolean(risk.due_review_date))
      .sort((a, b) => {
        const aTime = a.due_review_date
          ? new Date(a.due_review_date).getTime()
          : Infinity;
        const bTime = b.due_review_date
          ? new Date(b.due_review_date).getTime()
          : Infinity;
        return aTime - bTime;
      })
      .slice(0, 6);
  }, [risks]);

  const summary = useMemo(() => {
    if (risks.length === 0) {
      return [
        "No risks have been added yet, so there is no meaningful analysis yet.",
        "Start by adding a few project risks in the Risk Register to populate the matrix and distributions.",
      ];
    }

    const topCategory = categoryDistribution[0]?.label || "Uncategorized";
    const highShare = risks.length > 0 ? Math.round((stats.high / risks.length) * 100) : 0;

    const messages: string[] = [];

    messages.push(
      `${stats.total} risks are currently registered for this project, with an average exposure score of ${stats.avgScore}.`
    );

    messages.push(
      `${stats.high} risks are marked as high exposure, representing ${highShare}% of the current register.`
    );

    messages.push(
      `The largest concentration of risks is in "${topCategory}".`
    );

    if (stats.mitigated + stats.closed === 0) {
      messages.push(
        "No risks have been mitigated or closed yet, which suggests the project is still in an early control stage."
      );
    } else {
      messages.push(
        `${stats.mitigated + stats.closed} risks have already been mitigated or closed.`
      );
    }

    if (stats.upcomingReviews > 0) {
      messages.push(
        `${stats.upcomingReviews} risk reviews are due within the next 14 days.`
      );
    }

    return messages;
  }, [risks, categoryDistribution, stats]);

  return (
    <section className="p-8">
      <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
            <BarChart3 className="h-3.5 w-3.5" />
            Risk Analysis
          </div>

          <h1 className="mt-4 text-[38px] font-semibold tracking-tight text-slate-900">
            Project Risk Analysis
          </h1>
          <p className="mt-2 max-w-3xl text-[17px] text-slate-500">
            Deep insight into project exposure, concentration of risks, review
            pressure and the overall health of the current risk portfolio.
          </p>
        </div>

        <button
          onClick={loadAnalysis}
          className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {errorMessage ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {loading ? (
        <div className="flex min-h-[400px] items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white text-slate-500 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading analysis...
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-5">
            <MetricCard
              title="Total Risks"
              value={String(stats.total)}
              sublabel="Total registered risks"
              icon={<Shield className="h-5 w-5" />}
            />
            <MetricCard
              title="High Risks"
              value={String(stats.high)}
              sublabel="High exposure items"
              icon={<AlertTriangle className="h-5 w-5" />}
            />
            <MetricCard
              title="Open Risks"
              value={String(stats.open)}
              sublabel="Still active and unresolved"
              icon={<ShieldAlert className="h-5 w-5" />}
            />
            <MetricCard
              title="Avg. Score"
              value={stats.avgScore}
              sublabel="Average exposure score"
              icon={<TrendingUp className="h-5 w-5" />}
            />
            <MetricCard
              title="Upcoming Reviews"
              value={String(stats.upcomingReviews)}
              sublabel="Due within 14 days"
              icon={<CalendarClock className="h-5 w-5" />}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <div className="xl:col-span-8">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5">
                  <h3 className="text-xl font-semibold text-slate-900">
                    5×5 Risk Matrix
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Probability on the X-axis and impact on the Y-axis. Each cell
                    shows how many risks fall into that exposure zone.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <div className="min-w-[720px]">
                    <div className="mb-3 grid grid-cols-[100px_repeat(5,minmax(0,1fr))] gap-3">
                      <div />
                      {[1, 2, 3, 4, 5].map((probability) => (
                        <div
                          key={probability}
                          className="text-center text-sm font-semibold text-slate-600"
                        >
                          P{probability}
                        </div>
                      ))}
                    </div>

                    {[5, 4, 3, 2, 1].map((impact) => (
                      <div
                        key={impact}
                        className="mb-3 grid grid-cols-[100px_repeat(5,minmax(0,1fr))] gap-3"
                      >
                        <div className="flex items-center text-sm font-semibold text-slate-600">
                          I{impact}
                        </div>

                        {[1, 2, 3, 4, 5].map((probability) => {
                          const count = matrixCounts[`${probability}-${impact}`] || 0;
                          const score = probability * impact;

                          return (
                            <div
                              key={`${probability}-${impact}`}
                              className={`flex h-24 flex-col items-center justify-center rounded-2xl border text-center ${getMatrixCellClasses(
                                probability,
                                impact
                              )}`}
                            >
                              <p className="text-xs font-medium opacity-90">
                                {probability} × {impact}
                              </p>
                              <p className="mt-1 text-3xl font-semibold">
                                {count}
                              </p>
                              <p className="mt-1 text-xs opacity-90">
                                Score {score}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold">
                  <span className="rounded-full border border-lime-200 bg-lime-100 px-3 py-1 text-lime-800">
                    Low: 1–5
                  </span>
                  <span className="rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-amber-800">
                    Medium: 6–9
                  </span>
                  <span className="rounded-full border border-orange-200 bg-orange-100 px-3 py-1 text-orange-800">
                    Elevated: 10–14
                  </span>
                  <span className="rounded-full border border-red-200 bg-red-100 px-3 py-1 text-red-800">
                    High: 15–25
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6 xl:col-span-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Level Distribution
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      How exposure is distributed across the register
                    </p>
                  </div>
                  <ShieldAlert className="h-5 w-5 text-slate-400" />
                </div>

                <div className="space-y-3">
                  {[
                    { label: "Low", value: stats.low, level: "low" as RiskLevel },
                    {
                      label: "Medium",
                      value: stats.medium,
                      level: "medium" as RiskLevel,
                    },
                    { label: "High", value: stats.high, level: "high" as RiskLevel },
                  ].map((item) => {
                    const width =
                      stats.total > 0 ? (item.value / stats.total) * 100 : 0;

                    return (
                      <div key={item.label}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-700">
                            {item.label}
                          </span>
                          <span className="text-slate-500">{item.value}</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${
                              item.level === "high"
                                ? "bg-red-500"
                                : item.level === "medium"
                                ? "bg-amber-400"
                                : "bg-blue-500"
                            }`}
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Review Pressure
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Nearest risk review dates
                    </p>
                  </div>
                  <CalendarClock className="h-5 w-5 text-slate-400" />
                </div>

                {upcomingReviewRisks.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No review dates have been added yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {upcomingReviewRisks.map((risk) => (
                      <div
                        key={risk.id}
                        className="rounded-2xl border border-slate-200 p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {risk.title}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {risk.risk_code || "RISK"} • {risk.category || "Uncategorized"}
                            </p>
                          </div>
                          <span
                            className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${getLevelClasses(
                              risk.level
                            )}`}
                          >
                            {risk.level.toUpperCase()}
                          </span>
                        </div>
                        <p className="mt-3 text-sm text-slate-600">
                          Review: {formatDate(risk.due_review_date)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
            <div className="xl:col-span-5">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Top Risks
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Highest exposure items in this project
                    </p>
                  </div>
                  <AlertTriangle className="h-5 w-5 text-slate-400" />
                </div>

                {topRisks.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No risks available yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {topRisks.map((risk) => (
                      <div
                        key={risk.id}
                        className="rounded-2xl border border-slate-200 p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {risk.title}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {risk.risk_code || "RISK"} • {risk.category || "Uncategorized"}
                            </p>
                          </div>

                          <div className="rounded-xl bg-slate-100 px-3 py-2 text-center">
                            <p className="text-[11px] text-slate-500">Score</p>
                            <p className="text-sm font-semibold text-slate-900">
                              {risk.score}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getLevelClasses(
                              risk.level
                            )}`}
                          >
                            {risk.level.toUpperCase()}
                          </span>
                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                              risk.status
                            )}`}
                          >
                            {risk.status}
                          </span>
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                            P{risk.probability} × I{risk.impact}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="xl:col-span-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Status Distribution
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Current workflow state
                    </p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-slate-400" />
                </div>

                <div className="space-y-3">
                  {statusDistribution.map((item) => (
                    <div
                      key={item.status}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3"
                    >
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="xl:col-span-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Category Distribution
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Which categories dominate the register
                    </p>
                  </div>
                  <BarChart3 className="h-5 w-5 text-slate-400" />
                </div>

                {categoryDistribution.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No categories available yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {categoryDistribution.slice(0, 6).map((item) => {
                      const width =
                        stats.total > 0 ? (item.count / stats.total) * 100 : 0;

                      return (
                        <div key={item.label}>
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <span className="truncate font-medium text-slate-700">
                              {item.label}
                            </span>
                            <span className="text-slate-500">{item.count}</span>
                          </div>
                          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-[#182B63]"
                              style={{ width: `${width}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
            <div className="xl:col-span-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">
                  Phase Distribution
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Where risks are concentrated in the lifecycle
                </p>

                {phaseDistribution.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-500">
                    No phases available yet.
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {phaseDistribution.slice(0, 6).map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3"
                      >
                        <span className="truncate text-sm font-medium text-slate-700">
                          {item.label}
                        </span>
                        <span className="text-sm font-semibold text-slate-900">
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="xl:col-span-8">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">
                  Analysis Summary
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Quick read-out of the current risk profile
                </p>

                <div className="mt-4 space-y-3">
                  {summary.map((line, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700"
                    >
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}