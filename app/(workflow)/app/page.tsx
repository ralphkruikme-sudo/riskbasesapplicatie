"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Search,
  X,
  Plus,
  Settings,
  AlertTriangle,
  Clock3,
  Layers3,
  ChevronRight,
  Trash2,
  Camera,
  PencilRuler,
  Upload,
  Link2,
  ShieldAlert,
  BadgeCheck,
  RefreshCw,
  Bell,
  CheckCircle2,
  FolderKanban,
  Shield,
  Users,
  ClipboardList,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Project = {
  id: string;
  name: string;
  status: string;
  open_risks_count: number;
  updated_at: string;
  intake_method: "manual" | "csv" | "api" | null;
  image_url?: string | null;
};

type ProjectRisk = {
  id: string;
  project_id: string;
  score: number | null;
  level: string | null;
  due_review_date?: string | null;
  status?: string | null;
};

type ProjectAction = {
  id: string;
  project_id: string;
  title?: string | null;
  priority?: string | null;
  created_at: string;
  due_date?: string | null;
  status?: string | null;
};

type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
};

type ProjectMember = {
  project_id: string;
  user_id: string;
  profiles?: Profile | null;
};

type WorkspaceRelation = {
  id: string;
  name: string | null;
  company_name: string | null;
  join_key: string | null;
};

type WorkspaceMembership = {
  workspace_id: string;
  role: string | null;
  workspaces: WorkspaceRelation[] | null;
};

type ActivityItem = {
  id: string;
  actor: string;
  actorInitials: string;
  dotColor: string;
  avatarColor: string;
  message: string;
  project?: string;
  time: string;
};

type InsightSeverity = "critical" | "warning" | "info" | "positive";

type WorkspaceInsight = {
  id: string;
  severity: InsightSeverity;
  title: string;
  description: string;
  stat?: string;
  ctaLabel?: string;
  projectId?: string;
};

type StartMethod = "scratch" | "import" | "connect";

const AVATAR_COLORS = [
  "bg-blue-600",
  "bg-indigo-600",
  "bg-sky-600",
  "bg-emerald-600",
  "bg-amber-500",
  "bg-slate-700",
];

function hashStr(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function getInitials(name: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function timeAgo(d: string) {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 172800) return "1 day ago";
  return `${Math.floor(diff / 86400)} days ago`;
}

function daysAgo(date?: string | null) {
  if (!date) return null;
  const diff = Date.now() - new Date(date).getTime();
  return Math.floor(diff / 86400000);
}

function isOverdue(date?: string | null) {
  if (!date) return false;
  return new Date(date).getTime() < Date.now();
}

function getStatusBadge(status: string) {
  const s = (status ?? "").toLowerCase();

  if (s === "high_risk" || s === "high risk") {
    return {
      dot: "bg-red-500",
      pill: "text-red-700 bg-red-50 border border-red-100",
      label: "High Risk",
    };
  }

  if (s === "at_risk" || s === "at risk") {
    return {
      dot: "bg-amber-500",
      pill: "text-amber-700 bg-amber-50 border border-amber-100",
      label: "At Risk",
    };
  }

  return {
    dot: "bg-emerald-500",
    pill: "text-emerald-700 bg-emerald-50 border border-emerald-100",
    label: "Active",
  };
}

function getRiskStyle(level: string | null, score: number | null) {
  const l = (level ?? "").toLowerCase();

  if (l === "high" || (score !== null && score >= 70)) {
    return {
      bg: "bg-red-50 border border-red-100 text-red-700",
      label: "High",
    };
  }

  if (l === "moderate" || l === "medium" || (score !== null && score >= 40)) {
    return {
      bg: "bg-amber-50 border border-amber-100 text-amber-700",
      label: "Moderate",
    };
  }

  return {
    bg: "bg-emerald-50 border border-emerald-100 text-emerald-700",
    label: "Low",
  };
}

function getInsightTone(severity: InsightSeverity) {
  switch (severity) {
    case "critical":
      return {
        badge: "bg-red-50 text-red-700 border border-red-100",
        iconColor: "text-red-600",
      };
    case "warning":
      return {
        badge: "bg-amber-50 text-amber-700 border border-amber-100",
        iconColor: "text-amber-600",
      };
    case "positive":
      return {
        badge: "bg-emerald-50 text-emerald-700 border border-emerald-100",
        iconColor: "text-emerald-600",
      };
    default:
      return {
        badge: "bg-blue-50 text-blue-700 border border-blue-100",
        iconColor: "text-blue-600",
      };
  }
}

function getInsightIcon(severity: InsightSeverity, title: string) {
  const t = title.toLowerCase();

  if (severity === "critical") return ShieldAlert;
  if (t.includes("team")) return Users;
  if (t.includes("review")) return ClipboardList;
  if (severity === "positive") return BadgeCheck;
  return Shield;
}

type PType =
  | "construction"
  | "tunnel"
  | "tower"
  | "wind"
  | "renovation"
  | "planning"
  | "water"
  | "energy"
  | "default";

function detectType(name: string, indexHint: number = 0): PType {
  const l = name.toLowerCase();
  if (l.includes("tunnel")) return "tunnel";
  if (l.includes("tower") || l.includes("toren")) return "tower";
  if (l.includes("wind") || l.includes("offshore")) return "wind";
  if (l.includes("renovati") || l.includes("meent")) return "renovation";
  if (l.includes("planning") || l.includes("plan") || l.includes("plein")) return "planning";
  if (l.includes("water") || l.includes("haven") || l.includes("port") || l.includes("brug")) return "water";
  if (l.includes("energy") || l.includes("solar") || l.includes("power") || l.includes("energie")) return "energy";
  if (l.includes("bouw") || l.includes("construction") || l.includes("build") || l.includes("gebouw")) return "construction";

  const fallbacks: PType[] = ["default", "construction", "planning", "water", "energy", "tower"];
  return fallbacks[indexHint % fallbacks.length];
}

const TYPE_BG: Record<PType, string> = {
  construction: "#eaf1fb",
  tunnel: "#edf3fa",
  tower: "#eef5fb",
  wind: "#ebf8f2",
  renovation: "#f7f4ea",
  planning: "#f3f5fb",
  water: "#eaf5f9",
  energy: "#f7f8eb",
  default: "#eef3fb",
};

function buildWorkspaceInsights(params: {
  projects: Project[];
  projectRisks: Record<string, ProjectRisk[]>;
  projectActions: Record<string, ProjectAction[]>;
  projectMembers: Record<string, ProjectMember[]>;
}): WorkspaceInsight[] {
  const { projects, projectRisks, projectActions, projectMembers } = params;
  const insights: WorkspaceInsight[] = [];

  if (!projects.length) {
    return [
      {
        id: "empty",
        severity: "info",
        title: "No projects yet",
        description: "Create your first project to start tracking risks, actions and reviews.",
        ctaLabel: "Create project",
      },
    ];
  }

  const facts = projects.map((project) => {
    const risks = projectRisks[project.id] ?? [];
    const actions = projectActions[project.id] ?? [];
    const members = projectMembers[project.id] ?? [];

    const highRisks = risks.filter((r) => (r.level ?? "").toLowerCase() === "high").length;
    const openRisks = risks.filter((r) => {
      const s = (r.status ?? "open").toLowerCase();
      return s !== "closed" && s !== "archived" && s !== "mitigated";
    }).length;

    const overdueActions = actions.filter((a) => {
      const s = (a.status ?? "").toLowerCase();
      return s !== "done" && isOverdue(a.due_date);
    }).length;

    const upcomingReviews = risks.filter((r) => {
      if (!r.due_review_date) return false;
      const d = new Date(r.due_review_date).getTime();
      return d >= Date.now() && d <= Date.now() + 14 * 86400000;
    }).length;

    const staleDays = daysAgo(project.updated_at);

    return {
      project,
      highRisks,
      openRisks,
      overdueActions,
      upcomingReviews,
      staleDays,
      memberCount: members.length,
    };
  });

  const byHighRisks = [...facts].sort((a, b) => b.highRisks - a.highRisks);
  const byOverdueActions = [...facts].sort((a, b) => b.overdueActions - a.overdueActions);
  const byStale = [...facts]
    .filter((x) => x.staleDays !== null)
    .sort((a, b) => (b.staleDays ?? 0) - (a.staleDays ?? 0));

  const worstRiskProject = byHighRisks[0];
  if (worstRiskProject && worstRiskProject.highRisks > 0) {
    insights.push({
      id: `high-risks-${worstRiskProject.project.id}`,
      severity: "critical",
      title: "Critical risk exposure",
      description: `${worstRiskProject.project.name} has ${worstRiskProject.highRisks} high-risk items that need review.`,
      projectId: worstRiskProject.project.id,
      ctaLabel: "Open project",
      stat: `${worstRiskProject.highRisks} high`,
    });
  }

  const worstActionProject = byOverdueActions[0];
  if (worstActionProject && worstActionProject.overdueActions > 0) {
    insights.push({
      id: `overdue-actions-${worstActionProject.project.id}`,
      severity: "warning",
      title: "Overdue actions detected",
      description: `${worstActionProject.project.name} has ${worstActionProject.overdueActions} overdue actions that may affect control.`,
      projectId: worstActionProject.project.id,
      ctaLabel: "Review actions",
      stat: `${worstActionProject.overdueActions} overdue`,
    });
  }

  const staleProject = byStale[0];
  if (staleProject && (staleProject.staleDays ?? 0) >= 14) {
    insights.push({
      id: `stale-${staleProject.project.id}`,
      severity: "warning",
      title: "Project needs update",
      description: `${staleProject.project.name} has not been updated for ${staleProject.staleDays} days.`,
      projectId: staleProject.project.id,
      ctaLabel: "Open project",
      stat: `${staleProject.staleDays}d stale`,
    });
  }

  const coverageGap = facts.find((x) => x.memberCount === 0 && x.openRisks > 0);
  if (coverageGap) {
    insights.push({
      id: `coverage-${coverageGap.project.id}`,
      severity: "info",
      title: "Team coverage missing",
      description: `${coverageGap.project.name} has active risks but no linked project members yet.`,
      projectId: coverageGap.project.id,
      ctaLabel: "Open project",
      stat: "0 linked",
    });
  }

  const reviewProject = facts.find((x) => x.upcomingReviews > 0);
  if (reviewProject) {
    insights.push({
      id: `reviews-${reviewProject.project.id}`,
      severity: "info",
      title: "Upcoming review window",
      description: `${reviewProject.project.name} has ${reviewProject.upcomingReviews} risk reviews due in the next 14 days.`,
      projectId: reviewProject.project.id,
      ctaLabel: "Plan review",
      stat: `${reviewProject.upcomingReviews} due`,
    });
  }

  if (!insights.length) {
    insights.push({
      id: "healthy",
      severity: "positive",
      title: "Workspace looks healthy",
      description: "No urgent control gaps detected. Add more project data to unlock deeper recommendations.",
      stat: "Stable",
    });
  }

  return insights.slice(0, 4);
}

function Illustration({ type }: { type: PType }) {
  switch (type) {
    case "construction":
      return (
        <svg viewBox="0 0 280 176" fill="none" className="h-full w-full">
          <ellipse cx="140" cy="155" rx="95" ry="11" fill="#c8d8f0" opacity="0.45" />
          <rect x="82" y="88" width="78" height="67" rx="3" fill="#5b7bb2" />
          <rect x="87" y="93" width="15" height="19" rx="2" fill="#c4d4ea" />
          <rect x="108" y="93" width="15" height="19" rx="2" fill="#c4d4ea" />
          <rect x="129" y="93" width="15" height="19" rx="2" fill="#c4d4ea" />
          <rect x="87" y="119" width="15" height="20" rx="2" fill="#c4d4ea" />
          <rect x="108" y="119" width="15" height="20" rx="2" fill="#c4d4ea" />
          <rect x="129" y="119" width="23" height="36" rx="2" fill="#47689f" />
          <rect x="153" y="22" width="8" height="133" rx="2" fill="#e6b54a" />
          <rect x="122" y="22" width="70" height="8" rx="2" fill="#e6b54a" />
        </svg>
      );
    case "planning":
      return (
        <svg viewBox="0 0 280 176" fill="none" className="h-full w-full">
          <ellipse cx="140" cy="158" rx="88" ry="10" fill="#d4dceb" opacity="0.4" />
          <rect x="83" y="38" width="114" height="122" rx="6" fill="#f6f8fc" stroke="#cfd9e9" strokeWidth="2" />
          <rect x="113" y="31" width="54" height="18" rx="6" fill="#7d98c2" />
          <rect x="125" y="34" width="30" height="10" rx="3" fill="#f6f8fc" />
          <rect x="96" y="66" width="88" height="8" rx="2" fill="#dfe7f2" />
          <circle cx="103" cy="70" r="5" fill="#4871ae" />
          <path d="M100 70 L102 72 L106 68" stroke="white" strokeWidth="1.5" fill="none" />
          <rect x="96" y="82" width="88" height="8" rx="2" fill="#dfe7f2" />
          <circle cx="103" cy="86" r="5" fill="#4871ae" />
          <path d="M100 86 L102 88 L106 84" stroke="white" strokeWidth="1.5" fill="none" />
        </svg>
      );
    case "renovation":
      return (
        <svg viewBox="0 0 280 176" fill="none" className="h-full w-full">
          <ellipse cx="140" cy="158" rx="100" ry="10" fill="#e0d8c2" opacity="0.5" />
          <path d="M88 122 Q88 78 140 73 Q192 78 192 122 Z" fill="#d9b35c" />
          <rect x="80" y="120" width="120" height="12" rx="4" fill="#c79a3f" />
          <rect x="74" y="126" width="132" height="8" rx="4" fill="#d9b35c" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 280 176" fill="none" className="h-full w-full">
          <ellipse cx="140" cy="155" rx="95" ry="11" fill="#c8d8f0" opacity="0.45" />
          <rect x="82" y="88" width="78" height="67" rx="3" fill="#5b7bb2" />
          <rect x="87" y="93" width="15" height="19" rx="2" fill="#c4d4ea" />
          <rect x="108" y="93" width="15" height="19" rx="2" fill="#c4d4ea" />
          <rect x="129" y="93" width="15" height="19" rx="2" fill="#c4d4ea" />
          <rect x="87" y="119" width="15" height="20" rx="2" fill="#c4d4ea" />
          <rect x="108" y="119" width="15" height="20" rx="2" fill="#c4d4ea" />
          <rect x="129" y="119" width="23" height="36" rx="2" fill="#47689f" />
          <rect x="153" y="22" width="8" height="133" rx="2" fill="#e6b54a" />
          <rect x="122" y="22" width="70" height="8" rx="2" fill="#e6b54a" />
        </svg>
      );
  }
}

function StatPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 whitespace-nowrap rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
      {icon}
      {label}
    </div>
  );
}

function RiskScorePill({ score, level }: { score: number | null; level: string | null }) {
  if (score === null && !level) return null;
  const tone = getRiskStyle(level, score);

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-semibold ${tone.bg}`}>
      <span>Score {score ?? 0}</span>
      <span>{tone.label}</span>
    </div>
  );
}

function CardImage({
  project,
  onUpload,
  projectIndex = 0,
}: {
  project: Project;
  onUpload: (id: string, f: File) => Promise<void>;
  projectIndex?: number;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const type = detectType(project.name, projectIndex);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await onUpload(project.id, file);
    } finally {
      setUploading(false);
    }
  }

  function handleCameraClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    fileRef.current?.click();
  }

  return (
    <div className="relative h-31 overflow-hidden" style={{ background: TYPE_BG[type] }}>
      {project.image_url ? (
        <img src={project.image_url} alt={project.name} className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full">
          <Illustration type={type} />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/5 via-transparent to-transparent" />

      <div className="absolute left-3 top-3">
        <span className="inline-flex items-center gap-1 rounded-full border border-white/80 bg-white/92 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Active
        </span>
      </div>

      <div className="absolute right-3 top-3 flex items-center gap-2">
        <button
          type="button"
          onClick={handleCameraClick}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/92 shadow-sm transition hover:bg-white"
          title="Change project cover"
        >
          {uploading ? (
            <RefreshCw className="h-4 w-4 animate-spin text-slate-600" />
          ) : (
            <Camera className="h-4 w-4 text-slate-700" />
          )}
        </button>
      </div>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

function ProjectsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectMembers, setProjectMembers] = useState<Record<string, ProjectMember[]>>({});
  const [projectRisks, setProjectRisks] = useState<Record<string, ProjectRisk[]>>({});
  const [projectActions, setProjectActions] = useState<Record<string, ProjectAction[]>>({});
  const [activityItems, setActivityItems] = useState<ActivityItem[]>([]);
  const [workspaceInsights, setWorkspaceInsights] = useState<WorkspaceInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingProject, setCreatingProject] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [startMethod, setStartMethod] = useState<StartMethod>("scratch");

  const [showActivityMenu, setShowActivityMenu] = useState(false);
  const [activityOnlyMine, setActivityOnlyMine] = useState(false);
  const [activityAutoRefresh, setActivityAutoRefresh] = useState(true);
  const [refreshingPanels, setRefreshingPanels] = useState(false);

  const activityMenuRef = useRef<HTMLDivElement | null>(null);

  const workspaceFromUrl = searchParams.get("workspace");

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (activityMenuRef.current && !activityMenuRef.current.contains(e.target as Node)) {
        setShowActivityMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function loadWorkspaceData() {
    setLoading(true);
    setMessage("");

    try {
      const {
        data: { user },
        error: ue,
      } = await supabase.auth.getUser();

      if (ue || !user) {
        router.push("/auth");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      const fullName = profile?.full_name ?? "You";

      const { data: memberships, error: me } = await supabase
        .from("workspace_members")
        .select("workspace_id, role, workspaces (id, name, company_name, join_key)")
        .eq("user_id", user.id);

      if (me) throw me;

      const membershipList = (memberships ?? []) as unknown as WorkspaceMembership[];

      if (!membershipList.length) {
        router.push("/onboarding");
        return;
      }

      const storedId =
        typeof window !== "undefined" ? localStorage.getItem("active_workspace_id") : null;
      const requestedId = workspaceFromUrl || storedId || null;
      const active =
        (requestedId ? membershipList.find((m) => m.workspace_id === requestedId) : null) ??
        membershipList[0];

      if (!active?.workspace_id) {
        router.push("/onboarding");
        return;
      }

      const ws = active.workspaces?.[0] ?? null;
      setWorkspaceId(active.workspace_id);

      if (typeof window !== "undefined") {
        localStorage.setItem("active_workspace_id", active.workspace_id);

        if (ws) {
          localStorage.setItem(
            "active_workspace",
            JSON.stringify({
              id: ws.id,
              name: ws.name ?? "",
              company_name: ws.company_name ?? "",
              join_key: ws.join_key ?? "",
            })
          );
        }
      }

      if (workspaceFromUrl !== active.workspace_id) {
        router.replace(`/app?workspace=${active.workspace_id}`);
      }

      let projs: Project[] = [];

      const { data: pd, error: pe } = await supabase
        .from("projects")
        .select("id, name, status, open_risks_count, updated_at, intake_method, image_url")
        .eq("workspace_id", active.workspace_id)
        .order("updated_at", { ascending: false });

      if (pe) {
        const { data: pd2, error: pe2 } = await supabase
          .from("projects")
          .select("id, name, status, open_risks_count, updated_at, intake_method")
          .eq("workspace_id", active.workspace_id)
          .order("updated_at", { ascending: false });

        if (pe2) throw pe2;
        projs = ((pd2 ?? []) as any[]).map((p) => ({ ...p, image_url: null }));
      } else {
        projs = ((pd ?? []) as any[]).map((p) => ({ ...p, image_url: p.image_url ?? null }));
      }

      setProjects(projs);

      if (!projs.length) {
        setProjectMembers({});
        setProjectRisks({});
        setProjectActions({});
        setActivityItems([]);
        setWorkspaceInsights(
          buildWorkspaceInsights({
            projects: [],
            projectRisks: {},
            projectActions: {},
            projectMembers: {},
          })
        );
        return;
      }

      const projectIds = projs.map((p) => p.id);

      const { data: md } = await supabase
        .from("project_members")
        .select("project_id, user_id, profiles (id, full_name, avatar_url)")
        .in("project_id", projectIds);

      const membersMap: Record<string, ProjectMember[]> = {};
      for (const m of md ?? []) {
        const pm = m as unknown as ProjectMember;
        if (!membersMap[pm.project_id]) membersMap[pm.project_id] = [];
        membersMap[pm.project_id].push(pm);
      }
      setProjectMembers(membersMap);

      const { data: rd } = await supabase
        .from("project_risks")
        .select("id, project_id, score, level, due_review_date, status")
        .in("project_id", projectIds);

      const risksMap: Record<string, ProjectRisk[]> = {};
      for (const r of rd ?? []) {
        const pr = r as ProjectRisk;
        if (!risksMap[pr.project_id]) risksMap[pr.project_id] = [];
        risksMap[pr.project_id].push(pr);
      }
      setProjectRisks(risksMap);

      let actionsRows: any[] = [];
      const { data: ad, error: ae } = await supabase
        .from("risk_actions")
        .select("id, project_id, title, priority, created_at, due_date, status")
        .in("project_id", projectIds)
        .order("created_at", { ascending: false });

      if (ae) {
        const { data: ad2, error: ae2 } = await supabase
          .from("risk_actions")
          .select("id, project_id, title, priority, created_at")
          .in("project_id", projectIds)
          .order("created_at", { ascending: false });

          if (ae2) throw ae2;
          actionsRows = ad2 ?? [];
      } else {
        actionsRows = ad ?? [];
      }

      const actionsMap: Record<string, ProjectAction[]> = {};
      for (const a of actionsRows) {
        const action = a as ProjectAction;
        if (!actionsMap[action.project_id]) actionsMap[action.project_id] = [];
        actionsMap[action.project_id].push(action);
      }
      setProjectActions(actionsMap);

      const initials = getInitials(fullName);
      const avatarColor = AVATAR_COLORS[hashStr(fullName) % AVATAR_COLORS.length];
      const activities: ActivityItem[] = [];

      if (projs[0]) {
        activities.push({
          id: "act-0",
          actor: fullName,
          actorInitials: initials,
          dotColor: "bg-blue-600",
          avatarColor,
          message: "completed <strong>'Safety review'</strong>",
          project: projs[0].name,
          time: timeAgo(projs[0].updated_at),
        });
      }

      for (const a of actionsRows.slice(0, 8)) {
        const proj = projs.find((p) => p.id === a.project_id);
        activities.push({
          id: a.id,
          actor: fullName,
          actorInitials: initials,
          dotColor: (a.priority ?? "").toLowerCase() === "high" ? "bg-red-500" : "bg-blue-600",
          avatarColor,
          message: `created action <strong>'${a.title ?? "Action"}'</strong>`,
          project: proj?.name,
          time: timeAgo(a.created_at),
        });
      }

      setActivityItems(activities.slice(0, 5));

      setWorkspaceInsights(
        buildWorkspaceInsights({
          projects: projs,
          projectRisks: risksMap,
          projectActions: actionsMap,
          projectMembers: membersMap,
        })
      );
    } catch (err: any) {
      setMessage(err?.message || "Could not load projects.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWorkspaceData();
  }, [router, workspaceFromUrl]);

  async function refreshWorkspacePanels() {
    if (!projects.length) return;

    setRefreshingPanels(true);
    try {
      const projectIds = projects.map((p) => p.id);

      const { data: rd } = await supabase
        .from("project_risks")
        .select("id, project_id, score, level, due_review_date, status")
        .in("project_id", projectIds);

      const risksMap: Record<string, ProjectRisk[]> = {};
      for (const r of rd ?? []) {
        const pr = r as ProjectRisk;
        if (!risksMap[pr.project_id]) risksMap[pr.project_id] = [];
        risksMap[pr.project_id].push(pr);
      }
      setProjectRisks(risksMap);

      const { data: md } = await supabase
        .from("project_members")
        .select("project_id, user_id, profiles (id, full_name, avatar_url)")
        .in("project_id", projectIds);

      const membersMap: Record<string, ProjectMember[]> = {};
      for (const m of md ?? []) {
        const pm = m as unknown as ProjectMember;
        if (!membersMap[pm.project_id]) membersMap[pm.project_id] = [];
        membersMap[pm.project_id].push(pm);
      }
      setProjectMembers(membersMap);

      let actionsRows: any[] = [];
      const { data: ad, error: ae } = await supabase
        .from("risk_actions")
        .select("id, project_id, title, priority, created_at, due_date, status")
        .in("project_id", projectIds)
        .order("created_at", { ascending: false });

      if (ae) {
        const { data: ad2, error: ae2 } = await supabase
          .from("risk_actions")
          .select("id, project_id, title, priority, created_at")
          .in("project_id", projectIds)
          .order("created_at", { ascending: false });

        if (ae2) throw ae2;
        actionsRows = ad2 ?? [];
      } else {
        actionsRows = ad ?? [];
      }

      const actionsMap: Record<string, ProjectAction[]> = {};
      for (const a of actionsRows) {
        const action = a as ProjectAction;
        if (!actionsMap[action.project_id]) actionsMap[action.project_id] = [];
        actionsMap[action.project_id].push(action);
      }
      setProjectActions(actionsMap);

      setWorkspaceInsights(
        buildWorkspaceInsights({
          projects,
          projectRisks: risksMap,
          projectActions: actionsMap,
          projectMembers: membersMap,
        })
      );
    } catch (err: any) {
      setMessage(err?.message || "Could not refresh workspace panels.");
    } finally {
      setRefreshingPanels(false);
    }
  }

  useEffect(() => {
    if (!activityAutoRefresh || !projects.length) return;
    const interval = setInterval(() => {
      refreshWorkspacePanels();
    }, 60000);
    return () => clearInterval(interval);
  }, [activityAutoRefresh, projects]);

  const totalOpenRisks = useMemo(
    () => projects.reduce((a, p) => a + (p.open_risks_count ?? 0), 0),
    [projects]
  );

  const criticalRisks = useMemo(
    () => Object.values(projectRisks).flat().filter((r) => (r.level ?? "").toLowerCase() === "high").length,
    [projectRisks]
  );

  const actionsDue = useMemo(
    () =>
      Object.values(projectActions)
        .flat()
        .filter((a) => {
          const s = (a.status ?? "").toLowerCase();
          return s !== "done" && isOverdue(a.due_date);
        }).length,
    [projectActions]
  );

  const filteredProjects = useMemo(
    () => projects.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    [projects, search]
  );

  function getProjectScore(pid: string) {
    const risks = projectRisks[pid] ?? [];
    if (!risks.length) return { score: null, level: null };

    const avg = Math.round(risks.map((r) => r.score ?? 0).reduce((a, b) => a + b, 0) / risks.length);
    const level = risks.some((r) => (r.level ?? "").toLowerCase() === "high")
      ? "high"
      : risks.some((r) => ["moderate", "medium"].includes((r.level ?? "").toLowerCase()))
      ? "moderate"
      : "low";

    return { score: avg, level };
  }

  function getProjectCriticalCount(pid: string) {
    return (projectRisks[pid] ?? []).filter((r) => (r.level ?? "").toLowerCase() === "high").length;
  }

  function getProjectModerateCount(pid: string) {
    return (projectRisks[pid] ?? []).filter((r) => {
      const lvl = (r.level ?? "").toLowerCase();
      return lvl === "moderate" || lvl === "medium";
    }).length;
  }

  async function handleUploadImage(projectId: string, file: File) {
    try {
      const ext = file.name.split(".").pop();
      const path = `project-covers/${projectId}.${ext}`;

      const { error: upErr } = await supabase.storage.from("projects").upload(path, file, { upsert: true });
      if (upErr) throw upErr;

      const {
        data: { publicUrl },
      } = supabase.storage.from("projects").getPublicUrl(path);

      await supabase.from("projects").update({ image_url: publicUrl }).eq("id", projectId);

      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, image_url: publicUrl } : p))
      );
    } catch (err: any) {
      alert(
        "Upload failed: " +
          (err?.message ?? "unknown") +
          "\n\nMake sure your projects table has an image_url column and your storage has a 'projects' bucket."
      );
    }
  }

  function openModal() {
    setMessage("");
    setProjectName("");
    setStartMethod("scratch");
    setShowCreateModal(true);
  }

  function closeModal() {
    if (creatingProject) return;
    setShowCreateModal(false);
  }

  async function handleCreate() {
    if (!workspaceId) return;

    setCreatingProject(true);
    setMessage("");

    try {
      const trimmed = projectName.trim();
      if (!trimmed) throw new Error("Please enter a project name.");

      const {
        data: { user },
        error: ue,
      } = await supabase.auth.getUser();

      if (ue || !user) throw new Error("No user found.");

      const intakeMethod =
        startMethod === "scratch" ? "manual" : startMethod === "import" ? "csv" : "api";

      const { data: project, error: pe } = await supabase
        .from("projects")
        .insert({
          workspace_id: workspaceId,
          name: trimmed,
          status: "active",
          open_risks_count: 0,
          created_by: user.id,
          intake_method: intakeMethod,
        })
        .select("id, name, status, open_risks_count, updated_at, intake_method")
        .single();

      if (pe) throw pe;
      if (!project) throw new Error("Could not create project.");

      setProjects((prev) => [{ ...(project as any), image_url: null } as Project, ...prev]);
      setShowCreateModal(false);

      if (startMethod === "scratch") {
        router.push(`/intake/${project.id}/step-1`);
        return;
      }

      if (startMethod === "import") {
        router.push(`/app/projects/${project.id}/import/csv`);
        return;
      }

      router.push(`/app/projects/${project.id}/import/api`);
    } catch (err: any) {
      setMessage(err?.message || "Could not create project.");
    } finally {
      setCreatingProject(false);
    }
  }

  async function handleDelete(projectId: string) {
    if (!confirm("Are you sure you want to permanently delete this project?")) return;

    setDeletingProjectId(projectId);
    setMessage("");

    try {
      const {
        data: { user },
        error: ue,
      } = await supabase.auth.getUser();

      if (ue || !user) throw new Error("No user found.");
      if (!workspaceId) throw new Error("No workspace.");

      await supabase.from("project_members").delete().eq("project_id", projectId);

      const { data: deleted, error: de } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId)
        .eq("workspace_id", workspaceId)
        .select("id");

      if (de) throw de;
      if (!deleted?.length) throw new Error("Project was not deleted.");

      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (err: any) {
      setMessage(err?.message || "Could not delete project.");
    } finally {
      setDeletingProjectId(null);
    }
  }

  function openProject(projectId?: string) {
    if (!projectId) return;
    router.push(`/app/projects/${projectId}?workspace=${workspaceId}`);
  }

  const startOptions = [
    {
      value: "scratch" as StartMethod,
      title: "Start from Scratch",
      description: "Set up a new project manually and build the project environment from the ground up.",
      icon: PencilRuler,
    },
    {
      value: "import" as StartMethod,
      title: "Import Existing Data",
      description: "Bring in project data from spreadsheets or existing exports.",
      icon: Upload,
    },
    {
      value: "connect" as StartMethod,
      title: "Connect Existing Systems",
      description: "Connect current tools and keep project data in sync.",
      icon: Link2,
    },
  ];

  return (
    <div className="flex flex-1 overflow-hidden bg-[#f6f8fb]">
      <div className="min-w-0 flex-1 overflow-y-auto">
        <div className="px-7 pb-4 pt-7">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <h1 className="text-[34px] font-bold tracking-tight text-slate-900">Projects</h1>
              <p className="mt-1 text-[15px] text-slate-500">
                Track project risks, actions and team updates across your workspace.
              </p>
            </div>

            <button
              onClick={openModal}
              disabled={!workspaceId}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              Create Project
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 px-7 pb-4">
          <StatPill
            icon={<FolderKanban className="h-4 w-4 text-blue-600" />}
            label={`${projects.length} Active Projects`}
          />
          <StatPill
            icon={<Layers3 className="h-4 w-4 text-slate-600" />}
            label={`${totalOpenRisks} Open Risks`}
          />
          <StatPill
            icon={<ShieldAlert className="h-4 w-4 text-red-500" />}
            label={`${criticalRisks} Critical Risks`}
          />
          <StatPill
            icon={<Clock3 className="h-4 w-4 text-amber-500" />}
            label={`${actionsDue} Actions Due`}
          />
        </div>

        <div className="px-7 pb-5">
          <div className="relative max-w-sm">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {message && (
          <div className="mx-7 mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {message}
          </div>
        )}

        <div className="px-7 pb-10">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[270px] animate-pulse rounded-2xl border border-slate-200 bg-white" />
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
                🏗️
              </div>
              <h3 className="text-xl font-semibold text-slate-800">No projects yet</h3>
              <p className="mt-2 text-slate-500">
                Create your first project to start managing risks.
              </p>
              <button
                onClick={openModal}
                className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Create First Project
              </button>
            </div>
          ) : (
            <div className="grid max-w-[1080px] grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {filteredProjects.map((project, index) => {
                const { score, level } = getProjectScore(project.id);
                const criticalCount = getProjectCriticalCount(project.id);
                const moderateCount = getProjectModerateCount(project.id);

                return (
                  <div
                    key={project.id}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="relative">
                      <CardImage project={project} onUpload={handleUploadImage} projectIndex={index} />

                      {criticalCount > 0 && (
                        <div className="absolute right-13 top-3 rounded-full bg-red-600 px-2 py-1 text-[10px] font-semibold text-white shadow-sm">
                          {criticalCount} critical
                        </div>
                      )}
                    </div>

                    <div
                      className="cursor-pointer px-4 pb-3 pt-3"
                      onClick={() => openProject(project.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate text-[16px] font-bold leading-tight text-slate-900">
                            {project.name}
                          </h3>
                          <p className="mt-1 text-[11px] text-slate-400">
                            Updated {timeAgo(project.updated_at)}
                          </p>
                        </div>

                        <RiskScorePill score={score} level={level} />
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-2">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                          <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                            Open
                          </div>
                          <div className="mt-1 text-[18px] font-semibold text-slate-900">
                            {project.open_risks_count}
                          </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                          <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                            Critical
                          </div>
                          <div className="mt-1 text-[18px] font-semibold text-slate-900">
                            {criticalCount}
                          </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                          <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                            Moderate
                          </div>
                          <div className="mt-1 text-[18px] font-semibold text-slate-900">
                            {moderateCount}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-[12px] text-slate-500">
                          Risk level:{" "}
                          <span className="font-semibold text-slate-800">
                            {level ? `${level.charAt(0).toUpperCase()}${level.slice(1)}` : "Not available"}
                          </span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openProject(project.id);
                          }}
                          className="inline-flex items-center gap-1 text-[12px] font-semibold text-blue-600 transition hover:text-blue-700"
                        >
                          Open
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-end border-t border-slate-100 px-4 py-2.5">
                      <button
                        onClick={() => handleDelete(project.id)}
                        disabled={deletingProjectId === project.id}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {deletingProjectId === project.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <aside
        className="hidden xl:block"
        style={{
          width: 332,
          flexShrink: 0,
          borderLeft: "1px solid #e2e8f0",
          background: "#f6f8fb",
          overflowY: "auto",
        }}
      >
        <div className="flex flex-col gap-6 p-5">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-slate-900">Workspace Activity</h2>

              <div className="relative" ref={activityMenuRef}>
                <button
                  onClick={() => setShowActivityMenu((v) => !v)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
                >
                  <Settings className="h-4 w-4" />
                </button>

                {showActivityMenu && (
                  <div className="absolute right-0 top-10 z-20 w-60 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                    <button
                      onClick={() => {
                        setActivityOnlyMine((v) => !v);
                        setShowActivityMenu(false);
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <span>Show only my activity</span>
                      {activityOnlyMine ? <CheckCircle2 className="h-4 w-4 text-blue-600" /> : null}
                    </button>

                    <button
                      onClick={() => {
                        setActivityAutoRefresh((v) => !v);
                        setShowActivityMenu(false);
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <span>Auto-refresh insights</span>
                      {activityAutoRefresh ? <CheckCircle2 className="h-4 w-4 text-blue-600" /> : null}
                    </button>

                    <button
                      onClick={() => {
                        refreshWorkspacePanels();
                        setShowActivityMenu(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Refresh now
                    </button>

                    <button
                      onClick={() => setShowActivityMenu(false)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Bell className="h-4 w-4" />
                      Notification preferences
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {(activityOnlyMine ? activityItems : activityItems).length === 0 ? (
                <p className="text-sm text-slate-400">No recent activity.</p>
              ) : (
                (activityOnlyMine ? activityItems : activityItems).map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative shrink-0">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${item.avatarColor}`}
                      >
                        {item.actorInitials}
                      </div>
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 ${item.dotColor}`}
                        style={{ borderColor: "#f6f8fb" }}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="leading-snug text-[13px] text-slate-700">
                        <span className="font-semibold">{item.actor}</span>{" "}
                        <span dangerouslySetInnerHTML={{ __html: item.message }} />
                        {item.project && <span className="text-slate-400"> in {item.project}</span>}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-400">{item.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <h2 className="text-[14px] font-bold text-slate-900">RiskBases Insights</h2>
              </div>

              <button
                onClick={refreshWorkspacePanels}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 transition hover:text-blue-700"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshingPanels ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {workspaceInsights.length === 0 ? (
                <p className="text-xs text-slate-400">
                  No insights yet. Add projects and risks to unlock recommendations.
                </p>
              ) : (
                workspaceInsights.slice(0, 3).map((insight) => {
                  const tone = getInsightTone(insight.severity);
                  const Icon = getInsightIcon(insight.severity, insight.title);

                  return (
                    <div key={insight.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 gap-3">
                          <div className="pt-0.5">
                            <Icon className={`h-4.5 w-4.5 ${tone.iconColor}`} />
                          </div>

                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-slate-900">
                              {insight.title}
                            </p>
                            <p className="mt-1 text-[12px] leading-5 text-slate-600">
                              {insight.description}
                            </p>

                            {insight.projectId && insight.ctaLabel ? (
                              <button
                                onClick={() => openProject(insight.projectId)}
                                className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-blue-600 hover:text-blue-700"
                              >
                                {insight.ctaLabel}
                                <ChevronRight className="h-3.5 w-3.5" />
                              </button>
                            ) : null}
                          </div>
                        </div>

                        {insight.stat && (
                          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${tone.badge}`}>
                            {insight.stat}
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
      </aside>

      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="w-full max-w-[720px] rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
            <div className="flex items-start justify-between border-b border-slate-100 px-7 py-6">
              <div>
                <h3 className="text-[30px] font-bold tracking-tight text-slate-900">Create New Project</h3>
                <p className="mt-1 text-[15px] text-slate-500">
                  Choose how you want to start setting up your project.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-6 px-7 py-7">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Project name</label>
                <input
                  type="text"
                  placeholder="e.g. Offshore Windfarm Rotterdam"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  autoFocus
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[15px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-3 block text-sm font-semibold text-slate-700">
                  Choose how to start
                </label>

                <div className="grid gap-3 md:grid-cols-3">
                  {startOptions.map((option) => {
                    const active = startMethod === option.value;
                    const Icon = option.icon;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setStartMethod(option.value)}
                        className={`rounded-2xl border p-4 text-left transition ${
                          active
                            ? "border-blue-300 bg-blue-50 shadow-sm"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div
                          className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${
                            active ? "bg-white text-blue-700" : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>

                        <div className="text-[15px] font-semibold text-slate-900">{option.title}</div>
                        <p className="mt-2 text-[12px] leading-5 text-slate-500">{option.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {message && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-7 py-5">
              <button
                type="button"
                onClick={closeModal}
                className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCreate}
                disabled={creatingProject || !projectName.trim()}
                className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60"
              >
                {creatingProject ? "Creating..." : "Continue →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="flex flex-1 items-center justify-center p-8 text-slate-500">Loading...</div>}>
      <ProjectsPageContent />
    </Suspense>
  );
}