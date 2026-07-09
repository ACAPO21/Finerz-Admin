import { useState } from "react";
import { KeyRound, LogOut } from "lucide-react";
import finerzLogo from "./assets/finerz_logo.png";
import { Sidebar, type PageId } from "./components/Sidebar";
import { OverviewPage } from "./pages/OverviewPage";
import { SentryPage } from "./pages/SentryPage";
import { CiDependenciesPage } from "./pages/CiDependenciesPage";
import { InfrastructurePage } from "./pages/InfrastructurePage";
import { DatabasePage } from "./pages/DatabasePage";

const STORAGE_KEY = "finerz-admin-api-key";
const SIDEBAR_COLLAPSED_KEY = "finerz-admin-sidebar-collapsed";

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

function Workspace(props: { apiKey: string; onSignOut: () => void }) {
  const [page, setPage] = useState<PageId>("overview");
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1"
  );

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0");
      return next;
    });
  };

  return (
    <div className="app-shell">
      <OrbField />
      <Sidebar
        active={page}
        onNavigate={setPage}
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
      />

      <div className="main-area">
        <div className="main-topbar">
          <button className="signout" onClick={props.onSignOut}>
            <LogOut size={14} />
            Déconnexion
          </button>
        </div>

        <main className="main-content">
          {page === "overview" && <OverviewPage apiKey={props.apiKey} />}
          {page === "sentry" && <SentryPage apiKey={props.apiKey} />}
          {page === "ci" && <CiDependenciesPage apiKey={props.apiKey} />}
          {page === "infrastructure" && <InfrastructurePage apiKey={props.apiKey} />}
          {page === "database" && <DatabasePage apiKey={props.apiKey} />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [apiKey, setApiKey, clearApiKey] = useStoredApiKey();

  if (!apiKey) {
    return <LoginScreen onSubmit={setApiKey} />;
  }

  return <Workspace apiKey={apiKey} onSignOut={clearApiKey} />;
}
