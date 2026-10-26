import { useState } from "react";
import { TODAY, typeLabel } from "../../../data/mockData";
import { Occ, OccType } from "../../../types";

interface NewOccurrenceModalProps {
  open: boolean;
  targetEmpId: string;
  onClose: () => void;
  addOcc: (o: Omit<Occ, "id" | "requestedAt" | "history" | "status">) => void;
}

export default function NewOccurrenceModal({
  open,
  targetEmpId,
  onClose,
  addOcc,
}: NewOccurrenceModalProps) {
  const [newType, setNewType] = useState<OccType>("justificativa");
  const [newDate, setNewDate] = useState(TODAY);
  const [newTime, setNewTime] = useState("08:00 às 09:30");
  const [newSummary, setNewSummary] = useState("");
  const [newJustification, setNewJustification] = useState("");
  const [formErr, setFormErr] = useState("");

  if (!open) return null;

  const handleCreate = () => {
    if (!newSummary.trim() || !newJustification.trim()) {
      setFormErr("Informe o motivo resumido e a justificativa detalhada.");
      return;
    }
    addOcc({
      empId: targetEmpId,
      type: newType,
      date: newDate,
      relatedTime: newTime || "Horário comercial",
      summary: newSummary.trim(),
      justification: newJustification.trim(),
      involvedRecords: ["Marcação informada manualmente pelo solicitante"],
      notes: "Solicitação aberta pelo painel demonstrativo.",
      priority: newType === "homeoffice" ? "Alta" : "Média",
      aiAnalysis: {
        problemSummary: `Nova solicitação de ${typeLabel[newType].toLowerCase()}: "${newSummary.trim()}".`,
        toVerify:
          "Conferir registros de ponto da data informada e documentos comprobatórios anexos.",
        nextSteps:
          "Analisar justificativa apresentada e deliberar sobre aprovação ou pedido de esclarecimento.",
        missingData: "Validação formal da liderança imediata.",
      },
    });
    setNewSummary("");
    setNewJustification("");
    setFormErr("");
    onClose();
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="modal modal-wide"
        role="dialog"
        aria-modal="true"
        aria-label="Registrar nova justificativa ou solicitação"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Nova justificativa / solicitação</h2>
          <button type="button" className="btn" onClick={onClose}>
            Fechar
          </button>
        </div>

        {formErr && (
          <div className="alert" role="alert">
            {formErr}
          </div>
        )}

        <div className="form-grid">
          <label>
            Tipo da solicitação
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as OccType)}
            >
              <option value="justificativa">Justificativa de jornada</option>
              <option value="incompleto">Ajuste de registro incompleto</option>
              <option value="homeoffice">Autorização de home office</option>
            </select>
          </label>

          <label>
            Data da ocorrência
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
          </label>

          <label style={{ gridColumn: "1 / -1" }}>
            Horário relacionado
            <input
              placeholder="Ex.: 08:00 às 09:15 ou Saída às 17:00"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
            />
          </label>

          <label style={{ gridColumn: "1 / -1" }}>
            Motivo resumido *
            <input
              placeholder="Ex.: Esquecimento de batida no retorno do almoço"
              value={newSummary}
              onChange={(e) => setNewSummary(e.target.value)}
            />
          </label>

          <label style={{ gridColumn: "1 / -1" }}>
            Justificativa detalhada *
            <input
              placeholder="Descreva o motivo para análise do RH..."
              value={newJustification}
              onChange={(e) => setNewJustification(e.target.value)}
            />
          </label>
        </div>

        <div
          className="row"
          style={{ justifyContent: "flex-end", marginTop: 8 }}
        >
          <button type="button" className="btn" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="btn primary" onClick={handleCreate}>
            Enviar para análise
          </button>
        </div>
      </div>
    </div>
  );
}

