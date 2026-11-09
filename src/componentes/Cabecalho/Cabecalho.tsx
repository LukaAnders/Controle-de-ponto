import { useState } from "react";
import { useApp, roles } from "../../contexto/ContextoApp";
import { typeLabel } from "../../dados/dadosSimulados";
import { Role } from "../../tipos";
import "./Cabecalho.css";

const roleNavLabels: Record<Role, string> = {
  rh: "RH",
  gestor: "Gestor",
  funcionario: "Funcionário",
};

export default function Header() {
  const { role, setRole, go, occs, employees, sidebarCollapsed, toggleSidebar } =
    useApp();
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
          className="header-menu-btn"
          onClick={toggleSidebar}
          aria-label={
            sidebarCollapsed
              ? "Expandir menu lateral"
              : "Ocultar menu lateral"
          }
          aria-expanded={!sidebarCollapsed}
          title={
            sidebarCollapsed
              ? "Expandir menu lateral"
              : "Ocultar menu lateral"
          }
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div
          className="header-brand"
          onClick={() => go(roles[role].pages[0])}
          title="PontoNexo — Controle de Ponto"
        >
          <img
            src={`${import.meta.env.BASE_URL}logo-pontonexo.png`}
            alt="PontoNexo"
            className="header-brand-img"
          />
        </div>
      </div>

      <nav
        className="header-navbar"
        aria-label="Navegação de perfil e notificações"
      >
        <div
          className="header-role-nav"
          role="group"
          aria-label="Alternar perfil de acesso"
        >
          {(Object.keys(roles) as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              className={`header-nav-btn ${role === r ? "active" : ""}`}
              onClick={() => {
                setShowNotif(false);
                setRole(r);
              }}
              title={`Alternar para: ${roles[r].label}`}
            >
              <span>{roleNavLabels[r]}</span>
            </button>
          ))}
        </div>

        <div className="header-nav-divider" aria-hidden="true" />

        <div className="notif-wrapper">
          <button
            type="button"
            className={`header-nav-btn header-notif-btn ${showNotif ? "active" : ""}`}
            aria-label={`Notificações (${openOccs.length} pendentes)`}
            title="Notificações de pendências"
            onClick={() => setShowNotif((v) => !v)}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="header-notif-label">Notificações</span>
            {openOccs.length > 0 && (
              <span className="header-nav-counter">{openOccs.length}</span>
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
      </nav>
    </header>
  );
}
