import { useState } from "react";
import { DashboardAnalytics, formatHours } from "../dadosAnaliticos";
import { Page } from "../../../tipos";
import ModalityDistribution from "./DistribuicaoModalidades";
import "../VisaoGeral.css";

interface PainelGraficosAnaliticosProps {
  analytics: DashboardAnalytics;
  go: (p: Page, q?: Record<string, string>) => void;
}

export default function PainelGraficosAnaliticos({
  analytics,
  go,
}: PainelGraficosAnaliticosProps) {
  const [leftTab, setLeftTab] = useState<"frequencia" | "horas">("frequencia");

  // Cálculo de maior e menor frequência para destaque no Gráfico 1
  const freqValues = analytics.frequencySeries.map((p) => p.pct);
  const maxFreq = freqValues.length ? Math.max(...freqValues) : 0;
  const minFreq = freqValues.length ? Math.min(...freqValues) : 0;

  // Cálculo dos arcos do Gráfico de Rosca (SVG) para Ocorrências por tipo
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPct = 0;

  const activeEmpRows = analytics.employeeRows.filter((r) => r.emp.active);
  const maxHoursChart = Math.max(
    10,
    ...activeEmpRows.map((r) => Math.max(r.expectedHours, r.workedHours)),
  );

  return (
    <section
      className="admin-panel"
      aria-labelledby="charts-section-heading"
    >
      <div className="admin-section-bar">
        <div>
          <h2 id="charts-section-heading" className="admin-section-title">
            Análise gráfica de jornada e ocorrências
          </h2>
          <span className="admin-section-meta">
            Evolução da frequência, proporção de inconsistências e distribuição
            por modalidade de ponto
          </span>
        </div>

        <div
          className="chart-view-tabs"
          role="tablist"
          aria-label="Alternar gráfico de jornada"
        >
          <button
            type="button"
            role="tab"
            aria-selected={leftTab === "frequencia"}
            className={`chart-tab-btn ${leftTab === "frequencia" ? "active" : ""}`}
            onClick={() => setLeftTab("frequencia")}
          >
            Gráfico 1: Frequência
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={leftTab === "horas"}
            className={`chart-tab-btn ${leftTab === "horas" ? "active" : ""}`}
            onClick={() => setLeftTab("horas")}
          >
            Gráfico 4: Horas trabalhadas
          </button>
        </div>
      </div>

      <div className="charts-grid-top">
        {/* GRÁFICO 1 (ou GRÁFICO 4 na aba secundária) */}
        <div className="chart-panel">
          {leftTab === "frequencia" ? (
            <>
              <div className="chart-panel-header">
                <div>
                  <h3 className="chart-title">Frequência dos funcionários</h3>
                  <span className="chart-subtitle">
                    Evolução da presença dos colaboradores ativos ao longo do
                    período selecionado
                  </span>
                </div>
                <div className="chart-kpi-badges">
                  <span className="badge ok">Máx: {maxFreq}%</span>
                  <span className="badge warn">Mín: {minFreq}%</span>
                </div>
              </div>

              <div
                className="bar-chart-vertical"
                role="img"
                aria-label="Gráfico de barras de evolução da frequência dos funcionários"
              >
                {analytics.frequencySeries.map((pt) => {
                  const isMax = pt.pct === maxFreq && maxFreq > minFreq;
                  const isMin = pt.pct === minFreq && maxFreq > minFreq;
                  return (
                    <div key={pt.label} className="vbar-column">
                      <span className="vbar-value">{pt.pct}%</span>
                      <div className="vbar-track">
                        <div
                          className={`vbar-fill ${
                            isMin ? "is-min" : isMax ? "is-max" : ""
                          }`}
                          style={{ height: `${Math.max(pt.pct, 6)}%` }}
                          title={`${pt.label} (${pt.subLabel}): ${pt.present}/${pt.active} presentes (${pt.pct}%)`}
                        />
                      </div>
                      <strong className="vbar-label">{pt.label}</strong>
                      <small className="vbar-sub">{pt.subLabel}</small>
                      <small className="vbar-count">
                        {pt.present}/{pt.active}
                      </small>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <div className="chart-panel-header">
                <div>
                  <h3 className="chart-title">
                    Horas trabalhadas (Previstas vs. Realizadas)
                  </h3>
                  <span className="chart-subtitle">
                    Comparativo individual de horas cumpridas no período (Total:{" "}
                    {formatHours(analytics.totalWorkedHours)} de{" "}
                    {formatHours(analytics.totalExpectedHours)})
                  </span>
                </div>
                <div className="chart-legend-inline">
                  <span>
                    <i className="legend-dot expected" /> Previstas
                  </span>
                  <span>
                    <i className="legend-dot worked" /> Realizadas
                  </span>
                </div>
              </div>

              <div className="hours-comparison-list">
                {activeEmpRows.map((row) => {
                  const expWidth = Math.round(
                    (row.expectedHours / maxHoursChart) * 100,
                  );
                  const wrkWidth = Math.round(
                    (row.workedHours / maxHoursChart) * 100,
                  );
                  return (
                    <div key={row.emp.id} className="hours-comp-row">
                      <div className="hours-comp-head">
                        <strong>
                          {row.emp.name}{" "}
                          <small>({row.emp.dept})</small>
                        </strong>
                        <span>
                          {formatHours(row.workedHours)} /{" "}
                          {formatHours(row.expectedHours)}{" "}
                          <b
                            className={
                              row.balanceHours >= 0 ? "tx-ok" : "tx-warn"
                            }
                          >
                            ({formatHours(row.balanceHours, true)})
                          </b>
                        </span>
                      </div>
                      <div className="hours-dual-bars">
                        <div
                          className="hbar expected"
                          style={{ width: `${Math.max(expWidth, 4)}%` }}
                          title={`Previstas: ${formatHours(row.expectedHours)}`}
                        />
                        <div
                          className={`hbar worked ${
                            row.workedHours < row.expectedHours ? "short" : ""
                          }`}
                          style={{ width: `${Math.max(wrkWidth, 4)}%` }}
                          title={`Realizadas: ${formatHours(row.workedHours)}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* GRÁFICO 2 — Ocorrências por tipo (Rosca SVG) */}
        <div className="chart-panel">
          <div className="chart-panel-header">
            <div>
              <h3 className="chart-title">Ocorrências por tipo</h3>
              <span className="chart-subtitle">
                Distribuição das {analytics.totalOccurrences} ocorrências e
                solicitações registradas
              </span>
            </div>
            <button
              type="button"
              className="admin-link-btn"
              onClick={() => go("occurrences")}
            >
              Ver ocorrências →
            </button>
          </div>

          <div className="donut-chart-layout">
            <div className="donut-svg-wrap">
              <svg
                width="148"
                height="148"
                viewBox="0 0 148 148"
                role="img"
                aria-label="Gráfico de rosca de ocorrências por tipo"
              >
                <circle
                  cx="74"
                  cy="74"
                  r={radius}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="18"
                />
                {analytics.totalOccurrences > 0 &&
                  analytics.occDistribution.map((slice) => {
                    const strokeLength = (slice.pct / 100) * circumference;
                    const strokeOffset =
                      circumference - (accumulatedPct / 100) * circumference;
                    accumulatedPct += slice.pct;

                    return (
                      <circle
                        key={slice.key}
                        cx="74"
                        cy="74"
                        r={radius}
                        fill="none"
                        stroke={slice.color}
                        strokeWidth="18"
                        strokeDasharray={`${strokeLength} ${circumference}`}
                        strokeDashoffset={strokeOffset}
                        transform="rotate(-90 74 74)"
                      />
                    );
                  })}
                <text
                  x="74"
                  y="70"
                  textAnchor="middle"
                  className="donut-center-num"
                >
                  {analytics.totalOccurrences}
                </text>
                <text
                  x="74"
                  y="88"
                  textAnchor="middle"
                  className="donut-center-label"
                >
                  registros
                </text>
              </svg>
            </div>

            <div className="donut-legend">
              {analytics.occDistribution.map((item) => (
                <div key={item.key} className="donut-legend-item">
                  <div className="donut-legend-left">
                    <span
                      className="donut-color-swatch"
                      style={{ background: item.color }}
                    />
                    <span className="donut-legend-name">{item.label}</span>
                  </div>
                  <div className="donut-legend-right">
                    <strong>{item.count}</strong>
                    <span>({item.pct}%)</span>
                  </div>
                </div>
              ))}

              <div className="donut-summary-foot">
                <span>
                  Atrasos/faltas computados no período:{" "}
                  <strong>{analytics.delaysAndAbsencesCount}</strong>
                </span>
                <span>
                  Pendentes de análise:{" "}
                  <strong>{analytics.openOccurrences}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GRÁFICO 3 — Registros por modalidade */}
      <div className="charts-grid-bottom">
        <ModalityDistribution analytics={analytics} go={go} />
      </div>
    </section>
  );
}
