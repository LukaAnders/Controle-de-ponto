import { useApp, roles, pageNames } from "../../context/AppContext";
import { Page } from "../../types";
import "./Sidebar.css";

const pageIcons: Record<Page, JSX.Element> = {
  overview: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  ),
  punch: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15.5 14.5" />
    </svg>
  ),
  employees: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  occurrences: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  ),
  assistant: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M8 10h.01" />
      <path d="M12 10h.01" />
      <path d="M16 10h.01" />
    </svg>
  ),
};

interface SidebarProps {
  onOpenPrivacy: () => void;
}

export default function Sidebar({ onOpenPrivacy }: SidebarProps) {
  const { role, page, go, occs, sidebarCollapsed, toggleSidebar } = useApp();

  const openOccsCount = occs.filter(
    (o) => o.status === "Pendente" || o.status === "Em análise",
  ).length;

  const mainPages = roles[role].pages.filter((p) => p !== "assistant");
  const hasAssistant = roles[role].pages.includes("assistant");

  return (
    <aside
      className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}
      aria-label="Menu lateral"
    >
      <div
        className="brand"
        onClick={() => go(roles[role].pages[0])}
        title="PontoNexo — Gestão de Jornada - SaaS"
      >
        {sidebarCollapsed ? (
          <div className="brand-Collapsed-box">
            <img
              src={`${import.meta.env.BASE_URL}logo-icon.png`}
              alt="PontoNexo"
              className="brand-icon-img"
            />
          </div>
        ) : (
          <div className="brand-full-box">
            <img
              src={`${import.meta.env.BASE_URL}logo-pontonexo.png`}
              alt="PontoNexo — Gestão de Jornada - SaaS"
              className="brand-full-img"
            />
          </div>
        )}
      </div>

      <nav aria-label="Navegação principal" className="sidebar-nav">
        {!sidebarCollapsed && (
          <div className="nav-section-label">OPERAÇÃO E JORNADA</div>
        )}
        {mainPages.map((p) => (
          <button
            key={p}
            type="button"
            title={sidebarCollapsed ? pageNames[p] : undefined}
            className={`nav-btn ${p === page ? "active" : ""}`}
            aria-current={p === page ? "page" : undefined}
            onClick={() => go(p)}
          >
            <span className="nav-btn-left">
              {pageIcons[p]}
              {!sidebarCollapsed && <span>{pageNames[p]}</span>}
            </span>
            {p === "occurrences" && openOccsCount > 0 && (
              <span
                className="nav-counter"
                title={`${openOccsCount} ocorrências abertas`}
              >
                {openOccsCount}
              </span>
            )}
          </button>
        ))}

        {hasAssistant && (
          <>
            <div className="nav-divider" />
            {!sidebarCollapsed && (
              <div className="nav-section-label">INTELIGÊNCIA E GOVERNANÇA</div>
            )}
            <button
              type="button"
              title={sidebarCollapsed ? pageNames.assistant : undefined}
              className={`nav-btn ${page === "assistant" ? "active" : ""}`}
              aria-current={page === "assistant" ? "page" : undefined}
              onClick={() => go("assistant")}
            >
              <span className="nav-btn-left">
                {pageIcons.assistant}
                {!sidebarCollapsed && <span>{pageNames.assistant}</span>}
              </span>
              {!sidebarCollapsed && <span className="nav-tag">IA</span>}
            </button>
          </>
        )}

        <button
          type="button"
          title={sidebarCollapsed ? "Privacidade e LGPD" : undefined}
          className="nav-btn nav-btn-secondary"
          onClick={onOpenPrivacy}
        >
          <span className="nav-btn-left">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            {!sidebarCollapsed && <span>Privacidade e LGPD</span>}
          </span>
        </button>
      </nav>

      <div className="who" title={`${roles[role].user} — ${roles[role].label}`}>
        <div className="who-avatar" aria-hidden="true">
          {roles[role].avatar}
          <span className="who-online-dot" />
        </div>
        {!sidebarCollapsed && (
          <div className="who-info">
            <strong>{roles[role].user}</strong>
            <small>{roles[role].shortLabel}</small>
          </div>
        )}
      </div>

      <button
        type="button"
        className="collapse-footer-btn"
        onClick={toggleSidebar}
        aria-label={
          sidebarCollapsed
            ? "Expandir barra lateral"
            : "Recolher barra lateral"
        }
        title={
          sidebarCollapsed
            ? "Expandir menu lateral"
            : "Recolher menu lateral"
        }
      >
        {sidebarCollapsed ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="13 17 18 12 13 7" />
            <polyline points="6 17 11 12 6 7" />
          </svg>
        ) : (
          <>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="11 17 6 12 11 7" />
              <polyline points="18 17 13 12 18 7" />
            </svg>
            <span>Recolher menu</span>
          </>
        )}
      </button>
    </aside>
  );
}
