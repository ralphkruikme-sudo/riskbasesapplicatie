"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock3,
  Filter,
  Link2,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Target,
  User2,
  X,
} from "lucide-react";
import { useParams } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type ActionStatus = "open" | "in_progress" | "blocked" | "done" | "overdue";
type ActionPriority = "low" | "medium" | "high" | "critical";

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
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

type ProjectRiskOption = {
  id: string;
  risk_code: string | null;
  title: string;
  category: string | null;
  level: "low" | "medium" | "high";
};

type ProfileOption = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
};

type ActionFormState = {
  title: string;
  description: string;
  risk_id: string;
  owner_user_id: string;
  status: ActionStatus;
  priority: ActionPriority;
  due_date: string;
};

const defaultFormState: ActionFormState = {
  title: "",
  description: "",
  risk_id: "",
  owner_user_id: "",
  status: "open",
  priority: "medium",
  due_date: "",
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

function getInitials(name?: string | null) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatStatusLabel(status: ActionStatus) {
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

function formatPriorityLabel(priority: ActionPriority) {
  switch (priority) {
    case "low":
      return "Low";
    case "medium":
      return "Medium";
    case "high":
      return "High";
    case "critical":
      return "Critical";
    default:
      return priority;
  }
}

function getStatusClasses(status: ActionStatus) {
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

function getPriorityClasses(priority: ActionPriority) {
  switch (priority) {
    case "low":
      return "bg-slate-100 text-slate-700 border-slate-200";
    case "medium":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "high":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "critical":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

function getRiskLevelClasses(level: "low" | "medium" | "high") {
  if (level === "high") return "bg-red-50 text-red-700 border-red-200";
  if (level === "medium") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-blue-50 text-blue-700 border-blue-200";
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

export default function ActionsPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [actions, setActions] = useState<RiskAction[]>([]);
  const [risks, setRisks] = useState<ProjectRiskOption[]>([]);
  const [members, setMembers] = useState<ProfileOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ActionStatus>("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | ActionPriority>("all");
  const [sortBy, setSortBy] = useState<
    "updated_desc" | "due_asc" | "priority_desc" | "title_asc"
  >("updated_desc");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState<RiskAction | null>(null);
  const [form, setForm] = useState<ActionFormState>(defaultFormState);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadActionsPage() {
    setLoading(true);
    setErrorMessage(null);

    const [{ data: actionsData, error: actionsError }, { data: risksData }, { data: workspaceProject }] =
      await Promise.all([
        supabase
          .from("risk_actions")
          .select("*")
          .eq("project_id", projectId)
          .order("updated_at", { ascending: false }),
        supabase
          .from("project_risks")
          .select("id, risk_code, title, category, level")
          .eq("project_id", projectId)
          .order("score", { ascending: false }),
        supabase
          .from("projects")
          .select("workspace_id")
          .eq("id", projectId)
          .single(),
      ]);

    if (actionsError) {
      setErrorMessage(actionsError.message);
      setLoading(false);
      return;
    }

    setActions((actionsData || []) as RiskAction[]);
    setRisks((risksData || []) as ProjectRiskOption[]);

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

    setLoading(false);
  }

  useEffect(() => {
    if (projectId) {
      loadActionsPage();
    }
  }, [projectId]);

  const riskMap = useMemo(() => {
    return new Map(risks.map((risk) => [risk.id, risk]));
  }, [risks]);

  const ownerMap = useMemo(() => {
    return new Map(members.map((member) => [member.id, member]));
  }, [members]);

  const stats = useMemo(() => {
    const total = actions.length;
    const open = actions.filter((action) => action.status === "open").length;
    const inProgress = actions.filter((action) => action.status === "in_progress").length;
    const blocked = actions.filter((action) => action.status === "blocked").length;
    const done = actions.filter((action) => action.status === "done").length;

    const overdue = actions.filter((action) => {
      if (!action.due_date || action.status === "done") return false;
      const due = new Date(action.due_date).getTime();
      return due < Date.now();
    }).length;

    const critical = actions.filter((action) => action.priority === "critical").length;

    return {
      total,
      open,
      inProgress,
      blocked,
      done,
      overdue,
      critical,
    };
  }, [actions]);

  const filteredActions = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    const next = actions.filter((action) => {
      const linkedRisk = action.risk_id ? riskMap.get(action.risk_id) : null;

      const matchesSearch =
        query.length === 0 ||
        action.title.toLowerCase().includes(query) ||
        (action.description || "").toLowerCase().includes(query) ||
        (linkedRisk?.title || "").toLowerCase().includes(query) ||
        (linkedRisk?.risk_code || "").toLowerCase().includes(query);

      const matchesStatus = statusFilter === "all" || action.status === statusFilter;
      const matchesPriority =
        priorityFilter === "all" || action.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });

    const sorted = [...next];

    switch (sortBy) {
      case "due_asc":
        sorted.sort((a, b) => {
          const aTime = a.due_date ? new Date(a.due_date).getTime() : Infinity;
          const bTime = b.due_date ? new Date(b.due_date).getTime() : Infinity;
          return aTime - bTime;
        });
        break;
      case "priority_desc":
        const rank: Record<ActionPriority, number> = {
          critical: 4,
          high: 3,
          medium: 2,
          low: 1,
        };
        sorted.sort((a, b) => rank[b.priority] - rank[a.priority]);
        break;
      case "title_asc":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
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
  }, [actions, riskMap, searchValue, statusFilter, priorityFilter, sortBy]);

  const upcomingActions = useMemo(() => {
    return [...actions]
      .filter((action) => action.due_date && action.status !== "done")
      .sort((a, b) => {
        const aTime = a.due_date ? new Date(a.due_date).getTime() : Infinity;
        const bTime = b.due_date ? new Date(b.due_date).getTime() : Infinity;
        return aTime - bTime;
      })
      .slice(0, 5);
  }, [actions]);

  const statusDistribution = useMemo(() => {
    const ordered: ActionStatus[] = [
      "open",
      "in_progress",
      "blocked",
      "done",
      "overdue",
    ];

    return ordered.map((status) => ({
      status,
      count:
        status === "overdue"
          ? actions.filter((action) => {
              if (!action.due_date || action.status === "done") return false;
              return new Date(action.due_date).getTime() < Date.now();
            }).length
          : actions.filter((action) => action.status === status).length,
    }));
  }, [actions]);

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

async function handleCreateAction() {
  if (!form.title.trim()) {
    setErrorMessage("Action title is required.");
    return;
  }

  setSubmitting(true);
  setErrorMessage(null);

  const payload = {
    project_id: projectId,
    risk_id: form.risk_id || null,
    title: form.title.trim(),
    description: form.description.trim() || null,
    owner_user_id: form.owner_user_id || null,
    status: form.status,
    priority: form.priority,
    due_date: form.due_date || null,
    completed_at: form.status === "done" ? new Date().toISOString() : null,
  };

  const { data: insertedAction, error: actionError } = await supabase
    .from("risk_actions")
    .insert(payload)
    .select()
    .single();

  if (actionError) {
    setErrorMessage(actionError.message);
    setSubmitting(false);
    return;
  }

  if (form.owner_user_id && insertedAction) {
    const linkedRisk = form.risk_id ? riskMap.get(form.risk_id) : null;

    const notificationPayload = {
      project_id: projectId,
      risk_id: form.risk_id || null,
      action_id: insertedAction.id,
      user_id: form.owner_user_id,
      type: "action_assigned",
      title: "New action assigned",
      message: linkedRisk
        ? `You have been assigned a new action: "${form.title.trim()}" linked to ${linkedRisk.risk_code || "a risk"}.`
        : `You have been assigned a new action: "${form.title.trim()}".`,
    };

    const { error: notificationError } = await supabase
      .from("notifications")
      .insert(notificationPayload);

    if (notificationError) {
      console.error("Notification insert failed:", notificationError.message);
    }
  }

  await loadActionsPage();
  closeCreateModal();
  resetForm();
}

  return (
    <section className="p-8">
      <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
            <Target className="h-3.5 w-3.5" />
            Actions
          </div>

          <h1 className="mt-4 text-[38px] font-semibold tracking-tight text-slate-900">
            Project Actions
          </h1>
          <p className="mt-2 max-w-3xl text-[17px] text-slate-500">
            Manage mitigation actions, assign owners, connect actions to risks and
            keep track of deadlines and progress.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => loadActionsPage()}
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
            Add Action
          </button>
        </div>
      </div>

      {errorMessage ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-5">
        <MetricCard
          title="Total Actions"
          value={String(stats.total)}
          sublabel="All mitigation actions"
          icon={<Target className="h-5 w-5" />}
        />
        <MetricCard
          title="Open"
          value={String(stats.open)}
          sublabel="Not started yet"
          icon={<Clock3 className="h-5 w-5" />}
        />
        <MetricCard
          title="In Progress"
          value={String(stats.inProgress)}
          sublabel="Currently being worked on"
          icon={<RefreshCw className="h-5 w-5" />}
        />
        <MetricCard
          title="Overdue"
          value={String(stats.overdue)}
          sublabel="Past due date"
          icon={<AlertCircle className="h-5 w-5" />}
        />
        <MetricCard
          title="Critical"
          value={String(stats.critical)}
          sublabel="Highest priority items"
          icon={<ShieldAlert className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Action Overview
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  All project actions with assignment, linked risk, priority and deadlines.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[240px] flex-1 xl:w-[280px] xl:flex-none">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search action or linked risk..."
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  />
                </div>

                <div className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-600">
                  <Filter className="h-4 w-4" />
                  Filters
                </div>
              </div>
            </div>

            <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-4">
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as "all" | ActionStatus)
                }
                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
              >
                <option value="all">All statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="blocked">Blocked</option>
                <option value="done">Done</option>
                <option value="overdue">Overdue</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) =>
                  setPriorityFilter(e.target.value as "all" | ActionPriority)
                }
                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
              >
                <option value="all">All priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as
                      | "updated_desc"
                      | "due_asc"
                      | "priority_desc"
                      | "title_asc"
                  )
                }
                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
              >
                <option value="updated_desc">Recently updated</option>
                <option value="due_asc">Nearest due date</option>
                <option value="priority_desc">Highest priority first</option>
                <option value="title_asc">Title A-Z</option>
              </select>

              <div className="hidden xl:block" />
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200">
              <div className="hidden grid-cols-[1.2fr_1fr_140px_140px_150px_120px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 lg:grid">
                <div>Action</div>
                <div>Linked Risk</div>
                <div>Priority</div>
                <div>Status</div>
                <div>Owner</div>
                <div>Due Date</div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center gap-3 px-6 py-16 text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading actions...
                </div>
              ) : filteredActions.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                    <Target className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">
                    No actions found
                  </h3>
                  <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
                    This project does not have any actions yet, or your filters
                    currently do not match any items.
                  </p>
                  <button
                    onClick={openCreateModal}
                    className="mt-5 inline-flex h-11 items-center gap-2 rounded-2xl bg-[#182B63] px-5 text-sm font-medium text-white"
                  >
                    <Plus className="h-4 w-4" />
                    Add first action
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {filteredActions.map((action) => {
                    const linkedRisk = action.risk_id ? riskMap.get(action.risk_id) : null;
                    const owner = action.owner_user_id
                      ? ownerMap.get(action.owner_user_id)
                      : null;

                    return (
                      <button
                        key={action.id}
                        type="button"
                        onClick={() => setSelectedAction(action)}
                        className="block w-full text-left transition hover:bg-slate-50"
                      >
                        <div className="px-5 py-5 lg:hidden">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <p className="text-base font-semibold text-slate-900">
                                {action.title}
                              </p>
                              <p className="mt-1 text-sm text-slate-500">
                                {linkedRisk
                                  ? `${linkedRisk.risk_code || "RISK"} • ${linkedRisk.title}`
                                  : "No linked risk"}
                              </p>
                            </div>

                            <div className="rounded-2xl bg-slate-100 px-3 py-2 text-center">
                              <p className="text-xs text-slate-500">Due</p>
                              <p className="text-sm font-semibold text-slate-900">
                                {formatDate(action.due_date)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <span
                              className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getPriorityClasses(
                                action.priority
                              )}`}
                            >
                              {formatPriorityLabel(action.priority)}
                            </span>
                            <span
                              className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                                action.status
                              )}`}
                            >
                              {formatStatusLabel(action.status)}
                            </span>
                          </div>
                        </div>

                        <div className="hidden grid-cols-[1.2fr_1fr_140px_140px_150px_120px] items-center gap-4 px-5 py-4 lg:grid">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {action.title}
                            </p>
                            <p className="mt-1 truncate text-xs text-slate-500">
                              {action.description || "No description added yet"}
                            </p>
                          </div>

                          <div className="min-w-0">
                            {linkedRisk ? (
                              <>
                                <p className="truncate text-sm font-medium text-slate-800">
                                  {linkedRisk.title}
                                </p>
                                <div className="mt-1 flex items-center gap-2">
                                  <span className="truncate text-xs text-slate-500">
                                    {linkedRisk.risk_code || "RISK"}
                                  </span>
                                  <span
                                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getRiskLevelClasses(
                                      linkedRisk.level
                                    )}`}
                                  >
                                    {linkedRisk.level.toUpperCase()}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <p className="text-sm text-slate-500">No linked risk</p>
                            )}
                          </div>

                          <div>
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getPriorityClasses(
                                action.priority
                              )}`}
                            >
                              {formatPriorityLabel(action.priority)}
                            </span>
                          </div>

                          <div>
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                                action.status
                              )}`}
                            >
                              {formatStatusLabel(action.status)}
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
                                    Action owner
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-slate-500">Unassigned</p>
                            )}
                          </div>

                          <div className="text-sm text-slate-700">
                            {formatDate(action.due_date)}
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
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Upcoming Due Dates</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Actions that need attention soon
                </p>
              </div>
              <Calendar className="h-5 w-5 text-slate-400" />
            </div>

            {upcomingActions.length === 0 ? (
              <p className="text-sm text-slate-500">
                No due dates have been added yet.
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingActions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => setSelectedAction(action)}
                    className="flex w-full items-start justify-between gap-4 rounded-2xl border border-slate-200 p-4 text-left transition hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {action.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatDate(action.due_date)}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${getPriorityClasses(
                        action.priority
                      )}`}
                    >
                      {formatPriorityLabel(action.priority)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Status Distribution</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Action progress across this project
                </p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-slate-400" />
            </div>

            <div className="space-y-3">
              {statusDistribution.map((item) => {
                const width = stats.total > 0 ? (item.count / stats.total) * 100 : 0;

                return (
                  <div key={item.status}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">
                        {formatStatusLabel(item.status)}
                      </span>
                      <span className="text-slate-500">{item.count}</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${
                          item.status === "done"
                            ? "bg-emerald-500"
                            : item.status === "blocked" || item.status === "overdue"
                            ? "bg-red-500"
                            : item.status === "in_progress"
                            ? "bg-amber-400"
                            : "bg-blue-500"
                        }`}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Next notification layer</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              After this page works, the next smart step is to add a notifications
              table so assigned owners can get in-app alerts and later email reminders
              when actions are assigned, due soon or overdue.
            </p>
          </div>
        </div>
      </div>

      {showCreateModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Create New Action
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Add a mitigation action, assign an owner and connect it to a risk.
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
                      Action title
                    </label>
                    <input
                      value={form.title}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, title: e.target.value }))
                      }
                      placeholder="For example: Submit missing permit documents"
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
                      placeholder="Describe what needs to be done..."
                      rows={5}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Linked risk
                    </label>
                    <select
                      value={form.risk_id}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, risk_id: e.target.value }))
                      }
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
                    >
                      <option value="">No linked risk</option>
                      {risks.map((risk) => (
                        <option key={risk.id} value={risk.id}>
                          {(risk.risk_code || "RISK") + " — " + risk.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-5">
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
                            status: e.target.value as ActionStatus,
                          }))
                        }
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="blocked">Blocked</option>
                        <option value="done">Done</option>
                        <option value="overdue">Overdue</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Priority
                      </label>
                      <select
                        value={form.priority}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            priority: e.target.value as ActionPriority,
                          }))
                        }
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Due date
                    </label>
                    <input
                      type="date"
                      value={form.due_date}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          due_date: e.target.value,
                        }))
                      }
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
                    />
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-700">
                      Notification-ready structure
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Because every action has an owner and due date, we can later add:
                      assigned-action alerts, due soon reminders and overdue notifications.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-slate-200 px-6 py-5">
              <button
                onClick={() => {
                  resetForm();
                }}
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
                  onClick={handleCreateAction}
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
                      Create Action
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {selectedAction ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getPriorityClasses(
                      selectedAction.priority
                    )}`}
                  >
                    {formatPriorityLabel(selectedAction.priority)}
                  </span>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                      selectedAction.status
                    )}`}
                  >
                    {formatStatusLabel(selectedAction.status)}
                  </span>
                </div>

                <h2 className="truncate text-2xl font-semibold tracking-tight text-slate-900">
                  {selectedAction.title}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Detailed view of this mitigation action
                </p>
              </div>

              <button
                onClick={() => setSelectedAction(null)}
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
                      Action Description
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {selectedAction.description || "No description added yet."}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-slate-200 p-5">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Linked Risk
                    </h3>

                    {selectedAction.risk_id && riskMap.get(selectedAction.risk_id) ? (
                      <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900">
                            {riskMap.get(selectedAction.risk_id)?.title}
                          </span>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getRiskLevelClasses(
                              riskMap.get(selectedAction.risk_id)!.level
                            )}`}
                          >
                            {riskMap.get(selectedAction.risk_id)!.level.toUpperCase()}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-500">
                          {(riskMap.get(selectedAction.risk_id)?.risk_code || "RISK") +
                            " • " +
                            (riskMap.get(selectedAction.risk_id)?.category || "Uncategorized")}
                        </p>
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-slate-500">
                        No risk linked to this action.
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-3xl border border-slate-200 p-5">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Ownership & Deadline
                    </h3>

                    <div className="mt-4 space-y-4">
                      <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                        <User2 className="h-5 w-5 text-slate-400" />
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            Owner
                          </p>
                          <p className="mt-1 text-sm font-medium text-slate-900">
                            {selectedAction.owner_user_id
                              ? ownerMap.get(selectedAction.owner_user_id)?.full_name ||
                                "Assigned user"
                              : "Unassigned"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                        <Calendar className="h-5 w-5 text-slate-400" />
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            Due date
                          </p>
                          <p className="mt-1 text-sm font-medium text-slate-900">
                            {formatDate(selectedAction.due_date)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                        <Clock3 className="h-5 w-5 text-slate-400" />
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            Last updated
                          </p>
                          <p className="mt-1 text-sm font-medium text-slate-900">
                            {formatDate(selectedAction.updated_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Notification path
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      After this, we can add notification records whenever an action
                      is assigned or approaches its due date, and later send email
                      reminders that people can receive in Outlook or any mail client.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}