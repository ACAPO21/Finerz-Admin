import { useEffect, useRef, useState } from "react";
import { fetchRecentActivity, type ActivityEntry } from "../api";

const POLL_INTERVAL_MS = 10_000;

function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString("fr-FR");
}

export function TerminalPage(props: { apiKey: string }) {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await fetchRecentActivity(props.apiKey);
        if (!cancelled) {
          setEntries(data.entries);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erreur inconnue");
        }
      }
    };

    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [props.apiKey]);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [entries]);

  // Affichage chronologique (plus ancien en haut) comme un vrai defilement de terminal ;
  // le backend renvoie les entrees les plus recentes en premier.
  const chronological = [...entries].reverse();

  return (
    <>
      <h1>Terminal</h1>
      <p className="lede">
        Flux d'activité en direct — événements d'authentification et webhooks Bridge/RevenueCat
        reçus, rafraîchi toutes les 10 secondes.
      </p>

      {error && <div className="error-banner">{error}</div>}

      <div className="terminal-card">
        <div className="terminal-card-header">
          <h2>Activité récente</h2>
          <span className="terminal-live-dot">En direct</span>
        </div>
        <div className="terminal-body" ref={bodyRef}>
          {chronological.length === 0 ? (
            <p className="terminal-empty">Aucune activité pour le moment.</p>
          ) : (
            chronological.map((entry, index) => (
              <div key={`${entry.timestamp}-${index}`} className={`terminal-line kind-${entry.kind}`}>
                <span className="terminal-ts">[{formatTime(entry.timestamp)}]</span>
                <span className="terminal-tag">
                  {entry.kind === "auth" ? "AUTH" : "WEBHOOK"}
                </span>
                <span>{entry.label}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
