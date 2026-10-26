import { useState, useEffect } from "react";
import { formatDateBR, now } from "../../../data/mockData";
import { Employee, Rec } from "../../../types";

interface DigitalPunchCardProps {
  employee: Employee;
  isRemoteValid: boolean;
  isRemoteExpired: boolean;
  addRec: (r: Omit<Rec, "id" | "time">[]) => void;
  notify: (m: string) => void;
}

export default function DigitalPunchCard({
  employee,
  isRemoteValid,
  isRemoteExpired,
  addRec,
  notify,
}: DigitalPunchCardProps) {
  const [loc, setLoc] = useState<"empresa" | "home">("empresa");
  const [faceStep, setFaceStep] = useState<
    "idle" | "scanning" | "done" | "blocked"
  >("idle");
  const [feedback, setFeedback] = useState<{
    type: "ok" | "bad" | "info";
    text: string;
  } | null>(null);

  useEffect(() => {
    setFaceStep("idle");
    setFeedback(null);
  }, [employee.id]);

  const canPunchDigital = loc === "empresa" || isRemoteValid;

  const handleDigitalPunch = () => {
    if (!employee.active) {
      setFaceStep("blocked");
      setFeedback({
        type: "bad",
        text: `Operação impedida: o cadastro de ${employee.name} encontra-se Inativo.`,
      });
      return;
    }

    if (loc === "home" && !isRemoteValid) {
      setFaceStep("blocked");
      const reason = isRemoteExpired
        ? `a autorização remota de ${employee.name} venceu em ${formatDateBR(employee.remote.until)}.`
        : `${employee.name} não possui autorização de home office cadastrada pelo RH.`;
      setFeedback({
        type: "bad",
        text: `Registro bloqueado: ${reason} Solicite liberação ou altere o local para "Na empresa".`,
      });
      return;
    }

    setFaceStep("scanning");
    setFeedback({
      type: "info",
      text: "Executando verificação facial demonstrativa (nenhuma câmera ou imagem real é utilizada)…",
    });

    setTimeout(() => {
      setFaceStep("done");
      const detailText =
        loc === "home"
          ? `Ponto web (${employee.mode} · Home office autorizado até ${formatDateBR(employee.remote.until)})`
          : "Ponto web (Rede interna da empresa)";
      addRec([
        {
          empId: employee.id,
          modality: "Digital",
          kind: "Registro de ponto",
          detail: detailText,
          status: "Registrado",
        },
      ]);
      setFeedback({
        type: "ok",
        text: `Sucesso: Ponto digital registrado para ${employee.name} às ${now()} (${loc === "home" ? "Home office autorizado" : "Presencial"}).`,
      });
      notify(`Ponto digital simulado para ${employee.name}.`);
    }, 900);
  };

  return (
    <section className="card modality-card" aria-labelledby="mod-digital-title">
      <div className="modality-top">
        <div>
          <span className="modality-tag">MODALIDADE 1</span>
          <h2 id="mod-digital-title">Ponto digital</h2>
        </div>
        <span className={`badge ${canPunchDigital ? "ok" : "bad"}`}>
          {canPunchDigital ? "Apto para registro" : "Restrição remota"}
        </span>
      </div>

      <p className="sub">
        Registro em ambiente web/app com etapa de verificação facial
        demonstrativa. O uso em home office exige autorização ativa do RH.
      </p>

      <div className="modality-meta-list">
        <div>
          <span>Funcionário:</span>
          <strong>
            {employee.name} (Mat. {employee.reg})
          </strong>
        </div>
        <div>
          <span>Horário previsto:</span>
          <strong>{now()}</strong>
        </div>
      </div>

      <label>
        Local da simulação
        <select
          value={loc}
          onChange={(ev) => {
            setLoc(ev.target.value as "empresa" | "home");
            setFaceStep("idle");
            setFeedback(null);
          }}
        >
          <option value="empresa">Na empresa (Rede corporativa)</option>
          <option value="home">Em Home Office (Acesso externo)</option>
        </select>
      </label>

      <div className={`face-sim-box ${faceStep}`}>
        <div className="face-sim-icon" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            <circle cx="12" cy="10" r="3" />
            <path d="M7 18a5 5 0 0 1 10 0" />
          </svg>
        </div>
        <div className="face-sim-text">
          <strong>Verificação facial demonstrativa</strong>
          <small>
            {faceStep === "scanning"
              ? "Validando parâmetros simulados..."
              : faceStep === "done"
                ? "Validação simulada concluída (sem captura de imagem)"
                : faceStep === "blocked"
                  ? "Verificação interrompida por regra de permissão"
                  : "Simulação visual — nenhuma câmera real é acessada"}
          </small>
        </div>
      </div>

      <button
        type="button"
        className="btn primary full-btn"
        disabled={faceStep === "scanning"}
        onClick={handleDigitalPunch}
      >
        {faceStep === "scanning"
          ? "Simulando verificação..."
          : "Simular registro digital"}
      </button>

      {feedback && (
        <div className={`feedback-banner ${feedback.type}`} role="status">
          {feedback.text}
        </div>
      )}
    </section>
  );
}

