import { useState } from "react";
import { useApp } from "./context/AppContext";
import Sidebar from "./components/Sidebar/Sidebar";
import Header from "./components/Header/Header";
import Toast from "./components/Toast/Toast";
import PrivacyModal from "./components/PrivacyModal/PrivacyModal";
import Overview from "./pages/Overview/Overview";
import Punch from "./pages/Punch/Punch";
import Employees from "./pages/Employees/Employees";
import Occurrences from "./pages/Occurrences/Occurrences";
import Assistant from "./pages/Assistant/Assistant";

export default function App() {
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
      <PrivacyModal
        open={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </div>
  );
}
