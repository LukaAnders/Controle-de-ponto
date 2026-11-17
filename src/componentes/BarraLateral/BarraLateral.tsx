import { useState, useRef, useEffect, FocusEvent, MouseEvent } from "react";
import {
  LayoutDashboard,
  Clock,
  CalendarClock,
  Users,
  ClipboardList,
  MessageSquare,
  ShieldCheck,
  RotateCcw,
  Settings,
  ChevronDown,
  LucideIcon,
} from "lucide-react";
import { useApp, roles, pageNames } from "../../contexto/ContextoApp";
import { Page } from "../../tipos";
import "./BarraLateral.css";

const pageIcons: Record<Page, LucideIcon> = {
  overview: LayoutDashboard,
  punch: Clock,
  timebank: CalendarClock,
  employees: Users,
  occurrences: ClipboardList,
  assistant: MessageSquare,
};

interface TooltipState {
  text: string;
  top: number;
  left: number;
}

interface SidebarProps {
  onOpenPrivacy: () => void;
}

export default function Sidebar({ onOpenPrivacy }: SidebarProps) {
  const { role, page, go, occs, sidebarCollapsed, resetDemoData } = useApp();
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [collapsedSettingsOpen, setCollapsedSettingsOpen] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const settingsPopoverRef = useRef<HTMLDivElement>(null);

  const openOccsCount = occs.filter(
    (o) => o.status === "Pendente" || o.status === "Em análise",
  ).length;

  const mainPages = roles[role].pages.filter((p) => p !== "assistant");

  useEffect(() => {
    if (!sidebarCollapsed) {
      setTooltip(null);
      setCollapsedSettingsOpen(false);
    }
  }, [sidebarCollapsed]);

  useEffect(() => {
    if (!collapsedSettingsOpen) return;
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (
        settingsPopoverRef.current &&
        !settingsPopoverRef.current.contains(event.target as Node)
      ) {
        setCollapsedSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [collapsedSettingsOpen]);

  const showTooltip = (
    text: string,
    target: HTMLElement,
  ) => {
    if (!sidebarCollapsed) return;
    if (window.innerWidth <= 860) return;
    const rect = target.getBoundingClientRect();
    setTooltip({
      text,
      top: rect.top + rect.height / 2,
      left: rect.right + 10,
    });
  };

  const hideTooltip = () => {
    setTooltip(null);
  };

  const handleMouseEnter =
    (text: string) => (e: MouseEvent<HTMLElement>) => {
      showTooltip(text, e.currentTarget);
    };

  const handleFocus =
    (text: string) => (e: FocusEvent<HTMLElement>) => {
      showTooltip(text, e.currentTarget);
    };

  return (
    <aside
      className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}
      aria-label="Menu lateral"
    >
      <nav aria-label="Navegação principal" className="sidebar-nav">
        <div className="nav-section-label">OPERAÇÃO E JORNADA</div>
        <div className="nav-list">
          {mainPages.map((p) => {
            const Icon = pageIcons[p];
            const isActive = p === page;
            const label = pageNames[p];
            const tooltipText =
              p === "occurrences" && openOccsCount > 0
                ? `${label} (${openOccsCount})`
                : label;

            return (
              <button
                key={p}
                type="button"
                className={`nav-btn ${isActive ? "active" : ""}`}
                aria-current={isActive ? "page" : undefined}
                aria-label={sidebarCollapsed ? tooltipText : undefined}
                onClick={() => go(p)}
                onMouseEnter={handleMouseEnter(tooltipText)}
                onMouseLeave={hideTooltip}
                onFocus={handleFocus(tooltipText)}
                onBlur={hideTooltip}
              >
                <span className="nav-btn-left">
                  <span className="nav-icon-wrap">
                    <Icon size={18} strokeWidth={1.9} aria-hidden="true" />
                    {sidebarCollapsed &&
                      p === "occurrences" &&
                      openOccsCount > 0 && (
                        <span
                          className="nav-counter-dot"
                          aria-hidden="true"
                        />
                      )}
                  </span>
                  <span className="nav-label">{label}</span>
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
            );
          })}
        </div>
      </nav>

      <div className="sidebar-footer" ref={settingsPopoverRef}>
        {!sidebarCollapsed ? (
          <div className="nav-dropdown">
            <button
              type="button"
              className={`nav-dropdown-trigger ${settingsOpen ? "open" : ""}`}
              aria-expanded={settingsOpen}
              onClick={() => setSettingsOpen((prev) => !prev)}
            >
              <span className="nav-btn-left">
                <span className="nav-icon-wrap">
                  <Settings size={18} strokeWidth={1.9} aria-hidden="true" />
                </span>
                <span className="nav-label">Configurações</span>
              </span>
              <ChevronDown
                size={15}
                strokeWidth={2}
                className="nav-dropdown-chevron"
                aria-hidden="true"
              />
            </button>

            <div
              className={`nav-dropdown-panel ${settingsOpen ? "open" : ""}`}
              aria-hidden={!settingsOpen}
            >
              <div className="nav-dropdown-inner">
                <button
                  type="button"
                  className="nav-sub-btn"
                  tabIndex={settingsOpen ? 0 : -1}
                  onClick={onOpenPrivacy}
                >
                  <ShieldCheck size={16} strokeWidth={1.9} aria-hidden="true" />
                  <span>Privacidade e LGPD</span>
                </button>

                <button
                  type="button"
                  className="nav-sub-btn"
                  tabIndex={settingsOpen ? 0 : -1}
                  onClick={resetDemoData}
                  title="Restaurar cadastros, batidas e ocorrências iniciais no localStorage"
                >
                  <RotateCcw size={16} strokeWidth={1.9} aria-hidden="true" />
                  <span>Restaurar dados iniciais</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="nav-dropdown-collapsed">
            <button
              type="button"
              className={`nav-btn ${collapsedSettingsOpen ? "active" : ""}`}
              aria-label="Configurações"
              aria-expanded={collapsedSettingsOpen}
              onClick={() => {
                hideTooltip();
                setCollapsedSettingsOpen((prev) => !prev);
              }}
              onMouseEnter={handleMouseEnter("Configurações")}
              onMouseLeave={hideTooltip}
              onFocus={handleFocus("Configurações")}
              onBlur={hideTooltip}
            >
              <span className="nav-btn-left">
                <span className="nav-icon-wrap">
                  <Settings size={18} strokeWidth={1.9} aria-hidden="true" />
                </span>
              </span>
            </button>

            {collapsedSettingsOpen && (
              <div
                className="nav-collapsed-popover"
                role="menu"
                aria-label="Menu de configurações"
              >
                <div className="nav-collapsed-popover-title">Configurações</div>
                <button
                  type="button"
                  role="menuitem"
                  className="nav-sub-btn"
                  onClick={() => {
                    setCollapsedSettingsOpen(false);
                    onOpenPrivacy();
                  }}
                >
                  <ShieldCheck size={16} strokeWidth={1.9} aria-hidden="true" />
                  <span>Privacidade e LGPD</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="nav-sub-btn"
                  onClick={() => {
                    setCollapsedSettingsOpen(false);
                    resetDemoData();
                  }}
                  title="Restaurar cadastros, batidas e ocorrências iniciais no localStorage"
                >
                  <RotateCcw size={16} strokeWidth={1.9} aria-hidden="true" />
                  <span>Restaurar dados iniciais</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div
        className="who"
        aria-label={`${roles[role].user} — ${roles[role].label}`}
        onMouseEnter={handleMouseEnter(
          `${roles[role].user} · ${roles[role].shortLabel}`,
        )}
        onMouseLeave={hideTooltip}
      >
        <div className="who-avatar" aria-hidden="true">
          {roles[role].avatar}
          <span className="who-online-dot" />
        </div>
        <div className="who-info">
          <strong>{roles[role].user}</strong>
          <small>{roles[role].shortLabel}</small>
        </div>
      </div>

      {sidebarCollapsed && tooltip && (
        <div
          className="sidebar-tooltip"
          role="tooltip"
          style={{ top: `${tooltip.top}px`, left: `${tooltip.left}px` }}
        >
          {tooltip.text}
        </div>
      )}
    </aside>
  );
}
