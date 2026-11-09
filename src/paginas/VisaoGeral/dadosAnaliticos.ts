import { Employee, Occ, Rec } from "../../tipos";
import { formatDateBR, typeLabel } from "../../dados/dadosSimulados";

export type PeriodKey = "dia" | "semana" | "mes";

export interface EmployeeMetricsRow {
  emp: Employee;
  expectedDays: number;
  workedDays: number;
  absences: number;
  delays: number;
  incompleteCount: number;
  attendancePct: number;
  expectedHours: number;
  workedHours: number;
  overtimeHours: number;
  balanceHours: number;
  primaryModality: "Digital" | "Catraca" | "Convencional";
}

export interface FrequencyPoint {
  label: string;
  subLabel: string;
  present: number;
  active: number;
  pct: number;
}

export interface OccDistributionItem {
  key: string;
  label: string;
  count: number;
  pct: number;
  color: string;
}

export interface ModalityUsageItem {
  modality: "Digital" | "Catraca" | "Convencional";
  label: string;
  punchCount: number;
  accessOnlyCount: number;
  pct: number;
  description: string;
  color: string;
}

export interface DashboardAnalytics {
  periodLabel: string;
  periodRangeLabel: string;
  activeEmployeesCount: number;
  presentEmployeesCount: number;
  inShiftCount: number;
  attendancePct: number;
  totalExpectedHours: number;
  totalWorkedHours: number;
  avgWorkedHoursPerEmp: number;
  totalOvertimeHours: number;
  totalBalanceHours: number;
  totalOccurrences: number;
  openOccurrences: number;
  incompleteCount: number;
  justificationsPendingCount: number;
  delaysAndAbsencesCount: number;
  homeOfficeRequestsCount: number;
  totalPunchRecords: number;
  totalAccessOnlyRecords: number;
  employeeRows: EmployeeMetricsRow[];
  frequencySeries: FrequencyPoint[];
  occDistribution: OccDistributionItem[];
  modalityUsage: ModalityUsageItem[];
  discussionInsights: {
    title: string;
    text: string;
    tone: "ok" | "warn" | "bad" | "info";
  }[];
}

// Base demonstrativa coerente por colaborador para dias/horas/atrasos no mês (22 dias úteis), semana (5 dias) e dia (1 dia)
const EMP_BASE_PROFILE: Record<
  string,
  {
    monthAbsent: number;
    monthDelays: number;
    monthOvertimeH: number;
    monthUndertimeH: number;
    defaultModality: "Digital" | "Catraca" | "Convencional";
  }
> = {
  e1: {
    monthAbsent: 0,
    monthDelays: 1,
    monthOvertimeH: 2.5,
    monthUndertimeH: 0,
    defaultModality: "Digital",
  },
  e2: {
    monthAbsent: 0,
    monthDelays: 1,
    monthOvertimeH: 0,
    monthUndertimeH: 1.5,
    defaultModality: "Digital",
  },
  e3: {
    monthAbsent: 0,
    monthDelays: 1,
    monthOvertimeH: 1.5,
    monthUndertimeH: 0,
    defaultModality: "Catraca",
  },
  e4: {
    monthAbsent: 0,
    monthDelays: 0,
    monthOvertimeH: 3.0,
    monthUndertimeH: 0,
    defaultModality: "Catraca",
  },
  e5: {
    monthAbsent: 1,
    monthDelays: 1,
    monthOvertimeH: 1.0,
    monthUndertimeH: 2.0,
    defaultModality: "Convencional",
  },
  e6: {
    monthAbsent: 0,
    monthDelays: 0,
    monthOvertimeH: 0,
    monthUndertimeH: 0,
    defaultModality: "Convencional",
  },
  e7: {
    monthAbsent: 1,
    monthDelays: 0,
    monthOvertimeH: 0,
    monthUndertimeH: 4.0,
    defaultModality: "Digital",
  },
  e8: {
    monthAbsent: 0,
    monthDelays: 1,
    monthOvertimeH: 2.0,
    monthUndertimeH: 1.0,
    defaultModality: "Digital",
  },
};

export function formatHours(h: number, showSign = false): string {
  const sign = h < 0 ? "-" : showSign && h > 0 ? "+" : "";
  const abs = Math.abs(h);
  const whole = Math.floor(abs);
  const mins = Math.round((abs - whole) * 60);
  if (mins === 0) return `${sign}${whole}h`;
  return `${sign}${whole}h${String(mins).padStart(2, "0")}m`;
}

export function computeDashboardAnalytics(
  employees: Employee[],
  occs: Occ[],
  recs: Rec[],
  period: PeriodKey,
): DashboardAnalytics {
  const periodMeta: Record<
    PeriodKey,
    { label: string; range: string; expectedDays: number; mult: number }
  > = {
    dia: {
      label: "Resumo do dia (Hoje · 26/10/2026)",
      range: "26/10/2026",
      expectedDays: 1,
      mult: 1,
    },
    semana: {
      label: "Resumo da semana (20/10 a 26/10/2026)",
      range: "20/10/2026 a 26/10/2026 (5 dias úteis)",
      expectedDays: 5,
      mult: 5,
    },
    mes: {
      label: "Resumo do mês (Outubro/2026)",
      range: "01/10/2026 a 26/10/2026 (22 dias úteis)",
      expectedDays: 22,
      mult: 18,
    },
  };

  const meta = periodMeta[period];
  const visibleIds = new Set(employees.map((e) => e.id));
  const scopedOccs = occs.filter((o) => visibleIds.has(o.empId));
  const scopedRecs = recs.filter((r) => visibleIds.has(r.empId));

  const employeeRows: EmployeeMetricsRow[] = employees.map((emp) => {
    const prof = EMP_BASE_PROFILE[emp.id] || {
      monthAbsent: 0,
      monthDelays: 0,
      monthOvertimeH: 1,
      monthUndertimeH: 0,
      defaultModality:
        emp.mode === "Remoto"
          ? "Digital"
          : emp.dept === "Operações"
            ? "Convencional"
            : "Catraca",
    };

    const empOccs = scopedOccs.filter((o) => o.empId === emp.id);
    const incompleteCount = empOccs.filter((o) => o.type === "incompleto").length;
    const justCount = empOccs.filter((o) => o.type === "justificativa").length;

    if (!emp.active) {
      return {
        emp,
        expectedDays: 0,
        workedDays: 0,
        absences: 0,
        delays: 0,
        incompleteCount: 0,
        attendancePct: 0,
        expectedHours: 0,
        workedHours: 0,
        overtimeHours: 0,
        balanceHours: 0,
        primaryModality: prof.defaultModality,
      };
    }

    const expectedDays = meta.expectedDays;
    const absences =
      period === "dia"
        ? emp.id === "e7"
          ? 1
          : 0
        : period === "semana"
          ? prof.monthAbsent > 0
            ? 1
            : 0
          : prof.monthAbsent;

    const workedDays = Math.max(0, expectedDays - absences);
    const delays =
      period === "dia"
        ? emp.id === "e2"
          ? 1
          : 0
        : period === "semana"
          ? Math.max(justCount, prof.monthDelays)
          : prof.monthDelays + justCount;

    const attendancePct =
      expectedDays > 0 ? Math.round((workedDays / expectedDays) * 100) : 100;

    const expectedHours = expectedDays * 8;
    const overtimeHours =
      period === "dia"
        ? Number((prof.monthOvertimeH / 5).toFixed(1))
        : period === "semana"
          ? prof.monthOvertimeH
          : Number((prof.monthOvertimeH * 2.5).toFixed(1));

    const undertimeHours =
      period === "dia"
        ? emp.id === "e7"
          ? 8
          : Number((prof.monthUndertimeH / 5).toFixed(1))
        : period === "semana"
          ? absences * 8 + prof.monthUndertimeH
          : absences * 8 + Number((prof.monthUndertimeH * 2).toFixed(1));

    const workedHours = Math.max(
      0,
      Number((expectedHours - undertimeHours + overtimeHours).toFixed(1)),
    );
    const balanceHours = Number((workedHours - expectedHours).toFixed(1));

    const latestPunch = scopedRecs.find(
      (r) => r.empId === emp.id && r.kind === "Registro de ponto",
    );

    return {
      emp,
      expectedDays,
      workedDays,
      absences,
      delays,
      incompleteCount,
      attendancePct,
      expectedHours,
      workedHours,
      overtimeHours,
      balanceHours,
      primaryModality: latestPunch?.modality || prof.defaultModality,
    };
  });

  const activeRows = employeeRows.filter((r) => r.emp.active);
  const activeEmployeesCount = activeRows.length;
  const presentEmployeesCount = activeRows.filter(
    (r) => r.workedDays >= r.expectedDays,
  ).length;
  const inShiftCount = activeRows.filter(
    (r) => r.emp.id !== "e3" && r.emp.id !== "e7",
  ).length;

  const totalExpectedDays = activeRows.reduce((a, b) => a + b.expectedDays, 0);
  const totalWorkedDays = activeRows.reduce((a, b) => a + b.workedDays, 0);
  const attendancePct =
    totalExpectedDays > 0
      ? Math.round((totalWorkedDays / totalExpectedDays) * 100)
      : 0;

  const totalExpectedHours = Number(
    activeRows.reduce((a, b) => a + b.expectedHours, 0).toFixed(1),
  );
  const totalWorkedHours = Number(
    activeRows.reduce((a, b) => a + b.workedHours, 0).toFixed(1),
  );
  const avgWorkedHoursPerEmp =
    activeEmployeesCount > 0
      ? Number((totalWorkedHours / activeEmployeesCount).toFixed(1))
      : 0;
  const totalOvertimeHours = Number(
    activeRows.reduce((a, b) => a + b.overtimeHours, 0).toFixed(1),
  );
  const totalBalanceHours = Number(
    (totalWorkedHours - totalExpectedHours).toFixed(1),
  );

  // Ocorrências
  const openOccs = scopedOccs.filter(
    (o) => o.status === "Pendente" || o.status === "Em análise",
  );
  const incompleteCount = scopedOccs.filter(
    (o) => o.type === "incompleto",
  ).length;
  const justificationsCount = scopedOccs.filter(
    (o) => o.type === "justificativa",
  ).length;
  const justificationsPendingCount = openOccs.filter(
    (o) => o.type === "justificativa",
  ).length;
  const homeOfficeRequestsCount = scopedOccs.filter(
    (o) => o.type === "homeoffice",
  ).length;

  const totalDelays = activeRows.reduce((a, b) => a + b.delays, 0);
  const totalAbsences = activeRows.reduce((a, b) => a + b.absences, 0);
  const delaysAndAbsencesCount = totalDelays + totalAbsences;

  // Distribuição de ocorrências por tipo para o Gráfico 2 (Rosca)
  const totalOccChart = Math.max(1, scopedOccs.length);
  const occDistribution: OccDistributionItem[] = [
    {
      key: "justificativa",
      label: "Atrasos e ausências justificadas",
      count: justificationsCount,
      pct: Math.round((justificationsCount / totalOccChart) * 100),
      color: "#2563eb",
    },
    {
      key: "incompleto",
      label: "Registros incompletos",
      count: incompleteCount,
      pct: Math.round((incompleteCount / totalOccChart) * 100),
      color: "#dc2626",
    },
    {
      key: "homeoffice",
      label: "Autorizações de Home Office",
      count: homeOfficeRequestsCount,
      pct: Math.max(
        0,
        100 -
          Math.round((justificationsCount / totalOccChart) * 100) -
          Math.round((incompleteCount / totalOccChart) * 100),
      ),
      color: "#d97706",
    },
  ];

  // Modalidades de ponto (diferenciando Registro de ponto vs Evento de acesso)
  const punchRecs = scopedRecs.filter((r) => r.kind === "Registro de ponto");
  const accessRecs = scopedRecs.filter((r) => r.kind === "Evento de acesso");

  const countModality = (mod: "Digital" | "Catraca" | "Convencional") => {
    const basePunch = punchRecs.filter((r) => r.modality === mod).length;
    const empUsingMod = activeRows.filter((r) => r.primaryModality === mod).length;
    return period === "dia"
      ? Math.max(basePunch, empUsingMod * 2)
      : basePunch + empUsingMod * meta.mult * 2;
  };

  const digCount = countModality("Digital");
  const catCount = countModality("Catraca");
  const convCount = countModality("Convencional");
  const totalPunchRecords = digCount + catCount + convCount;

  const accessCatracaCount =
    period === "dia"
      ? accessRecs.length
      : accessRecs.length * Math.max(1, Math.floor(meta.mult / 2));

  const totalAccessOnlyRecords = accessCatracaCount;

  const safePunchTotal = Math.max(1, totalPunchRecords);
  const digPct = Math.round((digCount / safePunchTotal) * 100);
  const catPct = Math.round((catCount / safePunchTotal) * 100);
  const convPct =
    totalPunchRecords > 0 ? Math.max(0, 100 - digPct - catPct) : 0;

  const modalityUsage: ModalityUsageItem[] = [
    {
      modality: "Digital",
      label: "Ponto digital (Web / App)",
      punchCount: digCount,
      accessOnlyCount: 0,
      pct: digPct,
      description:
        "Marcações remotas e híbridas com verificação facial simulada e validação de permissão.",
      color: "#2563eb",
    },
    {
      modality: "Catraca",
      label: "Catraca biométrica (Portaria)",
      punchCount: catCount,
      accessOnlyCount: accessCatracaCount,
      pct: catPct,
      description:
        "Terminal de recepção que separa batidas de jornada de giros exclusivos de acesso físico.",
      color: "#0f172a",
    },
    {
      modality: "Convencional",
      label: "Relógio convencional (REP)",
      punchCount: convCount,
      accessOnlyCount: 0,
      pct: convPct,
      description:
        "Equipamento tradicional de parede utilizado em regime presencial por matrícula.",
      color: "#0284c7",
    },
  ];

  // Série de frequência por período para o Gráfico 1
  const nActive = Math.max(1, activeEmployeesCount);
  const frequencySeries: FrequencyPoint[] =
    period === "dia"
      ? [
          {
            label: "08h",
            subLabel: "Início turno",
            present: Math.max(0, presentEmployeesCount - 1),
            active: activeEmployeesCount,
            pct: Math.round(
              (Math.max(0, presentEmployeesCount - 1) / nActive) * 100,
            ),
          },
          {
            label: "10h",
            subLabel: "Manhã",
            present: presentEmployeesCount,
            active: activeEmployeesCount,
            pct: Math.round((presentEmployeesCount / nActive) * 100),
          },
          {
            label: "12h",
            subLabel: "Intervalo",
            present: Math.max(0, presentEmployeesCount - 1),
            active: activeEmployeesCount,
            pct: Math.round(
              (Math.max(0, presentEmployeesCount - 1) / nActive) * 100,
            ),
          },
          {
            label: "14h",
            subLabel: "Tarde",
            present: presentEmployeesCount,
            active: activeEmployeesCount,
            pct: Math.round((presentEmployeesCount / nActive) * 100),
          },
          {
            label: "17h",
            subLabel: "Encerramento",
            present: presentEmployeesCount,
            active: activeEmployeesCount,
            pct: Math.round((presentEmployeesCount / nActive) * 100),
          },
        ]
      : period === "semana"
        ? [
            {
              label: "Seg",
              subLabel: "20/10",
              present: activeEmployeesCount,
              active: activeEmployeesCount,
              pct: activeEmployeesCount > 0 ? 100 : 0,
            },
            {
              label: "Ter",
              subLabel: "21/10",
              present: activeEmployeesCount,
              active: activeEmployeesCount,
              pct: activeEmployeesCount > 0 ? 100 : 0,
            },
            {
              label: "Qua",
              subLabel: "22/10",
              present: Math.max(0, activeEmployeesCount - 1),
              active: activeEmployeesCount,
              pct: Math.round(
                (Math.max(0, activeEmployeesCount - 1) / nActive) * 100,
              ),
            },
            {
              label: "Qui",
              subLabel: "23/10",
              present: activeEmployeesCount,
              active: activeEmployeesCount,
              pct: activeEmployeesCount > 0 ? 100 : 0,
            },
            {
              label: "Sex",
              subLabel: "24/10",
              present: Math.max(0, activeEmployeesCount - 1),
              active: activeEmployeesCount,
              pct: Math.round(
                (Math.max(0, activeEmployeesCount - 1) / nActive) * 100,
              ),
            },
            {
              label: "Hoje",
              subLabel: "26/10",
              present: presentEmployeesCount,
              active: activeEmployeesCount,
              pct: Math.round((presentEmployeesCount / nActive) * 100),
            },
          ]
        : [
            {
              label: "Sem. 1",
              subLabel: "01 a 05/10",
              present: activeEmployeesCount,
              active: activeEmployeesCount,
              pct: activeEmployeesCount > 0 ? 98 : 0,
            },
            {
              label: "Sem. 2",
              subLabel: "08 a 12/10",
              present: activeEmployeesCount,
              active: activeEmployeesCount,
              pct: activeEmployeesCount > 0 ? 96 : 0,
            },
            {
              label: "Sem. 3",
              subLabel: "15 a 19/10",
              present: Math.max(0, activeEmployeesCount - 1),
              active: activeEmployeesCount,
              pct: Math.round(
                (Math.max(0, activeEmployeesCount - 1) / nActive) * 100,
              ),
            },
            {
              label: "Sem. 4",
              subLabel: "20 a 26/10",
              present: presentEmployeesCount,
              active: activeEmployeesCount,
              pct: attendancePct,
            },
          ];

  // Regras simples e determinísticas de Interpretação dos Resultados (Seção 7)
  const discussionInsights: DashboardAnalytics["discussionInsights"] = [];

  if (activeEmployeesCount === 0) {
    discussionInsights.push({
      title: "Sem dados para o filtro atual",
      text: "Não há funcionários ativos correspondentes à combinação de filtros selecionada.",
      tone: "info",
    });
  } else {
    // 1. Frequência
    discussionInsights.push({
      title:
        attendancePct >= 90
          ? "Estabilidade na taxa de frequência"
          : "Atenção ao índice de presença",
      text:
        attendancePct >= 90
          ? `A frequência média manteve-se em ${attendancePct}% no período (${presentEmployeesCount} de ${activeEmployeesCount} colaboradores ativos sem faltas hoje), indicando regularidade operacional.`
          : `A frequência encontra-se em ${attendancePct}% (${presentEmployeesCount} de ${activeEmployeesCount} ativos presentes), exigindo acompanhamento das ausências registradas.`,
      tone: attendancePct >= 90 ? "ok" : "warn",
    });

    // 2. Modalidade predominante
    const topMod = [...modalityUsage].sort(
      (a, b) => b.punchCount - a.punchCount,
    )[0];
    if (topMod && totalPunchRecords > 0) {
      discussionInsights.push({
        title: `Predominância de ${topMod.label.split(" (")[0]}`,
        text: `O meio "${topMod.label.split(" (")[0]}" concentrou ${topMod.pct}% das marcações de jornada (${topMod.punchCount} de ${totalPunchRecords} registros). Foram separados ${totalAccessOnlyRecords} eventos exclusivos de acesso físico na catraca para não distorcer a folha.`,
        tone: "info",
      });
    }

    // 3. Ocorrências e pendências
    if (openOccs.length > 0) {
      const topOcc = [...occDistribution].sort((a, b) => b.count - a.count)[0];
      discussionInsights.push({
        title: `${openOccs.length} pendências aguardam deliberação do RH`,
        text: `Existem ${incompleteCount} registros incompletos e ${justificationsPendingCount} justificativas pendentes no escopo atual. A categoria "${topOcc.label}" representa ${topOcc.pct}% do total de ocorrências (${topOcc.count} de ${scopedOccs.length}).`,
        tone: incompleteCount > 0 ? "bad" : "warn",
      });
    } else {
      discussionInsights.push({
        title: "Ocorrências regularizadas",
        text: "Todas as ocorrências e justificativas do escopo selecionado já foram analisadas pelo RH.",
        tone: "ok",
      });
    }

    // 4. Horas trabalhadas
    discussionInsights.push({
      title: "Balanço de horas previstas vs. realizadas",
      text: `Foram registradas ${formatHours(totalWorkedHours)} de ${formatHours(totalExpectedHours)} previstas (média de ${formatHours(avgWorkedHoursPerEmp)} por colaborador ativo), com ${formatHours(totalOvertimeHours)} de horas extras e saldo líquido de ${formatHours(totalBalanceHours, true)}.`,
      tone: totalBalanceHours >= 0 ? "ok" : "warn",
    });
  }

  return {
    periodLabel: meta.label,
    periodRangeLabel: meta.range,
    activeEmployeesCount,
    presentEmployeesCount,
    inShiftCount,
    attendancePct,
    totalExpectedHours,
    totalWorkedHours,
    avgWorkedHoursPerEmp,
    totalOvertimeHours,
    totalBalanceHours,
    totalOccurrences: scopedOccs.length,
    openOccurrences: openOccs.length,
    incompleteCount,
    justificationsPendingCount,
    delaysAndAbsencesCount,
    homeOfficeRequestsCount,
    totalPunchRecords,
    totalAccessOnlyRecords,
    employeeRows,
    frequencySeries,
    occDistribution,
    modalityUsage,
    discussionInsights,
  };
}

export function exportReportToCsv(
  filename: string,
  headers: string[],
  rows: (string | number)[][],
) {
  const escapeCsv = (val: string | number) => {
    const s = String(val ?? "");
    if (s.includes(";") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const csvContent =
    "\uFEFF" +
    [
      headers.map(escapeCsv).join(";"),
      ...rows.map((r) => r.map(escapeCsv).join(";")),
    ].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export { formatDateBR, typeLabel };
