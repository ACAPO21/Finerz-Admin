import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  LayoutGrid,
  Server,
  Terminal,
} from "lucide-react";
import finerzLogo from "../assets/finerz_logo.png";

export type PageId = "overview" | "terminal" | "sentry" | "ci" | "infrastructure";

const NAV_ITEMS: { id: PageId; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Vue d'ensemble", icon: <LayoutGrid size={17} /> },
  { id: "terminal", label: "Terminal", icon: <Terminal size={17} /> },
  { id: "sentry", label: "Sentry", icon: <AlertTriangle size={17} /> },
  { id: "ci", label: "CI/CD & Dépendances", icon: <GitBranch size={17} /> },
  { id: "infrastructure", label: "Infrastructure", icon: <Server size={17} /> },
];

export function Sidebar(props: {
  active: PageId;
  onNavigate: (page: PageId) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  return (
    <aside className={"sidebar " + (props.collapsed ? "collapsed" : "")}>
      <div className="sidebar-brand">
        <img src={finerzLogo} alt="Finerz" />
        <div className="brand-text">
          <strong>Finerz</strong>
          <span>Supervision</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={"sidebar-nav-item " + (props.active === item.id ? "active" : "")}
            onClick={() => props.onNavigate(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <button className="sidebar-collapse-toggle" onClick={props.onToggleCollapsed}>
        {props.collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}
