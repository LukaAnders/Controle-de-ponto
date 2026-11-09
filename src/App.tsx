import { useState } from "react";
import { useApp } from "./contexto/ContextoApp";
import Sidebar from "./componentes/BarraLateral/BarraLateral";
import Header from "./componentes/Cabecalho/Cabecalho";
import Toast from "./componentes/AvisoFlutuante/AvisoFlutuante";
import PrivacyModal from "./componentes/ModalPrivacidade/ModalPrivacidade";
import Overview from "./paginas/VisaoGeral/VisaoGeral";
import Punch from "./paginas/Ponto/Ponto";
import Employees from "./paginas/Funcionarios/Funcionarios";
import Occurrences from "./paginas/Ocorrencias/Ocorrencias";
import Assistant from "./paginas/Assistente/Assistente";
import AssistantWidget from "./paginas/Assistente/AssistantWidget";
import { AssistantChatProvider } from "./paginas/Assistente/AssistantChatContext";

export default function App() {
  return (
    <AssistantChatProvider>
      <AppContent />
    </AssistantChatProvider>
  );
}

function AppContent() {
  const { page } = useApp();
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const CurrentPage = {
    overview: Overview,
    punch: Punch,
    employees: Employees,
    occurrences: Occurrences,
    assistant: Assistant,
  }[page];

  return (
    <div className="shell">
      <Header />

      <div className="shell-body">
        <Sidebar onOpenPrivacy={() => setShowPrivacyModal(true)} />

        <div className="main">
          <main className="page-container">
            <CurrentPage />
          </main>
        </div>
      </div>

      <Toast />
      <AssistantWidget />
      <PrivacyModal
        open={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </div>
  );
}
