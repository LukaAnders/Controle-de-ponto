import { useState } from "react";
import { useApp, roles } from "./store";
import { Page, Role, typeLabel } from "./data";
import Overview from "./pages/Overview";
import Punch from "./pages/Punch";
import Employees from "./pages/Employees";
import Occurrences from "./pages/Occurrences";
import Assistant from "./pages/Assistant";

const names: Record<Page, string> = {
  overview: "Visão operacional",
  punch: "Central de Ponto",
  employees: "Funcionários",
  occurrences: "Ocorrências e justificativas",
  assistant: "Assistente de IA",
};

const pageIcons: Record<Page, JSX.Element> = {
  overview: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  punch: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 15" />
    </svg>
  ),
  employees: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  occurrences: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  ),
  assistant: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M8 10h.01" />
      <path d="M12 10h.01" />
      <path d="M16 10h.01" />
    </svg>
  ),
};

export default function App() {
  const { role, setRole, page, go, toast, occs, employees } = useApp();
  const [showNotif, setShowNotif] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const openOccs = occs.filter(
    (o) => o.status === "Pendente" || o.status === "Em análise",
  );
  const highPriorityOccs = openOccs.filter((o) => o.priority === "Alta");

  const mainPages = roles[role].pages.filter((p) => p !== "assistant");
  const hasAssistant = roles[role].pages.includes("assistant");

  const P = {
    overview: Overview,
    punch: Punch,
    employees: Employees,
    occurrences: Occurrences,
    assistant: Assistant,
  }[page];

  const getEmpName = (empId: string) =>
    employees.find((e) => e.id === empId)?.name ?? "Colaborador";

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 7 12 12 15.5 14" />
            </svg>
          </div>
          <div>
            <div className="logo">PontoNexo</div>
            <div className="brand-sub">Gestão de Jornada · SaaS</div>
          </div>
        </div>

        <nav aria-label="Navegação principal" className="sidebar-nav">
          <div className="nav-section-label">OPERAÇÃO E JORNADA</div>
          {mainPages.map((p) => (
            <button
              key={p}
              className={`nav-btn ${p === page ? "active" : ""}`}
              aria-current={p === page ? "page" : undefined}
              onClick={() => go(p)}
            >
              <span className="nav-btn-left">
                {pageIcons[p]}
                <span>{names[p]}</span>
              </span>
              {p === "occurrences" && openOccs.length > 0 && (
                <span className="nav-counter" title="Ocorrências abertas">
                  {openOccs.length}
                </span>
              )}
            </button>
          ))}

          {hasAssistant && (
            <>
              <div className="nav-divider" />
              <div className="nav-section-label">APOIO E ORIENTAÇÃO</div>
              <button
                className={`nav-btn ${page === "assistant" ? "active" : ""}`}
                aria-current={page === "assistant" ? "page" : undefined}
                onClick={() => go("assistant")}
              >
                <span className="nav-btn-left">
                  {pageIcons.assistant}
                  <span>{names.assistant}</span>
                </span>
                <span className="nav-tag">IA</span>
              </button>
            </>
          )}

          <button
            type="button"
            className="nav-btn nav-btn-secondary"
            onClick={() => setShowPrivacyModal(true)}
          >
            <span className="nav-btn-left">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Privacidade e LGPD</span>
            </span>
          </button>
        </nav>

        <div className="who">
          <div className="who-avatar" aria-hidden="true">
            {roles[role].avatar}
          </div>
          <div className="who-info">
            <strong>{roles[role].user}</strong>
            <small>{roles[role].shortLabel}</small>
            <span className="who-scope">{roles[role].scopeNote}</span>
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="top-header">
          <div className="header-left">
            <span className="header-section-title">{names[page]}</span>
            <span className="demo-pill" title="Todos os dados e equipamentos são simulados localmente">
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

        <main className="page-container">
          <P />
        </main>
      </div>

      {toast && (
        <div className="toast" role="status" aria-live="polite">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{toast}</span>
        </div>
      )}

      {showPrivacyModal && (
        <div className="overlay" onClick={() => setShowPrivacyModal(false)}>
          <div
            className="modal modal-wide"
            role="dialog"
            aria-modal="true"
            aria-label="Diretrizes de Privacidade, LGPD e Escopo do Protótipo"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Privacidade, LGPD e Limites do Protótipo</h2>
              <button
                type="button"
                className="btn"
                onClick={() => setShowPrivacyModal(false)}
              >
                Fechar
              </button>
            </div>
            <p className="sub" style={{ marginBottom: 8 }}>
              O PontoNexo foi projetado aplicando princípios de privacidade desde a concepção (Privacy by Design) para fins acadêmicos e demonstrativos.
            </p>
            <div className="info-box">
              <strong>1. Dados estritamente fictícios e sem coleta biométrica</strong>
              <p>
                Nenhuma câmera, leitor biométrico, catraca física ou relógio de ponto real é acionado. A etapa de verificação facial do Ponto Digital e a leitura da Catraca Biométrica utilizam animações visuais locais, sem capturar imagens ou dados pessoais sensíveis.
              </p>
            </div>
            <div className="info-box">
              <strong>2. Governança de IA e supervisão humana</strong>
              <p>
                O Assistente de IA e o bloco “Sugestão do assistente” atuam exclusivamente como apoio informativo e operacional. O sistema não realiza aprovações ou rejeições automáticas de justificativas nem toma decisões trabalhistas autônomas.
              </p>
            </div>
            <div className="info-box">
              <strong>3. Requisitos para uma eventual implantação real (LGPD)</strong>
              <p>
                Como sistemas de ponto com biometria tratam dados pessoais sensíveis (Art. 5º, II e Art. 11 da Lei nº 13.709/2018 — LGPD), uma implementação produtiva exigiria avaliação jurídica formal, definição de base legal apropriada, controle de acesso autenticado no servidor, criptografia, políticas de retenção e descarte seguro, além de homologação técnica conforme normas trabalhistas vigentes (Portaria MTP nº 671/2021). Este protótipo acadêmico não possui certificação legal.
              </p>
            </div>
            <div className="row" style={{ justifyContent: "flex-end", marginTop: 8 }}>
              <button
                type="button"
                className="btn primary"
                onClick={() => setShowPrivacyModal(false)}
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
