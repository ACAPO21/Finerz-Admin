import { useEffect, useState } from "react";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { fetchSentryDetail, type SentryDetail } from "../api";
import { CardHeader } from "../components/CardHeader";
import { formatDate } from "../format";

const sentryProjectUrl = import.meta.env.VITE_SENTRY_PROJECT_URL as string | undefined;

export function SentryPage(props: { apiKey: string }) {
  const [detail, setDetail] = useState<SentryDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSentryDetail(props.apiKey)
      .then(setDetail)
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur inconnue"));
  }, [props.apiKey]);

  return (
    <>
      <h1>Sentry</h1>
      <p className="lede">Suivi des erreurs applicatives — aperçu, détail complet sur Sentry.</p>

      {error && <div className="error-banner">{error}</div>}

      <div className="card" style={{ marginBottom: "1rem" }}>
        <CardHeader icon={<AlertTriangle />} label="Issues non résolues" />
        <div className={"metric " + (detail?.unresolved_count ? "alert" : "")}>
          {detail?.unresolved_count ?? "—"}
        </div>
        <p className="metric-note">Comptées sur les dernières 24h</p>
      </div>

      {detail && detail.recent_issues.length > 0 && (
        <div className="card">
          <CardHeader icon={<AlertTriangle />} label="Aperçu des issues" />
          {detail.recent_issues.map((issue, index) => (
            <div key={`${issue.title}-${index}`} className="event-row" style={{ display: "block" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>{issue.title}</strong>
                <span>{issue.event_count} occurrence(s)</span>
              </div>
              <p className="metric-note" style={{ margin: "0.2rem 0 0" }}>
                {issue.culprit ?? "Origine inconnue"} · vue pour la dernière fois{" "}
                {formatDate(issue.last_seen)}
              </p>
            </div>
          ))}
          {sentryProjectUrl && (
            <a
              className="ext-link"
              href={sentryProjectUrl}
              target="_blank"
              rel="noreferrer"
              style={{ marginTop: "0.9rem" }}
            >
              Voir le détail complet sur Sentry <ExternalLink size={13} />
            </a>
          )}
        </div>
      )}

      {detail && detail.recent_issues.length === 0 && sentryProjectUrl && (
        <div className="card">
          <a className="ext-link" href={sentryProjectUrl} target="_blank" rel="noreferrer">
            Voir sur Sentry <ExternalLink size={13} />
          </a>
        </div>
      )}
    </>
  );
}
