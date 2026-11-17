import { Users, Clock, AlertTriangle, Fingerprint, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Page } from "../../../tipos";
import { DashboardAnalytics, formatHours } from "../dadosAnaliticos";

interface KpiCardsProps {
  analytics: DashboardAnalytics;
  go: (p: Page, q?: Record<string, string>) => void;
}

export default function KpiCards({ analytics, go }: KpiCardsProps) {
  const digMod = analytics.modalityUsage.find((m) => m.modality === "Digital");
  const catMod = analytics.modalityUsage.find((m) => m.modality === "Catraca");
  const convMod = analytics.modalityUsage.find(
    (m) => m.modality === "Convencional",
  );

  const attendanceTone =
    analytics.attendancePct >= analytics.attendanceTargetPct
      ? "is-ok"
      : analytics.attendancePct >= 85
        ? "is-blue"
        : "is-warn";

  const hasDelta = analytics.attendanceDeltaPct !== null;
  const delta = analytics.attendanceDeltaPct ?? 0;

  return (
    <section
      className="admin-summary-section"
      aria-label="Indicadores principais de frequência, jornada, ocorrências e modalidades"
    >
      <div className="admin-section-bar">
        <div>
          <h2 className="admin-section-title">{analytics.periodLabel}</h2>
        </div>
        <span className="kpi-period-pill">
          <strong>{analytics.periodRangeLabel}</strong>
        </span>
      </div>

      <div className="admin-summary-strip kpi-strip-4">
        {/* 1. Frequência */}
        <button
          type="button"
          className="admin-summary-item kpi-clickable"
          onClick={() => go("employees")}
          title="Consultar situação dos funcionários"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-with-icon">
              <Users size={15} strokeWidth={2} aria-hidden="true" />
              <span className="admin-summary-label">Frequência no período</span>
            </span>
            <span
              className={`badge ${
                analytics.attendancePct >= analytics.attendanceTargetPct
                  ? "ok"
                  : "warn"
              }`}
            >
              {analytics.presentEmployeesCount}/{analytics.activeEmployeesCount}{" "}
              presentes
            </span>
          </div>

          <div className="kpi-value-row">
            <strong className={`admin-summary-value ${attendanceTone}`}>
              {analytics.attendancePct}%
            </strong>
            {hasDelta && (
              <span
                className={`kpi-delta-pill ${
                  delta > 0 ? "up" : delta < 0 ? "down" : "flat"
                }`}
                title={`Comparação com início/janela anterior do período (${analytics.previousAttendancePct}%)`}
              >
                {delta > 0 ? (
                  <ArrowUpRight size={13} aria-hidden="true" />
                ) : delta < 0 ? (
                  <ArrowDownRight size={13} aria-hidden="true" />
                ) : null}
                {delta > 0 ? `+${delta} pp` : delta < 0 ? `${delta} pp` : "Estável"}
              </span>
            )}
          </div>

          <div className="kpi-meta-grid">
            <span>
              Meta: <strong>{analytics.attendanceTargetPct}%</strong>
            </span>
            <span>
              Em turno: <strong>{analytics.inShiftCount}</strong>/{analytics.activeEmployeesCount}
            </span>
          </div>
        </button>

        {/* 2. Horas registradas */}
        <button
          type="button"
          className="admin-summary-item kpi-clickable"
          onClick={() => go("punch")}
          title="Abrir Central de Ponto"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-with-icon">
              <Clock size={15} strokeWidth={2} aria-hidden="true" />
              <span className="admin-summary-label">Horas registradas</span>
            </span>
            <span
              className={`badge ${
                analytics.totalBalanceHours >= 0 ? "ok" : "warn"
              }`}
            >
              Saldo: {formatHours(analytics.totalBalanceHours, true)}
            </span>
          </div>

          <div className="kpi-value-row">
            <strong className="admin-summary-value">
              {formatHours(analytics.totalWorkedHours)}
            </strong>
            <span className="kpi-sub-metric">
              Média {formatHours(analytics.avgWorkedHoursPerEmp)}/colab.
            </span>
          </div>

          <div className="kpi-meta-grid kpi-meta-3">
            <span>
              Previstas: <strong>{formatHours(analytics.totalExpectedHours)}</strong>
            </span>
            <span>
              Realizadas: <strong>{formatHours(analytics.totalWorkedHours)}</strong>
            </span>
            <span className={analytics.totalOvertimeHours > 0 ? "tx-blue" : ""}>
              Extras: <strong>{formatHours(analytics.totalOvertimeHours)}</strong>
            </span>
          </div>
        </button>

        {/* 3. Ocorrências */}
        <button
          type="button"
          className="admin-summary-item kpi-clickable"
          onClick={() =>
            go("occurrences", analytics.openOccurrences > 0 ? { open: "1" } : {})
          }
          title="Gerenciar ocorrências e justificativas"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-with-icon">
              <AlertTriangle size={15} strokeWidth={2} aria-hidden="true" />
              <span className="admin-summary-label">Ocorrências</span>
            </span>
            <span
              className={`badge ${analytics.openOccurrences > 0 ? "bad" : "ok"}`}
            >
              {analytics.openOccurrences} em aberto
            </span>
          </div>

          <div className="kpi-value-row">
            <strong
              className={`admin-summary-value ${
                analytics.openOccurrences > 0 ? "is-danger" : "is-ok"
              }`}
            >
              {analytics.totalOccurrences}
            </strong>
            <span className="kpi-sub-metric">
              {analytics.resolvedOccurrences} resolvidas
            </span>
          </div>

          <div className="kpi-meta-grid">
            <span>
              Incompletos: <strong>{analytics.incompleteCount}</strong>
            </span>
            <span>
              Atrasos/faltas: <strong>{analytics.delaysAndAbsencesCount}</strong>
            </span>
          </div>
        </button>

        {/* 4. Registros de ponto */}
        <button
          type="button"
          className="admin-summary-item kpi-clickable"
          onClick={() => go("punch")}
          title="Consultar registros de ponto"
        >
          <div className="kpi-top-row">
            <span className="kpi-label-with-icon">
              <Fingerprint size={15} strokeWidth={2} aria-hidden="true" />
              <span className="admin-summary-label">Registros de ponto</span>
            </span>
            <span className="badge">
              +{analytics.totalAccessOnlyRecords} acessos físicos
            </span>
          </div>

          <div className="kpi-value-row">
            <strong className="admin-summary-value">
              {analytics.totalPunchRecords}
            </strong>
            <span className="kpi-sub-metric">marcações válidas</span>
          </div>

          <div className="kpi-meta-grid kpi-meta-3">
            <span>
              Digital: <strong>{digMod?.punchCount ?? 0}</strong>
            </span>
            <span>
              Catraca: <strong>{catMod?.punchCount ?? 0}</strong>
            </span>
            <span>
              Relógio: <strong>{convMod?.punchCount ?? 0}</strong>
            </span>
          </div>
        </button>
      </div>
    </section>
  );
}
