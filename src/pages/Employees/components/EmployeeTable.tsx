import { TODAY, formatDateBR } from "../../../data/mockData";
import { Employee, Role } from "../../../types";

interface EmployeeTableProps {
  list: Employee[];
  detailId: string;
  role: Role;
  onSelectDetail: (id: string) => void;
  onEdit: (e: Employee) => void;
  onToggleActive: (e: Employee) => void;
}

export default function EmployeeTable({
  list,
  detailId,
  role,
  onSelectDetail,
  onEdit,
  onToggleActive,
}: EmployeeTableProps) {
  const getInitials = (name: string) =>
    name
      .split(" ")
      .slice(0, 2)
      .map((p) => p[0])
      .join("");

  const renderRemoteBadge = (e: Employee) => {
    if (!e.remote.allowed) {
      return <span className="badge">Sem permissão</span>;
    }
    if (e.remote.until < TODAY) {
      return (
        <span className="badge bad">
          Vencida ({formatDateBR(e.remote.until)})
        </span>
      );
    }
    return (
      <span className="badge ok">
        Autorizado até {formatDateBR(e.remote.until)}
      </span>
    );
  };

  return (
    <div className="card scroll">
      <div className="section-header" style={{ marginBottom: 4 }}>
        <h2>Quadro de colaboradores ({list.length})</h2>
        <small className="sub" style={{ margin: 0 }}>
          Clique em “Detalhes” para inspecionar histórico de ponto, ocorrências
          e permissões.
        </small>
      </div>
      <table>
        <thead>
          <tr>
            <th>Funcionário</th>
            <th>Matrícula</th>
            <th>Setor</th>
            <th>Cargo</th>
            <th>Modalidade</th>
            <th>Ponto em Home Office</th>
            <th>Situação</th>
            <th style={{ textAlign: "right" }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {list.map((e, idx) => (
            <tr
              key={e.id}
              className={detailId === e.id ? "selected-row" : ""}
            >
              <td>
                <div className="emp-cell">
                  <div className={`emp-avatar alt-${idx % 4}`}>
                    {getInitials(e.name)}
                  </div>
                  <div>
                    <strong>{e.name}</strong>
                    <div className="cell-sub">{e.schedule}</div>
                  </div>
                </div>
              </td>
              <td>
                <code>{e.reg}</code>
              </td>
              <td>{e.dept}</td>
              <td>{e.role}</td>
              <td>
                <span className="badge info">{e.mode}</span>
              </td>
              <td>{renderRemoteBadge(e)}</td>
              <td>
                <span className={"badge " + (e.active ? "ok" : "bad")}>
                  {e.active ? "Ativo" : "Inativo"}
                </span>
              </td>
              <td style={{ textAlign: "right" }}>
                <div className="row" style={{ justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    className="btn"
                    onClick={() =>
                      onSelectDetail(detailId === e.id ? "" : e.id)
                    }
                  >
                    {detailId === e.id ? "Fechar" : "Detalhes"}
                  </button>
                  {role === "rh" && (
                    <>
                      <button
                        type="button"
                        className="btn"
                        onClick={() => onEdit(e)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="btn"
                        onClick={() => onToggleActive(e)}
                      >
                        {e.active ? "Desativar" : "Ativar"}
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {!list.length && (
            <tr>
              <td colSpan={8} className="empty-cell">
                Nenhum funcionário encontrado com os critérios atuais. Ajuste a
                busca ou limpe os filtros.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
