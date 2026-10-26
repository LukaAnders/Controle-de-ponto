import { useState } from "react";
import { Employee, Page, Rec } from "../../../types";

interface LiveTeamSidebarProps {
  employees: Employee[];
  recs: Rec[];
  go: (p: Page, q?: Record<string, string>) => void;
}

export default function LiveTeamSidebar({
  employees,
  recs,
  go,
}: LiveTeamSidebarProps) {
  const [tab, setTab] = useState<"in" | "break" | "out">("in");
  const [q, setQ] = useState("");

  const activeEmps = employees.filter((e) => e.active);
  const inShiftEmps = activeEmps.filter((_, idx) => idx % 4 !== 3);
  const onBreakEmps = activeEmps.filter((_, idx) => idx % 4 === 3);
  const outEmps = employees.filter((e) => !e.active);

  const currentList = (
    tab === "in" ? inShiftEmps : tab === "break" ? onBreakEmps : outEmps
  ).filter((e) =>
    (e.name + " " + e.dept + " " + e.role)
      .toLowerCase()
      .includes(q.toLowerCase()),
  );

  const getInitials = (name: string) =>
    name
      .split(" ")
      .slice(0, 2)
      .map((p) => p[0])
      .join("");

  const getLastPunch = (empId: string) => {
    const rec = recs.find(
      (r) => r.empId === empId && r.kind === "Registro de ponto",
    );
    return rec ? `${rec.time.split(" ")[1]} · ${rec.modality}` : "08:00 · Escala regular";
  };

  return (
    <aside
      className="card live-team-panel"
      aria-label="Acompanhamento de presença em tempo real"
    >
      <div className="live-team-header">
        <h2>Quem está em jornada</h2>
        <p className="sub" style={{ margin: "2px 0 0" }}>
          {employees.length} colaboradores no escopo
        </p>
      </div>

      <div className="live-team-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "in"}
          className={`live-tab ${tab === "in" ? "active" : ""}`}
          onClick={() => setTab("in")}
        >
          <strong>{inShiftEmps.length}</strong>
          <span>EM JORNADA</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "break"}
          className={`live-tab ${tab === "break" ? "active" : ""}`}
          onClick={() => setTab("break")}
        >
          <strong>{onBreakEmps.length}</strong>
          <span>INTERVALO</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "out"}
          className={`live-tab ${tab === "out" ? "active" : ""}`}
          onClick={() => setTab("out")}
        >
          <strong>{outEmps.length}</strong>
          <span>FORA / INATIVO</span>
        </button>
      </div>

      <input
        className="live-search"
        placeholder="Buscar colaborador ou setor..."
        aria-label="Buscar colaborador na lista de presença"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="live-member-list">
        {currentList.map((emp, idx) => (
          <button
            key={emp.id}
            type="button"
            className="live-member-item"
            onClick={() => go("employees")}
            title={`Ver cadastro de ${emp.name}`}
          >
            <div className="emp-cell">
              <div className={`emp-avatar alt-${idx % 4}`}>
                {getInitials(emp.name)}
                <span className={`status-dot ${tab}`} />
              </div>
              <div className="live-member-info">
                <strong>{emp.name}</strong>
                <small>
                  {emp.dept} · {getLastPunch(emp.id)}
                </small>
              </div>
            </div>
            <span className="badge">{emp.mode}</span>
          </button>
        ))}

        {currentList.length === 0 && (
          <p className="sub" style={{ textAlign: "center", padding: "18px 0" }}>
            Nenhum colaborador nesta categoria.
          </p>
        )}
      </div>
    </aside>
  );
}

