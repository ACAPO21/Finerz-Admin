import { useEffect, useState } from "react";
import { AlertTriangle, Radio, RefreshCw, ShieldCheck, Wrench } from "lucide-react";
import {
  fetchOverview,
  fetchRecentActivity,
  triggerThresholdCheck,
  type ActivityEntry,
  type AdminOverview,
  type ThresholdCheckResult,
} from "../api";
import { CardHeader } from "../components/CardHeader";

const ACTIVITY_POLL_INTERVAL_MS = 10_000;

function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString("fr-FR");
}

export function OverviewPage(props: { apiKey: string }) {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [checkResult, setCheckResult] = useState<ThresholdCheckResult | null>(null);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOverview(props.apiKey);
      setOverview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [props.apiKey]);

  useEffect(() => {
    let cancelled = false;
    const loadActivity = async () => {
      try {
        const data = await fetchRecentActivity(props.apiKey);
        if (!cancelled) setActivity(data.entries);
      } catch {
        // une source secondaire qui echoue ne doit pas casser le reste de la page
      }
    };
    loadActivity();
    const interval = setInterval(loadActivity, ACTIVITY_POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [props.apiKey]);

  const handleCheckNow = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await triggerThresholdCheck(props.apiKey);
      setCheckResult(result);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const eventEntries = overview ? Object.entries(overview.auth_events_last_24h) : [];

  return (
    <>
      <h1>Vue d'ensemble</h1>
      <p className="lede">Indicateurs métier et disponibilité, mis à jour en direct.</p>

      {error && (
        <div className="error-banner">
          <AlertTriangle size={14} style={{ verticalAlign: "-2px", marginRight: "0.4rem" }} />
          {error}
        </div>
      )}

      <div className="card" style={{ marginBottom: "1rem" }}>
        <CardHeader icon={<Wrench />} label="Jobs de nettoyage Bridge bloqués" />
        <div
          className={
            "metric " + (overview && overview.stuck_bridge_cleanup_jobs > 0 ? "alert" : "")
          }
        >
          {overview ? overview.stuck_bridge_cleanup_jobs : "…"}
        </div>
        <p className="metric-note">Tentatives ≥ 3, jamais résolues automatiquement</p>
        {overview && overview.stuck_bridge_cleanup_jobs_detail.length > 0 && (
          <ul className="breach-list">
            {overview.stuck_bridge_cleanup_jobs_detail.map((job) => (
              <li key={job.user_id}>
                Utilisateur {job.user_id} — {job.attempts} tentative(s), prochain essai{" "}
                {new Date(job.next_retry_at).toLocaleString("fr-FR")}
                {job.last_error && <> — « {job.last_error} »</>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <CardHeader icon={<ShieldCheck />} label="Événements d'authentification (24h)" />
        {!overview ? (
          <p className="empty-note">Chargement…</p>
        ) : eventEntries.length === 0 ? (
          <p className="empty-note">Aucun événement sur les dernières 24h.</p>
        ) : (
          eventEntries.map(([type, count]) => (
            <div key={type} className="event-row">
              <span>{type}</span>
              <strong>{count}</strong>
            </div>
          ))
        )}
      </div>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <div className="card-header" style={{ justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Radio size={15} />
            <h2>Activité récente</h2>
          </div>
          <span className="terminal-live-dot">En direct</span>
        </div>
        {activity.length === 0 ? (
          <p className="empty-note">Aucune activité pour le moment.</p>
        ) : (
          activity.map((entry, index) => (
            <div key={`${entry.timestamp}-${index}`} className="event-row">
              <span>
                {entry.kind === "auth" ? "Authentification" : "Webhook"} · {entry.label}
              </span>
              <strong>{formatTime(entry.timestamp)}</strong>
            </div>
          ))
        )}
      </div>

      <div className="card check-card">
        <CardHeader icon={<RefreshCw />} label="Vérification des seuils métier" />
        <div className="check-actions">
          <button onClick={handleCheckNow} disabled={loading}>
            <RefreshCw size={14} />
            Vérifier maintenant
          </button>
          {checkResult && <span className="checked-at">Vérifié à {checkResult.checked_at}</span>}
        </div>

        {checkResult && (
          <>
            {checkResult.breached_rules.length === 0 ? (
              <span className="badge ok">
                <ShieldCheck size={13} /> Aucun seuil dépassé
              </span>
            ) : (
              <>
                <span className="badge alert">
                  <AlertTriangle size={13} /> {checkResult.breached_rules.length} seuil(s) dépassé(s)
                </span>
                <ul className="breach-list">
                  {checkResult.breached_rules.map((rule) => (
                    <li key={rule}>{rule}</li>
                  ))}
                </ul>
              </>
            )}
            <p className="metric-note" style={{ marginTop: "0.6rem" }}>
              Alerte email envoyée : {checkResult.alert_sent ? "oui" : "non"}
            </p>
          </>
        )}
      </div>
    </>
  );
}
