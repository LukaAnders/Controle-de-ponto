import { useState } from "react";
import { useApp } from "../../contexto/ContextoApp";
import ChatConversation from "./componentes/ChatConversation";
import "./AssistantWidget.css";

export default function AssistantWidget() {
  const { page, go } = useApp();
  const [open, setOpen] = useState(false);

  if (page === "assistant") return null;

  return (
    <div className="assistant-widget-root">
      {open && (
        <section className="assistant-widget-panel" aria-label="Chat do assistente PontoNexo">
          <header className="assistant-widget-header">
            <div className="assistant-widget-avatar" aria-hidden="true">✦</div>
            <div className="assistant-widget-heading">
              <strong>Assistente PontoNexo</strong>
              <span><i /> Pronto para ajudar</span>
            </div>
            <button
              type="button"
              className="assistant-widget-close"
              aria-label="Fechar chat"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </header>
          <ChatConversation compact />
          <button
            className="assistant-widget-full-link"
            type="button"
            onClick={() => {
              setOpen(false);
              go("assistant");
            }}
          >
            Abrir página completa do assistente <span aria-hidden="true">↗</span>
          </button>
        </section>
      )}

      <button
        type="button"
        className={`assistant-widget-launcher${open ? " is-open" : ""}`}
        aria-label={open ? "Fechar assistente" : "Abrir assistente"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? (
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H5l1.7-3.4A7.5 7.5 0 1 1 20 11.5Z" /><path d="M8.5 11.5h.01M12.5 11.5h.01M16.5 11.5h.01" /></svg>
        )}
        {!open && <span>Ajuda</span>}
      </button>
    </div>
  );
}
