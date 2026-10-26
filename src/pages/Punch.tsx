import { useState, useEffect } from "react";
import { useApp, SELF } from "../store";
import { TODAY, now, formatDateBR } from "../data";

export default function Punch() {
  const { employees, recs, addRec, role, notify, go } = useApp();
  const [empId, setEmpId] = useState(
    role === "funcionario" ? SELF : employees[0]?.id || "e1",
  );
  const [loc, setLoc] = useState<"empresa" | "home">("empresa");
  const [faceStep, setFaceStep] = useState<"idle" | "scanning" | "done" | "blocked">("idle");
  const [digitalFeedback, setDigitalFeedback] = useState<{
    type: "ok" | "bad" | "info";
    text: string;
  } | null>(null);

  const [turnstileFeedback, setTurnstileFeedback] = useState<string>(
    "Terminal pronto. Selecione a operação desejada.",
  );

  const [code, setCode] = useState("1001");
  const [clockFeedback, setClockFeedback] = useState<{
    type: "ok" | "bad";
    text: string;
  } | null>(null);

  const [histFilter, setHistFilter] = useState<string>("all");

  useEffect(() => {
    if (role === "funcionario") {
      setEmpId(SELF);
    } else if (!employees.some((x) => x.id === empId) && employees[0]) {
      setEmpId(employees[0].id);
    }
  }, [role, employees, empId]);

  const e = employees.find((x) => x.id === empId) || employees[0];

  const isRemoteExpired =
    e && e.remote.allowed && e.remote.until !== "" && e.remote.until < TODAY;
  const isRemoteValid =
    e && e.remote.allowed && e.remote.until >= TODAY;
  const canPunchDigital = loc === "empresa" || Boolean(isRemoteValid);

  const handleDigitalPunch = () => {
    if (!e) return;
    if (!e.active) {
      setFaceStep("blocked");
      setDigitalFeedback({
        type: "bad",
        text: `Operação impedida: o cadastro de ${e.name} encontra-se Inativo.`,
      });
      return;
    }

    if (loc === "home" && !isRemoteValid) {
      setFaceStep("blocked");
      const reason = isRemoteExpired
        ? `a autorização remota de ${e.name} venceu em ${formatDateBR(e.remote.until)}.`
        : `${e.name} não possui autorização de home office cadastrada pelo RH.`;
      setDigitalFeedback({
        type: "bad",
        text: `Registro bloqueado: ${reason} Solicite liberação ou altere o local para "Na empresa".`,
      });
      return;
    }

    setFaceStep("scanning");
    setDigitalFeedback({
      type: "info",
      text: "Executando verificação facial demonstrativa (nenhuma câmera ou imagem real é utilizada)…",
    });

    setTimeout(() => {
      setFaceStep("done");
      const detailText =
        loc === "home"
          ? `Ponto web (${e.mode} · Home office autorizado até ${formatDateBR(e.remote.until)})`
          : "Ponto web (Rede interna da empresa)";
      addRec([
        {
          empId: e.id,
          modality: "Digital",
          kind: "Registro de ponto",
          detail: detailText,
          status: "Registrado",
        },
      ]);
      setDigitalFeedback({
        type: "ok",
        text: `Sucesso: Ponto digital registrado para ${e.name} às ${now()} (${loc === "home" ? "Home office autorizado" : "Presencial"}).`,
      });
      notify(`Ponto digital simulado para ${e.name}.`);
    }, 900);
  };

  const handleCatraca = (withAttendance: boolean) => {
    if (!e) return;
    if (!e.active) {
      setTurnstileFeedback(
        `Acesso negado: cadastro de ${e.name} está inativo.`,
      );
      return;
    }

    if (withAttendance) {
      addRec([
        {
          empId: e.id,
          modality: "Catraca",
          kind: "Registro de ponto",
          detail: "Marcação de jornada no terminal biométrico",
          status: "Ponto validado",
        },
        {
          empId: e.id,
          modality: "Catraca",
          kind: "Evento de acesso",
          detail: "Passagem física associada ao registro de ponto",
          status: "Acesso físico",
        },
      ]);
      setTurnstileFeedback(
        `Confirmado para ${e.name}: (1) Registro de jornada gravado + (2) Evento de acesso físico registrado separadamente.`,
      );
      notify("Catraca: Registro de ponto + Evento de acesso criados.");
    } else {
      addRec([
        {
          empId: e.id,
          modality: "Catraca",
          kind: "Evento de acesso",
          detail: "Apenas entrada/saída física (sem impacto na jornada)",
          status: "Acesso físico",
        },
      ]);
      setTurnstileFeedback(
        `Confirmado para ${e.name}: Registrado SOMENTE Evento de acesso físico. Nenhum registro de ponto foi gerado.`,
      );
      notify("Catraca: Apenas evento de acesso registrado (sem ponto).");
    }
  };

  const handleConventional = () => {
    const cleanCode = code.trim();
    const found = employees.find((x) => x.reg === cleanCode);
    if (!found) {
      setClockFeedback({
        type: "bad",
        text: `Matrícula "${cleanCode || "vazia"}" não localizada entre os funcionários visíveis no seu perfil.`,
      });
      return;
    }
    if (!found.active) {
      setClockFeedback({
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
    setClockFeedback({
      type: "ok",
      text: `Comprovante demonstrativo emitido: ${found.name} (Mat. ${found.reg}) às ${now()}.`,
    });
    notify(`Relógio convencional: ponto registrado para ${found.name}.`);
  };

  const filteredRecs = recs.filter((r) => {
    if (histFilter === "ponto") return r.kind === "Registro de ponto";
    if (histFilter === "acesso") return r.kind === "Evento de acesso";
    if (histFilter === "Digital" || histFilter === "Catraca" || histFilter === "Convencional") {
      return r.modality === histFilter;
    }
    return true;
  });

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <h1>Central de Ponto</h1>
          <p className="sub">
            Simule e compare as três modalidades de registro de jornada e controle de acesso. Todas as interações são locais e demonstrativas.
          </p>
        </div>
        <div className="clock-pill" aria-label="Horário demonstrativo do sistema">
          <span>Horário do servidor simulado:</span>
          <strong>{now()}</strong>
        </div>
      </div>

      {/* Employee Context Selector */}
      {e && (
        <section className="card employee-context-bar" aria-label="Funcionário selecionado para simulação">
          <div className="context-select-group">
            <label htmlFor="punch-emp-select">
              Funcionário em simulação (Ponto Digital e Catraca)
            </label>
            <select
              id="punch-emp-select"
              value={e.id}
              disabled={role === "funcionario"}
              onChange={(ev) => {
                setEmpId(ev.target.value);
                setFaceStep("idle");
                setDigitalFeedback(null);
              }}
            >
              {employees.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name} · Mat. {x.reg} ({x.dept} — {x.mode})
                </option>
              ))}
            </select>
          </div>

          <div className="context-meta">
            <div className="meta-item">
              <small>Modalidade e Escala</small>
              <strong>
                {e.mode} · {e.schedule}
              </strong>
            </div>
            <div className="meta-item">
              <small>Regra de Home Office</small>
              <div>
                {isRemoteValid ? (
                  <span className="badge ok">
                    Autorizado até {formatDateBR(e.remote.until)}
                  </span>
                ) : isRemoteExpired ? (
                  <span className="badge bad">
                    Autorização vencida em {formatDateBR(e.remote.until)}
                  </span>
                ) : (
                  <span className="badge warn">Sem permissão remota ativa</span>
                )}
              </div>
            </div>
            {role === "rh" && (
              <button
                type="button"
                className="btn"
                onClick={() => go("employees")}
              >
                Gerenciar permissão
              </button>
            )}
          </div>
        </section>
      )}

      {/* Three Modalities */}
      <div className="grid3 modalities-grid">
        {/* A. Ponto Digital */}
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
            Registro em ambiente web/app com etapa de verificação facial demonstrativa. O uso em home office exige autorização ativa do RH.
          </p>

          <div className="modality-meta-list">
            <div>
              <span>Funcionário:</span>
              <strong>{e?.name} (Mat. {e?.reg})</strong>
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
                setDigitalFeedback(null);
              }}
            >
              <option value="empresa">Na empresa (Rede corporativa)</option>
              <option value="home">Em Home Office (Acesso externo)</option>
            </select>
          </label>

          {/* Simulated Facial Verification Box */}
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

          {digitalFeedback && (
            <div
              className={`feedback-banner ${digitalFeedback.type}`}
              role="status"
            >
              {digitalFeedback.text}
            </div>
          )}
        </section>

        {/* B. Catraca Biométrica */}
        <section className="card modality-card" aria-labelledby="mod-catraca-title">
          <div className="modality-top">
            <div>
              <span className="modality-tag">MODALIDADE 2</span>
              <h2 id="mod-catraca-title">Catraca biométrica</h2>
            </div>
            <span className="badge info">Terminal Portaria</span>
          </div>

          <p className="sub">
            Simula o terminal de portaria onde o colaborador escolhe entre registrar sua jornada ou realizar apenas circulação física (eventos tratados separadamente).
          </p>

          <div className="terminal-screen">
            <div className="terminal-top">
              <span>TERMINAL T-01 · RECEPÇÃO</span>
              <span>{now().split(" ")[1]}</span>
            </div>
            <div className="terminal-user">
              Identificado: <strong>{e?.name}</strong> (Mat. {e?.reg})
            </div>
            <div className="terminal-msg">{turnstileFeedback}</div>
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
            Nota: “Apenas entrada/saída” registra somente o evento físico de portaria, sem gerar batida na folha de ponto e sem acionar equipamento real.
          </small>
        </section>

        {/* C. Relógio Convencional */}
        <section className="card modality-card" aria-labelledby="mod-conv-title">
          <div className="modality-top">
            <div>
              <span className="modality-tag">MODALIDADE 3</span>
              <h2 id="mod-conv-title">Relógio convencional</h2>
            </div>
            <span className="badge">Equipamento REP</span>
          </div>

          <p className="sub">
            Representação de relógio de ponto tradicional de parede para marcação rápida por código de matrícula fictícia.
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

          <div className="quick-codes" aria-label="Atalhos de matrículas disponíveis">
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

          {clockFeedback && (
            <div
              className={`feedback-banner ${clockFeedback.type}`}
              role="status"
            >
              {clockFeedback.text}
            </div>
          )}
        </section>
      </div>

      {/* Central History */}
      <section className="card" aria-labelledby="punch-history-title">
        <div className="section-header">
          <div>
            <h2 id="punch-history-title">Histórico recente da Central</h2>
            <p className="sub" style={{ margin: "2px 0 0" }}>
              Acompanhe os registros de jornada e os eventos de acesso físico gerados nas simulações acima.
            </p>
          </div>

          <div className="row">
            <label className="inline-filter">
              <span>Filtrar visualização:</span>
              <select
                value={histFilter}
                onChange={(ev) => setHistFilter(ev.target.value)}
              >
                <option value="all">Todos os eventos ({recs.length})</option>
                <option value="ponto">Somente Registros de ponto</option>
                <option value="acesso">Somente Eventos de acesso físico</option>
                <option value="Digital">Modalidade: Ponto digital</option>
                <option value="Catraca">Modalidade: Catraca biométrica</option>
                <option value="Convencional">Modalidade: Relógio convencional</option>
              </select>
            </label>
          </div>
        </div>

        <div className="scroll">
          <table>
            <thead>
              <tr>
                <th>Funcionário</th>
                <th>Modalidade</th>
                <th>Tipo de evento</th>
                <th>Detalhamento</th>
                <th>Data e hora</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecs.map((r) => {
                const empObj = employees.find((x) => x.id === r.empId);
                const isAccessOnly = r.kind === "Evento de acesso";
                return (
                  <tr key={r.id}>
                    <td>
                      <strong>{empObj?.name ?? "Colaborador"}</strong>
                      {empObj && (
                        <div className="cell-sub">Mat. {empObj.reg} · {empObj.dept}</div>
                      )}
                    </td>
                    <td>{r.modality}</td>
                    <td>
                      <span className={`badge ${isAccessOnly ? "info" : "ok"}`}>
                        {r.kind}
                      </span>
                    </td>
                    <td className="muted-cell">{r.detail ?? "Operação simulada"}</td>
                    <td>{r.time}</td>
                    <td>
                      <span className={`badge ${isAccessOnly ? "" : "ok"}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredRecs.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-cell">
                    Nenhum registro encontrado para o filtro selecionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
