import { useState, useEffect } from "react";
import {
  X,
  Check,
  XCircle,
  MessageSquareMore,
  Forward,
  Info,
  Clock,
} from "lucide-react";
import { formatDateBR, typeLabel } from "../../../dados/dadosSimulados";
import { Employee, Occ, OccStatus, Role } from "../../../tipos";
import { effectiveResponsibility, isTerminalStatus } from "../regrasOcorrencia";
import {
  priorityBadgeClass,
  stageLabel,
  statusBadgeClass,
} from "./TabelaOcorrencias";

const actionsList: {
  label: string;
  nextStatus: OccStatus;
  variant: string;
  icon: typeof Check;
}[] = [
  {
    label: "Aprovar",
    nextStatus: "Aprovada",
    variant: "primary",
    icon: Check,
  },
  {
    label: "Rejeitar",
    nextStatus: "Rejeitada",
    variant: "danger",
    icon: XCircle,
  },
  {
    label: "Solicitar info",
    nextStatus: "Em análise",
    variant: "",
    icon: MessageSquareMore,
  },
  {
    label: "Revisão",
    nextStatus: "Encaminhada para revisão",
    variant: "",
    icon: Forward,
  },
];

interface OccurrenceDetailPanelProps {
  occurrence: Occ;
  employee?: Employee;
  role: Role;
  onClose: () => void;
  actOcc: (id: string, s: OccStatus, label: string, note?: string) => void;
}

export default function OccurrenceDetailPanel({
  occurrence,
  employee,
  role,
  onClose,
  actOcc,
}: OccurrenceDetailPanelProps) {
  const [pendAction, setPendAction] = useState<{
    label: string;
    nextStatus: OccStatus;
  } | null>(null);
  const [actionNote, setActionNote] = useState("");

  useEffect(() => {
    setPendAction(null);
    setActionNote("");
  }, [occurrence.id]);

  const responsibility = effectiveResponsibility(occurrence);

  return (
    <aside
      className="card panel occ-detail-panel"
      aria-label={`Detalhes da ocorrência ${occurrence.id}`}
    >
      <div className="panel-header">
        <div className="occ-detail-header-copy">
          <div className="occ-detail-badges">
            <span className="modality-tag">
              {typeLabel[occurrence.type].toUpperCase()}
            </span>
            <span className={`badge ${priorityBadgeClass(occurrence.priority)}`}>
              Prioridade {occurrence.priority}
            </span>
          </div>
          <h2>{occurrence.summary}</h2>
        </div>
        <div className="row" style={{ gap: 6, flexShrink: 0 }}>
          <span className={`badge ${statusBadgeClass(occurrence.status)}`}>
            {occurrence.status}
          </span>
          <button
            type="button"
            className="btn occ-close-btn"
            aria-label="Fechar painel de detalhes"
            onClick={onClose}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Metadados organizados em grade */}
      <div className="occ-summary-meta">
        <div>
          <small>Colaborador</small>
          <strong>
            {employee?.name ?? "—"}
            {employee ? ` (${employee.dept} · Mat. ${employee.reg})` : ""}
          </strong>
        </div>
        <div>
          <small>Data e horário</small>
          <strong>
            {formatDateBR(occurrence.date)} · {occurrence.relatedTime}
          </strong>
        </div>
        <div>
          <small>Solicitado em</small>
          <strong>{occurrence.requestedAt}</strong>
        </div>
        <div>
          <small>Responsável atual</small>
          <strong>
            {responsibility
              ? stageLabel[responsibility.current]
              : "Concluída"}
          </strong>
        </div>
      </div>

      {/* Justificativa */}
      <div className="detail-block">
        <h3>Justificativa enviada</h3>
        <p className="quote-box">“{occurrence.justification}”</p>
        {occurrence.notes && (
          <p className="occ-notes-inline">
            <strong>Observação:</strong> {occurrence.notes}
          </p>
        )}
      </div>

      {/* Marcações envolvidas */}
      <div className="detail-block">
        <h3>Marcações do dia</h3>
        <div className="record-chips">
          {occurrence.involvedRecords.map((rec, idx) => (
            <span key={idx} className="record-chip">
              <Clock size={12} aria-hidden="true" />
              <span>{rec}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Bloco de apoio informativo (IA) */}
      <div className="note">
        <div className="ai-suggestion-header">
          <span className="ai-title-with-icon">
            <Info size={15} aria-hidden="true" />
            <strong>Síntese operacional</strong>
          </span>
          <span className="badge info">Apoio informativo</span>
        </div>
        <p className="ai-compact-text">{occurrence.aiAnalysis.problemSummary}</p>
        <div className="ai-sub-points">
          <span>
            <b>Verificar:</b> {occurrence.aiAnalysis.toVerify}
          </span>
          <span>
            <b>Próximo passo:</b> {occurrence.aiAnalysis.nextSteps}
          </span>
        </div>
      </div>

      {/* Deliberação para RH / Gestor */}
      {role !== "funcionario" && (
        <div className="detail-block">
          <h3>Deliberação do RH / Liderança</h3>
          {isTerminalStatus(occurrence.status) ? (
            <p className="sub" style={{ margin: 0 }}>
              Esta ocorrência foi finalizada e não aceita novas decisões.
            </p>
          ) : pendAction ? (
            <div
              className="confirm-box"
              role="region"
              aria-label="Confirmação de ação"
            >
              <strong>Confirmar “{pendAction.label}”?</strong>
              <label style={{ margin: "8px 0" }}>
                Observação (opcional)
                <input
                  placeholder="Ex.: Comprovante conferido"
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                />
              </label>
              <div className="row">
                <button
                  type="button"
                  className="btn primary"
                  onClick={() => {
                    actOcc(
                      occurrence.id,
                      pendAction.nextStatus,
                      pendAction.label,
                      actionNote,
                    );
                    setPendAction(null);
                    setActionNote("");
                  }}
                >
                  Confirmar
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setPendAction(null);
                    setActionNote("");
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="action-buttons-row">
              {actionsList.map((act) => {
                const Icon = act.icon;
                return (
                  <button
                    key={act.label}
                    type="button"
                    className={`btn occ-decision-btn ${act.variant}`}
                    onClick={() => setPendAction(act)}
                  >
                    <Icon size={14} aria-hidden="true" />
                    <span>{act.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Histórico */}
      <div className="detail-block">
        <h3>Histórico ({occurrence.history.length})</h3>
        <ul className="audit-timeline">
          {occurrence.history.map((h, i) => (
            <li key={i}>
              <div>
                <strong>{h.action}</strong> · <span>{h.by}</span>
                {h.note && <div className="cell-sub">“{h.note}”</div>}
              </div>
              <span className="audit-time">{h.at}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
