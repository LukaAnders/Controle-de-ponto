import { depts, typeLabel } from "../../../data/mockData";
import { OccType, Role } from "../../../types";

interface OccurrenceFiltersProps {
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

  return (
    <div className="occ-toolbar">
      <div className="occ-status-tabs" role="tablist" aria-label="Filtrar por situação">
        <button
          type="button"
          role="tab"
          aria-selected={st === ""}
          className={`occ-tab-btn ${st === "" ? "active" : ""}`}
          onClick={() => setSt("")}
        >
          Todas
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={st === "abertas"}
          className={`occ-tab-btn ${st === "abertas" ? "active" : ""}`}
          onClick={() => setSt("abertas")}
        >
          Pendentes
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={st === "Aprovada"}
          className={`occ-tab-btn ${st === "Aprovada" ? "active" : ""}`}
          onClick={() => setSt("Aprovada")}
        >
          Aprovadas
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={st === "Rejeitada"}
          className={`occ-tab-btn ${st === "Rejeitada" ? "active" : ""}`}
          onClick={() => setSt("Rejeitada")}
        >
          Rejeitadas
        </button>
      </div>

      <div className="occ-inline-filters">
        <input
          className="occ-search-input"
          aria-label="Buscar por funcionário ou motivo"
          placeholder="Buscar funcionário ou motivo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

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
          <button type="button" className="btn" onClick={onClear}>
            Limpar
          </button>
        )}
      </div>
    </div>
  );
}
