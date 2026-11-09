import { DashboardAnalytics } from "../dadosAnaliticos";
import { Page } from "../../../tipos";

interface ModalityDistributionProps {
  analytics: DashboardAnalytics;
  go: (p: Page, q?: Record<string, string>) => void;
}

export default function ModalityDistribution({
  analytics,
  go,
}: ModalityDistributionProps) {
  return (
    <div className="chart-panel" aria-labelledby="modalities-heading">
      <div className="chart-panel-header">
        <div>
          <h3 id="modalities-heading" className="chart-title">
            Registros por modalidade
          </h3>
          <span className="chart-subtitle">
            Comparativo de utilização dos meios de marcação de jornada (
            {analytics.totalPunchRecords} batidas no período)
          </span>
        </div>
        <button
          type="button"
          className="admin-link-btn"
          onClick={() => go("punch")}
        >
          Central de Ponto →
        </button>
      </div>

      <div className="modality-bars">
        {analytics.modalityUsage.map((item) => (
          <div key={item.modality} className="modality-bar-item">
            <div className="modality-bar-header">
              <div>
                <strong>{item.label}</strong>
                <span className="modality-bar-desc"> · {item.description}</span>
              </div>
              <div className="modality-metrics-right">
                <span className="modality-count-pill">
                  {item.punchCount} reg.
                </span>
                <strong className="modality-pct">{item.pct}%</strong>
              </div>
            </div>

            <div className="bar-track" aria-hidden="true">
              <div
                className="bar-fill"
                style={{
                  width: `${Math.max(item.pct, item.punchCount > 0 ? 4 : 0)}%`,
                  background: item.color,
                }}
              />
            </div>

            {item.accessOnlyCount > 0 && (
              <div className="modality-access-note">
                + {item.accessOnlyCount} eventos exclusivos de acesso físico
                (portaria) contabilizados separadamente da jornada.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
