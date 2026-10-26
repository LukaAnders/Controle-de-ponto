import { useState } from "react";
import { roles } from "../../../context/AppContext";
import { Page, Role } from "../../../types";

export interface AssistantResponse {
  intent: string;
  generalGuidance: string;
  userContextInfo: string;
  links: { label: string; page: Page; query?: Record<string, string> }[];
}

export interface ChatItem {
  id: string;
  question: string;
  response: AssistantResponse;
}

interface AssistantChatPanelProps {
  role: Role;
  history: ChatItem[];
  onSend: (q: string) => void;
  onClear: () => void;
  go: (p: Page, q?: Record<string, string>) => void;
}

export default function AssistantChatPanel({
  role,
  history,
  onSend,
  onClear,
  go,
}: AssistantChatPanelProps) {
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  return (
    <section
      className="card assistant-main"
      aria-label="Painel de respostas do assistente"
    >
      <div className="assistant-welcome">
        <div className="welcome-badge">ASSISTENTE DEMONSTRATIVO</div>
        <h2>Olá, {roles[role].user}! Como posso orientar sua rotina hoje?</h2>
        <p className="sub" style={{ margin: 0 }}>
          Minhas respostas separam claramente as{" "}
          <b>Orientações gerais da plataforma</b> das{" "}
          <b>
            Informações contextuais permitidas ao seu perfil ({roles[role].label}
            )
          </b>
          .
        </p>
      </div>

      <div className="assistant-feed">
        {history.length === 0 ? (
          <div className="assistant-empty">
            <strong>Nenhuma consulta realizada nesta sessão</strong>
            <p>
              Clique em uma das perguntas sugeridas ao lado ou digite sua dúvida
              abaixo (por exemplo:{" "}
              <i>“Por que meu registro aparece incompleto?”</i> ou{" "}
              <i>“Como funciona a autorização de home office?”</i>).
            </p>
          </div>
        ) : (
          history.map((item) => (
            <div key={item.id} className="qa-card">
              <div className="qa-question">
                <span className="qa-user-tag">Sua pergunta:</span>
                <strong>{item.question}</strong>
              </div>

              <div className="qa-answer">
                <div className="qa-intent">
                  <span>Intenção identificada:</span>{" "}
                  <b>{item.response.intent}</b>
                </div>

                <div className="qa-section">
                  <small>ORIENTAÇÃO GERAL (POLÍTICA OPERACIONAL)</small>
                  <p>{item.response.generalGuidance}</p>
                </div>

                <div className="qa-section contextual">
                  <small>
                    CONTEXTO DO PERFIL ATUAL (
                    {roles[role].shortLabel.toUpperCase()})
                  </small>
                  <p>{item.response.userContextInfo}</p>
                </div>

                <div className="qa-actions">
                  <span>Atalhos recomendados:</span>
                  <div className="row">
                    {item.response.links.map((lk, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="btn primary-outline"
                        onClick={() => go(lk.page, lk.query)}
                      >
                        {lk.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="assistant-input-bar">
        <input
          aria-label="Digite sua pergunta para o assistente demonstrativo"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Digite uma dúvida sobre ponto, catraca, home office ou justificativas..."
        />
        <button type="button" className="btn primary" onClick={handleSubmit}>
          Enviar consulta
        </button>
        {history.length > 0 && (
          <button type="button" className="btn" onClick={onClear}>
            Limpar
          </button>
        )}
      </div>
    </section>
  );
}

