import { useState } from "react";
import {
  DashboardAnalytics,
  EmployeeMetricsRow,
  FrequencyPoint,
  formatHours,
} from "../dadosAnaliticos";
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
  const [hoveredEmp, setHoveredEmp] = useState<EmployeeMetricsRow | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<FrequencyPoint | null>(null);
  const [hoveredOccKey, setHoveredOccKey] = useState<string | null>(null);

  const activeEmpRows = analytics.employeeRows.filter((r) => r.emp.active);
  const belowTargetCount = activeEmpRows.filter(
    (r) => r.attendancePct < analytics.attendanceTargetPct,
  ).length;

  const maxHoursChart = Math.max(
    10,
    ...activeEmpRows.map((r) => Math.max(r.expectedHours, r.workedHours)),
  );

  // Rosca SVG de Ocorrências por tipo
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPct = 0;

  // Gráfico SVG de Evolução da Frequência
  const svgW = 460;
  const svgH = 190;
  const padL = 36;
  const padR = 16;
  const padT = 18;
  const padB = 34;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const series = analytics.frequencySeries;
  const coords = series.map((pt, idx) => {
    const x =
      series.length > 1
        ? padL + (idx / (series.length - 1)) * plotW
        : padL + plotW / 2;
    const y = padT + ((100 - pt.pct) / 100) * plotH;
    return { ...pt, x, y };
  });

  const linePath = coords
    .map((c, idx) => `${idx === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ");

  const areaPath =
    coords.length > 0
      ? `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${(padT + plotH).toFixed(1)} L ${coords[0].x.toFixed(1)} ${(padT + plotH).toFixed(1)} Z`
      : "";

  const targetY = padT + ((100 - analytics.attendanceTargetPct) / 100) * plotH;

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
            Indicadores individuais, evolução temporal e distribuição por categoria
          </span>
        </div>

        <div
          className="chart-view-tabs"
          role="tablist"
          aria-label="Alternar visão por colaborador"
        >
          <button
            type="button"
            role="tab"
            aria-selected={leftTab === "frequencia"}
            className={`chart-tab-btn ${leftTab === "frequencia" ? "active" : ""}`}
            onClick={() => setLeftTab("frequencia")}
          >
            Frequência dos funcionários
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={leftTab === "horas"}
            className={`chart-tab-btn ${leftTab === "horas" ? "active" : ""}`}
            onClick={() => setLeftTab("horas")}
          >
            Horas trabalhadas
          </button>
        </div>
      </div>

      {/* Linha superior: Frequência dos funcionários (ou Horas) + Evolução temporal */}
      <div className="charts-grid-top">
        {/* PAINEL ESQUERDO */}
        <div className="chart-panel">
          {leftTab === "frequencia" ? (
            <>
              <div className="chart-panel-header">
                <div>
                  <h3 className="chart-title">Frequência dos funcionários</h3>
                  <span className="chart-subtitle">
                    Meta operacional: {analytics.attendanceTargetPct}% · Clique no
                    colaborador para consultar
                  </span>
                </div>
                <div className="chart-kpi-badges">
                  <span
                    className={`badge ${belowTargetCount > 0 ? "warn" : "ok"}`}
                  >
                    {belowTargetCount > 0
                      ? `${belowTargetCount} abaixo da meta`
                      : "Todos na meta"}
                  </span>
                </div>
              </div>

              <div className="emp-freq-chart-wrap">
                <div className="emp-freq-axis-header">
                  <span>Colaborador</span>
                  <div className="emp-freq-scale">
                    <span>0%</span>
                    <span>50%</span>
                    <span className="emp-freq-meta-label">
                      Meta {analytics.attendanceTargetPct}%
                    </span>
                    <span>100%</span>
                  </div>
                </div>

                <div className="emp-freq-rows">
                  {activeEmpRows.map((row) => {
                    const tone =
                      row.attendancePct >= analytics.attendanceTargetPct
                        ? "ok"
                        : row.attendancePct >= 85
                          ? "warn"
                          : "bad";
                    const isHovered = hoveredEmp?.emp.id === row.emp.id;

                    return (
                      <button
                        key={row.emp.id}
                        type="button"
                        className={`emp-freq-row ${isHovered ? "hovered" : ""}`}
                        onMouseEnter={() => setHoveredEmp(row)}
                        onMouseLeave={() => setHoveredEmp(null)}
                        onFocus={() => setHoveredEmp(row)}
                        onBlur={() => setHoveredEmp(null)}
                        onClick={() =>
                          go(row.incompleteCount > 0 ? "occurrences" : "employees")
                        }
                      >
                        <div className="emp-freq-info">
                          <strong>{row.emp.name}</strong>
                          <small>{row.emp.dept}</small>
                        </div>

                        <div className="emp-freq-bar-area">
                          <div
                            className="emp-freq-target-line"
                            style={{ left: `${analytics.attendanceTargetPct}%` }}
                            aria-hidden="true"
                          />
                          <div className="emp-freq-track">
                            <div
                              className={`emp-freq-fill tone-${tone}`}
                              style={{ width: `${row.attendancePct}%` }}
                            />
                          </div>
                        </div>

                        <span className={`emp-freq-pct tone-${tone}`}>
                          {row.attendancePct}%
                        </span>
                      </button>
                    );
                  })}

                  {activeEmpRows.length === 0 && (
                    <div className="chart-empty-state">
                      Nenhum funcionário ativo para os filtros selecionados.
                    </div>
                  )}
                </div>

                <div className="chart-detail-bar" aria-live="polite">
                  {hoveredEmp ? (
                    <>
                      <strong>{hoveredEmp.emp.name}</strong> ({hoveredEmp.emp.dept}
                      ) — {hoveredEmp.workedDays}/{hoveredEmp.expectedDays} dias
                      trabalhados ({hoveredEmp.attendancePct}%),{" "}
                      {hoveredEmp.delays}{" "}
                      {hoveredEmp.delays === 1 ? "atraso" : "atrasos"},{" "}
                      {hoveredEmp.absences}{" "}
                      {hoveredEmp.absences === 1 ? "falta" : "faltas"}.
                    </>
                  ) : (
                    <span>
                      Passe o mouse sobre um colaborador para ver dias, atrasos e
                      faltas no período.
                    </span>
                  )}
                </div>
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
                    Comparativo individual de carga horária no período
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

        {/* PAINEL DIREITO: Evolução da frequência */}
        <div className="chart-panel">
          <div className="chart-panel-header">
            <div>
              <h3 className="chart-title">Evolução da frequência</h3>
              <span className="chart-subtitle">
                Taxa de presença ao longo do período selecionado
              </span>
            </div>
            <div className="chart-legend-inline">
              <span>
                <i className="legend-dot worked" /> Frequência
              </span>
              <span>
                <i className="legend-line-ref" /> Meta ({analytics.attendanceTargetPct}%)
              </span>
            </div>
          </div>

          <div className="trend-chart-box">
            <svg
              viewBox={`0 0 ${svgW} ${svgH}`}
              className="trend-svg"
              role="img"
              aria-label="Gráfico de linha de evolução temporal da frequência"
            >
              {/* Linhas de grade horizontais (0%, 50%, 100%) */}
              {[0, 50, 100].map((val) => {
                const y = padT + ((100 - val) / 100) * plotH;
                return (
                  <g key={val}>
                    <line
                      x1={padL}
                      y1={y}
                      x2={svgW - padR}
                      y2={y}
                      stroke="#e2e8f0"
                      strokeWidth="1"
                    />
                    <text
                      x={padL - 6}
                      y={y + 4}
                      textAnchor="end"
                      className="trend-axis-label"
                    >
                      {val}%
                    </text>
                  </g>
                );
              })}

              {/* Linha de referência da Meta (95%) */}
              <line
                x1={padL}
                y1={targetY}
                x2={svgW - padR}
                y2={targetY}
                stroke="#16a34a"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />

              {/* Área discreta sob a curva */}
              {areaPath && (
                <path
                  d={areaPath}
                  fill="rgba(37, 99, 235, 0.08)"
                />
              )}

              {/* Linha principal */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              )}

              {/* Pontos interativos + labels do eixo X */}
              {coords.map((pt) => {
                const isSelected = hoveredPoint?.label === pt.label;
                const below = pt.pct < analytics.attendanceTargetPct;
                return (
                  <g
                    key={pt.label}
                    className="trend-point-group"
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isSelected ? 5.5 : 4}
                      fill={below ? "#d97706" : "#2563eb"}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                    <text
                      x={pt.x}
                      y={pt.y - 9}
                      textAnchor="middle"
                      className="trend-point-val"
                    >
                      {pt.pct}%
                    </text>
                    <text
                      x={pt.x}
                      y={svgH - 14}
                      textAnchor="middle"
                      className="trend-axis-label"
                    >
                      {pt.label}
                    </text>
                    <text
                      x={pt.x}
                      y={svgH - 3}
                      textAnchor="middle"
                      className="trend-axis-sub"
                    >
                      {pt.subLabel}
                    </text>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="14"
                      fill="transparent"
                    />
                  </g>
                );
              })}
            </svg>

            <div className="chart-detail-bar" aria-live="polite">
              {hoveredPoint ? (
                <>
                  <strong>
                    {hoveredPoint.label} ({hoveredPoint.subLabel}):
                  </strong>{" "}
                  {hoveredPoint.present} de {hoveredPoint.active} ativos
                  presentes ({hoveredPoint.pct}%).
                  {analytics.previousAttendancePct !== null && (
                    <>
                      {" "}
                      Referência anterior:{" "}
                      <strong>{analytics.previousAttendancePct}%</strong>.
                    </>
                  )}
                </>
              ) : (
                <span>
                  Passe o mouse sobre os pontos da linha para detalhar a
                  presença por intervalo.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Linha inferior: Ocorrências por tipo + Modalidades */}
      <div className="charts-grid-bottom-split">
        <div className="chart-panel">
          <div className="chart-panel-header">
            <div>
              <h3 className="chart-title">Ocorrências por tipo</h3>
              <span className="chart-subtitle">
                Clique em uma categoria para abrir os registros relacionados
              </span>
            </div>
            <button
              type="button"
              className="admin-link-btn"
              onClick={() => go("occurrences")}
            >
              Ver todas →
            </button>
          </div>

          <div className="donut-chart-layout">
            <div className="donut-svg-wrap">
              <svg
                width="142"
                height="142"
                viewBox="0 0 142 142"
                role="img"
                aria-label="Gráfico de rosca de ocorrências por tipo"
              >
                <circle
                  cx="71"
                  cy="71"
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
                    const isHovered = hoveredOccKey === slice.key;

                    return (
                      <circle
                        key={slice.key}
                        cx="71"
                        cy="71"
                        r={radius}
                        fill="none"
                        stroke={slice.color}
                        strokeWidth={isHovered ? "21" : "18"}
                        strokeDasharray={`${strokeLength} ${circumference}`}
                        strokeDashoffset={strokeOffset}
                        transform="rotate(-90 71 71)"
                        style={{ cursor: "pointer", transition: "stroke-width 0.15s ease" }}
                        onMouseEnter={() => setHoveredOccKey(slice.key)}
                        onMouseLeave={() => setHoveredOccKey(null)}
                        onClick={() => go("occurrences", { type: slice.key })}
                      >
                        <title>{`${slice.label}: ${slice.count} (${slice.pct}%)`}</title>
                      </circle>
                    );
                  })}
                <text
                  x="71"
                  y="67"
                  textAnchor="middle"
                  className="donut-center-num"
                >
                  {analytics.totalOccurrences}
                </text>
                <text
                  x="71"
                  y="84"
                  textAnchor="middle"
                  className="donut-center-label"
                >
                  registros
                </text>
              </svg>
            </div>

            <div className="donut-legend">
              {analytics.occDistribution.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={`donut-legend-item donut-legend-clickable ${
                    hoveredOccKey === item.key ? "hovered" : ""
                  }`}
                  onMouseEnter={() => setHoveredOccKey(item.key)}
                  onMouseLeave={() => setHoveredOccKey(null)}
                  onClick={() => go("occurrences", { type: item.key })}
                >
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
                </button>
              ))}

              <div className="donut-summary-foot">
                <span>
                  Resolvidas:{" "}
                  <strong>{analytics.resolvedOccurrences}</strong>
                </span>
                <span>
                  Em aberto:{" "}
                  <strong>{analytics.openOccurrences}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        <ModalityDistribution analytics={analytics} go={go} />
      </div>
    </section>
  );
}
