import { useState } from "react";
import { roles } from "../../../contexto/ContextoApp";
import { Page, Role } from "../../../tipos";

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
  isLoading?: boolean;
  onSend: (q: string) => void;
  onClear: () => void;
  go: (p: Page, q?: Record<string, string>) => void;
}

function renderGuidanceContent(text: string) {
  if (text.includes("(1)") && text.includes("(2)")) {
    const [intro, rest] = text.split("(1)");
    if (rest) {
      const steps = rest
        .split(/\(\d+\)/)
        .map((s) => s.replace(/^[;\s]+|[;.\s]+(\se\s)?$/g, "").trim())
        .filter(Boolean);

      return (
        <>
          {intro && <p className="answer-paragraph">{intro.trim()}</p>}
          <ol className="answer-steps">
            {steps.map((step, i) => (
              <li key={i}>{step}.</li>
            ))}
          </ol>
        </>
      );
    }
  }

  return <p className="answer-paragraph">{text}</p>;
}

export default function AssistantChatPanel({
  role,
  history,
  isLoading = false,
  onSend,
  onClear,
  go,
}: AssistantChatPanelProps) {
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    onSend(input);
    setInput("");
  };

  return (
    <section
      className="assistant-main"
      aria-label="Central de orientações do assistente"
    >
      <div className="assistant-feed">
        {history.length === 0 ? (
          <div className="assistant-empty">
            <h2>Olá! Como podemos ajudar?</h2>
            <p>
              Selecione uma das perguntas frequentes ao lado para consultar uma
              orientação sobre o controle de ponto.
            </p>
          </div>
        ) : (
          <div className="conversation-list">
            {history.map((item) => (
              <article key={item.id} className="conversation-item">
                <div className="question-row">
                  <span className="question-label">Dúvida selecionada</span>
                  <h3 className="question-title">{item.question}</h3>
                </div>

                <div className="answer-body">
                  <h4 className="answer-title">{item.response.intent}</h4>

                  {renderGuidanceContent(item.response.generalGuidance)}

                  <div className="answer-note">
                    <span className="answer-note-label">
                      Observação ({roles[role].shortLabel}):
                    </span>{" "}
                    <span>{item.response.userContextInfo}</span>
                  </div>

                  {item.response.links.length > 0 && (
                    <div className="answer-actions">
                      {item.response.links.map((lk, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="btn answer-action-btn"
                          onClick={() => go(lk.page, lk.query)}
                        >
                          <span>{lk.label}</span>
                          <span aria-hidden="true">→</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="assistant-input-bar">
        <input
          aria-label="Digite sua pergunta para o assistente"
          value={input}
          disabled={isLoading}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Ou digite uma dúvida sobre ponto, catraca, home office ou justificativas..."
        />
        <button
          type="button"
          className="btn primary"
          disabled={isLoading}
          onClick={handleSubmit}
        >
          {isLoading ? "Consultando..." : "Consultar"}
        </button>
        {history.length > 0 && (
          <button
            type="button"
            className="btn"
            disabled={isLoading}
            onClick={onClear}
          >
            Limpar conversa
          </button>
        )}
      </div>
    </section>
  );
}

