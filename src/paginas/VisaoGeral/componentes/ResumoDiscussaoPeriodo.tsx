import { DashboardAnalytics } from "../dadosAnaliticos";
import "../VisaoGeral.css";

interface ResumoDiscussaoPeriodoProps {
  analytics: DashboardAnalytics;
}

export default function ResumoDiscussaoPeriodo({
  analytics,
}: ResumoDiscussaoPeriodoProps) {
  return (
    <section
      className="admin-panel"
      aria-labelledby="results-discussion-heading"
    >
      <div className="admin-section-bar">
        <div>
          <h2 id="results-discussion-heading" className="admin-section-title">
            Análise dos resultados e discussão do período
          </h2>
          <span className="admin-section-meta">
            Síntese interpretativa gerada automaticamente a partir dos
            indicadores, registros e ocorrências filtrados
          </span>
        </div>
        <span className="badge info">Apoio à decisão do RH</span>
      </div>

      <div className="discussion-grid">
        {analytics.discussionInsights.map((insight, idx) => (
          <div key={idx} className="discussion-card">
            <div className="discussion-card-top">
              <span
                className={`discussion-indicator ${insight.tone}`}
                aria-hidden="true"
              />
              <strong>{insight.title}</strong>
            </div>
            <p className="discussion-card-text">{insight.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
