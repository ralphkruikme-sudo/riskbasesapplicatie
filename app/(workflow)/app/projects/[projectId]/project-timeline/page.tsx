"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CalendarRange,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Filter,
  Loader2,
  Plus,
  ShieldAlert,
  Target,
  User2,
  Wrench,
} from "lucide-react";

// ⬇️ PAS DIT PAD AAN ALS JOUW SUPABASE CLIENT ELDERS STAAT
import { supabase } from "@/lib/supabase/client";

type Project = {
  id: string;
  name: string;
  status: string | null;
  project_value: string | number | null;
  start_date: string | null;
  end_date: string | null;
  project_phase: string | null;
  client_name: string | null;
  project_type: string | null;
  city: string | null;
};

type TimelinePhase = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  type: string | null;
  status: string | null;
  owner_stakeholder_id: string | null;
};

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
  probability: number | null;
  impact: number | null;
  score: number | null;
  level: string | null;
  status: string | null;
  owner_user_id: string | null;
  phase: string | null;
  due_review_date: string | null;
  identified_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  source_type: string | null;
  source_template_id: string | null;
  generation_reason: string | null;
  review_status: string | null;
  suggested_action: string | null;
};

type RiskAction = {
  id: string;
  project_id: string;
  risk_id: string | null;
  title: string;
  description: string | null;
  owner_user_id: string | null;
  status: string | null;
  priority: string | null;
  due_date: string | null;
  completed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type Stakeholder = {
  id: string;
  project_id: string;
  name: string;
  organization: string | null;
  role: string | null;
  stakeholder_type: string | null;
  email: string | null;
  phone: string | null;
};

type TimelineRiskLink = {
  id: string;
  timeline_id: string;
  risk_id: string;
};

type TimelineActionLink = {
  id: string;
  timeline_id: string;
  action_id: string;
};

type RiskRow = {
  risk: ProjectRisk;
  phaseIds: string[];
  actions: RiskAction[];
  owner?: Stakeholder | null;
};

const PHASE_BG = [
  "#f3f4f6",
  "#eef2ff",
  "#f5f3ff",
  "#ecfeff",
  "#eff6ff",
  "#f0fdf4",
  "#fff7ed",
  "#fef2f2",
];

const LEVEL_STYLES: Record<
  string,
  { bg: string; border: string; text: string; pill: string }
> = {
  low: {
    bg: "linear-gradient(90deg, #6dbd64 0%, #5cae54 100%)",
    border: "#4e9448",
    text: "#14532d",
    pill: "#dcfce7",
  },
  medium: {
    bg: "linear-gradient(90deg, #93c45a 0%, #7cb342 100%)",
    border: "#689f38",
    text: "#365314",
    pill: "#ecfccb",
  },
  high: {
    bg: "linear-gradient(90deg, #fb923c 0%, #f97316 100%)",
    border: "#ea580c",
    text: "#9a3412",
    pill: "#ffedd5",
  },
  critical: {
    bg: "linear-gradient(90deg, #ef4444 0%, #dc2626 100%)",
    border: "#b91c1c",
    text: "#991b1b",
    pill: "#fee2e2",
  },
  default: {
    bg: "linear-gradient(90deg, #64748b 0%, #475569 100%)",
    border: "#334155",
    text: "#334155",
    pill: "#e2e8f0",
  },
};

const ACTION_STATUS_STYLES: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  open: { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" },
  in_progress: { bg: "#dbeafe", text: "#1d4ed8", dot: "#2563eb" },
  done: { bg: "#dcfce7", text: "#166534", dot: "#16a34a" },
  overdue: { bg: "#fee2e2", text: "#991b1b", dot: "#ef4444" },
  default: { bg: "#e2e8f0", text: "#334155", dot: "#64748b" },
};

function fmtDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("nl-NL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtShortDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("nl-NL", {
    day: "2-digit",
    month: "short",
  });
}

function formatMoney(value?: string | number | null) {
  if (value === null || value === undefined || value === "") return "—";
  const num =
    typeof value === "number"
      ? value
      : Number(String(value).replace(/[^\d.-]/g, ""));
  if (Number.isNaN(num)) return String(value);
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(num);
}

function normalizeLevel(level?: string | null, score?: number | null) {
  const raw = String(level ?? "").trim().toLowerCase();

  if (["kritiek", "critical", "urgent"].includes(raw)) return "critical";
  if (["hoog", "high"].includes(raw)) return "high";
  if (["middel", "medium", "gemiddeld"].includes(raw)) return "medium";
  if (["laag", "low"].includes(raw)) return "low";

  if (typeof score === "number") {
    if (score >= 16) return "critical";
    if (score >= 10) return "high";
    if (score >= 5) return "medium";
    return "low";
  }

  return "default";
}

function normalizeActionStatus(
  status?: string | null,
  dueDate?: string | null,
  completedAt?: string | null
) {
  if (completedAt) return "done";
  const raw = String(status ?? "").trim().toLowerCase();
  if (["done", "completed", "afgerond"].includes(raw)) return "done";
  if (["in_progress", "in progress", "bezig"].includes(raw)) return "in_progress";
  if (["open", "todo", "nieuw"].includes(raw)) {
    if (dueDate && new Date(dueDate) < new Date()) return "overdue";
    return "open";
  }
  if (dueDate && new Date(dueDate) < new Date()) return "overdue";
  return "default";
}

function daysBetween(a?: string | null, b?: string | null) {
  if (!a || !b) return null;
  const start = new Date(a).getTime();
  const end = new Date(b).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return null;
  return Math.max(0, Math.ceil((end - start) / 86400000));
}

function daysOpen(risk: ProjectRisk) {
  const start = risk.identified_at ?? risk.created_at;
  if (!start) return null;
  return daysBetween(start, new Date().toISOString());
}

function getProjectRange(
  project: Project | null,
  phases: TimelinePhase[],
  risks: ProjectRisk[],
  riskPhaseLookup: Map<string, TimelinePhase[]>
) {
  const candidates: number[] = [];

  if (project?.start_date) candidates.push(new Date(project.start_date).getTime());
  if (project?.end_date) candidates.push(new Date(project.end_date).getTime());

  phases.forEach((p) => {
    if (p.start_date) candidates.push(new Date(p.start_date).getTime());
    if (p.end_date) candidates.push(new Date(p.end_date).getTime());
  });

  risks.forEach((r) => {
    const linked = riskPhaseLookup.get(r.id) ?? [];
    linked.forEach((p) => {
      if (p.start_date) candidates.push(new Date(p.start_date).getTime());
      if (p.end_date) candidates.push(new Date(p.end_date).getTime());
    });
    if (r.identified_at) candidates.push(new Date(r.identified_at).getTime());
    if (r.due_review_date) candidates.push(new Date(r.due_review_date).getTime());
  });

  const valid = candidates.filter((x) => !Number.isNaN(x)).sort((a, b) => a - b);

  if (!valid.length) {
    const now = new Date();
    return {
      min: new Date(now.getFullYear(), now.getMonth(), 1),
      max: new Date(now.getFullYear(), now.getMonth() + 6, 0),
    };
  }

  const min = new Date(valid[0]);
  const max = new Date(valid[valid.length - 1]);

  min.setDate(1);
  max.setMonth(max.getMonth() + 1);
  max.setDate(0);

  return { min, max };
}

function posPct(dateStr: string, min: Date, max: Date) {
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
      label: d.toLocaleDateString("nl-NL", {
        month: "short",
        year: "2-digit",
      }),
      pct: posPct(d.toISOString(), min, max),
    });
    d.setMonth(d.getMonth() + 1);
  }

  return markers;
}

function deriveRiskRange(risk: ProjectRisk, linkedPhases: TimelinePhase[]) {
  const sorted = [...linkedPhases].sort((a, b) =>
    String(a.start_date ?? "").localeCompare(String(b.start_date ?? ""))
  );

  const start =
    sorted.find((p) => p.start_date)?.start_date ??
    risk.identified_at ??
    risk.created_at ??
    null;

  const end =
    [...sorted].reverse().find((p) => p.end_date)?.end_date ??
    risk.due_review_date ??
    risk.updated_at ??
    start;

  return { start, end };
}

function initials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0]?.toUpperCase())
    .join("");
}

function SummaryCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        padding: 18,
        minHeight: 98,
        boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: accent + "15",
          color: accent,
          marginBottom: 12,
        }}
      >
        {icon}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#0f172a", lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ marginTop: 8, fontSize: 13, color: "#64748b", fontWeight: 600 }}>
        {label}
      </div>
    </div>
  );
}

export default function ProjectTimelinePage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [phases, setPhases] = useState<TimelinePhase[]>([]);
  const [risks, setRisks] = useState<ProjectRisk[]>([]);
  const [actions, setActions] = useState<RiskAction[]>([]);
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [timelineRiskLinks, setTimelineRiskLinks] = useState<TimelineRiskLink[]>([]);
  const [timelineActionLinks, setTimelineActionLinks] = useState<TimelineActionLink[]>([]);

  const [loading, setLoading] = useState(true);
  const [selectedRiskId, setSelectedRiskId] = useState<string | null>(null);

  const [phaseFilter, setPhaseFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  async function loadPage() {
    if (!projectId) return;

    setLoading(true);

    const [
      projectRes,
      phasesRes,
      risksRes,
      actionsRes,
      stakeholdersRes,
      timelineRisksRes,
      timelineActionsRes,
    ] = await Promise.all([
      supabase.from("projects").select("*").eq("id", projectId).single(),
      supabase
        .from("project_timeline")
        .select("*")
        .eq("project_id", projectId)
        .order("start_date", { ascending: true }),
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
      supabase.from("timeline_risks").select("*"),
      supabase.from("timeline_actions").select("*"),
    ]);

    setProject((projectRes.data ?? null) as Project | null);
    setPhases(((phasesRes.data ?? []) as TimelinePhase[]).filter((p) => (p.type ?? "phase") === "phase"));
    setRisks((risksRes.data ?? []) as ProjectRisk[]);
    setActions((actionsRes.data ?? []) as RiskAction[]);
    setStakeholders((stakeholdersRes.data ?? []) as Stakeholder[]);
    setTimelineRiskLinks((timelineRisksRes.data ?? []) as TimelineRiskLink[]);
    setTimelineActionLinks((timelineActionsRes.data ?? []) as TimelineActionLink[]);

    const firstRisk = (risksRes.data ?? [])[0] as ProjectRisk | undefined;
    setSelectedRiskId((prev) => prev ?? firstRisk?.id ?? null);

    setLoading(false);
  }

  useEffect(() => {
    loadPage();
  }, [projectId]);

  const stakeholderMap = useMemo(() => {
    return new Map(stakeholders.map((s) => [s.id, s]));
  }, [stakeholders]);

  const phaseMap = useMemo(() => {
    return new Map(phases.map((p) => [p.id, p]));
  }, [phases]);

  const riskPhaseLookup = useMemo(() => {
    const map = new Map<string, TimelinePhase[]>();

    timelineRiskLinks.forEach((link) => {
      const phase = phaseMap.get(link.timeline_id);
      if (!phase) return;
      const current = map.get(link.risk_id) ?? [];
      current.push(phase);
      map.set(link.risk_id, current);
    });

    risks.forEach((risk) => {
      if (!map.has(risk.id) && risk.phase) {
        const matched = phases.filter(
          (p) => p.title?.toLowerCase() === risk.phase?.toLowerCase()
        );
        if (matched.length) map.set(risk.id, matched);
      }
    });

    return map;
  }, [timelineRiskLinks, phaseMap, phases, risks]);

  const actionPhaseLookup = useMemo(() => {
    const map = new Map<string, TimelinePhase[]>();

    timelineActionLinks.forEach((link) => {
      const phase = phaseMap.get(link.timeline_id);
      if (!phase) return;
      const current = map.get(link.action_id) ?? [];
      current.push(phase);
      map.set(link.action_id, current);
    });

    return map;
  }, [timelineActionLinks, phaseMap]);

  const rows = useMemo<RiskRow[]>(() => {
    return risks.map((risk) => {
      const owner =
        risk.owner_user_id
          ? stakeholders.find((s) => s.id === risk.owner_user_id) ?? null
          : null;

      const riskActions = actions.filter((a) => a.risk_id === risk.id);
      const linkedPhases = riskPhaseLookup.get(risk.id) ?? [];

      return {
        risk,
        owner,
        actions: riskActions,
        phaseIds: linkedPhases.map((p) => p.id),
      };
    });
  }, [risks, actions, stakeholders, riskPhaseLookup]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const level = normalizeLevel(row.risk.level, row.risk.score);
      const status = String(row.risk.status ?? "").toLowerCase();

      const passPhase =
        phaseFilter === "all" ||
        (riskPhaseLookup.get(row.risk.id) ?? []).some((p) => p.id === phaseFilter);

      const passLevel = levelFilter === "all" || level === levelFilter;
      const passStatus = statusFilter === "all" || status === statusFilter;

      return passPhase && passLevel && passStatus;
    });
  }, [rows, phaseFilter, levelFilter, statusFilter, riskPhaseLookup]);

  const selectedRow =
    filteredRows.find((r) => r.risk.id === selectedRiskId) ??
    rows.find((r) => r.risk.id === selectedRiskId) ??
    filteredRows[0] ??
    rows[0] ??
    null;

  const activeRisks = risks.filter((r) => !["closed", "resolved", "done"].includes(String(r.status ?? "").toLowerCase())).length;
  const criticalRisks = risks.filter((r) => normalizeLevel(r.level, r.score) === "critical").length;
  const openActions = actions.filter((a) => normalizeActionStatus(a.status, a.due_date, a.completed_at) !== "done").length;
  const upcomingChecks = risks.filter((r) => {
    if (!r.due_review_date) return false;
    const due = new Date(r.due_review_date).getTime();
    const now = new Date().getTime();
    const in14 = now + 14 * 86400000;
    return due >= now && due <= in14;
  }).length;

  const range = useMemo(
    () => getProjectRange(project, phases, risks, riskPhaseLookup),
    [project, phases, risks, riskPhaseLookup]
  );

  const monthMarkers = useMemo(
    () => getMonthMarkers(range.min, range.max),
    [range.min, range.max]
  );

  const todayPct = clamp(posPct(new Date().toISOString(), range.min, range.max), 0, 100);

  const upcomingItems = useMemo(() => {
    const items: Array<{
      id: string;
      kind: "action" | "review";
      date: string;
      title: string;
      subtitle: string;
      riskId?: string;
    }> = [];

    actions.forEach((a) => {
      if (a.due_date && normalizeActionStatus(a.status, a.due_date, a.completed_at) !== "done") {
        items.push({
          id: a.id,
          kind: "action",
          date: a.due_date,
          title: a.title,
          subtitle: a.description ?? "Actiepunt",
          riskId: a.risk_id ?? undefined,
        });
      }
    });

    risks.forEach((r) => {
      if (r.due_review_date) {
        items.push({
          id: r.id + "-review",
          kind: "review",
          date: r.due_review_date,
          title: `Review: ${r.title}`,
          subtitle: "Risico reviewmoment",
          riskId: r.id,
        });
      }
    });

    return items
      .filter((x) => {
        const d = new Date(x.date).getTime();
        return !Number.isNaN(d);
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 8);
  }, [actions, risks]);

  return (
    <div
      style={{
        minHeight: "100%",
        background: "#f6f8fb",
        padding: "24px 24px 36px",
      }}
    >
      <div style={{ maxWidth: 1600, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 22,
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#eef2ff",
                color: "#4338ca",
                borderRadius: 999,
                padding: "6px 12px",
                fontSize: 12,
                fontWeight: 700,
                marginBottom: 10,
              }}
            >
              <CalendarRange style={{ width: 14, height: 14 }} />
              Project Timeline
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <h1
                style={{
                  margin: 0,
                  fontSize: 36,
                  lineHeight: 1.05,
                  letterSpacing: "-0.03em",
                  color: "#0f172a",
                  fontWeight: 800,
                }}
              >
                {project?.name ?? "Project Timeline"}
              </h1>

              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: 12,
                  background: "#dbeafe",
                  color: "#1d4ed8",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                Fase: {project?.project_phase ?? project?.status ?? "Onbekend"}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 18,
                flexWrap: "wrap",
                marginTop: 10,
                color: "#64748b",
                fontSize: 14,
              }}
            >
              <span>
                Projectwaarde:{" "}
                <strong style={{ color: "#0f172a" }}>
                  {formatMoney(project?.project_value)}
                </strong>
              </span>
              <span>
                {fmtDate(project?.start_date)} — {fmtDate(project?.end_date)}
              </span>
              {project?.client_name && <span>Klant: {project.client_name}</span>}
              {project?.city && <span>Locatie: {project.city}</span>}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              style={{
                height: 42,
                padding: "0 16px",
                borderRadius: 12,
                border: "1px solid #dbe2ea",
                background: "white",
                color: "#1e293b",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Plus style={{ width: 14, height: 14 }} />
              Risico toevoegen
            </button>
            <button
              style={{
                height: 42,
                padding: "0 16px",
                borderRadius: 12,
                border: "1px solid #dbe2ea",
                background: "white",
                color: "#1e293b",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Plus style={{ width: 14, height: 14 }} />
              Actiepunt
            </button>
            <button
              style={{
                height: 42,
                padding: "0 18px",
                borderRadius: 12,
                border: "none",
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                color: "white",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Update fase
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 14,
            marginBottom: 18,
          }}
        >
          <SummaryCard
            icon={<ShieldAlert style={{ width: 18, height: 18 }} />}
            label="Actieve risico’s"
            value={activeRisks}
            accent="#2563eb"
          />
          <SummaryCard
            icon={<AlertTriangle style={{ width: 18, height: 18 }} />}
            label="Kritieke risico’s"
            value={criticalRisks}
            accent="#dc2626"
          />
          <SummaryCard
            icon={<Wrench style={{ width: 18, height: 18 }} />}
            label="Open actiepunten"
            value={openActions}
            accent="#ea580c"
          />
          <SummaryCard
            icon={<Clock3 style={{ width: 18, height: 18 }} />}
            label="Aankomende checks"
            value={upcomingChecks}
            accent="#16a34a"
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 340px",
            gap: 18,
            alignItems: "start",
          }}
        >
          <div>
            <div
              style={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: 18,
                boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: 16,
                  borderBottom: "1px solid #eef2f7",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "0 12px",
                      height: 40,
                      borderRadius: 12,
                      border: "1px solid #dbe2ea",
                      background: "#fff",
                    }}
                  >
                    <Filter style={{ width: 14, height: 14, color: "#64748b" }} />
                    <select
                      value={phaseFilter}
                      onChange={(e) => setPhaseFilter(e.target.value)}
                      style={{
                        border: "none",
                        outline: "none",
                        background: "transparent",
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#334155",
                      }}
                    >
                      <option value="all">Alle fases</option>
                      {phases.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                    <ChevronDown style={{ width: 14, height: 14, color: "#94a3b8" }} />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "0 12px",
                      height: 40,
                      borderRadius: 12,
                      border: "1px solid #dbe2ea",
                      background: "#fff",
                    }}
                  >
                    <ShieldAlert style={{ width: 14, height: 14, color: "#64748b" }} />
                    <select
                      value={levelFilter}
                      onChange={(e) => setLevelFilter(e.target.value)}
                      style={{
                        border: "none",
                        outline: "none",
                        background: "transparent",
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#334155",
                      }}
                    >
                      <option value="all">Alle prioriteiten</option>
                      <option value="critical">Kritiek</option>
                      <option value="high">Hoog</option>
                      <option value="medium">Midden</option>
                      <option value="low">Laag</option>
                    </select>
                    <ChevronDown style={{ width: 14, height: 14, color: "#94a3b8" }} />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "0 12px",
                      height: 40,
                      borderRadius: 12,
                      border: "1px solid #dbe2ea",
                      background: "#fff",
                    }}
                  >
                    <Clock3 style={{ width: 14, height: 14, color: "#64748b" }} />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      style={{
                        border: "none",
                        outline: "none",
                        background: "transparent",
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#334155",
                      }}
                    >
                      <option value="all">Alle statussen</option>
                      <option value="open">Open</option>
                      <option value="monitoring">Monitoring</option>
                      <option value="mitigating">Mitigating</option>
                      <option value="closed">Closed</option>
                    </select>
                    <ChevronDown style={{ width: 14, height: 14, color: "#94a3b8" }} />
                  </div>
                </div>

                <div style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>
                  {filteredRows.length} risico’s zichtbaar
                </div>
              </div>

              {loading ? (
                <div
                  style={{
                    minHeight: 420,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    color: "#64748b",
                  }}
                >
                  <Loader2 className="animate-spin" style={{ width: 18, height: 18 }} />
                  Laden...
                </div>
              ) : filteredRows.length === 0 ? (
                <div
                  style={{
                    padding: 60,
                    textAlign: "center",
                    color: "#64748b",
                  }}
                >
                  Geen risico’s gevonden voor deze filters.
                </div>
              ) : (
                <div style={{ padding: 16 }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "280px minmax(700px, 1fr)",
                      border: "1px solid #e8edf3",
                      borderRadius: 16,
                      overflowX: "auto",
                    }}
                  >
                    <div style={{ background: "#fff" }}>
                      <div
                        style={{
                          height: 88,
                          borderBottom: "1px solid #e8edf3",
                          display: "flex",
                          alignItems: "center",
                          padding: "0 16px",
                          fontSize: 14,
                          fontWeight: 800,
                          color: "#0f172a",
                        }}
                      >
                        Risico’s
                      </div>

                      {filteredRows.map((row, idx) => {
                        const level = normalizeLevel(row.risk.level, row.risk.score);
                        const styles = LEVEL_STYLES[level] ?? LEVEL_STYLES.default;
                        const linkedPhases = riskPhaseLookup.get(row.risk.id) ?? [];
                        const owner = row.owner;
                        const selected = selectedRow?.risk.id === row.risk.id;

                        return (
                          <div
                            key={row.risk.id}
                            onClick={() => setSelectedRiskId(row.risk.id)}
                            style={{
                              minHeight: 78,
                              padding: "14px 16px",
                              borderBottom:
                                idx === filteredRows.length - 1
                                  ? "none"
                                  : "1px solid #eef2f7",
                              cursor: "pointer",
                              background: selected ? "#f8fbff" : "white",
                              borderRight: selected ? "2px solid #2563eb" : "2px solid transparent",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                marginBottom: 8,
                              }}
                            >
                              <div
                                style={{
                                  width: 10,
                                  height: 40,
                                  borderRadius: 999,
                                  background: styles.border,
                                  flexShrink: 0,
                                }}
                              />
                              <div style={{ minWidth: 0 }}>
                                <div
                                  style={{
                                    fontSize: 15,
                                    fontWeight: 700,
                                    color: "#0f172a",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {row.risk.title}
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    gap: 6,
                                    flexWrap: "wrap",
                                    marginTop: 6,
                                  }}
                                >
                                  {row.risk.category && (
                                    <span
                                      style={{
                                        fontSize: 11,
                                        padding: "4px 8px",
                                        borderRadius: 999,
                                        background: "#f1f5f9",
                                        color: "#475569",
                                        fontWeight: 700,
                                      }}
                                    >
                                      {row.risk.category}
                                    </span>
                                  )}
                                  <span
                                    style={{
                                      fontSize: 11,
                                      padding: "4px 8px",
                                      borderRadius: 999,
                                      background: styles.pill,
                                      color: styles.text,
                                      fontWeight: 800,
                                      textTransform: "capitalize",
                                    }}
                                  >
                                    {level === "critical"
                                      ? "Kritiek"
                                      : level === "high"
                                      ? "Hoog"
                                      : level === "medium"
                                      ? "Midden"
                                      : level === "low"
                                      ? "Laag"
                                      : "Standaard"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                flexWrap: "wrap",
                                fontSize: 12,
                                color: "#64748b",
                              }}
                            >
                              {owner && (
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                                  <User2 style={{ width: 12, height: 12 }} />
                                  {owner.name}
                                </span>
                              )}
                              {linkedPhases[0]?.title && (
                                <span>Fase: {linkedPhases[0].title}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ background: "#fff", position: "relative" }}>
                      <div
                        style={{
                          position: "sticky",
                          top: 0,
                          zIndex: 2,
                          background: "white",
                          borderBottom: "1px solid #e8edf3",
                        }}
                      >
                        <div style={{ position: "relative", height: 36, marginLeft: 0 }}>
                          {monthMarkers.map((m, i) => (
                            <div
                              key={i}
                              style={{
                                position: "absolute",
                                left: `calc(${m.pct}% - 10px)`,
                                top: 10,
                                fontSize: 11,
                                color: "#64748b",
                                fontWeight: 700,
                              }}
                            >
                              {m.label}
                            </div>
                          ))}
                        </div>

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: `repeat(${Math.max(phases.length, 1)}, minmax(120px, 1fr))`,
                            gap: 0,
                            minHeight: 52,
                            borderTop: "1px solid #f1f5f9",
                          }}
                        >
                          {phases.map((phase, idx) => (
                            <div
                              key={phase.id}
                              style={{
                                padding: "10px 12px",
                                background: PHASE_BG[idx % PHASE_BG.length],
                                borderRight: idx === phases.length - 1 ? "none" : "1px solid #e8edf3",
                              }}
                            >
                              <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>
                                {phase.title}
                              </div>
                              <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                                {fmtShortDate(phase.start_date)} — {fmtShortDate(phase.end_date)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{ position: "relative" }}>
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            bottom: 0,
                            left: `${todayPct}%`,
                            width: 2,
                            background: "#ef4444",
                            opacity: 0.45,
                            zIndex: 1,
                          }}
                        />

                        {monthMarkers.map((m, i) => (
                          <div
                            key={i}
                            style={{
                              position: "absolute",
                              top: 0,
                              bottom: 0,
                              left: `${m.pct}%`,
                              width: 1,
                              background: "#eef2f7",
                              zIndex: 0,
                            }}
                          />
                        ))}

                        {filteredRows.map((row, idx) => {
                          const linkedPhases = riskPhaseLookup.get(row.risk.id) ?? [];
                          const level = normalizeLevel(row.risk.level, row.risk.score);
                          const styles = LEVEL_STYLES[level] ?? LEVEL_STYLES.default;
                          const selected = selectedRow?.risk.id === row.risk.id;
                          const { start, end } = deriveRiskRange(row.risk, linkedPhases);

                          const left = start ? clamp(posPct(start, range.min, range.max), 0, 100) : 0;
                          const right = end ? clamp(posPct(end, range.min, range.max), 0, 100) : left + 8;
                          const width = Math.max(6, right - left);

                          return (
                            <div
                              key={row.risk.id}
                              style={{
                                position: "relative",
                                minHeight: 78,
                                borderBottom:
                                  idx === filteredRows.length - 1
                                    ? "none"
                                    : "1px solid #eef2f7",
                                background: selected ? "#fafcff" : "transparent",
                              }}
                            >
                              <div
                                style={{
                                  position: "absolute",
                                  left: `${left}%`,
                                  width: `${width}%`,
                                  top: 16,
                                  height: 36,
                                  borderRadius: 12,
                                  background: styles.bg,
                                  border: `1px solid ${styles.border}`,
                                  boxShadow: selected
                                    ? "0 10px 18px rgba(37,99,235,0.16)"
                                    : "0 4px 10px rgba(15,23,42,0.08)",
                                  display: "flex",
                                  alignItems: "center",
                                  padding: "0 10px",
                                  gap: 10,
                                  zIndex: 2,
                                  cursor: "pointer",
                                }}
                                onClick={() => setSelectedRiskId(row.risk.id)}
                              >
                                <div
                                  style={{
                                    fontSize: 11,
                                    fontWeight: 800,
                                    color: "white",
                                    opacity: 0.95,
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {level === "critical"
                                    ? "Kritiek"
                                    : level === "high"
                                    ? "Hoog"
                                    : level === "medium"
                                    ? "Midden"
                                    : level === "low"
                                    ? "Laag"
                                    : "Risico"}
                                </div>

                                {width > 20 && (
                                  <div
                                    style={{
                                      flex: 1,
                                      minWidth: 0,
                                      fontSize: 12,
                                      fontWeight: 700,
                                      color: "white",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {row.risk.status ?? "Monitoring"}
                                  </div>
                                )}

                                {daysOpen(row.risk) !== null && width > 28 && (
                                  <div
                                    style={{
                                      fontSize: 11,
                                      fontWeight: 700,
                                      color: "rgba(255,255,255,0.92)",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {daysOpen(row.risk)} dagen open
                                  </div>
                                )}
                              </div>

                              {row.actions.map((action) => {
                                const linked = actionPhaseLookup.get(action.id) ?? [];
                                const fallbackDate =
                                  linked.find((p) => p.start_date)?.start_date ??
                                  action.due_date ??
                                  row.risk.due_review_date ??
                                  row.risk.updated_at;

                                if (!fallbackDate) return null;

                                const x = clamp(posPct(fallbackDate, range.min, range.max), 0, 100);
                                const st = normalizeActionStatus(
                                  action.status,
                                  action.due_date,
                                  action.completed_at
                                );
                                const acStyle =
                                  ACTION_STATUS_STYLES[st] ?? ACTION_STATUS_STYLES.default;

                                return (
                                  <div
                                    key={action.id}
                                    title={action.title}
                                    style={{
                                      position: "absolute",
                                      left: `calc(${x}% - 7px)`,
                                      top: 56,
                                      width: 14,
                                      height: 14,
                                      borderRadius: "50%",
                                      background: acStyle.dot,
                                      border: "3px solid white",
                                      boxShadow: "0 0 0 1px rgba(15,23,42,0.08)",
                                      zIndex: 3,
                                    }}
                                  />
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: 14,
                      display: "flex",
                      gap: 18,
                      flexWrap: "wrap",
                      color: "#475569",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <span
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: "#2563eb",
                          display: "inline-block",
                        }}
                      />
                      Inspectie / review / actiepunt
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <span
                        style={{
                          width: 2,
                          height: 14,
                          background: "#ef4444",
                          display: "inline-block",
                        }}
                      />
                      Vandaag
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div
              style={{
                marginTop: 16,
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: 18,
                boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "16px 18px",
                  borderBottom: "1px solid #eef2f7",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontWeight: 800,
                  color: "#0f172a",
                }}
              >
                <Calendar style={{ width: 17, height: 17, color: "#64748b" }} />
                Vandaag & aankomende acties
              </div>

              <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                {upcomingItems.length === 0 ? (
                  <div style={{ padding: 16, color: "#64748b" }}>
                    Geen aankomende acties of reviews.
                  </div>
                ) : (
                  upcomingItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => item.riskId && setSelectedRiskId(item.riskId)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        border: "1px solid #e8edf3",
                        background: "#fff",
                        borderRadius: 14,
                        padding: "12px 14px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 12,
                            background: item.kind === "review" ? "#dbeafe" : "#ffedd5",
                            color: item.kind === "review" ? "#1d4ed8" : "#ea580c",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {item.kind === "review" ? (
                            <Target style={{ width: 16, height: 16 }} />
                          ) : (
                            <CheckCircle2 style={{ width: 16, height: 16 }} />
                          )}
                        </div>

                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                            {item.subtitle}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                          fontSize: 12,
                          color: "#475569",
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {fmtDate(item.date)}
                        <ArrowRight style={{ width: 14, height: 14 }} />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <div
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: 18,
              boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
              overflow: "hidden",
              position: "sticky",
              top: 18,
            }}
          >
            <div
              style={{
                padding: "16px 18px",
                borderBottom: "1px solid #eef2f7",
                background: "linear-gradient(180deg, #0f172a 0%, #111827 100%)",
                color: "white",
              }}
            >
              <div style={{ fontSize: 13, opacity: 0.78, fontWeight: 700 }}>
                Risico details
              </div>
              <div style={{ marginTop: 8, fontSize: 22, fontWeight: 800, lineHeight: 1.2 }}>
                {selectedRow?.risk.title ?? "Geen risico geselecteerd"}
              </div>
            </div>

            {!selectedRow ? (
              <div style={{ padding: 18, color: "#64748b" }}>
                Selecteer een risico om details te zien.
              </div>
            ) : (
              (() => {
                const risk = selectedRow.risk;
                const linkedPhases = riskPhaseLookup.get(risk.id) ?? [];
                const owner = selectedRow.owner;
                const level = normalizeLevel(risk.level, risk.score);
                const styles = LEVEL_STYLES[level] ?? LEVEL_STYLES.default;
                const openDays = daysOpen(risk);
                const { start, end } = deriveRiskRange(risk, linkedPhases);

                return (
                  <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 18 }}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <span
                        style={{
                          padding: "6px 10px",
                          borderRadius: 999,
                          background: styles.pill,
                          color: styles.text,
                          fontSize: 12,
                          fontWeight: 800,
                          textTransform: "capitalize",
                        }}
                      >
                        {level === "critical"
                          ? "Kritiek"
                          : level === "high"
                          ? "Hoog"
                          : level === "medium"
                          ? "Midden"
                          : level === "low"
                          ? "Laag"
                          : "Standaard"}
                      </span>

                      <span
                        style={{
                          padding: "6px 10px",
                          borderRadius: 999,
                          background: "#eef2ff",
                          color: "#4338ca",
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {risk.status ?? "Monitoring"}
                      </span>

                      {risk.category && (
                        <span
                          style={{
                            padding: "6px 10px",
                            borderRadius: 999,
                            background: "#f1f5f9",
                            color: "#475569",
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          {risk.category}
                        </span>
                      )}
                    </div>

                    {risk.description && (
                      <p
                        style={{
                          margin: 0,
                          color: "#475569",
                          lineHeight: 1.65,
                          fontSize: 14,
                        }}
                      >
                        {risk.description}
                      </p>
                    )}

                    <div
                      style={{
                        border: "1px solid #e8edf3",
                        borderRadius: 16,
                        overflow: "hidden",
                      }}
                    >
                      {[
                        ["Risicoscore", risk.score ?? "—"],
                        ["Kans", risk.probability ?? "—"],
                        ["Impact", risk.impact ?? "—"],
                        ["Start", fmtDate(start)],
                        ["Einde / review", fmtDate(end)],
                        ["Open sinds", openDays !== null ? `${openDays} dagen` : "—"],
                      ].map(([label, value], i) => (
                        <div
                          key={label}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 12,
                            padding: "12px 14px",
                            borderBottom: i === 5 ? "none" : "1px solid #eef2f7",
                            fontSize: 13,
                          }}
                        >
                          <span style={{ color: "#64748b" }}>{label}</span>
                          <span style={{ color: "#0f172a", fontWeight: 700 }}>{value}</span>
                        </div>
                      ))}
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color: "#0f172a",
                          marginBottom: 10,
                        }}
                      >
                        Eigenaar
                      </div>

                      {owner ? (
                        <div
                          style={{
                            border: "1px solid #e8edf3",
                            borderRadius: 16,
                            padding: 14,
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <div
                            style={{
                              width: 42,
                              height: 42,
                              borderRadius: "50%",
                              background: "#dbeafe",
                              color: "#1d4ed8",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 800,
                            }}
                          >
                            {initials(owner.name)}
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                              {owner.name}
                            </div>
                            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                              {owner.role ?? owner.organization ?? "Stakeholder"}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            border: "1px dashed #dbe2ea",
                            borderRadius: 16,
                            padding: 14,
                            color: "#64748b",
                            fontSize: 13,
                          }}
                        >
                          Geen eigenaar gekoppeld.
                        </div>
                      )}
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color: "#0f172a",
                          marginBottom: 10,
                        }}
                      >
                        Gekoppelde fases
                      </div>

                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {linkedPhases.length ? (
                          linkedPhases.map((p) => (
                            <span
                              key={p.id}
                              style={{
                                padding: "7px 10px",
                                borderRadius: 999,
                                background: "#f8fafc",
                                border: "1px solid #e2e8f0",
                                fontSize: 12,
                                fontWeight: 700,
                                color: "#334155",
                              }}
                            >
                              {p.title}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: 13, color: "#64748b" }}>
                            Geen fasekoppeling gevonden.
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color: "#0f172a",
                          marginBottom: 10,
                        }}
                      >
                        Acties
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {selectedRow.actions.length ? (
                          selectedRow.actions.map((action) => {
                            const st = normalizeActionStatus(
                              action.status,
                              action.due_date,
                              action.completed_at
                            );
                            const acStyle =
                              ACTION_STATUS_STYLES[st] ?? ACTION_STATUS_STYLES.default;

                            return (
                              <div
                                key={action.id}
                                style={{
                                  border: "1px solid #e8edf3",
                                  borderRadius: 14,
                                  padding: 12,
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 10,
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: 13,
                                      fontWeight: 700,
                                      color: "#0f172a",
                                    }}
                                  >
                                    {action.title}
                                  </div>
                                  <span
                                    style={{
                                      padding: "5px 8px",
                                      borderRadius: 999,
                                      background: acStyle.bg,
                                      color: acStyle.text,
                                      fontSize: 11,
                                      fontWeight: 800,
                                      textTransform: "capitalize",
                                    }}
                                  >
                                    {st === "in_progress"
                                      ? "Bezig"
                                      : st === "overdue"
                                      ? "Verlopen"
                                      : st === "done"
                                      ? "Afgerond"
                                      : "Open"}
                                  </span>
                                </div>

                                {action.description && (
                                  <div
                                    style={{
                                      marginTop: 8,
                                      fontSize: 12,
                                      color: "#64748b",
                                      lineHeight: 1.5,
                                    }}
                                  >
                                    {action.description}
                                  </div>
                                )}

                                <div
                                  style={{
                                    marginTop: 10,
                                    display: "flex",
                                    justifyContent: "space-between",
                                    fontSize: 12,
                                    color: "#64748b",
                                  }}
                                >
                                  <span>Deadline</span>
                                  <span style={{ fontWeight: 700, color: "#334155" }}>
                                    {fmtDate(action.due_date)}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div
                            style={{
                              border: "1px dashed #dbe2ea",
                              borderRadius: 16,
                              padding: 14,
                              color: "#64748b",
                              fontSize: 13,
                            }}
                          >
                            Geen acties gekoppeld aan dit risico.
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #e8edf3",
                        borderRadius: 16,
                        padding: 14,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color: "#0f172a",
                          marginBottom: 8,
                        }}
                      >
                        AI Insight
                      </div>
                      <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
                        {risk.generation_reason
                          ? risk.generation_reason
                          : risk.suggested_action
                          ? `Aanbevolen actie: ${risk.suggested_action}`
                          : "Nog geen AI-insight opgeslagen voor dit risico."}
                      </div>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </div>
      </div>
    </div>
  );
}