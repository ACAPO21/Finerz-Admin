import { useEffect, useState } from "react";
import {
  fetchOverview,
  triggerThresholdCheck,
  type AdminOverview,
  type ThresholdCheckResult,
} from "./api";

const STORAGE_KEY = "finerz-admin-api-key";

function useStoredApiKey(): [string, (key: string) => void] {
  const [apiKey, setApiKeyState] = useState(
    () => localStorage.getItem(STORAGE_KEY) ?? ""
  );
  const setApiKey = (key: string) => {
    localStorage.setItem(STORAGE_KEY, key);
    setApiKeyState(key);
  };
  return [apiKey, setApiKey];
}

function LoginForm(props: { onSubmit: (key: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <div className="card" style={{ maxWidth: 420 }}>
      <h2>Clé API admin</h2>
      <input
        type="password"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Colle ta clé API admin"
        style={{ width: "100%", padding: "0.5rem", marginBottom: "0.75rem" }}
      />
      <button onClick={() => props.onSubmit(value)}>Se connecter</button>
    </div>
  );
}

const sentryProjectUrl = import.meta.env.VITE_SENTRY_PROJECT_URL as string | undefined;

function Dashboard(props: { apiKey: string }) {
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

  return (
    <div style={{ maxWidth: 720 }}>
      <h1>Supervision Finerz</h1>
      {error && (
        <div className="card" style={{ borderLeft: "4px solid #dc2626" }}>
          {error}
        </div>
      )}

      {sentryProjectUrl && (
        <div className="card">
          <h2>Erreurs applicatives</h2>
          <a href={sentryProjectUrl} target="_blank" rel="noreferrer">
            Voir les erreurs sur Sentry →
          </a>
        </div>
      )}

      <div className="card">
        <h2>Jobs de nettoyage Bridge bloqués</h2>
        <div
          className={
            "metric " + (overview && overview.stuck_bridge_cleanup_jobs > 0 ? "alert" : "")
          }
        >
          {overview ? overview.stuck_bridge_cleanup_jobs : "…"}
        </div>
      </div>

      <div className="card">
        <h2>Événements d'authentification (24h)</h2>
        {overview && Object.keys(overview.auth_events_last_24h).length === 0 && (
          <p>Aucun événement sur les dernières 24h.</p>
        )}
        {overview &&
          Object.entries(overview.auth_events_last_24h).map(([type, count]) => (
            <div key={type} style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{type}</span>
              <strong>{count}</strong>
            </div>
          ))}
      </div>

      <div className="card">
        <h2>Vérification des seuils</h2>
        <button onClick={handleCheckNow} disabled={loading}>
          Vérifier maintenant
        </button>
        {checkResult && (
          <div style={{ marginTop: "1rem" }}>
            <p>Vérifié à {checkResult.checked_at}</p>
            {checkResult.breached_rules.length === 0 ? (
              <p>Aucun seuil dépassé.</p>
            ) : (
              <ul>
                {checkResult.breached_rules.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            )}
            <p>Alerte email envoyée : {checkResult.alert_sent ? "oui" : "non"}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [apiKey, setApiKey] = useStoredApiKey();

  if (!apiKey) {
    return <LoginForm onSubmit={setApiKey} />;
  }

  return <Dashboard apiKey={apiKey} />;
}
