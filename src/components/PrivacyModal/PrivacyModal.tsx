import "./PrivacyModal.css";

interface PrivacyModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PrivacyModal({ open, onClose }: PrivacyModalProps) {
  if (!open) return null;

  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="modal modal-wide"
        role="dialog"
        aria-modal="true"
        aria-label="Diretrizes de Privacidade, LGPD e Escopo do Protótipo"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Privacidade, LGPD e Limites do Protótipo</h2>
          <button type="button" className="btn" onClick={onClose}>
            Fechar
          </button>
        </div>
        <p className="sub privacy-modal-intro">
          O PontoNexo foi projetado aplicando princípios de privacidade desde a concepção (Privacy by Design) para fins acadêmicos e demonstrativos.
        </p>
        <div className="info-box">
          <strong>1. Dados estritamente fictícios e sem coleta biométrica</strong>
          <p>
            Nenhuma câmera, leitor biométrico, catraca física ou relógio de ponto real é acionado. A etapa de verificação facial do Ponto Digital e a leitura da Catraca Biométrica utilizam animações visuais locais, sem capturar imagens ou dados pessoais sensíveis.
          </p>
        </div>
        <div className="info-box">
          <strong>2. Governança de IA e supervisão humana</strong>
          <p>
            O Assistente de IA e o bloco “Sugestão do assistente” atuam exclusivamente como apoio informativo e operacional. O sistema não realiza aprovações ou rejeições automáticas de justificativas nem toma decisões trabalhistas autônomas.
          </p>
        </div>
        <div className="info-box">
          <strong>3. Requisitos para uma eventual implantação real (LGPD)</strong>
          <p>
            Como sistemas de ponto com biometria tratam dados pessoais sensíveis (Art. 5º, II e Art. 11 da Lei nº 13.709/2018 — LGPD), uma implementação produtiva exigiria avaliação jurídica formal, definição de base legal apropriada, controle de acesso autenticado no servidor, criptografia, políticas de retenção e descarte seguro, além de homologação técnica conforme normas trabalhistas vigentes (Portaria MTP nº 671/2021). Este protótipo acadêmico não possui certificação legal.
          </p>
        </div>
        <div className="row privacy-modal-footer">
          <button type="button" className="btn primary" onClick={onClose}>
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}

