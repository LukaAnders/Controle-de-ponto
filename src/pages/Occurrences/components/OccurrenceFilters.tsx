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
  periodFilter: string;
  setPeriodFilter: (v: string) => void;
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
  periodFilter,
  setPeriodFilter,
  prioFilter,
  setPrioFilter,
  role,
  onClear,
}: OccurrenceFiltersProps) {
  return (
    <div className="card filter-bar">
      <label className="filter-item grow">
        <span>Buscar</span>
        <input
          placeholder="Funcionário ou resumo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>

      <label className="filter-item">
        <span>Status</span>
        <select value={st} onChange={(e) => setSt(e.target.value)}>
          <option value="">Todos os status</option>
          <option value="abertas">Abertas (Pendente + Em análise)</option>
          <option value="Pendente">Pendente</option>
          <option value="Em análise">Em análise</option>
          <option value="Aprovada">Aprovada</option>
          <option value="Rejeitada">Rejeitada</option>
          <option value="Encaminhada para revisão">
            Encaminhada para revisão
          </option>
        </select>
      </label>

      <label className="filter-item">
        <span>Tipo de ocorrência</span>
        <select value={ty} onChange={(e) => setTy(e.target.value)}>
          <option value="">Todos os tipos</option>
          {(Object.keys(typeLabel) as OccType[]).map((t) => (
            <option key={t} value={t}>
              {typeLabel[t]}
            </option>
          ))}
        </select>
      </label>

      {role !== "funcionario" && (
        <label className="filter-item">
          <span>Setor</span>
          <select
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
        </label>
      )}

      <label className="filter-item">
        <span>Período</span>
        <select
          value={periodFilter}
          onChange={(e) => setPeriodFilter(e.target.value)}
        >
          <option value="">Todas as datas</option>
          <option value="hoje">Hoje (26/10/2026)</option>
          <option value="recentes">Últimos 3 dias (24 a 26/10)</option>
          <option value="outubro">Outubro / 2026</option>
        </select>
      </label>

      <label className="filter-item">
        <span>Prioridade</span>
        <select
          value={prioFilter}
          onChange={(e) => setPrioFilter(e.target.value)}
        >
          <option value="">Todas</option>
          <option value="Alta">Alta</option>
          <option value="Média">Média</option>
          <option value="Baixa">Baixa</option>
        </select>
      </label>

      {(st || ty || deptFilter || periodFilter || prioFilter || search) && (
        <button
          type="button"
          className="btn"
          style={{ alignSelf: "flex-end" }}
          onClick={onClear}
        >
          Limpar
        </button>
      )}
    </div>
  );
}

