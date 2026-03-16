export type InsightSeverity = "critical" | "warning" | "info" | "positive";

export type Insight = {
  id: string;
  severity: InsightSeverity;
  title: string;
  description: string;
  href?: string;
  ctaLabel?: string;
  stat?: string;
};

export type WorkspaceProjectLite = {
  id: string;
  name: string;
  status: string | null;
  updated_at: string | null;
  open_risks_count?: number | null;
};

export type WorkspaceRiskLite = {
  id: string;
  project_id: string;
  score: number | null;
  level: string | null;
  status?: string | null;
  due_review_date?: string | null;
  owner_id?: string | null;
};

export type WorkspaceActionLite = {
  id: string;
  project_id: string;
  title?: string | null;
  status: string | null;
  priority?: string | null;
  due_date?: string | null;
};

export type WorkspaceStakeholderLite = {
  id: string;
  project_id: string;
  name?: string | null;
};

export type ProjectLite = {
  id: string;
  name: string;
  status: string | null;
  description?: string | null;
  project_value?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  client_name?: string | null;
};

export type ProjectRiskLite = {
  id: string;
  risk_code?: string | null;
  title: string;
  category?: string | null;
  probability: number;
  impact: number;
  score: number;
  level: "low" | "medium" | "high" | string;
  status: "open" | "monitoring" | "mitigated" | "closed" | "archived" | string;
  phase?: string | null;
  due_review_date?: string | null;
  owner_id?: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectActionLite = {
  id: string;
  title: string;
  status: "open" | "in_progress" | "blocked" | "done" | "overdue" | string;
  priority: "low" | "medium" | "high" | "critical" | string;
  due_date?: string | null;
  created_at: string;
};

export type ProjectNotificationLite = {
  id: string;
  title: string;
  body?: string | null;
  is_read: boolean;
  created_at: string;
};

export type ProjectStakeholderLite = {
  id: string;
  name: string;
};

export type ProjectTimelineLite = {
  id: string;
  title: string;
  type: string;
  status: string;
  start_date: string;
  end_date?: string | null;
};