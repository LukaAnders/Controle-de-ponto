import { useState } from "react";
import { now } from "../../../data/mockData";
import { Employee, Rec } from "../../../types";

interface ConventionalClockCardProps {
  employees: Employee[];
  addRec: (r: Omit<Rec, "id" | "time">[]) => void;
  notify: (m: string) => void;
}

export default function ConventionalClockCard({
  employees,
  addRec,
  notify,
}: ConventionalClockCardProps) {
  const [code, setCode] = useState("1001");
  const [feedback, setFeedback] = useState<{
    type: "ok" | "bad";
    text: string;
  } | null>(null);

  const handleConventional = () => {
    const cleanCode = code.trim();
    const found = employees.find((x) => x.reg === cleanCode);
    if (!found) {
      setFeedback({
        type: "bad",
        text: `Matrícula "${cleanCode || "vazia"}" não localizada entre os funcionários visíveis no seu perfil.`,
      });
      return;
    }
    if (!found.active) {
      setFeedback({
        type: "bad",
        text: `Matrícula ${found.reg} (${found.name}) está com cadastro inativo.`,
      });
      return;
    }
    addRec([
      {
        empId: found.id,
        modality: "Convencional",
        kind: "Registro de ponto",
        detail: `Comprovante simulado · Matrícula ${found.reg}`,
        status: "Registrado",
      },
    ]);
    setFeedback({
      type: "ok",
      text: `Comprovante demonstrativo emitido: ${found.name} (Mat. ${found.reg}) às ${now()}.`,
    });
    notify(`Relógio convencional: ponto registrado para ${found.name}.`);
  };

  return (
    <section className="card modality-card" aria-labelledby="mod-conv-title">
      <div className="modality-top">
        <div>
          <span className="modality-tag">MODALIDADE 3</span>
          <h2 id="mod-conv-title">Relógio convencional</h2>
        </div>
        <span className="badge">Equipamento REP</span>
      </div>

      <p className="sub">
        Representação de relógio de ponto tradicional de parede para marcação
        rápida por código de matrícula fictícia.
      </p>

      <div className="rep-display">
        <small>RELÓGIO DE PONTO DEMONSTRATIVO · REP-02</small>
        <div className="rep-time">{now()}</div>
      </div>

      <label htmlFor="rep-code-input">
        Código / Matrícula do funcionário
        <input
          id="rep-code-input"
          placeholder="Ex.: 1001, 1003, 1005"
          value={code}
          onChange={(ev) => setCode(ev.target.value)}
          onKeyDown={(ev) => ev.key === "Enter" && handleConventional()}
        />
      </label>

      <div
        className="quick-codes"
        aria-label="Atalhos de matrículas disponíveis"
      >
        <span>Matrículas rápidas:</span>
        {employees.slice(0, 4).map((emp) => (
          <button
            key={emp.id}
            type="button"
            className={`chip-btn ${code === emp.reg ? "active" : ""}`}
            onClick={() => setCode(emp.reg)}
          >
            {emp.reg} ({emp.name.split(" ")[0]})
          </button>
        ))}
      </div>

      <button
        type="button"
        className="btn primary full-btn"
        onClick={handleConventional}
      >
        Simular registro no relógio
      </button>

      {feedback && (
        <div className={`feedback-banner ${feedback.type}`} role="status">
          {feedback.text}
        </div>
      )}
    </section>
  );
}

