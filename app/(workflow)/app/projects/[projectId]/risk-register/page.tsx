"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  AlertTriangle,
  Calendar,
  Eye,
  Filter,
  Link2,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  SlidersHorizontal,
  User2,
  Users,
  X,
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

type ProfileOption = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
};

type StakeholderType =
  | "client"
  | "government"
  | "contractor"
  | "subcontractor"
  | "supplier"
  | "utility"
  | "internal"
  | "community"
  | "consultant"
  | "other";

type StakeholderOption = {
  id: string;
  project_id: string;
  name: string;
  organization: string | null;
  role: string | null;
  stakeholder_type: StakeholderType | null;
  email: string | null;
  phone: string | null;
  influence_score: number;
  interest_score: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type RiskStakeholderLink = {
  id: string;
  risk_id: string;
  stakeholder_id: string;
  relationship_type:
    | "owner"
    | "influencer"
    | "affected"
    | "approver"
    | "reviewer"
    | "external_party";
  notes: string | null;
  created_at: string;
};

type RiskFormState = {
  title: string;
  description: string;
  category: string;
  risk_type: string;
  source: string;
  cause: string;
  consequence: string;
  probability: number;
  impact: number;
  status: RiskStatus;
  owner_user_id: string;
  phase: string;
  due_review_date: string;
};

type LinkStakeholderForm = {
  stakeholder_id: string;
  relationship_type:
    | "owner"
    | "influencer"
    | "affected"
    | "approver"
    | "reviewer"
    | "external_party";
  notes: string;
};

const defaultFormState: RiskFormState = {
  title: "",
  description: "",
  category: "",
  risk_type: "",
  source: "",
  cause: "",
  consequence: "",
  probability: 3,
  impact: 3,
  status: "open",
  owner_user_id: "",
  phase: "",
  due_review_date: "",
};

const defaultLinkStakeholderForm: LinkStakeholderForm = {
  stakeholder_id: "",
  relationship_type: "affected",
  notes: "",
};

const categoryOptions = [
  "Permits & Regulation",
  "Planning",
  "Financial",
  "Safety",
  "Design",
  "Execution",
  "Environment",
  "Stakeholders",
  "Procurement",
  "Weather",
  "Contractual",
  "Supply Chain",
];

const phaseOptions = [
  "Tender",
  "Preparation",
  "Engineering",
  "Execution",
  "Commissioning",
  "Delivery",
  "Maintenance",
];

const statusOptions: RiskStatus[] = [
  "open",
  "monitoring",
  "mitigated",
  "closed",
  "archived",
];

const relationshipTypeOptions: LinkStakeholderForm["relationship_type"][] = [
  "owner",
  "influencer",
  "affected",
  "approver",
  "reviewer",
  "external_party",
];

function formatStatusLabel(value: RiskStatus) {
  switch (value) {
    case "open":
      return "Open";
    case "monitoring":
      return "Monitoring";
    case "mitigated":
      return "Mitigated";
    case "closed":
      return "Closed";
    case "archived":
      return "Archived";
    default:
      return value;
  }
}

function formatRelationshipLabel(
  value: LinkStakeholderForm["relationship_type"]
) {
  switch (value) {
    case "owner":
      return "Owner";
    case "influencer":
      return "Influencer";
    case "affected":
      return "Affected";
    case "approver":
      return "Approver";
    case "reviewer":
      return "Reviewer";
    case "external_party":
      return "External Party";
    default:
      return value;
  }
}

function formatStakeholderTypeLabel(value: StakeholderType | null) {
  if (!value) return "Unspecified";

  switch (value) {
    case "client":
      return "Client";
    case "government":
      return "Government";
    case "contractor":
      return "Contractor";
    case "subcontractor":
      return "Subcontractor";
    case "supplier":
      return "Supplier";
    case "utility":
      return "Utility";
    case "internal":
      return "Internal";
    case "community":
      return "Community";
    case "consultant":
      return "Consultant";
    case "other":
      return "Other";
    default:
      return value;
  }
}

function getLevelClasses(level: RiskLevel | null | undefined) {
  if (level === "high") return "bg-red-50 text-red-700 border-red-200";
  if (level === "medium") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-blue-50 text-blue-700 border-blue-200";
}

function getStatusClasses(status: RiskStatus | null | undefined) {
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

function getRelationshipClasses(
  relationship: LinkStakeholderForm["relationship_type"]
) {
  switch (relationship) {
    case "owner":
      return "bg-red-50 text-red-700 border-red-200";
    case "approver":
      return "bg-violet-50 text-violet-700 border-violet-200";
    case "influencer":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "reviewer":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "external_party":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "affected":
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

function getScoreLevel(score: number): RiskLevel {
  if (score >= 15) return "high";
  if (score >= 6) return "medium";
  return "low";
}

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

function getInitials(name?: string | null) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
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

function RiskExposureCard({
  high,
  medium,
  low,
}: {
  high: number;
  medium: number;
  low: number;
}) {
  const total = high + medium + low;
  const highWidth = total ? (high / total) * 100 : 0;
  const mediumWidth = total ? (medium / total) * 100 : 0;
  const lowWidth = total ? (low / total) * 100 : 0;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Risk Exposure</h3>
          <p className="mt-1 text-sm text-slate-500">
            Distribution of low, medium and high risks
          </p>
        </div>
        <ShieldAlert className="h-5 w-5 text-slate-400" />
      </div>

      <div className="h-4 overflow-hidden rounded-full bg-slate-100">
        <div className="flex h-full w-full">
          <div className="bg-blue-500" style={{ width: `${lowWidth}%` }} />
          <div className="bg-amber-400" style={{ width: `${mediumWidth}%` }} />
          <div className="bg-red-500" style={{ width: `${highWidth}%` }} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-slate-200 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Low</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{low}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Medium</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{medium}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">High</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{high}</p>
        </div>
      </div>
    </div>
  );
}

export default function RiskRegisterPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [risks, setRisks] = useState<ProjectRisk[]>([]);
  const [members, setMembers] = useState<ProfileOption[]>([]);
  const [stakeholders, setStakeholders] = useState<StakeholderOption[]>([]);
  const [riskStakeholderLinks, setRiskStakeholderLinks] = useState<RiskStakeholderLink[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [linkingStakeholder, setLinkingStakeholder] = useState(false);

  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | RiskStatus>("all");
  const [levelFilter, setLevelFilter] = useState<"all" | RiskLevel>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState<
    "updated_desc" | "score_desc" | "score_asc" | "title_asc" | "review_asc"
  >("updated_desc");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<ProjectRisk | null>(null);
  const [showLinkStakeholderModal, setShowLinkStakeholderModal] = useState(false);

  const [form, setForm] = useState<RiskFormState>(defaultFormState);
  const [linkStakeholderForm, setLinkStakeholderForm] = useState<LinkStakeholderForm>(
    defaultLinkStakeholderForm
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadRiskRegister() {
    setLoading(true);
    setErrorMessage(null);

    const [{ data: risksData, error: risksError }, { data: workspaceProject }] =
      await Promise.all([
        supabase
          .from("project_risks")
          .select("*")
          .eq("project_id", projectId)
          .order("updated_at", { ascending: false }),
        supabase
          .from("projects")
          .select("workspace_id")
          .eq("id", projectId)
          .single(),
      ]);

    if (risksError) {
      setErrorMessage(risksError.message);
      setLoading(false);
      return;
    }

    const loadedRisks = (risksData || []) as ProjectRisk[];
    setRisks(loadedRisks);

    if (workspaceProject?.workspace_id) {
      const { data: workspaceMembers } = await supabase
        .from("workspace_members")
        .select("user_id")
        .eq("workspace_id", workspaceProject.workspace_id);

      const userIds =
        workspaceMembers
          ?.map((member: { user_id: string | null }) => member.user_id)
          .filter(Boolean) ?? [];

      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", userIds);

        setMembers((profilesData || []) as ProfileOption[]);
      } else {
        setMembers([]);
      }
    } else {
      setMembers([]);
    }

    const [{ data: stakeholderData }, { data: riskStakeholderData }] = await Promise.all([
      supabase
        .from("project_stakeholders")
        .select("*")
        .eq("project_id", projectId)
        .order("updated_at", { ascending: false }),
      supabase.from("risk_stakeholders").select("*"),
    ]);

    setStakeholders((stakeholderData || []) as StakeholderOption[]);

    const riskIds = new Set(loadedRisks.map((risk) => risk.id));
    setRiskStakeholderLinks(
      ((riskStakeholderData || []) as RiskStakeholderLink[]).filter((link) =>
        riskIds.has(link.risk_id)
      )
    );

    setLoading(false);
  }

  useEffect(() => {
    if (projectId) {
      loadRiskRegister();
    }
  }, [projectId]);

  const ownerMap = useMemo(() => {
    return new Map(members.map((member) => [member.id, member]));
  }, [members]);

  const stakeholderMap = useMemo(() => {
    return new Map(stakeholders.map((item) => [item.id, item]));
  }, [stakeholders]);

  const selectedRiskStakeholderLinks = useMemo(() => {
    if (!selectedRisk) return [];
    return riskStakeholderLinks.filter((link) => link.risk_id === selectedRisk.id);
  }, [riskStakeholderLinks, selectedRisk]);

  const availableStakeholdersForSelectedRisk = useMemo(() => {
    if (!selectedRisk) return stakeholders;

    const linkedIds = new Set(
      riskStakeholderLinks
        .filter((link) => link.risk_id === selectedRisk.id)
        .map((link) => link.stakeholder_id)
    );

    return stakeholders.filter((item) => !linkedIds.has(item.id));
  }, [stakeholders, riskStakeholderLinks, selectedRisk]);

  const filteredRisks = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    const next = risks.filter((risk) => {
      const matchesSearch =
        query.length === 0 ||
        risk.title.toLowerCase().includes(query) ||
        (risk.risk_code || "").toLowerCase().includes(query) ||
        (risk.description || "").toLowerCase().includes(query) ||
        (risk.category || "").toLowerCase().includes(query) ||
        (risk.risk_type || "").toLowerCase().includes(query);

      const matchesStatus = statusFilter === "all" || risk.status === statusFilter;
      const matchesLevel = levelFilter === "all" || risk.level === levelFilter;
      const matchesCategory =
        categoryFilter === "all" || (risk.category || "") === categoryFilter;

      return matchesSearch && matchesStatus && matchesLevel && matchesCategory;
    });

    const sorted = [...next];

    switch (sortBy) {
      case "score_desc":
        sorted.sort((a, b) => b.score - a.score);
        break;
      case "score_asc":
        sorted.sort((a, b) => a.score - b.score);
        break;
      case "title_asc":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "review_asc":
        sorted.sort((a, b) => {
          const aTime = a.due_review_date ? new Date(a.due_review_date).getTime() : Infinity;
          const bTime = b.due_review_date ? new Date(b.due_review_date).getTime() : Infinity;
          return aTime - bTime;
        });
        break;
      case "updated_desc":
      default:
        sorted.sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
        break;
    }

    return sorted;
  }, [risks, searchValue, statusFilter, levelFilter, categoryFilter, sortBy]);

  const stats = useMemo(() => {
    const total = risks.length;
    const high = risks.filter((risk) => risk.level === "high").length;
    const medium = risks.filter((risk) => risk.level === "medium").length;
    const low = risks.filter((risk) => risk.level === "low").length;
    const open = risks.filter((risk) => risk.status === "open").length;
    const monitoring = risks.filter((risk) => risk.status === "monitoring").length;

    const totalScore = risks.reduce((sum, risk) => sum + risk.score, 0);
    const avgScore = total > 0 ? (totalScore / total).toFixed(1) : "0.0";

    return {
      total,
      high,
      medium,
      low,
      open,
      monitoring,
      avgScore,
    };
  }, [risks]);

  const topRisks = useMemo(() => {
    return [...risks].sort((a, b) => b.score - a.score).slice(0, 5);
  }, [risks]);

  const uniqueCategories = useMemo(() => {
    return Array.from(
      new Set(risks.map((risk) => risk.category).filter(Boolean))
    ) as string[];
  }, [risks]);

  function resetForm() {
    setForm(defaultFormState);
  }

  function openCreateModal() {
    resetForm();
    setShowCreateModal(true);
  }

  function closeCreateModal() {
    setShowCreateModal(false);
    setSubmitting(false);
  }

  async function handleCreateRisk() {
    if (!form.title.trim()) {
      setErrorMessage("Risk title is required.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    const payload = {
      project_id: projectId,
      title: form.title.trim(),
      description: form.description.trim() || null,
      category: form.category || null,
      risk_type: form.risk_type.trim() || null,
      source: form.source.trim() || null,
      cause: form.cause.trim() || null,
      consequence: form.consequence.trim() || null,
      probability: Number(form.probability),
      impact: Number(form.impact),
      status: form.status,
      owner_user_id: form.owner_user_id || null,
      phase: form.phase || null,
      due_review_date: form.due_review_date || null,
    };

    const { error } = await supabase.from("project_risks").insert(payload);

    if (error) {
      setErrorMessage(error.message);
      setSubmitting(false);
      return;
    }

    await loadRiskRegister();
    closeCreateModal();
    resetForm();
  }

  function openRiskDetails(risk: ProjectRisk) {
    setSelectedRisk(risk);
    setShowLinkStakeholderModal(false);
    setLinkStakeholderForm(defaultLinkStakeholderForm);
  }

  function closeRiskDetails() {
    setSelectedRisk(null);
    setShowLinkStakeholderModal(false);
    setLinkStakeholderForm(defaultLinkStakeholderForm);
  }

  async function handleLinkStakeholder() {
    if (!selectedRisk) return;

    if (!linkStakeholderForm.stakeholder_id) {
      setErrorMessage("Please select a stakeholder to link.");
      return;
    }

    setLinkingStakeholder(true);
    setErrorMessage(null);

    const payload = {
      risk_id: selectedRisk.id,
      stakeholder_id: linkStakeholderForm.stakeholder_id,
      relationship_type: linkStakeholderForm.relationship_type,
      notes: linkStakeholderForm.notes.trim() || null,
    };

    const { error } = await supabase.from("risk_stakeholders").insert(payload);

    if (error) {
      setErrorMessage(error.message);
      setLinkingStakeholder(false);
      return;
    }

    await loadRiskRegister();

    const refreshedRisk = risks.find((item) => item.id === selectedRisk.id) || selectedRisk;
    setSelectedRisk(refreshedRisk);
    setShowLinkStakeholderModal(false);
    setLinkStakeholderForm(defaultLinkStakeholderForm);
    setLinkingStakeholder(false);
  }

  return (
    <section className="p-8">
      <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
            <Shield className="h-3.5 w-3.5" />
            Risk Register
          </div>

          <h1 className="mt-4 text-[38px] font-semibold tracking-tight text-slate-900">
            Project Risk Register
          </h1>
          <p className="mt-2 max-w-3xl text-[17px] text-slate-500">
            Central overview of all identified project risks, their exposure,
            ownership, review moments and linked stakeholders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => loadRiskRegister()}
            className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>

          <button
            onClick={openCreateModal}
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#182B63] px-5 text-sm font-medium text-white shadow-sm transition hover:opacity-95"
          >
            <Plus className="h-4 w-4" />
            Add Risk
          </button>
        </div>
      </div>

      {errorMessage ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-4">
        <MetricCard
          title="Total Risks"
          value={String(stats.total)}
          sublabel="All recorded project risks"
          icon={<Shield className="h-5 w-5" />}
        />
        <MetricCard
          title="High Risks"
          value={String(stats.high)}
          sublabel="Immediate attention required"
          icon={<AlertTriangle className="h-5 w-5" />}
        />
        <MetricCard
          title="Open Risks"
          value={String(stats.open)}
          sublabel="Currently active and unresolved"
          icon={<Eye className="h-5 w-5" />}
        />
        <MetricCard
          title="Avg. Risk Score"
          value={stats.avgScore}
          sublabel="Average exposure across the register"
          icon={<SlidersHorizontal className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Risk Register Overview
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Search, filter and manage all project risks from one place.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[240px] flex-1 xl:w-[280px] xl:flex-none">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search risk title, code or category..."
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  />
                </div>

                <div className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-600">
                  <Filter className="h-4 w-4" />
                  Filters
                </div>
              </div>
            </div>

            <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as "all" | RiskStatus)
                }
                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
              >
                <option value="all">All statuses</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {formatStatusLabel(status)}
                  </option>
                ))}
              </select>

              <select
                value={levelFilter}
                onChange={(e) =>
                  setLevelFilter(e.target.value as "all" | RiskLevel)
                }
                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
              >
                <option value="all">All levels</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
              >
                <option value="all">All categories</option>
                {Array.from(new Set([...categoryOptions, ...uniqueCategories])).map(
                  (category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  )
                )}
              </select>

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as
                      | "updated_desc"
                      | "score_desc"
                      | "score_asc"
                      | "title_asc"
                      | "review_asc"
                  )
                }
                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
              >
                <option value="updated_desc">Recently updated</option>
                <option value="score_desc">Highest score first</option>
                <option value="score_asc">Lowest score first</option>
                <option value="title_asc">Title A-Z</option>
                <option value="review_asc">Nearest review date</option>
              </select>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200">
              <div className="hidden grid-cols-[1.1fr_1fr_120px_140px_150px_120px_140px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 lg:grid">
                <div>Risk</div>
                <div>Category / Type</div>
                <div>Exposure</div>
                <div>Status</div>
                <div>Owner</div>
                <div>Review</div>
                <div>Updated</div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center gap-3 px-6 py-16 text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading risk register...
                </div>
              ) : filteredRisks.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                    <ShieldAlert className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">
                    No risks found
                  </h3>
                  <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
                    This project does not have any risks yet, or your current
                    search and filters do not match any items.
                  </p>
                  <button
                    onClick={openCreateModal}
                    className="mt-5 inline-flex h-11 items-center gap-2 rounded-2xl bg-[#182B63] px-5 text-sm font-medium text-white"
                  >
                    <Plus className="h-4 w-4" />
                    Add first risk
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {filteredRisks.map((risk) => {
                    const owner = risk.owner_user_id
                      ? ownerMap.get(risk.owner_user_id)
                      : null;

                    return (
                      <button
                        key={risk.id}
                        type="button"
                        onClick={() => openRiskDetails(risk)}
                        className="block w-full text-left transition hover:bg-slate-50"
                      >
                        <div className="px-5 py-5 lg:hidden">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                  {risk.risk_code || "RISK"}
                                </span>
                                <span
                                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getLevelClasses(
                                    risk.level
                                  )}`}
                                >
                                  {risk.level.toUpperCase()}
                                </span>
                              </div>
                              <p className="mt-3 text-base font-semibold text-slate-900">
                                {risk.title}
                              </p>
                              <p className="mt-1 text-sm text-slate-500">
                                {risk.category || "Uncategorized"} •{" "}
                                {risk.risk_type || "General risk"}
                              </p>
                            </div>

                            <div className="rounded-2xl bg-slate-100 px-3 py-2 text-center">
                              <p className="text-xs text-slate-500">Score</p>
                              <p className="text-lg font-semibold text-slate-900">
                                {risk.score}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-slate-400">Status</p>
                              <p className="mt-1 font-medium text-slate-700">
                                {formatStatusLabel(risk.status)}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-400">Owner</p>
                              <p className="mt-1 font-medium text-slate-700">
                                {owner?.full_name || "Unassigned"}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-400">Review</p>
                              <p className="mt-1 font-medium text-slate-700">
                                {formatDate(risk.due_review_date)}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-400">Updated</p>
                              <p className="mt-1 font-medium text-slate-700">
                                {formatDate(risk.updated_at)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="hidden grid-cols-[1.1fr_1fr_120px_140px_150px_120px_140px] items-center gap-4 px-5 py-4 lg:grid">
                          <div className="min-w-0">
                            <div className="mb-2 flex items-center gap-2">
                              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                                {risk.risk_code || "RISK"}
                              </span>
                              <span
                                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getLevelClasses(
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
                              {risk.description || "No description added yet"}
                            </p>
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-800">
                              {risk.category || "Uncategorized"}
                            </p>
                            <p className="mt-1 truncate text-xs text-slate-500">
                              {risk.risk_type || "General risk"}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {risk.score}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              P{risk.probability} × I{risk.impact}
                            </p>
                          </div>

                          <div>
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                                risk.status
                              )}`}
                            >
                              {formatStatusLabel(risk.status)}
                            </span>
                          </div>

                          <div className="min-w-0">
                            {owner ? (
                              <div className="flex items-center gap-3">
                                {owner.avatar_url ? (
                                  <img
                                    src={owner.avatar_url}
                                    alt={owner.full_name || "Owner"}
                                    className="h-9 w-9 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                                    {getInitials(owner.full_name)}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-slate-800">
                                    {owner.full_name || "User"}
                                  </p>
                                  <p className="truncate text-xs text-slate-500">
                                    Risk owner
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-slate-500">Unassigned</p>
                            )}
                          </div>

                          <div className="text-sm text-slate-700">
                            {formatDate(risk.due_review_date)}
                          </div>

                          <div className="text-sm text-slate-700">
                            {formatDate(risk.updated_at)}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6 xl:col-span-4">
          <RiskExposureCard
            high={stats.high}
            medium={stats.medium}
            low={stats.low}
          />

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Quick Insights</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Immediate highlights from the current risk register
                </p>
              </div>
              <AlertTriangle className="h-5 w-5 text-slate-400" />
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Monitoring
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {stats.monitoring}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Risks currently being tracked closely
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Linked Stakeholders
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {riskStakeholderLinks.length}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Total stakeholder links across this project register
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Recommendation
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Start by assigning an owner and linking relevant stakeholders to
                  every high risk. That gives you immediate accountability and
                  communication control.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Top Risks</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Highest exposure items in this project
                </p>
              </div>
              <ShieldAlert className="h-5 w-5 text-slate-400" />
            </div>

            {topRisks.length === 0 ? (
              <p className="text-sm text-slate-500">
                No risks added yet. Add your first risk to populate this section.
              </p>
            ) : (
              <div className="space-y-3">
                {topRisks.map((risk) => (
                  <button
                    key={risk.id}
                    type="button"
                    onClick={() => openRiskDetails(risk)}
                    className="flex w-full items-start justify-between gap-4 rounded-2xl border border-slate-200 p-4 text-left transition hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {risk.title}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {risk.risk_code || "RISK"} • {risk.category || "Uncategorized"}
                      </p>
                    </div>

                    <div className="shrink-0 rounded-xl bg-slate-100 px-3 py-2 text-center">
                      <p className="text-[11px] text-slate-500">Score</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {risk.score}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreateModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Create New Risk
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Add a new project risk with owner, exposure and review details.
                </p>
              </div>

              <button
                onClick={closeCreateModal}
                className="rounded-2xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[calc(92vh-140px)] overflow-y-auto px-6 py-6">
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Risk title
                    </label>
                    <input
                      value={form.title}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, title: e.target.value }))
                      }
                      placeholder="For example: Delay in environmental permit approval"
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Description
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, description: e.target.value }))
                      }
                      placeholder="Describe the risk in a clear and practical way..."
                      rows={5}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Category
                      </label>
                      <select
                        value={form.category}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, category: e.target.value }))
                        }
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
                      >
                        <option value="">Select category</option>
                        {categoryOptions.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Risk type
                      </label>
                      <input
                        value={form.risk_type}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, risk_type: e.target.value }))
                        }
                        placeholder="Permit delay, supply issue, contract risk..."
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Source
                    </label>
                    <input
                      value={form.source}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, source: e.target.value }))
                      }
                      placeholder="Where was this risk identified?"
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Cause
                    </label>
                    <textarea
                      value={form.cause}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, cause: e.target.value }))
                      }
                      placeholder="What may trigger this risk?"
                      rows={3}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Consequence
                    </label>
                    <textarea
                      value={form.consequence}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, consequence: e.target.value }))
                      }
                      placeholder="What is the expected impact if this happens?"
                      rows={3}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Probability (1-5)
                      </label>
                      <select
                        value={String(form.probability)}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            probability: Number(e.target.value),
                          }))
                        }
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
                      >
                        {[1, 2, 3, 4, 5].map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Impact (1-5)
                      </label>
                      <select
                        value={String(form.impact)}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            impact: Number(e.target.value),
                          }))
                        }
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
                      >
                        {[1, 2, 3, 4, 5].map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-700">
                      Calculated exposure
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="rounded-2xl bg-white px-4 py-3">
                        <p className="text-xs text-slate-500">Score</p>
                        <p className="text-2xl font-semibold text-slate-900">
                          {form.probability * form.impact}
                        </p>
                      </div>
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getLevelClasses(
                          getScoreLevel(form.probability * form.impact)
                        )}`}
                      >
                        {getScoreLevel(form.probability * form.impact).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Status
                      </label>
                      <select
                        value={form.status}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            status: e.target.value as RiskStatus,
                          }))
                        }
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {formatStatusLabel(status)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Phase
                      </label>
                      <select
                        value={form.phase}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, phase: e.target.value }))
                        }
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
                      >
                        <option value="">Select phase</option>
                        {phaseOptions.map((phase) => (
                          <option key={phase} value={phase}>
                            {phase}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Owner
                      </label>
                      <select
                        value={form.owner_user_id}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            owner_user_id: e.target.value,
                          }))
                        }
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
                      >
                        <option value="">Unassigned</option>
                        {members.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.full_name || member.id}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Review date
                      </label>
                      <input
                        type="date"
                        value={form.due_review_date}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            due_review_date: e.target.value,
                          }))
                        }
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-slate-200 px-6 py-5">
              <button
                onClick={resetForm}
                className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Reset
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={closeCreateModal}
                  className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleCreateRisk}
                  disabled={submitting}
                  className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#182B63] px-5 text-sm font-medium text-white transition hover:opacity-95 disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create Risk
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {selectedRisk ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    {selectedRisk.risk_code || "RISK"}
                  </span>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getLevelClasses(
                      selectedRisk.level
                    )}`}
                  >
                    {selectedRisk.level.toUpperCase()}
                  </span>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                      selectedRisk.status
                    )}`}
                  >
                    {formatStatusLabel(selectedRisk.status)}
                  </span>
                </div>

                <h2 className="truncate text-2xl font-semibold tracking-tight text-slate-900">
                  {selectedRisk.title}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Detailed view of this project risk
                </p>
              </div>

              <button
                onClick={closeRiskDetails}
                className="rounded-2xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[calc(92vh-96px)] overflow-y-auto px-6 py-6">
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="space-y-6 xl:col-span-2">
                  <div className="rounded-3xl border border-slate-200 p-5">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Risk Description
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {selectedRisk.description || "No description added yet."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="rounded-3xl border border-slate-200 p-5">
                      <h3 className="text-lg font-semibold text-slate-900">Cause</h3>
                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        {selectedRisk.cause || "No cause added yet."}
                      </p>
                    </div>

                    <div className="rounded-3xl border border-slate-200 p-5">
                      <h3 className="text-lg font-semibold text-slate-900">
                        Consequence
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        {selectedRisk.consequence || "No consequence added yet."}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 p-5">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Register Details
                    </h3>

                    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Category
                        </p>
                        <p className="mt-2 text-sm font-medium text-slate-900">
                          {selectedRisk.category || "—"}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Risk Type
                        </p>
                        <p className="mt-2 text-sm font-medium text-slate-900">
                          {selectedRisk.risk_type || "—"}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Source
                        </p>
                        <p className="mt-2 text-sm font-medium text-slate-900">
                          {selectedRisk.source || "—"}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Phase
                        </p>
                        <p className="mt-2 text-sm font-medium text-slate-900">
                          {selectedRisk.phase || "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 p-5">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          Linked Stakeholders
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Stakeholders connected to this risk
                        </p>
                      </div>

                      <button
                        onClick={() => setShowLinkStakeholderModal(true)}
                        className="inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        <Plus className="h-4 w-4" />
                        Link stakeholder
                      </button>
                    </div>

                    {selectedRiskStakeholderLinks.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">
                          No stakeholders linked to this risk yet.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedRiskStakeholderLinks.map((link) => {
                          const stakeholder = stakeholderMap.get(link.stakeholder_id);
                          if (!stakeholder) return null;

                          return (
                            <div
                              key={link.id}
                              className="rounded-2xl border border-slate-200 p-4"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                                      {getInitials(stakeholder.name)}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="truncate text-sm font-semibold text-slate-900">
                                        {stakeholder.name}
                                      </p>
                                      <p className="mt-1 truncate text-xs text-slate-500">
                                        {stakeholder.organization || "No organization"} •{" "}
                                        {formatStakeholderTypeLabel(
                                          stakeholder.stakeholder_type
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <span
                                  className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${getRelationshipClasses(
                                    link.relationship_type
                                  )}`}
                                >
                                  {formatRelationshipLabel(link.relationship_type)}
                                </span>
                              </div>

                              {link.notes ? (
                                <p className="mt-3 text-sm leading-6 text-slate-600">
                                  {link.notes}
                                </p>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-3xl border border-slate-200 p-5">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Exposure Score
                    </h3>

                    <div className="mt-4 rounded-3xl bg-slate-50 p-5 text-center">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Score
                      </p>
                      <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">
                        {selectedRisk.score}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        Probability {selectedRisk.probability} × Impact{" "}
                        {selectedRisk.impact}
                      </p>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-slate-200 p-4 text-center">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Probability
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-slate-900">
                          {selectedRisk.probability}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 p-4 text-center">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Impact
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-slate-900">
                          {selectedRisk.impact}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 p-5">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Ownership & Review
                    </h3>

                    <div className="mt-4 space-y-4">
                      <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                        <User2 className="h-5 w-5 text-slate-400" />
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            Owner
                          </p>
                          <p className="mt-1 text-sm font-medium text-slate-900">
                            {selectedRisk.owner_user_id
                              ? ownerMap.get(selectedRisk.owner_user_id)?.full_name ||
                                "Assigned user"
                              : "Unassigned"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                        <Calendar className="h-5 w-5 text-slate-400" />
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            Review date
                          </p>
                          <p className="mt-1 text-sm font-medium text-slate-900">
                            {formatDate(selectedRisk.due_review_date)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                        <RefreshCw className="h-5 w-5 text-slate-400" />
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            Last updated
                          </p>
                          <p className="mt-1 text-sm font-medium text-slate-900">
                            {formatDate(selectedRisk.updated_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Next build step
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      After this page works, the next smart move is linking
                      actions to each risk and showing those actions in this same
                      detail modal.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {showLinkStakeholderModal ? (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4">
              <div className="w-full max-w-2xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
                <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                      Link Stakeholder
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Connect a stakeholder to this risk with a relationship type.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowLinkStakeholderModal(false)}
                    className="rounded-2xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="px-6 py-6">
                  <div className="space-y-5">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Stakeholder
                      </label>
                      <select
                        value={linkStakeholderForm.stakeholder_id}
                        onChange={(e) =>
                          setLinkStakeholderForm((prev) => ({
                            ...prev,
                            stakeholder_id: e.target.value,
                          }))
                        }
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
                      >
                        <option value="">Select stakeholder</option>
                        {availableStakeholdersForSelectedRisk.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}{" "}
                            {item.organization ? `— ${item.organization}` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Relationship type
                      </label>
                      <select
                        value={linkStakeholderForm.relationship_type}
                        onChange={(e) =>
                          setLinkStakeholderForm((prev) => ({
                            ...prev,
                            relationship_type:
                              e.target.value as LinkStakeholderForm["relationship_type"],
                          }))
                        }
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
                      >
                        {relationshipTypeOptions.map((item) => (
                          <option key={item} value={item}>
                            {formatRelationshipLabel(item)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Notes
                      </label>
                      <textarea
                        value={linkStakeholderForm.notes}
                        onChange={(e) =>
                          setLinkStakeholderForm((prev) => ({
                            ...prev,
                            notes: e.target.value,
                          }))
                        }
                        placeholder="Optional note about this relationship..."
                        rows={4}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none"
                      />
                    </div>

                    {availableStakeholdersForSelectedRisk.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                        All current project stakeholders are already linked to this risk.
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-5">
                  <button
                    onClick={() => setShowLinkStakeholderModal(false)}
                    className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleLinkStakeholder}
                    disabled={
                      linkingStakeholder ||
                      !linkStakeholderForm.stakeholder_id ||
                      availableStakeholdersForSelectedRisk.length === 0
                    }
                    className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#182B63] px-5 text-sm font-medium text-white transition hover:opacity-95 disabled:opacity-60"
                  >
                    {linkingStakeholder ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Linking...
                      </>
                    ) : (
                      <>
                        <Link2 className="h-4 w-4" />
                        Link Stakeholder
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}