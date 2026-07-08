import { useEffect, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  ExternalLink,
  KeyRound,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import {
  fetchIntegrationsSummary,
  fetchOverview,
  triggerThresholdCheck,
  type AdminOverview,
  type IntegrationsSummary,
  type ThresholdCheckResult,
} from "./api";
import finerzLogo from "./assets/finerz_logo.png";

const STORAGE_KEY = "finerz-admin-api-key";
const sentryProjectUrl = import.meta.env.VITE_SENTRY_PROJECT_URL as string | undefined;

function useStoredApiKey(): [string, (key: string) => void, () => void] {
  const [apiKey, setApiKeyState] = useState(
    () => localStorage.getItem(STORAGE_KEY) ?? ""
  );
  const setApiKey = (key: string) => {
    localStorage.setItem(STORAGE_KEY, key);
    setApiKeyState(key);
  };
  const clearApiKey = () => {
    localStorage.removeItem(STORAGE_KEY);
    setApiKeyState("");
  };
  return [apiKey, setApiKey, clearApiKey];
}

function OrbField() {
  return (
    <div className="orb-field">
      <div className="orb orb-a" />
      <div className="orb orb-b" />
    </div>
  );
}

function LoginScreen(props: { onSubmit: (key: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <div className="login-screen">
      <OrbField />
      <div className="login-card">
        <img src={finerzLogo} alt="Finerz" />
        <div className="brand">Finerz</div>
        <p className="lede">Supervision — accès réservé</p>
        <input
          type="password"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && props.onSubmit(value)}
          placeholder="Clé API admin"
          autoFocus
        />
        <button onClick={() => props.onSubmit(value)}>
          <KeyRound size={15} />
          Se connecter
        </button>
      </div>
    </div>
  );
}

function CardHeader(props: { icon: ReactNode; label: string }) {
  return (
    <div className="card-header">
      {props.icon}
      <h2>{props.label}</h2>
    </div>
  );
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "Aucune donnée";
  return new Date(value).toLocaleString("fr-FR");
}

function Dashboard(props: { apiKey: string; onSignOut: () => void }) {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [integrations, setIntegrations] = useState<IntegrationsSummary | null>(null);
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

    try {
      const data = await fetchIntegrationsSummary(props.apiKey);
      setIntegrations(data);
    } catch {
      // Une source qui echoue ne doit pas casser le reste du dashboard.
      setIntegrations(null);
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
    <div className="shell">
      <OrbField />
      <header className="topbar">
        <div className="brand">
          <img src={finerzLogo} alt="Finerz" />
          <div className="brand-text">
            <strong>Finerz</strong>
            <span>Supervision</span>
          </div>
        </div>
        <button className="signout" onClick={props.onSignOut}>
          <LogOut size={14} />
          Déconnexion
        </button>
      </header>

      <main className="content">
        <h1>Vue d'ensemble</h1>
        <p className="lede">Indicateurs métier et disponibilité, mis à jour en direct.</p>

        {error && (
          <div className="error-banner">
            <AlertTriangle size={14} style={{ verticalAlign: "-2px", marginRight: "0.4rem" }} />
            {error}
          </div>
        )}

        <div className="grid">
          <div className="card">
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

          <div className="card">
            <CardHeader icon={<AlertTriangle />} label="Erreurs applicatives" />
            <div
              className={"metric " + (integrations?.sentry_unresolved_issues ? "alert" : "")}
            >
              {integrations?.sentry_unresolved_issues ?? "—"}
            </div>
            {sentryProjectUrl && (
              <a className="ext-link" href={sentryProjectUrl} target="_blank" rel="noreferrer">
                Voir sur Sentry <ExternalLink size={13} />
              </a>
            )}
          </div>

          <div className="card">
            <CardHeader icon={<RefreshCw />} label="CI (tests quotidiens)" />
            <div className="metric" style={{ fontSize: "1.2rem" }}>
              {integrations?.ci_daily_tests.conclusion ?? "—"}
            </div>
            <p className="metric-note">{formatDate(integrations?.ci_daily_tests.created_at)}</p>
          </div>

          <div className="card">
            <CardHeader icon={<ShieldCheck />} label="Disponibilité (ping /health)" />
            <div className="metric" style={{ fontSize: "1.2rem" }}>
              {integrations?.availability_check.conclusion ?? "—"}
            </div>
            <p className="metric-note">
              {formatDate(integrations?.availability_check.created_at)}
            </p>
          </div>

          <div className="card">
            <CardHeader icon={<Wrench />} label="Dépendances (Dependabot)" />
            <div className="metric">{integrations?.dependabot_open_prs ?? "—"}</div>
            <p className="metric-note">PR ouvertes en attente de revue</p>
          </div>

          <div className="card">
            <CardHeader icon={<Wrench />} label="Railway (CPU / mémoire)" />
            <div className="metric" style={{ fontSize: "1.4rem" }}>
              {integrations?.railway_cpu_usage_percent?.toFixed(1) ?? "—"}% ·{" "}
              {integrations?.railway_memory_usage_gb?.toFixed(2) ?? "—"} Go
            </div>
          </div>

          <div className="card">
            <CardHeader icon={<ShieldCheck />} label="Dernier webhook Bridge" />
            <p className="metric-note">{formatDate(integrations?.bridge_last_webhook_at)}</p>
          </div>

          <div className="card">
            <CardHeader icon={<ShieldCheck />} label="Dernier webhook RevenueCat" />
            <p className="metric-note">{formatDate(integrations?.revenuecat_last_webhook_at)}</p>
          </div>
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
      </main>
    </div>
  );
}

export default function App() {
  const [apiKey, setApiKey, clearApiKey] = useStoredApiKey();

  if (!apiKey) {
    return <LoginScreen onSubmit={setApiKey} />;
  }

  return <Dashboard apiKey={apiKey} onSignOut={clearApiKey} />;
}
