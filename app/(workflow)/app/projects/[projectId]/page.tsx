"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowRight,
  Bell,
  Briefcase,
  Building2,
  CalendarDays,
  FileWarning,
  Loader2,
  MapPin,
  Wrench,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type Project = {
  id: string;
  name: string;
  status?: string | null;
  project_code?: string | null;
  description?: string | null;
  client_name?: string | null;
  project_type?: string | null;
  contract_type?: string | null;
  project_value?: number | string | null;
  start_date?: string | null;
  end_date?: string | null;
  country?: string | null;
  region?: string | null;
  city?: string | null;
  site_type?: string | null;
  permit_required?: boolean | null;
  intake_method?: string | null;
  project_phase?: string | null;
  planning_notes?: string | null;
  critical_dependencies?: string | null;
  main_contractor?: string | null;
};

type ProjectRisk = {
  id: string;
  project_id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  probability?: number | null;
  impact?: number | null;
  score?: number | null;
  level?: string | null;
  status?: string | null;
  phase?: string | null;
  due_review_date?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
  suggested_action?: string | null;
};

type RiskAction = {
  id: string;
  project_id: string;
  risk_id?: string | null;
  title: string;
  description?: string | null;
  status?: string | null;
  priority?: string | null;
  due_date?: string | null;
  completed_at?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
};

type Stakeholder = {
  id: string;
  project_id: string;
  name: string;
  organization?: string | null;
  role?: string | null;
};

type TimelineEvent = {
  id: string;
  project_id: string;
  title: string;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  type?: string | null;
  status?: string | null;
};

type Notification = {
  id: string;
  project_id?: string | null;
  title?: string | null;
  message?: string | null;
  is_read?: boolean | null;
  created_at?: string | null;
};

function fmtDate(v?: string | null) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("nl-NL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtShort(v?: string | null) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("nl-NL", {
    day: "2-digit",
    month: "short",
  });
}

function timeAgo(v?: string | null) {
  if (!v) return "—";
  const diff = Math.floor((Date.now() - new Date(v).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatMoney(v?: number | string | null) {
  if (v === null || v === undefined || v === "") return "—";
  const num = typeof v === "number" ? v : Number(String(v).replace(/[^\d.-]/g, ""));
  if (Number.isNaN(num)) return String(v);
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(num);
}

function compactMoney(v?: number | string | null) {
  if (v === null || v === undefined || v === "") return "—";
  const num = typeof v === "number" ? v : Number(String(v).replace(/[^\d.-]/g, ""));
  if (Number.isNaN(num)) return String(v);
  if (num >= 1_000_000) return `€ ${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1000) return `€ ${(num / 1000).toFixed(0)}K`;
  return `€ ${num}`;
}

function isOverdue(date?: string | null) {
  if (!date) return false;
  return new Date(date).getTime() < Date.now();
}

function daysUntil(date?: string | null) {
  if (!date) return null;
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
}

function normalizeLevel(level?: string | null, score?: number | null) {
  const raw = String(level ?? "").trim().toLowerCase();

  if (["critical", "kritiek", "urgent"].includes(raw)) return "critical";
  if (["high", "hoog"].includes(raw)) return "high";
  if (["medium", "middel", "gemiddeld"].includes(raw)) return "medium";
  if (["low", "laag"].includes(raw)) return "low";

  if (typeof score === "number") {
    if (score >= 15) return "critical";
    if (score >= 9) return "high";
    if (score >= 5) return "medium";
    return "low";
  }

  return "medium";
}

function levelStyle(level: string) {
  switch (level) {
    case "critical":
      return { text: "#b91c1c", bg: "#fef2f2", border: "#fecaca", dot: "#ef4444" };
    case "high":
      return { text: "#c2410c", bg: "#fff7ed", border: "#fdba74", dot: "#f97316" };
    case "medium":
      return { text: "#a16207", bg: "#fefce8", border: "#fde68a", dot: "#eab308" };
    case "low":
      return { text: "#15803d", bg: "#f0fdf4", border: "#86efac", dot: "#22c55e" };
    default:
      return { text: "#334155", bg: "#f8fafc", border: "#e2e8f0", dot: "#64748b" };
  }
}

function getProjectRange(project: Project | null, timeline: TimelineEvent[]) {
  const values: number[] = [];

  if (project?.start_date) values.push(new Date(project.start_date).getTime());
  if (project?.end_date) values.push(new Date(project.end_date).getTime());

  timeline.forEach((item) => {
    if (item.start_date) values.push(new Date(item.start_date).getTime());
    if (item.end_date) values.push(new Date(item.end_date).getTime());
  });

  const valid = values.filter((v) => !Number.isNaN(v)).sort((a, b) => a - b);

  if (!valid.length) {
    const now = new Date();
    return {
      min: new Date(now.getFullYear(), now.getMonth(), 1),
      max: new Date(now.getFullYear(), now.getMonth() + 5, 0),
    };
  }

  const min = new Date(valid[0]);
  const max = new Date(valid[valid.length - 1]);
  min.setDate(1);
  max.setMonth(max.getMonth() + 1);
  max.setDate(0);

  return { min, max };
}

function pctPos(dateStr: string, min: Date, max: Date) {
  const d = new Date(dateStr).getTime();
  const start = min.getTime();
  const end = max.getTime();
  if (Number.isNaN(d) || end <= start) return 0;
  return ((d - start) / (end - start)) * 100;
}

function clamp(num: number, min: number, max: number) {
  return Math.max(min, Math.min(max, num));
}

function getMonthMarkers(min: Date, max: Date) {
  const markers: { label: string; pct: number }[] = [];
  const d = new Date(min);
  d.setDate(1);

  while (d <= max) {
    markers.push({
      label: d.toLocaleDateString("nl-NL", { month: "short", year: "2-digit" }),
      pct: pctPos(d.toISOString(), min, max),
    });
    d.setMonth(d.getMonth() + 1);
  }

  return markers;
}

function StatsCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
}) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        padding: 16,
        minHeight: 108,
      }}
    >
      <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>{title}</div>
      <div style={{ marginTop: 10, fontSize: 30, lineHeight: 1, fontWeight: 800, color: "#0f172a" }}>
        {value}
      </div>
      {subtitle ? (
        <div style={{ marginTop: 10, fontSize: 12, color: "#64748b", lineHeight: 1.4 }}>{subtitle}</div>
      ) : null}
    </div>
  );
}

function Section({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: 20,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "16px 18px",
          borderBottom: "1px solid #eef2f7",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>{title}</div>
          {subtitle ? (
            <div style={{ marginTop: 4, fontSize: 12, color: "#64748b" }}>{subtitle}</div>
          ) : null}
        </div>
        {right}
      </div>
      <div style={{ padding: 18 }}>{children}</div>
    </div>
  );
}

function RiskMatrix({ risks }: { risks: ProjectRisk[] }) {
  const cells = Array.from({ length: 5 }, (_, row) =>
    Array.from({ length: 5 }, (_, col) => {
      const probability = col + 1;
      const impact = 5 - row;
      const here = risks.filter(
        (r) => r.probability === probability && r.impact === impact
      );
      const score = probability * impact;

      const bg = score >= 15 ? "#fef2f2" : score >= 8 ? "#fffbeb" : "#f0fdf4";
      const border = score >= 15 ? "#fecaca" : score >= 8 ? "#fde68a" : "#bbf7d0";

      return { probability, impact, here, bg, border };
    })
  );

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "24px repeat(5, 1fr)",
          gap: 8,
          alignItems: "center",
        }}
      >
        <div />
        {[1, 2, 3, 4, 5].map((p) => (
          <div
            key={`prob-${p}`}
            style={{
              textAlign: "center",
              fontSize: 11,
              color: "#64748b",
              fontWeight: 700,
            }}
          >
            {p}
          </div>
        ))}

        {cells.map((row, rIdx) => (
          <Fragment key={`row-${rIdx}`}>
            <div
              style={{
                fontSize: 11,
                color: "#64748b",
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              {5 - rIdx}
            </div>

            {row.map((cell) => (
              <div
                key={`cell-${cell.probability}-${cell.impact}`}
                style={{
                  minHeight: 56,
                  borderRadius: 12,
                  border: `1px solid ${cell.border}`,
                  background: cell.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
                  {cell.here.length}
                </div>
                <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700 }}>
                  P{cell.probability} × I{cell.impact}
                </div>
              </div>
            ))}
          </Fragment>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 10,
          fontSize: 11,
          color: "#64748b",
          fontWeight: 700,
        }}
      >
        <span>Impact ↑</span>
        <span>Probability →</span>
      </div>
    </div>
  );
}

function CompactTimeline({
  project,
  timeline,
  risks,
}: {
  project: Project | null;
  timeline: TimelineEvent[];
  risks: ProjectRisk[];
}) {
  const range = useMemo(() => getProjectRange(project, timeline), [project, timeline]);
  const markers = useMemo(() => getMonthMarkers(range.min, range.max), [range.min, range.max]);

  const phases = useMemo(
    () =>
      timeline
        .filter((t) => (t.type ?? "phase").toLowerCase() === "phase")
        .sort((a, b) => String(a.start_date ?? "").localeCompare(String(b.start_date ?? "")))
        .slice(0, 6),
    [timeline]
  );

  const topRisks = useMemo(
    () =>
      [...risks]
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
        .slice(0, 4),
    [risks]
  );

  const todayPct = clamp(pctPos(new Date().toISOString(), range.min, range.max), 0, 100);

  return (
    <div>
      <div style={{ display: "flex", marginBottom: 10, paddingLeft: 180 }}>
        <div style={{ flex: 1, position: "relative", height: 18 }}>
          {markers.map((m, i) => (
            <span
              key={`marker-${i}`}
              style={{
                position: "absolute",
                left: `calc(${m.pct}% - 10px)`,
                fontSize: 10,
                color: "#94a3b8",
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              {m.label}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {phases.map((phase) => {
          const left = phase.start_date ? pctPos(phase.start_date, range.min, range.max) : 0;
          const right = phase.end_date ? pctPos(phase.end_date, range.min, range.max) : left + 8;
          const width = Math.max(6, right - left);

          return (
            <div key={phase.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 170, flexShrink: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{phase.title}</div>
                <div style={{ marginTop: 3, fontSize: 11, color: "#64748b" }}>
                  {fmtShort(phase.start_date)} — {fmtShort(phase.end_date)}
                </div>
              </div>

              <div
                style={{
                  position: "relative",
                  flex: 1,
                  height: 24,
                  borderRadius: 999,
                  background: "#f8fafc",
                  border: "1px solid #eef2f7",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: `${todayPct}%`,
                    top: 0,
                    bottom: 0,
                    width: 2,
                    background: "#ef4444",
                    opacity: 0.35,
                  }}
                />
                {markers.map((m, i) => (
                  <div
                    key={`grid-${i}`}
                    style={{
                      position: "absolute",
                      left: `${m.pct}%`,
                      top: 0,
                      bottom: 0,
                      width: 1,
                      background: "#eef2f7",
                    }}
                  />
                ))}
                <div
                  style={{
                    position: "absolute",
                    left: `${left}%`,
                    width: `${width}%`,
                    top: 4,
                    height: 14,
                    minWidth: 12,
                    borderRadius: 999,
                    background: "#4f46e5",
                  }}
                />
              </div>
            </div>
          );
        })}

        {topRisks.length > 0 && (
          <div style={{ marginTop: 4, paddingTop: 12, borderTop: "1px solid #eef2f7" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#64748b", marginBottom: 10 }}>
              Risk pressure
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {topRisks.map((risk, idx) => {
                const phaseIndex = Math.max(
                  0,
                  phases.findIndex(
                    (p) => p.title.toLowerCase() === String(risk.phase ?? "").toLowerCase()
                  )
                );

                const left = phases.length ? (phaseIndex / phases.length) * 100 : idx * 18;
                const width = Math.max(12, 100 / Math.max(phases.length || 4, 4));
                const level = normalizeLevel(risk.level, risk.score);
                const s = levelStyle(level);

                return (
                  <div key={risk.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 170, flexShrink: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#0f172a",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {risk.title}
                      </div>
                      <div style={{ marginTop: 3, fontSize: 11, color: "#64748b" }}>
                        {risk.phase ?? "Project-wide"} · score {risk.score ?? "—"}
                      </div>
                    </div>

                    <div
                      style={{
                        position: "relative",
                        flex: 1,
                        height: 12,
                        borderRadius: 999,
                        background: "#f8fafc",
                        border: "1px solid #eef2f7",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          left: `${left}%`,
                          width: `${width}%`,
                          top: 0,
                          bottom: 0,
                          minWidth: 20,
                          borderRadius: 999,
                          background: s.dot,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProjectOverviewPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [risks, setRisks] = useState<ProjectRisk[]>([]);
  const [actions, setActions] = useState<RiskAction[]>([]);
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadPage() {
    if (!projectId) return;
    setLoading(true);

    const [
      projectRes,
      risksRes,
      actionsRes,
      stakeholdersRes,
      timelineRes,
      notificationsRes,
    ] = await Promise.all([
      supabase.from("projects").select("*").eq("id", projectId).single(),
      supabase
        .from("project_risks")
        .select("*")
        .eq("project_id", projectId)
        .order("score", { ascending: false }),
      supabase
        .from("risk_actions")
        .select("*")
        .eq("project_id", projectId)
        .order("due_date", { ascending: true }),
      supabase
        .from("project_stakeholders")
        .select("*")
        .eq("project_id", projectId)
        .order("name", { ascending: true }),
      supabase
        .from("project_timeline")
        .select("*")
        .eq("project_id", projectId)
        .order("start_date", { ascending: true }),
      supabase
        .from("notifications")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(12),
    ]);

    setProject((projectRes.data ?? null) as Project | null);
    setRisks((risksRes.data ?? []) as ProjectRisk[]);
    setActions((actionsRes.data ?? []) as RiskAction[]);
    setStakeholders((stakeholdersRes.data ?? []) as Stakeholder[]);
    setTimeline((timelineRes.data ?? []) as TimelineEvent[]);
    setNotifications((notificationsRes.data ?? []) as Notification[]);
    setLoading(false);
  }

  useEffect(() => {
    loadPage();
  }, [projectId]);

  const stats = useMemo(() => {
    const criticalRisks = risks.filter((r) => normalizeLevel(r.level, r.score) === "critical").length;
    const highRisks = risks.filter((r) => normalizeLevel(r.level, r.score) === "high").length;
    const mediumRisks = risks.filter((r) => normalizeLevel(r.level, r.score) === "medium").length;
    const lowRisks = risks.filter((r) => normalizeLevel(r.level, r.score) === "low").length;

    const openActions = actions.filter((a) => (a.status ?? "").toLowerCase() !== "done").length;
    const overdueActions = actions.filter(
      (a) => (a.status ?? "").toLowerCase() !== "done" && isOverdue(a.due_date)
    ).length;

    const upcomingReviews = risks.filter((r) => {
      const d = daysUntil(r.due_review_date);
      return d !== null && d >= 0 && d <= 14;
    }).length;

    const avgScore = risks.length
      ? risks.reduce((sum, r) => sum + (r.score ?? 0), 0) / risks.length
      : 0;

    const daysLeft = project?.end_date
      ? Math.ceil((new Date(project.end_date).getTime() - Date.now()) / 86400000)
      : null;

    return {
      totalRisks: risks.length,
      criticalRisks,
      highRisks,
      mediumRisks,
      lowRisks,
      openActions,
      overdueActions,
      upcomingReviews,
      unreadNotifications: notifications.filter((n) => !n.is_read).length,
      avgScore,
      totalStakeholders: stakeholders.length,
      daysLeft,
    };
  }, [risks, actions, notifications, stakeholders, project]);

  const topRisks = useMemo(() => risks.slice(0, 5), [risks]);

  const urgentActions = useMemo(
    () =>
      actions
        .filter((a) => {
          const st = (a.status ?? "").toLowerCase();
          return st === "blocked" || (st !== "done" && isOverdue(a.due_date)) || a.priority === "high";
        })
        .slice(0, 5),
    [actions]
  );

  const recentActivity = useMemo(() => {
    const merged = [
      ...notifications.map((n) => ({
        id: `n-${n.id}`,
        type: "notification" as const,
        title: n.title || "Notification",
        subtitle: n.message || "Project notification",
        at: n.created_at || new Date().toISOString(),
      })),
      ...actions.map((a) => ({
        id: `a-${a.id}`,
        type: "action" as const,
        title: a.title,
        subtitle: a.status ? `Action status: ${a.status}` : "Action updated",
        at: a.updated_at || a.created_at || new Date().toISOString(),
      })),
      ...risks.map((r) => ({
        id: `r-${r.id}`,
        type: "risk" as const,
        title: r.title,
        subtitle: r.status ? `Risk status: ${r.status}` : "Risk updated",
        at: r.updated_at || r.created_at || new Date().toISOString(),
      })),
    ];

    return merged
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, 8);
  }, [notifications, actions, risks]);

  const categoryDistribution = useMemo(() => {
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

  const mainInsight = useMemo(() => {
    if (stats.overdueActions > 0) {
      return {
        title: "Resolve overdue mitigation actions",
        body: `${stats.overdueActions} action${stats.overdueActions > 1 ? "s are" : " is"} overdue and should be closed first.`,
        cta: "Open actions",
        href: `/app/projects/${projectId}/actions`,
      };
    }

    if (stats.criticalRisks > 0 || stats.highRisks > 0) {
      return {
        title: "Run focused risk review",
        body: `${stats.criticalRisks + stats.highRisks} high-priority risk item${stats.criticalRisks + stats.highRisks > 1 ? "s are" : " is"} currently active.`,
        cta: "Open risk register",
        href: `/app/projects/${projectId}/risk-register`,
      };
    }

    if (stats.upcomingReviews > 0) {
      return {
        title: "Prepare scheduled review moments",
        body: `${stats.upcomingReviews} scheduled review${stats.upcomingReviews > 1 ? "s are" : " is"} due in the next 14 days.`,
        cta: "Plan review",
        href: `/app/projects/${projectId}/risk-register`,
      };
    }

    return {
      title: "Project control looks stable",
      body: "No urgent control gaps detected from current project data.",
      cta: "Open timeline",
      href: `/app/projects/${projectId}/project-timeline`,
    };
  }, [stats, projectId]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
        }}
      >
        <Loader2
          style={{
            width: 24,
            height: 24,
            color: "#4f46e5",
            animation: "spin 1s linear infinite",
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "10px 12px 24px 8px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "none",
          margin: 0,
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #111827 50%, #1e1b4b 100%)",
            borderRadius: 24,
            padding: 22,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.55fr) 320px",
              gap: 18,
              alignItems: "stretch",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.88)",
                  fontSize: 11,
                  fontWeight: 800,
                  marginBottom: 12,
                }}
              >
                Project Command Center
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <h1
                  style={{
                    margin: 0,
                    color: "white",
                    fontSize: 38,
                    lineHeight: 1.02,
                    fontWeight: 900,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {project?.name ?? "Project Overview"}
                </h1>

                <span
                  style={{
                    padding: "7px 11px",
                    borderRadius: 12,
                    background: "rgba(99,102,241,0.24)",
                    color: "#c7d2fe",
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  {project?.project_phase ?? project?.status ?? "Active"}
                </span>
              </div>

              <div
                style={{
                  marginTop: 10,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 14,
                  color: "rgba(255,255,255,0.74)",
                  fontSize: 12,
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <Building2 style={{ width: 12, height: 12 }} />
                  {project?.client_name ?? "Unknown client"}
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <MapPin style={{ width: 12, height: 12 }} />
                  {project?.city ?? project?.region ?? "Unknown location"}
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <Briefcase style={{ width: 12, height: 12 }} />
                  {project?.project_type ?? "Project"}
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <CalendarDays style={{ width: 12, height: 12 }} />
                  {fmtDate(project?.start_date)} — {fmtDate(project?.end_date)}
                </span>
              </div>

              <div
                style={{
                  marginTop: 18,
                  display: "grid",
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                  gap: 12,
                }}
              >
                <StatsCard
                  title="Project value"
                  value={compactMoney(project?.project_value)}
                  subtitle={project?.contract_type ?? "Contract"}
                />
                <StatsCard
                  title="Critical attention"
                  value={stats.criticalRisks + stats.overdueActions}
                  subtitle={`${stats.criticalRisks} critical risks · ${stats.overdueActions} overdue actions`}
                />
                <StatsCard
                  title="Open controls"
                  value={stats.openActions}
                  subtitle={`${stats.upcomingReviews} reviews due soon`}
                />
                <StatsCard
                  title="Stakeholders"
                  value={stats.totalStakeholders}
                  subtitle="Linked stakeholders"
                />
              </div>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 20,
                padding: 16,
                color: "white",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.66)", fontWeight: 700 }}>
                  Project health
                </div>
                <div style={{ marginTop: 8, fontSize: 34, fontWeight: 900 }}>
                  {stats.avgScore.toFixed(1)}
                </div>
                <div style={{ marginTop: 4, fontSize: 12, color: "rgba(255,255,255,0.72)" }}>
                  Average project risk score
                </div>
              </div>

              <div
                style={{
                  marginTop: 14,
                  padding: 14,
                  borderRadius: 16,
                  background: "rgba(15,23,42,0.26)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.68)", fontWeight: 700 }}>
                  Primary recommendation
                </div>
                <div style={{ marginTop: 8, fontSize: 20, lineHeight: 1.15, fontWeight: 800 }}>
                  {mainInsight.title}
                </div>
                <div style={{ marginTop: 8, fontSize: 12, lineHeight: 1.55, color: "rgba(255,255,255,0.76)" }}>
                  {mainInsight.body}
                </div>

                <Link
                  href={mainInsight.href}
                  style={{
                    marginTop: 12,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: "white",
                    color: "#111827",
                    textDecoration: "none",
                    padding: "9px 12px",
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  {mainInsight.cta}
                  <ArrowRight style={{ width: 14, height: 14 }} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              background: "#f5f3ff",
              border: "1px solid #ddd6fe",
              borderRadius: 18,
              padding: 16,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#111827" }}>
                  Risk reviews due soon
                </div>
                <div style={{ marginTop: 8, fontSize: 12, lineHeight: 1.55, color: "#475569" }}>
                  {stats.upcomingReviews > 0
                    ? `${stats.upcomingReviews} scheduled review${stats.upcomingReviews > 1 ? "s should" : " should"} be completed in the next 14 days.`
                    : "No risk reviews due in the next 14 days."}
                </div>
                <Link
                  href={`/app/projects/${projectId}/risk-register`}
                  style={{
                    marginTop: 12,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    textDecoration: "none",
                    color: "#111827",
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  Plan review
                  <ArrowRight style={{ width: 14, height: 14 }} />
                </Link>
              </div>

              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#4f46e5",
                  whiteSpace: "nowrap",
                }}
              >
                {stats.upcomingReviews} due
              </div>
            </div>
          </div>

          <div
            style={{
              background: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: 18,
              padding: 16,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#111827" }}>
                  Stakeholder readiness
                </div>
                <div style={{ marginTop: 8, fontSize: 12, lineHeight: 1.55, color: "#475569" }}>
                  {stats.totalStakeholders === 0
                    ? "There are active risks and actions, but no stakeholders are linked yet."
                    : `${stats.totalStakeholders} stakeholder${stats.totalStakeholders > 1 ? "s are" : " is"} linked to this project.`}
                </div>
                <Link
                  href={`/app/projects/${projectId}/stakeholders`}
                  style={{
                    marginTop: 12,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    textDecoration: "none",
                    color: "#111827",
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  Open stakeholders
                  <ArrowRight style={{ width: 14, height: 14 }} />
                </Link>
              </div>

              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#d97706",
                  whiteSpace: "nowrap",
                }}
              >
                {stats.totalStakeholders} linked
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)",
            gap: 14,
            marginBottom: 14,
          }}
        >
          <Section
            title="Project phase & schedule pressure"
            subtitle="Compact planning overview with phase progress and risk pressure"
            right={
              <Link
                href={`/app/projects/${projectId}/project-timeline`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  textDecoration: "none",
                  color: "#111827",
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                Open full timeline
                <ArrowRight style={{ width: 14, height: 14 }} />
              </Link>
            }
          >
            <CompactTimeline project={project} timeline={timeline} risks={risks} />
          </Section>

          <Section title="Risk exposure summary" subtitle="Current project posture">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div
                style={{
                  borderRadius: 14,
                  padding: 14,
                  background: "#eef2ff",
                  border: "1px solid #c7d2fe",
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: "#4f46e5" }}>Current phase</div>
                <div style={{ marginTop: 8, fontSize: 18, fontWeight: 800, color: "#111827" }}>
                  {project?.project_phase ?? project?.status ?? "Active"}
                </div>
                <div style={{ marginTop: 8, fontSize: 11, color: "#64748b" }}>
                  {stats.daysLeft !== null
                    ? `${stats.daysLeft} days remaining until scheduled end`
                    : "No end date configured"}
                </div>
              </div>

              <div
                style={{
                  borderRadius: 14,
                  padding: 14,
                  background: "#fff7ed",
                  border: "1px solid #fdba74",
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: "#ea580c" }}>Control load</div>
                <div style={{ marginTop: 8, fontSize: 18, fontWeight: 800, color: "#111827" }}>
                  {stats.openActions + stats.upcomingReviews}
                </div>
                <div style={{ marginTop: 8, fontSize: 11, color: "#64748b" }}>
                  Open actions and due reviews requiring follow-up
                </div>
              </div>

              <div
                style={{
                  borderRadius: 14,
                  padding: 14,
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: "#dc2626" }}>
                  Risk concentration
                </div>
                <div style={{ marginTop: 8, fontSize: 18, fontWeight: 800, color: "#111827" }}>
                  {stats.criticalRisks + stats.highRisks}
                </div>
                <div style={{ marginTop: 8, fontSize: 11, color: "#64748b" }}>
                  High and critical risks currently visible
                </div>
              </div>

              <div
                style={{
                  borderRadius: 14,
                  padding: 14,
                  background: "#f0fdf4",
                  border: "1px solid #86efac",
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: "#16a34a" }}>Planning window</div>
                <div style={{ marginTop: 8, fontSize: 18, fontWeight: 800, color: "#111827" }}>
                  {project?.start_date && project?.end_date
                    ? Math.ceil(
                        (new Date(project.end_date).getTime() - new Date(project.start_date).getTime()) /
                          86400000
                      )
                    : "—"}
                </div>
                <div style={{ marginTop: 8, fontSize: 11, color: "#64748b" }}>
                  Total scheduled project days
                </div>
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 11,
                  color: "#64748b",
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                <span>Risk distribution</span>
                <span>{stats.totalRisks} total risks</span>
              </div>

              {[
                { label: "Critical", count: stats.criticalRisks, color: "#ef4444" },
                { label: "High", count: stats.highRisks, color: "#f97316" },
                { label: "Medium", count: stats.mediumRisks, color: "#eab308" },
                { label: "Low", count: stats.lowRisks, color: "#22c55e" },
              ].map((item) => {
                const pct = stats.totalRisks > 0 ? Math.round((item.count / stats.totalRisks) * 100) : 0;

                return (
                  <div key={item.label} style={{ marginBottom: 8 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 11,
                        marginBottom: 5,
                        color: "#475569",
                        fontWeight: 700,
                      }}
                    >
                      <span>{item.label}</span>
                      <span>
                        {item.count} · {pct}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: 8,
                        borderRadius: 999,
                        background: "#f1f5f9",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: item.color,
                          borderRadius: 999,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.15fr) minmax(0, 0.95fr) minmax(0, 0.95fr)",
            gap: 14,
            marginBottom: 14,
          }}
        >
          <Section
            title="Top risks"
            subtitle="Highest priority project risks"
            right={
              <Link
                href={`/app/projects/${projectId}/risk-register`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  textDecoration: "none",
                  color: "#111827",
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                Open register
                <ArrowRight style={{ width: 14, height: 14 }} />
              </Link>
            }
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {topRisks.length === 0 ? (
                <div style={{ fontSize: 13, color: "#64748b" }}>No risks found yet.</div>
              ) : (
                topRisks.map((risk) => {
                  const level = normalizeLevel(risk.level, risk.score);
                  const s = levelStyle(level);

                  return (
                    <div
                      key={risk.id}
                      style={{
                        background: s.bg,
                        border: `1px solid ${s.border}`,
                        borderRadius: 14,
                        padding: 12,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <span
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                background: s.dot,
                                flexShrink: 0,
                              }}
                            />
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 800,
                                color: "#111827",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {risk.title}
                            </div>
                            <span
                              style={{
                                padding: "4px 8px",
                                borderRadius: 999,
                                background: "rgba(255,255,255,0.65)",
                                color: s.text,
                                fontSize: 10,
                                fontWeight: 800,
                                textTransform: "capitalize",
                              }}
                            >
                              {level}
                            </span>
                          </div>

                          <div style={{ marginTop: 8, fontSize: 11, lineHeight: 1.55, color: "#475569" }}>
                            {risk.description || risk.suggested_action || "No description available."}
                          </div>

                          <div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap", fontSize: 10, color: "#64748b" }}>
                            <span>Score: <strong style={{ color: "#111827" }}>{risk.score ?? "—"}</strong></span>
                            <span>Phase: <strong style={{ color: "#111827" }}>{risk.phase ?? "—"}</strong></span>
                            <span>Review: <strong style={{ color: "#111827" }}>{fmtDate(risk.due_review_date)}</strong></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Section>

          <Section
            title="Urgent actions"
            subtitle="Immediate follow-up items"
            right={
              <Link
                href={`/app/projects/${projectId}/actions`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  textDecoration: "none",
                  color: "#111827",
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                Open actions
                <ArrowRight style={{ width: 14, height: 14 }} />
              </Link>
            }
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {urgentActions.length === 0 ? (
                <div style={{ fontSize: 13, color: "#64748b" }}>No urgent actions found.</div>
              ) : (
                urgentActions.map((action) => {
                  const blocked = (action.status ?? "").toLowerCase() === "blocked";
                  const overdue = (action.status ?? "").toLowerCase() !== "done" && isOverdue(action.due_date);
                  const bg = blocked ? "#fef2f2" : overdue ? "#fff7ed" : "#f8fafc";
                  const border = blocked ? "#fecaca" : overdue ? "#fdba74" : "#e5e7eb";
                  const color = blocked ? "#dc2626" : overdue ? "#ea580c" : "#475569";

                  return (
                    <div
                      key={action.id}
                      style={{
                        background: bg,
                        border: `1px solid ${border}`,
                        borderRadius: 14,
                        padding: 12,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: "#111827" }}>
                            {action.title}
                          </div>
                          <div style={{ marginTop: 8, fontSize: 11, lineHeight: 1.55, color: "#475569" }}>
                            {action.description || "Mitigation action requires follow-up."}
                          </div>
                        </div>

                        <div
                          style={{
                            padding: "4px 8px",
                            borderRadius: 999,
                            background: "rgba(255,255,255,0.72)",
                            color,
                            fontSize: 10,
                            fontWeight: 800,
                            height: "fit-content",
                            whiteSpace: "nowrap",
                            textTransform: "capitalize",
                          }}
                        >
                          {blocked ? "Blocked" : overdue ? "Overdue" : action.status ?? "Open"}
                        </div>
                      </div>

                      <div
                        style={{
                          marginTop: 8,
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 10,
                          color: "#64748b",
                        }}
                      >
                        <span>Due date</span>
                        <span style={{ color, fontWeight: 800 }}>{fmtDate(action.due_date)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Section>

          <Section
            title="Risk matrix"
            subtitle="Probability × impact"
            right={
              <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b" }}>
                {stats.totalRisks} mapped
              </div>
            }
          >
            <RiskMatrix risks={risks} />
          </Section>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)",
            gap: 14,
          }}
        >
          <Section title="Category distribution" subtitle="Risk clustering by category">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {categoryDistribution.length === 0 ? (
                <div style={{ fontSize: 13, color: "#64748b" }}>No category data available.</div>
              ) : (
                categoryDistribution.map((item, idx) => {
                  const pct = stats.totalRisks > 0 ? Math.round((item.count / stats.totalRisks) * 100) : 0;
                  const colors = ["#4f46e5", "#8b5cf6", "#f97316", "#eab308", "#22c55e"];
                  const color = colors[idx % colors.length];

                  return (
                    <div key={item.label}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#334155",
                          marginBottom: 6,
                        }}
                      >
                        <span>{item.label}</span>
                        <span>
                          {item.count} · {pct}%
                        </span>
                      </div>

                      <div
                        style={{
                          height: 8,
                          borderRadius: 999,
                          background: "#f1f5f9",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            borderRadius: 999,
                            background: color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Section>

          <Section title="Recent activity" subtitle="Latest project updates">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recentActivity.length === 0 ? (
                <div style={{ fontSize: 13, color: "#64748b" }}>No recent activity found.</div>
              ) : (
                recentActivity.map((item) => {
                  const icon =
                    item.type === "notification" ? (
                      <Bell style={{ width: 14, height: 14 }} />
                    ) : item.type === "action" ? (
                      <Wrench style={{ width: 14, height: 14 }} />
                    ) : (
                      <FileWarning style={{ width: 14, height: 14 }} />
                    );

                  const color =
                    item.type === "notification" ? "#4f46e5" : item.type === "action" ? "#ea580c" : "#dc2626";

                  return (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-start",
                        border: "1px solid #eef2f7",
                        borderRadius: 14,
                        padding: 12,
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 10,
                          background: `${color}15`,
                          color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {icon}
                      </div>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: "#111827" }}>
                          {item.title}
                        </div>
                        <div style={{ marginTop: 4, fontSize: 11, color: "#64748b", lineHeight: 1.5 }}>
                          {item.subtitle}
                        </div>
                      </div>

                      <div
                        style={{
                          fontSize: 10,
                          color: "#94a3b8",
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {timeAgo(item.at)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Section>

          <Section title="Project context" subtitle="Core project metadata">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                ["Project code", project?.project_code ?? "—"],
                ["Client", project?.client_name ?? "—"],
                ["Contract type", project?.contract_type ?? "—"],
                ["Project value", formatMoney(project?.project_value)],
                ["Start date", fmtDate(project?.start_date)],
                ["End date", fmtDate(project?.end_date)],
                ["Site type", project?.site_type ?? "—"],
                ["Permit required", project?.permit_required ? "Yes" : "No"],
                ["Main contractor", project?.main_contractor ?? "—"],
                ["Intake method", project?.intake_method ?? "—"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    border: "1px solid #eef2f7",
                    borderRadius: 12,
                    padding: 10,
                    background: "#fbfdff",
                  }}
                >
                  <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700 }}>{label}</div>
                  <div style={{ marginTop: 6, fontSize: 13, fontWeight: 800, color: "#111827" }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {(project?.description || project?.planning_notes || project?.critical_dependencies) && (
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                {project?.description && (
                  <div
                    style={{
                      border: "1px solid #eef2f7",
                      borderRadius: 12,
                      padding: 10,
                    }}
                  >
                    <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700 }}>Description</div>
                    <div style={{ marginTop: 6, fontSize: 11, color: "#475569", lineHeight: 1.55 }}>
                      {project.description}
                    </div>
                  </div>
                )}

                {project?.planning_notes && (
                  <div
                    style={{
                      border: "1px solid #eef2f7",
                      borderRadius: 12,
                      padding: 10,
                    }}
                  >
                    <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700 }}>Planning notes</div>
                    <div style={{ marginTop: 6, fontSize: 11, color: "#475569", lineHeight: 1.55 }}>
                      {project.planning_notes}
                    </div>
                  </div>
                )}

                {project?.critical_dependencies && (
                  <div
                    style={{
                      border: "1px solid #eef2f7",
                      borderRadius: 12,
                      padding: 10,
                    }}
                  >
                    <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700 }}>Critical dependencies</div>
                    <div style={{ marginTop: 6, fontSize: 11, color: "#475569", lineHeight: 1.55 }}>
                      {project.critical_dependencies}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}