import { useState, useEffect } from "react";
import { useApp, SELF } from "../store";
import {
  OccStatus,
  OccType,
  Priority,
  typeLabel,
  depts,
  formatDateBR,
  TODAY,
} from "../data";

const actionsList: { label: string; nextStatus: OccStatus; variant: string }[] = [
  { label: "Aprovar justificativa", nextStatus: "Aprovada", variant: "primary" },
  { label: "Rejeitar justificativa", nextStatus: "Rejeitada", variant: "danger" },
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

const statusBadgeClass = (s: OccStatus) => {
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

const priorityBadgeClass = (p: Priority) => {
  switch (p) {
    case "Alta":
      return "bad";
    case "Média":
      return "warn";
    case "Baixa":
      return "";
  }
};

export default function Occurrences() {
  const { occs, employees, query, actOcc, addOcc, role } = useApp();
  const [st, setSt] = useState(query.open ? "abertas" : "");
  const [ty, setTy] = useState(query.type || "");
  const [deptFilter, setDeptFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState("");
  const [prioFilter, setPrioFilter] = useState("");
  const [search, setSearch] = useState("");
  const [sel, setSel] = useState(query.sel || "");
  const [pendAction, setPendAction] = useState<{
    label: string;
    nextStatus: OccStatus;
  } | null>(null);
  const [actionNote, setActionNote] = useState("");

  // Modal for new justification/solicitation
  const [showNewModal, setShowNewModal] = useState(false);
  const [newType, setNewType] = useState<OccType>("justificativa");
  const [newDate, setNewDate] = useState(TODAY);
  const [newTime, setNewTime] = useState("08:00 às 09:30");
  const [newSummary, setNewSummary] = useState("");
  const [newJustification, setNewJustification] = useState("");
  const [formErr, setFormErr] = useState("");

  useEffect(() => {
    if (query.type !== undefined) setTy(query.type);
    if (query.open) setSt("abertas");
    if (query.sel) setSel(query.sel);
  }, [query]);

  const getEmp = (id: string) => employees.find((e) => e.id === id);

  const list = occs.filter((o) => {
    const emp = getEmp(o.empId);
    const matchStatus =
      !st ||
      (st === "abertas"
        ? o.status === "Pendente" || o.status === "Em análise"
        : o.status === st);
    const matchType = !ty || o.type === ty;
    const matchDept = !deptFilter || emp?.dept === deptFilter;
    const matchPrio = !prioFilter || o.priority === prioFilter;
    const matchPeriod =
      !periodFilter ||
      (periodFilter === "hoje" && o.date === TODAY) ||
      (periodFilter === "recentes" && o.date >= "2026-10-24") ||
      (periodFilter === "outubro" && o.date.startsWith("2026-10"));
    const matchSearch =
      !search ||
      (emp?.name + " " + o.summary + " " + o.justification)
        .toLowerCase()
        .includes(search.toLowerCase());

    return (
      matchStatus &&
      matchType &&
      matchDept &&
      matchPrio &&
      matchPeriod &&
      matchSearch
    );
  });

  const selectedOcc =
    occs.find((x) => x.id === sel) || (list.length > 0 ? list[0] : null);
  const selectedEmp = selectedOcc ? getEmp(selectedOcc.empId) : null;

  const handleCreateOcc = () => {
    if (!newSummary.trim() || !newJustification.trim()) {
      setFormErr("Informe o motivo resumido e a justificativa detalhada.");
      return;
    }
    const targetEmpId =
      role === "funcionario" ? SELF : employees[0]?.id || SELF;
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
    setShowNewModal(false);
    setNewSummary("");
    setNewJustification("");
    setFormErr("");
  };

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <h1>Ocorrências e justificativas</h1>
          <p className="sub">
            {role === "funcionario"
              ? "Acompanhe suas ocorrências de jornada e envie justificativas para análise do RH."
              : "Central de análise de inconsistências de jornada, justificativas de ausência e autorizações de home office."}
          </p>
        </div>
        <button
          type="button"
          className="btn primary"
          onClick={() => {
            setFormErr("");
            setShowNewModal(true);
          }}
        >
          + Nova justificativa / solicitação
        </button>
      </div>

      {/* Complete Filter Bar */}
      <div className="card filter-bar">
        <label className="filter-item grow">
          <span>Buscar</span>
          <input
            placeholder="Funcionário ou resumo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        <label className="filter-item">
          <span>Status</span>
          <select value={st} onChange={(e) => setSt(e.target.value)}>
            <option value="">Todos os status</option>
            <option value="abertas">Abertas (Pendente + Em análise)</option>
            <option value="Pendente">Pendente</option>
            <option value="Em análise">Em análise</option>
            <option value="Aprovada">Aprovada</option>
            <option value="Rejeitada">Rejeitada</option>
            <option value="Encaminhada para revisão">
              Encaminhada para revisão
            </option>
          </select>
        </label>

        <label className="filter-item">
          <span>Tipo de ocorrência</span>
          <select value={ty} onChange={(e) => setTy(e.target.value)}>
            <option value="">Todos os tipos</option>
            {(Object.keys(typeLabel) as OccType[]).map((t) => (
              <option key={t} value={t}>
                {typeLabel[t]}
              </option>
            ))}
          </select>
        </label>

        {role !== "funcionario" && (
          <label className="filter-item">
            <span>Setor</span>
            <select
              value={deptFilter}
              disabled={role === "gestor"}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="">Todos os setores</option>
              {depts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="filter-item">
          <span>Período</span>
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
          >
            <option value="">Todas as datas</option>
            <option value="hoje">Hoje (26/10/2026)</option>
            <option value="recentes">Últimos 3 dias (24 a 26/10)</option>
            <option value="outubro">Outubro / 2026</option>
          </select>
        </label>

        <label className="filter-item">
          <span>Prioridade</span>
          <select
            value={prioFilter}
            onChange={(e) => setPrioFilter(e.target.value)}
          >
            <option value="">Todas</option>
            <option value="Alta">Alta</option>
            <option value="Média">Média</option>
            <option value="Baixa">Baixa</option>
          </select>
        </label>

        {(st || ty || deptFilter || periodFilter || prioFilter || search) && (
          <button
            type="button"
            className="btn"
            style={{ alignSelf: "flex-end" }}
            onClick={() => {
              setSt("");
              setTy("");
              setDeptFilter("");
              setPeriodFilter("");
              setPrioFilter("");
              setSearch("");
            }}
          >
            Limpar
          </button>
        )}
      </div>

      {/* Split Layout: Main Table + Detailed Side Panel */}
      <div className="split">
        <div className="card scroll">
          <div className="section-header" style={{ marginBottom: 4 }}>
            <h2>Ocorrências listadas ({list.length})</h2>
            <small className="sub" style={{ margin: 0 }}>
              Selecione uma linha para inspecionar os registros envolvidos, sugestão da IA e histórico.
            </small>
          </div>
          <table>
            <thead>
              <tr>
                <th>Funcionário</th>
                <th>Tipo da ocorrência</th>
                <th>Data e Horário</th>
                <th>Motivo / Resumo</th>
                <th>Solicitação</th>
                <th>Status</th>
                <th>Prioridade</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {list.map((x) => {
                const emp = getEmp(x.empId);
                const isSelected = selectedOcc?.id === x.id;
                return (
                  <tr
                    key={x.id}
                    className={isSelected ? "selected-row" : ""}
                  >
                    <td>
                      <strong>{emp?.name ?? "—"}</strong>
                      {emp && (
                        <div className="cell-sub">
                          {emp.dept} · Mat. {emp.reg}
                        </div>
                      )}
                    </td>
                    <td>{typeLabel[x.type]}</td>
                    <td>
                      <strong>{formatDateBR(x.date)}</strong>
                      <div className="cell-sub">{x.relatedTime}</div>
                    </td>
                    <td>{x.summary}</td>
                    <td className="muted-cell">{x.requestedAt}</td>
                    <td>
                      <span className={`badge ${statusBadgeClass(x.status)}`}>
                        Status: {x.status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${priorityBadgeClass(x.priority)}`}>
                        {x.priority}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`btn ${isSelected ? "primary-outline" : ""}`}
                        onClick={() => {
                          setSel(x.id);
                          setPendAction(null);
                          setActionNote("");
                        }}
                      >
                        Detalhes
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!list.length && (
                <tr>
                  <td colSpan={8} className="empty-cell">
                    Nenhuma ocorrência encontrada com os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Detailed Occurrence Side Panel */}
        {selectedOcc && (
          <aside
            className="card panel"
            aria-label={`Detalhes da ocorrência ${selectedOcc.id}`}
          >
            <div className="panel-header">
              <div>
                <span className="modality-tag">
                  PROTOCOLO #{selectedOcc.id.toUpperCase()} ·{" "}
                  {typeLabel[selectedOcc.type].toUpperCase()}
                </span>
                <h2>{selectedOcc.summary}</h2>
              </div>
              <span className={`badge ${statusBadgeClass(selectedOcc.status)}`}>
                {selectedOcc.status}
              </span>
            </div>

            <div className="detail-grid">
              <div>
                <small>Funcionário</small>
                <strong>
                  {selectedEmp?.name} (Mat. {selectedEmp?.reg})
                </strong>
              </div>
              <div>
                <small>Setor e Cargo</small>
                <strong>
                  {selectedEmp?.dept} · {selectedEmp?.role}
                </strong>
              </div>
              <div>
                <small>Data e horário relacionado</small>
                <strong>
                  {formatDateBR(selectedOcc.date)} · {selectedOcc.relatedTime}
                </strong>
              </div>
              <div>
                <small>Data da solicitação / prioridade</small>
                <strong>
                  {selectedOcc.requestedAt} ({selectedOcc.priority})
                </strong>
              </div>
            </div>

            <div className="detail-block">
              <h3>Justificativa apresentada</h3>
              <p className="quote-box">“{selectedOcc.justification}”</p>
            </div>

            <div className="detail-block">
              <h3>Registros envolvidos no dia</h3>
              <ul className="records-list">
                {selectedOcc.involvedRecords.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>

            <div className="detail-block">
              <h3>Observações relevantes</h3>
              <p className="sub" style={{ margin: 0 }}>
                {selectedOcc.notes}
              </p>
            </div>

            {/* AI Support Block */}
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
                  <p>{selectedOcc.aiAnalysis.problemSummary}</p>
                </div>
                <div>
                  <small>Informações que precisam ser verificadas:</small>
                  <p>{selectedOcc.aiAnalysis.toVerify}</p>
                </div>
                <div>
                  <small>Possíveis próximos passos:</small>
                  <p>{selectedOcc.aiAnalysis.nextSteps}</p>
                </div>
                <div>
                  <small>Dados ausentes que precisam ser solicitados:</small>
                  <p>{selectedOcc.aiAnalysis.missingData}</p>
                </div>
              </div>
            </div>

            {/* Simulated Actions for RH / Gestor */}
            {role !== "funcionario" ? (
              <div className="detail-block">
                <h3>Deliberação administrativa (simulada)</h3>
                {pendAction ? (
                  <div className="confirm-box" role="region" aria-label="Confirmação de ação">
                    <strong>
                      Confirmar ação: “{pendAction.label}”?
                    </strong>
                    <p className="sub" style={{ margin: "4px 0 8px" }}>
                      O status passará para <b>{pendAction.nextStatus}</b> e a ação será gravada no histórico de auditoria.
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
                            selectedOcc.id,
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
                  A deliberação sobre justificativas é restrita ao RH e à liderança. Você pode acompanhar todas as atualizações no histórico abaixo.
                </p>
              </div>
            )}

            {/* Audit History */}
            <div className="detail-block">
              <h3>Histórico de alterações ({selectedOcc.history.length})</h3>
              <ul className="audit-timeline">
                {selectedOcc.history.map((h, i) => (
                  <li key={i}>
                    <div className="audit-top">
                      <strong>{h.action}</strong>
                      <span>{h.at}</span>
                    </div>
                    <div className="audit-by">Responsável: {h.by}</div>
                    {h.note && (
                      <div className="audit-note">Nota: “{h.note}”</div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        )}
      </div>

      {/* Modal: Nova Justificativa / Solicitação */}
      {showNewModal && (
        <div className="overlay" onClick={() => setShowNewModal(false)}>
          <div
            className="modal modal-wide"
            role="dialog"
            aria-modal="true"
            aria-label="Registrar nova justificativa ou solicitação"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Nova justificativa / solicitação</h2>
              <button
                type="button"
                className="btn"
                onClick={() => setShowNewModal(false)}
              >
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

            <div className="row" style={{ justifyContent: "flex-end", marginTop: 8 }}>
              <button
                type="button"
                className="btn"
                onClick={() => setShowNewModal(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn primary"
                onClick={handleCreateOcc}
              >
                Enviar para análise
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
