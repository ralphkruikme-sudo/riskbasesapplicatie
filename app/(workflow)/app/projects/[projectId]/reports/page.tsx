"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  AlertTriangle,
  Bell,
  ClipboardList,
  Download,
  FileText,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Target,
  Users,
} from "lucide-react";
import { useParams } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type RiskStatus = "open" | "monitoring" | "mitigated" | "closed" | "archived";
type RiskLevel = "low" | "medium" | "high";

type ActionStatus = "open" | "in_progress" | "blocked" | "done" | "overdue";
type ActionPriority = "low" | "medium" | "high" | "critical";

type NotificationType =
  | "action_assigned"
  | "action_due_soon"
  | "action_overdue"
  | "action_completed"
  | "risk_created"
  | "risk_high"
  | "risk_updated"
  | "general";

type ProjectRisk = {
  id: string;
  project_id: string;
  risk_code: string | null;
  title: string;
  description: string | null;
  category: string | null;
  risk_type: string | null;
  probability: number;
  impact: number;
  score: number;
  level: RiskLevel;
  status: RiskStatus;
  owner_user_id: string | null;
  phase: string | null;
  due_review_date: string | null;
  created_at: string;
  updated_at: string;
};

type RiskAction = {
  id: string;
  project_id: string;
  risk_id: string | null;
  title: string;
  description: string | null;
  owner_user_id: string | null;
  status: ActionStatus;
  priority: ActionPriority;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

type ProjectStakeholder = {
  id: string;
  project_id: string;
  name: string;
  organization: string | null;
  role: string | null;
  stakeholder_type: string | null;
  influence_score: number;
  interest_score: number;
  created_at: string;
  updated_at: string;
};

type AppNotification = {
  id: string;
  project_id: string;
  risk_id: string | null;
  action_id: string | null;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
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

function formatDateTime(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatActionStatusLabel(status: ActionStatus) {
  switch (status) {
    case "open":
      return "Open";
    case "in_progress":
      return "In Progress";
    case "blocked":
      return "Blocked";
    case "done":
      return "Done";
    case "overdue":
      return "Overdue";
    default:
      return status;
  }
}

function getRiskLevelClasses(level: RiskLevel) {
  if (level === "high") return "bg-red-50 text-red-700 border-red-200";
  if (level === "medium") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-blue-50 text-blue-700 border-blue-200";
}

function getActionStatusClasses(status: ActionStatus) {
  switch (status) {
    case "open":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "in_progress":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "blocked":
      return "bg-red-50 text-red-700 border-red-200";
    case "done":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "overdue":
      return "bg-rose-50 text-rose-700 border-rose-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
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

export default function ReportsPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [risks, setRisks] = useState<ProjectRisk[]>([]);
  const [actions, setActions] = useState<RiskAction[]>([]);
  const [stakeholders, setStakeholders] = useState<ProjectStakeholder[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadReportsData() {
    setLoading(true);
    setErrorMessage(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const [
      { data: risksData, error: risksError },
      { data: actionsData, error: actionsError },
      { data: stakeholdersData, error: stakeholdersError },
      { data: notificationsData, error: notificationsError },
    ] = await Promise.all([
      supabase
        .from("project_risks")
        .select("*")
        .eq("project_id", projectId)
        .order("score", { ascending: false }),
      supabase
        .from("risk_actions")
        .select("*")
        .eq("project_id", projectId)
        .order("updated_at", { ascending: false }),
      supabase
        .from("project_stakeholders")
        .select("*")
        .eq("project_id", projectId)
        .order("updated_at", { ascending: false }),
      user
        ? supabase
            .from("notifications")
            .select("*")
            .eq("project_id", projectId)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [], error: null } as any),
    ]);

    const firstError =
      risksError || actionsError || stakeholdersError || notificationsError;

    if (firstError) {
      setErrorMessage(firstError.message);
      setLoading(false);
      return;
    }

    setRisks((risksData || []) as ProjectRisk[]);
    setActions((actionsData || []) as RiskAction[]);
    setStakeholders((stakeholdersData || []) as ProjectStakeholder[]);
    setNotifications((notificationsData || []) as AppNotification[]);
    setLoading(false);
  }

  useEffect(() => {
    if (projectId) {
      loadReportsData();
    }
  }, [projectId]);

  const stats = useMemo(() => {
    const totalRisks = risks.length;
    const highRisks = risks.filter((item) => item.level === "high").length;
    const openRisks = risks.filter((item) => item.status === "open").length;
    const mitigatedOrClosedRisks = risks.filter(
      (item) => item.status === "mitigated" || item.status === "closed"
    ).length;

    const avgRiskScore =
      totalRisks > 0
        ? (
            risks.reduce((sum, item) => sum + item.score, 0) / totalRisks
          ).toFixed(1)
        : "0.0";

    const totalActions = actions.length;
    const openActions = actions.filter(
      (item) => item.status === "open" || item.status === "in_progress"
    ).length;
    const completedActions = actions.filter((item) => item.status === "done").length;
    const overdueActions = actions.filter((item) => {
      if (!item.due_date || item.status === "done") return false;
      return new Date(item.due_date).getTime() < Date.now();
    }).length;

    const totalStakeholders = stakeholders.length;
    const highInfluenceStakeholders = stakeholders.filter(
      (item) => item.influence_score >= 4
    ).length;

    const unreadNotifications = notifications.filter((item) => !item.is_read).length;

    return {
      totalRisks,
      highRisks,
      openRisks,
      mitigatedOrClosedRisks,
      avgRiskScore,
      totalActions,
      openActions,
      completedActions,
      overdueActions,
      totalStakeholders,
      highInfluenceStakeholders,
      unreadNotifications,
    };
  }, [risks, actions, stakeholders, notifications]);

  const topRisks = useMemo(() => {
    return [...risks].sort((a, b) => b.score - a.score).slice(0, 5);
  }, [risks]);

  const overdueOrCriticalActions = useMemo(() => {
    return [...actions]
      .filter((item) => {
        const overdue =
          item.due_date && item.status !== "done"
            ? new Date(item.due_date).getTime() < Date.now()
            : false;

        return overdue || item.priority === "critical" || item.priority === "high";
      })
      .sort((a, b) => {
        const aOverdue =
          a.due_date && a.status !== "done"
            ? new Date(a.due_date).getTime() < Date.now()
            : false;
        const bOverdue =
          b.due_date && b.status !== "done"
            ? new Date(b.due_date).getTime() < Date.now()
            : false;

        if (aOverdue && !bOverdue) return -1;
        if (!aOverdue && bOverdue) return 1;

        const rank: Record<ActionPriority, number> = {
          critical: 4,
          high: 3,
          medium: 2,
          low: 1,
        };

        return rank[b.priority] - rank[a.priority];
      })
      .slice(0, 6);
  }, [actions]);

  const topStakeholders = useMemo(() => {
    return [...stakeholders]
      .sort((a, b) => {
        const scoreA = a.influence_score + a.interest_score;
        const scoreB = b.influence_score + b.interest_score;
        return scoreB - scoreA;
      })
      .slice(0, 5);
  }, [stakeholders]);

  const categoryDistribution = useMemo(() => {
    const map = new Map<string, number>();

    risks.forEach((item) => {
      const key = item.category || "Uncategorized";
      map.set(key, (map.get(key) || 0) + 1);
    });

    return Array.from(map.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [risks]);

  const recentNotifications = useMemo(() => {
    return notifications.slice(0, 6);
  }, [notifications]);

  const reportSummary = useMemo(() => {
    const lines: string[] = [];

    if (stats.totalRisks === 0) {
      lines.push(
        "No risks have been recorded yet, so this report currently has limited management value."
      );
    } else {
      lines.push(
        `The project currently contains ${stats.totalRisks} registered risks, of which ${stats.highRisks} are high exposure.`
      );
      lines.push(
        `Average risk score is ${stats.avgRiskScore}, indicating the current overall exposure level of the register.`
      );
    }

    if (stats.totalActions === 0) {
      lines.push(
        "No mitigation actions have been registered yet, so risk follow-up is not operationally controlled yet."
      );
    } else {
      lines.push(
        `${stats.totalActions} actions are registered, with ${stats.overdueActions} overdue and ${stats.completedActions} completed.`
      );
    }

    if (stats.totalStakeholders > 0) {
      lines.push(
        `${stats.totalStakeholders} stakeholders are recorded, including ${stats.highInfluenceStakeholders} with high influence on project outcomes.`
      );
    }

    if (categoryDistribution[0]) {
      lines.push(
        `The most dominant risk category is "${categoryDistribution[0].label}".`
      );
    }

    if (stats.unreadNotifications > 0) {
      lines.push(
        `${stats.unreadNotifications} unread notifications indicate that the team still has pending follow-up items.`
      );
    }

    return lines;
  }, [stats, categoryDistribution]);

  return (
    <section className="p-8">
      <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
            <FileText className="h-3.5 w-3.5" />
            Reports
          </div>

          <h1 className="mt-4 text-[38px] font-semibold tracking-tight text-slate-900">
            Project Reports
          </h1>
          <p className="mt-2 max-w-3xl text-[17px] text-slate-500">
            Executive summary of project risks, actions, stakeholders and recent
            operational alerts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={loadReportsData}
            className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#182B63] px-5 text-sm font-medium text-white shadow-sm transition hover:opacity-95"
          >
            <Download className="h-4 w-4" />
            Print / Export
          </button>
        </div>
      </div>

      {errorMessage ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {loading ? (
        <div className="flex min-h-[400px] items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white text-slate-500 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading reports...
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-5">
            <MetricCard
              title="Total Risks"
              value={String(stats.totalRisks)}
              sublabel="Current risk register size"
              icon={<ShieldAlert className="h-5 w-5" />}
            />
            <MetricCard
              title="High Risks"
              value={String(stats.highRisks)}
              sublabel="Immediate management attention"
              icon={<AlertTriangle className="h-5 w-5" />}
            />
            <MetricCard
              title="Open Actions"
              value={String(stats.openActions)}
              sublabel="Follow-up still in progress"
              icon={<Target className="h-5 w-5" />}
            />
            <MetricCard
              title="Stakeholders"
              value={String(stats.totalStakeholders)}
              sublabel="Recorded project stakeholders"
              icon={<Users className="h-5 w-5" />}
            />
            <MetricCard
              title="Unread Alerts"
              value={String(stats.unreadNotifications)}
              sublabel="Pending notifications"
              icon={<Bell className="h-5 w-5" />}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <div className="xl:col-span-8 space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-slate-900">
                  Executive Summary
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Quick management-level readout of the current project position
                </p>

                <div className="mt-4 space-y-3">
                  {reportSummary.map((line, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700"
                    >
                      {line}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">Top Risks</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Highest exposure risks in the current register
                    </p>
                  </div>
                  <ShieldAlert className="h-5 w-5 text-slate-400" />
                </div>

                {topRisks.length === 0 ? (
                  <p className="text-sm text-slate-500">No risks available yet.</p>
                ) : (
                  <div className="space-y-3">
                    {topRisks.map((risk) => (
                      <div
                        key={risk.id}
                        className="rounded-2xl border border-slate-200 p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                {risk.risk_code || "RISK"}
                              </span>
                              <span
                                className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getRiskLevelClasses(
                                  risk.level
                                )}`}
                              >
                                {risk.level.toUpperCase()}
                              </span>
                            </div>
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {risk.title}
                            </p>
                            <p className="mt-1 truncate text-xs text-slate-500">
                              {risk.category || "Uncategorized"} •{" "}
                              {risk.risk_type || "General risk"}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-slate-100 px-4 py-3 text-center">
                            <p className="text-xs text-slate-500">Score</p>
                            <p className="text-2xl font-semibold text-slate-900">
                              {risk.score}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                          <div className="rounded-2xl bg-slate-50 p-3">
                            <p className="text-xs text-slate-500">Status</p>
                            <p className="mt-1 text-sm font-medium text-slate-900">
                              {risk.status}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 p-3">
                            <p className="text-xs text-slate-500">Probability</p>
                            <p className="mt-1 text-sm font-medium text-slate-900">
                              {risk.probability}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 p-3">
                            <p className="text-xs text-slate-500">Impact</p>
                            <p className="mt-1 text-sm font-medium text-slate-900">
                              {risk.impact}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 p-3">
                            <p className="text-xs text-slate-500">Review</p>
                            <p className="mt-1 text-sm font-medium text-slate-900">
                              {formatDate(risk.due_review_date)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">
                      Action Follow-up Summary
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Overdue and high-priority actions requiring attention
                    </p>
                  </div>
                  <Target className="h-5 w-5 text-slate-400" />
                </div>

                {overdueOrCriticalActions.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No overdue or high-priority actions found.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {overdueOrCriticalActions.map((action) => (
                      <div
                        key={action.id}
                        className="rounded-2xl border border-slate-200 p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {action.title}
                            </p>
                            <p className="mt-1 truncate text-xs text-slate-500">
                              {action.description || "No description added yet"}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <span
                              className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getActionStatusClasses(
                                action.status
                              )}`}
                            >
                              {formatActionStatusLabel(action.status)}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                          <div className="rounded-2xl bg-slate-50 p-3">
                            <p className="text-xs text-slate-500">Priority</p>
                            <p className="mt-1 text-sm font-medium text-slate-900">
                              {action.priority}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 p-3">
                            <p className="text-xs text-slate-500">Status</p>
                            <p className="mt-1 text-sm font-medium text-slate-900">
                              {formatActionStatusLabel(action.status)}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 p-3">
                            <p className="text-xs text-slate-500">Due date</p>
                            <p className="mt-1 text-sm font-medium text-slate-900">
                              {formatDate(action.due_date)}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 p-3">
                            <p className="text-xs text-slate-500">Updated</p>
                            <p className="mt-1 text-sm font-medium text-slate-900">
                              {formatDate(action.updated_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="xl:col-span-4 space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Risk Health</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Quick overview of the current risk posture
                </p>

                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Open Risks
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">
                      {stats.openRisks}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Mitigated / Closed
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">
                      {stats.mitigatedOrClosedRisks}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Average Score
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">
                      {stats.avgRiskScore}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">
                  Stakeholder Snapshot
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Most influential and engaged stakeholders
                </p>

                {topStakeholders.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-500">
                    No stakeholders available yet.
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {topStakeholders.map((stakeholder) => (
                      <div
                        key={stakeholder.id}
                        className="rounded-2xl border border-slate-200 p-4"
                      >
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {stakeholder.name}
                        </p>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {stakeholder.organization || "No organization"} •{" "}
                          {stakeholder.role || "No role"}
                        </p>

                        <div className="mt-3 grid grid-cols-2 gap-3">
                          <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-xs text-slate-500">Influence</p>
                            <p className="mt-1 text-sm font-medium text-slate-900">
                              {stakeholder.influence_score}/5
                            </p>
                          </div>
                          <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-xs text-slate-500">Interest</p>
                            <p className="mt-1 text-sm font-medium text-slate-900">
                              {stakeholder.interest_score}/5
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">
                  Risk Categories
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Most common risk concentrations
                </p>

                {categoryDistribution.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-500">
                    No category data available yet.
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {categoryDistribution.map((item) => {
                      const width =
                        stats.totalRisks > 0 ? (item.count / stats.totalRisks) * 100 : 0;

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

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Recent Alerts
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Latest project notifications
                    </p>
                  </div>
                  <Bell className="h-5 w-5 text-slate-400" />
                </div>

                {recentNotifications.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No notifications available yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentNotifications.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-slate-200 p-4"
                      >
                        <p className="text-sm font-semibold text-slate-900">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {item.message}
                        </p>
                        <p className="mt-3 text-[11px] text-slate-400">
                          {formatDateTime(item.created_at)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5">
                <h3 className="text-lg font-semibold text-slate-900">
                  Next build step
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  After this reports page works, the best next step is the Settings
                  page and then rebuilding the Dashboard with real project data and
                  the AI risk generator layer on top.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  Management Snapshot
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  One-line project summary for internal reporting
                </p>
              </div>
              <ClipboardList className="h-5 w-5 text-slate-400" />
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Risk Position
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {stats.highRisks > 0
                    ? `${stats.highRisks} high risks remain active in the current register.`
                    : "No high risks are currently recorded."}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Action Control
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {stats.overdueActions > 0
                    ? `${stats.overdueActions} actions are overdue and need follow-up.`
                    : "No overdue actions at this time."}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Stakeholder Pressure
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {stats.highInfluenceStakeholders > 0
                    ? `${stats.highInfluenceStakeholders} high-influence stakeholders require close management.`
                    : "No high-influence stakeholder pressure flagged yet."}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Alerts
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {stats.unreadNotifications > 0
                    ? `${stats.unreadNotifications} unread notifications still require attention.`
                    : "No unread project notifications."}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
