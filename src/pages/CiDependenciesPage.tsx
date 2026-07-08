import { useEffect, useState } from "react";
import { GitBranch, RefreshCw, ShieldCheck, Wrench } from "lucide-react";
import { fetchIntegrationsSummary, type IntegrationsSummary } from "../api";
import { CardHeader } from "../components/CardHeader";
import { formatDate } from "../format";

export function CiDependenciesPage(props: { apiKey: string }) {
  const [integrations, setIntegrations] = useState<IntegrationsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchIntegrationsSummary(props.apiKey)
      .then(setIntegrations)
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur inconnue"));
  }, [props.apiKey]);

  return (
    <>
      <h1>CI/CD &amp; Dépendances</h1>
      <p className="lede">Statut des workflows GitHub Actions et des mises à jour en attente.</p>

      {error && <div className="error-banner">{error}</div>}

      <div className="grid">
        <div className="card">
          <CardHeader icon={<RefreshCw />} label="CI (tests quotidiens)" />
          <div className="metric" style={{ fontSize: "1.4rem" }}>
            {integrations?.ci_daily_tests.conclusion ?? "—"}
          </div>
          <p className="metric-note">{formatDate(integrations?.ci_daily_tests.created_at)}</p>
        </div>

        <div className="card">
          <CardHeader icon={<ShieldCheck />} label="Disponibilité (ping /health)" />
          <div className="metric" style={{ fontSize: "1.4rem" }}>
            {integrations?.availability_check.conclusion ?? "—"}
          </div>
          <p className="metric-note">
            {formatDate(integrations?.availability_check.created_at)}
          </p>
        </div>
      </div>

      <div className="card">
        <CardHeader icon={<Wrench />} label="Dépendances (Dependabot)" />
        <div className="metric">{integrations?.dependabot_open_prs ?? "—"}</div>
        <p className="metric-note">PR ouvertes en attente de revue</p>
      </div>

      <div className="card" style={{ marginTop: "1rem" }}>
        <CardHeader icon={<GitBranch />} label="Repo" />
        <a
          className="ext-link"
          href="https://github.com/ACAPO21/Subsight/actions"
          target="_blank"
          rel="noreferrer"
        >
          Voir les workflows sur GitHub →
        </a>
      </div>
    </>
  );
}
