import { depts } from "../../../data/mockData";
import { Role } from "../../../types";

interface EmployeeFiltersProps {
  q: string;
  setQ: (v: string) => void;
  d: string;
  setD: (v: string) => void;
  m: string;
  setM: (v: string) => void;
  s: string;
  setS: (v: string) => void;
  role: Role;
  onClear: () => void;
}

export default function EmployeeFilters({
  q,
  setQ,
  d,
  setD,
  m,
  setM,
  s,
  setS,
  role,
  onClear,
}: EmployeeFiltersProps) {
  return (
    <div className="card filter-bar">
      <label className="filter-item grow">
        <span>Pesquisar colaborador</span>
        <input
          aria-label="Pesquisar por nome, matrícula ou cargo"
          placeholder="Nome, matrícula (ex.: 1001) ou cargo..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </label>

      <label className="filter-item">
        <span>Setor</span>
        <select
          aria-label="Setor"
          value={d}
          disabled={role === "gestor"}
          onChange={(e) => setD(e.target.value)}
        >
          <option value="">Todos os setores</option>
          {depts.map((x) => (
            <option key={x} value={x}>
              {x}
            </option>
          ))}
        </select>
      </label>

      <label className="filter-item">
        <span>Modalidade de trabalho</span>
        <select
          aria-label="Modalidade"
          value={m}
          onChange={(e) => setM(e.target.value)}
        >
          <option value="">Todas as modalidades</option>
          {["Presencial", "Híbrido", "Remoto"].map((x) => (
            <option key={x} value={x}>
              {x}
            </option>
          ))}
        </select>
      </label>

      <label className="filter-item">
        <span>Situação cadastral</span>
        <select
          aria-label="Situação"
          value={s}
          onChange={(e) => setS(e.target.value)}
        >
          <option value="">Todas as situações</option>
          <option value="a">Ativo</option>
          <option value="i">Inativo</option>
        </select>
      </label>

      {(q || d || s || m) && (
        <button
          type="button"
          className="btn"
          style={{ alignSelf: "flex-end" }}
          onClick={onClear}
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}
