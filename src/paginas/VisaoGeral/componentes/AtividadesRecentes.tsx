import {
  Clock,
  DoorOpen,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { Page } from "../../../tipos";
import { RecentActivityItem } from "../dadosAnaliticos";

interface AtividadesRecentesProps {
  activities: RecentActivityItem[];
  go: (p: Page, q?: Record<string, string>) => void;
}

const categoryIcon: Record<RecentActivityItem["category"], typeof Clock> = {
  ponto: Clock,
  acesso: DoorOpen,
  solicitacao: FileText,
  aprovacao: CheckCircle2,
  reprovacao: XCircle,
  correcao: AlertTriangle,
};

export default function AtividadesRecentes({
  activities,
  go,
}: AtividadesRecentesProps) {
  return (
    <section
      className="admin-panel"
      aria-labelledby="recent-activities-heading"
    >
      <div className="admin-section-bar">
        <div>
          <h2 id="recent-activities-heading" className="admin-section-title">
            Atividades recentes
          </h2>
          <span className="admin-section-meta">
            Últimas movimentações de registros de ponto, justificativas e análises
          </span>
        </div>

        <button
          type="button"
          className="admin-link-btn"
          onClick={() => go("punch")}
        >
          Ver histórico de ponto →
        </button>
      </div>

      {activities.length === 0 ? (
        <div className="activities-empty">
          Nenhuma movimentação registrada para os filtros atuais.
        </div>
      ) : (
        <ul className="activities-feed">
          {activities.map((item) => {
            const Icon = categoryIcon[item.category];
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className="activity-row"
                  onClick={() => go(item.targetPage, item.targetQuery)}
                >
                  <span className={`activity-icon tone-${item.tone}`}>
                    <Icon size={15} strokeWidth={2} aria-hidden="true" />
                  </span>

                  <div className="activity-main">
                    <div className="activity-top-line">
                      <span className="activity-type">{item.typeLabel}</span>
                      <span className="activity-time">{item.time}</span>
                    </div>
                    <p className="activity-desc">{item.description}</p>
                  </div>

                  <div className="activity-right">
                    <span className={`badge ${item.tone === "neutral" ? "" : item.tone}`}>
                      {item.status}
                    </span>
                    <ChevronRight
                      size={14}
                      className="activity-arrow"
                      aria-hidden="true"
                    />
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
