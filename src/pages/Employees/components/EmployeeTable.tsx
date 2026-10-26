import { TODAY, formatDateBR } from "../../../data/mockData";
import { Employee, Role } from "../../../types";

interface EmployeeTableProps {
  list: Employee[];
  detailId: string;
  role: Role;
  onSelectDetail: (id: string) => void;
  onEdit: (e: Employee) => void;
}

export default function EmployeeTable({
  list,
  detailId,
  role,
  onSelectDetail,
  onEdit,
}: EmployeeTableProps) {
  const getInitials = (name: string) =>
    name
      .split(" ")
      .slice(0, 2)
      .map((p) => p[0])
      .join("");

  const renderRemoteBadge = (e: Employee) => {
    if (!e.remote.allowed) {
      return <span className="badge">Home office: Sem permissão</span>;
    }
    if (e.remote.until < TODAY) {
      return (
        <span className="badge bad">
          Home office vencido ({formatDateBR(e.remote.until)})
        </span>
      );
    }
    return (
      <span className="badge ok">
        Home office até {formatDateBR(e.remote.until)}
      </span>
    );
  };

  return (
    <div className="card scroll">
      <table>
        <thead>
          <tr>
            <th>Colaborador</th>
            <th>Cargo e Setor</th>
            <th>Regime e Permissão Remota</th>
            <th>Situação</th>
            <th style={{ textAlign: "right" }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {list.map((e, idx) => {
            const isSelected = detailId === e.id;
            return (
              <tr
                key={e.id}
                className={isSelected ? "selected-row" : ""}
                style={{ cursor: "pointer" }}
                onClick={() => onSelectDetail(isSelected ? "" : e.id)}
              >
                <td>
                  <div className="emp-cell">
                    <div className={`emp-avatar alt-${idx % 4}`}>
                      {getInitials(e.name)}
                    </div>
                    <div>
                      <strong>{e.name}</strong>
                      <div className="cell-sub">
                        Mat. {e.reg} · {e.schedule.split(" (")[0]}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <strong>{e.role}</strong>
                  <div className="cell-sub">{e.dept}</div>
                </td>
                <td>
                  <div className="row" style={{ gap: 6 }}>
                    <span className="badge info">{e.mode}</span>
                    {renderRemoteBadge(e)}
                  </div>
                </td>
                <td>
                  <span className={"badge " + (e.active ? "ok" : "bad")}>
                    {e.active ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td
                  style={{ textAlign: "right" }}
                  onClick={(ev) => ev.stopPropagation()}
                >
                  <div className="row" style={{ justifyContent: "flex-end" }}>
                    {role === "rh" && (
                      <button
                        type="button"
                        className="btn"
                        onClick={() => onEdit(e)}
                      >
                        Editar
                      </button>
                    )}
                    <button
                      type="button"
                      className={`btn ${isSelected ? "primary-outline" : ""}`}
                      onClick={() => onSelectDetail(isSelected ? "" : e.id)}
                    >
                      {isSelected ? "Fechar" : "Ver ficha"}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
          {!list.length && (
            <tr>
              <td colSpan={5} className="empty-cell">
                Nenhum funcionário encontrado com os critérios atuais.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
