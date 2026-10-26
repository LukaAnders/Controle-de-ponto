import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { base } from "../../data/mockData";
import KpiCards from "./components/KpiCards";
import RhPrioritiesTable from "./components/RhPrioritiesTable";
import ModalityDistribution from "./components/ModalityDistribution";
import "./Overview.css";

export default function Overview() {
  const { occs, employees, go, role } = useApp();
  const [period, setPeriod] = useState("hoje");

  const openOccs = occs.filter(
    (o) => o.status === "Pendente" || o.status === "Em análise",
  );

  const activeCount =
    role === "rh"
      ? base.active
      : employees.filter((e) => e.active).length * 9;
  const presentCount =
    role === "rh" ? base.present : Math.max(1, activeCount - 4);
  const inShiftCount =
    role === "rh" ? base.inShift : Math.max(1, presentCount - 2);

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <h1>Visão operacional</h1>
          <p className="sub">
            Acompanhe a jornada e resolva pendências em um só lugar
            {role === "gestor" ? " · Escopo: Setor de Tecnologia" : ""}
          </p>
        </div>

        <div className="page-header-actions">
          <label className="inline-filter" aria-label="Período de referência">
            <span>Período:</span>
            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="hoje">Hoje · 26/10/2026</option>
              <option value="semana">Semana atual (20/10 a 26/10)</option>
              <option value="mes">Outubro / 2026</option>
            </select>
          </label>
          <button type="button" className="btn" onClick={() => go("punch")}>
            Ir para Central de Ponto
          </button>
          <button
            type="button"
            className="btn primary"
            onClick={() => go("occurrences", { open: "1" })}
          >
            Analisar pendências ({openOccs.length})
          </button>
        </div>
      </div>

      <KpiCards
        presentCount={presentCount}
        activeCount={activeCount}
        inShiftCount={inShiftCount}
        openOccsCount={openOccs.length}
      />

      <RhPrioritiesTable openOccs={openOccs} go={go} />

      <ModalityDistribution go={go} />
    </div>
  );
}

