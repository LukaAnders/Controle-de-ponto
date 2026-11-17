import {
  AlertOctagon,
  FileClock,
  ClockAlert,
  Laptop,
  ArrowRight,
} from "lucide-react";
import { Occ, OccType, Page } from "../../../tipos";

interface PendencyCategory {
  id: string;
  type: OccType;
  title: string;
  subtitle: string;
  tone: "bad" | "warn" | "info";
  icon: typeof AlertOctagon;
  filter: (o: Occ) => boolean;
}

const pendingCategories: PendencyCategory[] = [
  {
    id: "incompleto",
    type: "incompleto",
    title: "Registros incompletos",
    subtitle: "Marcações sem entrada, intervalo ou saída",
    tone: "bad",
    icon: AlertOctagon,
    filter: (o) => o.type === "incompleto",
  },
  {
    id: "justificativa-pendente",
    type: "justificativa",
    title: "Justificativas aguardando aprovação",
    subtitle: "Solicitações pendentes de deliberação",
    tone: "warn",
    icon: FileClock,
    filter: (o) => o.type === "justificativa" && o.status === "Pendente",
  },
  {
    id: "atrasos-analise",
    type: "justificativa",
    title: "Atrasos e ausências em análise",
    subtitle: "Ocorrências em verificação pelo RH/gestor",
    tone: "warn",
    icon: ClockAlert,
    filter: (o) => o.type === "justificativa" && o.status === "Em análise",
  },
  {
    id: "outras-solicitacoes",
    type: "homeoffice",
    title: "Outras solicitações pendentes",
    subtitle: "Autorizações de trabalho remoto em aberto",
    tone: "info",
    icon: Laptop,
    filter: (o) => o.type === "homeoffice",
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
            Pendências que precisam de atenção
          </h2>
          <span className="admin-section-meta">
            Apenas itens em aberto que aguardam ação ou análise do RH ({openOccs.length}{" "}
            {openOccs.length === 1 ? "pendência ativa" : "pendências ativas"})
          </span>
        </div>

        <button
          type="button"
          className="admin-link-btn"
          onClick={() => go("occurrences", { open: "1" })}
        >
          Gerenciar todas ({openOccs.length}) →
        </button>
      </div>

      <div className="pendency-cards-grid">
        {pendingCategories.map((item) => {
          const Icon = item.icon;
          const cases = openOccs.filter(item.filter);
          const count = cases.length;
          const uniqueEmpCount = new Set(cases.map((o) => o.empId)).size;
          const hasItems = count > 0;

          return (
            <button
              key={item.id}
              type="button"
              className={`pendency-compact-card ${
                hasItems ? `tone-${item.tone}` : "tone-clear"
              }`}
              onClick={() =>
                go("occurrences", { type: item.type, open: "1" })
              }
            >
              <div className="pendency-card-top">
                <span className="pendency-card-icon">
                  <Icon size={16} strokeWidth={2} aria-hidden="true" />
                </span>
                <strong className="pendency-card-count">{count}</strong>
                <span className="pendency-card-status">
                  {hasItems
                    ? `${uniqueEmpCount} ${
                        uniqueEmpCount === 1 ? "colab." : "colabs."
                      }`
                    : "Em dia"}
                </span>
              </div>

              <div className="pendency-card-body">
                <strong className="pendency-card-title">{item.title}</strong>
                <span className="pendency-card-sub">{item.subtitle}</span>
              </div>

              <span className="pendency-card-action">
                {hasItems ? "Analisar" : "Visualizar"}
                <ArrowRight size={13} aria-hidden="true" />
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
