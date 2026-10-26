import { useState } from "react";
import { now } from "../../../data/mockData";
import { Employee, Rec } from "../../../types";

interface BiometricTurnstileCardProps {
  employee: Employee;
  addRec: (r: Omit<Rec, "id" | "time">[]) => void;
  notify: (m: string) => void;
}

export default function BiometricTurnstileCard({
  employee,
  addRec,
  notify,
}: BiometricTurnstileCardProps) {
  const [feedback, setFeedback] = useState<string>(
    "Terminal pronto. Selecione a operação desejada.",
  );

  const handleCatraca = (withAttendance: boolean) => {
    if (!employee.active) {
      setFeedback(`Acesso negado: cadastro de ${employee.name} está inativo.`);
      return;
    }

    if (withAttendance) {
      addRec([
        {
          empId: employee.id,
          modality: "Catraca",
          kind: "Registro de ponto",
          detail: "Marcação de jornada no terminal biométrico",
          status: "Ponto validado",
        },
        {
          empId: employee.id,
          modality: "Catraca",
          kind: "Evento de acesso",
          detail: "Passagem física associada ao registro de ponto",
          status: "Acesso físico",
        },
      ]);
      setFeedback(
        `Confirmado para ${employee.name}: (1) Registro de jornada gravado + (2) Evento de acesso físico registrado separadamente.`,
      );
      notify("Catraca: Registro de ponto + Evento de acesso criados.");
    } else {
      addRec([
        {
          empId: employee.id,
          modality: "Catraca",
          kind: "Evento de acesso",
          detail: "Apenas entrada/saída física (sem impacto na jornada)",
          status: "Acesso físico",
        },
      ]);
      setFeedback(
        `Confirmado para ${employee.name}: Registrado SOMENTE Evento de acesso físico. Nenhum registro de ponto foi gerado.`,
      );
      notify("Catraca: Apenas evento de acesso registrado (sem ponto).");
    }
  };

  return (
    <section className="card modality-card" aria-labelledby="mod-catraca-title">
      <div className="modality-top">
        <div>
          <span className="modality-tag">MODALIDADE 2</span>
          <h2 id="mod-catraca-title">Catraca biométrica</h2>
        </div>
        <span className="badge info">Terminal Portaria</span>
      </div>

      <p className="sub">
        Simula o terminal de portaria onde o colaborador escolhe entre registrar
        sua jornada ou realizar apenas circulação física (eventos tratados
        separadamente).
      </p>

      <div className="terminal-screen">
        <div className="terminal-top">
          <span>TERMINAL T-01 · RECEPÇÃO</span>
          <span>{now().split(" ")[1]}</span>
        </div>
        <div className="terminal-user">
          Identificado: <strong>{employee.name}</strong> (Mat. {employee.reg})
        </div>
        <div className="terminal-msg">{feedback}</div>
      </div>

      <div className="catraca-actions">
        <button
          type="button"
          className="btn primary full-btn"
          onClick={() => handleCatraca(true)}
        >
          1. Registrar ponto (Jornada + Acesso)
        </button>
        <button
          type="button"
          className="btn full-btn"
          onClick={() => handleCatraca(false)}
        >
          2. Apenas entrada/saída (Somente Acesso)
        </button>
      </div>

      <small className="helper-note">
        Nota: “Apenas entrada/saída” registra somente o evento físico de
        portaria, sem gerar batida na folha de ponto e sem acionar equipamento
        real.
      </small>
    </section>
  );
}
