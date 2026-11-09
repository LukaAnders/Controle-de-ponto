import { useState } from "react";
import { useApp } from "../../contexto/ContextoApp";
import { depts } from "../../dados/dadosSimulados";
import KpiCards from "./componentes/CartoesIndicadores";
import PainelGraficosAnaliticos from "./componentes/PainelGraficosAnaliticos";
import ResumoDiscussaoPeriodo from "./componentes/ResumoDiscussaoPeriodo";
import SecaoRelatoriosDisponiveis from "./componentes/SecaoRelatoriosDisponiveis";
import RhPrioritiesTable from "./componentes/TabelaPrioridadesRh";
import LiveTeamSidebar from "./componentes/PainelEquipeAoVivo";
import { PeriodKey, computeDashboardAnalytics } from "./dadosAnaliticos";
import "./VisaoGeral.css";

export default function Overview() {
  const { occs, employees, recs, go, role, notify } = useApp();
  const [period, setPeriod] = useState<PeriodKey>("semana");
  const [deptFilter, setDeptFilter] = useState("");
  const [modeFilter, setModeFilter] = useState("");

  const filteredEmployees = employees.filter(
    (e) =>
      (!deptFilter || e.dept === deptFilter) &&
      (!modeFilter || e.mode === modeFilter),
  );

  const visibleEmpIds = new Set(filteredEmployees.map((e) => e.id));

  const openOccs = occs.filter(
    (o) =>
      visibleEmpIds.has(o.empId) &&
      (o.status === "Pendente" || o.status === "Em análise"),
  );

  const analytics = computeDashboardAnalytics(
    filteredEmployees,
    occs,
    recs,
    period,
  );

  return (
    <div className="overview-admin-page">
      {/* A. Cabeçalho e atalhos rápidos */}
      <div className="overview-top-bar">
        <div className="overview-title-block">
          <h1>Visão operacional e indicadores</h1>
          <p className="sub">
            Central de resultados, análise gráfica e modelos de relatórios da
            gestão de jornada
          </p>
        </div>

        <div className="overview-top-actions">
          <button type="button" className="btn" onClick={() => go("punch")}>
            Central de Ponto
          </button>
          <button
            type="button"
            className="btn primary"
            onClick={() => go("occurrences", { open: "1" })}
          >
            Resolver pendências ({openOccs.length})
          </button>
        </div>
      </div>

      {/* B. Navegação por período e filtros administrativos */}
      <div className="overview-control-bar">
        <div className="period-tabs" role="tablist" aria-label="Período">
          <button
            type="button"
            role="tab"
            aria-selected={period === "dia"}
            className={`period-tab ${period === "dia" ? "active" : ""}`}
            onClick={() => setPeriod("dia")}
          >
            Hoje
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={period === "semana"}
            className={`period-tab ${period === "semana" ? "active" : ""}`}
            onClick={() => setPeriod("semana")}
          >
            Semana
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={period === "mes"}
            className={`period-tab ${period === "mes" ? "active" : ""}`}
            onClick={() => setPeriod("mes")}
          >
            Mês
          </button>
        </div>

        <div className="subbar-filters">
          <div className="control-filter-group">
            <label htmlFor="overview-dept-filter" className="sr-only-label">
              Setor:
            </label>
            <select
              id="overview-dept-filter"
              aria-label="Filtrar por setor"
              className="subbar-select"
              value={deptFilter}
              disabled={role === "gestor"}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="">Todos os setores</option>
              {depts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="control-filter-group">
            <label htmlFor="overview-mode-filter" className="sr-only-label">
              Modalidade:
            </label>
            <select
              id="overview-mode-filter"
              aria-label="Filtrar por modalidade"
              className="subbar-select"
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
            >
              <option value="">Todas as modalidades</option>
              <option value="Presencial">Presencial</option>
              <option value="Híbrido">Híbrido</option>
              <option value="Remoto">Remoto</option>
            </select>
          </div>

          {(deptFilter || modeFilter) && (
            <button
              type="button"
              className="btn admin-row-btn"
              onClick={() => {
                setDeptFilter("");
                setModeFilter("");
              }}
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* C. Indicadores principais (Frequência, Horas, Ocorrências, Modalidades) */}
      <KpiCards analytics={analytics} />

      {/* D. Gráficos analíticos (Frequência, Horas trabalhadas, Ocorrências por tipo e Modalidades) */}
      <PainelGraficosAnaliticos analytics={analytics} go={go} />

      {/* E. Resultados e Discussão (Interpretação objetiva dos dados do período) */}
      <ResumoDiscussaoPeriodo analytics={analytics} />

      {/* F. Modelos de Relatórios disponíveis com filtros e exportação CSV */}
      <SecaoRelatoriosDisponiveis
        employees={employees}
        occs={occs}
        recs={recs}
        initialPeriod={period}
        initialDept={deptFilter}
        initialMode={modeFilter}
        role={role}
        notify={notify}
      />

      {/* G. Situação dos funcionários (tabela administrativa nominal preservada) */}
      <LiveTeamSidebar
        employees={filteredEmployees}
        recs={recs}
        openOccs={openOccs}
        go={go}
      />

      {/* H. Pendências de ponto (listagem organizada para o RH preservada) */}
      <RhPrioritiesTable openOccs={openOccs} go={go} />
    </div>
  );
}
