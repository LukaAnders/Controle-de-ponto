import { useState, useEffect } from "react";
import { useApp, SELF } from "../../contexto/ContextoApp";
import { TODAY, now } from "../../dados/dadosSimulados";
import EmployeeContextBar from "./componentes/BarraContextoFuncionario";
import DigitalPunchCard from "./componentes/CartaoPontoDigital";
import BiometricTurnstileCard from "./componentes/CartaoCatracaBiometrica";
import ConventionalClockCard from "./componentes/CartaoRelogioConvencional";
import PunchHistoryTable from "./componentes/TabelaHistoricoPonto";
import "./Ponto.css";

export default function Punch() {
  const { employees, recs, addRec, role, notify, go } = useApp();
  const [empId, setEmpId] = useState(
    role === "funcionario" ? SELF : employees[0]?.id || "e1",
  );

  useEffect(() => {
    if (role === "funcionario") {
      setEmpId(SELF);
    } else if (!employees.some((x) => x.id === empId) && employees[0]) {
      setEmpId(employees[0].id);
    }
  }, [role, employees, empId]);

  const selectedEmployee =
    employees.find((x) => x.id === empId) || employees[0];

  const isRemoteExpired = Boolean(
    selectedEmployee &&
      selectedEmployee.remote.allowed &&
      selectedEmployee.remote.until !== "" &&
      selectedEmployee.remote.until < TODAY,
  );
  const isRemoteValid = Boolean(
    selectedEmployee &&
      selectedEmployee.remote.allowed &&
      selectedEmployee.remote.until >= TODAY,
  );

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <h1>Central de Ponto</h1>
          <p className="sub">
            Simule e compare as três modalidades de registro de jornada e
            controle de acesso. Todas as interações são locais e demonstrativas.
          </p>
        </div>
        <div
          className="clock-pill"
          aria-label="Horário demonstrativo do sistema"
        >
          <span>Horário do servidor simulado:</span>
          <strong>{now()}</strong>
        </div>
      </div>

      <PunchHistoryTable recs={recs} employees={employees} />

      {selectedEmployee && (
        <>
          <EmployeeContextBar
            selectedEmployee={selectedEmployee}
            employees={employees}
            role={role}
            isRemoteValid={isRemoteValid}
            isRemoteExpired={isRemoteExpired}
            onSelectEmployee={setEmpId}
            go={go}
          />

          <div className="grid3 modalities-grid">
            <DigitalPunchCard
              employee={selectedEmployee}
              isRemoteValid={isRemoteValid}
              isRemoteExpired={isRemoteExpired}
              addRec={addRec}
              notify={notify}
            />

            <BiometricTurnstileCard
              employee={selectedEmployee}
              addRec={addRec}
              notify={notify}
            />

            <ConventionalClockCard
              employees={employees}
              addRec={addRec}
              notify={notify}
            />
          </div>
        </>
      )}
    </div>
  );
}

