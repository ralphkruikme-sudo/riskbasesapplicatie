"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Bell,
  CheckCheck,
  Clock3,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Target,
} from "lucide-react";
import { useParams } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type NotificationType =
  | "action_assigned"
  | "action_due_soon"
  | "action_overdue"
  | "action_completed"
  | "risk_created"
  | "risk_high"
  | "risk_updated"
  | "general";

type AppNotification = {
  id: string;
  project_id: string;
  risk_id: string | null;
  action_id: string | null;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getTypeIcon(type: NotificationType) {
  switch (type) {
    case "action_assigned":
    case "action_due_soon":
    case "action_overdue":
    case "action_completed":
      return <Target className="h-5 w-5" />;
    case "risk_created":
    case "risk_high":
    case "risk_updated":
      return <ShieldAlert className="h-5 w-5" />;
    default:
      return <Bell className="h-5 w-5" />;
  }
}

function getTypeClasses(type: NotificationType) {
  switch (type) {
    case "action_assigned":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "action_due_soon":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "action_overdue":
      return "bg-red-50 text-red-700 border-red-200";
    case "action_completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "risk_high":
      return "bg-red-50 text-red-700 border-red-200";
    case "risk_created":
    case "risk_updated":
      return "bg-violet-50 text-violet-700 border-violet-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

function formatTypeLabel(type: NotificationType) {
  switch (type) {
    case "action_assigned":
      return "Action Assigned";
    case "action_due_soon":
      return "Due Soon";
    case "action_overdue":
      return "Overdue";
    case "action_completed":
      return "Completed";
    case "risk_created":
      return "Risk Created";
    case "risk_high":
      return "High Risk";
    case "risk_updated":
      return "Risk Updated";
    case "general":
      return "General";
    default:
      return type;
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

export default function NotificationsPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadNotifications() {
    setLoading(true);
    setErrorMessage(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErrorMessage("You are not logged in.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setNotifications((data || []) as AppNotification[]);
    setLoading(false);
  }

  useEffect(() => {
    if (projectId) {
      loadNotifications();
    }
  }, [projectId]);

  async function markAsRead(id: string) {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, is_read: true } : item))
    );
  }

  async function markAllAsRead() {
    const unreadIds = notifications.filter((item) => !item.is_read).map((item) => item.id);
    if (unreadIds.length === 0) return;

    setMarkingAll(true);

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .in("id", unreadIds);

    if (error) {
      setErrorMessage(error.message);
      setMarkingAll(false);
      return;
    }

    setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
    setMarkingAll(false);
  }

  const stats = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter((item) => !item.is_read).length;
    const read = notifications.filter((item) => item.is_read).length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCount = notifications.filter((item) => {
      const created = new Date(item.created_at);
      created.setHours(0, 0, 0, 0);
      return created.getTime() === today.getTime();
    }).length;

    return { total, unread, read, todayCount };
  }, [notifications]);

  return (
    <section className="p-8">
      <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
            <Bell className="h-3.5 w-3.5" />
            Notifications
          </div>

          <h1 className="mt-4 text-[38px] font-semibold tracking-tight text-slate-900">
            Project Notifications
          </h1>
          <p className="mt-2 max-w-3xl text-[17px] text-slate-500">
            Track assignments, due reminders and project alerts for this workspace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={loadNotifications}
            className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>

          <button
            onClick={markAllAsRead}
            disabled={markingAll || stats.unread === 0}
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#182B63] px-5 text-sm font-medium text-white shadow-sm transition hover:opacity-95 disabled:opacity-60"
          >
            {markingAll ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Marking...
              </>
            ) : (
              <>
                <CheckCheck className="h-4 w-4" />
                Mark all as read
              </>
            )}
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
          title="Total"
          value={String(stats.total)}
          sublabel="All project notifications"
          icon={<Bell className="h-5 w-5" />}
        />
        <MetricCard
          title="Unread"
          value={String(stats.unread)}
          sublabel="Still need attention"
          icon={<Clock3 className="h-5 w-5" />}
        />
        <MetricCard
          title="Read"
          value={String(stats.read)}
          sublabel="Already reviewed"
          icon={<CheckCheck className="h-5 w-5" />}
        />
        <MetricCard
          title="Today"
          value={String(stats.todayCount)}
          sublabel="Created today"
          icon={<RefreshCw className="h-5 w-5" />}
        />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-slate-900">Notification Feed</h3>
          <p className="mt-1 text-sm text-slate-500">
            Latest assignments and risk updates for this project.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 px-6 py-16 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <Bell className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              No notifications yet
            </h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
              As soon as actions are assigned or reminders are triggered, they will
              appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((item) => (
              <div
                key={item.id}
                className={`rounded-2xl border p-4 transition ${
                  item.is_read
                    ? "border-slate-200 bg-white"
                    : "border-blue-200 bg-blue-50/50"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 gap-3">
                    <div
                      className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${getTypeClasses(
                        item.type
                      )}`}
                    >
                      {getTypeIcon(item.type)}
                    </div>

                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getTypeClasses(
                            item.type
                          )}`}
                        >
                          {formatTypeLabel(item.type)}
                        </span>

                        {!item.is_read ? (
                          <span className="rounded-full bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white">
                            Unread
                          </span>
                        ) : null}
                      </div>

                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {item.message}
                      </p>
                      <p className="mt-3 text-xs text-slate-400">
                        {formatDateTime(item.created_at)}
                      </p>
                    </div>
                  </div>

                  {!item.is_read ? (
                    <button
                      onClick={() => markAsRead(item.id)}
                      className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Mark read
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}