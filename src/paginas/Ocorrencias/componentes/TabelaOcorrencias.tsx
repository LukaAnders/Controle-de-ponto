import { AlertOctagon, FileText, Laptop, Eye, X, Inbox } from "lucide-react";
import { formatDateBR, typeLabel } from "../../../dados/dadosSimulados";
import {
  Employee,
  Occ,
  OccStatus,
  OccType,
  Priority,
  ResponsibilityStage,
} from "../../../tipos";
import { effectiveResponsibility, isTerminalStatus } from "../regrasOcorrencia";

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

export const stageLabel: Record<ResponsibilityStage, string> = {
  colaborador: "Colaborador",
  gestor: "Gestor",
  rh: "RH",
  "supervisao-administrativa": "Supervisão",
};

const typeIcon: Record<OccType, typeof FileText> = {
  incompleto: AlertOctagon,
  justificativa: FileText,
  homeoffice: Laptop,
};

interface OccurrenceTableProps {
  list: Occ[];
  employees: Employee[];
  selectedId?: string;
  onSelect: (id: string) => void;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
}

export default function OccurrenceTable({
  list,
  employees,
  selectedId,
  onSelect,
  hasActiveFilters,
  onClearFilters,
}: OccurrenceTableProps) {
  const getEmp = (id: string) => employees.find((e) => e.id === id);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .slice(0, 2)
      .map((p) => p[0])
      .join("");

  return (
    <div className="card scroll occ-table-card">
      <table>
        <thead>
          <tr>
            <th>Colaborador</th>
            <th>Ocorrência</th>
            <th>Data e Horário</th>
            <th>Status e Etapa</th>
            <th style={{ textAlign: "right" }}>Ação</th>
          </tr>
        </thead>
        <tbody>
          {list.map((x, idx) => {
            const emp = getEmp(x.empId);
            const isSelected = selectedId === x.id;
            const TypeIcon = typeIcon[x.type];
            const responsibility = effectiveResponsibility(x);
            const isUrgentOpen =
              x.priority === "Alta" && !isTerminalStatus(x.status);

            return (
              <tr
                key={x.id}
                className={`${isSelected ? "selected-row" : ""} ${
                  isUrgentOpen ? "occ-row-urgent" : ""
                }`}
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
                  <div className="occ-title-cell">
                    <span className={`occ-type-icon type-${x.type}`}>
                      <TypeIcon size={14} strokeWidth={2} aria-hidden="true" />
                    </span>
                    <div>
                      <strong>{x.summary}</strong>
                      <div className="cell-sub">{typeLabel[x.type]}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <strong>{formatDateBR(x.date)}</strong>
                  <div className="cell-sub">{x.relatedTime}</div>
                </td>
                <td>
                  <div className="occ-status-cell">
                    <div className="row" style={{ gap: 6 }}>
                      <span className={`badge ${statusBadgeClass(x.status)}`}>
                        {x.status}
                      </span>
                      <span className={`badge ${priorityBadgeClass(x.priority)}`}>
                        {x.priority}
                      </span>
                    </div>
                    {responsibility && (
                      <span className="occ-stage-sub">
                        Etapa: <strong>{stageLabel[responsibility.current]}</strong>
                      </span>
                    )}
                  </div>
                </td>
                <td
                  style={{ textAlign: "right" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className={`btn occ-action-btn ${
                      isSelected ? "primary-outline" : ""
                    }`}
                    onClick={() => onSelect(isSelected ? "" : x.id)}
                  >
                    {isSelected ? (
                      <>
                        <X size={14} aria-hidden="true" />
                        <span>Fechar</span>
                      </>
                    ) : (
                      <>
                        <Eye size={14} aria-hidden="true" />
                        <span>Detalhes</span>
                      </>
                    )}
                  </button>
                </td>
              </tr>
            );
          })}
          {!list.length && (
            <tr>
              <td colSpan={5} className="empty-cell">
                <div className="occ-empty-state">
                  <Inbox size={22} strokeWidth={1.7} aria-hidden="true" />
                  <span>
                    Nenhuma ocorrência encontrada com os filtros selecionados.
                  </span>
                  {hasActiveFilters && onClearFilters && (
                    <button
                      type="button"
                      className="btn"
                      onClick={onClearFilters}
                    >
                      Limpar filtros
                    </button>
                  )}
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
