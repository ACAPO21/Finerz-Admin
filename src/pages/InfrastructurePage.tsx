import { useEffect, useState } from "react";
import { ExternalLink, Server, ShieldCheck } from "lucide-react";
import {
  fetchIntegrationsSummary,
  fetchRailwayMetricsHistory,
  type IntegrationsSummary,
  type RailwayMetricsHistory,
} from "../api";
import { CardHeader } from "../components/CardHeader";
import { DeploymentLogsViewer } from "../components/DeploymentLogsViewer";
import { MetricChart } from "../components/MetricChart";
import { formatDate } from "../format";

const railwayProjectUrl = import.meta.env.VITE_RAILWAY_PROJECT_URL as string | undefined;

export function InfrastructurePage(props: { apiKey: string }) {
  const [integrations, setIntegrations] = useState<IntegrationsSummary | null>(null);
  const [history, setHistory] = useState<RailwayMetricsHistory | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchIntegrationsSummary(props.apiKey, "dev")
      .then(setIntegrations)
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur inconnue"));
    fetchRailwayMetricsHistory(props.apiKey)
      .then(setHistory)
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

      <div className="metrics-grid" style={{ marginBottom: "1rem" }}>
        <div className="card">
          <CardHeader icon={<Server />} label="CPU (24h)" />
          <MetricChart data={history?.cpu_usage ?? []} color="#7c3aed" unitSuffix=" vCPU" height={280} />
        </div>
        <div className="card">
          <CardHeader icon={<Server />} label="Mémoire (24h)" />
          <MetricChart data={history?.memory_usage_gb ?? []} color="#2563eb" unitSuffix=" Go" height={280} />
        </div>
        <div className="card">
          <CardHeader icon={<Server />} label="Réseau entrant (24h)" />
          <MetricChart data={history?.network_rx_gb ?? []} color="#0d9488" unitSuffix=" Go" height={280} />
        </div>
        <div className="card">
          <CardHeader icon={<Server />} label="Réseau sortant (24h)" />
          <MetricChart data={history?.network_tx_gb ?? []} color="#b45309" unitSuffix=" Go" height={280} />
        </div>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <DeploymentLogsViewer apiKey={props.apiKey} />
      </div>

      <div className="grid" style={{ marginBottom: "1rem" }}>
        <div className="card">
          <CardHeader icon={<ShieldCheck />} label="Dernier webhook Bridge" />
          <p className="metric-note">{formatDate(integrations?.bridge_last_webhook_at)}</p>
        </div>

        <div className="card">
          <CardHeader icon={<ShieldCheck />} label="Dernier webhook RevenueCat" />
          <p className="metric-note">{formatDate(integrations?.revenuecat_last_webhook_at)}</p>
        </div>
      </div>

      {railwayProjectUrl && (
        <div className="card">
          <CardHeader icon={<Server />} label="Requests, temps de réponse, taux d'erreur" />
          <p className="metric-note">
            Calculés par Railway à partir de ses logs HTTP bruts — on ne les reconstruit pas ici
            pour éviter de dupliquer leur outil d'APM.
          </p>
          <a
            className="ext-link"
            href={railwayProjectUrl}
            target="_blank"
            rel="noreferrer"
            style={{ marginTop: "0.5rem" }}
          >
            Voir l'onglet Metrics sur Railway <ExternalLink size={13} />
          </a>
        </div>
      )}
    </>
  );
}
