"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  AlertTriangle, ArrowRight, Bell, ClipboardList, Loader2,
  RefreshCw, Shield, ShieldAlert, Target, TrendingUp, Users,
  Clock, CheckCheck, Zap, ChevronRight, Activity,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Project = {
  id: string; name: string; status: string | null;
  description?: string | null; project_value?: number | null;
  start_date?: string | null; end_date?: string | null;
  client_name?: string | null;
};
type RiskLevel = "low" | "medium" | "high";
type RiskStatus = "open" | "monitoring" | "mitigated" | "closed" | "archived";
type ActionStatus = "open" | "in_progress" | "blocked" | "done" | "overdue";
type ActionPriority = "low" | "medium" | "high" | "critical";

type ProjectRisk = {
  id: string; risk_code: string | null; title: string; category: string | null;
  probability: number; impact: number; score: number; level: RiskLevel;
  status: RiskStatus; phase: string | null; due_review_date: string | null;
  created_at: string; updated_at: string;
};
type RiskAction = {
  id: string; title: string; status: ActionStatus; priority: ActionPriority;
  due_date: string | null; created_at: string;
};
type Notification = {
  id: string; title: string; body: string | null; is_read: boolean; created_at: string;
};
type Stakeholder = { id: string; name: string };
type TimelineEvent = {
  id: string; title: string; type: string; status: string;
  start_date: string; end_date: string | null;
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

// ── Score ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score, max = 25 }: { score: number; max?: number }) {
  const pct = Math.min(score / max, 1);
  const r = 36; const c = 2 * Math.PI * r;
  const color = score >= 15 ? "#ef4444" : score >= 8 ? "#f59e0b" : "#22c55e";
  const label = score >= 15 ? "High" : score >= 8 ? "Medium" : "Low";
  return (
    <div style={{ position: "relative", width: 96, height: 96, flexShrink: 0 }}>
      <svg width={96} height={96} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={48} cy={48} r={r} fill="none" stroke="#f1f5f9" strokeWidth={8} />
        <circle cx={48} cy={48} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={`${pct * c} ${c}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8" }}>{label}</span>
      </div>
    </div>
  );
}

// ── Risk matrix dot ───────────────────────────────────────────────────────────
function RiskMatrix({ risks }: { risks: ProjectRisk[] }) {
  const cells = Array.from({ length: 5 }, (_, row) =>
    Array.from({ length: 5 }, (_, col) => {
      const p = col + 1; const i = 5 - row;
      const here = risks.filter(r => r.probability === p && r.impact === i);
      const score = p * i;
      const bg = score >= 15 ? "#fef2f2" : score >= 8 ? "#fffbeb" : "#f0fdf4";
      const border = score >= 15 ? "#fecaca" : score >= 8 ? "#fde68a" : "#bbf7d0";
      return { p, i, risks: here, bg, border };
    })
  );
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
        <span style={{ fontSize: 10, color: "#94a3b8", writingMode: "vertical-rl", transform: "rotate(180deg)", marginRight: 4 }}>IMPACT →</span>
        <div style={{ flex: 1 }}>
          {cells.map((row, ri) => (
            <div key={ri} style={{ display: "flex", gap: 3, marginBottom: 3 }}>
              {row.map((cell, ci) => (
                <div key={ci} style={{
                  flex: 1, aspectRatio: "1", borderRadius: 6, background: cell.bg,
                  border: `1px solid ${cell.border}`, display: "flex", alignItems: "center",
                  justifyContent: "center", position: "relative", minHeight: 32,
                }}>
                  {cell.risks.length > 0 && (
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%",
                      background: cell.risks[0].level === "high" ? "#ef4444" : cell.risks[0].level === "medium" ? "#f59e0b" : "#22c55e",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 9, fontWeight: 800, color: "white",
                    }}>{cell.risks.length}</div>
                  )}
                </div>
              ))}
            </div>
          ))}
          <div style={{ display: "flex", gap: 3, marginTop: 2 }}>
            {[1, 2, 3, 4, 5].map(n => (
              <div key={n} style={{ flex: 1, textAlign: "center", fontSize: 10, color: "#94a3b8" }}>{n}</div>
            ))}
          </div>
          <p style={{ textAlign: "center", fontSize: 10, color: "#94a3b8", marginTop: 2 }}>PROBABILITY →</p>
        </div>
      </div>
    </div>
  );
}

// ── Mini gantt ────────────────────────────────────────────────────────────────
function MiniGantt({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) return (
    <div style={{ textAlign: "center", padding: "20px 0", color: "#94a3b8", fontSize: 13 }}>
      No timeline events · <Link href="#" style={{ color: "#7c3aed", textDecoration: "none", fontWeight: 600 }}>Add one</Link>
    </div>
  );
  const dates = events.flatMap(e => [new Date(e.start_date), e.end_date ? new Date(e.end_date) : new Date(e.start_date)]);
  const min = new Date(Math.min(...dates.map(d => d.getTime())));
  const max = new Date(Math.max(...dates.map(d => d.getTime())));
  const range = max.getTime() - min.getTime() || 1;
  const pct = (d: string) => Math.max(0, Math.min(100, ((new Date(d).getTime() - min.getTime()) / range) * 100));
  const todayPct = Math.max(0, Math.min(100, ((Date.now() - min.getTime()) / range) * 100));

  const TYPE_COLOR: Record<string, string> = {
    phase: "#7c3aed", milestone: "#f59e0b", review: "#3b82f6", delivery: "#22c55e",
  };
  const STATUS_BG: Record<string, string> = {
    completed: "#22c55e", in_progress: "#3b82f6", delayed: "#ef4444", planned: "#94a3b8",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {events.slice(0, 5).map(ev => {
        const left = pct(ev.start_date);
        const right = pct(ev.end_date || ev.start_date);
        const width = Math.max(right - left, 2);
        const color = TYPE_COLOR[ev.type] ?? "#7c3aed";
        return (
          <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 110, flexShrink: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.title}</p>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: STATUS_BG[ev.status] ?? "#94a3b8" }} />
                <span style={{ fontSize: 10, color: "#94a3b8" }}>{ev.status.replace("_", " ")}</span>
              </div>
            </div>
            <div style={{ flex: 1, height: 22, background: "#f8fafc", borderRadius: 6, position: "relative", overflow: "visible" }}>
              <div style={{ position: "absolute", left: `${todayPct}%`, top: -3, bottom: -3, width: 1.5, background: "#ef444470", zIndex: 2 }} />
              <div style={{
                position: "absolute", left: `${left}%`, width: `${width}%`, height: 22,
                background: color, borderRadius: 5, opacity: 0.85,
                display: "flex", alignItems: "center", paddingLeft: 6, minWidth: 6,
              }}>
                {width > 10 && <span style={{ fontSize: 10, fontWeight: 700, color: "white", whiteSpace: "nowrap" }}>
                  {new Date(ev.start_date).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
                </span>}
              </div>
            </div>
          </div>
        );
      })}
      <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
        {[["phase", "#7c3aed"], ["milestone", "#f59e0b"], ["review", "#3b82f6"], ["delivery", "#22c55e"]].map(([type, color]) => (
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

// ── Main ─────────────────────────────────────────────────────────────────────
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
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setErrorMessage("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [{ data: pd }, { data: rd }, { data: ad }, { data: nd }, { data: sd }, { data: td }] =
        await Promise.all([
          supabase.from("projects").select("id,name,status,description,project_value,start_date,end_date,client_name").eq("id", projectId).single(),
          supabase.from("project_risks").select("id,risk_code,title,category,probability,impact,score,level,status,phase,due_review_date,created_at,updated_at").eq("project_id", projectId).order("score", { ascending: false }),
          supabase.from("risk_actions").select("id,title,status,priority,due_date,created_at").eq("project_id", projectId).order("created_at", { ascending: false }),
          supabase.from("notifications").select("id,title,body,is_read,created_at").eq("user_id", user.id).eq("project_id", projectId).order("created_at", { ascending: false }).limit(8),
          supabase.from("project_stakeholders").select("id,name").eq("project_id", projectId),
          supabase.from("project_timeline").select("id,title,type,status,start_date,end_date").eq("project_id", projectId).order("start_date", { ascending: true }),
        ]);
      if (pd) setProject(pd);
      setRisks((rd ?? []) as ProjectRisk[]);
      setActions((ad ?? []) as RiskAction[]);
      setNotifications((nd ?? []) as Notification[]);
      setStakeholders((sd ?? []) as Stakeholder[]);
      setTimeline((td ?? []) as TimelineEvent[]);
    } catch (e: any) { setErrorMessage(e?.message || "Load error"); }
    finally { setLoading(false); setRefreshing(false); }
  }

  useEffect(() => { if (projectId) loadDashboard(); }, [projectId]);

  const stats = useMemo(() => {
    const totalRisks = risks.length;
    const highRisks = risks.filter(r => r.level === "high").length;
    const mediumRisks = risks.filter(r => r.level === "medium").length;
    const lowRisks = risks.filter(r => r.level === "low").length;
    const openActions = actions.filter(a => a.status === "open" || a.status === "in_progress").length;
    const overdueActions = actions.filter(a => a.due_date && a.status !== "done" && new Date(a.due_date).getTime() < Date.now()).length;
    const completedActions = actions.filter(a => a.status === "done").length;
    const upcomingReviews = risks.filter(r => { if (!r.due_review_date) return false; const d = new Date(r.due_review_date).getTime(); return d >= Date.now() && d <= Date.now() + 14 * 86400000; }).length;
    const unreadNotifications = notifications.filter(n => !n.is_read).length;
    const avgScore = totalRisks > 0 ? risks.reduce((s, r) => s + r.score, 0) / totalRisks : 0;
    const avgRiskScore = avgScore.toFixed(1);
    const projectDays = project?.start_date && project?.end_date
      ? Math.ceil((new Date(project.end_date).getTime() - new Date(project.start_date).getTime()) / 86400000) : null;
    const daysLeft = project?.end_date
      ? Math.ceil((new Date(project.end_date).getTime() - Date.now()) / 86400000) : null;
    return { totalRisks, highRisks, mediumRisks, lowRisks, openActions, overdueActions, completedActions, upcomingReviews, unreadNotifications, avgRiskScore, avgScore, totalStakeholders: stakeholders.length, projectDays, daysLeft };
  }, [risks, actions, notifications, stakeholders, project]);

  const topRisks = useMemo(() => risks.slice(0, 5), [risks]);
  const urgentActions = useMemo(() => [...actions].filter(a => {
    const overdue = a.due_date && a.status !== "done" ? new Date(a.due_date).getTime() < Date.now() : false;
    return overdue || a.priority === "critical" || a.priority === "high";
  }).slice(0, 5), [actions]);

  const categoryDist = useMemo(() => {
    const map = new Map<string, number>();
    risks.forEach(r => { const k = r.category || "Uncategorized"; map.set(k, (map.get(k) || 0) + 1); });
    return Array.from(map.entries()).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [risks]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", padding: 40 }}>
      <Loader2 style={{ height: 24, width: 24, color: "#7c3aed", animation: "spin 1s linear infinite" }} />
    </div>
  );

  const scoreNum = parseFloat(stats.avgRiskScore);
  const scoreColor = scoreNum >= 15 ? "#ef4444" : scoreNum >= 8 ? "#f59e0b" : "#22c55e";
  const scoreLabel = scoreNum >= 15 ? "High" : scoreNum >= 8 ? "Medium" : "Low";

  return (
    <div style={{ padding: "24px 24px 48px", background: "#f4f5fa", minHeight: "100%" }}>

      {/* ── HERO HEADER ── */}
      <div style={{
        background: "linear-gradient(135deg, #1e2140 0%, #2d1f6e 50%, #1e2140 100%)",
        borderRadius: 20, padding: "28px 32px", marginBottom: 20,
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap",
        boxShadow: "0 8px 32px rgba(30,33,64,0.25)",
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.12)", borderRadius: 20, padding: "4px 12px", marginBottom: 12 }}>
            <Shield style={{ height: 12, width: 12, color: "rgba(255,255,255,0.7)" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Project Overview</span>
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: "white", letterSpacing: "-0.03em", marginBottom: 8, lineHeight: 1.1 }}>{project?.name || "Dashboard"}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            {project?.client_name && (
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>Client: <strong style={{ color: "white" }}>{project.client_name}</strong></span>
            )}
            {project?.project_value && (
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>Value: <strong style={{ color: "#a78bfa" }}>{fmtEur(project.project_value)}</strong></span>
            )}
            {stats.daysLeft !== null && (
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                {stats.daysLeft > 0 ? <><strong style={{ color: "#34d399" }}>{stats.daysLeft}</strong> days left</> : <strong style={{ color: "#f87171" }}>Overdue by {Math.abs(stats.daysLeft)}d</strong>}
              </span>
            )}
            {project?.status && (
              <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: project.status === "active" ? "#34d399" : project.status === "at_risk" ? "#fbbf24" : "#f87171", color: "white" }}>
                {project.status.replace("_", " ")}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          {/* Big score */}
          <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 16, padding: "16px 20px", textAlign: "center", border: "1px solid rgba(255,255,255,0.12)" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Avg Risk Score</p>
            <ScoreRing score={scoreNum} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button onClick={() => loadDashboard(true)} disabled={refreshing} style={{ display: "flex", alignItems: "center", gap: 7, height: 38, borderRadius: 10, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.1)", padding: "0 16px", fontSize: 13, fontWeight: 600, color: "white", cursor: "pointer" }}>
              <RefreshCw style={{ height: 13, width: 13, animation: refreshing ? "spin 1s linear infinite" : "none" }} />
              {refreshing ? "..." : "Refresh"}
            </button>
            <Link href={`/app/projects/${projectId}/risk-register`} style={{ display: "flex", alignItems: "center", gap: 7, height: 38, borderRadius: 10, background: "#7c3aed", padding: "0 16px", fontSize: 13, fontWeight: 600, color: "white", textDecoration: "none" }}>
              <ClipboardList style={{ height: 13, width: 13 }} />
              Risk Register
            </Link>
          </div>
        </div>
      </div>

      {errorMessage && <div style={{ marginBottom: 14, borderRadius: 10, border: "1px solid #fecaca", background: "#fef2f2", padding: "10px 16px", fontSize: 13, color: "#dc2626" }}>{errorMessage}</div>}

      {/* ── STAT CARDS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 18 }}>
        {[
          { title: "Total Risks", value: stats.totalRisks, sub: "In register", icon: <ShieldAlert style={{ height: 17, width: 17, color: "#7c3aed" }} />, accent: "#ede9fb", val_color: "#0f172a" },
          { title: "High Risks", value: stats.highRisks, sub: "Need attention", icon: <AlertTriangle style={{ height: 17, width: 17, color: "#dc2626" }} />, accent: "#fef2f2", val_color: stats.highRisks > 0 ? "#dc2626" : "#0f172a" },
          { title: "Open Actions", value: stats.openActions, sub: "In progress", icon: <Target style={{ height: 17, width: 17, color: "#2563eb" }} />, accent: "#eff6ff", val_color: "#0f172a" },
          { title: "Stakeholders", value: stats.totalStakeholders, sub: "Involved", icon: <Users style={{ height: 17, width: 17, color: "#059669" }} />, accent: "#f0fdf4", val_color: "#0f172a" },
          { title: "Overdue", value: stats.overdueActions, sub: "Actions overdue", icon: <Clock style={{ height: 17, width: 17, color: "#d97706" }} />, accent: "#fffbeb", val_color: stats.overdueActions > 0 ? "#dc2626" : "#0f172a" },
        ].map(card => (
          <div key={card.title} style={{ background: "white", borderRadius: 14, border: "1px solid #e8eaf0", padding: "16px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: "#94a3b8" }}>{card.title}</span>
              <div style={{ height: 32, width: 32, borderRadius: 9, background: card.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>{card.icon}</div>
            </div>
            <p style={{ fontSize: 34, fontWeight: 800, color: card.val_color, lineHeight: 1, letterSpacing: "-0.03em" }}>{card.value}</p>
            <p style={{ fontSize: 11, color: "#cbd5e1", marginTop: 4 }}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* ── ROW 1: Timeline Gantt + Risk Matrix ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 14, marginBottom: 14 }}>

        {/* Timeline mini gantt */}
        <div style={{ background: "white", borderRadius: 16, border: "1px solid #e8eaf0", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid #f1f5f9" }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Project Timeline</h3>
              <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{timeline.length} events · gantt view</p>
            </div>
            <Link href={`/app/projects/${projectId}/project-timeline`} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#7c3aed", textDecoration: "none", fontWeight: 600 }}>
              Full timeline <ChevronRight style={{ height: 12, width: 12 }} />
            </Link>
          </div>
          <div style={{ padding: "14px 18px" }}>
            <MiniGantt events={timeline} />
          </div>
        </div>

        {/* Risk Matrix */}
        <div style={{ background: "white", borderRadius: 16, border: "1px solid #e8eaf0", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f9" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Risk Matrix</h3>
            <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>Probability × Impact</p>
          </div>
          <div style={{ padding: "14px 18px" }}>
            {risks.length === 0
              ? <div style={{ textAlign: "center", padding: "20px 0", color: "#94a3b8", fontSize: 13 }}>No risks yet</div>
              : <RiskMatrix risks={risks} />
            }
            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 8 }}>
              {[["#ef4444", "High"], ["#f59e0b", "Medium"], ["#22c55e", "Low"]].map(([c, l]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
                  <span style={{ fontSize: 10, color: "#94a3b8" }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 2: Management Summary + Risk Exposure ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>

        {/* Management Summary */}
        <div style={{ background: "white", borderRadius: 16, border: "1px solid #e8eaf0", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f9" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Management Summary</h3>
            <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>Current project control position</p>
          </div>
          <div style={{ padding: "14px 18px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Risk Position", icon: "🛡️", value: stats.highRisks > 0 ? `${stats.highRisks} high risks active` : "No high risks", ok: stats.highRisks === 0 },
              { label: "Action Control", icon: "✅", value: stats.overdueActions > 0 ? `${stats.overdueActions} overdue` : "No overdue actions", ok: stats.overdueActions === 0 },
              { label: "Reviews Due", icon: "📅", value: stats.upcomingReviews > 0 ? `${stats.upcomingReviews} in 14 days` : "None upcoming", ok: stats.upcomingReviews === 0 },
              { label: "Notifications", icon: "🔔", value: stats.unreadNotifications > 0 ? `${stats.unreadNotifications} unread` : "All caught up", ok: stats.unreadNotifications === 0 },
            ].map(item => (
              <div key={item.label} style={{ borderRadius: 12, background: item.ok ? "#f0fdf4" : "#fef9ec", border: `1px solid ${item.ok ? "#bbf7d0" : "#fde68a"}`, padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                  <span style={{ fontSize: 14 }}>{item.icon}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>{item.label}</span>
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: item.ok ? "#16a34a" : "#92400e" }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Exposure */}
        <div style={{ background: "white", borderRadius: 16, border: "1px solid #e8eaf0", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f9" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Risk Exposure</h3>
            <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>Distribution across register</p>
          </div>
          <div style={{ padding: "14px 18px" }}>
            {stats.totalRisks === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0", color: "#94a3b8", fontSize: 13 }}>No risks registered yet</div>
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
                  {[
                    { label: "High", count: stats.highRisks, color: "#ef4444" },
                    { label: "Medium", count: stats.mediumRisks, color: "#f59e0b" },
                    { label: "Low", count: stats.lowRisks, color: "#22c55e" },
                  ].map(item => (
                    <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#374151", width: 50 }}>{item.label}</span>
                      <div style={{ flex: 1, height: 10, borderRadius: 5, background: "#f1f5f9", overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 5, background: item.color, width: stats.totalRisks > 0 ? `${(item.count / stats.totalRisks) * 100}%` : "0%", transition: "width 700ms ease" }} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 800, color: item.color, width: 24, textAlign: "right" }}>{item.count}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {[
                    { label: "Open", count: risks.filter(r => r.status === "open").length, color: "#2563eb" },
                    { label: "Monitoring", count: risks.filter(r => r.status === "monitoring").length, color: "#d97706" },
                    { label: "Mitigated", count: risks.filter(r => r.status === "mitigated").length, color: "#16a34a" },
                  ].map(s => (
                    <div key={s.label} style={{ borderRadius: 10, background: "#f8fafc", padding: "10px 0", textAlign: "center" }}>
                      <p style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.count}</p>
                      <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── ROW 3: Top Risks + Urgent Actions ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>

        {/* Top Risks table */}
        <div style={{ background: "white", borderRadius: 16, border: "1px solid #e8eaf0", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid #f1f5f9" }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Top Risks</h3>
              <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>Highest exposure scores</p>
            </div>
            <Link href={`/app/projects/${projectId}/risk-register`} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, color: "#7c3aed", textDecoration: "none", fontWeight: 600 }}>View all <ArrowRight style={{ height: 11, width: 11 }} /></Link>
          </div>
          <div style={{ padding: "6px 0" }}>
            {topRisks.length === 0
              ? <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8", fontSize: 13 }}>No risks yet</div>
              : topRisks.map((r, i) => {
                const lc = r.level === "high" ? { dot: "#ef4444", bg: "#fef2f2", text: "#dc2626" } : r.level === "medium" ? { dot: "#f59e0b", bg: "#fffbeb", text: "#d97706" } : { dot: "#22c55e", bg: "#f0fdf4", text: "#16a34a" };
                return (
                  <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 18px", borderBottom: i < topRisks.length - 1 ? "1px solid #f8fafc" : "none" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#e2e8f0", width: 16 }}>{i + 1}</span>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: lc.dot, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</p>
                      <p style={{ fontSize: 11, color: "#94a3b8" }}>{r.category || "—"} · {r.phase || "No phase"}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: lc.bg, color: lc.text }}>{r.level}</span>
                      <span style={{ fontSize: 15, fontWeight: 800, color: lc.text, minWidth: 26, textAlign: "right" }}>{r.score}</span>
                    </div>
                  </div>
                );
              })
            }
          </div>
        </div>

        {/* Urgent Actions */}
        <div style={{ background: "white", borderRadius: 16, border: "1px solid #e8eaf0", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid #f1f5f9" }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Urgent Actions</h3>
              <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>High priority & overdue</p>
            </div>
            <Link href={`/app/projects/${projectId}/actions`} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, color: "#7c3aed", textDecoration: "none", fontWeight: 600 }}>View all <ArrowRight style={{ height: 11, width: 11 }} /></Link>
          </div>
          <div style={{ padding: "6px 0" }}>
            {urgentActions.length === 0
              ? <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8", fontSize: 13 }}>No urgent actions 🎉</div>
              : urgentActions.map((a, i) => {
                const overdue = a.due_date && a.status !== "done" && new Date(a.due_date).getTime() < Date.now();
                const pc = a.priority === "critical" ? { bg: "#fef2f2", text: "#dc2626" } : a.priority === "high" ? { bg: "#fff7ed", text: "#ea580c" } : { bg: "#fffbeb", text: "#d97706" };
                return (
                  <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 18px", borderBottom: i < urgentActions.length - 1 ? "1px solid #f8fafc" : "none" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: overdue ? "#ef4444" : pc.text, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title}</p>
                      <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
                        {a.due_date && <span style={{ fontSize: 11, color: overdue ? "#ef4444" : "#94a3b8", display: "flex", alignItems: "center", gap: 3 }}><Clock style={{ height: 10, width: 10 }} />{overdue ? "Overdue" : new Date(a.due_date).toLocaleDateString("nl-NL")}</span>}
                      </div>
                    </div>
                    <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: pc.bg, color: pc.text, flexShrink: 0 }}>{a.priority}</span>
                  </div>
                );
              })
            }
          </div>
        </div>
      </div>

      {/* ── ROW 4: Categories + Notifications ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

        {/* Category distribution */}
        <div style={{ background: "white", borderRadius: 16, border: "1px solid #e8eaf0", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f9" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Risk by Category</h3>
            <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>Top 5 categories</p>
          </div>
          <div style={{ padding: "14px 18px" }}>
            {categoryDist.length === 0
              ? <div style={{ textAlign: "center", padding: "20px 0", color: "#94a3b8", fontSize: 13 }}>No categorised risks</div>
              : categoryDist.map((cat, i) => {
                const colors = ["#7c3aed", "#2563eb", "#059669", "#d97706", "#dc2626"];
                return (
                  <div key={cat.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: i < categoryDist.length - 1 ? "1px solid #f8fafc" : "none" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#e2e8f0", width: 16 }}>{i + 1}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{cat.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: colors[i] }}>{cat.count}</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 3, background: "#f1f5f9" }}>
                        <div style={{ height: "100%", borderRadius: 3, background: colors[i], width: `${(cat.count / stats.totalRisks) * 100}%`, transition: "width 700ms" }} />
                      </div>
                    </div>
                  </div>
                );
              })
            }
          </div>
        </div>

        {/* Notifications */}
        <div style={{ background: "white", borderRadius: 16, border: "1px solid #e8eaf0", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid #f1f5f9" }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Recent Activity</h3>
              <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>Latest project alerts</p>
            </div>
            <Link href={`/app/projects/${projectId}/notifications`} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, color: "#7c3aed", textDecoration: "none", fontWeight: 600 }}>View all <ArrowRight style={{ height: 11, width: 11 }} /></Link>
          </div>
          <div style={{ padding: "6px 0" }}>
            {notifications.length === 0
              ? <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8", fontSize: 13 }}>No notifications yet</div>
              : notifications.slice(0, 6).map((n, i) => (
                <div key={n.id} style={{ display: "flex", gap: 12, padding: "9px 18px", borderBottom: i < Math.min(notifications.length, 6) - 1 ? "1px solid #f8fafc" : "none" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.is_read ? "#e2e8f0" : "#7c3aed", flexShrink: 0, marginTop: 4 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: n.is_read ? 400 : 600, color: n.is_read ? "#64748b" : "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.title}</p>
                    {n.body && <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.body}</p>}
                    <p style={{ fontSize: 10, color: "#cbd5e1", marginTop: 2 }}>{timeAgo(n.created_at)}</p>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}
