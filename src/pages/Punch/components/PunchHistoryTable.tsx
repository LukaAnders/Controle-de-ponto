import { useState } from "react";
import { Employee, Rec } from "../../../types";

interface PunchHistoryTableProps {
  recs: Rec[];
  employees: Employee[];
}

export default function PunchHistoryTable({
  recs,
  employees,
}: PunchHistoryTableProps) {
  const [histFilter, setHistFilter] = useState<string>("all");

  const filteredRecs = recs.filter((r) => {
    if (histFilter === "ponto") return r.kind === "Registro de ponto";
    if (histFilter === "acesso") return r.kind === "Evento de acesso";
    if (
      histFilter === "Digital" ||
      histFilter === "Catraca" ||
      histFilter === "Convencional"
    ) {
      return r.modality === histFilter;
    }
    return true;
  });

  return (
    <section className="card" aria-labelledby="punch-history-title">
      <div className="section-header">
        <div>
          <h2 id="punch-history-title">Histórico recente da Central</h2>
          <p className="sub" style={{ margin: "2px 0 0" }}>
            Acompanhe os registros de jornada e os eventos de acesso físico
            gerados nas simulações acima.
          </p>
        </div>

        <div className="row">
          <label className="inline-filter">
            <span>Filtrar visualização:</span>
            <select
              value={histFilter}
              onChange={(ev) => setHistFilter(ev.target.value)}
            >
              <option value="all">Todos os eventos ({recs.length})</option>
              <option value="ponto">Somente Registros de ponto</option>
              <option value="acesso">Somente Eventos de acesso físico</option>
              <option value="Digital">Modalidade: Ponto digital</option>
              <option value="Catraca">Modalidade: Catraca biométrica</option>
              <option value="Convencional">
                Modalidade: Relógio convencional
              </option>
            </select>
          </label>
        </div>
      </div>

      <div className="scroll">
        <table>
          <thead>
            <tr>
              <th>Funcionário</th>
              <th>Modalidade</th>
              <th>Tipo de evento</th>
              <th>Detalhamento</th>
              <th>Data e hora</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecs.map((r) => {
              const empObj = employees.find((x) => x.id === r.empId);
              const isAccessOnly = r.kind === "Evento de acesso";
              return (
                <tr key={r.id}>
                  <td>
                    <strong>{empObj?.name ?? "Colaborador"}</strong>
                    {empObj && (
                      <div className="cell-sub">
                        Mat. {empObj.reg} · {empObj.dept}
                      </div>
                    )}
                  </td>
                  <td>{r.modality}</td>
                  <td>
                    <span className={`badge ${isAccessOnly ? "info" : "ok"}`}>
                      {r.kind}
                    </span>
                  </td>
                  <td className="muted-cell">
                    {r.detail ?? "Operação simulada"}
                  </td>
                  <td>{r.time}</td>
                  <td>
                    <span className={`badge ${isAccessOnly ? "" : "ok"}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              );
            })}
            {filteredRecs.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-cell">
                  Nenhum registro encontrado para o filtro selecionado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
