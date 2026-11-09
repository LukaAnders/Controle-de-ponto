const suggestedQuestions = [
  "Como registro meu ponto?",
  "Como justifico uma ausência?",
  "Por que meu registro aparece incompleto?",
  "Como funciona a autorização de home office?",
  "Como consultar meu histórico de jornada?",
  "Qual é o status da minha justificativa?",
];

interface AssistantFaqSidebarProps {
  onSelectQuestion: (q: string) => void;
}

export default function AssistantFaqSidebar({
  onSelectQuestion,
}: AssistantFaqSidebarProps) {
  return (
    <section
      className="card assistant-sidebar"
      aria-label="Perguntas frequentes e limites da IA"
    >
      <h2>Perguntas frequentes</h2>
      <p className="sub" style={{ marginTop: 0 }}>
        Selecione um tópico para simular a orientação contextualizada ao seu
        perfil de acesso:
      </p>
      <div className="faq-list">
        {suggestedQuestions.map((q) => (
          <button
            key={q}
            type="button"
            className="faq-btn"
            onClick={() => onSelectQuestion(q)}
          >
            <span>{q}</span>
            <span aria-hidden="true">→</span>
          </button>
        ))}
      </div>

      <div className="info-box" style={{ marginTop: 12 }}>
        <strong>Limites e Governança da IA</strong>
        <ul className="compact-bullets">
          <li>Respostas baseadas em regras mockadas locais.</li>
          <li>Não inventa saldos de banco de horas nem dados pessoais.</li>
          <li>Respeita o perfil selecionado no cabeçalho.</li>
          <li>Não aprova nem rejeita justificativas automaticamente.</li>
        </ul>
      </div>
    </section>
  );
}

