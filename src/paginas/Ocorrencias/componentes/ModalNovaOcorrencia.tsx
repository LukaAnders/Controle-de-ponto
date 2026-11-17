import { useState, useEffect, useRef } from "react";
import { Clock, X, Send, ArrowRight, ArrowLeft } from "lucide-react";
import TimepickerUI from "timepicker-ui";
import "timepicker-ui/main.css";
import { TODAY, formatDateBR, typeLabel } from "../../../dados/dadosSimulados";
import { Occ, OccType } from "../../../tipos";

interface ClockTimeInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
}

function ClockTimeInput({ id, label, value, onChange }: ClockTimeInputProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<TimepickerUI | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const picker = new TimepickerUI(wrapper, {
      clock: {
        type: "24h",
        autoSwitchToMinutes: true,
      },
      ui: {
        theme: "basic",
        enableSwitchIcon: true,
        animation: true,
        backdrop: true,
      },
      labels: {
        clockTitle: label,
        keyboardTitle: "Digitar horário",
        ok: "Confirmar",
        cancel: "Cancelar",
        hour: "Hora",
        minute: "Minuto",
      },
      callbacks: {
        onConfirm: (data) => {
          const hh = String(data.hour ?? "08").padStart(2, "0");
          const mm = String(data.minutes ?? "00").padStart(2, "0");
          onChangeRef.current(`${hh}:${mm}`);
        },
      },
    });

    picker.create();
    pickerRef.current = picker;

    return () => {
      picker.destroy({ keepInputValue: true });
      pickerRef.current = null;
    };
  }, [label]);

  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== value) {
      inputRef.current.value = value;
    }
  }, [value]);

  return (
    <div className="occ-clock-field">
      <label htmlFor={id} className="occ-field-label">
        {label}
      </label>
      <div className="tp-wrapper occ-clock-input-wrap" ref={wrapperRef}>
        <input
          id={id}
          ref={inputRef}
          type="text"
          readOnly
          className="tp-ui-input occ-clock-input"
          defaultValue={value}
          aria-label={`${label}: ${value}`}
        />
        <button
          type="button"
          className="occ-clock-trigger"
          data-open
          aria-label={`Abrir relógio para ${label}`}
        >
          <Clock size={15} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

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
  const [step, setStep] = useState<1 | 2>(1);
  const [newType, setNewType] = useState<OccType>("justificativa");
  const [newDate, setNewDate] = useState(TODAY);
  const [timeMode, setTimeMode] = useState<"intervalo" | "unico">("intervalo");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:30");
  const [singleTime, setSingleTime] = useState("17:00");
  const [newSummary, setNewSummary] = useState("");
  const [newJustification, setNewJustification] = useState("");
  const [formErr, setFormErr] = useState("");

  useEffect(() => {
    setTimeMode(newType === "incompleto" ? "unico" : "intervalo");
  }, [newType]);

  useEffect(() => {
    if (!open) {
      setStep(1);
      setFormErr("");
    }
  }, [open]);

  if (!open) return null;

  const formattedRelatedTime =
    timeMode === "intervalo"
      ? `${startTime} às ${endTime}`
      : `Registro às ${singleTime}`;

  const handleClose = () => {
    setStep(1);
    setFormErr("");
    onClose();
  };

  const handleNextStep = () => {
    if (!newDate) {
      setFormErr("Informe a data.");
      return;
    }
    setFormErr("");
    setStep(2);
  };

  const handleCreate = () => {
    if (!newSummary.trim() || !newJustification.trim()) {
      setFormErr("Preencha o motivo e a justificativa.");
      return;
    }

    addOcc({
      empId: targetEmpId,
      type: newType,
      date: newDate,
      relatedTime: formattedRelatedTime,
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
    setStep(1);
    onClose();
  };

  return (
    <div className="overlay" onClick={handleClose}>
      <div
        className="modal occ-new-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Nova justificativa"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header occ-modal-header">
          <div className="occ-modal-title-row">
            <h2>Nova justificativa</h2>
            <span className="occ-step-pill">{step}/2</span>
          </div>
          <button
            type="button"
            className="btn occ-close-btn"
            aria-label="Fechar"
            onClick={handleClose}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {formErr && (
          <div className="alert" role="alert">
            {formErr}
          </div>
        )}

        {step === 1 ? (
          <>
            <div className="occ-modal-form">
              <div className="occ-modal-row-2">
                <label className="occ-modal-field">
                  <span>Tipo</span>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as OccType)}
                  >
                    <option value="justificativa">
                      Justificativa de jornada
                    </option>
                    <option value="incompleto">
                      Registro incompleto
                    </option>
                    <option value="homeoffice">
                      Home office
                    </option>
                  </select>
                </label>

                <label className="occ-modal-field">
                  <span>Data</span>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => {
                      setNewDate(e.target.value);
                      if (formErr) setFormErr("");
                    }}
                  />
                </label>
              </div>

              <div className="occ-time-section">
                <div className="occ-time-section-head">
                  <span className="occ-field-label">Horário</span>
                  <div
                    className="occ-time-mode-tabs"
                    role="group"
                    aria-label="Formato de horário"
                  >
                    <button
                      type="button"
                      className={`occ-time-mode-btn ${
                        timeMode === "intervalo" ? "active" : ""
                      }`}
                      onClick={() => setTimeMode("intervalo")}
                    >
                      Intervalo
                    </button>
                    <button
                      type="button"
                      className={`occ-time-mode-btn ${
                        timeMode === "unico" ? "active" : ""
                      }`}
                      onClick={() => setTimeMode("unico")}
                    >
                      Único
                    </button>
                  </div>
                </div>

                {timeMode === "intervalo" ? (
                  <div className="occ-clock-grid">
                    <ClockTimeInput
                      id="occ-time-start"
                      label="Início"
                      value={startTime}
                      onChange={setStartTime}
                    />
                    <span className="occ-clock-sep" aria-hidden="true">
                      às
                    </span>
                    <ClockTimeInput
                      id="occ-time-end"
                      label="Término"
                      value={endTime}
                      onChange={setEndTime}
                    />
                  </div>
                ) : (
                  <div className="occ-clock-single">
                    <ClockTimeInput
                      id="occ-time-single"
                      label="Horário"
                      value={singleTime}
                      onChange={setSingleTime}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="occ-modal-footer occ-modal-footer-end">
              <button type="button" className="btn" onClick={handleClose}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn primary occ-submit-btn"
                onClick={handleNextStep}
              >
                <span>Continuar</span>
                <ArrowRight size={14} aria-hidden="true" />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="occ-modal-form">
              <div className="occ-step-chip-bar">
                <span>
                  {typeLabel[newType]} · {formatDateBR(newDate)} ·{" "}
                  {formattedRelatedTime}
                </span>
              </div>

              <label className="occ-modal-field">
                <span>Motivo *</span>
                <input
                  autoFocus
                  placeholder="Ex.: Esquecimento de batida no almoço"
                  value={newSummary}
                  onChange={(e) => {
                    setNewSummary(e.target.value);
                    if (formErr) setFormErr("");
                  }}
                />
              </label>

              <label className="occ-modal-field">
                <span>Justificativa *</span>
                <textarea
                  rows={3}
                  className="occ-modal-textarea"
                  placeholder="Descreva brevemente o ocorrido..."
                  value={newJustification}
                  onChange={(e) => {
                    setNewJustification(e.target.value);
                    if (formErr) setFormErr("");
                  }}
                />
              </label>
            </div>

            <div className="occ-modal-footer">
              <button
                type="button"
                className="btn occ-submit-btn"
                onClick={() => {
                  setFormErr("");
                  setStep(1);
                }}
              >
                <ArrowLeft size={14} aria-hidden="true" />
                <span>Voltar</span>
              </button>

              <div className="row" style={{ gap: 8 }}>
                <button type="button" className="btn" onClick={handleClose}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn primary occ-submit-btn"
                  onClick={handleCreate}
                >
                  <Send size={14} aria-hidden="true" />
                  <span>Enviar</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
