"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCheck,
  ClipboardList,
  Clock,
  Loader2,
  RefreshCw,
  Shield,
  ShieldAlert,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Project = {
  id: string;
  name: string;
  status: string | null;
  description?: string | null;
  project_value?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  client_name?: string | null;
};

type RiskLevel = "low" | "medium" | "high";
type RiskStatus = "open" | "monitoring" | "mitigated" | "closed" | "archived";
type ActionStatus = "open" | "in_progress" | "blocked" | "done" | "overdue";
type ActionPriority = "low" | "medium" | "high" | "critical";

type ProjectRisk = {
  id: string;
  risk_code: string | null;
  title: string;
  category: string | null;
  probability: number;
  impact: number;
  score: number;
  level: RiskLevel;
  status: RiskStatus;
  phase: string | null;
  due_review_date: string | null;
  created_at: string;
  updated_at: string;
};

type RiskAction = {
  id: string;
  title: string;
  status: ActionStatus;
  priority: ActionPriority;
  due_date: string | null;
  created_at: string;
};

type Notification = {
  id: string;
  title: string;
  body: string | null;
  is_read: boolean;
  created_at: string;
};

type Stakeholder = {
  id: string;
  name: string;
};

type TimelineEvent = {
  id: string;
  title: string;
  type: string;
  status: string;
  start_date: string;
  end_date: string | null;
};

type InsightSeverity = "critical" | "warning" | "info" | "positive";

type ProjectInsight = {
  id: string;
  severity: InsightSeverity;
  title: string;
  description: string;
  stat?: string;
  href?: string;
  ctaLabel?: string;
};

function timeAgo(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function fmtEur(v: number) {
  if (v >= 1e6) return `€ ${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `€ ${(v / 1e3).toFixed(0)}K`;
  return `€ ${v}`;
}

function isOverdue(date?: string | null) {
  if (!date) return false;
  return new Date(date).getTime() < Date.now();
}

function daysUntil(date?: string | null) {
  if (!date) return null;
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
}

function getInsightStyles(severity: InsightSeverity) {
  switch (severity) {
    case "critical":
      return {
        border: "#fecaca",
        bg: "#fef2f2",
        iconBg: "#fee2e2",
        iconColor: "#dc2626",
        pillBg: "#fff1f2",
        pillColor: "#b91c1c",
      };
    case "warning":
      return {
        border: "#fde68a",
        bg: "#fffbeb",
        iconBg: "#fef3c7",
        iconColor: "#d97706",
        pillBg: "#fff7ed",
        pillColor: "#b45309",
      };
    case "positive":
      return {
        border: "#bbf7d0",
        bg: "#f0fdf4",
        iconBg: "#dcfce7",
        iconColor: "#16a34a",
        pillBg: "#ecfdf5",
        pillColor: "#15803d",
      };
    default:
      return {
        border: "#ddd6fe",
        bg: "#f5f3ff",
        iconBg: "#ede9fe",
        iconColor: "#7c3aed",
        pillBg: "#f5f3ff",
        pillColor: "#6d28d9",
      };
  }
}

function buildProjectInsights(params: {
  projectId: string;
  risks: ProjectRisk[];
  actions: RiskAction[];
  notifications: Notification[];
  stakeholders: Stakeholder[];
  timeline: TimelineEvent[];
}): ProjectInsight[] {
  const { projectId, risks, actions, notifications, stakeholders, timeline } = params;
  const insights: ProjectInsight[] = [];

  const highRisks = risks.filter((r) => r.level === "high");
  const openRisks = risks.filter((r) =>
    ["open", "monitoring"].includes((r.status ?? "").toLowerCase())
  );
  const overdueActions = actions.filter(
    (a) => (a.status ?? "").toLowerCase() !== "done" && isOverdue(a.due_date)
  );
  const blockedActions = actions.filter((a) => a.status === "blocked");
  const highPriorityActions = actions.filter(
    (a) => a.priority === "critical" || a.priority === "high"
  );
  const upcomingReviews = risks.filter((r) => {
    const d = daysUntil(r.due_review_date);
    return d !== null && d >= 0 && d <= 14;
  });
  const delayedTimeline = timeline.filter(
    (t) => (t.status ?? "").toLowerCase() === "delayed"
  );
  const unreadNotifications = notifications.filter((n) => !n.is_read);

  if (highRisks.length > 0) {
    insights.push({
      id: "high-risks",
      severity: "critical",
      title: "High-risk exposure requires action",
      description: `${highRisks.length} high risk item${highRisks.length > 1 ? "s" : ""} detected${
        highRisks[0]?.title ? `, led by "${highRisks[0].title}"` : ""
      }.`,
      stat: `${highRisks.length} high`,
      href: `/app/projects/${projectId}/risk-register`,
      ctaLabel: "Open risk register",
    });
  }

  if (overdueActions.length > 0) {
    insights.push({
      id: "overdue-actions",
      severity: "warning",
      title: "Mitigation follow-up overdue",
      description: `${overdueActions.length} action${
        overdueActions.length > 1 ? "s are" : " is"
      } overdue and should be reassigned or completed.`,
      stat: `${overdueActions.length} overdue`,
      href: `/app/projects/${projectId}/actions`,
      ctaLabel: "Open actions",
    });
  }

  if (upcomingReviews.length > 0) {
    insights.push({
      id: "upcoming-reviews",
      severity: "info",
      title: "Risk reviews due soon",
      description: `${upcomingReviews.length} review${
        upcomingReviews.length > 1 ? "s are" : " is"
      } scheduled within the next 14 days.`,
      stat: `${upcomingReviews.length} due`,
      href: `/app/projects/${projectId}/risk-register`,
      ctaLabel: "Plan review",
    });
  }

  if (stakeholders.length === 0 && (openRisks.length > 0 || actions.length > 0)) {
    insights.push({
      id: "no-stakeholders",
      severity: "warning",
      title: "No stakeholders linked",
      description: "This project has active risk activity but no stakeholders assigned yet.",
      stat: "0 linked",
      href: `/app/projects/${projectId}/stakeholders`,
      ctaLabel: "Add stakeholders",
    });
  }

  if (delayedTimeline.length > 0) {
    insights.push({
      id: "timeline-delayed",
      severity: "warning",
      title: "Timeline pressure detected",
      description: `${delayedTimeline.length} timeline item${
        delayedTimeline.length > 1 ? "s are" : " is"
      } marked as delayed.`,
      stat: `${delayedTimeline.length} delayed`,
      href: `/app/projects/${projectId}/project-timeline`,
      ctaLabel: "Open timeline",
    });
  }

  if (blockedActions.length > 0 && highPriorityActions.length > 0) {
    insights.push({
      id: "blocked-actions",
      severity: "critical",
      title: "Critical actions are blocked",
      description: `${blockedActions.length} blocked action${
        blockedActions.length > 1 ? "s" : ""
      } found while priority remains high.`,
      stat: `${blockedActions.length} blocked`,
      href: `/app/projects/${projectId}/actions`,
      ctaLabel: "Resolve blockers",
    });
  }

  if (!insights.length) {
    insights.push({
      id: "healthy",
      severity: "positive",
      title: "Project controls look stable",
      description:
        unreadNotifications.length > 0
          ? `No urgent control gaps detected. ${unreadNotifications.length} unread notification${
              unreadNotifications.length > 1 ? "s are" : " is"
            } waiting for review.`
          : "No urgent control gaps detected based on current project data.",
      stat: "Stable",
    });
  }

  return insights.slice(0, 4);
}

function ScoreRing({ score, max = 25 }: { score: number; max?: number }) {
  const pct = Math.min(score / max, 1);
  const r = 36;
  const c = 2 * Math.PI * r;
  const color = score >= 15 ? "#ef4444" : score >= 8 ? "#f59e0b" : "#22c55e";
  const label = score >= 15 ? "High" : score >= 8 ? "Medium" : "Low";

  return (
    <div style={{ position: "relative", width: 96, height: 96, flexShrink: 0 }}>
      <svg width={96} height={96} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={48} cy={48} r={r} fill="none" stroke="#f1f5f9" strokeWidth={8} />
        <circle
          cx={48}
          cy={48}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeDasharray={`${pct * c} ${c}`}
          strokeLinecap="round"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>
          {score}
        </span>
        <span style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8" }}>{label}</span>
      </div>
    </div>
  );
}

function RiskMatrix({ risks }: { risks: ProjectRisk[] }) {
  const cells = Array.from({ length: 5 }, (_, row) =>
    Array.from({ length: 5 }, (_, col) => {
      const p = col + 1;
      const i = 5 - row;
      const here = risks.filter((r) => r.probability === p && r.impact === i);
      const score = p * i;
      const bg = score >= 15 ? "#fef2f2" : score >= 8 ? "#fffbeb" : "#f0fdf4";
      const border = score >= 15 ? "#fecaca" : score >= 8 ? "#fde68a" : "#bbf7d0";
      return { p, i, risks: here, bg, border };
    })
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
        <span
          style={{
            fontSize: 10,
            color: "#94a3b8",
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            marginRight: 4,
          }}
        >
          IMPACT →
        </span>
        <div style={{ flex: 1 }}>
          {cells.map((row, ri) => (
            <div key={ri} style={{ display: "flex", gap: 3, marginBottom: 3 }}>
              {row.map((cell, ci) => (
                <div
                  key={ci}
                  style={{
                    flex: 1,
                    aspectRatio: "1",
                    borderRadius: 6,
                    background: cell.bg,
                    border: `1px solid ${cell.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    minHeight: 32,
                  }}
                >
                  {cell.risks.length > 0 && (
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background:
                          cell.risks[0].level === "high"
                            ? "#ef4444"
                            : cell.risks[0].level === "medium"
                            ? "#f59e0b"
                            : "#22c55e",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 9,
                        fontWeight: 800,
                        color: "white",
                      }}
                    >
                      {cell.risks.length}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
          <div style={{ display: "flex", gap: 3, marginTop: 2 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} style={{ flex: 1, textAlign: "center", fontSize: 10, color: "#94a3b8" }}>
                {n}
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
            PROBABILITY →
          </p>
        </div>
      </div>
    </div>
  );
}

function MiniGantt({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "20px 0", color: "#94a3b8", fontSize: 13 }}>
        No timeline events ·{" "}
        <Link
          href="#"
          style={{ color: "#7c3aed", textDecoration: "none", fontWeight: 600 }}
        >
          Add one
        </Link>
      </div>
    );
  }

  const dates = events.flatMap((e) => [
    new Date(e.start_date),
    e.end_date ? new Date(e.end_date) : new Date(e.start_date),
  ]);
  const min = new Date(Math.min(...dates.map((d) => d.getTime())));
  const max = new Date(Math.max(...dates.map((d) => d.getTime())));
  const range = max.getTime() - min.getTime() || 1;
  const pct = (d: string) =>
    Math.max(0, Math.min(100, ((new Date(d).getTime() - min.getTime()) / range) * 100));
  const todayPct = Math.max(
    0,
    Math.min(100, ((Date.now() - min.getTime()) / range) * 100)
  );

  const TYPE_COLOR: Record<string, string> = {
    phase: "#7c3aed",
    milestone: "#f59e0b",
    review: "#3b82f6",
    delivery: "#22c55e",
  };

  const STATUS_BG: Record<string, string> = {
    completed: "#22c55e",
    in_progress: "#3b82f6",
    delayed: "#ef4444",
    planned: "#94a3b8",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {events.slice(0, 5).map((ev) => {
        const left = pct(ev.start_date);
        const right = pct(ev.end_date || ev.start_date);
        const width = Math.max(right - left, 2);
        const color = TYPE_COLOR[ev.type] ?? "#7c3aed";

        return (
          <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 110, flexShrink: 0 }}>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#1e293b",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {ev.title}
              </p>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: STATUS_BG[ev.status] ?? "#94a3b8",
                  }}
                />
                <span style={{ fontSize: 10, color: "#94a3b8" }}>
                  {ev.status.replace("_", " ")}
                </span>
              </div>
            </div>

            <div
              style={{
                flex: 1,
                height: 22,
                background: "#f8fafc",
                borderRadius: 6,
                position: "relative",
                overflow: "visible",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: `${todayPct}%`,
                  top: -3,
                  bottom: -3,
                  width: 1.5,
                  background: "#ef444470",
                  zIndex: 2,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: `${left}%`,
                  width: `${width}%`,
                  height: 22,
                  background: color,
                  borderRadius: 5,
                  opacity: 0.85,
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 6,
                  minWidth: 6,
                }}
              >
                {width > 10 && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "white",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {new Date(ev.start_date).toLocaleDateString("nl-NL", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <div style={{ display: "flex", gap: 12, marginTop: 4, flexWrap: "wrap" }}>
        {[
          ["phase", "#7c3aed"],
          ["milestone", "#f59e0b"],
          ["review", "#3b82f6"],
          ["delivery", "#22c55e"],
        ].map(([type, color]) => (
          <div key={type} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: color as string }} />
            <span style={{ fontSize: 10, color: "#94a3b8" }}>{type}</span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 10, height: 2, background: "#ef4444", opacity: 0.5 }} />
          <span style={{ fontSize: 10, color: "#94a3b8" }}>today</span>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  subtext,
  iconBg,
  iconColor,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtext?: string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e8eaf0",
        borderRadius: 16,
        padding: 16,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: iconColor,
          }}
        >
          {icon}
        </div>
      </div>
      <p style={{ marginTop: 14, fontSize: 12, fontWeight: 700, color: "#64748b" }}>{title}</p>
      <p style={{ marginTop: 4, fontSize: 28, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
        {value}
      </p>
      {subtext && <p style={{ marginTop: 8, fontSize: 11, color: "#94a3b8" }}>{subtext}</p>}
    </div>
  );
}

export default function ProjectDashboardPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [risks, setRisks] = useState<ProjectRisk[]>([]);
  const [actions, setActions] = useState<RiskAction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadDashboard(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setErrorMessage("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const [{ data: pd }, { data: rd }, { data: ad }, { data: nd }, { data: sd }, { data: td }] =
        await Promise.all([
          supabase
            .from("projects")
            .select("id,name,status,description,project_value,start_date,end_date,client_name")
            .eq("id", projectId)
            .single(),

          supabase
            .from("project_risks")
            .select(
              "id,risk_code,title,category,probability,impact,score,level,status,phase,due_review_date,created_at,updated_at"
            )
            .eq("project_id", projectId)
            .order("score", { ascending: false }),

          supabase
            .from("risk_actions")
            .select("id,title,status,priority,due_date,created_at")
            .eq("project_id", projectId)
            .order("created_at", { ascending: false }),

          supabase
            .from("notifications")
            .select("id,title,body,is_read,created_at")
            .eq("user_id", user.id)
            .eq("project_id", projectId)
            .order("created_at", { ascending: false })
            .limit(8),

          supabase.from("project_stakeholders").select("id,name").eq("project_id", projectId),

          supabase
            .from("project_timeline")
            .select("id,title,type,status,start_date,end_date")
            .eq("project_id", projectId)
            .order("start_date", { ascending: true }),
        ]);

      if (pd) setProject(pd as Project);
      setRisks((rd ?? []) as ProjectRisk[]);
      setActions((ad ?? []) as RiskAction[]);
      setNotifications((nd ?? []) as Notification[]);
      setStakeholders((sd ?? []) as Stakeholder[]);
      setTimeline((td ?? []) as TimelineEvent[]);
    } catch (e: any) {
      setErrorMessage(e?.message || "Load error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    if (projectId) loadDashboard();
  }, [projectId]);

  const stats = useMemo(() => {
    const totalRisks = risks.length;
    const highRisks = risks.filter((r) => r.level === "high").length;
    const mediumRisks = risks.filter((r) => r.level === "medium").length;
    const lowRisks = risks.filter((r) => r.level === "low").length;
    const openActions = actions.filter(
      (a) => a.status === "open" || a.status === "in_progress"
    ).length;
    const overdueActions = actions.filter(
      (a) => a.due_date && a.status !== "done" && new Date(a.due_date).getTime() < Date.now()
    ).length;
    const completedActions = actions.filter((a) => a.status === "done").length;
    const upcomingReviews = risks.filter((r) => {
      if (!r.due_review_date) return false;
      const d = new Date(r.due_review_date).getTime();
      return d >= Date.now() && d <= Date.now() + 14 * 86400000;
    }).length;
    const unreadNotifications = notifications.filter((n) => !n.is_read).length;
    const avgScore = totalRisks > 0 ? risks.reduce((s, r) => s + r.score, 0) / totalRisks : 0;
    const avgRiskScore = avgScore.toFixed(1);
    const projectDays =
      project?.start_date && project?.end_date
        ? Math.ceil(
            (new Date(project.end_date).getTime() - new Date(project.start_date).getTime()) /
              86400000
          )
        : null;
    const daysLeft = project?.end_date
      ? Math.ceil((new Date(project.end_date).getTime() - Date.now()) / 86400000)
      : null;

    return {
      totalRisks,
      highRisks,
      mediumRisks,
      lowRisks,
      openActions,
      overdueActions,
      completedActions,
      upcomingReviews,
      unreadNotifications,
      avgRiskScore,
      avgScore,
      totalStakeholders: stakeholders.length,
      projectDays,
      daysLeft,
    };
  }, [risks, actions, notifications, stakeholders, project]);

  const topRisks = useMemo(() => risks.slice(0, 5), [risks]);

  const urgentActions = useMemo(
    () =>
      [...actions]
        .filter((a) => {
          const overdue =
            a.due_date && a.status !== "done"
              ? new Date(a.due_date).getTime() < Date.now()
              : false;
          return overdue || a.priority === "critical" || a.priority === "high";
        })
        .slice(0, 5),
    [actions]
  );

  const categoryDist = useMemo(() => {
    const map = new Map<string, number>();
    risks.forEach((r) => {
      const key = r.category || "Uncategorized";
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [risks]);

  const projectInsights = useMemo(() => {
    return buildProjectInsights({
      projectId,
      risks,
      actions,
      notifications,
      stakeholders,
      timeline,
    });
  }, [projectId, risks, actions, notifications, stakeholders, timeline]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          padding: 40,
        }}
      >
        <Loader2
          style={{
            height: 24,
            width: 24,
            color: "#7c3aed",
            animation: "spin 1s linear infinite",
          }}
        />
      </div>
    );
  }

  const scoreNum = parseFloat(stats.avgRiskScore);
  const scoreColor = scoreNum >= 15 ? "#ef4444" : scoreNum >= 8 ? "#f59e0b" : "#22c55e";
  const scoreLabel = scoreNum >= 15 ? "High" : scoreNum >= 8 ? "Medium" : "Low";

  return (
    <div style={{ padding: "24px 24px 48px", background: "#f4f5fa", minHeight: "100%" }}>
      <div
        style={{
          background: "linear-gradient(135deg, #1e2140 0%, #2d1f6e 50%, #1e2140 100%)",
          borderRadius: 20,
          padding: "28px 32px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
          flexWrap: "wrap",
          boxShadow: "0 8px 32px rgba(30,33,64,0.25)",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255,255,255,0.12)",
              borderRadius: 20,
              padding: "4px 12px",
              marginBottom: 12,
            }}
          >
            <Shield style={{ height: 12, width: 12, color: "rgba(255,255,255,0.7)" }} />
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "rgba(255,255,255,0.7)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Project Overview
            </span>
          </div>

          <h1
            style={{
              fontSize: 36,
              fontWeight: 800,
              color: "white",
              letterSpacing: "-0.03em",
              marginBottom: 8,
              lineHeight: 1.1,
            }}
          >
            {project?.name || "Dashboard"}
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            {project?.client_name && (
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                Client: <strong style={{ color: "white" }}>{project.client_name}</strong>
              </span>
            )}

            {project?.project_value && (
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                Value: <strong style={{ color: "#a78bfa" }}>{fmtEur(project.project_value)}</strong>
              </span>
            )}

            {stats.daysLeft !== null && (
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                Time left:{" "}
                <strong style={{ color: "white" }}>
                  {stats.daysLeft > 0 ? `${stats.daysLeft} days` : "Deadline passed"}
                </strong>
              </span>
            )}
          </div>

          {project?.description && (
            <p
              style={{
                marginTop: 14,
                color: "rgba(255,255,255,0.72)",
                fontSize: 14,
                lineHeight: 1.6,
                maxWidth: 760,
              }}
            >
              {project.description}
            </p>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <ScoreRing score={scoreNum} />
          <button
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
            style={{
              height: 42,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.08)",
              color: "white",
              padding: "0 14px",
              fontSize: 13,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
            }}
          >
            <RefreshCw
              style={{
                width: 15,
                height: 15,
                animation: refreshing ? "spin 1s linear infinite" : undefined,
              }}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div
          style={{
            marginBottom: 16,
            border: "1px solid #fecaca",
            background: "#fef2f2",
            color: "#b91c1c",
            borderRadius: 14,
            padding: "12px 14px",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {errorMessage}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: 14,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            background: "white",
            border: "1px solid #e8eaf0",
            borderRadius: 16,
            padding: 18,
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: "#f5f3ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShieldAlert style={{ width: 16, height: 16, color: "#7c3aed" }} />
              </div>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0 }}>
                  Project Insights
                </h2>
                <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>
                  Automated control checks based on risks, actions, reviews and timeline status
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {projectInsights.map((insight) => {
              const tone = getInsightStyles(insight.severity);

              return (
                <div
                  key={insight.id}
                  style={{
                    border: `1px solid ${tone.border}`,
                    background: tone.bg,
                    borderRadius: 14,
                    padding: 14,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 10,
                    }}
                  >
                    <div style={{ display: "flex", gap: 10 }}>
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 10,
                          background: tone.iconBg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Zap style={{ width: 15, height: 15, color: tone.iconColor }} />
                      </div>

                      <div>
                        <p style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", margin: 0 }}>
                          {insight.title}
                        </p>
                        <p
                          style={{
                            fontSize: 12,
                            color: "#475569",
                            margin: "5px 0 0",
                            lineHeight: 1.45,
                          }}
                        >
                          {insight.description}
                        </p>

                        {insight.href && insight.ctaLabel ? (
                          <Link
                            href={insight.href}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              marginTop: 8,
                              color: "#6d28d9",
                              fontSize: 12,
                              fontWeight: 700,
                              textDecoration: "none",
                            }}
                          >
                            {insight.ctaLabel}
                            <ArrowRight style={{ width: 13, height: 13 }} />
                          </Link>
                        ) : null}
                      </div>
                    </div>

                    {insight.stat ? (
                      <div
                        style={{
                          padding: "5px 8px",
                          borderRadius: 999,
                          background: tone.pillBg,
                          color: tone.pillColor,
                          fontSize: 11,
                          fontWeight: 800,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {insight.stat}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div
          style={{
            background: "white",
            border: "1px solid #e8eaf0",
            borderRadius: 16,
            padding: 18,
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: "#eff6ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TrendingUp style={{ width: 16, height: 16, color: "#2563eb" }} />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0 }}>
                Recommended next step
              </h2>
              <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>
                Focus the team on the biggest control gap first
              </p>
            </div>
          </div>

          <div
            style={{
              borderRadius: 14,
              background: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)",
              border: "1px solid #dbeafe",
              padding: 16,
            }}
          >
            <p
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: "#1d4ed8",
                margin: 0,
                marginBottom: 8,
              }}
            >
              Suggested action
            </p>
            <p style={{ fontSize: 13, lineHeight: 1.55, color: "#334155", margin: 0 }}>
              {projectInsights[0]?.severity === "critical"
                ? "Resolve the top critical issue first before adding new mitigation tasks."
                : projectInsights[0]?.severity === "warning"
                ? "Clear the current warning items to stabilize project controls."
                : "Project health is stable. Keep reviews and action ownership up to date."}
            </p>
          </div>

          <div
            style={{
              marginTop: 14,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}
          >
            <Link
              href={`/app/projects/${projectId}/risk-register`}
              style={{
                borderRadius: 12,
                background: "#7c3aed",
                color: "white",
                textDecoration: "none",
                fontSize: 12,
                fontWeight: 700,
                padding: "11px 12px",
                textAlign: "center",
              }}
            >
              Open risk register
            </Link>

            <Link
              href={`/app/projects/${projectId}/actions`}
              style={{
                borderRadius: 12,
                background: "#f8fafc",
                color: "#334155",
                textDecoration: "none",
                fontSize: 12,
                fontWeight: 700,
                padding: "11px 12px",
                textAlign: "center",
                border: "1px solid #e2e8f0",
              }}
            >
              Review actions
            </Link>
          </div>

          <div
            style={{
              marginTop: 16,
              borderTop: "1px solid #f1f5f9",
              paddingTop: 14,
              display: "grid",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: "#64748b" }}>Average risk score</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: scoreColor }}>
                {stats.avgRiskScore} · {scoreLabel}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: "#64748b" }}>Stakeholders linked</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#0f172a" }}>
                {stats.totalStakeholders}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: "#64748b" }}>Upcoming reviews</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#0f172a" }}>
                {stats.upcomingReviews}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap: 12,
          marginBottom: 18,
        }}
      >
        <StatCard
          icon={<AlertTriangle style={{ width: 18, height: 18 }} />}
          title="Total Risks"
          value={stats.totalRisks}
          subtext={`${stats.highRisks} high · ${stats.mediumRisks} medium · ${stats.lowRisks} low`}
          iconBg="#fef2f2"
          iconColor="#ef4444"
        />
        <StatCard
          icon={<ClipboardList style={{ width: 18, height: 18 }} />}
          title="Open Actions"
          value={stats.openActions}
          subtext={`${stats.completedActions} completed`}
          iconBg="#eff6ff"
          iconColor="#2563eb"
        />
        <StatCard
          icon={<Clock style={{ width: 18, height: 18 }} />}
          title="Overdue Actions"
          value={stats.overdueActions}
          subtext="Immediate follow-up needed"
          iconBg="#fff7ed"
          iconColor="#d97706"
        />
        <StatCard
          icon={<Users style={{ width: 18, height: 18 }} />}
          title="Stakeholders"
          value={stats.totalStakeholders}
          subtext="Assigned to this project"
          iconBg="#f0fdf4"
          iconColor="#16a34a"
        />
        <StatCard
          icon={<Bell style={{ width: 18, height: 18 }} />}
          title="Unread Alerts"
          value={stats.unreadNotifications}
          subtext={`${stats.upcomingReviews} reviews due soon`}
          iconBg="#f5f3ff"
          iconColor="#7c3aed"
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 0.9fr 0.9fr",
          gap: 14,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            background: "white",
            border: "1px solid #e8eaf0",
            borderRadius: 16,
            padding: 18,
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}
          >
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Top Risks</h3>
              <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                Highest scoring items in the register
              </p>
            </div>
            <Link
              href={`/app/projects/${projectId}/risk-register`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                fontSize: 12,
                color: "#7c3aed",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              View all <ArrowRight style={{ height: 11, width: 11 }} />
            </Link>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {topRisks.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8", fontSize: 13 }}>
                No risks added yet
              </div>
            ) : (
              topRisks.map((risk) => {
                const levelColor =
                  risk.level === "high"
                    ? "#ef4444"
                    : risk.level === "medium"
                    ? "#f59e0b"
                    : "#22c55e";

                return (
                  <div
                    key={risk.id}
                    style={{
                      border: "1px solid #f1f5f9",
                      borderRadius: 12,
                      padding: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#0f172a",
                          margin: 0,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {risk.title}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 5, flexWrap: "wrap" }}>
                        {risk.category && (
                          <span style={{ fontSize: 11, color: "#64748b" }}>{risk.category}</span>
                        )}
                        {risk.phase && (
                          <span style={{ fontSize: 11, color: "#94a3b8" }}>{risk.phase}</span>
                        )}
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>
                          Review: {risk.due_review_date ? timeAgo(risk.due_review_date) : "not set"}
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div
                        style={{
                          borderRadius: 999,
                          background: `${levelColor}15`,
                          color: levelColor,
                          fontSize: 11,
                          fontWeight: 800,
                          padding: "5px 8px",
                        }}
                      >
                        {risk.score} · {risk.level}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div
          style={{
            background: "white",
            border: "1px solid #e8eaf0",
            borderRadius: 16,
            padding: 18,
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}
          >
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Risk Matrix</h3>
              <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                Probability × impact overview
              </p>
            </div>
            <Target style={{ width: 15, height: 15, color: "#94a3b8" }} />
          </div>

          <RiskMatrix risks={risks} />

          <div
            style={{
              marginTop: 14,
              borderTop: "1px solid #f1f5f9",
              paddingTop: 12,
              display: "grid",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ color: "#64748b" }}>Average score</span>
              <span style={{ fontWeight: 800, color: scoreColor }}>{stats.avgRiskScore}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ color: "#64748b" }}>Overall exposure</span>
              <span style={{ fontWeight: 800, color: scoreColor }}>{scoreLabel}</span>
            </div>
          </div>
        </div>

        <div
          style={{
            background: "white",
            border: "1px solid #e8eaf0",
            borderRadius: 16,
            padding: 18,
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}
          >
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Urgent Actions</h3>
              <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                Overdue or high-priority actions
              </p>
            </div>
            <Link
              href={`/app/projects/${projectId}/actions`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                fontSize: 12,
                color: "#7c3aed",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              View all <ArrowRight style={{ height: 11, width: 11 }} />
            </Link>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {urgentActions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8", fontSize: 13 }}>
                No urgent actions
              </div>
            ) : (
              urgentActions.map((action) => {
                const overdue = action.due_date && action.status !== "done" && isOverdue(action.due_date);

                return (
                  <div
                    key={action.id}
                    style={{
                      border: "1px solid #f1f5f9",
                      borderRadius: 12,
                      padding: 12,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#0f172a",
                        margin: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {action.title}
                    </p>

                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          borderRadius: 999,
                          padding: "4px 8px",
                          background:
                            action.priority === "critical"
                              ? "#fef2f2"
                              : action.priority === "high"
                              ? "#fff7ed"
                              : "#f8fafc",
                          color:
                            action.priority === "critical"
                              ? "#dc2626"
                              : action.priority === "high"
                              ? "#d97706"
                              : "#475569",
                        }}
                      >
                        {action.priority}
                      </span>

                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          borderRadius: 999,
                          padding: "4px 8px",
                          background:
                            action.status === "done"
                              ? "#f0fdf4"
                              : action.status === "blocked"
                              ? "#fef2f2"
                              : "#eff6ff",
                          color:
                            action.status === "done"
                              ? "#16a34a"
                              : action.status === "blocked"
                              ? "#dc2626"
                              : "#2563eb",
                        }}
                      >
                        {action.status}
                      </span>

                      {overdue && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            borderRadius: 999,
                            padding: "4px 8px",
                            background: "#fef2f2",
                            color: "#dc2626",
                          }}
                        >
                          overdue
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            background: "white",
            border: "1px solid #e8eaf0",
            borderRadius: 16,
            padding: 18,
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}
          >
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Risk Categories</h3>
              <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                Distribution of current risk register
              </p>
            </div>
            <TrendingUp style={{ width: 15, height: 15, color: "#94a3b8" }} />
          </div>

          {categoryDist.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8", fontSize: 13 }}>
              No categories yet
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {categoryDist.map((item, idx) => {
                const pct = stats.totalRisks > 0 ? (item.count / stats.totalRisks) * 100 : 0;
                const color = ["#7c3aed", "#3b82f6", "#22c55e", "#f59e0b", "#ef4444"][idx % 5];

                return (
                  <div key={item.label}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>
                        {item.label}
                      </span>
                      <span style={{ fontSize: 12, color: "#64748b" }}>{item.count}</span>
                    </div>
                    <div
                      style={{
                        height: 8,
                        background: "#f1f5f9",
                        borderRadius: 999,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${pct}%`,
                          height: "100%",
                          background: color,
                          borderRadius: 999,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div
          style={{
            background: "white",
            border: "1px solid #e8eaf0",
            borderRadius: 16,
            padding: 18,
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}
          >
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Project Timeline</h3>
              <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                Milestones and review moments
              </p>
            </div>
            <Link
              href={`/app/projects/${projectId}/project-timeline`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                fontSize: 12,
                color: "#7c3aed",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Open timeline <ArrowRight style={{ height: 11, width: 11 }} />
            </Link>
          </div>

          <MiniGantt events={timeline} />
        </div>
      </div>

      <div
        style={{
          background: "white",
          border: "1px solid #e8eaf0",
          borderRadius: 16,
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "18px 18px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #f8fafc",
          }}
        >
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Recent Activity</h3>
            <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>Latest project alerts</p>
          </div>
          <Link
            href={`/app/projects/${projectId}/notifications`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              fontSize: 12,
              color: "#7c3aed",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            View all <ArrowRight style={{ height: 11, width: 11 }} />
          </Link>
        </div>

        <div style={{ padding: "6px 0" }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8", fontSize: 13 }}>
              No notifications yet
            </div>
          ) : (
            notifications.slice(0, 6).map((n, i) => (
              <div
                key={n.id}
                style={{
                  display: "flex",
                  gap: 12,
                  padding: "9px 18px",
                  borderBottom: i < Math.min(notifications.length, 6) - 1 ? "1px solid #f8fafc" : "none",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: n.is_read ? "#e2e8f0" : "#7c3aed",
                    flexShrink: 0,
                    marginTop: 4,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: n.is_read ? 400 : 600,
                      color: n.is_read ? "#64748b" : "#1e293b",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {n.title}
                  </p>
                  {n.body && (
                    <p
                      style={{
                        fontSize: 11,
                        color: "#94a3b8",
                        marginTop: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {n.body}
                    </p>
                  )}
                  <p style={{ fontSize: 10, color: "#cbd5e1", marginTop: 2 }}>{timeAgo(n.created_at)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}