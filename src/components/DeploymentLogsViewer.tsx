import { useEffect, useRef, useState } from "react";
import { fetchRailwayDeploymentLogs, type DeploymentLogLine } from "../api";

const POLL_INTERVAL_MS = 10_000;

function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString("fr-FR");
}

export function DeploymentLogsViewer(props: { apiKey: string }) {
  const [lines, setLines] = useState<DeploymentLogLine[]>([]);
  const [error, setError] = useState<string | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await fetchRailwayDeploymentLogs(props.apiKey);
        if (!cancelled) {
          setLines(data.lines);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Erreur inconnue");
      }
    };
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [props.apiKey]);

  // Railway renvoie les logs du plus recent au plus ancien ; on les remet
  // dans l'ordre chronologique pour un vrai defilement de haut en bas.
  const chronological = [...lines].reverse();

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [chronological.length]);

  return (
    <div className="terminal-card">
      <div className="terminal-card-header">
        <h2>Dernier déploiement</h2>
        <span className="terminal-live-dot">En direct</span>
      </div>
      {error && (
        <div className="error-banner" style={{ margin: "0.75rem 1.25rem" }}>
          {error}
        </div>
      )}
      <div className="terminal-body" ref={bodyRef}>
        {chronological.length === 0 ? (
          <p className="terminal-empty">Aucun log disponible pour l'instant.</p>
        ) : (
          chronological.map((line, index) => (
            <div
              key={`${line.timestamp}-${index}`}
              className={"terminal-line kind-" + (line.severity ?? "info")}
            >
              <span className="terminal-ts">[{formatTime(line.timestamp)}]</span>
              <span>{line.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
