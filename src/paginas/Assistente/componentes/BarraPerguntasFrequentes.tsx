const suggestedQuestions = [
  "Como registro meu ponto?",
  "Como justifico uma ausência?",
  "Por que meu registro aparece incompleto?",
  "Como funciona a autorização de home office?",
  "Como consultar meu histórico de jornada?",
  "Qual é o status da minha justificativa?",
];

interface AssistantFaqSidebarProps {
  activeQuestion?: string;
  onSelectQuestion: (q: string) => void;
}

export default function AssistantFaqSidebar({
  activeQuestion = "",
  onSelectQuestion,
}: AssistantFaqSidebarProps) {
  return (
    <aside
      className="assistant-sidebar"
      aria-label="Perguntas frequentes e limites da IA"
    >
      <div className="faq-panel">
        <div className="faq-panel-header">
          <h2>Perguntas frequentes</h2>
        </div>

        <div className="faq-list" role="list">
          {suggestedQuestions.map((q) => {
            const isSelected =
              activeQuestion.trim().toLowerCase() === q.toLowerCase();
            return (
              <button
                key={q}
                type="button"
                className={`faq-btn ${isSelected ? "active" : ""}`}
                aria-current={isSelected ? "true" : undefined}
                onClick={() => onSelectQuestion(q)}
              >
                <span className="faq-btn-text">{q}</span>
                <span className="faq-btn-icon" aria-hidden="true">
                  ›
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="governance-note" aria-label="Limites e Governança da IA">
        <strong className="governance-title">Limites e governança</strong>
        <ul className="compact-bullets">
          <li>Respostas baseadas em regras locais do sistema.</li>
          <li>Não calcula saldos de banco de horas nem altera dados.</li>
          <li>Respeita o perfil selecionado no cabeçalho.</li>
          <li>Não aprova nem rejeita justificativas automaticamente.</li>
        </ul>
      </div>
    </aside>
  );
}

