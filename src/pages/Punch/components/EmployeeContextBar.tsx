import { formatDateBR } from "../../../data/mockData";
import { Employee, Page, Role } from "../../../types";

interface EmployeeContextBarProps {
  selectedEmployee: Employee;
  employees: Employee[];
  role: Role;
  isRemoteValid: boolean;
  isRemoteExpired: boolean;
  onSelectEmployee: (id: string) => void;
  go: (p: Page, q?: Record<string, string>) => void;
}

export default function EmployeeContextBar({
  selectedEmployee,
  employees,
  role,
  isRemoteValid,
  isRemoteExpired,
  onSelectEmployee,
  go,
}: EmployeeContextBarProps) {
  return (
    <section
      className="card employee-context-bar"
      aria-label="Funcionário selecionado para simulação"
    >
      <div className="context-select-group">
        <label htmlFor="punch-emp-select">
          Funcionário em simulação (Ponto Digital e Catraca)
        </label>
        <select
          id="punch-emp-select"
          value={selectedEmployee.id}
          disabled={role === "funcionario"}
          onChange={(ev) => onSelectEmployee(ev.target.value)}
        >
          {employees.map((x) => (
            <option key={x.id} value={x.id}>
              {x.name} · Mat. {x.reg} ({x.dept} — {x.mode})
            </option>
          ))}
        </select>
      </div>

      <div className="context-meta">
        <div className="meta-item">
          <small>Modalidade e Escala</small>
          <strong>
            {selectedEmployee.mode} · {selectedEmployee.schedule}
          </strong>
        </div>
        <div className="meta-item">
          <small>Regra de Home Office</small>
          <div>
            {isRemoteValid ? (
              <span className="badge ok">
                Autorizado até {formatDateBR(selectedEmployee.remote.until)}
              </span>
            ) : isRemoteExpired ? (
              <span className="badge bad">
                Autorização vencida em{" "}
                {formatDateBR(selectedEmployee.remote.until)}
              </span>
            ) : (
              <span className="badge warn">Sem permissão remota ativa</span>
            )}
          </div>
        </div>
        {role === "rh" && (
          <button
            type="button"
            className="btn"
            onClick={() => go("employees")}
          >
            Gerenciar permissão
          </button>
        )}
      </div>
    </section>
  );
}

