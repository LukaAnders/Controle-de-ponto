import { Occ, OccType, Page } from "../../../types";

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

interface RhPrioritiesTableProps {
  openOccs: Occ[];
  go: (p: Page, q?: Record<string, string>) => void;
}

export default function RhPrioritiesTable({
  openOccs,
  go,
}: RhPrioritiesTableProps) {
  return (
    <section
      className="card priority-section"
      aria-labelledby="rh-priorities-heading"
    >
      <div className="section-header">
        <div>
          <h2 id="rh-priorities-heading">Prioridades do RH</h2>
          <p className="sub" style={{ margin: "2px 0 0" }}>
            Fila operacional de pendências que impactam o fechamento de ponto e
            as permissões de jornada.
          </p>
        </div>
        <span className="badge">
          Total pendente: {openOccs.length}{" "}
          {openOccs.length === 1 ? "caso" : "casos"}
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
  );
}

