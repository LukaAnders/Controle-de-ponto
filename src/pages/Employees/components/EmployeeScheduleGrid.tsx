import { TODAY } from "../../../data/mockData";
import { Employee } from "../../../types";

const weekDays = [
  { day: "Seg", date: "26 Out" },
  { day: "Ter", date: "27 Out" },
  { day: "Qua", date: "28 Out" },
  { day: "Qui", date: "29 Out" },
  { day: "Sex", date: "30 Out" },
];

interface EmployeeScheduleGridProps {
  list: Employee[];
  detailId: string;
  onSelectDetail: (id: string) => void;
}

export default function EmployeeScheduleGrid({
  list,
  detailId,
  onSelectDetail,
}: EmployeeScheduleGridProps) {
  const getInitials = (name: string) =>
    name
      .split(" ")
      .slice(0, 2)
      .map((p) => p[0])
      .join("");

  return (
    <div className="card scroll">
      <table className="schedule-grid-table">
        <thead>
          <tr>
            <th style={{ minWidth: 200 }}>Colaborador</th>
            {weekDays.map((w) => (
              <th key={w.day}>
                <div className="day-col-header">
                  <strong>{w.day}</strong>
                  <small>{w.date}</small>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {list.map((e, idx) => {
            const isRemoteValid = e.remote.allowed && e.remote.until >= TODAY;
            const times =
              e.schedule.split(" ")[0] + " - " + e.schedule.split(" ")[2];

            return (
              <tr
                key={e.id}
                className={detailId === e.id ? "selected-row" : ""}
                style={{ cursor: "pointer" }}
                onClick={() =>
                  onSelectDetail(detailId === e.id ? "" : e.id)
                }
              >
                <td>
                  <div className="emp-cell">
                    <div className={`emp-avatar alt-${idx % 4}`}>
                      {getInitials(e.name)}
                    </div>
                    <div>
                      <strong>{e.name}</strong>
                      <div className="cell-sub">
                        {e.dept} · {e.mode}
                      </div>
                    </div>
                  </div>
                </td>

                {weekDays.map((w, dayIdx) => {
                  if (!e.active) {
                    return (
                      <td key={w.day}>
                        <div className="shift-pill inativo">
                          Inativo
                          <small>Sem turno</small>
                        </div>
                      </td>
                    );
                  }

                  const isRemoteDay =
                    e.mode === "Remoto" ||
                    (e.mode === "Híbrido" && (dayIdx === 0 || dayIdx === 4));

                  const pillClass = isRemoteDay
                    ? isRemoteValid
                      ? "remoto"
                      : "alerta"
                    : "presencial";

                  const modeLabel = isRemoteDay
                    ? isRemoteValid
                      ? "Home Office"
                      : "Sem permissão"
                    : "Presencial";

                  return (
                    <td key={w.day}>
                      <div className={`shift-pill ${pillClass}`}>
                        {times || "08:00 - 17:00"}
                        <small>{modeLabel}</small>
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
