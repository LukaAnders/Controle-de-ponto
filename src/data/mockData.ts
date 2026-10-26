import {
  Employee,
  Occ,
  OccType,
  Rec,
  RemoteWorkAuthorization,
} from "../types";

export const TODAY = "2026-10-26";

export const typeLabel: Record<OccType, string> = {
  incompleto: "Registro de ponto incompleto",
  justificativa: "Justificativa de jornada",
  homeoffice: "Autorização de home office",
};

export const depts = ["Tecnologia", "Financeiro", "Comercial", "Operações"];

const noRemote: RemoteWorkAuthorization = {
  allowed: false,
  until: "",
  by: "",
};

export const employees0: Employee[] = [
  {
    id: "e1",
    name: "Ana Souza",
    reg: "1001",
    dept: "Tecnologia",
    role: "Desenvolvedora Pleno",
    mode: "Híbrido",
    schedule: "08:00 às 17:00 (1h intervalo)",
    active: true,
    remote: { allowed: true, until: "2026-12-31", by: "Marina Costa (RH)" },
  },
  {
    id: "e2",
    name: "Bruno Lima",
    reg: "1002",
    dept: "Tecnologia",
    role: "Analista de QA",
    mode: "Remoto",
    schedule: "09:00 às 18:00 (1h intervalo)",
    active: true,
    remote: { allowed: false, until: "", by: "" },
  },
  {
    id: "e3",
    name: "Carla Mendes",
    reg: "1003",
    dept: "Financeiro",
    role: "Contadora Sênior",
    mode: "Presencial",
    schedule: "08:00 às 17:00 (1h intervalo)",
    active: true,
    remote: noRemote,
  },
  {
    id: "e4",
    name: "Diego Rocha",
    reg: "1004",
    dept: "Comercial",
    role: "Executivo de Contas",
    mode: "Híbrido",
    schedule: "08:30 às 17:30 (1h intervalo)",
    active: true,
    remote: noRemote,
  },
  {
    id: "e5",
    name: "Elisa Prado",
    reg: "1005",
    dept: "Operações",
    role: "Supervisora de Operações",
    mode: "Presencial",
    schedule: "07:30 às 16:30 (1h intervalo)",
    active: true,
    remote: noRemote,
  },
  {
    id: "e6",
    name: "Fábio Nunes",
    reg: "1006",
    dept: "Operações",
    role: "Auxiliar Logístico",
    mode: "Presencial",
    schedule: "08:00 às 17:00 (1h intervalo)",
    active: false,
    remote: noRemote,
  },
  {
    id: "e7",
    name: "Gabriela Alves",
    reg: "1007",
    dept: "Tecnologia",
    role: "Tech Lead",
    mode: "Remoto",
    schedule: "09:00 às 18:00 (1h intervalo)",
    active: true,
    remote: { allowed: true, until: "2026-10-20", by: "Marina Costa (RH)" },
  },
  {
    id: "e8",
    name: "Heitor Dias",
    reg: "1008",
    dept: "Financeiro",
    role: "Analista Financeiro",
    mode: "Híbrido",
    schedule: "08:00 às 17:00 (1h intervalo)",
    active: true,
    remote: { allowed: true, until: "2026-11-30", by: "Marina Costa (RH)" },
  },
];

export const occurrences0: Occ[] = [
  {
    id: "o1",
    empId: "e1",
    type: "incompleto",
    date: "2026-10-25",
    relatedTime: "17:00 (Saída ausente)",
    requestedAt: "25/10/2026 19:12",
    summary: "Saída de expediente não registrada",
    justification:
      "Encerrei as atividades às 17h05 em regime híbrido, mas fechei o navegador antes de confirmar o ponto digital.",
    involvedRecords: [
      "08:01 — Entrada (Ponto digital)",
      "12:00 — Início de intervalo (Ponto digital)",
      "13:02 — Retorno de intervalo (Ponto digital)",
      "— : — — Saída não localizada",
    ],
    notes: "Colaboradora possui autorização de home office ativa até 31/12/2026.",
    status: "Pendente",
    priority: "Alta",
    aiAnalysis: {
      problemSummary:
        "Jornada do dia 25/10 possui 3 marcações válidas, restando a marcação de encerramento às 17:00.",
      toVerify:
        "Confirmar se houve atividade registrada no ambiente de trabalho até as 17h05 e validar com a liderança imediata.",
      nextSteps:
        "Avaliar a justificativa enviada pela funcionária ou encaminhar ao gestor de Tecnologia para ciência.",
      missingData:
        "Confirmação simples do gestor do setor ou log de encerramento da sessão.",
    },
    history: [
      {
        action: "Inconsistência detectada automaticamente no fechamento diário",
        by: "Sistema PontoNexo",
        at: "25/10/2026 18:30",
      },
      {
        action: "Justificativa complementar enviada pela colaboradora",
        by: "Ana Souza (fictício)",
        at: "25/10/2026 19:12",
      },
    ],
  },
  {
    id: "o2",
    empId: "e3",
    type: "incompleto",
    date: "2026-10-24",
    relatedTime: "17:00 (Apenas giro de catraca)",
    requestedAt: "24/10/2026 18:40",
    summary: "Evento de acesso na saída sem registro de ponto",
    justification:
      "Ao sair do prédio selecionei por engano 'Apenas entrada/saída' no terminal da catraca biométrica em vez de 'Registrar ponto'.",
    involvedRecords: [
      "07:58 — Entrada (Catraca — Registro de ponto)",
      "12:04 — Saída almoço (Catraca — Registro de ponto)",
      "13:01 — Retorno almoço (Catraca — Registro de ponto)",
      "17:03 — Saída física (Catraca — Evento de acesso apenas)",
    ],
    notes:
      "Há evento de acesso físico registrado às 17:03, demonstrando a distinção entre acesso predial e ponto.",
    status: "Pendente",
    priority: "Média",
    aiAnalysis: {
      problemSummary:
        "A colaboradora registrou saída física na catraca às 17:03, mas não gerou evento de jornada.",
      toVerify:
        "Conferir o log de acesso físico das 17:03 e validar a solicitação de inclusão de marcação.",
      nextSteps:
        "Aprovar justificativa caso o evento de acesso seja aceito como referência pelo RH.",
      missingData: "Nenhum documento adicional pendente.",
    },
    history: [
      {
        action: "Divergência entre acesso físico e registro de jornada identificada",
        by: "Sistema PontoNexo",
        at: "24/10/2026 18:00",
      },
    ],
  },
  {
    id: "o3",
    empId: "e4",
    type: "incompleto",
    date: "2026-10-23",
    relatedTime: "08:30 / 08:32 (Marcação em duplicidade)",
    requestedAt: "23/10/2026 10:15",
    summary: "Registro duplicado na entrada e ausência de pausa",
    justification:
      "Passei duas vezes pelo leitor biométrico pois achei que a primeira leitura não havia sido confirmada.",
    involvedRecords: [
      "08:30 — Entrada (Catraca — Registro de ponto)",
      "08:32 — Entrada duplicada (Catraca — Registro de ponto)",
      "17:35 — Saída (Catraca — Registro de ponto)",
    ],
    notes: "Em verificação com a supervisão comercial sobre o horário de intervalo.",
    status: "Em análise",
    priority: "Baixa",
    aiAnalysis: {
      problemSummary:
        "Duas batidas consecutivas no início do turno (intervalo de 2 minutos) trataram a segunda marcação como saída de intervalo.",
      toVerify:
        "Confirmar o horário real em que o colaborador realizou o intervalo intrajornada.",
      nextSteps:
        "Solicitar ao colaborador a indicação do horário de almoço para ajuste demonstrativo.",
      missingData: "Horário de início e término do intervalo de almoço.",
    },
    history: [
      {
        action: "Ocorrência registrada no painel operacional",
        by: "Sistema PontoNexo",
        at: "23/10/2026 18:05",
      },
    ],
  },
  {
    id: "o4",
    empId: "e5",
    type: "incompleto",
    date: "2026-10-25",
    relatedTime: "12:00 - 13:00 (Intervalo não registrado)",
    requestedAt: "25/10/2026 17:10",
    summary: "Sem registro de retorno do intervalo de almoço",
    justification:
      "Houve fila no relógio convencional do setor operacional no retorno às 13h e segui direto para a linha de supervisão.",
    involvedRecords: [
      "07:29 — Entrada (Relógio convencional)",
      "12:01 — Saída almoço (Relógio convencional)",
      "— : — — Retorno de almoço ausente",
      "16:33 — Saída (Relógio convencional)",
    ],
    notes: "Setor de Operações utiliza prioritariamente o relógio convencional.",
    status: "Pendente",
    priority: "Média",
    aiAnalysis: {
      problemSummary:
        "Falta a terceira marcação obrigatória da jornada (retorno de intervalo) no dia 25/10.",
      toVerify:
        "Verificar se a pausa de 1 hora foi integralmente cumprida das 12:01 às 13:01.",
      nextSteps:
        "Revisar justificativa junto à gerência de Operações antes da aprovação pelo RH.",
      missingData: "Confirmação do cumprimento integral do intervalo.",
    },
    history: [
      {
        action: "Ocorrência registrada por marcações ímpares",
        by: "Sistema PontoNexo",
        at: "25/10/2026 17:10",
      },
    ],
  },
  {
    id: "o5",
    empId: "e2",
    type: "justificativa",
    date: "2026-10-26",
    relatedTime: "09:00 às 11:30",
    requestedAt: "26/10/2026 11:45",
    summary: "Ausência parcial para consulta médica (declaração informada)",
    justification:
      "Comparecimento a exame oftalmológico agendado no período da manhã. Retornei às atividades às 11h30.",
    involvedRecords: ["11:31 — Entrada tardia (Ponto digital na empresa)"],
    notes: "Código de declaração de comparecimento demonstrativo informado no protocolo.",
    status: "Pendente",
    priority: "Alta",
    aiAnalysis: {
      problemSummary:
        "Entrada registrada 2h31min após o horário contratual (09:00) com justificativa de saúde.",
      toVerify:
        "Conferir dados da declaração de comparecimento (horário de atendimento das 09:00 às 11:00).",
      nextSteps:
        "Validar comprovante administrativo e abonar o período correspondente se estiver de acordo com a política interna.",
      missingData: "Arquivo digitalizado da declaração de horas (simulado).",
    },
    history: [
      {
        action: "Solicitação de abono enviada pelo colaborador",
        by: "Bruno Lima (fictício)",
        at: "26/10/2026 11:45",
      },
    ],
  },
  {
    id: "o6",
    empId: "e3",
    type: "justificativa",
    date: "2026-10-22",
    relatedTime: "08:00 às 08:42 (42 min de atraso)",
    requestedAt: "22/10/2026 09:05",
    summary: "Atraso na entrada por paralisação no transporte público",
    justification:
      "Interdição temporária na linha de metrô gerou atraso de 42 minutos no deslocamento até o escritório.",
    involvedRecords: [
      "08:42 — Entrada (Catraca — Registro de ponto)",
      "17:45 — Saída com compensação (Catraca — Registro de ponto)",
    ],
    notes: "Colaboradora permaneceu 45 minutos após o expediente no mesmo dia.",
    status: "Pendente",
    priority: "Baixa",
    aiAnalysis: {
      problemSummary:
        "Atraso de 42 minutos na entrada, porém com permanência adicional de 45 minutos ao final do turno.",
      toVerify:
        "Verificar se a política do setor Financeiro permite compensação no mesmo dia.",
      nextSteps: "Aprovar justificativa para compensação de saldo diário.",
      missingData: "Nenhuma pendência documental.",
    },
    history: [
      {
        action: "Justificativa cadastrada pela colaboradora",
        by: "Carla Mendes (fictício)",
        at: "22/10/2026 09:05",
      },
    ],
  },
  {
    id: "o7",
    empId: "e4",
    type: "justificativa",
    date: "2026-10-24",
    relatedTime: "14:00 às 17:30 (Atividade externa)",
    requestedAt: "24/10/2026 18:10",
    summary: "Reunião presencial em cliente externo",
    justification:
      "Saí para apresentação comercial em cliente corporativo após o almoço e encerrei o expediente diretamente do local.",
    involvedRecords: [
      "08:28 — Entrada (Catraca — Registro de ponto)",
      "12:15 — Saída (Catraca — Registro de ponto)",
    ],
    notes: "Agenda comercial registrada no CRM demonstrativo.",
    status: "Em análise",
    priority: "Média",
    aiAnalysis: {
      problemSummary:
        "Tarde sem marcações presenciais devido a visita comercial externa informada pelo executivo de contas.",
      toVerify: "Validar confirmação da visita com a diretoria comercial.",
      nextSteps: "Aguardar validação do gestor ou aprovar atividade externa.",
      missingData: "Relatório resumido da visita comercial.",
    },
    history: [
      {
        action: "Justificativa registrada",
        by: "Diego Rocha (fictício)",
        at: "24/10/2026 18:10",
      },
      {
        action: "Status alterado para Em análise",
        by: "Marina Costa (RH)",
        at: "25/10/2026 09:20",
      },
    ],
  },
  {
    id: "o8",
    empId: "e8",
    type: "justificativa",
    date: "2026-10-23",
    relatedTime: "08:00 às 10:15",
    requestedAt: "23/10/2026 10:30",
    summary: "Entrada tardia por imprevisto domiciliar",
    justification:
      "Necessidade de aguardar manutenção emergencial de fornecimento de água antes de iniciar o expediente.",
    involvedRecords: [
      "10:15 — Entrada (Ponto digital)",
      "18:30 — Saída (Ponto digital)",
    ],
    notes: "Colaborador propôs compensação das horas restantes ao longo da semana.",
    status: "Pendente",
    priority: "Média",
    aiAnalysis: {
      problemSummary:
        "Início de jornada 2h15min após o horário previsto, com compensação parcial no final do dia.",
      toVerify: "Avaliar acordo de banco de horas do setor Financeiro.",
      nextSteps:
        "Definir com o gestor se o período será compensado ou descontado.",
      missingData: "Parecer do gestor imediato.",
    },
    history: [
      {
        action: "Justificativa enviada pelo colaborador",
        by: "Heitor Dias (fictício)",
        at: "23/10/2026 10:30",
      },
    ],
  },
  {
    id: "o9",
    empId: "e5",
    type: "justificativa",
    date: "2026-10-21",
    relatedTime: "07:30 (Esquecimento de batida)",
    requestedAt: "21/10/2026 12:15",
    summary: "Esquecimento de registro na entrada do turno",
    justification:
      "Cheguei no horário habitual (07:30) para abertura do turno, mas percebi apenas no horário de almoço que não havia passado no relógio convencional.",
    involvedRecords: [
      "07:26 — Entrada física na portaria (Catraca — Evento de acesso)",
      "12:02 — Saída almoço (Relógio convencional)",
      "13:00 — Retorno almoço (Relógio convencional)",
      "16:31 — Saída (Relógio convencional)",
    ],
    notes: "Evento de acesso na portaria confirma chegada às 07:26.",
    status: "Pendente",
    priority: "Baixa",
    aiAnalysis: {
      problemSummary:
        "Ausência da primeira batida de ponto, mas com evento de acesso físico na catraca às 07:26.",
      toVerify:
        "Cruzar o registro de acesso físico das 07:26 com a escala de trabalho (07:30).",
      nextSteps: "Aprovar inclusão manual demonstrativa da entrada às 07:30.",
      missingData: "Nenhuma informação pendente.",
    },
    history: [
      {
        action: "Solicitação de ajuste enviada",
        by: "Elisa Prado (fictício)",
        at: "21/10/2026 12:15",
      },
    ],
  },
  {
    id: "o10",
    empId: "e2",
    type: "homeoffice",
    date: "2026-10-26",
    relatedTime: "Período integral (09:00 às 18:00)",
    requestedAt: "26/10/2026 08:15",
    summary: "Solicitação de liberação de registro de ponto em home office",
    justification:
      "Fui alocado em regime remoto na squad de QA, mas minha permissão de ponto digital fora da empresa ainda consta como inativa na Central de Ponto.",
    involvedRecords: [
      "08:12 — Tentativa bloqueada (Ponto digital — Home office sem permissão)",
    ],
    notes:
      "Ao aprovar esta solicitação, o sistema habilita automaticamente a permissão remota de Bruno Lima na Central de Ponto.",
    status: "Pendente",
    priority: "Alta",
    aiAnalysis: {
      problemSummary:
        "O colaborador está cadastrado na modalidade Remoto, porém sem regra de autorização ativa para registro digital externo.",
      toVerify:
        "Confirmar com o gestor de Tecnologia (Paulo Ramos) a vigência da alocação remota.",
      nextSteps:
        "Aprovar a autorização para liberar imediatamente a simulação de ponto em home office para Bruno Lima.",
      missingData: "Definição da data limite da autorização (padrão: 31/12/2026).",
    },
    history: [
      {
        action: "Tentativa de ponto remoto bloqueada pela regra de permissão",
        by: "Sistema PontoNexo",
        at: "26/10/2026 08:12",
      },
      {
        action: "Solicitação de autorização aberta pelo colaborador",
        by: "Bruno Lima (fictício)",
        at: "26/10/2026 08:15",
      },
    ],
  },
  {
    id: "o11",
    empId: "e7",
    type: "homeoffice",
    date: "2026-10-26",
    relatedTime: "Período integral (09:00 às 18:00)",
    requestedAt: "25/10/2026 16:40",
    summary: "Renovação de autorização de home office vencida em 20/10/2026",
    justification:
      "Minha autorização anterior de trabalho remoto expirou em 20/10/2026. Solicito renovação até o encerramento do trimestre.",
    involvedRecords: [
      "Autorização anterior: válida até 20/10/2026 (Responsável: Marina Costa)",
    ],
    notes:
      "Enquanto não renovada, a Central de Ponto bloqueia novos registros em modo Home Office para Gabriela Alves.",
    status: "Pendente",
    priority: "Alta",
    aiAnalysis: {
      problemSummary:
        "Autorização remota vencida há 6 dias impede o registro de ponto digital fora das dependências da empresa.",
      toVerify:
        "Verificar manutenção do regime Remoto para o cargo de Tech Lead.",
      nextSteps:
        "Aprovar renovação para estender a validade até 31/12/2026 e desbloquear o registro remoto.",
      missingData: "Nenhum dado adicional necessário.",
    },
    history: [
      {
        action: "Alerta de vencimento de autorização remota",
        by: "Sistema PontoNexo",
        at: "21/10/2026 08:00",
      },
      {
        action: "Pedido de renovação enviado",
        by: "Gabriela Alves (fictício)",
        at: "25/10/2026 16:40",
      },
    ],
  },
  {
    id: "o12",
    empId: "e4",
    type: "homeoffice",
    date: "2026-10-30",
    relatedTime: "Sextas-feiras (08:30 às 17:30)",
    requestedAt: "24/10/2026 14:20",
    summary: "Solicitação de autorização híbrida para trabalho remoto às sextas",
    justification:
      "Solicito permissão para registrar ponto digital em home office nas sextas-feiras destinadas a elaboração de propostas comerciais.",
    involvedRecords: ["Modalidade atual do cadastro: Híbrido (sem permissão ativa)"],
    notes: "Aguardando alinhamento da escala híbrida do setor Comercial.",
    status: "Em análise",
    priority: "Média",
    aiAnalysis: {
      problemSummary:
        "Colaborador em regime Híbrido solicita habilitação de ponto digital remoto para dias específicos da escala.",
      toVerify: "Conferir escala presencial mínima do time Comercial.",
      nextSteps:
        "Aprovar liberação remota ou solicitar detalhamento dos dias acordados.",
      missingData: "Aprovação formal da supervisão comercial.",
    },
    history: [
      {
        action: "Solicitação de home office cadastrada",
        by: "Diego Rocha (fictício)",
        at: "24/10/2026 14:20",
      },
    ],
  },
  {
    id: "o13",
    empId: "e1",
    type: "justificativa",
    date: "2026-10-19",
    relatedTime: "08:00 às 08:25",
    requestedAt: "19/10/2026 08:50",
    summary: "Atraso pontual devido a bloqueio viário",
    justification:
      "Obra emergencial na avenida principal atrasou a chegada ao escritório em 25 minutos, compensados no final do expediente.",
    involvedRecords: [
      "08:25 — Entrada (Catraca — Registro de ponto)",
      "17:28 — Saída (Catraca — Registro de ponto)",
    ],
    notes: "Compensação realizada no mesmo dia.",
    status: "Aprovada",
    priority: "Baixa",
    aiAnalysis: {
      problemSummary:
        "Variação de 25 minutos já compensada na saída do mesmo dia.",
      toVerify: "Horas totais trabalhadas no dia (8h03min).",
      nextSteps: "Nenhuma ação pendente — ocorrência já concluída.",
      missingData: "Nenhum.",
    },
    history: [
      {
        action: "Ocorrência registrada",
        by: "Ana Souza (fictício)",
        at: "19/10/2026 08:50",
      },
      {
        action: "Aprovar justificativa",
        by: "Marina Costa (RH)",
        at: "19/10/2026 14:10",
        note: "Compensação verificada nos registros do dia.",
      },
    ],
  },
];

export const records0: Rec[] = [
  {
    id: "r1",
    empId: "e1",
    modality: "Digital",
    kind: "Registro de ponto",
    detail: "Entrada de jornada (Home office autorizado)",
    time: "26/10/2026 08:02",
    status: "Registrado",
  },
  {
    id: "r2",
    empId: "e3",
    modality: "Catraca",
    kind: "Registro de ponto",
    detail: "Entrada de jornada no terminal T-01",
    time: "26/10/2026 08:10",
    status: "Ponto validado",
  },
  {
    id: "r3",
    empId: "e3",
    modality: "Catraca",
    kind: "Evento de acesso",
    detail: "Giro de entrada física na recepção",
    time: "26/10/2026 08:10",
    status: "Acesso físico",
  },
  {
    id: "r4",
    empId: "e5",
    modality: "Convencional",
    kind: "Registro de ponto",
    detail: "Marcação por matrícula 1005 (REP-02)",
    time: "26/10/2026 07:31",
    status: "Registrado",
  },
  {
    id: "r5",
    empId: "e8",
    modality: "Digital",
    kind: "Registro de ponto",
    detail: "Entrada de jornada (Home office autorizado)",
    time: "26/10/2026 08:05",
    status: "Registrado",
  },
  {
    id: "r6",
    empId: "e4",
    modality: "Catraca",
    kind: "Evento de acesso",
    detail: "Apenas circulação interna (sem gerar ponto)",
    time: "26/10/2026 09:15",
    status: "Acesso físico",
  },
];

export const base = {
  present: 104,
  active: 120,
  inShift: 98,
  mix: [
    ["Ponto digital", 52, "Registros via web/app com verificação simulada"],
    ["Catraca biométrica", 34, "Registros conjugados aos terminais de portaria"],
    [
      "Relógio convencional",
      14,
      "Marcações em equipamento tradicional por matrícula",
    ],
  ] as [string, number, string][],
};

export const formatDateBR = (isoDate: string) => {
  if (!isoDate) return "—";
  const parts = isoDate.split("-");
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : isoDate;
};

export const now = () => {
  const d = new Date();
  return `26/10/2026 ${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes(),
  ).padStart(2, "0")}`;
};
