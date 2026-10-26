import { base } from "../../../data/mockData";
import { Page } from "../../../types";

interface ModalityDistributionProps {
  go: (p: Page, q?: Record<string, string>) => void;
}

export default function ModalityDistribution({
  go,
}: ModalityDistributionProps) {
  return (
    <section className="card" aria-labelledby="modalities-heading">
      <div className="section-header">
        <div>
          <h2 id="modalities-heading">Distribuição por modalidade de ponto</h2>
          <p className="sub" style={{ margin: "2px 0 0" }}>
            Os percentuais abaixo representam uma distribuição demonstrativa do
            volume de registros no período selecionado, e não o número de
            funcionários únicos.
          </p>
        </div>
        <button type="button" className="btn" onClick={() => go("punch")}>
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
  );
}
