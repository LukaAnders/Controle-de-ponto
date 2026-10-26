import { TODAY, formatDateBR, typeLabel } from "../../../data/mockData";
import { Employee, Occ, Page, Rec, Role } from "../../../types";

interface EmployeeDetailPanelProps {
  employee: Employee;
  empRecs: Rec[];
  empOccs: Occ[];
  role: Role;
  onClose: () => void;
  onEdit: (e: Employee) => void;
  go: (p: Page, q?: Record<string, string>) => void;
}

export default function EmployeeDetailPanel({
  employee,
  empRecs,
  empOccs,
  role,
  onClose,
  onEdit,
  go,
}: EmployeeDetailPanelProps) {
  return (
    <aside className="card panel" aria-label={`Detalhes de ${employee.name}`}>
      <div className="panel-header">
        <div>
          <span className="modality-tag">FICHA DO COLABORADOR</span>
          <h2>{employee.name}</h2>
          <p className="sub" style={{ margin: 0 }}>
            Matrícula {employee.reg} · {employee.role} ({employee.dept})
          </p>
        </div>
        <button type="button" className="btn" onClick={onClose}>
          Fechar
        </button>
      </div>

      <div className="detail-grid">
        <div>
          <small>Modalidade contratual</small>
          <strong>{employee.mode}</strong>
        </div>
        <div>
          <small>Situação cadastral</small>
          <div>
            <span className={`badge ${employee.active ? "ok" : "bad"}`}>
              {employee.active ? "Ativo" : "Inativo"}
            </span>
          </div>
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <small>Escala demonstrativa</small>
          <strong>{employee.schedule}</strong>
        </div>
      </div>

      <div className="info-box">
        <strong>Autorização de Ponto Digital em Home Office</strong>
        {employee.remote.allowed ? (
          <p>
            Status:{" "}
            {employee.remote.until >= TODAY ? (
              <b style={{ color: "var(--ok)" }}>Ativa e válida</b>
            ) : (
              <b style={{ color: "var(--bad)" }}>Expirada</b>
            )}
            <br />
            Validade: <b>{formatDateBR(employee.remote.until)}</b>
            <br />
            Responsável pela liberação: <b>{employee.remote.by}</b>
          </p>
        ) : (
          <p>
            Este funcionário <b>não possui</b> autorização ativa para registrar
            ponto digital fora das dependências da empresa.
          </p>
        )}
        {role === "rh" && (
          <div style={{ marginTop: 8 }}>
            <button
              type="button"
              className="btn primary-outline"
              onClick={() => onEdit(employee)}
            >
              Configurar permissão remota
            </button>
          </div>
        )}
      </div>

      <div>
        <h3>Registros recentes ({empRecs.length})</h3>
        {empRecs.length > 0 ? (
          <ul className="compact-list">
            {empRecs.slice(0, 4).map((r) => (
              <li key={r.id}>
                <span>
                  <b>{r.time}</b> — {r.modality} ({r.kind})
                </span>
                <span className="badge ok">{r.status}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="sub">
            Nenhum registro recente simulado para este funcionário.
          </p>
        )}
      </div>

      <div>
        <h3>Ocorrências associadas ({empOccs.length})</h3>
        {empOccs.length > 0 ? (
          <ul className="compact-list">
            {empOccs.map((o) => (
              <li key={o.id}>
                <div>
                  <b>{formatDateBR(o.date)}</b> · {typeLabel[o.type]}
                  <div className="cell-sub">{o.summary}</div>
                </div>
                <button
                  type="button"
                  className="btn"
                  onClick={() => go("occurrences", { sel: o.id })}
                >
                  Abrir ({o.status})
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="sub">Nenhuma ocorrência vinculada.</p>
        )}
      </div>
    </aside>
  );
}
