import { useState, useEffect } from "react";
import { Plus, FileText, Clock, AlertOctagon, CheckCircle2 } from "lucide-react";
import { useApp, SELF } from "../../contexto/ContextoApp";
import { isTerminalStatus } from "./regrasOcorrencia";
import OccurrenceFilters from "./componentes/FiltrosOcorrencia";
import OccurrenceTable from "./componentes/TabelaOcorrencias";
import OccurrenceDetailPanel from "./componentes/PainelDetalheOcorrencia";
import NewOccurrenceModal from "./componentes/ModalNovaOcorrencia";
import "./Ocorrencias.css";

export default function Occurrences() {
  const { occs, employees, query, actOcc, addOcc, role } = useApp();
  const [st, setSt] = useState(query.open ? "abertas" : "");
  const [ty, setTy] = useState(query.type || "");
  const [deptFilter, setDeptFilter] = useState("");
  const [prioFilter, setPrioFilter] = useState("");
  const [search, setSearch] = useState("");
  const [sel, setSel] = useState(query.sel || "");
  const [showNewModal, setShowNewModal] = useState(false);

  useEffect(() => {
    if (query.type !== undefined) setTy(query.type);
    if (query.open) setSt("abertas");
    if (query.sel) setSel(query.sel);
  }, [query]);

  const getEmp = (id: string) => employees.find((e) => e.id === id);

  const openCount = occs.filter(
    (o) => o.status === "Pendente" || o.status === "Em análise",
  ).length;
  const highOpenCount = occs.filter(
    (o) => !isTerminalStatus(o.status) && o.priority === "Alta",
  ).length;
  const closedCount = occs.filter((o) => isTerminalStatus(o.status)).length;

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
    const matchSearch =
      !search ||
      `${emp?.name ?? ""} ${emp?.reg ?? ""} ${o.summary} ${o.justification}`
        .toLowerCase()
        .includes(search.toLowerCase());

    return matchStatus && matchType && matchDept && matchPrio && matchSearch;
  });

  const hasActiveFilters = Boolean(
    search || st || ty || deptFilter || prioFilter,
  );

  const clearFilters = () => {
    setSt("");
    setTy("");
    setDeptFilter("");
    setPrioFilter("");
    setSearch("");
  };

  const selectedOcc = occs.find((x) => x.id === sel) || null;
  const selectedEmp = selectedOcc ? getEmp(selectedOcc.empId) : undefined;

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <h1>Ocorrências e justificativas</h1>
          <p className="sub">
            {role === "funcionario"
              ? "Acompanhe suas solicitações de jornada e envie justificativas para o RH."
              : "Analise inconsistências de ponto, justificativas de ausência e pedidos de home office."}
          </p>
        </div>
        <button
          type="button"
          className="btn primary occ-new-btn"
          onClick={() => setShowNewModal(true)}
        >
          <Plus size={16} strokeWidth={2.2} aria-hidden="true" />
          <span>Nova justificativa</span>
        </button>
      </div>

      {/* Resumo operacional rápido (clicável para filtrar) */}
      <div
        className="occ-kpi-strip"
        role="region"
        aria-label="Resumo da fila de ocorrências"
      >
        <button
          type="button"
          className={`occ-kpi-card ${!hasActiveFilters ? "active" : ""}`}
          onClick={clearFilters}
        >
          <span className="occ-kpi-icon">
            <FileText size={16} aria-hidden="true" />
          </span>
          <div className="occ-kpi-copy">
            <strong>{occs.length}</strong>
            <span>Total registradas</span>
          </div>
        </button>

        <button
          type="button"
          className={`occ-kpi-card tone-warn ${
            st === "abertas" && !prioFilter ? "active" : ""
          }`}
          onClick={() => {
            setSt("abertas");
            setPrioFilter("");
          }}
        >
          <span className="occ-kpi-icon">
            <Clock size={16} aria-hidden="true" />
          </span>
          <div className="occ-kpi-copy">
            <strong>{openCount}</strong>
            <span>Aguardando análise</span>
          </div>
        </button>

        <button
          type="button"
          className={`occ-kpi-card tone-bad ${
            st === "abertas" && prioFilter === "Alta" ? "active" : ""
          }`}
          onClick={() => {
            setSt("abertas");
            setPrioFilter("Alta");
          }}
        >
          <span className="occ-kpi-icon">
            <AlertOctagon size={16} aria-hidden="true" />
          </span>
          <div className="occ-kpi-copy">
            <strong>{highOpenCount}</strong>
            <span>Prioridade alta em aberto</span>
          </div>
        </button>

        <button
          type="button"
          className={`occ-kpi-card tone-ok ${
            st === "Aprovada" ? "active" : ""
          }`}
          onClick={() => {
            setSt("Aprovada");
            setPrioFilter("");
          }}
        >
          <span className="occ-kpi-icon">
            <CheckCircle2 size={16} aria-hidden="true" />
          </span>
          <div className="occ-kpi-copy">
            <strong>{closedCount}</strong>
            <span>Concluídas</span>
          </div>
        </button>
      </div>

      <OccurrenceFilters
        allOccs={occs}
        filteredCount={list.length}
        search={search}
        setSearch={setSearch}
        st={st}
        setSt={setSt}
        ty={ty}
        setTy={setTy}
        deptFilter={deptFilter}
        setDeptFilter={setDeptFilter}
        prioFilter={prioFilter}
        setPrioFilter={setPrioFilter}
        role={role}
        onClear={clearFilters}
      />

      <div className="split">
        <OccurrenceTable
          list={list}
          employees={employees}
          selectedId={selectedOcc?.id}
          onSelect={setSel}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />

        {selectedOcc && (
          <OccurrenceDetailPanel
            occurrence={selectedOcc}
            employee={selectedEmp}
            role={role}
            onClose={() => setSel("")}
            actOcc={actOcc}
          />
        )}
      </div>

      <NewOccurrenceModal
        open={showNewModal}
        targetEmpId={role === "funcionario" ? SELF : employees[0]?.id || SELF}
        onClose={() => setShowNewModal(false)}
        addOcc={addOcc}
      />
    </div>
  );
}
