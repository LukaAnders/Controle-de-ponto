interface KpiCardsProps {
  presentCount: number;
  activeCount: number;
  inShiftCount: number;
  openOccsCount: number;
  periodLabel?: string;
}

export default function KpiCards({
  presentCount,
  activeCount,
  inShiftCount,
  openOccsCount,
  periodLabel = "Resumo do dia",
}: KpiCardsProps) {
  return (
    <section
      className="admin-summary-section"
      aria-label="Resumo administrativo da jornada"
    >
      <div className="admin-section-bar">
        <h2 className="admin-section-title">{periodLabel}</h2>
        <span className="admin-section-meta">
          Indicadores consolidados do escopo selecionado
        </span>
      </div>

      <div className="admin-summary-strip">
        <div className="admin-summary-item">
          <span className="admin-summary-label">Funcionários ativos</span>
          <strong className="admin-summary-value">{activeCount}</strong>
          <span className="admin-summary-desc">
            Cadastros ativos no controle de jornada
          </span>
        </div>

        <div className="admin-summary-item">
          <span className="admin-summary-label">Presentes hoje</span>
          <strong className="admin-summary-value is-blue">{presentCount}</strong>
          <span className="admin-summary-desc">
            {inShiftCount} em jornada ativa no momento
          </span>
        </div>

        <div className="admin-summary-item">
          <span className="admin-summary-label">Registros pendentes</span>
          <strong
            className={`admin-summary-value ${
              openOccsCount > 0 ? "is-danger" : "is-ok"
            }`}
          >
            {openOccsCount}
          </strong>
          <span className="admin-summary-desc">
            {openOccsCount > 0
              ? "Ocorrências aguardando análise do RH"
              : "Nenhuma pendência aberta no período"}
          </span>
        </div>
      </div>
    </section>
  );
}
