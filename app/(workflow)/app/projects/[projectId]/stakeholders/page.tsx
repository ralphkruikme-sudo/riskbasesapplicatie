"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Building2,
  Filter,
  Loader2,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Users,
  UserRound,
  X,
} from "lucide-react";
import { useParams } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

type ProjectStakeholder = {
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
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

type StakeholderFormState = {
  name: string;
  organization: string;
  role: string;
  stakeholder_type: StakeholderType | "";
  email: string;
  phone: string;
  influence_score: number;
  interest_score: number;
  notes: string;
};

const defaultFormState: StakeholderFormState = {
  name: "",
  organization: "",
  role: "",
  stakeholder_type: "",
  email: "",
  phone: "",
  influence_score: 3,
  interest_score: 3,
  notes: "",
};

const stakeholderTypeOptions: StakeholderType[] = [
  "client",
  "government",
  "contractor",
  "subcontractor",
  "supplier",
  "utility",
  "internal",
  "community",
  "consultant",
  "other",
];

function formatTypeLabel(type: StakeholderType | null) {
  if (!type) return "Unspecified";

  switch (type) {
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
      return type;
  }
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
  if (!name) return "S";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getTypeClasses(type: StakeholderType | null) {
  switch (type) {
    case "client":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "government":
      return "bg-violet-50 text-violet-700 border-violet-200";
    case "contractor":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "subcontractor":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "supplier":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "utility":
      return "bg-cyan-50 text-cyan-700 border-cyan-200";
    case "internal":
      return "bg-slate-100 text-slate-700 border-slate-200";
    case "community":
      return "bg-pink-50 text-pink-700 border-pink-200";
    case "consultant":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "other":
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

function getInfluenceInterestQuadrant(influence: number, interest: number) {
  if (influence >= 4 && interest >= 4) return "Manage closely";
  if (influence >= 4 && interest <= 3) return "Keep satisfied";
  if (influence <= 3 && interest >= 4) return "Keep informed";
  return "Monitor";
}

function getQuadrantClasses(label: string) {
  switch (label) {
    case "Manage closely":
      return "bg-red-50 text-red-700 border-red-200";
    case "Keep satisfied":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Keep informed":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "Monitor":
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
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

export default function StakeholdersPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [stakeholders, setStakeholders] = useState<ProjectStakeholder[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [searchValue, setSearchValue] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | StakeholderType>("all");
  const [sortBy, setSortBy] = useState<
    "updated_desc" | "influence_desc" | "interest_desc" | "name_asc"
  >("updated_desc");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedStakeholder, setSelectedStakeholder] =
    useState<ProjectStakeholder | null>(null);
  const [form, setForm] = useState<StakeholderFormState>(defaultFormState);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadStakeholdersPage() {
    setLoading(true);
    setErrorMessage(null);

    const { data, error } = await supabase
      .from("project_stakeholders")
      .select("*")
      .eq("project_id", projectId)
      .order("updated_at", { ascending: false });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setStakeholders((data || []) as ProjectStakeholder[]);
    setLoading(false);
  }

  useEffect(() => {
    if (projectId) {
      loadStakeholdersPage();
    }
  }, [projectId]);

  const stats = useMemo(() => {
    const total = stakeholders.length;
    const highInfluence = stakeholders.filter((item) => item.influence_score >= 4).length;
    const highInterest = stakeholders.filter((item) => item.interest_score >= 4).length;
    const manageClosely = stakeholders.filter(
      (item) =>
        getInfluenceInterestQuadrant(item.influence_score, item.interest_score) ===
        "Manage closely"
    ).length;

    const avgInfluence =
      total > 0
        ? (
            stakeholders.reduce((sum, item) => sum + item.influence_score, 0) / total
          ).toFixed(1)
        : "0.0";

    return {
      total,
      highInfluence,
      highInterest,
      manageClosely,
      avgInfluence,
    };
  }, [stakeholders]);

  const filteredStakeholders = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    const next = stakeholders.filter((item) => {
      const matchesSearch =
        query.length === 0 ||
        item.name.toLowerCase().includes(query) ||
        (item.organization || "").toLowerCase().includes(query) ||
        (item.role || "").toLowerCase().includes(query) ||
        (item.email || "").toLowerCase().includes(query);

      const matchesType = typeFilter === "all" || item.stakeholder_type === typeFilter;

      return matchesSearch && matchesType;
    });

    const sorted = [...next];

    switch (sortBy) {
      case "influence_desc":
        sorted.sort((a, b) => b.influence_score - a.influence_score);
        break;
      case "interest_desc":
        sorted.sort((a, b) => b.interest_score - a.interest_score);
        break;
      case "name_asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
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
  }, [stakeholders, searchValue, typeFilter, sortBy]);

  const typeDistribution = useMemo(() => {
    const map = new Map<string, number>();

    stakeholders.forEach((item) => {
      const key = formatTypeLabel(item.stakeholder_type);
      map.set(key, (map.get(key) || 0) + 1);
    });

    return Array.from(map.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }, [stakeholders]);

  const topStakeholders = useMemo(() => {
    return [...stakeholders]
      .sort((a, b) => {
        const scoreA = a.influence_score + a.interest_score;
        const scoreB = b.influence_score + b.interest_score;
        return scoreB - scoreA;
      })
      .slice(0, 5);
  }, [stakeholders]);

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

  async function handleCreateStakeholder() {
    if (!form.name.trim()) {
      setErrorMessage("Stakeholder name is required.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    const payload = {
      project_id: projectId,
      name: form.name.trim(),
      organization: form.organization.trim() || null,
      role: form.role.trim() || null,
      stakeholder_type: form.stakeholder_type || null,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      influence_score: Number(form.influence_score),
      interest_score: Number(form.interest_score),
      notes: form.notes.trim() || null,
    };

    const { error } = await supabase.from("project_stakeholders").insert(payload);

    if (error) {
      setErrorMessage(error.message);
      setSubmitting(false);
      return;
    }

    await loadStakeholdersPage();
    closeCreateModal();
    resetForm();
  }

  return (
    <section className="p-8">
      <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
            <Users className="h-3.5 w-3.5" />
            Stakeholders
          </div>

          <h1 className="mt-4 text-[38px] font-semibold tracking-tight text-slate-900">
            Project Stakeholders
          </h1>
          <p className="mt-2 max-w-3xl text-[17px] text-slate-500">
            Manage stakeholders, track influence and interest, and build better
            communication control around the project.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => loadStakeholdersPage()}
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
            Add Stakeholder
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
          title="Total Stakeholders"
          value={String(stats.total)}
          sublabel="All stakeholder records"
          icon={<Users className="h-5 w-5" />}
        />
        <MetricCard
          title="High Influence"
          value={String(stats.highInfluence)}
          sublabel="Influence score 4 or 5"
          icon={<Building2 className="h-5 w-5" />}
        />
        <MetricCard
          title="High Interest"
          value={String(stats.highInterest)}
          sublabel="Interest score 4 or 5"
          icon={<UserRound className="h-5 w-5" />}
        />
        <MetricCard
          title="Manage Closely"
          value={String(stats.manageClosely)}
          sublabel="High influence and high interest"
          icon={<Users className="h-5 w-5" />}
        />
        <MetricCard
          title="Avg. Influence"
          value={stats.avgInfluence}
          sublabel="Average influence score"
          icon={<Building2 className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Stakeholder Overview
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Search, filter and manage all stakeholder records for this project.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[240px] flex-1 xl:w-[280px] xl:flex-none">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search stakeholder, org or role..."
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  />
                </div>

                <div className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-600">
                  <Filter className="h-4 w-4" />
                  Filters
                </div>
              </div>
            </div>

            <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              <select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value as "all" | StakeholderType)
                }
                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
              >
                <option value="all">All types</option>
                {stakeholderTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {formatTypeLabel(type)}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as
                      | "updated_desc"
                      | "influence_desc"
                      | "interest_desc"
                      | "name_asc"
                  )
                }
                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
              >
                <option value="updated_desc">Recently updated</option>
                <option value="influence_desc">Highest influence first</option>
                <option value="interest_desc">Highest interest first</option>
                <option value="name_asc">Name A-Z</option>
              </select>

              <div className="hidden xl:block" />
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200">
              <div className="hidden grid-cols-[1.1fr_1fr_120px_120px_180px_120px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 lg:grid">
                <div>Stakeholder</div>
                <div>Organization / Type</div>
                <div>Influence</div>
                <div>Interest</div>
                <div>Quadrant</div>
                <div>Updated</div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center gap-3 px-6 py-16 text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading stakeholders...
                </div>
              ) : filteredStakeholders.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                    <Users className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">
                    No stakeholders found
                  </h3>
                  <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
                    This project does not have any stakeholders yet, or your current
                    filters do not match any items.
                  </p>
                  <button
                    onClick={openCreateModal}
                    className="mt-5 inline-flex h-11 items-center gap-2 rounded-2xl bg-[#182B63] px-5 text-sm font-medium text-white"
                  >
                    <Plus className="h-4 w-4" />
                    Add first stakeholder
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {filteredStakeholders.map((item) => {
                    const quadrant = getInfluenceInterestQuadrant(
                      item.influence_score,
                      item.interest_score
                    );

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedStakeholder(item)}
                        className="block w-full text-left transition hover:bg-slate-50"
                      >
                        <div className="px-5 py-5 lg:hidden">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <p className="text-base font-semibold text-slate-900">
                                {item.name}
                              </p>
                              <p className="mt-1 text-sm text-slate-500">
                                {item.organization || "No organization"} •{" "}
                                {formatTypeLabel(item.stakeholder_type)}
                              </p>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                              {getInitials(item.name)}
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-slate-400">Influence</p>
                              <p className="mt-1 font-medium text-slate-700">
                                {item.influence_score}/5
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-400">Interest</p>
                              <p className="mt-1 font-medium text-slate-700">
                                {item.interest_score}/5
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="hidden grid-cols-[1.1fr_1fr_120px_120px_180px_120px] items-center gap-4 px-5 py-4 lg:grid">
                          <div className="min-w-0">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                                {getInitials(item.name)}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-900">
                                  {item.name}
                                </p>
                                <p className="mt-1 truncate text-xs text-slate-500">
                                  {item.role || "No role specified"}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-800">
                              {item.organization || "No organization"}
                            </p>
                            <p className="mt-1">
                              <span
                                className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${getTypeClasses(
                                  item.stakeholder_type
                                )}`}
                              >
                                {formatTypeLabel(item.stakeholder_type)}
                              </span>
                            </p>
                          </div>

                          <div className="text-sm font-semibold text-slate-900">
                            {item.influence_score}/5
                          </div>

                          <div className="text-sm font-semibold text-slate-900">
                            {item.interest_score}/5
                          </div>

                          <div>
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getQuadrantClasses(
                                quadrant
                              )}`}
                            >
                              {quadrant}
                            </span>
                          </div>

                          <div className="text-sm text-slate-700">
                            {formatDate(item.updated_at)}
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
                <h3 className="text-lg font-semibold text-slate-900">Stakeholder Matrix</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Influence and interest overview
                </p>
              </div>
              <Users className="h-5 w-5 text-slate-400" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                "Manage closely",
                "Keep satisfied",
                "Keep informed",
                "Monitor",
              ].map((quadrant) => {
                const count = stakeholders.filter(
                  (item) =>
                    getInfluenceInterestQuadrant(
                      item.influence_score,
                      item.interest_score
                    ) === quadrant
                ).length;

                return (
                  <div
                    key={quadrant}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${getQuadrantClasses(
                        quadrant
                      )}`}
                    >
                      {quadrant}
                    </span>
                    <p className="mt-3 text-2xl font-semibold text-slate-900">
                      {count}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Top Stakeholders</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Highest combined influence and interest
                </p>
              </div>
              <Building2 className="h-5 w-5 text-slate-400" />
            </div>

            {topStakeholders.length === 0 ? (
              <p className="text-sm text-slate-500">
                No stakeholders added yet.
              </p>
            ) : (
              <div className="space-y-3">
                {topStakeholders.map((item) => {
                  const quadrant = getInfluenceInterestQuadrant(
                    item.influence_score,
                    item.interest_score
                  );

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedStakeholder(item)}
                      className="flex w-full items-start justify-between gap-4 rounded-2xl border border-slate-200 p-4 text-left transition hover:bg-slate-50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {item.name}
                        </p>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {item.organization || "No organization"}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${getQuadrantClasses(
                          quadrant
                        )}`}
                      >
                        {quadrant}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Type Distribution
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Which stakeholder groups dominate this project
              </p>
            </div>

            {typeDistribution.length === 0 ? (
              <p className="text-sm text-slate-500">
                No stakeholder types available yet.
              </p>
            ) : (
              <div className="space-y-3">
                {typeDistribution.slice(0, 6).map((item) => {
                  const width =
                    stats.total > 0 ? (item.count / stats.total) * 100 : 0;

                  return (
                    <div key={item.label}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="truncate font-medium text-slate-700">
                          {item.label}
                        </span>
                        <span className="text-slate-500">{item.count}</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-[#182B63]"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
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
                  Create New Stakeholder
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Add a stakeholder with organization, influence and communication details.
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
                      Stakeholder name
                    </label>
                    <input
                      value={form.name}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="For example: Municipality of Schiedam"
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Organization
                      </label>
                      <input
                        value={form.organization}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            organization: e.target.value,
                          }))
                        }
                        placeholder="Organization name"
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Role
                      </label>
                      <input
                        value={form.role}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, role: e.target.value }))
                        }
                        placeholder="Permit authority, supplier, PM..."
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Stakeholder type
                    </label>
                    <select
                      value={form.stakeholder_type}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          stakeholder_type: e.target.value as StakeholderType | "",
                        }))
                      }
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
                    >
                      <option value="">Select type</option>
                      {stakeholderTypeOptions.map((type) => (
                        <option key={type} value={type}>
                          {formatTypeLabel(type)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Email
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, email: e.target.value }))
                        }
                        placeholder="email@example.com"
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Phone
                      </label>
                      <input
                        value={form.phone}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, phone: e.target.value }))
                        }
                        placeholder="+31..."
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Influence score (1-5)
                      </label>
                      <select
                        value={String(form.influence_score)}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            influence_score: Number(e.target.value),
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
                        Interest score (1-5)
                      </label>
                      <select
                        value={String(form.interest_score)}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            interest_score: Number(e.target.value),
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
                      Stakeholder quadrant
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getQuadrantClasses(
                          getInfluenceInterestQuadrant(
                            form.influence_score,
                            form.interest_score
                          )
                        )}`}
                      >
                        {getInfluenceInterestQuadrant(
                          form.influence_score,
                          form.interest_score
                        )}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      Influence {form.influence_score}/5 • Interest{" "}
                      {form.interest_score}/5
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Notes
                    </label>
                    <textarea
                      value={form.notes}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, notes: e.target.value }))
                      }
                      placeholder="Add relevant communication notes, concerns or context..."
                      rows={6}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none"
                    />
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
                  onClick={handleCreateStakeholder}
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
                      Create Stakeholder
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {selectedStakeholder ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getTypeClasses(
                      selectedStakeholder.stakeholder_type
                    )}`}
                  >
                    {formatTypeLabel(selectedStakeholder.stakeholder_type)}
                  </span>

                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getQuadrantClasses(
                      getInfluenceInterestQuadrant(
                        selectedStakeholder.influence_score,
                        selectedStakeholder.interest_score
                      )
                    )}`}
                  >
                    {getInfluenceInterestQuadrant(
                      selectedStakeholder.influence_score,
                      selectedStakeholder.interest_score
                    )}
                  </span>
                </div>

                <h2 className="truncate text-2xl font-semibold tracking-tight text-slate-900">
                  {selectedStakeholder.name}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Detailed view of this stakeholder record
                </p>
              </div>

              <button
                onClick={() => setSelectedStakeholder(null)}
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
                      Stakeholder Details
                    </h3>

                    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Organization
                        </p>
                        <p className="mt-2 text-sm font-medium text-slate-900">
                          {selectedStakeholder.organization || "—"}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Role
                        </p>
                        <p className="mt-2 text-sm font-medium text-slate-900">
                          {selectedStakeholder.role || "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 p-5">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Contact Information
                    </h3>

                    <div className="mt-4 space-y-4">
                      <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                        <Mail className="h-5 w-5 text-slate-400" />
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            Email
                          </p>
                          <p className="mt-1 text-sm font-medium text-slate-900">
                            {selectedStakeholder.email || "—"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                        <Phone className="h-5 w-5 text-slate-400" />
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            Phone
                          </p>
                          <p className="mt-1 text-sm font-medium text-slate-900">
                            {selectedStakeholder.phone || "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 p-5">
                    <h3 className="text-lg font-semibold text-slate-900">Notes</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {selectedStakeholder.notes || "No notes added yet."}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-3xl border border-slate-200 p-5">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Influence & Interest
                    </h3>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-slate-200 p-4 text-center">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Influence
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-slate-900">
                          {selectedStakeholder.influence_score}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 p-4 text-center">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Interest
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-slate-900">
                          {selectedStakeholder.interest_score}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Quadrant
                      </p>
                      <span
                        className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getQuadrantClasses(
                          getInfluenceInterestQuadrant(
                            selectedStakeholder.influence_score,
                            selectedStakeholder.interest_score
                          )
                        )}`}
                      >
                        {getInfluenceInterestQuadrant(
                          selectedStakeholder.influence_score,
                          selectedStakeholder.interest_score
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 p-5">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Record Details
                    </h3>

                    <div className="mt-4 space-y-4">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Last updated
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-900">
                          {formatDate(selectedStakeholder.updated_at)}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Created
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-900">
                          {formatDate(selectedStakeholder.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Next build step
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      After this page works, the next smart step is linking
                      stakeholders to risks and actions, so RiskBases can show who
                      matters for each issue and who should be notified.
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