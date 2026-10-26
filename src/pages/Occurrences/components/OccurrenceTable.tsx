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

  const getInitials = (name: string) =>
    name
      .split(" ")
      .slice(0, 2)
      .map((p) => p[0])
      .join("");

  return (
    <div className="card scroll">
      <table>
        <thead>
          <tr>
            <th>Colaborador</th>
            <th>Ocorrência</th>
            <th>Data e Horário</th>
            <th>Status e Prioridade</th>
            <th style={{ textAlign: "right" }}>Ação</th>
          </tr>
        </thead>
        <tbody>
          {list.map((x, idx) => {
            const emp = getEmp(x.empId);
            const isSelected = selectedId === x.id;
            return (
              <tr
                key={x.id}
                className={isSelected ? "selected-row" : ""}
                style={{ cursor: "pointer" }}
                onClick={() => onSelect(isSelected ? "" : x.id)}
              >
                <td>
                  <div className="emp-cell">
                    <div className={`emp-avatar alt-${idx % 4}`}>
                      {getInitials(emp?.name ?? "CO")}
                    </div>
                    <div>
                      <strong>{emp?.name ?? "—"}</strong>
                      {emp && (
                        <div className="cell-sub">
                          {emp.dept} · Mat. {emp.reg}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <strong>{x.summary}</strong>
                  <div className="cell-sub">{typeLabel[x.type]}</div>
                </td>
                <td>
                  <strong>{formatDateBR(x.date)}</strong>
                  <div className="cell-sub">{x.relatedTime}</div>
                </td>
                <td>
                  <div className="row" style={{ gap: 6 }}>
                    <span className={`badge ${statusBadgeClass(x.status)}`}>
                      {x.status}
                    </span>
                    <span className={`badge ${priorityBadgeClass(x.priority)}`}>
                      {x.priority}
                    </span>
                  </div>
                </td>
                <td
                  style={{ textAlign: "right" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className={`btn ${isSelected ? "primary-outline" : ""}`}
                    onClick={() => onSelect(isSelected ? "" : x.id)}
                  >
                    {isSelected ? "Fechar" : "Ver detalhes"}
                  </button>
                </td>
              </tr>
            );
          })}
          {!list.length && (
            <tr>
              <td colSpan={5} className="empty-cell">
                Nenhuma ocorrência encontrada com os filtros selecionados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
