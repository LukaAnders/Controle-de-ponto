import { TODAY, formatDateBR, typeLabel } from "../../../data/mockData";
import { Employee, Occ, Page, Rec, Role } from "../../../types";

interface EmployeeDetailPanelProps {
  employee: Employee;
  empRecs: Rec[];
  empOccs: Occ[];
  role: Role;
  onClose: () => void;
  onEdit: (e: Employee) => void;
  onToggleActive: (e: Employee) => void;
  go: (p: Page, q?: Record<string, string>) => void;
}

export default function EmployeeDetailPanel({
  employee,
  empRecs,
  empOccs,
  role,
  onClose,
  onEdit,
  onToggleActive,
  go,
}: EmployeeDetailPanelProps) {
  return (
    <aside
      className="card panel emp-detail-panel"
      aria-label={`Ficha de ${employee.name}`}
    >
      <div className="panel-header">
        <div>
          <span className="modality-tag">FICHA DO COLABORADOR</span>
          <h2>{employee.name}</h2>
        </div>
        <div className="row">
          <span className={`badge ${employee.active ? "ok" : "bad"}`}>
            {employee.active ? "Ativo" : "Inativo"}
          </span>
          <button type="button" className="btn" onClick={onClose}>
            ✕
          </button>
        </div>
      </div>

      <div className="emp-summary-meta">
        <div>
          <small>Matrícula e Setor</small>
          <strong>
            Mat. {employee.reg} · {employee.dept}
          </strong>
        </div>
        <div>
          <small>Cargo e Regime</small>
          <strong>
            {employee.role} ({employee.mode})
          </strong>
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <small>Escala contratual</small>
          <strong>{employee.schedule}</strong>
        </div>
      </div>

      <div className="info-box">
        <div className="section-header">
          <strong>Ponto Digital em Home Office</strong>
          {employee.remote.allowed ? (
            employee.remote.until >= TODAY ? (
              <span className="badge ok">
                Válido até {formatDateBR(employee.remote.until)}
              </span>
            ) : (
              <span className="badge bad">
                Vencido em {formatDateBR(employee.remote.until)}
              </span>
            )
          ) : (
            <span className="badge">Sem permissão</span>
          )}
        </div>
        <p style={{ marginTop: 6 }}>
          {employee.remote.allowed
            ? `Autorizado por: ${employee.remote.by}.`
            : "Sem liberação ativa para registrar ponto digital fora da empresa."}
        </p>
        {role === "rh" && (
          <div className="row" style={{ marginTop: 10 }}>
            <button
              type="button"
              className="btn primary-outline"
              onClick={() => onEdit(employee)}
            >
              Editar cadastro / permissão
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => onToggleActive(employee)}
            >
              {employee.active ? "Desativar cadastro" : "Reativar cadastro"}
            </button>
          </div>
        )}
      </div>

      <div className="detail-block">
        <h3>Últimos registros ({empRecs.length})</h3>
        {empRecs.length > 0 ? (
          <div className="emp-chip-list">
            {empRecs.slice(0, 4).map((r) => (
              <span key={r.id} className="emp-record-chip">
                <b>{r.time.split(" ")[1]}</b> · {r.modality} ({r.kind})
              </span>
            ))}
          </div>
        ) : (
          <p className="sub">Nenhum registro recente simulado.</p>
        )}
      </div>

      <div className="detail-block">
        <h3>Ocorrências vinculadas ({empOccs.length})</h3>
        {empOccs.length > 0 ? (
          <ul className="compact-list">
            {empOccs.map((o) => (
              <li key={o.id}>
                <div>
                  <strong>{o.summary}</strong>
                  <div className="cell-sub">
                    {formatDateBR(o.date)} · {typeLabel[o.type]}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn"
                  onClick={() => go("occurrences", { sel: o.id })}
                >
                  {o.status} →
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
