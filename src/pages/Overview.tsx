import { useState } from "react";
import { useApp } from "../store";
import { base, OccType } from "../data";

export default function Overview() {
  const { occs, employees, go, role } = useApp();
  const [period, setPeriod] = useState("hoje");

  const openOccs = occs.filter(
    (o) => o.status === "Pendente" || o.status === "Em análise",
  );

  // Coherent numbers: for RH, 104 of 120 active and 98 in shift; for Gestor (Tecnologia), derived from visible team scale
  const activeCount =
    role === "rh"
      ? base.active
      : employees.filter((e) => e.active).length * 9;
  const presentCount =
    role === "rh"
      ? base.present
      : Math.max(1, activeCount - 4);
  const inShiftCount =
    role === "rh"
      ? base.inShift
      : Math.max(1, presentCount - 2);

  const priorityRows: {
    type: OccType;
    title: string;
    description: string;
    actionLabel: string;
  }[] = [
    {
      type: "incompleto",
      title: "Registros de ponto incompletos",
      description:
        "Jornadas com entrada sem saída correspondente, falta de intervalo ou divergência com catraca.",
      actionLabel: "Ver ocorrências",
    },
    {
      type: "justificativa",
      title: "Justificativas aguardando análise",
      description:
        "Solicitações de abono, declarações médicas, atrasos de transporte e atividades externas.",
      actionLabel: "Revisar solicitações",
    },
    {
      type: "homeoffice",
      title: "Autorizações de trabalho remoto pendentes",
      description:
        "Pedidos de liberação ou renovação de permissão para registro de ponto digital em home office.",
      actionLabel: "Revisar autorizações",
    },
  ];

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <h1>Visão operacional</h1>
          <p className="sub">
            Acompanhe a jornada e resolva pendências em um só lugar
            {role === "gestor" ? " · Escopo: Setor de Tecnologia" : ""}
          </p>
        </div>

        <div className="page-header-actions">
          <label className="inline-filter" aria-label="Período de referência">
            <span>Período:</span>
            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="hoje">Hoje · 26/10/2026</option>
              <option value="semana">Semana atual (20/10 a 26/10)</option>
              <option value="mes">Outubro / 2026</option>
            </select>
          </label>
          <button
            type="button"
            className="btn"
            onClick={() => go("punch")}
          >
            Ir para Central de Ponto
          </button>
          <button
            type="button"
            className="btn primary"
            onClick={() => go("occurrences", { open: "1" })}
          >
            Analisar pendências ({openOccs.length})
          </button>
        </div>
      </div>

      {/* 3 Compact Main Indicators */}
      <section aria-label="Indicadores principais da jornada" className="grid3">
        <div className="card kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Presentes hoje</span>
            <span className="badge ok">Operação normal</span>
          </div>
          <div className="kpi-value-row">
            <strong className="big">{presentCount}</strong>
            <span className="kpi-unit">de {activeCount} funcionários</span>
          </div>
          <small className="kpi-foot">
            Contabiliza colaboradores ativos com entrada registrada na data ({Math.round((presentCount / activeCount) * 100)}% do quadro)
          </small>
        </div>

        <div className="card kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Em jornada</span>
            <span className="badge info">Turno ativo</span>
          </div>
          <div className="kpi-value-row">
            <strong className="big">{inShiftCount}</strong>
            <span className="kpi-unit">jornadas</span>
          </div>
          <small className="kpi-foot">
            Jornadas atualmente em andamento (6 em intervalo intrajornada no momento)
          </small>
        </div>

        <div className="card kpi-card warn">
          <div className="kpi-top">
            <span className="kpi-label">Exigem atenção</span>
            <span className="badge warn">
              {openOccs.length > 0 ? "Requer ação" : "Em dia"}
            </span>
          </div>
          <div className="kpi-value-row">
            <strong className="big">{openOccs.length}</strong>
            <span className="kpi-unit">ocorrências</span>
          </div>
          <small className="kpi-foot">
            Soma de registros incompletos, justificativas e permissões remotas aguardando análise
          </small>
        </div>
      </section>

      {/* Primary Area: Prioridades do RH */}
      <section className="card priority-section" aria-labelledby="rh-priorities-heading">
        <div className="section-header">
          <div>
            <h2 id="rh-priorities-heading">Prioridades do RH</h2>
            <p className="sub" style={{ margin: "2px 0 0" }}>
              Fila operacional de pendências que impactam o fechamento de ponto e as permissões de jornada.
            </p>
          </div>
          <span className="badge">
            Total pendente: {openOccs.length} {openOccs.length === 1 ? "caso" : "casos"}
          </span>
        </div>

        <div className="scroll">
          <table className="priority-table">
            <thead>
              <tr>
                <th>Tipo da pendência</th>
                <th>Casos</th>
                <th>Descrição operacional</th>
                <th>Nível de prioridade</th>
                <th style={{ textAlign: "right" }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {priorityRows.map((row) => {
                const items = openOccs.filter((o) => o.type === row.type);
                const hasHigh = items.some((o) => o.priority === "Alta");
                const hasMedium = items.some((o) => o.priority === "Média");
                const priorityLabel =
                  items.length === 0
                    ? "Concluído"
                    : hasHigh
                      ? "Alta prioridade"
                      : hasMedium
                        ? "Prioridade média"
                        : "Prioridade baixa";
                const badgeClass =
                  items.length === 0
                    ? "ok"
                    : hasHigh
                      ? "bad"
                      : hasMedium
                        ? "warn"
                        : "info";

                return (
                  <tr key={row.type}>
                    <td>
                      <strong className="cell-title">{row.title}</strong>
                    </td>
                    <td>
                      <span className="count-pill">{items.length}</span>
                    </td>
                    <td className="muted-cell">{row.description}</td>
                    <td>
                      <span className={`badge ${badgeClass}`}>
                        {priorityLabel}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        className="btn primary-outline"
                        onClick={() =>
                          go("occurrences", { type: row.type, open: "1" })
                        }
                      >
                        {row.actionLabel}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Secondary Area: Modalidades de ponto */}
      <section className="card" aria-labelledby="modalities-heading">
        <div className="section-header">
          <div>
            <h2 id="modalities-heading">Distribuição por modalidade de ponto</h2>
            <p className="sub" style={{ margin: "2px 0 0" }}>
              Os percentuais abaixo representam uma distribuição demonstrativa do volume de registros no período selecionado, e não o número de funcionários únicos.
            </p>
          </div>
          <button
            type="button"
            className="btn"
            onClick={() => go("punch")}
          >
            Simular registros na Central
          </button>
        </div>

        <div className="modality-bars">
          {base.mix.map(([label, pct, desc]) => (
            <div key={label} className="modality-bar-item">
              <div className="modality-bar-header">
                <div>
                  <strong>{label}</strong>
                  <span className="modality-bar-desc"> — {desc}</span>
                </div>
                <strong className="modality-pct">{pct}%</strong>
              </div>
              <div className="bar-track" aria-hidden="true">
                <div className="bar-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
