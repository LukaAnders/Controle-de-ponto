interface KpiCardsProps {
  presentCount: number;
  activeCount: number;
  inShiftCount: number;
  openOccsCount: number;
}

export default function KpiCards({
  presentCount,
  activeCount,
  inShiftCount,
  openOccsCount,
}: KpiCardsProps) {
  return (
    <section aria-label="Indicadores principais da jornada" className="grid3">
      <div className="card kpi-card">
        <div className="kpi-top">
          <span className="kpi-label">Presentes hoje</span>
          <span className="badge ok">Operação normal</span>
        </div>
        <div className="kpi-value-row">
          <strong className="big">{presentCount}</strong>
          <span className="kpi-unit">de {activeCount} funcionários</span>
        </div>
        <small className="kpi-foot">
          Contabiliza colaboradores ativos com entrada registrada na data (
          {Math.round((presentCount / activeCount) * 100)}% do quadro)
        </small>
      </div>

      <div className="card kpi-card">
        <div className="kpi-top">
          <span className="kpi-label">Em jornada</span>
          <span className="badge info">Turno ativo</span>
        </div>
        <div className="kpi-value-row">
          <strong className="big">{inShiftCount}</strong>
          <span className="kpi-unit">jornadas</span>
        </div>
        <small className="kpi-foot">
          Jornadas atualmente em andamento (6 em intervalo intrajornada no
          momento)
        </small>
      </div>

      <div className="card kpi-card warn">
        <div className="kpi-top">
          <span className="kpi-label">Exigem atenção</span>
          <span className="badge warn">
            {openOccsCount > 0 ? "Requer ação" : "Em dia"}
          </span>
        </div>
        <div className="kpi-value-row">
          <strong className="big">{openOccsCount}</strong>
          <span className="kpi-unit">ocorrências</span>
        </div>
        <small className="kpi-foot">
          Soma de registros incompletos, justificativas e permissões remotas
          aguardando análise
        </small>
      </div>
    </section>
  );
}

