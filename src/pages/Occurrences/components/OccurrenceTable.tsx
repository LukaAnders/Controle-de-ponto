import { formatDateBR, typeLabel } from "../../../data/mockData";
import { Employee, Occ, OccStatus, Priority } from "../../../types";

export const statusBadgeClass = (s: OccStatus) => {
  switch (s) {
    case "Aprovada":
      return "ok";
    case "Rejeitada":
      return "bad";
    case "Pendente":
      return "warn";
    case "Em análise":
    case "Encaminhada para revisão":
      return "info";
  }
};

export const priorityBadgeClass = (p: Priority) => {
  switch (p) {
    case "Alta":
      return "bad";
    case "Média":
      return "warn";
    case "Baixa":
      return "";
  }
};

interface OccurrenceTableProps {
  list: Occ[];
  employees: Employee[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

export default function OccurrenceTable({
  list,
  employees,
  selectedId,
  onSelect,
}: OccurrenceTableProps) {
  const getEmp = (id: string) => employees.find((e) => e.id === id);

  return (
    <div className="card scroll">
      <div className="section-header" style={{ marginBottom: 4 }}>
        <h2>Ocorrências listadas ({list.length})</h2>
        <small className="sub" style={{ margin: 0 }}>
          Selecione uma linha para inspecionar os registros envolvidos, sugestão
          da IA e histórico.
        </small>
      </div>
      <table>
        <thead>
          <tr>
            <th>Funcionário</th>
            <th>Tipo da ocorrência</th>
            <th>Data e Horário</th>
            <th>Motivo / Resumo</th>
            <th>Solicitação</th>
            <th>Status</th>
            <th>Prioridade</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
          {list.map((x) => {
            const emp = getEmp(x.empId);
            const isSelected = selectedId === x.id;
            return (
              <tr key={x.id} className={isSelected ? "selected-row" : ""}>
                <td>
                  <strong>{emp?.name ?? "—"}</strong>
                  {emp && (
                    <div className="cell-sub">
                      {emp.dept} · Mat. {emp.reg}
                    </div>
                  )}
                </td>
                <td>{typeLabel[x.type]}</td>
                <td>
                  <strong>{formatDateBR(x.date)}</strong>
                  <div className="cell-sub">{x.relatedTime}</div>
                </td>
                <td>{x.summary}</td>
                <td className="muted-cell">{x.requestedAt}</td>
                <td>
                  <span className={`badge ${statusBadgeClass(x.status)}`}>
                    Status: {x.status}
                  </span>
                </td>
                <td>
                  <span className={`badge ${priorityBadgeClass(x.priority)}`}>
                    {x.priority}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className={`btn ${isSelected ? "primary-outline" : ""}`}
                    onClick={() => onSelect(x.id)}
                  >
                    Detalhes
                  </button>
                </td>
              </tr>
            );
          })}
          {!list.length && (
            <tr>
              <td colSpan={8} className="empty-cell">
                Nenhuma ocorrência encontrada com os filtros selecionados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

