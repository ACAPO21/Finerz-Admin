import { useEffect, useState } from "react";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { fetchIntegrationsSummary, type IntegrationsSummary } from "../api";
import { CardHeader } from "../components/CardHeader";

const sentryProjectUrl = import.meta.env.VITE_SENTRY_PROJECT_URL as string | undefined;

export function SentryPage(props: { apiKey: string }) {
  const [integrations, setIntegrations] = useState<IntegrationsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchIntegrationsSummary(props.apiKey)
      .then(setIntegrations)
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur inconnue"));
  }, [props.apiKey]);

  return (
    <>
      <h1>Sentry</h1>
      <p className="lede">Suivi des erreurs applicatives — résumé, détail complet sur Sentry.</p>

      {error && <div className="error-banner">{error}</div>}

      <div className="card">
        <CardHeader icon={<AlertTriangle />} label="Issues non résolues" />
        <div className={"metric " + (integrations?.sentry_unresolved_issues ? "alert" : "")}>
          {integrations?.sentry_unresolved_issues ?? "—"}
        </div>
        <p className="metric-note">Comptées sur les dernières 24h</p>
        {sentryProjectUrl && (
          <a
            className="ext-link"
            href={sentryProjectUrl}
            target="_blank"
            rel="noreferrer"
            style={{ marginTop: "0.75rem" }}
          >
            Voir le détail sur Sentry <ExternalLink size={13} />
          </a>
        )}
      </div>
    </>
  );
}
