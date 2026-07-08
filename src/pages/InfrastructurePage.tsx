import { useEffect, useState } from "react";
import { Server, ShieldCheck } from "lucide-react";
import { fetchIntegrationsSummary, type IntegrationsSummary } from "../api";
import { CardHeader } from "../components/CardHeader";
import { formatDate } from "../format";

export function InfrastructurePage(props: { apiKey: string }) {
  const [integrations, setIntegrations] = useState<IntegrationsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchIntegrationsSummary(props.apiKey)
      .then(setIntegrations)
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur inconnue"));
  }, [props.apiKey]);

  return (
    <>
      <h1>Infrastructure</h1>
      <p className="lede">Consommation de ressources et derniers webhooks reçus des fournisseurs.</p>

      {error && <div className="error-banner">{error}</div>}

      <div className="card" style={{ marginBottom: "1rem" }}>
        <CardHeader icon={<Server />} label="Railway — CPU / mémoire" />
        <div className="metric" style={{ fontSize: "1.6rem" }}>
          {integrations?.railway_cpu_usage_percent?.toFixed(1) ?? "—"}% ·{" "}
          {integrations?.railway_memory_usage_gb?.toFixed(2) ?? "—"} Go
        </div>
        <p className="metric-note">Dernier point de mesure (fenêtre de 30 min)</p>
      </div>

      <div className="grid">
        <div className="card">
          <CardHeader icon={<ShieldCheck />} label="Dernier webhook Bridge" />
          <p className="metric-note">{formatDate(integrations?.bridge_last_webhook_at)}</p>
        </div>

        <div className="card">
          <CardHeader icon={<ShieldCheck />} label="Dernier webhook RevenueCat" />
          <p className="metric-note">{formatDate(integrations?.revenuecat_last_webhook_at)}</p>
        </div>
      </div>
    </>
  );
}
