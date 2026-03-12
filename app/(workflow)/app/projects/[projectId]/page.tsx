"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  AlertTriangle,
  CheckCircle2,
  Filter,
  MoreVertical,
  Shield,
  ArrowUpRight,
  ChevronDown,
} from "lucide-react";
import { useParams } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Project = {
  id: string;
  name: string;
  open_risks_count: number | null;
  status: string | null;
};

function StatCard({
  title,
  value,
  sublabel,
  icon,
}: {
  title: string;
  value: string;
  sublabel?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>
          {sublabel ? <p className="mt-2 text-sm text-slate-500">{sublabel}</p> : null}
        </div>
        {icon ? (
          <div className="rounded-xl bg-slate-100 p-2 text-slate-600">{icon}</div>
        ) : null}
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  children,
  right,
}: {
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h3 className="text-[18px] font-semibold text-slate-900">{title}</h3>
        {right}
      </div>
      {children}
    </div>
  );
}

function MiniBar({
  height,
  label,
}: {
  height: number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex h-[140px] items-end">
        <div
          className="w-10 rounded-t-xl bg-slate-300"
          style={{ height: `${height}px` }}
        />
      </div>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}

export default function ProjectDashboardPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProject() {
      const { data } = await supabase
        .from("projects")
        .select("id, name, open_risks_count, status")
        .eq("id", projectId)
        .single();

      setProject(data || null);
      setLoading(false);
    }

    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const stats = useMemo(() => {
    const totalRisks = project?.open_risks_count ?? 0;
    return {
      totalRisks,
      highRisks: totalRisks > 0 ? Math.max(2, Math.round(totalRisks * 0.2)) : 0,
      openActions: totalRisks > 0 ? Math.max(4, Math.round(totalRisks * 0.35)) : 0,
      score: totalRisks > 0 ? "7.2 / 10" : "—",
    };
  }, [project]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <section className="p-8">
      <div className="mb-8 flex items-start justify-between gap-6">
        <div>
          <h1 className="text-[38px] font-semibold tracking-tight text-slate-900">
            Project Dashboard
          </h1>
          <p className="mt-2 text-[17px] text-slate-500">
            Overview key metrics and progress for the project
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm">
            <Filter className="h-4 w-4" />
            Filter
            <ChevronDown className="h-4 w-4" />
          </button>

          <button className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm">
            Sort
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-4">
        <StatCard
          title="Total Risks"
          value={String(stats.totalRisks)}
          sublabel="Total risks"
          icon={<Shield className="h-5 w-5" />}
        />
        <StatCard
          title="High Risks"
          value={String(stats.highRisks)}
          sublabel="Needs attention"
          icon={<AlertTriangle className="h-5 w-5" />}
        />
        <StatCard
          title="Open Actions"
          value={String(stats.openActions)}
          sublabel="Mitigation actions"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <StatCard
          title="Project Risk Score"
          value={stats.score}
          sublabel="Medium"
          icon={<ArrowUpRight className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <DashboardCard title="Risk Status">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="flex items-center justify-center">
                <div className="relative h-[260px] w-[260px] rounded-full bg-[conic-gradient(#ef4444_0_12%,#f59e0b_12%_42%,#3b82f6_42%_75%,#cbd5e1_75%_100%)]">
                  <div className="absolute left-1/2 top-1/2 h-[110px] w-[110px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
                </div>
              </div>

              <div className="flex flex-col justify-center gap-4">
                {[
                  { label: "High", color: "bg-red-500", value: 9 },
                  { label: "Medium", color: "bg-amber-400", value: 27 },
                  { label: "Low", color: "bg-blue-500", value: 16 },
                  { label: "Archived", color: "bg-slate-300", value: 7 },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`h-4 w-4 rounded-md ${item.color}`} />
                      <span className="text-[17px] text-slate-700">{item.label}</span>
                    </div>
                    <span className="text-[17px] font-medium text-slate-900">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-slate-200 pt-5">
              <div className="rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-medium text-slate-700">
                High
              </div>
              <div className="rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-medium text-slate-700">
                Medium
              </div>
              <div className="rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-medium text-slate-700">
                Low
              </div>
            </div>
          </DashboardCard>

          <div className="mt-6">
            <DashboardCard title="Risk Trend">
              <div className="flex h-[220px] items-end justify-between gap-4">
                <MiniBar height={95} label="Mar 12" />
                <MiniBar height={110} label="Mar 19" />
                <MiniBar height={125} label="Mar 26" />
                <MiniBar height={145} label="Apr 02" />
                <MiniBar height={165} label="Apr 09" />
                <MiniBar height={185} label="Apr 16" />
                <MiniBar height={205} label="Apr 23" />
              </div>

              <div className="mt-5 flex items-center gap-5 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-red-400" />
                  High
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-amber-400" />
                  Medium
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-blue-400" />
                  Low
                </div>
              </div>
            </DashboardCard>
          </div>
        </div>

        <div className="xl:col-span-4">
          <DashboardCard title="Risk Matrix">
            <div className="grid grid-cols-5 gap-2">
              {[
                "#cbd5e1",
                "#d6c8c8",
                "#f87171",
                "#ef4444",
                "#ef4444",
                "#d9f99d",
                "#fbbf24",
                "#fb923c",
                "#fb923c",
                "#ef4444",
                "#bae6fd",
                "#fde68a",
                "#f59e0b",
                "#fb923c",
                "#ef4444",
                "#93c5fd",
                "#cbd5e1",
                "#d9f99d",
                "#e7e5e4",
                "#d6c8c8",
                "#7dd3fc",
                "#93c5fd",
                "#cbd5e1",
                "#d6d3d1",
                "#d6c8c8",
              ].map((color, index) => (
                <div
                  key={index}
                  className="flex aspect-square items-center justify-center rounded-xl text-sm font-semibold text-white"
                  style={{ backgroundColor: color }}
                >
                  {index % 5 === 0 ? 1 : (index % 10) + 1}
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
              <span>Likelihood</span>
              <span>Impact</span>
            </div>
          </DashboardCard>

          <div className="mt-6">
            <DashboardCard title="Top Risks">
              <div className="space-y-5">
                {[
                  { rank: 1, title: "Delay turbine delivery", score: "9.1" },
                  { rank: 2, title: "Cable installation weather delay", score: "8.6" },
                  { rank: 3, title: "Environmental permit delay", score: "8.2" },
                ].map((risk) => (
                  <div
                    key={risk.rank}
                    className="border-b border-slate-100 pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg font-semibold text-orange-500">
                        {risk.rank}.
                      </span>
                      <div className="min-w-0">
                        <p className="text-[17px] font-medium text-slate-800">
                          {risk.title}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Score {risk.score}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </DashboardCard>
          </div>

          <div className="mt-6">
            <DashboardCard
              title="Stakeholders Activity"
              right={<MoreVertical className="h-5 w-5 text-slate-400" />}
            >
              <div className="space-y-5">
                {[
                  {
                    name: "Ruben",
                    text: "We identified a new potential hazard near turbine #3.",
                    time: "2 hours ago",
                  },
                  {
                    name: "Sophie",
                    text: "Started reviewing the updated safety protocols.",
                    time: "1 day ago",
                  },
                  {
                    name: "Laura",
                    text: "Conducted the environmental impact review.",
                    time: "2 days ago",
                  },
                  {
                    name: "Julian",
                    text: "Assigned new mitigation actions to the team.",
                    time: "3 days ago",
                  },
                ].map((activity) => (
                  <div key={activity.name} className="flex gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                      {activity.name.slice(0, 1)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-medium text-slate-800">{activity.name}</p>
                        <p className="shrink-0 text-sm text-slate-400">{activity.time}</p>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {activity.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </DashboardCard>
          </div>
        </div>
      </div>
    </section>
  );
}