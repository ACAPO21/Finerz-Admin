import { useEffect, useState } from "react";
import { CheckCircle2, Database, GitCommit } from "lucide-react";
import { fetchDatabaseStatus, type DatabaseStatus } from "../api";
import { CardHeader } from "../components/CardHeader";

function formatBytes(bytes: number | null): string {
  if (bytes === null) return "—";
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function DatabasePage(props: { apiKey: string }) {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDatabaseStatus(props.apiKey)
      .then(setStatus)
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur inconnue"));
  }, [props.apiKey]);

  const usagePercent =
    status?.database_size_bytes != null
      ? Math.round((status.database_size_bytes / status.database_size_quota_bytes) * 100)
      : null;

  return (
    <>
      <h1>Base de données</h1>
      <p className="lede">État de la base Postgres (Supabase) utilisée par le backend.</p>

      {error && <div className="error-banner">{error}</div>}

      <div className="grid">
        <div className="card">
          <CardHeader icon={<CheckCircle2 />} label="État" />
          <div className="metric" style={{ fontSize: "1.4rem" }}>
            {status === null ? "—" : status.reachable ? "joignable" : "injoignable"}
          </div>
        </div>

        <div className="card">
          <CardHeader icon={<GitCommit />} label="Alembic" />
          <div className="metric" style={{ fontSize: "1.4rem" }}>
            {status?.alembic_up_to_date == null
              ? "—"
              : status.alembic_up_to_date
                ? "à jour"
                : "en retard"}
          </div>
          <p className="metric-note">
            {status?.alembic_current_revision ?? "—"} / {status?.alembic_head_revision ?? "—"}
          </p>
        </div>
      </div>

      <div className="card" style={{ marginTop: "1rem" }}>
        <CardHeader icon={<Database />} label="Taille de la base" />
        <div className="metric">{formatBytes(status?.database_size_bytes ?? null)}</div>
        <p className="metric-note">
          {usagePercent !== null
            ? `${usagePercent}% du quota (${formatBytes(status?.database_size_quota_bytes ?? null)})`
            : "—"}
        </p>
      </div>
    </>
  );
}
