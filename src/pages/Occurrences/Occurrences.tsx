import { useState, useEffect } from "react";
import { useApp, SELF } from "../../context/AppContext";
import { TODAY } from "../../data/mockData";
import OccurrenceFilters from "./components/OccurrenceFilters";
import OccurrenceTable from "./components/OccurrenceTable";
import OccurrenceDetailPanel from "./components/OccurrenceDetailPanel";
import NewOccurrenceModal from "./components/NewOccurrenceModal";
import "./Occurrences.css";

export default function Occurrences() {
  const { occs, employees, query, actOcc, addOcc, role } = useApp();
  const [st, setSt] = useState(query.open ? "abertas" : "");
  const [ty, setTy] = useState(query.type || "");
  const [deptFilter, setDeptFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState("");
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
  const selectedEmp = selectedOcc ? getEmp(selectedOcc.empId) : undefined;

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
          onClick={() => setShowNewModal(true)}
        >
          + Nova justificativa / solicitação
        </button>
      </div>

      <OccurrenceFilters
        search={search}
        setSearch={setSearch}
        st={st}
        setSt={setSt}
        ty={ty}
        setTy={setTy}
        deptFilter={deptFilter}
        setDeptFilter={setDeptFilter}
        periodFilter={periodFilter}
        setPeriodFilter={setPeriodFilter}
        prioFilter={prioFilter}
        setPrioFilter={setPrioFilter}
        role={role}
        onClear={() => {
          setSt("");
          setTy("");
          setDeptFilter("");
          setPeriodFilter("");
          setPrioFilter("");
          setSearch("");
        }}
      />

      <div className="split">
        <OccurrenceTable
          list={list}
          employees={employees}
          selectedId={selectedOcc?.id}
          onSelect={setSel}
        />

        {selectedOcc && (
          <OccurrenceDetailPanel
            occurrence={selectedOcc}
            employee={selectedEmp}
            role={role}
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

