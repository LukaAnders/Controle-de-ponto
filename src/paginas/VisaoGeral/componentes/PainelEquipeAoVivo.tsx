import { useState } from "react";
import { Employee, Occ, Page, Rec } from "../../../tipos";

interface LiveTeamSidebarProps {
  employees: Employee[];
  recs: Rec[];
  openOccs?: Occ[];
  go: (p: Page, q?: Record<string, string>) => void;
}

type EmpSituationKey = "all" | "jornada" | "intervalo" | "pendente" | "fora";

interface EmpOperationalRow {
  emp: Employee;
  lastTime: string;
  modalityLabel: string;
  situationKey: Exclude<EmpSituationKey, "all">;
  situationLabel: string;
  statusTone: "ok" | "warn" | "bad" | "neutral";
  hasOpenOcc: boolean;
}

const MODALITY_NAME: Record<Rec["modality"], string> = {
  Digital: "Ponto digital",
  Catraca: "Catraca biométrica",
  Convencional: "Relógio convencional",
};

const DEFAULT_PUNCH_BY_EMP: Record<
  string,
  { time: string; modality: string; defaultSituation?: Exclude<EmpSituationKey, "all"> }
> = {
  e1: { time: "08:02", modality: "Ponto digital", defaultSituation: "jornada" },
  e2: { time: "11:31", modality: "Ponto digital", defaultSituation: "jornada" },
  e3: {
    time: "12:04",
    modality: "Catraca biométrica",
    defaultSituation: "intervalo",
  },
  e4: {
    time: "08:30",
    modality: "Catraca biométrica",
    defaultSituation: "jornada",
  },
  e5: {
    time: "07:31",
    modality: "Relógio convencional",
    defaultSituation: "pendente",
  },
  e6: {
    time: "—",
    modality: "Relógio convencional",
    defaultSituation: "fora",
  },
  e7: {
    time: "09:00",
    modality: "Ponto digital",
    defaultSituation: "pendente",
  },
  e8: { time: "08:05", modality: "Ponto digital", defaultSituation: "jornada" },
};

export default function LiveTeamSidebar({
  employees,
  recs,
  openOccs = [],
  go,
}: LiveTeamSidebarProps) {
  const [statusFilter, setStatusFilter] = useState<EmpSituationKey>("all");
  const [search, setSearch] = useState("");

  const buildRow = (emp: Employee): EmpOperationalRow => {
    const empPunchRecs = recs.filter(
      (r) => r.empId === emp.id && r.kind === "Registro de ponto",
    );
    const latestRec = empPunchRecs[0];
    const fallback = DEFAULT_PUNCH_BY_EMP[emp.id];

    const empOpenOccs = openOccs.filter((o) => o.empId === emp.id);
    const hasCriticalPending = empOpenOccs.some(
      (o) =>
        (o.type === "incompleto" && emp.id === "e5") ||
        (o.type === "homeoffice" && emp.id === "e7"),
    );

    const lastTime = latestRec
      ? latestRec.time.split(" ")[1] || latestRec.time
      : fallback?.time || (emp.active ? "08:00" : "—");

    const modalityLabel = latestRec
      ? MODALITY_NAME[latestRec.modality]
      : fallback?.modality ||
        (emp.mode === "Remoto"
          ? "Ponto digital"
          : emp.dept === "Operações"
            ? "Relógio convencional"
            : "Catraca biométrica");

    let situationKey: Exclude<EmpSituationKey, "all"> = "jornada";

    if (!emp.active) {
      situationKey = "fora";
    } else if (
      latestRec &&
      latestRec.detail?.toLowerCase().includes("intervalo")
    ) {
      situationKey = "intervalo";
    } else if (hasCriticalPending) {
      situationKey = "pendente";
    } else if (fallback?.defaultSituation === "intervalo") {
      situationKey = "intervalo";
    } else {
      situationKey = "jornada";
    }

    const situationMap: Record<
      Exclude<EmpSituationKey, "all">,
      { label: string; tone: "ok" | "warn" | "bad" | "neutral" }
    > = {
      jornada: { label: "Em jornada", tone: "ok" },
      intervalo: { label: "Em intervalo", tone: "warn" },
      pendente: { label: "Com registro pendente", tone: "bad" },
      fora: { label: "Fora da jornada", tone: "neutral" },
    };

    return {
      emp,
      lastTime,
      modalityLabel,
      situationKey,
      situationLabel: situationMap[situationKey].label,
      statusTone: situationMap[situationKey].tone,
      hasOpenOcc: empOpenOccs.length > 0,
    };
  };

  const allRows = employees.map(buildRow);

  const counts = {
    all: allRows.length,
    jornada: allRows.filter((r) => r.situationKey === "jornada").length,
    intervalo: allRows.filter((r) => r.situationKey === "intervalo").length,
    pendente: allRows.filter((r) => r.situationKey === "pendente").length,
    fora: allRows.filter((r) => r.situationKey === "fora").length,
  };

  const visibleRows = allRows.filter((row) => {
    const matchesStatus =
      statusFilter === "all" || row.situationKey === statusFilter;
    const queryText =
      `${row.emp.name} ${row.emp.reg} ${row.emp.dept} ${row.modalityLabel}`.toLowerCase();
    const matchesSearch = !search || queryText.includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <section
      className="admin-panel"
      aria-labelledby="employee-situation-heading"
    >
      <div className="admin-section-bar">
        <div>
          <h2 id="employee-situation-heading" className="admin-section-title">
            Situação dos funcionários
          </h2>
          <span className="admin-section-meta">
            Acompanhamento nominal de registros e estado atual da jornada
          </span>
        </div>

        <button
          type="button"
          className="admin-link-btn"
          onClick={() => go("employees")}
        >
          Cadastro completo de funcionários →
        </button>
      </div>

      <div className="admin-table-toolbar">
        <div
          className="admin-status-filters"
          role="tablist"
          aria-label="Filtrar funcionários por situação"
        >
          <button
            type="button"
            role="tab"
            aria-selected={statusFilter === "all"}
            className={`admin-filter-btn ${statusFilter === "all" ? "active" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            Todos ({counts.all})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={statusFilter === "jornada"}
            className={`admin-filter-btn ${statusFilter === "jornada" ? "active" : ""}`}
            onClick={() => setStatusFilter("jornada")}
          >
            Em jornada ({counts.jornada})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={statusFilter === "intervalo"}
            className={`admin-filter-btn ${statusFilter === "intervalo" ? "active" : ""}`}
            onClick={() => setStatusFilter("intervalo")}
          >
            Em intervalo ({counts.intervalo})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={statusFilter === "pendente"}
            className={`admin-filter-btn ${statusFilter === "pendente" ? "active" : ""}`}
            onClick={() => setStatusFilter("pendente")}
          >
            Com pendência ({counts.pendente})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={statusFilter === "fora"}
            className={`admin-filter-btn ${statusFilter === "fora" ? "active" : ""}`}
            onClick={() => setStatusFilter("fora")}
          >
            Fora da jornada ({counts.fora})
          </button>
        </div>

        <div className="admin-search-box">
          <input
            type="search"
            className="admin-search-input"
            placeholder="Filtrar por nome, matrícula ou setor..."
            aria-label="Filtrar funcionários por nome, matrícula ou setor"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="scroll">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Funcionário</th>
              <th>Setor</th>
              <th>Último registro</th>
              <th>Modalidade de ponto</th>
              <th>Situação atual</th>
              <th className="col-action">Ação</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.emp.id}>
                <td>
                  <div className="admin-emp-name">
                    <strong>{row.emp.name}</strong>
                    <span>
                      Matrícula {row.emp.reg} · {row.emp.role}
                    </span>
                  </div>
                </td>
                <td>{row.emp.dept}</td>
                <td>
                  <span className="admin-time-cell">{row.lastTime}</span>
                </td>
                <td>
                  <div className="admin-modality-cell">
                    <span>{row.modalityLabel}</span>
                    <small>{row.emp.mode}</small>
                  </div>
                </td>
                <td>
                  <span className={`admin-status-tag ${row.statusTone}`}>
                    <span className="admin-status-dot" aria-hidden="true" />
                    {row.situationLabel}
                  </span>
                </td>
                <td className="col-action">
                  {row.situationKey === "pendente" ? (
                    <button
                      type="button"
                      className="btn admin-row-btn"
                      onClick={() => go("occurrences", { open: "1" })}
                    >
                      Verificar
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn admin-row-btn"
                      onClick={() => go("employees")}
                    >
                      Consultar
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {visibleRows.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-cell">
                  Nenhum funcionário encontrado para os filtros selecionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
