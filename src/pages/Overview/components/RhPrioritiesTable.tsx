import { Occ, OccType, Page } from "../../../types";

const priorityItems: {
  type: OccType;
  title: string;
  colorClass: "red" | "amber" | "blue";
  badgeText: string;
  badgeVariant: "bad" | "warn" | "info";
  actionLabel: string;
  icon: JSX.Element;
  formatSubtitle: (count: number) => string;
}[] = [
  {
    type: "incompleto",
    title: "Marcações incompletas",
    colorClass: "red",
    badgeText: "Alta",
    badgeVariant: "bad",
    actionLabel: "Ver ocorrências",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    formatSubtitle: (count) =>
      `${count} ${count === 1 ? "funcionário" : "funcionários"} · Saída ou intervalo não registrado`,
  },
  {
    type: "justificativa",
    title: "Justificativas pendentes",
    colorClass: "amber",
    badgeText: "Pendente",
    badgeVariant: "warn",
    actionLabel: "Revisar solicitações",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <circle cx="11.5" cy="14.5" r="2.5" />
        <path d="M13.25 16.25L15 18" />
      </svg>
    ),
    formatSubtitle: (count) =>
      `${count} ${count === 1 ? "solicitação" : "solicitações"} aguardando análise do RH`,
  },
  {
    type: "homeoffice",
    title: "Autorizações remotas",
    colorClass: "blue",
    badgeText: "Revisar",
    badgeVariant: "info",
    actionLabel: "Revisar autorizações",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
    formatSubtitle: (count) =>
      `${count} ${count === 1 ? "solicitação" : "solicitações"} de home office para verificar`,
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
            Pendências que exigem deliberação humana para fechamento da folha de
            ponto.
          </p>
        </div>
        <button
          type="button"
          className="btn-link"
          onClick={() => go("occurrences", { open: "1" })}
        >
          Ver todas ({openOccs.length}) →
        </button>
      </div>

      <div className="priority-list">
        {priorityItems.map((item) => {
          const cases = openOccs.filter((o) => o.type === item.type);
          return (
            <div key={item.type} className="priority-item">
              <div className="priority-item-left">
                <div
                  className={`priority-icon-box ${item.colorClass}`}
                  aria-hidden="true"
                >
                  {item.icon}
                </div>
                <div className="priority-item-text">
                  <strong>{item.title}</strong>
                  <span>{item.formatSubtitle(cases.length)}</span>
                </div>
              </div>

              <div className="priority-item-right">
                <span className={`badge ${item.badgeVariant}`}>
                  {item.badgeText}
                </span>
                <button
                  type="button"
                  className="btn primary-outline"
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
