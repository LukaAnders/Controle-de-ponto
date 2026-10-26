import { useState } from "react";
import { useApp, roles } from "../store";
import {
  Employee,
  Mode,
  depts,
  TODAY,
  formatDateBR,
  typeLabel,
} from "../data";

const blank = (): Employee => ({
  id: "e" + Date.now(),
  name: "",
  reg: "",
  dept: depts[0],
  role: "",
  mode: "Presencial",
  schedule: "08:00 às 17:00 (1h intervalo)",
  active: true,
  remote: {
    allowed: false,
    until: "2026-12-31",
    by: "Marina Costa (RH)",
  },
});

export default function Employees() {
  const { employees, recs, occs, saveEmployee, go, role } = useApp();
  const [q, setQ] = useState("");
  const [d, setD] = useState("");
  const [s, setS] = useState("");
  const [m, setM] = useState("");
  const [ed, setEd] = useState<Employee | null>(null);
  const [detailId, setDetailId] = useState<string>("");
  const [err, setErr] = useState("");

  const list = employees.filter(
    (e) =>
      (e.name + " " + e.reg + " " + e.role)
        .toLowerCase()
        .includes(q.toLowerCase()) &&
      (!d || e.dept === d) &&
      (!m || e.mode === m) &&
      (!s || (s === "a") === e.active),
  );

  const selectedEmp = employees.find((e) => e.id === detailId) || null;
  const empRecs = selectedEmp
    ? recs.filter((r) => r.empId === selectedEmp.id)
    : [];
  const empOccs = selectedEmp
    ? occs.filter((o) => o.empId === selectedEmp.id)
    : [];

  const save = () => {
    if (!ed) return;
    if (!ed.name.trim() || !ed.reg.trim() || !ed.role.trim()) {
      setErr("Preencha todos os campos obrigatórios: Nome, Matrícula e Cargo.");
      return;
    }
    const duplicateReg = employees.some(
      (x) => x.reg.trim() === ed.reg.trim() && x.id !== ed.id,
    );
    if (duplicateReg) {
      setErr(`A matrícula ${ed.reg} já pertence a outro funcionário cadastrado.`);
      return;
    }
    if (ed.remote.allowed && (!ed.remote.until || !ed.remote.by.trim())) {
      setErr(
        "Para conceder permissão de registro remoto, informe a data de validade e o responsável pela autorização.",
      );
      return;
    }
    saveEmployee(ed);
    setDetailId(ed.id);
    setEd(null);
    setErr("");
  };

  const setField = (p: Partial<Employee>) => setEd({ ...ed!, ...p });

  const renderRemoteBadge = (e: Employee) => {
    if (!e.remote.allowed) {
      return <span className="badge">Sem permissão</span>;
    }
    if (e.remote.until < TODAY) {
      return (
        <span className="badge bad">
          Vencida ({formatDateBR(e.remote.until)})
        </span>
      );
    }
    return (
      <span className="badge ok">
        Autorizado até {formatDateBR(e.remote.until)}
      </span>
    );
  };

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <h1>Funcionários</h1>
          <p className="sub">
            {role === "gestor"
              ? "Consulta de colaboradores alocados no setor de Tecnologia."
              : "Gerencie o quadro de funcionários fictícios, modalidades de trabalho e autorizações de home office."}
          </p>
        </div>
        {role === "rh" && (
          <button
            type="button"
            className="btn primary"
            onClick={() => {
              setErr("");
              setEd(blank());
            }}
          >
            + Novo funcionário
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card filter-bar">
        <label className="filter-item grow">
          <span>Pesquisar colaborador</span>
          <input
            aria-label="Pesquisar por nome, matrícula ou cargo"
            placeholder="Nome, matrícula (ex.: 1001) ou cargo..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>

        <label className="filter-item">
          <span>Setor</span>
          <select
            aria-label="Setor"
            value={d}
            disabled={role === "gestor"}
            onChange={(e) => setD(e.target.value)}
          >
            <option value="">Todos os setores</option>
            {depts.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-item">
          <span>Modalidade de trabalho</span>
          <select
            aria-label="Modalidade"
            value={m}
            onChange={(e) => setM(e.target.value)}
          >
            <option value="">Todas as modalidades</option>
            {["Presencial", "Híbrido", "Remoto"].map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-item">
          <span>Situação cadastral</span>
          <select
            aria-label="Situação"
            value={s}
            onChange={(e) => setS(e.target.value)}
          >
            <option value="">Todas as situações</option>
            <option value="a">Ativo</option>
            <option value="i">Inativo</option>
          </select>
        </label>

        {(q || d || s || m) && (
          <button
            type="button"
            className="btn"
            style={{ alignSelf: "flex-end" }}
            onClick={() => {
              setQ("");
              setD("");
              setS("");
              setM("");
            }}
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Main Split: Table + Employee Detail Drawer */}
      <div className="split">
        <div className="card scroll">
          <div className="section-header" style={{ marginBottom: 4 }}>
            <h2>Quadro de colaboradores ({list.length})</h2>
            <small className="sub" style={{ margin: 0 }}>
              Clique em “Detalhes” para inspecionar histórico de ponto, ocorrências e permissões.
            </small>
          </div>
          <table>
            <thead>
              <tr>
                <th>Funcionário</th>
                <th>Matrícula</th>
                <th>Setor</th>
                <th>Cargo</th>
                <th>Modalidade</th>
                <th>Ponto em Home Office</th>
                <th>Situação</th>
                <th style={{ textAlign: "right" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {list.map((e) => (
                <tr
                  key={e.id}
                  className={detailId === e.id ? "selected-row" : ""}
                >
                  <td>
                    <strong>{e.name}</strong>
                  </td>
                  <td>
                    <code>{e.reg}</code>
                  </td>
                  <td>{e.dept}</td>
                  <td>{e.role}</td>
                  <td>
                    <span className="badge info">{e.mode}</span>
                  </td>
                  <td>{renderRemoteBadge(e)}</td>
                  <td>
                    <span className={"badge " + (e.active ? "ok" : "bad")}>
                      {e.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div className="row" style={{ justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        className="btn"
                        onClick={() =>
                          setDetailId(detailId === e.id ? "" : e.id)
                        }
                      >
                        {detailId === e.id ? "Fechar" : "Detalhes"}
                      </button>
                      {role === "rh" && (
                        <>
                          <button
                            type="button"
                            className="btn"
                            onClick={() => {
                              setErr("");
                              setEd({
                                ...e,
                                remote: {
                                  allowed: e.remote.allowed,
                                  until: e.remote.until || "2026-12-31",
                                  by: e.remote.by || roles[role].user + " (RH)",
                                },
                              });
                            }}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="btn"
                            onClick={() =>
                              saveEmployee({ ...e, active: !e.active })
                            }
                          >
                            {e.active ? "Desativar" : "Ativar"}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!list.length && (
                <tr>
                  <td colSpan={8} className="empty-cell">
                    Nenhum funcionário encontrado com os critérios atuais. Ajuste a busca ou limpe os filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Employee Details Side Panel */}
        {selectedEmp && (
          <aside className="card panel" aria-label={`Detalhes de ${selectedEmp.name}`}>
            <div className="panel-header">
              <div>
                <span className="modality-tag">FICHA DO COLABORADOR</span>
                <h2>{selectedEmp.name}</h2>
                <p className="sub" style={{ margin: 0 }}>
                  Matrícula {selectedEmp.reg} · {selectedEmp.role} ({selectedEmp.dept})
                </p>
              </div>
              <button
                type="button"
                className="btn"
                onClick={() => setDetailId("")}
              >
                Fechar
              </button>
            </div>

            <div className="detail-grid">
              <div>
                <small>Modalidade contratual</small>
                <strong>{selectedEmp.mode}</strong>
              </div>
              <div>
                <small>Situação cadastral</small>
                <div>
                  <span className={`badge ${selectedEmp.active ? "ok" : "bad"}`}>
                    {selectedEmp.active ? "Ativo" : "Inativo"}
                  </span>
                </div>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <small>Escala demonstrativa</small>
                <strong>{selectedEmp.schedule}</strong>
              </div>
            </div>

            <div className="info-box">
              <strong>Autorização de Ponto Digital em Home Office</strong>
              {selectedEmp.remote.allowed ? (
                <p>
                  Status:{" "}
                  {selectedEmp.remote.until >= TODAY ? (
                    <b style={{ color: "var(--ok)" }}>Ativa e válida</b>
                  ) : (
                    <b style={{ color: "var(--bad)" }}>Expirada</b>
                  )}
                  <br />
                  Validade: <b>{formatDateBR(selectedEmp.remote.until)}</b>
                  <br />
                  Responsável pela liberação: <b>{selectedEmp.remote.by}</b>
                </p>
              ) : (
                <p>
                  Este funcionário <b>não possui</b> autorização ativa para registrar ponto digital fora das dependências da empresa.
                </p>
              )}
              {role === "rh" && (
                <div style={{ marginTop: 8 }}>
                  <button
                    type="button"
                    className="btn primary-outline"
                    onClick={() => {
                      setErr("");
                      setEd({
                        ...selectedEmp,
                        remote: {
                          allowed: selectedEmp.remote.allowed,
                          until: selectedEmp.remote.until || "2026-12-31",
                          by:
                            selectedEmp.remote.by ||
                            `${roles[role].user} (RH)`,
                        },
                      });
                    }}
                  >
                    Configurar permissão remota
                  </button>
                </div>
              )}
            </div>

            <div>
              <h3>Registros recentes ({empRecs.length})</h3>
              {empRecs.length > 0 ? (
                <ul className="compact-list">
                  {empRecs.slice(0, 4).map((r) => (
                    <li key={r.id}>
                      <span>
                        <b>{r.time}</b> — {r.modality} ({r.kind})
                      </span>
                      <span className="badge ok">{r.status}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="sub">Nenhum registro recente simulado para este funcionário.</p>
              )}
            </div>

            <div>
              <h3>Ocorrências associadas ({empOccs.length})</h3>
              {empOccs.length > 0 ? (
                <ul className="compact-list">
                  {empOccs.map((o) => (
                    <li key={o.id}>
                      <div>
                        <b>{formatDateBR(o.date)}</b> · {typeLabel[o.type]}
                        <div className="cell-sub">{o.summary}</div>
                      </div>
                      <button
                        type="button"
                        className="btn"
                        onClick={() => go("occurrences", { sel: o.id })}
                      >
                        Abrir ({o.status})
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="sub">Nenhuma ocorrência vinculada.</p>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* Create / Edit Modal */}
      {ed && (
        <div className="overlay" onClick={() => setEd(null)}>
          <div
            className="modal modal-wide"
            role="dialog"
            aria-modal="true"
            aria-label="Formulário de Funcionário"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                {employees.some((x) => x.id === ed.id)
                  ? `Editar funcionário: ${ed.name}`
                  : "Cadastrar novo funcionário"}
              </h2>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setEd(null);
                  setErr("");
                }}
              >
                Fechar
              </button>
            </div>

            {err && (
              <div className="alert" role="alert">
                {err}
              </div>
            )}

            <div className="form-grid">
              <label>
                Nome completo *
                <input
                  placeholder="Ex.: Lucas Ferreira"
                  value={ed.name}
                  onChange={(e) => setField({ name: e.target.value })}
                />
              </label>

              <label>
                Matrícula fictícia *
                <input
                  placeholder="Ex.: 1009"
                  value={ed.reg}
                  onChange={(e) => setField({ reg: e.target.value })}
                />
              </label>

              <label>
                Cargo *
                <input
                  placeholder="Ex.: Analista de Produto"
                  value={ed.role}
                  onChange={(e) => setField({ role: e.target.value })}
                />
              </label>

              <label>
                Setor
                <select
                  value={ed.dept}
                  onChange={(e) => setField({ dept: e.target.value })}
                >
                  {depts.map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Modalidade de trabalho
                <select
                  value={ed.mode}
                  onChange={(e) => setField({ mode: e.target.value as Mode })}
                >
                  {["Presencial", "Híbrido", "Remoto"].map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Escala de trabalho
                <input
                  value={ed.schedule}
                  onChange={(e) => setField({ schedule: e.target.value })}
                />
              </label>
            </div>

            <div className="info-box" style={{ marginTop: 4 }}>
              <strong>Permissão de Ponto Digital em Home Office</strong>
              <p style={{ marginBottom: 8 }}>
                Esta configuração impacta diretamente a simulação na Central de Ponto. Sem permissão válida, tentativas de registro em modo “Home Office” são bloqueadas.
              </p>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={ed.remote.allowed}
                  onChange={(e) =>
                    setField({
                      remote: { ...ed.remote, allowed: e.target.checked },
                    })
                  }
                />
                <span>
                  Autorizar registro de ponto digital fora das dependências da empresa
                </span>
              </label>

              {ed.remote.allowed && (
                <div className="form-grid" style={{ marginTop: 10 }}>
                  <label>
                    Período de validade da autorização *
                    <input
                      type="date"
                      value={ed.remote.until}
                      onChange={(e) =>
                        setField({
                          remote: { ...ed.remote, until: e.target.value },
                        })
                      }
                    />
                  </label>
                  <label>
                    Responsável pela autorização *
                    <input
                      placeholder="Ex.: Marina Costa (RH)"
                      value={ed.remote.by}
                      onChange={(e) =>
                        setField({
                          remote: { ...ed.remote, by: e.target.value },
                        })
                      }
                    />
                  </label>
                </div>
              )}
            </div>

            <div className="row" style={{ justifyContent: "flex-end", marginTop: 8 }}>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setEd(null);
                  setErr("");
                }}
              >
                Cancelar
              </button>
              <button type="button" className="btn primary" onClick={save}>
                Salvar alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
