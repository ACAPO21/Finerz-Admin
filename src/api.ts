const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api";

export type StuckCleanupJob = {
  user_id: string;
  attempts: number;
  last_error: string | null;
  next_retry_at: string;
};

export type AdminOverview = {
  generated_at: string;
  auth_events_last_24h: Record<string, number>;
  stuck_bridge_cleanup_jobs: number;
  stuck_bridge_cleanup_jobs_detail: StuckCleanupJob[];
};

export type ThresholdCheckResult = {
  checked_at: string;
  breached_rules: string[];
  alert_sent: boolean;
};

function authHeaders(apiKey: string): HeadersInit {
  return { Authorization: `Bearer ${apiKey}` };
}

export async function fetchOverview(apiKey: string): Promise<AdminOverview> {
  const response = await fetch(`${API_BASE_URL}/admin/overview`, {
    headers: authHeaders(apiKey),
  });
  if (!response.ok) {
    throw new Error(`Erreur ${response.status} en récupérant l'overview`);
  }
  return response.json();
}

export async function triggerThresholdCheck(
  apiKey: string
): Promise<ThresholdCheckResult> {
  const response = await fetch(`${API_BASE_URL}/admin/alerts/check-thresholds`, {
    method: "POST",
    headers: authHeaders(apiKey),
  });
  if (!response.ok) {
    throw new Error(`Erreur ${response.status} en vérifiant les seuils`);
  }
  return response.json();
}

export type WorkflowStatus = {
  status: string | null;
  conclusion: string | null;
  created_at: string | null;
  html_url: string | null;
};

export type DependabotPullRequest = {
  title: string;
  html_url: string;
  number: number;
  created_at: string;
};

export type IntegrationsSummary = {
  sentry_unresolved_issues: number | null;
  ci_daily_tests: WorkflowStatus;
  availability_check: WorkflowStatus;
  dependabot_open_prs: number | null;
  dependabot_prs: DependabotPullRequest[];
  railway_cpu_usage_percent: number | null;
  railway_memory_usage_gb: number | null;
  bridge_last_webhook_at: string | null;
  revenuecat_last_webhook_at: string | null;
};

export async function fetchIntegrationsSummary(
  apiKey: string
): Promise<IntegrationsSummary> {
  const response = await fetch(`${API_BASE_URL}/admin/integrations`, {
    headers: authHeaders(apiKey),
  });
  if (!response.ok) {
    throw new Error(`Erreur ${response.status} en récupérant les intégrations`);
  }
  return response.json();
}

export type ActivityEntry = {
  timestamp: string;
  kind: "auth" | "webhook";
  label: string;
};

export type RecentActivity = {
  entries: ActivityEntry[];
};

export async function fetchRecentActivity(apiKey: string): Promise<RecentActivity> {
  const response = await fetch(`${API_BASE_URL}/admin/activity/recent`, {
    headers: authHeaders(apiKey),
  });
  if (!response.ok) {
    throw new Error(`Erreur ${response.status} en récupérant l'activité récente`);
  }
  return response.json();
}

export type SentryIssuePreview = {
  title: string;
  culprit: string | null;
  level: string | null;
  short_id: string | null;
  event_count: string;
  first_seen: string;
  last_seen: string;
  permalink: string | null;
};

export type SentryDetail = {
  unresolved_count: number | null;
  issues: SentryIssuePreview[];
};

export async function fetchSentryDetail(apiKey: string): Promise<SentryDetail> {
  const response = await fetch(`${API_BASE_URL}/admin/sentry`, {
    headers: authHeaders(apiKey),
  });
  if (!response.ok) {
    throw new Error(`Erreur ${response.status} en récupérant le détail Sentry`);
  }
  return response.json();
}

export type MetricPoint = {
  timestamp: string;
  value: number;
};

export type RailwayMetricsHistory = {
  cpu_usage: MetricPoint[];
  memory_usage_gb: MetricPoint[];
  network_rx_gb: MetricPoint[];
  network_tx_gb: MetricPoint[];
};

export async function fetchRailwayMetricsHistory(
  apiKey: string
): Promise<RailwayMetricsHistory> {
  const response = await fetch(`${API_BASE_URL}/admin/railway/metrics-history`, {
    headers: authHeaders(apiKey),
  });
  if (!response.ok) {
    throw new Error(`Erreur ${response.status} en récupérant l'historique Railway`);
  }
  return response.json();
}

export type DeploymentLogLine = {
  message: string;
  severity: string | null;
  timestamp: string;
};

export type RailwayDeploymentLogs = {
  lines: DeploymentLogLine[];
};

export async function fetchRailwayDeploymentLogs(
  apiKey: string
): Promise<RailwayDeploymentLogs> {
  const response = await fetch(`${API_BASE_URL}/admin/railway/deployment-logs`, {
    headers: authHeaders(apiKey),
  });
  if (!response.ok) {
    throw new Error(`Erreur ${response.status} en récupérant les logs Railway`);
  }
  return response.json();
}
