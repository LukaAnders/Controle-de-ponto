import { useState, useEffect } from "react";
import { formatDateBR, typeLabel } from "../../../data/mockData";
import { Employee, Occ, OccStatus, Role } from "../../../types";
import { statusBadgeClass } from "./OccurrenceTable";

const actionsList: { label: string; nextStatus: OccStatus; variant: string }[] =
  [
    {
      label: "Aprovar",
      nextStatus: "Aprovada",
      variant: "primary",
    },
    {
      label: "Rejeitar",
      nextStatus: "Rejeitada",
      variant: "danger",
    },
    {
      label: "Solicitar info",
      nextStatus: "Em análise",
      variant: "",
    },
    {
      label: "Revisão",
      nextStatus: "Encaminhada para revisão",
      variant: "",
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

  return (
    <aside
      className="card panel occ-detail-panel"
      aria-label={`Detalhes da ocorrência ${occurrence.id}`}
    >
      <div className="panel-header">
        <div>
          <span className="modality-tag">
            {typeLabel[occurrence.type].toUpperCase()}
          </span>
          <h2>{occurrence.summary}</h2>
        </div>
        <div className="row">
          <span className={`badge ${statusBadgeClass(occurrence.status)}`}>
            {occurrence.status}
          </span>
          <button type="button" className="btn" onClick={onClose}>
            ✕
          </button>
        </div>
      </div>

      {/* Compact Meta Strip */}
      <div className="occ-summary-meta">
        <div>
          <small>Colaborador</small>
          <strong>
            {employee?.name} ({employee?.dept})
          </strong>
        </div>
        <div>
          <small>Data e horário</small>
          <strong>
            {formatDateBR(occurrence.date)} · {occurrence.relatedTime}
          </strong>
        </div>
      </div>

      {/* Justification */}
      <div className="detail-block">
        <h3>Justificativa enviada</h3>
        <p className="quote-box">“{occurrence.justification}”</p>
      </div>

      {/* Involved Records as Clean Chips */}
      <div className="detail-block">
        <h3>Marcações do dia</h3>
        <div className="record-chips">
          {occurrence.involvedRecords.map((rec, idx) => (
            <span key={idx} className="record-chip">
              {rec}
            </span>
          ))}
        </div>
      </div>

      {/* Streamlined AI Support Block */}
      <div className="note">
        <div className="ai-suggestion-header">
          <strong>Sugestão do assistente (IA)</strong>
          <span className="badge info">Apoio informativo</span>
        </div>
        <p className="ai-compact-text">
          {occurrence.aiAnalysis.problemSummary}{" "}
          <b>Próximo passo sugerido:</b> {occurrence.aiAnalysis.nextSteps}
        </p>
      </div>

      {/* Actions for RH / Gestor */}
      {role !== "funcionario" && (
        <div className="detail-block">
          <h3>Deliberação do RH / Liderança</h3>
          {pendAction ? (
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
              {actionsList.map((act) => (
                <button
                  key={act.label}
                  type="button"
                  className={`btn ${act.variant}`}
                  onClick={() => setPendAction(act)}
                >
                  {act.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Compact Audit History */}
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
