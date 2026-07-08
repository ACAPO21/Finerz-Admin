import { useEffect, useState } from "react";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { fetchSentryDetail, type SentryDetail } from "../api";
import { CardHeader } from "../components/CardHeader";
import { formatDate } from "../format";

const sentryProjectUrl = import.meta.env.VITE_SENTRY_PROJECT_URL as string | undefined;

const LEVEL_LABELS: Record<string, string> = {
  fatal: "Fatal",
  error: "Erreur",
  warning: "Avertissement",
  info: "Info",
  debug: "Debug",
};

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
      <p className="lede">
        Suivi des erreurs applicatives — toutes les issues non résolues, avec un lien direct
        vers chacune sur Sentry pour le détail complet (stack trace, résolution).
      </p>

      {error && <div className="error-banner">{error}</div>}

      <div className="card" style={{ marginBottom: "1rem" }}>
        <CardHeader icon={<AlertTriangle />} label="Issues non résolues" />
        <div className={"metric " + (detail?.unresolved_count ? "alert" : "")}>
          {detail?.unresolved_count ?? "—"}
        </div>
        <p className="metric-note">Comptées sur les dernières 24h</p>
        {sentryProjectUrl && (
          <a
            className="ext-link"
            href={sentryProjectUrl}
            target="_blank"
            rel="noreferrer"
            style={{ marginTop: "0.6rem" }}
          >
            Voir toutes les issues sur Sentry <ExternalLink size={13} />
          </a>
        )}
      </div>

      {detail && detail.issues.length > 0 && (
        <div className="card">
          <CardHeader icon={<AlertTriangle />} label={`${detail.issues.length} issue(s)`} />
          {detail.issues.map((issue, index) => (
            <div
              key={`${issue.short_id ?? issue.title}-${index}`}
              className="event-row"
              style={{ display: "block", padding: "0.75rem 0" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                <strong>{issue.title}</strong>
                <span>{issue.event_count} occurrence(s)</span>
              </div>
              <p className="metric-note" style={{ margin: "0.25rem 0 0" }}>
                {issue.short_id && <>{issue.short_id} · </>}
                {issue.level && <>{LEVEL_LABELS[issue.level] ?? issue.level} · </>}
                {issue.culprit ?? "Origine inconnue"}
              </p>
              <p className="metric-note" style={{ margin: "0.15rem 0 0" }}>
                Première fois {formatDate(issue.first_seen)} · dernière fois{" "}
                {formatDate(issue.last_seen)}
              </p>
              {issue.permalink && (
                <a
                  className="ext-link"
                  href={issue.permalink}
                  target="_blank"
                  rel="noreferrer"
                  style={{ marginTop: "0.35rem" }}
                >
                  Ouvrir cette issue sur Sentry <ExternalLink size={12} />
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {detail && detail.issues.length === 0 && (
        <div className="card">
          <p className="empty-note">Aucune issue non résolue.</p>
        </div>
      )}
    </>
  );
}
