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
          <div className="kpi-icon-badge blue" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <span className="badge ok">Hoje</span>
        </div>
        <span className="kpi-label">Presentes hoje</span>
        <strong className="big blue-num">{presentCount}</strong>
        <span className="kpi-foot">de {activeCount} funcionários ativos</span>
      </div>

      <div className="card kpi-card">
        <div className="kpi-top">
          <div className="kpi-icon-badge amber" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 7 12 12 15 15" />
            </svg>
          </div>
          <span className="badge info">Turno ativo</span>
        </div>
        <span className="kpi-label">Em jornada</span>
        <strong className="big">{inShiftCount}</strong>
        <span className="kpi-foot">Registros em andamento</span>
      </div>

      <div className="card kpi-card warn">
        <div className="kpi-top">
          <div className="kpi-icon-badge red" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <span className="badge bad">
            {openOccsCount > 0 ? "Requer ação" : "Em dia"}
          </span>
        </div>
        <span className="kpi-label">Exigem atenção</span>
        <strong className="big red-num">{openOccsCount}</strong>
        <span className="kpi-foot">Ocorrências abertas</span>
      </div>
    </section>
  );
}
