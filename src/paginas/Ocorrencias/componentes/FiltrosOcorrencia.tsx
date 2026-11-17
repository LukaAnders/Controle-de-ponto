import { Search, RotateCcw } from "lucide-react";
import { depts, typeLabel } from "../../../dados/dadosSimulados";
import { Occ, OccType, Role } from "../../../tipos";

interface OccurrenceFiltersProps {
  allOccs: Occ[];
  filteredCount: number;
  search: string;
  setSearch: (v: string) => void;
  st: string;
  setSt: (v: string) => void;
  ty: string;
  setTy: (v: string) => void;
  deptFilter: string;
  setDeptFilter: (v: string) => void;
  prioFilter: string;
  setPrioFilter: (v: string) => void;
  role: Role;
  onClear: () => void;
}

export default function OccurrenceFilters({
  allOccs,
  filteredCount,
  search,
  setSearch,
  st,
  setSt,
  ty,
  setTy,
  deptFilter,
  setDeptFilter,
  prioFilter,
  setPrioFilter,
  role,
  onClear,
}: OccurrenceFiltersProps) {
  const hasFilters = Boolean(search || st || ty || deptFilter || prioFilter);

  const counts = {
    all: allOccs.length,
    open: allOccs.filter(
      (o) => o.status === "Pendente" || o.status === "Em análise",
    ).length,
    review: allOccs.filter((o) => o.status === "Encaminhada para revisão")
      .length,
    approved: allOccs.filter((o) => o.status === "Aprovada").length,
    rejected: allOccs.filter((o) => o.status === "Rejeitada").length,
  };

  return (
    <div className="occ-toolbar">
      <div
        className="occ-status-tabs"
        role="tablist"
        aria-label="Filtrar por situação"
      >
        <button
          type="button"
          role="tab"
          aria-selected={st === ""}
          className={`occ-tab-btn ${st === "" ? "active" : ""}`}
          onClick={() => setSt("")}
        >
          Todas <span className="occ-tab-count">{counts.all}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={st === "abertas"}
          className={`occ-tab-btn ${st === "abertas" ? "active" : ""}`}
          onClick={() => setSt("abertas")}
        >
          Pendentes <span className="occ-tab-count">{counts.open}</span>
        </button>
        {counts.review > 0 && (
          <button
            type="button"
            role="tab"
            aria-selected={st === "Encaminhada para revisão"}
            className={`occ-tab-btn ${
              st === "Encaminhada para revisão" ? "active" : ""
            }`}
            onClick={() => setSt("Encaminhada para revisão")}
          >
            Em revisão <span className="occ-tab-count">{counts.review}</span>
          </button>
        )}
        <button
          type="button"
          role="tab"
          aria-selected={st === "Aprovada"}
          className={`occ-tab-btn ${st === "Aprovada" ? "active" : ""}`}
          onClick={() => setSt("Aprovada")}
        >
          Aprovadas <span className="occ-tab-count">{counts.approved}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={st === "Rejeitada"}
          className={`occ-tab-btn ${st === "Rejeitada" ? "active" : ""}`}
          onClick={() => setSt("Rejeitada")}
        >
          Rejeitadas <span className="occ-tab-count">{counts.rejected}</span>
        </button>
      </div>

      <div className="occ-inline-filters">
        <div className="occ-search-wrap">
          <Search size={15} className="occ-search-icon" aria-hidden="true" />
          <input
            type="search"
            className="occ-search-input"
            aria-label="Buscar por funcionário, matrícula ou motivo"
            placeholder="Buscar funcionário ou motivo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="occ-select"
          aria-label="Filtrar por tipo de ocorrência"
          value={ty}
          onChange={(e) => setTy(e.target.value)}
        >
          <option value="">Todos os tipos</option>
          {(Object.keys(typeLabel) as OccType[]).map((t) => (
            <option key={t} value={t}>
              {typeLabel[t]}
            </option>
          ))}
        </select>

        {role === "rh" && (
          <select
            className="occ-select"
            aria-label="Filtrar por setor"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="">Todos os setores</option>
            {depts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        )}

        <select
          className="occ-select"
          aria-label="Filtrar por prioridade"
          value={prioFilter}
          onChange={(e) => setPrioFilter(e.target.value)}
        >
          <option value="">Prioridade: Todas</option>
          <option value="Alta">Prioridade: Alta</option>
          <option value="Média">Prioridade: Média</option>
          <option value="Baixa">Prioridade: Baixa</option>
        </select>

        {hasFilters && (
          <button
            type="button"
            className="btn occ-clear-btn"
            onClick={onClear}
            title="Limpar filtros ativos"
          >
            <RotateCcw size={13} aria-hidden="true" />
            <span>Limpar</span>
          </button>
        )}

        <span className="occ-results-counter">
          {filteredCount} de {allOccs.length}
        </span>
      </div>
    </div>
  );
}
