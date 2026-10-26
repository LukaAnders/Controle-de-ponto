import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { base, depts } from "../../data/mockData";
import KpiCards from "./components/KpiCards";
import RhPrioritiesTable from "./components/RhPrioritiesTable";
import ModalityDistribution from "./components/ModalityDistribution";
import LiveTeamSidebar from "./components/LiveTeamSidebar";
import "./Overview.css";

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

  return (
    <div className="page-stack">
      {/* Sub-header Bar with Day/Week/Month tabs and quick filters (inspired by Image 1) */}
      <div className="overview-subbar">
        <div className="period-tabs" role="tablist" aria-label="Período">
          <button
            type="button"
            role="tab"
            aria-selected={period === "dia"}
            className={`period-tab ${period === "dia" ? "active" : ""}`}
            onClick={() => setPeriod("dia")}
          >
            Dia (Hoje)
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
            Mês (Outubro)
          </button>
        </div>

        <div className="subbar-filters">
          <select
            aria-label="Filtrar por setor"
            className="subbar-select"
            value={deptFilter}
            disabled={role === "gestor"}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="">Todos os setores</option>
            {depts.map((d) => (
              <option key={d} value={d}>
                Setor: {d}
              </option>
            ))}
          </select>

          <select
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

      {/* Page Heading */}
      <div className="page-header">
        <div>
          <h1>Visão operacional</h1>
          <p className="sub">
            Acompanhe a jornada e resolva pendências em um só lugar ·
            Segunda-feira, 26 de outubro (Dados demonstrativos)
          </p>
        </div>

        <div className="page-header-actions">
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

      {/* 1920x1080 Widescreen 2-Column Operational Grid */}
      <div className="overview-cockpit-grid">
        <div className="overview-main-col">
          <KpiCards
            presentCount={presentCount}
            activeCount={activeCount}
            inShiftCount={inShiftCount}
            openOccsCount={openOccs.length}
          />

          <RhPrioritiesTable openOccs={openOccs} go={go} />

          <ModalityDistribution go={go} />
        </div>

        <LiveTeamSidebar
          employees={filteredEmployees}
          recs={recs}
          go={go}
        />
      </div>
    </div>
  );
}
