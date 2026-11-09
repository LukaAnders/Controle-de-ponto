import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { roles, useApp } from "../../../contexto/ContextoApp";
import { useAssistantChat } from "../AssistantChatContext";
import { ChatItem } from "../AssistantChatContext";

const suggestions = [
  "Como registro meu ponto?",
  "Como envio uma justificativa?",
  "Por que meu registro está incompleto?",
  "Minha autorização de Home Office está ativa?",
];

interface ChatConversationProps {
  compact?: boolean;
  onNavigate?: () => void;
}

function MessagePair({ item }: { item: ChatItem }) {
  const { go } = useApp();

  return (
    <article className="assistant-message-pair">
      <div className="assistant-user-message">{item.question}</div>
      <div className="assistant-bot-message">
        <strong>{item.response.intent}</strong>
        <p>{item.response.generalGuidance}</p>
        {item.response.userContextInfo && (
          <small>{item.response.userContextInfo}</small>
        )}
        {!!item.response.links?.length && (
          <div className="assistant-message-links">
            {item.response.links.map((link, index) => (
              <button
                key={`${link.page}-${index}`}
                type="button"
                onClick={() => go(link.page, link.query)}
              >
                {link.label} <span aria-hidden="true">→</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export default function ChatConversation({
  compact = false,
  onNavigate,
}: ChatConversationProps) {
  const { role } = useApp();
  const { history, isLoading, sendMessage, clearHistory } = useAssistantChat();
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const shownHistory = [...history].reverse();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [history, isLoading]);

  const submit = async (question: string) => {
    const value = question.trim();
    if (!value || sending || isLoading) return;
    setDraft("");
    setSending(true);
    onNavigate?.();
    try {
      await sendMessage(value);
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submit(draft);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submit(draft);
    }
  };

  return (
    <div className={`assistant-chat-conversation${compact ? " is-compact" : ""}`}>
      <div className="assistant-chat-messages" aria-live="polite">
        {shownHistory.length === 0 ? (
          <div className="assistant-chat-welcome">
            <div className="assistant-welcome-mark" aria-hidden="true">✦</div>
            <h2>Olá, {roles[role].user.split(" ")[0]}!</h2>
            <p>Sou o assistente do PontoNexo. O que você precisa resolver?</p>
            <div className="assistant-suggestion-list">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => void submit(suggestion)}
                  disabled={sending || isLoading}
                >
                  {suggestion}<span aria-hidden="true">↗</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="assistant-chat-thread">
            {shownHistory.map((item) => (
              <MessagePair key={item.id} item={item} />
            ))}
            {(isLoading || sending) && (
              <div className="assistant-typing" role="status">
                <span /> <span /> <span /> <small>Preparando resposta</small>
              </div>
            )}
            <div ref={endRef} />
          </div>
        )}
      </div>

      <form className="assistant-chat-composer" onSubmit={handleSubmit}>
        {history.length > 0 && (
          <button
            className="assistant-clear-chat"
            type="button"
            onClick={clearHistory}
            disabled={sending || isLoading}
          >
            Limpar conversa
          </button>
        )}
        <div className="assistant-composer-box">
          <textarea
            aria-label="Escreva sua dúvida"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pergunte sobre ponto, jornada ou justificativas..."
            rows={compact ? 2 : 3}
            disabled={sending || isLoading}
          />
          <button
            type="submit"
            className="assistant-send-button"
            aria-label="Enviar pergunta"
            disabled={!draft.trim() || sending || isLoading}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
        <div className="assistant-composer-hint">Enter para enviar · Shift + Enter para nova linha</div>
      </form>
    </div>
  );
}
