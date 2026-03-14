"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  AlertTriangle, ArrowRight, Bell, CalendarClock, CheckCircle2,
  ClipboardList, Loader2, RefreshCw, Shield, ShieldAlert,
  Target, TrendingUp, Users, Activity, Zap, Clock, CheckCheck,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Project = { id: string; name: string; status: string | null; description?: string | null };
type RiskStatus = "open"|"monitoring"|"mitigated"|"closed"|"archived";
type RiskLevel = "low"|"medium"|"high";
type ActionStatus = "open"|"in_progress"|"blocked"|"done"|"overdue";
type ActionPriority = "low"|"medium"|"high"|"critical";
type NotificationType = "action_assigned"|"action_due_soon"|"action_overdue"|"action_completed"|"risk_created"|"risk_high"|"risk_updated"|"general";

type ProjectRisk = {
  id: string; project_id: string; risk_code: string|null; title: string;
  description: string|null; category: string|null; risk_type: string|null;
  probability: number; impact: number; score: number; level: RiskLevel;
  status: RiskStatus; owner_user_id: string|null; phase: string|null;
  due_review_date: string|null; created_at: string; updated_at: string;
};
type RiskAction = {
  id: string; project_id: string; risk_id: string|null; title: string;
  description: string|null; owner_user_id: string|null;
  status: ActionStatus; priority: ActionPriority; due_date: string|null;
  completed_at: string|null; created_at: string; updated_at: string;
};
type Notification = {
  id: string; user_id: string; project_id: string; type: NotificationType;
  title: string; body: string|null; is_read: boolean; created_at: string;
};
type Stakeholder = { id: string; project_id: string; name: string };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(d: string) {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

function levelColor(level: string) {
  if (level === "high") return { bg:"#fef2f2", text:"#dc2626", dot:"#ef4444" };
  if (level === "medium") return { bg:"#fffbeb", text:"#d97706", dot:"#f59e0b" };
  return { bg:"#f0fdf4", text:"#16a34a", dot:"#22c55e" };
}

function priorityColor(p: string) {
  if (p === "critical") return { bg:"#fef2f2", text:"#dc2626" };
  if (p === "high") return { bg:"#fff7ed", text:"#ea580c" };
  if (p === "medium") return { bg:"#fffbeb", text:"#d97706" };
  return { bg:"#f0fdf4", text:"#16a34a" };
}

function actionStatusColor(s: string) {
  if (s === "done") return { bg:"#f0fdf4", text:"#16a34a" };
  if (s === "blocked" || s === "overdue") return { bg:"#fef2f2", text:"#dc2626" };
  if (s === "in_progress") return { bg:"#eff6ff", text:"#2563eb" };
  return { bg:"#f8fafc", text:"#64748b" };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ title, value, sub, icon, accent, trend }: {
  title: string; value: string|number; sub: string;
  icon: React.ReactNode; accent: string; trend?: string;
}) {
  return (
    <div style={{ background:"white", borderRadius:16, border:"1px solid #e8eaf0", padding:20, display:"flex", flexDirection:"column", gap:12, boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <p style={{ fontSize:13, fontWeight:500, color:"#64748b" }}>{title}</p>
        <div style={{ height:36, width:36, borderRadius:10, background:accent, display:"flex", alignItems:"center", justifyContent:"center", opacity:0.9 }}>
          {icon}
        </div>
      </div>
      <div>
        <p style={{ fontSize:32, fontWeight:700, color:"#0f172a", lineHeight:1 }}>{value}</p>
        <p style={{ fontSize:12, color:"#94a3b8", marginTop:4 }}>{sub}</p>
      </div>
      {trend && <p style={{ fontSize:12, color:"#22c55e", fontWeight:500 }}>{trend}</p>}
    </div>
  );
}

function SectionCard({ title, subtitle, action, children }: {
  title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div style={{ background:"white", borderRadius:16, border:"1px solid #e8eaf0", overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", borderBottom:"1px solid #f1f5f9" }}>
        <div>
          <h3 style={{ fontSize:15, fontWeight:700, color:"#0f172a" }}>{title}</h3>
          {subtitle && <p style={{ fontSize:12, color:"#94a3b8", marginTop:2 }}>{subtitle}</p>}
        </div>
        {action}
      </div>
      <div style={{ padding:20 }}>{children}</div>
    </div>
  );
}

function RiskRow({ risk, projectId }: { risk: ProjectRisk; projectId: string }) {
  const c = levelColor(risk.level);
  return (
    <Link href={`/app/projects/${projectId}/risk-register/${risk.id}`} style={{ textDecoration:"none" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:"1px solid #f8fafc", cursor:"pointer" }}>
        <div style={{ width:8, height:8, borderRadius:"50%", background:c.dot, flexShrink:0 }}/>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontSize:14, fontWeight:500, color:"#1e293b", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{risk.title}</p>
          <p style={{ fontSize:12, color:"#94a3b8" }}>{risk.category||"Uncategorized"} · {risk.phase||"No phase"}</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
          <span style={{ padding:"3px 8px", borderRadius:20, fontSize:11, fontWeight:600, background:c.bg, color:c.text }}>{risk.level}</span>
          <span style={{ fontSize:13, fontWeight:700, color:c.text, minWidth:28, textAlign:"right" }}>{risk.score}</span>
        </div>
      </div>
    </Link>
  );
}

function ActionRow({ action }: { action: RiskAction }) {
  const sc = actionStatusColor(action.status);
  const pc = priorityColor(action.priority);
  const overdue = action.due_date && action.status !== "done" && new Date(action.due_date).getTime() < Date.now();
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:"1px solid #f8fafc" }}>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:14, fontWeight:500, color:"#1e293b", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{action.title}</p>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:3 }}>
          {action.due_date && (
            <span style={{ fontSize:12, color: overdue ? "#ef4444" : "#94a3b8", display:"flex", alignItems:"center", gap:3 }}>
              <Clock style={{ height:11, width:11 }}/>
              {overdue ? "Overdue" : new Date(action.due_date).toLocaleDateString("nl-NL")}
            </span>
          )}
        </div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
        <span style={{ padding:"3px 8px", borderRadius:20, fontSize:11, fontWeight:600, background:pc.bg, color:pc.text }}>{action.priority}</span>
        <span style={{ padding:"3px 8px", borderRadius:20, fontSize:11, fontWeight:600, background:sc.bg, color:sc.text }}>{action.status.replace("_"," ")}</span>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function ProjectDashboardPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project|null>(null);
  const [risks, setRisks] = useState<ProjectRisk[]>([]);
  const [actions, setActions] = useState<RiskAction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadDashboard(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setErrorMessage("");
    try {
      const { data: { user }, error: ue } = await supabase.auth.getUser();
      if (ue || !user) return;

      const [{ data: pd }, { data: rd }, { data: ad }, { data: nd }, { data: sd }] = await Promise.all([
        supabase.from("projects").select("id, name, status, description").eq("id", projectId).single(),
        supabase.from("project_risks").select("*").eq("project_id", projectId).order("score", { ascending: false }),
        supabase.from("risk_actions").select("*").eq("project_id", projectId).order("created_at", { ascending: false }),
        supabase.from("notifications").select("*").eq("user_id", user.id).eq("project_id", projectId).order("created_at", { ascending: false }).limit(10),
        supabase.from("project_stakeholders").select("id, project_id, name").eq("project_id", projectId),
      ]);

      if (pd) setProject(pd);
      setRisks((rd ?? []) as ProjectRisk[]);
      setActions((ad ?? []) as RiskAction[]);
      setNotifications((nd ?? []) as Notification[]);
      setStakeholders((sd ?? []) as Stakeholder[]);
    } catch (err: any) {
      setErrorMessage(err?.message || "Could not load dashboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
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
    const upcomingReviews = risks.filter(r => { if (!r.due_review_date) return false; const d = new Date(r.due_review_date).getTime(); return d >= Date.now() && d <= Date.now() + 14*86400000; }).length;
    const unreadNotifications = notifications.filter(n => !n.is_read).length;
    const avgRiskScore = totalRisks > 0 ? (risks.reduce((s,r) => s + r.score, 0) / totalRisks).toFixed(1) : "0.0";
    return { totalRisks, highRisks, mediumRisks, lowRisks, openActions, overdueActions, completedActions, upcomingReviews, unreadNotifications, avgRiskScore, totalStakeholders: stakeholders.length };
  }, [risks, actions, notifications, stakeholders]);

  const topRisks = useMemo(() => risks.slice(0, 6), [risks]);
  const urgentActions = useMemo(() => [...actions].filter(a => {
    const overdue = a.due_date && a.status !== "done" ? new Date(a.due_date).getTime() < Date.now() : false;
    return overdue || a.priority === "critical" || a.priority === "high";
  }).slice(0, 5), [actions]);

  const categoryDistribution = useMemo(() => {
    const map = new Map<string, number>();
    risks.forEach(r => { const k = r.category||"Uncategorized"; map.set(k, (map.get(k)||0)+1); });
    return Array.from(map.entries()).map(([label,count]) => ({ label, count })).sort((a,b) => b.count - a.count).slice(0,5);
  }, [risks]);

  const overviewSummary = useMemo(() => {
    if (!project) return "";
    if (stats.totalRisks === 0) return "No risks registered yet. Start by adding risks to build your register, analysis and action workflow.";
    if (stats.highRisks > 0 && stats.overdueActions > 0) return `${stats.highRisks} high risks and ${stats.overdueActions} overdue actions require immediate attention.`;
    if (stats.highRisks > 0) return `${stats.highRisks} high risks should be reviewed with owners and stakeholders.`;
    if (stats.overdueActions > 0) return `${stats.overdueActions} overdue actions need operational follow-up.`;
    return `Healthy control structure with ${stats.totalRisks} risks, ${actions.length} actions and ${stats.totalStakeholders} stakeholders.`;
  }, [project, stats, actions]);

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%", padding:32 }}>
      <Loader2 style={{ height:24, width:24, color:"#7c3aed", animation:"spin 1s linear infinite" }}/>
    </div>
  );

  return (
    <div style={{ padding:"28px 28px 40px", background:"#f7f7fb", minHeight:"100%" }}>

      {/* ── Header ── */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24, gap:16, flexWrap:"wrap" }}>
        <div>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#ede9fb", borderRadius:20, padding:"4px 12px", marginBottom:10 }}>
            <Shield style={{ height:13, width:13, color:"#6d28d9" }}/>
            <span style={{ fontSize:11, fontWeight:700, color:"#6d28d9", letterSpacing:"0.1em", textTransform:"uppercase" }}>Project Overview</span>
          </div>
          <h1 style={{ fontSize:34, fontWeight:700, color:"#0f172a", letterSpacing:"-0.02em", marginBottom:6 }}>{project?.name||"Dashboard"}</h1>
          <p style={{ fontSize:15, color:"#64748b", maxWidth:560 }}>{overviewSummary}</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
          <button onClick={() => loadDashboard(true)} disabled={refreshing} style={{ display:"flex", alignItems:"center", gap:8, height:40, borderRadius:10, border:"1px solid #e8eaf0", background:"white", padding:"0 16px", fontSize:13, fontWeight:500, color:"#374151", cursor:"pointer" }}>
            <RefreshCw style={{ height:14, width:14, color: refreshing ? "#7c3aed" : "#94a3b8", animation: refreshing ? "spin 1s linear infinite" : "none" }}/>
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
          <Link href={`/app/projects/${projectId}/risk-register`} style={{ display:"flex", alignItems:"center", gap:8, height:40, borderRadius:10, background:"#7c3aed", padding:"0 18px", fontSize:13, fontWeight:600, color:"white", textDecoration:"none" }}>
            <ClipboardList style={{ height:14, width:14 }}/>
            Open Risk Register
          </Link>
        </div>
      </div>

      {errorMessage && (
        <div style={{ marginBottom:16, borderRadius:10, border:"1px solid #fecaca", background:"#fef2f2", padding:"10px 16px", fontSize:13, color:"#dc2626" }}>{errorMessage}</div>
      )}

      {/* ── Stats grid ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5, 1fr)", gap:14, marginBottom:20 }}>
        <StatCard title="Total Risks" value={stats.totalRisks} sub="In register" icon={<ShieldAlert style={{height:18,width:18,color:"#6d28d9"}}/>} accent="#ede9fb"/>
        <StatCard title="High Risks" value={stats.highRisks} sub="Need attention" icon={<AlertTriangle style={{height:18,width:18,color:"#dc2626"}}/>} accent="#fef2f2"/>
        <StatCard title="Open Actions" value={stats.openActions} sub="In progress" icon={<Target style={{height:18,width:18,color:"#2563eb"}}/>} accent="#eff6ff"/>
        <StatCard title="Stakeholders" value={stats.totalStakeholders} sub="Involved parties" icon={<Users style={{height:18,width:18,color:"#059669"}}/>} accent="#f0fdf4"/>
        <StatCard title="Avg. Risk Score" value={stats.avgRiskScore} sub="Exposure level" icon={<TrendingUp style={{height:18,width:18,color:"#d97706"}}/>} accent="#fffbeb"
          trend={stats.highRisks > 0 ? `⚠ ${stats.highRisks} high` : stats.totalRisks > 0 ? "✓ Under control" : undefined}/>
      </div>

      {/* ── Main grid ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>

        {/* Management Summary */}
        <SectionCard title="Management Summary" subtitle="Current project control position">
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {[
              { label:"Risk Position", icon:<ShieldAlert style={{height:14,width:14,color:"#6d28d9"}}/>, value: stats.highRisks > 0 ? `${stats.highRisks} high risks active` : "No high risks", color: stats.highRisks > 0 ? "#fef2f2" : "#f0fdf4" },
              { label:"Action Control", icon:<CheckCheck style={{height:14,width:14,color:"#2563eb"}}/>, value: stats.overdueActions > 0 ? `${stats.overdueActions} overdue actions` : "No overdue actions", color: stats.overdueActions > 0 ? "#fef2f2" : "#f0fdf4" },
              { label:"Reviews Due", icon:<Clock style={{height:14,width:14,color:"#d97706"}}/>, value: stats.upcomingReviews > 0 ? `${stats.upcomingReviews} reviews in 14 days` : "No upcoming reviews", color: stats.upcomingReviews > 0 ? "#fffbeb" : "#f8fafc" },
              { label:"Notifications", icon:<Bell style={{height:14,width:14,color:"#64748b"}}/>, value: stats.unreadNotifications > 0 ? `${stats.unreadNotifications} unread` : "All caught up", color: stats.unreadNotifications > 0 ? "#fffbeb" : "#f8fafc" },
            ].map(item => (
              <div key={item.label} style={{ borderRadius:12, background:item.color, padding:"14px 16px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                  {item.icon}
                  <span style={{ fontSize:11, fontWeight:600, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.06em" }}>{item.label}</span>
                </div>
                <p style={{ fontSize:13, color:"#1e293b", fontWeight:500 }}>{item.value}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Risk Exposure */}
        <SectionCard title="Risk Exposure" subtitle="Distribution across register">
          {stats.totalRisks === 0 ? (
            <div style={{ textAlign:"center", padding:"24px 0", color:"#94a3b8", fontSize:13 }}>No risks registered yet</div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {[
                { label:"High", count:stats.highRisks, total:stats.totalRisks, color:"#ef4444", bg:"#fef2f2" },
                { label:"Medium", count:stats.mediumRisks, total:stats.totalRisks, color:"#f59e0b", bg:"#fffbeb" },
                { label:"Low", count:stats.lowRisks, total:stats.totalRisks, color:"#22c55e", bg:"#f0fdf4" },
              ].map(item => (
                <div key={item.label}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                    <span style={{ fontSize:13, fontWeight:500, color:"#374151" }}>{item.label}</span>
                    <span style={{ fontSize:13, fontWeight:700, color:item.color }}>{item.count}</span>
                  </div>
                  <div style={{ height:8, borderRadius:4, background:"#f1f5f9", overflow:"hidden" }}>
                    <div style={{ height:"100%", borderRadius:4, background:item.color, width: item.total > 0 ? `${(item.count/item.total)*100}%` : "0%", transition:"width 600ms ease" }}/>
                  </div>
                </div>
              ))}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginTop:4 }}>
                {[
                  { label:"Open", count: risks.filter(r=>r.status==="open").length, color:"#2563eb" },
                  { label:"Monitoring", count: risks.filter(r=>r.status==="monitoring").length, color:"#d97706" },
                  { label:"Mitigated", count: risks.filter(r=>r.status==="mitigated").length, color:"#16a34a" },
                ].map(s => (
                  <div key={s.label} style={{ borderRadius:10, background:"#f8fafc", padding:"10px 12px", textAlign:"center" }}>
                    <p style={{ fontSize:20, fontWeight:700, color:s.color }}>{s.count}</p>
                    <p style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SectionCard>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
        {/* Top Risks */}
        <SectionCard title="Top Risks" subtitle="Highest exposure"
          action={<Link href={`/app/projects/${projectId}/risk-register`} style={{ display:"flex", alignItems:"center", gap:4, fontSize:12, color:"#7c3aed", textDecoration:"none", fontWeight:600 }}>View all<ArrowRight style={{height:12,width:12}}/></Link>}>
          {topRisks.length === 0
            ? <div style={{ textAlign:"center", padding:"24px 0", color:"#94a3b8", fontSize:13 }}>No risks yet</div>
            : topRisks.map(r => <RiskRow key={r.id} risk={r} projectId={projectId}/>)
          }
        </SectionCard>

        {/* Urgent Actions */}
        <SectionCard title="Urgent Actions" subtitle="High priority & overdue"
          action={<Link href={`/app/projects/${projectId}/actions`} style={{ display:"flex", alignItems:"center", gap:4, fontSize:12, color:"#7c3aed", textDecoration:"none", fontWeight:600 }}>View all<ArrowRight style={{height:12,width:12}}/></Link>}>
          {urgentActions.length === 0
            ? <div style={{ textAlign:"center", padding:"24px 0", color:"#94a3b8", fontSize:13 }}>No urgent actions</div>
            : urgentActions.map(a => <ActionRow key={a.id} action={a}/>)
          }
        </SectionCard>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {/* Category Distribution */}
        <SectionCard title="Risk by Category" subtitle="Top categories">
          {categoryDistribution.length === 0
            ? <div style={{ textAlign:"center", padding:"24px 0", color:"#94a3b8", fontSize:13 }}>No categorised risks</div>
            : categoryDistribution.map((cat, i) => (
              <div key={cat.label} style={{ display:"flex", alignItems:"center", gap:12, padding:"8px 0", borderBottom: i < categoryDistribution.length-1 ? "1px solid #f8fafc" : "none" }}>
                <div style={{ fontSize:12, fontWeight:600, color:"#94a3b8", width:18, textAlign:"center" }}>{i+1}</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:13, fontWeight:500, color:"#374151" }}>{cat.label}</span>
                    <span style={{ fontSize:13, fontWeight:700, color:"#6d28d9" }}>{cat.count}</span>
                  </div>
                  <div style={{ height:5, borderRadius:3, background:"#f1f5f9" }}>
                    <div style={{ height:"100%", borderRadius:3, background:"#7c3aed", width:`${(cat.count/stats.totalRisks)*100}%` }}/>
                  </div>
                </div>
              </div>
            ))
          }
        </SectionCard>

        {/* Recent Notifications */}
        <SectionCard title="Recent Notifications" subtitle="Latest project alerts"
          action={<Link href={`/app/projects/${projectId}/notifications`} style={{ display:"flex", alignItems:"center", gap:4, fontSize:12, color:"#7c3aed", textDecoration:"none", fontWeight:600 }}>View all<ArrowRight style={{height:12,width:12}}/></Link>}>
          {notifications.length === 0
            ? <div style={{ textAlign:"center", padding:"24px 0", color:"#94a3b8", fontSize:13 }}>No notifications</div>
            : notifications.slice(0,5).map(n => (
              <div key={n.id} style={{ display:"flex", gap:12, padding:"10px 0", borderBottom:"1px solid #f8fafc" }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background: n.is_read ? "#e2e8f0" : "#7c3aed", flexShrink:0, marginTop:5 }}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight: n.is_read ? 400 : 600, color: n.is_read ? "#64748b" : "#1e293b", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{n.title}</p>
                  {n.body && <p style={{ fontSize:12, color:"#94a3b8", marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{n.body}</p>}
                  <p style={{ fontSize:11, color:"#cbd5e1", marginTop:3 }}>{timeAgo(n.created_at)}</p>
                </div>
              </div>
            ))
          }
        </SectionCard>
      </div>
    </div>
  );
}
