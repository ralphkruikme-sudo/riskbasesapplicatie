import {
  Insight,
  WorkspaceActionLite,
  WorkspaceProjectLite,
  WorkspaceRiskLite,
  WorkspaceStakeholderLite,
} from "./types";

function daysAgo(date?: string | null) {
  if (!date) return null;
  const diff = Date.now() - new Date(date).getTime();
  return Math.floor(diff / 86400000);
}

function isOverdue(date?: string | null) {
  if (!date) return false;
  return new Date(date).getTime() < Date.now();
}

export function buildWorkspaceInsights(input: {
  projects: WorkspaceProjectLite[];
  risksByProject: Record<string, WorkspaceRiskLite[]>;
  actionsByProject: Record<string, WorkspaceActionLite[]>;
  stakeholdersByProject?: Record<string, WorkspaceStakeholderLite[]>;
}): Insight[] {
  const { projects, risksByProject, actionsByProject, stakeholdersByProject = {} } = input;

  const insights: Insight[] = [];

  if (!projects.length) {
    return [
      {
        id: "empty-workspace",
        severity: "info",
        title: "No projects yet",
        description: "Create your first project to start tracking risks, actions and reviews.",
        ctaLabel: "Create project",
      },
    ];
  }

  const projectFacts = projects.map((project) => {
    const risks = risksByProject[project.id] ?? [];
    const actions = actionsByProject[project.id] ?? [];
    const stakeholders = stakeholdersByProject[project.id] ?? [];

    const highRisks = risks.filter((r) => (r.level ?? "").toLowerCase() === "high").length;
    const openRisks = risks.filter((r) => {
      const s = (r.status ?? "open").toLowerCase();
      return s !== "closed" && s !== "archived" && s !== "mitigated";
    }).length;

    const overdueActions = actions.filter((a) => {
      const s = (a.status ?? "").toLowerCase();
      return s !== "done" && isOverdue(a.due_date);
    }).length;

    const openActions = actions.filter((a) => {
      const s = (a.status ?? "").toLowerCase();
      return s === "open" || s === "in_progress" || s === "blocked" || s === "overdue";
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
      openActions,
      stakeholdersCount: stakeholders.length,
      upcomingReviews,
      staleDays,
    };
  });

  const byHighRisks = [...projectFacts].sort((a, b) => b.highRisks - a.highRisks);
  const byOverdueActions = [...projectFacts].sort((a, b) => b.overdueActions - a.overdueActions);
  const byStale = [...projectFacts]
    .filter((x) => x.staleDays !== null)
    .sort((a, b) => (b.staleDays ?? 0) - (a.staleDays ?? 0));

  const worstRiskProject = byHighRisks[0];
  if (worstRiskProject && worstRiskProject.highRisks > 0) {
    insights.push({
      id: `critical-high-risks-${worstRiskProject.project.id}`,
      severity: "critical",
      title: "Critical risk exposure",
      description: `${worstRiskProject.project.name} has ${worstRiskProject.highRisks} high risk item${worstRiskProject.highRisks > 1 ? "s" : ""} that need review.`,
      href: `/app/projects/${worstRiskProject.project.id}`,
      ctaLabel: "Open project",
      stat: `${worstRiskProject.highRisks} high`,
    });
  }

  const worstActionProject = byOverdueActions[0];
  if (worstActionProject && worstActionProject.overdueActions > 0) {
    insights.push({
      id: `warning-overdue-actions-${worstActionProject.project.id}`,
      severity: "warning",
      title: "Overdue actions detected",
      description: `${worstActionProject.project.name} has ${worstActionProject.overdueActions} overdue action${worstActionProject.overdueActions > 1 ? "s" : ""} that may affect control.`,
      href: `/app/projects/${worstActionProject.project.id}`,
      ctaLabel: "Review actions",
      stat: `${worstActionProject.overdueActions} overdue`,
    });
  }

  const staleProject = byStale[0];
  if (staleProject && (staleProject.staleDays ?? 0) >= 14) {
    insights.push({
      id: `warning-stale-project-${staleProject.project.id}`,
      severity: "warning",
      title: "Project needs update",
      description: `${staleProject.project.name} has not been updated for ${staleProject.staleDays} days.`,
      href: `/app/projects/${staleProject.project.id}`,
      ctaLabel: "Open project",
      stat: `${staleProject.staleDays}d stale`,
    });
  }

  const noStakeholders = projectFacts.find((x) => x.stakeholdersCount === 0 && (x.openRisks > 0 || x.openActions > 0));
  if (noStakeholders) {
    insights.push({
      id: `info-no-stakeholders-${noStakeholders.project.id}`,
      severity: "info",
      title: "Stakeholder coverage missing",
      description: `${noStakeholders.project.name} has active risks or actions but no linked stakeholders yet.`,
      href: `/app/projects/${noStakeholders.project.id}`,
      ctaLabel: "Add stakeholders",
      stat: "0 linked",
    });
  }

  const withUpcomingReviews = projectFacts.find((x) => x.upcomingReviews > 0);
  if (withUpcomingReviews) {
    insights.push({
      id: `info-upcoming-review-${withUpcomingReviews.project.id}`,
      severity: "info",
      title: "Upcoming review window",
      description: `${withUpcomingReviews.project.name} has ${withUpcomingReviews.upcomingReviews} risk review${withUpcomingReviews.upcomingReviews > 1 ? "s" : ""} due in the next 14 days.`,
      href: `/app/projects/${withUpcomingReviews.project.id}`,
      ctaLabel: "Plan review",
      stat: `${withUpcomingReviews.upcomingReviews} due`,
    });
  }

  if (!insights.length) {
    const totalOpenRisks = projectFacts.reduce((sum, x) => sum + x.openRisks, 0);
    const totalOverdue = projectFacts.reduce((sum, x) => sum + x.overdueActions, 0);

    insights.push({
      id: "positive-workspace-healthy",
      severity: "positive",
      title: "Workspace looks healthy",
      description:
        totalOpenRisks > 0
          ? `Projects are active and no urgent gaps were detected. ${totalOpenRisks} open risks are currently being tracked.`
          : "No urgent gaps detected. Add more project data to unlock deeper recommendations.",
      stat: totalOverdue > 0 ? `${totalOverdue} overdue` : "Stable",
    });
  }

  return insights.slice(0, 4);
}