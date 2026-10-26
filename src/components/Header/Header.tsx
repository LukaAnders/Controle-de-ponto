import { useState } from "react";
import { useApp, roles, pageNames } from "../../context/AppContext";
import { typeLabel } from "../../data/mockData";
import { Role } from "../../types";
import "./Header.css";

export default function Header() {
  const {
    role,
    setRole,
    page,
    go,
    occs,
    employees,
    sidebarCollapsed,
    toggleSidebar,
  } = useApp();
  const [showNotif, setShowNotif] = useState(false);

  const openOccs = occs.filter(
    (o) => o.status === "Pendente" || o.status === "Em análise",
  );
  const highPriorityOccs = openOccs.filter((o) => o.priority === "Alta");

  const getEmpName = (empId: string) =>
    employees.find((e) => e.id === empId)?.name ?? "Colaborador";

  return (
    <header className="top-header">
      <div className="header-left">
        <button
          type="button"
          className="sidebar-toggle-btn"
          onClick={toggleSidebar}
          aria-label={
            sidebarCollapsed ? "Mostrar barra lateral" : "Ocultar barra lateral"
          }
          title={
            sidebarCollapsed
              ? "Expandir barra lateral"
              : "Recolher barra lateral"
          }
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
          </svg>
        </button>

        <div className="header-title-block">
          <span className="header-section-title">{pageNames[page]}</span>
          <span
            className="demo-pill"
            title="Todos os dados e equipamentos são simulados localmente"
          >
            Segunda-feira, 26 Out · Demonstrativo
          </span>
        </div>
      </div>

      <div className="header-right">
        <div
          className="header-quick-cluster"
          aria-label="Atalhos rápidos de operação"
        >
          <span className="header-live-timer" title="Turno corporativo ativo">
            08:44:36
          </span>
          <button
            type="button"
            className="quick-circle-btn green"
            title="Simular registro de entrada (Central de Ponto)"
            onClick={() => go("punch")}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </button>
          <button
            type="button"
            className="quick-circle-btn amber"
            title="Revisar ocorrências e intervalos pendentes"
            onClick={() => go("occurrences", { open: "1" })}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
            </svg>
          </button>
          <button
            type="button"
            className="quick-circle-btn crimson"
            title="Abrir Assistente Operacional de IA"
            onClick={() => go("assistant")}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>

        <div
          className="role-segmented-control"
          role="group"
          aria-label="Alternar perfil demonstrativo"
        >
          {(Object.keys(roles) as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              className={`segment-btn ${role === r ? "active" : ""}`}
              onClick={() => {
                setShowNotif(false);
                setRole(r);
              }}
              title={`Simular visão: ${roles[r].label}`}
            >
              {roles[r].segmentLabel}
            </button>
          ))}
        </div>

        <div className="notif-wrapper">
          <button
            type="button"
            className="icon-btn"
            aria-label={`Notificações demonstrativas (${openOccs.length} pendentes)`}
            onClick={() => setShowNotif((v) => !v)}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {openOccs.length > 0 && (
              <span className="notif-dot">{openOccs.length}</span>
            )}
          </button>

          {showNotif && (
            <div
              className="notif-popover"
              role="region"
              aria-label="Notificações"
            >
              <div className="notif-header">
                <strong>Pendências de Jornada ({openOccs.length})</strong>
                <button
                  type="button"
                  className="btn-link"
                  onClick={() => {
                    setShowNotif(false);
                    go("occurrences", { open: "1" });
                  }}
                >
                  Ver todas
                </button>
              </div>
              <div className="notif-list">
                {(highPriorityOccs.length > 0 ? highPriorityOccs : openOccs)
                  .slice(0, 4)
                  .map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="notif-item"
                      onClick={() => {
                        setShowNotif(false);
                        go("occurrences", { sel: item.id });
                      }}
                    >
                      <div className="notif-item-top">
                        <span className="badge bad">{item.priority}</span>
                        <small>{typeLabel[item.type]}</small>
                      </div>
                      <div className="notif-item-title">
                        {getEmpName(item.empId)} — {item.summary}
                      </div>
                    </button>
                  ))}
                {openOccs.length === 0 && (
                  <div className="notif-empty">
                    Nenhuma pendência aberta para o perfil atual.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
