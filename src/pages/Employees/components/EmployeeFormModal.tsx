import { depts } from "../../../data/mockData";
import { Employee, Mode } from "../../../types";

interface EmployeeFormModalProps {
  ed: Employee;
  isEditing: boolean;
  err: string;
  onChange: (p: Partial<Employee>) => void;
  onSave: () => void;
  onClose: () => void;
}

export default function EmployeeFormModal({
  ed,
  isEditing,
  err,
  onChange,
  onSave,
  onClose,
}: EmployeeFormModalProps) {
  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="modal modal-wide"
        role="dialog"
        aria-modal="true"
        aria-label="Formulário de Funcionário"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>
            {isEditing
              ? `Editar funcionário: ${ed.name}`
              : "Cadastrar novo funcionário"}
          </h2>
          <button type="button" className="btn" onClick={onClose}>
            Fechar
          </button>
        </div>

        {err && (
          <div className="alert" role="alert">
            {err}
          </div>
        )}

        <div className="form-grid">
          <label>
            Nome completo *
            <input
              placeholder="Ex.: Lucas Ferreira"
              value={ed.name}
              onChange={(e) => onChange({ name: e.target.value })}
            />
          </label>

          <label>
            Matrícula fictícia *
            <input
              placeholder="Ex.: 1009"
              value={ed.reg}
              onChange={(e) => onChange({ reg: e.target.value })}
            />
          </label>

          <label>
            Cargo *
            <input
              placeholder="Ex.: Analista de Produto"
              value={ed.role}
              onChange={(e) => onChange({ role: e.target.value })}
            />
          </label>

          <label>
            Setor
            <select
              value={ed.dept}
              onChange={(e) => onChange({ dept: e.target.value })}
            >
              {depts.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>
          </label>

          <label>
            Modalidade de trabalho
            <select
              value={ed.mode}
              onChange={(e) => onChange({ mode: e.target.value as Mode })}
            >
              {["Presencial", "Híbrido", "Remoto"].map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>
          </label>

          <label>
            Escala de trabalho
            <input
              value={ed.schedule}
              onChange={(e) => onChange({ schedule: e.target.value })}
            />
          </label>
        </div>

        <div className="info-box" style={{ marginTop: 4 }}>
          <strong>Permissão de Ponto Digital em Home Office</strong>
          <p style={{ marginBottom: 8 }}>
            Esta configuração impacta diretamente a simulação na Central de
            Ponto. Sem permissão válida, tentativas de registro em modo “Home
            Office” são bloqueadas.
          </p>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={ed.remote.allowed}
              onChange={(e) =>
                onChange({
                  remote: { ...ed.remote, allowed: e.target.checked },
                })
              }
            />
            <span>
              Autorizar registro de ponto digital fora das dependências da
              empresa
            </span>
          </label>

          {ed.remote.allowed && (
            <div className="form-grid" style={{ marginTop: 10 }}>
              <label>
                Período de validade da autorização *
                <input
                  type="date"
                  value={ed.remote.until}
                  onChange={(e) =>
                    onChange({
                      remote: { ...ed.remote, until: e.target.value },
                    })
                  }
                />
              </label>
              <label>
                Responsável pela autorização *
                <input
                  placeholder="Ex.: Marina Costa (RH)"
                  value={ed.remote.by}
                  onChange={(e) =>
                    onChange({
                      remote: { ...ed.remote, by: e.target.value },
                    })
                  }
                />
              </label>
            </div>
          )}
        </div>

        <div
          className="row"
          style={{ justifyContent: "flex-end", marginTop: 8 }}
        >
          <button type="button" className="btn" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="btn primary" onClick={onSave}>
            Salvar alterações
          </button>
        </div>
      </div>
    </div>
  );
}
