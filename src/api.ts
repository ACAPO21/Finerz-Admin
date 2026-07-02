const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api";

export type AdminOverview = {
  generated_at: string;
  auth_events_last_24h: Record<string, number>;
  stuck_bridge_cleanup_jobs: number;
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
