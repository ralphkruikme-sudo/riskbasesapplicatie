import {
  Insight,
  ProjectActionLite,
  ProjectLite,
  ProjectNotificationLite,
  ProjectRiskLite,
  ProjectStakeholderLite,
  ProjectTimelineLite,
} from "./types";

function isOverdue(date?: string | null) {
  if (!date) return false;
  return new Date(date).getTime() < Date.now();
}

function daysUntil(date?: string | null) {
  if (!date) return null;
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
}

export function buildProjectInsights(input: {
  project: ProjectLite | null;
  risks: ProjectRiskLite[];
  actions: ProjectActionLite[];
  notifications: ProjectNotificationLite[];
  stakeholders: ProjectStakeholderLite[];
  timeline: ProjectTimelineLite[];
}): Insight[] {
  const { project, risks, actions, notifications, stakeholders, timeline } = input;
  const insights: Insight[] = [];

  const highRisks = risks.filter((r) => r.level === "high");
  const openRisks = risks.filter((r) => ["open", "monitoring"].includes((r.status ?? "").toLowerCase()));
  const overdueActions = actions.filter((a) => a.status !== "done" && isOverdue(a.due_date));
  const blockedActions = actions.filter((a) => a.status === "blocked");
  const criticalActions = actions.filter((a) => a.priority === "critical" || a.priority === "high");
  const upcomingReviews = risks.filter((r) => {
    const d = daysUntil(r.due_review_date);
    return d !== null && d >= 0 && d <= 14;
  });
  const delayedTimeline = timeline.filter((t) => (t.status ?? "").toLowerCase() === "delayed");
  const unreadNotifications = notifications.filter((n) => !n.is_read);

  if (highRisks.length > 0) {
    const top = highRisks[0];
    insights.push({
      id: "project-high-risks",
      severity: "critical",
      title: "High-risk exposure requires action",
      description: `${highRisks.length} high risk item${highRisks.length > 1 ? "s" : ""} detected${top?.title ? `, led by "${top.title}"` : ""}.`,
      href: `/app/projects/${project?.id}/risk-register`,
      ctaLabel: "Open risk register",
      stat: `${highRisks.length} high`,
    });
  }

  if (overdueActions.length > 0) {
    insights.push({
      id: "project-overdue-actions",
      severity: "warning",
      title: "Mitigation follow-up overdue",
      description: `${overdueActions.length} action${overdueActions.length > 1 ? "s are" : " is"} overdue and should be reassigned or completed.`,
      href: `/app/projects/${project?.id}/actions`,
      ctaLabel: "Open actions",
      stat: `${overdueActions.length} overdue`,
    });
  }

  if (upcomingReviews.length > 0) {
    insights.push({
      id: "project-upcoming-reviews",
      severity: "info",
      title: "Risk reviews due soon",
      description: `${upcomingReviews.length} review${upcomingReviews.length > 1 ? "s are" : " is"} scheduled within the next 14 days.`,
      href: `/app/projects/${project?.id}/risk-register`,
      ctaLabel: "Plan review",
      stat: `${upcomingReviews.length} due`,
    });
  }

  if (stakeholders.length === 0 && (openRisks.length > 0 || actions.length > 0)) {
    insights.push({
      id: "project-no-stakeholders",
      severity: "warning",
      title: "No stakeholders linked",
      description: "This project has active risk activity but no stakeholders assigned yet.",
      href: `/app/projects/${project?.id}/stakeholders`,
      ctaLabel: "Add stakeholders",
      stat: "0 linked",
    });
  }

  if (delayedTimeline.length > 0) {
    insights.push({
      id: "project-delayed-timeline",
      severity: "warning",
      title: "Timeline pressure detected",
      description: `${delayedTimeline.length} timeline item${delayedTimeline.length > 1 ? "s are" : " is"} marked as delayed.`,
      href: `/app/projects/${project?.id}/timeline`,
      ctaLabel: "Open timeline",
      stat: `${delayedTimeline.length} delayed`,
    });
  }

  if (blockedActions.length > 0 && criticalActions.length > 0) {
    insights.push({
      id: "project-blocked-critical-actions",
      severity: "critical",
      title: "Critical actions are blocked",
      description: `${blockedActions.length} blocked action${blockedActions.length > 1 ? "s" : ""} found, while priority remains high.`,
      href: `/app/projects/${project?.id}/actions`,
      ctaLabel: "Resolve blockers",
      stat: `${blockedActions.length} blocked`,
    });
  }

  if (!insights.length) {
    insights.push({
      id: "project-healthy",
      severity: "positive",
      title: "Project controls look stable",
      description:
        unreadNotifications.length > 0
          ? `No urgent control gaps detected. ${unreadNotifications.length} unread notification${unreadNotifications.length > 1 ? "s" : ""} are waiting for review.`
          : "No urgent control gaps detected based on current project data.",
      stat: "Stable",
    });
  }

  return insights.slice(0, 4);
}