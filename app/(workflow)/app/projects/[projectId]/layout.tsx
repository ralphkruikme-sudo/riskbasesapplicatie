"use client";

import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  ArrowLeft, BarChart3, ClipboardList, FileText, Settings,
  ShieldAlert, Users, CheckSquare, ChevronDown, LogOut, Bell,
  CalendarRange,
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Project = { id: string; name: string; status: string | null };
type Profile = { full_name: string | null; avatar_url: string | null };

function getStatusClasses(status: string | null) {
  switch (status) {
    case "active": return "bg-emerald-100 text-emerald-700";
    case "at_risk": return "bg-amber-100 text-amber-700";
    case "high_risk": return "bg-red-100 text-red-700";
    default: return "bg-slate-100 text-slate-600";
  }
}
function getStatusLabel(status: string | null) {
  switch (status) {
    case "active": return "Active";
    case "at_risk": return "At Risk";
    case "high_risk": return "High Risk";
    default: return "Draft";
  }
}

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [expanded, setExpanded] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function loadShellData() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }

      const [{ data: projectData, error: projectError }, { data: profileData }] = await Promise.all([
        supabase.from("projects").select("id, name, status").eq("id", projectId).single(),
        supabase.from("profiles").select("full_name, avatar_url").eq("id", user.id).maybeSingle(),
      ]);

      if (projectError || !projectData) { router.push("/app"); return; }
      setProject(projectData);
      setProfile(profileData || null);

      const { count } = await supabase
        .from("notifications").select("*", { count: "exact", head: true })
        .eq("user_id", user.id).eq("project_id", projectId).eq("is_read", false);
      setUnreadCount(count || 0);
      setLoading(false);
    }
    if (projectId) loadShellData();
  }, [projectId, router]);

  async function handleLogout() {
    setLoggingOut(true);
    try { await supabase.auth.signOut(); router.push("/auth"); }
    finally { setLoggingOut(false); }
  }

  const navItems = useMemo(() => [
    { label: "Dashboard",        href: `/app/projects/${projectId}`,                  icon: BarChart3 },
    { label: "Risk Register",    href: `/app/projects/${projectId}/risk-register`,     icon: ClipboardList },
    { label: "Risk Analysis",    href: `/app/projects/${projectId}/risk-analysis`,     icon: ShieldAlert },
    { label: "Project Timeline", href: `/app/projects/${projectId}/project-timeline`,  icon: CalendarRange },
    { label: "Actions",          href: `/app/projects/${projectId}/actions`,           icon: CheckSquare },
    { label: "Stakeholders",     href: `/app/projects/${projectId}/stakeholders`,      icon: Users },
    { label: "Reports",          href: `/app/projects/${projectId}/reports`,           icon: FileText },
  ], [projectId]);

  if (loading) {
    return (
      <div style={{ display:"flex", height:"100vh", overflow:"hidden", background:"#f7f7fb" }}>
        <div style={{ width:72, flexShrink:0, background:"#ffffff", borderRight:"1px solid #e8eaf0" }}/>
        <div style={{ flex:1, padding:32 }}>
          <div style={{ borderRadius:16, border:"1px solid #e8eaf0", background:"white", padding:40 }}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", background:"#f7f7fb" }}>

      {/* ── WHITE COLLAPSIBLE SIDEBAR ── */}
      <aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        style={{
          width: expanded ? 240 : 72, flexShrink: 0,
          display: "flex", flexDirection: "column",
          background: "#ffffff", borderRight: "1px solid #e8eaf0",
          transition: "width 280ms ease", overflow: "hidden",
          height: "100vh",
        }}
      >
        {/* Logo area — WHITE */}
        <div style={{ height:72, display:"flex", alignItems:"center", padding:"0 18px", borderBottom:"1px solid #e8eaf0", flexShrink:0, background:"#ffffff" }}>
          <img src="/logo-icon.png" alt="RiskBases" style={{ height:36, width:36, borderRadius:10, objectFit:"contain", flexShrink:0 }}/>
          <div style={{ overflow:"hidden", transition:"all 280ms", marginLeft: expanded ? 12 : 0, width: expanded ? 160 : 0, opacity: expanded ? 1 : 0 }}>
            <p style={{ whiteSpace:"nowrap", fontSize:16, fontWeight:700, color:"#1a1a2e" }}>RiskBases</p>
            <p style={{ whiteSpace:"nowrap", fontSize:11, color:"#94a3b8" }}>Project workspace</p>
          </div>
        </div>

        {/* Everything below the line — DARK PURPLE */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", background:"linear-gradient(180deg, #1e2140 0%, #171929 100%)", overflow:"hidden" }}>

          {/* Back to workspace */}
          <div style={{ padding:"10px 10px 4px", flexShrink:0 }}>
            <Link href="/app" style={{
              display:"flex", alignItems:"center", height:40, borderRadius:8, padding:"0 12px",
              color:"rgba(255,255,255,0.6)", textDecoration:"none", fontSize:13, fontWeight:500, transition:"background 150ms",
            }}
              onMouseEnter={e => (e.currentTarget.style.background="rgba(255,255,255,0.08)")}
              onMouseLeave={e => (e.currentTarget.style.background="transparent")}
            >
              <ArrowLeft style={{ height:16, width:16, flexShrink:0 }}/>
              <span style={{ overflow:"hidden", whiteSpace:"nowrap", marginLeft: expanded ? 10 : 0, width: expanded ? "auto" : 0, opacity: expanded ? 1 : 0, transition:"all 280ms" }}>
                Back to Workspace
              </span>
            </Link>
          </div>

          {/* Nav items */}
          <nav style={{ flex:1, overflowY:"auto", padding:"4px 10px" }}>
            {navItems.map(item => {
              const active = pathname === item.href || (item.href !== `/app/projects/${projectId}` && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} style={{
                  display:"flex", alignItems:"center", height:44, borderRadius:10, padding:"0 12px", marginBottom:2,
                  background: active ? "rgba(255,255,255,0.15)" : "transparent",
                  color: active ? "#ffffff" : "rgba(255,255,255,0.6)",
                  textDecoration:"none", fontWeight: active ? 600 : 500, fontSize:14,
                  transition:"background 150ms",
                }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background="rgba(255,255,255,0.08)"; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background="transparent"; }}
                >
                  <Icon style={{ height:18, width:18, flexShrink:0, color: active ? "#ffffff" : "rgba(255,255,255,0.55)" }}/>
                  <span style={{ overflow:"hidden", whiteSpace:"nowrap", marginLeft: expanded ? 12 : 0, width: expanded ? "auto" : 0, opacity: expanded ? 1 : 0, transition:"all 280ms" }}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom: settings + logout + user */}
          <div style={{ padding:"4px 10px 16px", borderTop:"1px solid rgba(255,255,255,0.08)", flexShrink:0 }}>
            <Link href={`/app/projects/${projectId}/settings`} style={{
              display:"flex", alignItems:"center", height:44, borderRadius:10, padding:"0 12px", marginBottom:2,
              color:"rgba(255,255,255,0.55)", textDecoration:"none", fontSize:14, fontWeight:500, transition:"background 150ms",
            }}
              onMouseEnter={e => (e.currentTarget.style.background="rgba(255,255,255,0.08)")}
              onMouseLeave={e => (e.currentTarget.style.background="transparent")}
            >
              <Settings style={{ height:18, width:18, flexShrink:0, color:"rgba(255,255,255,0.4)" }}/>
              <span style={{ overflow:"hidden", whiteSpace:"nowrap", marginLeft: expanded ? 12 : 0, width: expanded ? "auto" : 0, opacity: expanded ? 1 : 0, transition:"all 280ms" }}>Settings</span>
            </Link>

            <button onClick={handleLogout} disabled={loggingOut} style={{
              display:"flex", alignItems:"center", height:44, borderRadius:10, padding:"0 12px", marginBottom:4,
              background:"transparent", border:"none", cursor:"pointer", width:"100%", fontSize:14, fontWeight:500,
              color:"rgba(255,255,255,0.55)", transition:"background 150ms",
            }}
              onMouseEnter={e => (e.currentTarget.style.background="rgba(255,255,255,0.08)")}
              onMouseLeave={e => (e.currentTarget.style.background="transparent")}
            >
              <LogOut style={{ height:18, width:18, flexShrink:0, color:"rgba(255,255,255,0.4)" }}/>
              <span style={{ overflow:"hidden", whiteSpace:"nowrap", marginLeft: expanded ? 12 : 0, width: expanded ? "auto" : 0, opacity: expanded ? 1 : 0, transition:"all 280ms" }}>
                {loggingOut ? "Logging out..." : "Log out"}
              </span>
            </button>

            {/* User avatar */}
            <div style={{ display:"flex", alignItems:"center", height:44, borderRadius:10, padding:"0 10px" }}>
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt={profile.full_name||"User"} style={{ height:28, width:28, borderRadius:"50%", objectFit:"cover", flexShrink:0 }}/>
                : <div style={{ height:28, width:28, borderRadius:"50%", background:"#7c3aed", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"white", flexShrink:0 }}>
                    {(profile?.full_name||"R").slice(0,1).toUpperCase()}
                  </div>
              }
              <div style={{ overflow:"hidden", transition:"all 280ms", marginLeft: expanded ? 10 : 0, width: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}>
                <p style={{ whiteSpace:"nowrap", fontSize:13, fontWeight:600, color:"#ffffff", maxWidth:160, overflow:"hidden", textOverflow:"ellipsis" }}>{profile?.full_name||"User"}</p>
              </div>
            </div>
          </div>

        </div>{/* end dark purple section */}
      </aside>

      {/* ── MAIN AREA ── */}
      <div style={{ display:"flex", flexDirection:"column", flex:1, overflow:"hidden", minWidth:0 }}>
        {/* Header */}
        <header style={{ height:72, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid #e8eaf0", background:"#ffffff", padding:"0 28px", zIndex:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, minWidth:0, flex:1 }}>
            <Link href="/app" style={{ fontSize:14, color:"#94a3b8", textDecoration:"none" }}
              onMouseEnter={e=>(e.currentTarget.style.color="#374151")}
              onMouseLeave={e=>(e.currentTarget.style.color="#94a3b8")}>Workspace</Link>
            <span style={{ color:"#e2e8f0" }}>/</span>
            <span style={{ fontSize:15, fontWeight:600, color:"#1e293b", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{project?.name}</span>
            <span style={{ padding:"2px 10px", borderRadius:20, fontSize:12, fontWeight:600, flexShrink:0 }} className={getStatusClasses(project?.status??null)}>
              {getStatusLabel(project?.status??null)}
            </span>
            <ChevronDown style={{ height:16, width:16, color:"#94a3b8", flexShrink:0 }}/>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
            <Link href={`/app/projects/${projectId}/notifications`} style={{
              position:"relative", display:"flex", alignItems:"center", justifyContent:"center",
              height:40, width:40, borderRadius:10, border:"1px solid #e8eaf0", background:"white", color:"#64748b", textDecoration:"none",
            }}>
              <Bell style={{ height:18, width:18 }}/>
              {unreadCount > 0 && (
                <span style={{ position:"absolute", top:-4, right:-4, height:18, minWidth:18, borderRadius:9, background:"#ef4444", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:"white", padding:"0 4px" }}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>

            <div style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 12px", borderRadius:10, border:"1px solid #e8eaf0", background:"white" }}>
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt={profile.full_name||"User"} style={{ height:32, width:32, borderRadius:"50%", objectFit:"cover" }}/>
                : <div style={{ height:32, width:32, borderRadius:"50%", background:"#7c3aed", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"white" }}>
                    {(profile?.full_name||"R").slice(0,1).toUpperCase()}
                  </div>
              }
              <span style={{ fontSize:14, fontWeight:600, color:"#374151" }} className="hidden sm:block">{profile?.full_name||"User"}</span>
              <ChevronDown style={{ height:14, width:14, color:"#94a3b8" }}/>
            </div>
          </div>
        </header>

        <main style={{ flex:1, overflowY:"auto", minWidth:0 }}>{children}</main>
      </div>
    </div>
  );
}
