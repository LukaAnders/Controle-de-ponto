import { Occ, OccType, Page } from "../../../types";

const pendingCategories: {
  type: OccType;
  title: string;
  priorityLabel: string;
  priorityTone: "bad" | "warn" | "info";
  description: string;
  actionLabel: string;
}[] = [
  {
    type: "incompleto",
    title: "Marcações incompletas",
    priorityLabel: "Prioridade alta",
    priorityTone: "bad",
    description:
      "Registros com saída, entrada ou intervalo de almoço ausentes no fechamento diário.",
    actionLabel: "Resolver marcações",
  },
  {
    type: "justificativa",
    title: "Justificativas pendentes",
    priorityLabel: "Atenção",
    priorityTone: "warn",
    description:
      "Solicitações de abono, atrasos de deslocamento e declarações aguardando análise do RH.",
    actionLabel: "Analisar justificativas",
  },
  {
    type: "homeoffice",
    title: "Solicitações de autorização remota",
    priorityLabel: "Revisão",
    priorityTone: "info",
    description:
      "Pedidos de liberação ou renovação de ponto digital em regime de home office.",
    actionLabel: "Revisar solicitações",
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
      className="admin-panel"
      aria-labelledby="rh-pendencies-heading"
    >
      <div className="admin-section-bar">
        <div>
          <h2 id="rh-pendencies-heading" className="admin-section-title">
            Pendências de ponto
          </h2>
          <span className="admin-section-meta">
            Ocorrências abertas que necessitam de verificação ou deliberação do RH
          </span>
        </div>

        <button
          type="button"
          className="admin-link-btn"
          onClick={() => go("occurrences", { open: "1" })}
        >
          Ver todas as pendências ({openOccs.length}) →
        </button>
      </div>

      <div className="admin-pendencies-list">
        {pendingCategories.map((item) => {
          const cases = openOccs.filter((o) => o.type === item.type);
          const uniqueEmpCount = new Set(cases.map((o) => o.empId)).size;
          const count = cases.length;

          return (
            <div key={item.type} className="admin-pendency-row">
              <div className="admin-pendency-main">
                <span
                  className={`admin-priority-bar ${item.priorityTone}`}
                  aria-hidden="true"
                />
                <div className="admin-pendency-info">
                  <div className="admin-pendency-title-row">
                    <strong>{item.title}</strong>
                    <span className={`admin-priority-tag ${item.priorityTone}`}>
                      {item.priorityLabel}
                    </span>
                  </div>
                  <p className="admin-pendency-desc">{item.description}</p>
                </div>
              </div>

              <div className="admin-pendency-meta">
                <div className="admin-pendency-count">
                  <strong>{count}</strong>
                  <span>
                    {count === 1 ? "ocorrência" : "ocorrências"} (
                    {uniqueEmpCount}{" "}
                    {uniqueEmpCount === 1 ? "funcionário" : "funcionários"})
                  </span>
                </div>

                <button
                  type="button"
                  className="btn admin-row-btn"
                  onClick={() =>
                    go("occurrences", { type: item.type, open: "1" })
                  }
                >
                  {item.actionLabel}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
