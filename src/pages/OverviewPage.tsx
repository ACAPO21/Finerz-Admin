import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw, ShieldCheck, Wrench } from "lucide-react";
import {
  fetchOverview,
  triggerThresholdCheck,
  type AdminOverview,
  type ThresholdCheckResult,
} from "../api";
import { CardHeader } from "../components/CardHeader";

export function OverviewPage(props: { apiKey: string }) {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [checkResult, setCheckResult] = useState<ThresholdCheckResult | null>(null);
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
