"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Search,
  X,
  Plus,
  Settings,
  AlertTriangle,
  Clock,
  Layers,
  ChevronRight,
  Sparkles,
  ChevronDown,
  Trash2,
  Camera,
  PencilRuler,
  Upload,
  Link2,
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

type Profile = { id: string; full_name: string | null; avatar_url: string | null };
type ProjectMember = { project_id: string; user_id: string; profiles?: Profile | null };
type WorkspaceRelation = { id: string; name: string | null; company_name: string | null; join_key: string | null };
type WorkspaceMembership = { workspace_id: string; role: string | null; workspaces: WorkspaceRelation[] | null };

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
  "bg-violet-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-indigo-500",
];

function hashStr(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function getInitials(name: string | null) {
  if (!name) return "?";
  const p = name.trim().split(" ");
  return p.length >= 2 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
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
      pill: "text-red-600 bg-red-50 border border-red-100",
      label: "High Risk",
    };
  }
  if (s === "at_risk" || s === "at risk") {
    return {
      dot: "bg-orange-500",
      pill: "text-orange-600 bg-orange-50 border border-orange-100",
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
  if (l === "high" || (score !== null && score >= 70)) return { bg: "bg-red-500", label: "High" };
  if (l === "moderate" || l === "medium" || (score !== null && score >= 40)) {
    return { bg: "bg-amber-500", label: "Moderate Risk" };
  }
  return { bg: "bg-teal-600", label: "Low" };
}

function getInsightTone(severity: InsightSeverity) {
  switch (severity) {
    case "critical":
      return {
        badge: "bg-red-50 text-red-700 border border-red-100",
        iconWrap: "bg-red-100",
        iconColor: "text-red-600",
      };
    case "warning":
      return {
        badge: "bg-amber-50 text-amber-700 border border-amber-100",
        iconWrap: "bg-amber-100",
        iconColor: "text-amber-600",
      };
    case "positive":
      return {
        badge: "bg-emerald-50 text-emerald-700 border border-emerald-100",
        iconWrap: "bg-emerald-100",
        iconColor: "text-emerald-600",
      };
    default:
      return {
        badge: "bg-violet-50 text-violet-700 border border-violet-100",
        iconWrap: "bg-violet-100",
        iconColor: "text-violet-600",
      };
  }
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
  construction: "#ede9f8",
  tunnel: "#dde8f5",
  tower: "#ddeaf5",
  wind: "#ddf5ec",
  renovation: "#f5f0dd",
  planning: "#f0edf8",
  water: "#ddf0f5",
  energy: "#f5f5dd",
  default: "#ebe8f5",
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
      description: `${worstRiskProject.project.name} has ${worstRiskProject.highRisks} high risk item${worstRiskProject.highRisks > 1 ? "s" : ""} that need review.`,
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
      description: `${worstActionProject.project.name} has ${worstActionProject.overdueActions} overdue action${worstActionProject.overdueActions > 1 ? "s" : ""} that may affect control.`,
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
      description: `${reviewProject.project.name} has ${reviewProject.upcomingReviews} risk review${reviewProject.upcomingReviews > 1 ? "s" : ""} due in the next 14 days.`,
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
          <ellipse cx="140" cy="155" rx="95" ry="11" fill="#c4b8e8" opacity="0.45" />
          <rect x="82" y="88" width="78" height="67" rx="3" fill="#7c6ec0" />
          <rect x="87" y="93" width="15" height="19" rx="2" fill="#b0a0e0" />
          <rect x="108" y="93" width="15" height="19" rx="2" fill="#b0a0e0" />
          <rect x="129" y="93" width="15" height="19" rx="2" fill="#b0a0e0" />
          <rect x="87" y="119" width="15" height="20" rx="2" fill="#b0a0e0" />
          <rect x="108" y="119" width="15" height="20" rx="2" fill="#b0a0e0" />
          <rect x="129" y="119" width="23" height="36" rx="2" fill="#6a5eb0" />
          <rect x="153" y="22" width="8" height="133" rx="2" fill="#f0b429" />
          <rect x="122" y="22" width="70" height="8" rx="2" fill="#f0b429" />
          <line x1="171" y1="30" x2="171" y2="73" stroke="#999" strokeWidth="1.5" />
          <rect x="164" y="71" width="14" height="10" rx="2" fill="#e05050" />
          <line x1="153" y1="30" x2="130" y2="22" stroke="#d4a017" strokeWidth="2" />
          <rect x="70" y="88" width="6" height="67" rx="1" fill="#c0b0e0" />
          <rect x="166" y="88" width="6" height="67" rx="1" fill="#c0b0e0" />
        </svg>
      );
    case "planning":
      return (
        <svg viewBox="0 0 280 176" fill="none" className="h-full w-full">
          <ellipse cx="140" cy="158" rx="88" ry="10" fill="#c0b8e0" opacity="0.4" />
          <rect x="83" y="38" width="114" height="122" rx="6" fill="#f0eef8" stroke="#c0b0e0" strokeWidth="2" />
          <rect x="113" y="31" width="54" height="18" rx="6" fill="#a090d0" />
          <rect x="125" y="34" width="30" height="10" rx="3" fill="#f0eef8" />
          <rect x="96" y="66" width="88" height="8" rx="2" fill="#e0daf0" />
          <circle cx="103" cy="70" r="5" fill="#7c6ec0" />
          <path d="M100 70 L102 72 L106 68" stroke="white" strokeWidth="1.5" fill="none" />
          <rect x="96" y="82" width="88" height="8" rx="2" fill="#e0daf0" />
          <circle cx="103" cy="86" r="5" fill="#7c6ec0" />
          <path d="M100 86 L102 88 L106 84" stroke="white" strokeWidth="1.5" fill="none" />
          <path d="M164 102 L176 135 L163 128 Z" fill="#5060a0" />
          <rect x="170" y="97" width="8" height="10" rx="2" transform="rotate(20 170 97)" fill="#303060" />
        </svg>
      );
    case "renovation":
      return (
        <svg viewBox="0 0 280 176" fill="none" className="h-full w-full">
          <ellipse cx="140" cy="158" rx="100" ry="10" fill="#d4c8b8" opacity="0.5" />
          <path d="M88 122 Q88 78 140 73 Q192 78 192 122 Z" fill="#f0b429" />
          <rect x="80" y="120" width="120" height="12" rx="4" fill="#e0a018" />
          <rect x="74" y="126" width="132" height="8" rx="4" fill="#f0b429" />
          <path d="M93 132 Q140 147 187 132" stroke="#c89010" strokeWidth="3" fill="none" />
          <path d="M170 98 L186 114 L184 116 L168 100 Z" fill="#8090a0" />
          <circle cx="166" cy="101" r="10" fill="none" stroke="#8090a0" strokeWidth="4" />
          <circle cx="188" cy="113" r="7" fill="none" stroke="#8090a0" strokeWidth="4" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 280 176" fill="none" className="h-full w-full">
          <ellipse cx="140" cy="155" rx="95" ry="11" fill="#c4b8e8" opacity="0.45" />
          <rect x="82" y="88" width="78" height="67" rx="3" fill="#7c6ec0" />
          <rect x="87" y="93" width="15" height="19" rx="2" fill="#b0a0e0" />
          <rect x="108" y="93" width="15" height="19" rx="2" fill="#b0a0e0" />
          <rect x="129" y="93" width="15" height="19" rx="2" fill="#b0a0e0" />
          <rect x="87" y="119" width="15" height="20" rx="2" fill="#b0a0e0" />
          <rect x="108" y="119" width="15" height="20" rx="2" fill="#b0a0e0" />
          <rect x="129" y="119" width="23" height="36" rx="2" fill="#6a5eb0" />
          <rect x="153" y="22" width="8" height="133" rx="2" fill="#f0b429" />
          <rect x="122" y="22" width="70" height="8" rx="2" fill="#f0b429" />
        </svg>
      );
  }
}

function StatPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="whitespace-nowrap rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm flex items-center gap-2">
      {icon}
      {label}
    </div>
  );
}

function MemberAvatars({ members }: { members: ProjectMember[] }) {
  return (
    <div className="flex -space-x-2">
      {members.slice(0, 4).map((m) => {
        const p = m.profiles;
        const name = p?.full_name ?? "User";
        const color = AVATAR_COLORS[hashStr(m.user_id) % AVATAR_COLORS.length];
        if (p?.avatar_url) {
          return (
            <img
              key={m.user_id}
              src={p.avatar_url}
              alt={name}
              title={name}
              className="h-7 w-7 rounded-full border-2 border-white object-cover"
            />
          );
        }
        return (
          <div
            key={m.user_id}
            title={name}
            className={`h-7 w-7 rounded-full border-2 border-white ${color} flex items-center justify-center text-[10px] font-bold text-white`}
          >
            {getInitials(name)}
          </div>
        );
      })}
    </div>
  );
}

function RiskScorePill({ score, level }: { score: number | null; level: string | null }) {
  const { bg, label } = getRiskStyle(level, score);
  if (score === null && !level) return null;
  return (
    <div className={`rounded-lg px-2.5 py-1 text-xs font-bold text-white flex items-center gap-1.5 ${bg}`}>
      <span>{score ?? 0}</span>
      <span className="font-normal opacity-90">{label}</span>
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
    <div className="relative h-40 overflow-hidden flex items-center justify-center" style={{ background: TYPE_BG[type] }}>
      {project.image_url ? (
        <img src={project.image_url} alt={project.name} className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full">
          <Illustration type={type} />
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={handleCameraClick}
          className="pointer-events-auto rounded-full bg-white/90 p-2.5 shadow-lg transition-colors hover:bg-white"
          title="Afbeelding wijzigen"
        >
          {uploading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
          ) : (
            <Camera className="h-5 w-5 text-slate-700" />
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

  const workspaceFromUrl = searchParams.get("workspace");

  useEffect(() => {
    async function load() {
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

        const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
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

        const storedId = typeof window !== "undefined" ? localStorage.getItem("active_workspace_id") : null;
        const requestedId = workspaceFromUrl || storedId || null;
        const active =
          (requestedId ? membershipList.find((m) => m.workspace_id === requestedId) : null) ?? membershipList[0];

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
            dotColor: "bg-violet-500",
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
            dotColor: (a.priority ?? "").toLowerCase() === "high" ? "bg-red-500" : "bg-violet-500",
            avatarColor,
            message: `created action <strong>'${a.title ?? "Action"}'</strong>`,
            project: proj?.name,
            time: timeAgo(a.created_at),
          });
        }

        setActivityItems(activities.slice(0, 5));

        const insights = buildWorkspaceInsights({
          projects: projs,
          projectRisks: risksMap,
          projectActions: actionsMap,
          projectMembers: membersMap,
        });

        setWorkspaceInsights(insights);
      } catch (err: any) {
        setMessage(err?.message || "Could not load projects.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router, workspaceFromUrl]);

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

      setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, image_url: publicUrl } : p)));
    } catch (err: any) {
      alert(
        "Upload mislukt: " +
          (err?.message ?? "unknown") +
          "\n\nZorg dat je een 'image_url' kolom hebt op je projects tabel en een 'projects' storage bucket."
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
      if (!project) throw new Error("Could not create.");

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
    if (!confirm("Weet je zeker dat je dit project definitief wilt verwijderen?")) return;

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
      if (!deleted?.length) throw new Error("Not deleted.");

      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (err: any) {
      setMessage(err?.message || "Could not delete.");
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
      description: "Set up a new project manually and build your risk environment from the ground up.",
      icon: PencilRuler,
    },
    {
      value: "import" as StartMethod,
      title: "Import Existing Data",
      description: "Bring in existing project information from spreadsheets or exported files.",
      icon: Upload,
    },
    {
      value: "connect" as StartMethod,
      title: "Connect Existing Systems",
      description: "Connect data from current tools and keep project information in sync.",
      icon: Link2,
    },
  ];

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden", background: "#f7f7fb" }}>
      <div style={{ flex: 1, minWidth: 0, overflowY: "auto" }}>
        <div className="px-8 pt-8 pb-5">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <h1 className="text-[34px] font-bold tracking-tight text-slate-900">Projects</h1>
              <p className="mt-1 text-[15px] text-slate-500">
                Track project risks, actions and team updates across your workspace
              </p>
            </div>

            <button
              onClick={openModal}
              disabled={!workspaceId}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 active:scale-[0.98] disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              Create Project
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 px-8 pb-5">
          <StatPill icon={<Layers className="h-4 w-4 text-violet-500" />} label={`${projects.length} Active Projects`} />
          <StatPill
            icon={
              <svg className="h-4 w-4 text-slate-500" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="3" width="14" height="2" rx="1" fill="currentColor" />
                <rect x="1" y="7" width="14" height="2" rx="1" fill="currentColor" />
                <rect x="1" y="11" width="14" height="2" rx="1" fill="currentColor" />
              </svg>
            }
            label={`${totalOpenRisks} Open Risks`}
          />
          <StatPill icon={<AlertTriangle className="h-4 w-4 text-amber-500" />} label={`${criticalRisks} Critical Risks`} />
          <StatPill icon={<Clock className="h-4 w-4 text-amber-400" />} label={`${actionsDue} Actions Due`} />
        </div>

        <div className="px-8 pb-5">
          <div className="relative max-w-sm">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 shadow-sm outline-none placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>
        </div>

        {message && (
          <div className="mx-8 mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {message}
          </div>
        )}

        <div className="px-8 pb-10">
          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[320px] animate-pulse rounded-2xl border border-slate-200 bg-white" />
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
                🏗️
              </div>
              <h3 className="text-xl font-semibold text-slate-800">No projects yet</h3>
              <p className="mt-2 text-slate-500">Create your first project to start managing risks.</p>
              <button
                onClick={openModal}
                className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white transition hover:bg-violet-700"
              >
                <Plus className="h-4 w-4" />
                Create first project
              </button>
            </div>
          ) : (
            <div className="grid max-w-[1180px] grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-3">
              {filteredProjects.map((project, index) => {
                const members = projectMembers[project.id] ?? [];
                const { score, level } = getProjectScore(project.id);
                const status = getStatusBadge(project.status);
                const critCount = (projectRisks[project.id] ?? []).filter(
                  (r) => (r.level ?? "").toLowerCase() === "high"
                ).length;

                return (
                  <div
                    key={project.id}
                    className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                  >
                    <CardImage project={project} onUpload={handleUploadImage} projectIndex={index} />

                    {critCount > 0 && (
                      <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white shadow">
                        <AlertTriangle className="h-3 w-3" />
                        {critCount}
                      </div>
                    )}

                    <div
                      className="cursor-pointer p-4 pb-3"
                      onClick={() => router.push(`/app/projects/${project.id}?workspace=${workspaceId}`)}
                    >
                      <h3 className="truncate text-[17px] font-bold leading-tight text-slate-900">
                        {project.name}
                      </h3>

                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="text-sm text-slate-700">
                          <span className="font-semibold text-slate-900">{project.open_risks_count}</span> open risks
                          {critCount > 0 && <span className="ml-1 font-bold text-red-500">{critCount}</span>}
                        </span>

                        <span
                          className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${status.pill}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                      </div>

                      <p className="mt-0.5 text-[12px] text-slate-400">Updated {timeAgo(project.updated_at)}</p>

                      <div className="mt-3 flex items-center justify-between">
                        <MemberAvatars members={members} />
                        <RiskScorePill score={score} level={level} />
                      </div>
                    </div>

                    <div
                      className="cursor-pointer flex items-center justify-between border-t border-slate-100 px-4 py-2.5"
                      onClick={() => router.push(`/app/projects/${project.id}?workspace=${workspaceId}`)}
                    >
                      <span className="text-[12px] text-slate-400">
                        {level ? `${level.charAt(0).toUpperCase() + level.slice(1)} Risk` : status.label}
                      </span>

                      <div className="flex items-center gap-1 text-[12px] text-slate-400">
                        <span>{status.label}</span>
                        <ChevronDown className="h-3.5 w-3.5" />
                      </div>
                    </div>

                    <div className="hidden items-center gap-2 border-t border-slate-100 bg-slate-50/80 px-4 py-2.5 group-hover:flex">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/app/projects/${project.id}?workspace=${workspaceId}`);
                        }}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-700"
                      >
                        Open
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(project.id);
                        }}
                        disabled={deletingProjectId === project.id}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {deletingProjectId === project.id ? "..." : "Delete"}
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
        style={{
          width: 300,
          flexShrink: 0,
          borderLeft: "1px solid #e2e8f0",
          background: "#f7f7fb",
          overflowY: "auto",
        }}
        className="hidden xl:block"
      >
        <div className="flex flex-col gap-6 p-5">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-slate-900">Workspace Activity</h2>
              <button className="text-slate-400 hover:text-slate-600">
                <Settings className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {activityItems.length === 0 ? (
                <p className="text-sm text-slate-400">No recent activity.</p>
              ) : (
                activityItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative shrink-0">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${item.avatarColor}`}
                      >
                        {item.actorInitials}
                      </div>
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 ${item.dotColor}`}
                        style={{ borderColor: "#f7f7fb" }}
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

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-violet-500" />
                <h2 className="text-[14px] font-bold text-slate-900">Risk Insights</h2>
              </div>

              <button className="flex items-center gap-0.5 text-[11px] font-medium text-violet-600">
                Auto-refresh
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {workspaceInsights.length === 0 ? (
                <p className="text-xs text-slate-400">
                  No insights yet. Add projects and risks to unlock recommendations.
                </p>
              ) : (
                workspaceInsights.map((insight) => {
                  const tone = getInsightTone(insight.severity);

                  return (
                    <div key={insight.id} className="rounded-xl border border-slate-200 p-3">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <div
                            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded ${tone.iconWrap}`}
                          >
                            <Sparkles className={`h-3.5 w-3.5 ${tone.iconColor}`} />
                          </div>

                          <div>
                            <p className="text-[12px] font-semibold text-slate-900">{insight.title}</p>
                            <p className="mt-1 text-[12px] leading-snug text-slate-600">{insight.description}</p>
                          </div>
                        </div>

                        {insight.stat && (
                          <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${tone.badge}`}>
                            {insight.stat}
                          </span>
                        )}
                      </div>

                      {insight.projectId && insight.ctaLabel ? (
                        <button
                          onClick={() => openProject(insight.projectId)}
                          className="inline-flex items-center gap-1 text-[12px] font-semibold text-violet-600 hover:text-violet-700"
                        >
                          {insight.ctaLabel}
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>

            <button className="mt-3 flex w-full items-center justify-center gap-1 text-center text-[12px] font-semibold text-slate-500 hover:text-slate-700">
              Show more
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
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
                  Choose how you want to start setting up your project
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
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[15px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
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
                            ? "border-violet-400 bg-violet-50 shadow-sm"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div
                          className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${
                            active ? "bg-white text-violet-700" : "bg-slate-100 text-slate-700"
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
                className="h-11 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white hover:bg-violet-700 active:scale-[0.98] disabled:opacity-60"
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