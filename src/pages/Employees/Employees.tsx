import { useState } from "react";
import { useApp, roles } from "../../context/AppContext";
import { depts } from "../../data/mockData";
import { Employee } from "../../types";
import EmployeeFilters from "./components/EmployeeFilters";
import EmployeeTable from "./components/EmployeeTable";
import EmployeeDetailPanel from "./components/EmployeeDetailPanel";
import EmployeeFormModal from "./components/EmployeeFormModal";
import "./Employees.css";

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

  const handleOpenEdit = (e: Employee) => {
    setErr("");
    setEd({
      ...e,
      remote: {
        allowed: e.remote.allowed,
        until: e.remote.until || "2026-12-31",
        by: e.remote.by || `${roles[role].user} (RH)`,
      },
    });
  };

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
      setErr(
        `A matrícula ${ed.reg} já pertence a outro funcionário cadastrado.`,
      );
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

      <EmployeeFilters
        q={q}
        setQ={setQ}
        d={d}
        setD={setD}
        m={m}
        setM={setM}
        s={s}
        setS={setS}
        role={role}
        onClear={() => {
          setQ("");
          setD("");
          setS("");
          setM("");
        }}
      />

      <div className="split">
        <EmployeeTable
          list={list}
          detailId={detailId}
          role={role}
          onSelectDetail={setDetailId}
          onEdit={handleOpenEdit}
          onToggleActive={(e) => saveEmployee({ ...e, active: !e.active })}
        />

        {selectedEmp && (
          <EmployeeDetailPanel
            employee={selectedEmp}
            empRecs={empRecs}
            empOccs={empOccs}
            role={role}
            onClose={() => setDetailId("")}
            onEdit={handleOpenEdit}
            go={go}
          />
        )}
      </div>

      {ed && (
        <EmployeeFormModal
          ed={ed}
          isEditing={employees.some((x) => x.id === ed.id)}
          err={err}
          onChange={(p) => setEd({ ...ed, ...p })}
          onSave={save}
          onClose={() => {
            setEd(null);
            setErr("");
          }}
        />
      )}
    </div>
  );
}

