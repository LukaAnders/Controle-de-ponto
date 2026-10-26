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
  const hasFilters = Boolean(q || d || m || s);

  return (
    <div className="emp-toolbar">
      <div
        className="emp-mode-tabs"
        role="tablist"
        aria-label="Filtrar por modalidade de trabalho"
      >
        {[
          { val: "", label: "Todos" },
          { val: "Presencial", label: "Presencial" },
          { val: "Híbrido", label: "Híbrido" },
          { val: "Remoto", label: "Remoto" },
        ].map((tab) => (
          <button
            key={tab.val}
            type="button"
            role="tab"
            aria-selected={m === tab.val}
            className={`emp-tab-btn ${m === tab.val ? "active" : ""}`}
            onClick={() => setM(tab.val)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="emp-inline-filters">
        <input
          className="emp-search-input"
          aria-label="Pesquisar por nome, matrícula ou cargo"
          placeholder="Buscar nome, matrícula ou cargo..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        {role === "rh" && (
          <select
            className="emp-select"
            aria-label="Filtrar por setor"
            value={d}
            onChange={(e) => setD(e.target.value)}
          >
            <option value="">Todos os setores</option>
            {depts.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        )}

        <select
          className="emp-select"
          aria-label="Filtrar por situação cadastral"
          value={s}
          onChange={(e) => setS(e.target.value)}
        >
          <option value="">Situação: Todos</option>
          <option value="a">Apenas Ativos</option>
          <option value="i">Apenas Inativos</option>
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
