import { DashboardAnalytics, formatHours } from "../dadosAnaliticos";

interface KpiCardsProps {
  analytics: DashboardAnalytics;
}

export default function KpiCards({ analytics }: KpiCardsProps) {
  const digMod = analytics.modalityUsage.find((m) => m.modality === "Digital");
  const catMod = analytics.modalityUsage.find((m) => m.modality === "Catraca");
  const convMod = analytics.modalityUsage.find(
    (m) => m.modality === "Convencional",
  );

  return (
    <section
      className="admin-summary-section"
      aria-label="Indicadores principais de frequência, jornada, ocorrências e modalidades"
    >
      <div className="admin-section-bar">
        <div>
          <h2 className="admin-section-title">{analytics.periodLabel}</h2>
          <span className="admin-section-meta">
            Indicadores consolidados de frequência, horas trabalhadas,
            ocorrências e meios de registro
          </span>
        </div>
        <span className="kpi-period-pill">
          Período: <strong>{analytics.periodRangeLabel}</strong>
        </span>
      </div>

      <div className="admin-summary-strip kpi-strip-4">
        {/* 1. Frequência */}
        <div className="admin-summary-item">
          <div className="kpi-top-row">
            <span className="admin-summary-label">Frequência no período</span>
            <span
              className={`badge ${analytics.attendancePct >= 90 ? "ok" : "warn"}`}
            >
              {analytics.presentEmployeesCount}/{analytics.activeEmployeesCount}{" "}
              presentes
            </span>
          </div>
          <strong className="admin-summary-value is-blue">
            {analytics.attendancePct}%
          </strong>
          <span className="admin-summary-desc">
            {analytics.activeEmployeesCount} funcionários ativos ·{" "}
            {analytics.inShiftCount} em turno agora
          </span>
        </div>

        {/* 2. Jornada e Horas */}
        <div className="admin-summary-item">
          <div className="kpi-top-row">
            <span className="admin-summary-label">Horas registradas</span>
            <span className="badge info">
              Média: {formatHours(analytics.avgWorkedHoursPerEmp)}/colab.
            </span>
          </div>
          <strong className="admin-summary-value">
            {formatHours(analytics.totalWorkedHours)}
          </strong>
          <span className="admin-summary-desc">
            Previstas: {formatHours(analytics.totalExpectedHours)} · Extras:{" "}
            <strong>{formatHours(analytics.totalOvertimeHours)}</strong>
          </span>
        </div>

        {/* 3. Ocorrências */}
        <div className="admin-summary-item">
          <div className="kpi-top-row">
            <span className="admin-summary-label">
              Ocorrências ({analytics.totalOccurrences})
            </span>
            <span
              className={`badge ${analytics.openOccurrences > 0 ? "bad" : "ok"}`}
            >
              {analytics.openOccurrences} pendentes
            </span>
          </div>
          <strong
            className={`admin-summary-value ${
              analytics.openOccurrences > 0 ? "is-danger" : "is-ok"
            }`}
          >
            {analytics.openOccurrences}
          </strong>
          <span className="admin-summary-desc">
            {analytics.incompleteCount} incompletos ·{" "}
            {analytics.justificationsPendingCount} justif. pendentes ·{" "}
            {analytics.delaysAndAbsencesCount} atrasos/faltas
          </span>
        </div>

        {/* 4. Modalidades */}
        <div className="admin-summary-item">
          <div className="kpi-top-row">
            <span className="admin-summary-label">Registros de ponto</span>
            <span className="badge">
              +{analytics.totalAccessOnlyRecords} acessos físicos
            </span>
          </div>
          <strong className="admin-summary-value">
            {analytics.totalPunchRecords}
          </strong>
          <span className="admin-summary-desc">
            Digital: <strong>{digMod?.punchCount ?? 0}</strong> · Catraca:{" "}
            <strong>{catMod?.punchCount ?? 0}</strong> · Relógio:{" "}
            <strong>{convMod?.punchCount ?? 0}</strong>
          </span>
        </div>
      </div>
    </section>
  );
}
