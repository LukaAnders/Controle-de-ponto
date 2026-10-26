import { useState } from "react";
import { useApp, roles, pageNames } from "../../context/AppContext";
import { typeLabel } from "../../data/mockData";
import { Role } from "../../types";
import "./Header.css";

export default function Header() {
  const { role, setRole, page, go, occs, employees } = useApp();
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
        <span className="header-section-title">{pageNames[page]}</span>
        <span
          className="demo-pill"
          title="Todos os dados e equipamentos são simulados localmente"
        >
          Ambiente Demonstrativo
        </span>
      </div>

      <div className="header-right">
        <div className="notif-wrapper">
          <button
            type="button"
            className="icon-btn"
            aria-label={`Notificações demonstrativas (${openOccs.length} pendentes)`}
            onClick={() => setShowNotif((v) => !v)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {openOccs.length > 0 && (
              <span className="notif-dot">{openOccs.length}</span>
            )}
          </button>

          {showNotif && (
            <div className="notif-popover" role="region" aria-label="Notificações">
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

        <div className="profile-switcher">
          <label htmlFor="role-select" className="profile-label">
            <span>Perfil de acesso (simulado):</span>
            <select
              id="role-select"
              value={role}
              onChange={(e) => {
                setShowNotif(false);
                setRole(e.target.value as Role);
              }}
            >
              {(Object.keys(roles) as Role[]).map((r) => (
                <option key={r} value={r}>
                  {roles[r].label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </header>
  );
}

