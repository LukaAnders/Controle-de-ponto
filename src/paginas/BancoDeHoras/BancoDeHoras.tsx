import { useState, useEffect, useMemo } from "react";
import { useApp, SELF } from "../../contexto/ContextoApp";
import "./BancoDeHoras.css";

interface TimeBankRow {
  date: string;
  weekday: string;
  modality: string;
  hours: string;
  debit: string;
  balance: string;
}

const TIME_BANK_BY_EMPLOYEE: Record<string, TimeBankRow[]> = {
  e1: [
    {
      date: "26/10/2026",
      weekday: "Seg",
      modality: "Ponto digital · Home office",
      hours: "08:02",
      debit: "00:00",
      balance: "+01:15",
    },
    {
      date: "25/10/2026",
      weekday: "Dom",
      modality: "Escala híbrida · Ajuste parcial",
      hours: "07:15",
      debit: "-00:45",
      balance: "+01:13",
    },
    {
      date: "24/10/2026",
      weekday: "Sáb",
      modality: "Catraca biométrica · Presencial",
      hours: "08:20",
      debit: "00:00",
      balance: "+01:58",
    },
    {
      date: "23/10/2026",
      weekday: "Sex",
      modality: "Ponto digital · Home office",
      hours: "08:00",
      debit: "00:00",
      balance: "+01:38",
    },
    {
      date: "22/10/2026",
      weekday: "Qui",
      modality: "Catraca biométrica · Presencial",
      hours: "07:42",
      debit: "-00:18",
      balance: "+01:38",
    },
    {
      date: "21/10/2026",
      weekday: "Qua",
      modality: "Catraca biométrica · Presencial",
      hours: "08:31",
      debit: "00:00",
      balance: "+01:56",
    },
    {
      date: "20/10/2026",
      weekday: "Ter",
      modality: "Ponto digital · Home office",
      hours: "09:25",
      debit: "00:00",
      balance: "+01:25",
    },
  ],
  e2: [
    {
      date: "26/10/2026",
      weekday: "Seg",
      modality: "Ponto digital · Entrada tardia",
      hours: "06:30",
      debit: "-01:30",
      balance: "-01:10",
    },
    {
      date: "24/10/2026",
      weekday: "Sáb",
      modality: "Ponto digital · Remoto",
      hours: "08:00",
      debit: "00:00",
      balance: "+00:20",
    },
    {
      date: "23/10/2026",
      weekday: "Sex",
      modality: "Ponto digital · Remoto",
      hours: "07:40",
      debit: "-00:20",
      balance: "+00:20",
    },
    {
      date: "22/10/2026",
      weekday: "Qui",
      modality: "Ponto digital · Remoto",
      hours: "08:15",
      debit: "00:00",
      balance: "+00:40",
    },
    {
      date: "21/10/2026",
      weekday: "Qua",
      modality: "Ponto digital · Remoto",
      hours: "08:25",
      debit: "00:00",
      balance: "+00:25",
    },
  ],
  e3: [
    {
      date: "26/10/2026",
      weekday: "Seg",
      modality: "Catraca biométrica · T-01",
      hours: "08:05",
      debit: "00:00",
      balance: "+00:48",
    },
    {
      date: "24/10/2026",
      weekday: "Sáb",
      modality: "Catraca biométrica · T-01",
      hours: "07:55",
      debit: "-00:05",
      balance: "+00:43",
    },
    {
      date: "23/10/2026",
      weekday: "Sex",
      modality: "Catraca biométrica · T-01",
      hours: "08:18",
      debit: "00:00",
      balance: "+00:48",
    },
    {
      date: "22/10/2026",
      weekday: "Qui",
      modality: "Catraca biométrica · T-01",
      hours: "07:18",
      debit: "-00:42",
      balance: "+00:30",
    },
    {
      date: "21/10/2026",
      weekday: "Qua",
      modality: "Catraca biométrica · T-01",
      hours: "08:12",
      debit: "00:00",
      balance: "+01:12",
    },
  ],
  e4: [
    {
      date: "26/10/2026",
      weekday: "Seg",
      modality: "Catraca biométrica · Presencial",
      hours: "07:45",
      debit: "-00:15",
      balance: "-00:35",
    },
    {
      date: "24/10/2026",
      weekday: "Sáb",
      modality: "Atividade externa comercial",
      hours: "08:00",
      debit: "00:00",
      balance: "-00:20",
    },
    {
      date: "23/10/2026",
      weekday: "Sex",
      modality: "Catraca biométrica · Presencial",
      hours: "07:30",
      debit: "-00:30",
      balance: "-00:20",
    },
    {
      date: "22/10/2026",
      weekday: "Qui",
      modality: "Catraca biométrica · Presencial",
      hours: "08:10",
      debit: "00:00",
      balance: "+00:10",
    },
  ],
  e5: [
    {
      date: "26/10/2026",
      weekday: "Seg",
      modality: "Relógio convencional · REP-02",
      hours: "08:04",
      debit: "00:00",
      balance: "+00:54",
    },
    {
      date: "25/10/2026",
      weekday: "Dom",
      modality: "Relógio convencional · REP-02",
      hours: "07:50",
      debit: "-00:10",
      balance: "+00:50",
    },
    {
      date: "24/10/2026",
      weekday: "Sáb",
      modality: "Relógio convencional · REP-02",
      hours: "08:15",
      debit: "00:00",
      balance: "+01:00",
    },
    {
      date: "23/10/2026",
      weekday: "Sex",
      modality: "Relógio convencional · REP-02",
      hours: "08:45",
      debit: "00:00",
      balance: "+00:45",
    },
  ],
};

const DEFAULT_ROWS: TimeBankRow[] = [
  {
    date: "26/10/2026",
    weekday: "Seg",
    modality: "Ponto digital · Validado",
    hours: "08:00",
    debit: "00:00",
    balance: "+00:30",
  },
  {
    date: "24/10/2026",
    weekday: "Sáb",
    modality: "Catraca biométrica · T-01",
    hours: "07:45",
    debit: "-00:15",
    balance: "+00:30",
  },
  {
    date: "23/10/2026",
    weekday: "Sex",
    modality: "Ponto digital · Validado",
    hours: "08:15",
    debit: "00:00",
    balance: "+00:45",
  },
  {
    date: "22/10/2026",
    weekday: "Qui",
    modality: "Catraca biométrica · T-01",
    hours: "08:30",
    debit: "00:00",
    balance: "+00:30",
  },
];

function parseMinutes(hhmm: string): number {
  const clean = hhmm.replace(/[+-]/g, "");
  const [h, m] = clean.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function formatMinutes(totalMin: number, withSign = false): string {
  const abs = Math.abs(totalMin);
  const h = String(Math.floor(abs / 60)).padStart(2, "0");
  const m = String(abs % 60).padStart(2, "0");
  if (!withSign) return `${h}:${m}`;
  if (totalMin === 0) return "00:00";
  return `${totalMin < 0 ? "-" : "+"}${h}:${m}`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

interface BancoDeHorasProps {
  embedded?: boolean;
}

export default function BancoDeHoras({ embedded = false }: BancoDeHorasProps) {
  const { employees, role, go, notify } = useApp();
  const [empId, setEmpId] = useState(
    role === "funcionario" ? SELF : employees[0]?.id || SELF,
  );
  const [filterMode, setFilterMode] = useState<"all" | "debit" | "extra">("all");

  useEffect(() => {
    if (role === "funcionario") {
      setEmpId(SELF);
    } else if (!employees.some((e) => e.id === empId) && employees[0]) {
      setEmpId(employees[0].id);
    }
  }, [role, employees, empId]);

  const selectedEmployee =
    employees.find((e) => e.id === empId) || employees[0];

  const allRows = TIME_BANK_BY_EMPLOYEE[empId] || DEFAULT_ROWS;

  const filteredRows = useMemo(() => {
    if (filterMode === "debit") {
      return allRows.filter((r) => r.debit !== "00:00");
    }
    if (filterMode === "extra") {
      return allRows.filter((r) => parseMinutes(r.hours) > 480);
    }
    return allRows;
  }, [allRows, filterMode]);

  const summary = useMemo(() => {
    const totalWorkedMin = allRows.reduce(
      (acc, r) => acc + parseMinutes(r.hours),
      0,
    );
    const totalDebitMin = allRows.reduce(
      (acc, r) => acc + parseMinutes(r.debit),
      0,
    );
    const debitDays = allRows.filter((r) => r.debit !== "00:00").length;
    const currentBalance = allRows[0]?.balance || "+00:00";

    return {
      totalWorked: formatMinutes(totalWorkedMin),
      totalDebit: totalDebitMin > 0 ? `-${formatMinutes(totalDebitMin)}` : "00:00",
      debitDays,
      currentBalance,
      isNegative: currentBalance.startsWith("-"),
    };
  }, [allRows]);

  const handleExportCsv = () => {
    const empName = selectedEmployee?.name || "Colaborador";
    const lines = [
      "Data;Dia;Modalidade;Hora;Debito;Saldo",
      ...filteredRows.map(
        (r) =>
          `${r.date};${r.weekday};${r.modality};${r.hours};${r.debit};${r.balance}`,
      ),
    ];
    const blob = new Blob(["\uFEFF" + lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `banco-de-horas-${empName.toLowerCase().replace(/\s+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    notify(`Extrato de banco de horas de ${empName} exportado em CSV.`);
  };

  return (
    <div className="page-stack tb-page">
      {!embedded && (
        <div className="page-header">
          <div>
            <h1>Banco de Horas</h1>
          </div>
          <div className="row">
            <button
              type="button"
              className="btn"
              onClick={() => go("occurrences")}
            >
              Solicitar ajuste / justificativa
            </button>
            <button
              type="button"
              className="btn primary"
              onClick={handleExportCsv}
            >
              Exportar extrato (CSV)
            </button>
          </div>
        </div>
      )}

      {/* Faixa de Identificação do Colaborador */}
      {selectedEmployee && (
        <section className="tb-hero-card" aria-label="Colaborador selecionado">
          <div className="tb-emp-profile">
            <div className="tb-emp-avatar" aria-hidden="true">
              {getInitials(selectedEmployee.name)}
            </div>
            <div className="tb-emp-info">
              <span className="tb-emp-eyebrow">EXTRATO INDIVIDUAL · OUTUBRO / 2026</span>
              <strong>{selectedEmployee.name}</strong>
              <div className="tb-emp-meta">
                <span>Matrícula {selectedEmployee.reg}</span>
                <span>•</span>
                <span>{selectedEmployee.dept}</span>
                <span>•</span>
                <span>{selectedEmployee.role}</span>
                <span>•</span>
                <span>Escala: {selectedEmployee.schedule}</span>
              </div>
            </div>
          </div>

          <div className="row">
            {role !== "funcionario" && employees.length > 1 && (
              <label className="inline-filter">
                <span>Colaborador:</span>
                <select
                  value={empId}
                  onChange={(e) => setEmpId(e.target.value)}
                  aria-label="Selecionar colaborador"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} (Mat. {e.reg})
                    </option>
                  ))}
                </select>
              </label>
            )}
            {embedded && (
              <button
                type="button"
                className="btn primary-outline"
                onClick={handleExportCsv}
              >
                Exportar CSV
              </button>
            )}
          </div>
        </section>
      )}

      {/* Cards de Indicadores do Banco de Horas */}
      <section className="tb-kpi-grid" aria-label="Resumo do banco de horas">
        <div
          className={`tb-kpi-card ${
            summary.isNegative ? "is-debit" : "is-positive"
          }`}
        >
          <span className="tb-kpi-label">Saldo Acumulado</span>
          <div className="tb-kpi-value-row">
            <strong
              className={`tb-kpi-value ${
                summary.isNegative ? "negative" : "positive"
              }`}
            >
              {summary.currentBalance}
            </strong>
            <span className={`badge ${summary.isNegative ? "bad" : "ok"}`}>
              {summary.isNegative ? "Saldo devedor" : "Saldo positivo"}
            </span>
          </div>
          <span className="tb-kpi-sub">
            Posição atualizada até 26/10/2026
          </span>
        </div>

        <div className="tb-kpi-card is-info">
          <span className="tb-kpi-label">Horas Registradas</span>
          <div className="tb-kpi-value-row">
            <strong className="tb-kpi-value">{summary.totalWorked}</strong>
            <span className="badge info">{allRows.length} dias apurados</span>
          </div>
          <span className="tb-kpi-sub">
            Jornada contratual base de 08:00/dia
          </span>
        </div>

        <div className="tb-kpi-card is-debit">
          <span className="tb-kpi-label">Total de Débitos</span>
          <div className="tb-kpi-value-row">
            <strong className="tb-kpi-value negative">
              {summary.totalDebit}
            </strong>
            <span className="badge warn">
              {summary.debitDays}{" "}
              {summary.debitDays === 1 ? "dia com débito" : "dias com débito"}
            </span>
          </div>
          <span className="tb-kpi-sub">
            Horas faltantes ou saídas antecipadas
          </span>
        </div>

        <div className="tb-kpi-card">
          <span className="tb-kpi-label">Ciclo de Compensação</span>
          <div className="tb-kpi-value-row">
            <strong className="tb-kpi-value">31/12/2026</strong>
            <span className="badge ok">Vigente</span>
          </div>
          <span className="tb-kpi-sub">
            Fechamento trimestral do banco de horas
          </span>
        </div>
      </section>

      {/* Card Principal com a Tabela Data — Hora — Débito — Saldo */}
      <section className="card">
        <div className="tb-toolbar">
          <div className="tb-toolbar-title">
            <h2>Movimentação Diária do Banco de Horas</h2>
            <span>
              Detalhamento por data das horas cumpridas, débitos gerados e evolução do saldo.
            </span>
          </div>

          <div
            className="tb-filter-pills"
            role="tablist"
            aria-label="Filtrar lançamentos"
          >
            <button
              type="button"
              role="tab"
              aria-selected={filterMode === "all"}
              className={`tb-pill-btn ${filterMode === "all" ? "active" : ""}`}
              onClick={() => setFilterMode("all")}
            >
              Todos ({allRows.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filterMode === "debit"}
              className={`tb-pill-btn ${filterMode === "debit" ? "active" : ""}`}
              onClick={() => setFilterMode("debit")}
            >
              Com débito ({allRows.filter((r) => r.debit !== "00:00").length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filterMode === "extra"}
              className={`tb-pill-btn ${filterMode === "extra" ? "active" : ""}`}
              onClick={() => setFilterMode("extra")}
            >
              Acima de 8h (
              {allRows.filter((r) => parseMinutes(r.hours) > 480).length})
            </button>
          </div>
        </div>

        <div className="tb-table-wrap">
          <table className="tb-table" aria-label="Tabela de banco de horas">
            <thead>
              <tr>
                <th>Data</th>
                <th>Hora</th>
                <th>Débito</th>
                <th>Saldo</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-cell">
                    Nenhum registro encontrado para o filtro selecionado.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => {
                  const workedMin = parseMinutes(row.hours);
                  const pct = Math.min(100, Math.round((workedMin / 480) * 100));
                  const hasDebit = row.debit !== "00:00";
                  const isExtra = workedMin > 480;
                  const isNegativeBalance = row.balance.startsWith("-");
                  const dayNum = row.date.split("/")[0];

                  return (
                    <tr key={`${row.date}-${idx}`}>
                      <td>
                        <div className="tb-date-cell">
                          <div className="tb-date-badge" aria-hidden="true">
                            <strong>{dayNum}</strong>
                            <small>{row.weekday}</small>
                          </div>
                          <div className="tb-date-info">
                            <strong>{row.date}</strong>
                            <small>{row.modality}</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="tb-hours-cell">
                          <div className="tb-hours-top">
                            <strong>{row.hours}</strong>
                            <small>Meta: 08:00</small>
                          </div>
                          <div className="tb-hours-bar" aria-hidden="true">
                            <div
                              className={`tb-hours-fill ${
                                hasDebit
                                  ? "is-short"
                                  : isExtra
                                    ? "is-extra"
                                    : ""
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`tb-debit-pill ${
                            hasDebit ? "has-debit" : "no-debit"
                          }`}
                        >
                          {row.debit}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`tb-balance-pill ${
                            isNegativeBalance ? "negative" : "positive"
                          }`}
                        >
                          {row.balance}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot>
              <tr>
                <td>Total acumulado no período ({allRows.length} dias)</td>
                <td>{summary.totalWorked} trabalhadas</td>
                <td>{summary.totalDebit} em débito</td>
                <td>Saldo final: {summary.currentBalance}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
}
