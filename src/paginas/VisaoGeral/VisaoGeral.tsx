import { useState } from "react";
import { useApp } from "../../contexto/ContextoApp";
import { base, depts } from "../../dados/dadosSimulados";
import KpiCards from "./componentes/CartoesIndicadores";
import RhPrioritiesTable from "./componentes/TabelaPrioridadesRh";
import LiveTeamSidebar from "./componentes/PainelEquipeAoVivo";
import "./VisaoGeral.css";

export default function Overview() {
  const { occs, employees, recs, go, role } = useApp();
  const [period, setPeriod] = useState<"dia" | "semana" | "mes">("dia");
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

  const isFiltered = Boolean(deptFilter || modeFilter || role !== "rh");

  const activeCount = isFiltered
    ? filteredEmployees.filter((e) => e.active).length * 15
    : base.active;
  const presentCount = isFiltered
    ? Math.max(0, activeCount - 4)
    : base.present;
  const inShiftCount = isFiltered
    ? Math.max(0, presentCount - 2)
    : base.inShift;

  const periodLabels: Record<"dia" | "semana" | "mes", string> = {
    dia: "Resumo do dia (Hoje)",
    semana: "Resumo da semana",
    mes: "Resumo do mês (Outubro/2026)",
  };

  return (
    <div className="overview-admin-page">
      {/* Cabeçalho simples e barra de período/filtros compacta */}
      <div className="overview-top-bar">
        <div className="overview-title-block">
          <h1>Visão operacional</h1>
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
        </div>
      </div>

      {/* C. Resumo do dia (única área organizada, sem cartões coloridos soltos) */}
      <KpiCards
        presentCount={presentCount}
        activeCount={activeCount}
        inShiftCount={inShiftCount}
        openOccsCount={openOccs.length}
        periodLabel={periodLabels[period]}
      />

      {/* D. Situação dos funcionários (tabela administrativa principal) */}
      <LiveTeamSidebar
        employees={filteredEmployees}
        recs={recs}
        openOccs={openOccs}
        go={go}
      />

      {/* E. Pendências de ponto (listagem organizada para o RH) */}
      <RhPrioritiesTable openOccs={openOccs} go={go} />
    </div>
  );
}
