import { useState, useEffect } from "react";
import { formatDateBR, typeLabel } from "../../../data/mockData";
import { Employee, Occ, OccStatus, Role } from "../../../types";
import { statusBadgeClass } from "./OccurrenceTable";

const actionsList: { label: string; nextStatus: OccStatus; variant: string }[] =
  [
    {
      label: "Aprovar justificativa",
      nextStatus: "Aprovada",
      variant: "primary",
    },
    {
      label: "Rejeitar justificativa",
      nextStatus: "Rejeitada",
      variant: "danger",
    },
    {
      label: "Solicitar informações adicionais",
      nextStatus: "Em análise",
      variant: "",
    },
    {
      label: "Encaminhar para revisão",
      nextStatus: "Encaminhada para revisão",
      variant: "",
    },
  ];

interface OccurrenceDetailPanelProps {
  occurrence: Occ;
  employee?: Employee;
  role: Role;
  actOcc: (id: string, s: OccStatus, label: string, note?: string) => void;
}

export default function OccurrenceDetailPanel({
  occurrence,
  employee,
  role,
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
      className="card panel"
      aria-label={`Detalhes da ocorrência ${occurrence.id}`}
    >
      <div className="panel-header">
        <div>
          <span className="modality-tag">
            PROTOCOLO #{occurrence.id.toUpperCase()} ·{" "}
            {typeLabel[occurrence.type].toUpperCase()}
          </span>
          <h2>{occurrence.summary}</h2>
        </div>
        <span className={`badge ${statusBadgeClass(occurrence.status)}`}>
          {occurrence.status}
        </span>
      </div>

      <div className="detail-grid">
        <div>
          <small>Funcionário</small>
          <strong>
            {employee?.name} (Mat. {employee?.reg})
          </strong>
        </div>
        <div>
          <small>Setor e Cargo</small>
          <strong>
            {employee?.dept} · {employee?.role}
          </strong>
        </div>
        <div>
          <small>Data e horário relacionado</small>
          <strong>
            {formatDateBR(occurrence.date)} · {occurrence.relatedTime}
          </strong>
        </div>
        <div>
          <small>Data da solicitação / prioridade</small>
          <strong>
            {occurrence.requestedAt} ({occurrence.priority})
          </strong>
        </div>
      </div>

      <div className="detail-block">
        <h3>Justificativa apresentada</h3>
        <p className="quote-box">“{occurrence.justification}”</p>
      </div>

      <div className="detail-block">
        <h3>Registros envolvidos no dia</h3>
        <ul className="records-list">
          {occurrence.involvedRecords.map((rec, idx) => (
            <li key={idx}>{rec}</li>
          ))}
        </ul>
      </div>

      <div className="detail-block">
        <h3>Observações relevantes</h3>
        <p className="sub" style={{ margin: 0 }}>
          {occurrence.notes}
        </p>
      </div>

      <div className="note ai-suggestion-box">
        <div className="ai-suggestion-header">
          <strong>Sugestão do assistente</strong>
          <span className="badge info">
            Apoio informativo · Não é decisão automática
          </span>
        </div>
        <div className="ai-grid">
          <div>
            <small>Resumo do problema:</small>
            <p>{occurrence.aiAnalysis.problemSummary}</p>
          </div>
          <div>
            <small>Informações que precisam ser verificadas:</small>
            <p>{occurrence.aiAnalysis.toVerify}</p>
          </div>
          <div>
            <small>Possíveis próximos passos:</small>
            <p>{occurrence.aiAnalysis.nextSteps}</p>
          </div>
          <div>
            <small>Dados ausentes que precisam ser solicitados:</small>
            <p>{occurrence.aiAnalysis.missingData}</p>
          </div>
        </div>
      </div>

      {role !== "funcionario" ? (
        <div className="detail-block">
          <h3>Deliberação administrativa (simulada)</h3>
          {pendAction ? (
            <div
              className="confirm-box"
              role="region"
              aria-label="Confirmação de ação"
            >
              <strong>Confirmar ação: “{pendAction.label}”?</strong>
              <p className="sub" style={{ margin: "4px 0 8px" }}>
                O status passará para <b>{pendAction.nextStatus}</b> e a ação
                será gravada no histórico de auditoria.
              </p>
              <label style={{ marginBottom: 8 }}>
                Observação do responsável (opcional)
                <input
                  placeholder="Ex.: Comprovante conferido pelo RH"
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
                  Confirmar deliberação
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
            <div className="action-buttons-grid">
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
      ) : (
        <div className="info-box">
          <strong>Visão do Funcionário</strong>
          <p>
            A deliberação sobre justificativas é restrita ao RH e à liderança.
            Você pode acompanhar todas as atualizações no histórico abaixo.
          </p>
        </div>
      )}

      <div className="detail-block">
        <h3>Histórico de alterações ({occurrence.history.length})</h3>
        <ul className="audit-timeline">
          {occurrence.history.map((h, i) => (
            <li key={i}>
              <div className="audit-top">
                <strong>{h.action}</strong>
                <span>{h.at}</span>
              </div>
              <div className="audit-by">Responsável: {h.by}</div>
              {h.note && <div className="audit-note">Nota: “{h.note}”</div>}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

