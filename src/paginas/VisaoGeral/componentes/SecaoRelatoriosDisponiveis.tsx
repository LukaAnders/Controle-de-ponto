import { useState } from "react";
import { depts, formatDateBR, typeLabel } from "../../../dados/dadosSimulados";
import { Employee, Mode, Occ, Rec, Role } from "../../../tipos";
import {
  PeriodKey,
  computeDashboardAnalytics,
  exportReportToCsv,
  formatHours,
} from "../dadosAnaliticos";
import "../VisaoGeral.css";

export type ReportModelId =
  | "frequencia"
  | "horas"
  | "ocorrencias"
  | "modalidades";

interface ReportCardDef {
  id: ReportModelId;
  code: string;
  title: string;
  subtitle: string;
  columnsSummary: string;
}

const REPORT_MODELS: ReportCardDef[] = [
  {
    id: "frequencia",
    code: "REL-01",
    title: "Frequência dos funcionários",
    subtitle:
      "Consolidação de presença, dias trabalhados, faltas, atrasos e taxa de assiduidade nominal.",
    columnsSummary:
      "Funcionário · Matrícula · Setor · Dias trabalhados · Faltas · Atrasos · % Frequência",
  },
  {
    id: "horas",
    code: "REL-02",
    title: "Horas trabalhadas e saldo",
    subtitle:
      "Comparativo entre carga horária prevista, horas realizadas, horas extras e saldo demonstrativo.",
    columnsSummary:
      "Funcionário · Setor · Horas previstas · Horas realizadas · Horas extras · Saldo",
  },
  {
    id: "ocorrencias",
    code: "REL-03",
    title: "Ocorrências e justificativas",
    subtitle:
      "Relação detalhada de inconsistências, pedidos de abono, status e responsável pela deliberação.",
    columnsSummary:
      "Funcionário · Tipo · Data · Descrição · Status · Justificativa · Responsável",
  },
  {
    id: "modalidades",
    code: "REL-04",
    title: "Registros por modalidade",
    subtitle:
      "Volume e percentual de utilização entre Ponto Digital, Catraca Biométrica e Relógio Convencional.",
    columnsSummary:
      "Modalidade · Registros de ponto · Eventos de acesso · % Utilização · Período",
  },
];

interface SecaoRelatoriosDisponiveisProps {
  employees: Employee[];
  occs: Occ[];
  recs: Rec[];
  initialPeriod: PeriodKey;
  initialDept: string;
  initialMode: string;
  role: Role;
  notify: (msg: string) => void;
}

export default function SecaoRelatoriosDisponiveis({
  employees,
  occs,
  recs,
  initialPeriod,
  initialDept,
  initialMode,
  role,
  notify,
}: SecaoRelatoriosDisponiveisProps) {
  const [activeReport, setActiveReport] = useState<ReportModelId | null>(null);

  // Filtros internos do visualizador de relatórios
  const [repPeriod, setRepPeriod] = useState<PeriodKey>(initialPeriod);
  const [repDept, setRepDept] = useState<string>(initialDept);
  const [repEmpId, setRepEmpId] = useState<string>("");
  const [repMode, setRepMode] = useState<string>(initialMode);
  const [repStatus, setRepStatus] = useState<string>("");

  const openReport = (id: ReportModelId) => {
    setRepPeriod(initialPeriod);
    setRepDept(initialDept);
    setRepMode(initialMode);
    setRepEmpId("");
    setRepStatus("");
    setActiveReport(id);
  };

  // Filtra funcionários de acordo com os filtros ativos no relatório
  const filteredEmps = employees.filter(
    (e) =>
      (!repDept || e.dept === repDept) &&
      (!repEmpId || e.id === repEmpId) &&
      (!repMode || e.mode === (repMode as Mode)) &&
      (!repStatus ||
        repStatus === "all" ||
        (repStatus === "Ativo" && e.active) ||
        (repStatus === "Inativo" && !e.active)),
  );

  const repAnalytics = computeDashboardAnalytics(
    filteredEmps,
    occs,
    recs,
    repPeriod,
  );

  const visibleEmpIds = new Set(filteredEmps.map((e) => e.id));

  const filteredOccs = occs.filter((o) => {
    if (!visibleEmpIds.has(o.empId)) return false;
    if (
      repStatus &&
      repStatus !== "Ativo" &&
      repStatus !== "Inativo" &&
      o.status !== repStatus
    ) {
      return false;
    }
    return true;
  });

  const handleExportCsv = () => {
    if (!activeReport) return;

    if (activeReport === "frequencia") {
      exportReportToCsv(
        `relatorio_frequencia_${repPeriod}.csv`,
        [
          "Nome do funcionário",
          "Matrícula",
          "Setor",
          "Modalidade",
          "Dias trabalhados",
          "Faltas",
          "Atrasos",
          "Percentual de frequência",
        ],
        repAnalytics.employeeRows.map((r) => [
          r.emp.name,
          r.emp.reg,
          r.emp.dept,
          r.emp.mode,
          r.workedDays,
          r.absences,
          r.delays,
          `${r.attendancePct}%`,
        ]),
      );
      notify("Relatório de Frequência exportado em CSV com sucesso.");
    } else if (activeReport === "horas") {
      exportReportToCsv(
        `relatorio_horas_trabalhadas_${repPeriod}.csv`,
        [
          "Funcionário",
          "Matrícula",
          "Setor",
          "Horas previstas",
          "Horas realizadas",
          "Horas extras",
          "Saldo de horas demonstrativo",
        ],
        repAnalytics.employeeRows.map((r) => [
          r.emp.name,
          r.emp.reg,
          r.emp.dept,
          formatHours(r.expectedHours),
          formatHours(r.workedHours),
          formatHours(r.overtimeHours),
          formatHours(r.balanceHours, true),
        ]),
      );
      notify("Relatório de Horas Trabalhadas exportado em CSV com sucesso.");
    } else if (activeReport === "ocorrencias") {
      exportReportToCsv(
        `relatorio_ocorrencias_justificativas.csv`,
        [
          "Funcionário",
          "Setor",
          "Tipo da ocorrência",
          "Data",
          "Descrição",
          "Status",
          "Justificativa",
          "Responsável pela análise",
        ],
        filteredOccs.map((o) => {
          const emp = employees.find((e) => e.id === o.empId);
          const lastAudit =
            o.history.length > 1 ? o.history[o.history.length - 1].by : "Aguardando RH";
          return [
            emp?.name ?? "Colaborador",
            emp?.dept ?? "—",
            typeLabel[o.type],
            formatDateBR(o.date),
            o.summary,
            o.status,
            o.justification,
            lastAudit,
          ];
        }),
      );
      notify("Relatório de Ocorrências exportado em CSV com sucesso.");
    } else if (activeReport === "modalidades") {
      exportReportToCsv(
        `relatorio_registros_modalidade_${repPeriod}.csv`,
        [
          "Modalidade de registro",
          "Quantidade de registros de ponto",
          "Eventos exclusivos de acesso físico",
          "Percentual de utilização",
          "Período analisado",
        ],
        repAnalytics.modalityUsage.map((m) => [
          m.label,
          m.punchCount,
          m.accessOnlyCount,
          `${m.pct}%`,
          repAnalytics.periodRangeLabel,
        ]),
      );
      notify("Relatório de Modalidades exportado em CSV com sucesso.");
    }
  };

  const currentModelDef = REPORT_MODELS.find((m) => m.id === activeReport);

  return (
    <section
      className="admin-panel"
      aria-labelledby="available-reports-heading"
    >
      <div className="admin-section-bar">
        <div>
          <h2 id="available-reports-heading" className="admin-section-title">
            Relatórios disponíveis
          </h2>
          <span className="admin-section-meta">
            Modelos estruturados para conferência gerencial, auditoria de
            jornada e exportação em CSV
          </span>
        </div>
        <span className="badge">4 modelos padronizados</span>
      </div>

      <div className="reports-cards-grid">
        {REPORT_MODELS.map((rep) => {
          const isOpen = activeReport === rep.id;
          return (
            <div
              key={rep.id}
              className={`report-model-card ${isOpen ? "active" : ""}`}
            >
              <div className="report-model-top">
                <span className="report-code-tag">{rep.code}</span>
                <button
                  type="button"
                  className={`btn ${isOpen ? "primary" : "primary-outline"} report-open-btn`}
                  onClick={() =>
                    isOpen ? setActiveReport(null) : openReport(rep.id)
                  }
                >
                  {isOpen ? "Fechar visualização" : "Visualizar relatório"}
                </button>
              </div>
              <h3 className="report-model-title">{rep.title}</h3>
              <p className="report-model-desc">{rep.subtitle}</p>
              <small className="report-model-cols">{rep.columnsSummary}</small>
            </div>
          );
        })}
      </div>

      {/* Painel de Visualização do Relatório Selecionado */}
      {activeReport && currentModelDef && (
        <div
          className="report-viewer-box"
          role="region"
          aria-label={`Visualização de ${currentModelDef.title}`}
        >
          <div className="report-viewer-header">
            <div>
              <span className="report-code-tag">{currentModelDef.code}</span>
              <h3 className="report-viewer-title">
                Modelo de Relatório: {currentModelDef.title}
              </h3>
              <span className="report-viewer-sub">
                Período analisado:{" "}
                <strong>{repAnalytics.periodRangeLabel}</strong>
              </span>
            </div>

            <div className="report-viewer-actions">
              <button
                type="button"
                className="btn primary"
                onClick={handleExportCsv}
              >
                Exportar CSV
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => window.print()}
              >
                Imprimir
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => setActiveReport(null)}
              >
                Fechar ✕
              </button>
            </div>
          </div>

          {/* Barra de Filtros do Relatório */}
          <div className="report-filters-bar">
            <label className="report-filter-item">
              <span>Período</span>
              <select
                value={repPeriod}
                onChange={(e) => setRepPeriod(e.target.value as PeriodKey)}
              >
                <option value="dia">Hoje (26/10/2026)</option>
                <option value="semana">Semana (20/10 a 26/10)</option>
                <option value="mes">Mês (Outubro/2026)</option>
              </select>
            </label>

            <label className="report-filter-item">
              <span>Setor</span>
              <select
                value={repDept}
                disabled={role === "gestor"}
                onChange={(e) => setRepDept(e.target.value)}
              >
                <option value="">Todos os setores</option>
                {depts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>

            <label className="report-filter-item">
              <span>Funcionário</span>
              <select
                value={repEmpId}
                onChange={(e) => setRepEmpId(e.target.value)}
              >
                <option value="">Todos os funcionários</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} (Mat. {e.reg})
                  </option>
                ))}
              </select>
            </label>

            <label className="report-filter-item">
              <span>Modalidade</span>
              <select
                value={repMode}
                onChange={(e) => setRepMode(e.target.value)}
              >
                <option value="">Todas</option>
                <option value="Presencial">Presencial</option>
                <option value="Híbrido">Híbrido</option>
                <option value="Remoto">Remoto</option>
              </select>
            </label>

            <label className="report-filter-item">
              <span>Status</span>
              <select
                value={repStatus}
                onChange={(e) => setRepStatus(e.target.value)}
              >
                <option value="">Todos</option>
                {activeReport === "ocorrencias" ? (
                  <>
                    <option value="Pendente">Pendente</option>
                    <option value="Em análise">Em análise</option>
                    <option value="Aprovada">Aprovada</option>
                    <option value="Rejeitada">Rejeitada</option>
                  </>
                ) : (
                  <>
                    <option value="Ativo">Cadastro Ativo</option>
                    <option value="Inativo">Cadastro Inativo</option>
                  </>
                )}
              </select>
            </label>
          </div>

          {/* Tabela do Relatório 1 — Frequência dos funcionários */}
          {activeReport === "frequencia" && (
            <div className="scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nome do funcionário</th>
                    <th>Matrícula</th>
                    <th>Setor</th>
                    <th>Dias trabalhados</th>
                    <th>Faltas</th>
                    <th>Atrasos</th>
                    <th>Percentual de frequência</th>
                  </tr>
                </thead>
                <tbody>
                  {repAnalytics.employeeRows.map((row) => (
                    <tr key={row.emp.id}>
                      <td>
                        <strong>{row.emp.name}</strong>
                        {!row.emp.active && (
                          <span className="badge bad" style={{ marginLeft: 8 }}>
                            Inativo
                          </span>
                        )}
                      </td>
                      <td>{row.emp.reg}</td>
                      <td>{row.emp.dept}</td>
                      <td>
                        {row.workedDays} de {row.expectedDays}
                      </td>
                      <td>{row.absences}</td>
                      <td>{row.delays}</td>
                      <td>
                        <span
                          className={`badge ${
                            !row.emp.active
                              ? ""
                              : row.attendancePct >= 95
                                ? "ok"
                                : row.attendancePct >= 85
                                  ? "warn"
                                  : "bad"
                          }`}
                        >
                          {row.emp.active ? `${row.attendancePct}%` : "Inativo"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {repAnalytics.employeeRows.length === 0 && (
                    <tr>
                      <td colSpan={7} className="empty-cell">
                        Nenhum registro encontrado para os filtros selecionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Tabela do Relatório 2 — Horas trabalhadas */}
          {activeReport === "horas" && (
            <div className="scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Funcionário</th>
                    <th>Setor</th>
                    <th>Horas previstas</th>
                    <th>Horas realizadas</th>
                    <th>Horas extras</th>
                    <th>Saldo de horas demonstrativo</th>
                  </tr>
                </thead>
                <tbody>
                  {repAnalytics.employeeRows.map((row) => (
                    <tr key={row.emp.id}>
                      <td>
                        <strong>{row.emp.name}</strong>
                        <div className="cell-sub">
                          Mat. {row.emp.reg} · {row.emp.schedule}
                        </div>
                      </td>
                      <td>{row.emp.dept}</td>
                      <td>{formatHours(row.expectedHours)}</td>
                      <td>
                        <strong>{formatHours(row.workedHours)}</strong>
                      </td>
                      <td>{formatHours(row.overtimeHours)}</td>
                      <td>
                        <span
                          className={`badge ${
                            row.balanceHours > 0
                              ? "ok"
                              : row.balanceHours < 0
                                ? "bad"
                                : ""
                          }`}
                        >
                          {formatHours(row.balanceHours, true)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {repAnalytics.employeeRows.length === 0 && (
                    <tr>
                      <td colSpan={6} className="empty-cell">
                        Nenhum registro encontrado para os filtros selecionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Tabela do Relatório 3 — Ocorrências e justificativas */}
          {activeReport === "ocorrencias" && (
            <div className="scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Funcionário</th>
                    <th>Tipo da ocorrência</th>
                    <th>Data</th>
                    <th>Descrição</th>
                    <th>Status</th>
                    <th>Justificativa</th>
                    <th>Responsável pela análise</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOccs.map((o) => {
                    const emp = employees.find((e) => e.id === o.empId);
                    const respAudit =
                      o.history.length > 1
                        ? o.history[o.history.length - 1].by
                        : "Pendente de deliberação (RH)";
                    return (
                      <tr key={o.id}>
                        <td>
                          <strong>{emp?.name ?? "Colaborador"}</strong>
                          {emp && (
                            <div className="cell-sub">
                              Mat. {emp.reg} · {emp.dept}
                            </div>
                          )}
                        </td>
                        <td>{typeLabel[o.type]}</td>
                        <td>{formatDateBR(o.date)}</td>
                        <td>{o.summary}</td>
                        <td>
                          <span
                            className={`badge ${
                              o.status === "Aprovada"
                                ? "ok"
                                : o.status === "Rejeitada"
                                  ? "bad"
                                  : o.status === "Pendente"
                                    ? "warn"
                                    : "info"
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="report-justif-cell">
                          {o.justification}
                        </td>
                        <td>{respAudit}</td>
                      </tr>
                    );
                  })}
                  {filteredOccs.length === 0 && (
                    <tr>
                      <td colSpan={7} className="empty-cell">
                        Nenhuma ocorrência encontrada para os filtros
                        selecionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Tabela do Relatório 4 — Registros por modalidade */}
          {activeReport === "modalidades" && (
            <div className="scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Modalidade de registro</th>
                    <th>Quantidade de registros (Jornada)</th>
                    <th>Eventos exclusivos de acesso físico</th>
                    <th>Percentual de utilização</th>
                    <th>Período analisado</th>
                  </tr>
                </thead>
                <tbody>
                  {repAnalytics.modalityUsage.map((m) => (
                    <tr key={m.modality}>
                      <td>
                        <strong>{m.label}</strong>
                        <div className="cell-sub">{m.description}</div>
                      </td>
                      <td>
                        <strong>{m.punchCount}</strong> registros de ponto
                      </td>
                      <td>
                        {m.accessOnlyCount > 0
                          ? `${m.accessOnlyCount} eventos de portaria (sem impacto na jornada)`
                          : "0 (não aplicável)"}
                      </td>
                      <td>
                        <span className="badge info">{m.pct}%</span>
                      </td>
                      <td>{repAnalytics.periodRangeLabel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
