import { roles, useApp } from "../../contexto/ContextoApp";
import { useAssistantChat } from "./AssistantChatContext";
import ChatConversation from "./componentes/ChatConversation";
import "./Assistente.css";

export default function Assistant() {
  const { role } = useApp();
  const { history } = useAssistantChat();

  return (
    <div className="assistant-workspace page-stack">
      <header className="assistant-workspace-heading">
        <div className="assistant-workspace-title">
          <span className="assistant-eyebrow">PONTONEXO · CENTRAL DE AJUDA</span>
          <h1>Assistente Operacional</h1>
          <p>Respostas para sua rotina de ponto, jornada e solicitações.</p>
        </div>
        <div className="assistant-workspace-profile">
          <span className="assistant-profile-dot" />
          {roles[role].shortLabel}
        </div>
      </header>

      <section className="assistant-workspace-card" aria-label="Conversa com o assistente">
        <div className="assistant-workspace-card-header">
          <div className="assistant-workspace-agent">
            <span className="assistant-workspace-agent-icon" aria-hidden="true">✦</span>
            <div>
              <strong>Assistente PontoNexo</strong>
              <span>{history.length ? `${history.length} mensagens nesta conversa` : "Disponível para ajudar"}</span>
            </div>
          </div>
          <span className="assistant-ai-badge">IA operacional</span>
        </div>
        <ChatConversation />
      </section>

      <p className="assistant-workspace-footnote">
        As respostas orientam o uso do sistema. Aprovações e decisões sobre solicitações continuam com RH e gestores.
      </p>
    </div>
  );
}