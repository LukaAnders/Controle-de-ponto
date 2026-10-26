import { useState } from "react";
import { useApp, roles, SELF } from "../../context/AppContext";
import { formatDateBR, TODAY } from "../../data/mockData";
import AssistantFaqSidebar from "./components/AssistantFaqSidebar";
import AssistantChatPanel, {
  AssistantResponse,
  ChatItem,
} from "./components/AssistantChatPanel";
import "./Assistant.css";

export default function Assistant() {
  const { go, role, employees, occs, recs } = useApp();
  const [history, setHistory] = useState<ChatItem[]>([]);

  const selfEmp = employees.find((e) => e.id === SELF) || employees[0];
  const openOccs = occs.filter(
    (o) => o.status === "Pendente" || o.status === "Em análise",
  );

  const buildResponse = (q: string): AssistantResponse => {
    const text = q.toLowerCase();

    if (
      text.includes("status") ||
      text.includes("minha justificativa") ||
      text.includes("andamento")
    ) {
      const userOccs = occs;
      const summaryText =
        role === "funcionario"
          ? `Para o seu perfil (${selfEmp?.name}), constam ${userOccs.length} ocorrências registradas, sendo ${openOccs.length} aguardando deliberação do RH.`
          : `No seu escopo atual (${roles[role].shortLabel}), existem ${openOccs.length} solicitações abertas aguardando análise de um total de ${userOccs.length} registros.`;

      return {
        intent: "Consulta de status de justificativas e solicitações",
        generalGuidance:
          "Toda justificativa passa pelos estados: Pendente, Em análise, Encaminhada para revisão, Aprovada ou Rejeitada. O assistente não altera estados nem aprova solicitações; a deliberação é exclusiva do RH e gestores.",
        userContextInfo: summaryText,
        links: [
          {
            label: "Consultar Ocorrências e Justificativas",
            page: "occurrences",
          },
        ],
      };
    }

    if (
      text.includes("justific") ||
      text.includes("ausência") ||
      text.includes("ausencia") ||
      text.includes("atestado") ||
      text.includes("atraso")
    ) {
      return {
        intent: "Procedimento para envio e análise de justificativas",
        generalGuidance:
          "Para justificar uma ausência, atraso ou esquecimento de marcação, acesse a página 'Ocorrências e justificativas' e utilize o botão '+ Nova justificativa / solicitação', informando a data, o horário relacionado e o motivo detalhado.",
        userContextInfo:
          role === "funcionario"
            ? `Você possui acesso apenas às suas próprias solicitações (${selfEmp?.name}). A decisão final ficará registrada no histórico com data, hora e responsável do RH.`
            : `Como ${roles[role].shortLabel}, você pode revisar as justificativas da equipe, solicitar informações adicionais ou aprovar/rejeitar casos pendentes (${openOccs.length} abertos).`,
        links: [
          {
            label: "Abrir Ocorrências e Justificativas",
            page: "occurrences",
          },
        ],
      };
    }

    if (text.includes("incompleto") || text.includes("inconsist")) {
      const incCount = openOccs.filter((o) => o.type === "incompleto").length;
      return {
        intent: "Explicação sobre registros de ponto incompletos",
        generalGuidance:
          "Um registro aparece como incompleto quando há número ímpar de marcações no dia (por exemplo, entrada sem saída ou saída para almoço sem retorno) ou quando o colaborador seleciona 'Apenas entrada/saída' na catraca física em vez de 'Registrar ponto'.",
        userContextInfo:
          role === "funcionario"
            ? `Você possui ${incCount} ocorrência(s) de registro incompleto pendente(s) no seu histórico demonstrativo.`
            : `Há atualmente ${incCount} ocorrência(s) de registros incompletos pendentes de análise no seu escopo de visualização.`,
        links: [
          {
            label: "Ver registros incompletos",
            page: "occurrences",
            query: { type: "incompleto", open: "1" },
          },
          { label: "Ir para Central de Ponto", page: "punch" },
        ],
      };
    }

    if (
      text.includes("home") ||
      text.includes("remoto") ||
      text.includes("autoriza")
    ) {
      const remoteLinks: AssistantResponse["links"] = [
        { label: "Simular na Central de Ponto", page: "punch" },
        {
          label: "Ver solicitações de Home Office",
          page: "occurrences",
          query: { type: "homeoffice" },
        },
      ];
      if (role !== "funcionario") {
        remoteLinks.push({
          label: "Gerenciar permissões em Funcionários",
          page: "employees",
        });
      }

      const empRemoteStatus =
        selfEmp && selfEmp.remote.allowed && selfEmp.remote.until >= TODAY
          ? `Sua permissão remota (${selfEmp.name}) está ATIVA até ${formatDateBR(selfEmp.remote.until)}, autorizada por ${selfEmp.remote.by}.`
          : `Sua permissão remota encontra-se inativa ou expirada.`;

      return {
        intent: "Regras de autorização para Ponto Digital em Home Office",
        generalGuidance:
          "O registro pelo Ponto Digital fora das dependências da empresa exige uma regra de autorização ativa cadastrada pelo RH, contendo data de validade e responsável. Caso não exista permissão válida, a Central de Ponto bloqueia a marcação remota.",
        userContextInfo:
          role === "funcionario"
            ? empRemoteStatus
            : `No seu escopo (${roles[role].shortLabel}), você pode inspecionar quais colaboradores possuem autorização válida ou vencida na tela de Funcionários (acesso vedado ao perfil Funcionário comum).`,
        links: remoteLinks,
      };
    }

    if (
      text.includes("histórico") ||
      text.includes("historico") ||
      text.includes("jornada") ||
      text.includes("consultar")
    ) {
      return {
        intent: "Consulta de histórico de registros e acessos",
        generalGuidance:
          "O histórico recente diferencia explicitamente os 'Registros de ponto' (que compõem a jornada de trabalho) dos 'Eventos de acesso' (passagens físicas pela catraca que não contabilizam jornada).",
        userContextInfo: `Existem ${recs.length} eventos demonstrativos visíveis para o seu perfil atual (${roles[role].shortLabel}). Não são exibidos dados de outros setores ou colaboradores fora da sua permissão.`,
        links: [
          { label: "Consultar histórico na Central de Ponto", page: "punch" },
        ],
      };
    }

    if (
      text.includes("registro") ||
      text.includes("registrar") ||
      text.includes("ponto") ||
      text.includes("catraca") ||
      text.includes("relógio") ||
      text.includes("relogio")
    ) {
      return {
        intent: "Orientação sobre modalidades de registro de ponto",
        generalGuidance:
          "O PontoNexo centraliza três modalidades simuladas: (1) Ponto Digital com verificação facial demonstrativa e validação de regra de home office; (2) Catraca Biométrica com distinção entre 'Registrar ponto' e 'Apenas entrada/saída'; e (3) Relógio Convencional por código de matrícula.",
        userContextInfo:
          role === "funcionario"
            ? `No perfil Funcionário, a Central de Ponto realiza simulações vinculadas exclusivamente à sua matrícula (${selfEmp?.reg} — ${selfEmp?.name}).`
            : `No perfil ${roles[role].shortLabel}, você pode alternar entre os funcionários do seu escopo para testar cenários autorizados e bloqueados.`,
        links: [{ label: "Abrir Central de Ponto", page: "punch" }],
      };
    }

    return {
      intent: "Dúvida geral / Assunto fora da base demonstrativa",
      generalGuidance:
        "Não encontrei uma orientação específica para essa pergunta na base local demonstrativa. Posso orientar sobre registro de ponto (digital, catraca e convencional), justificativas de ausência, registros incompletos, regras de home office e consulta de histórico.",
      userContextInfo:
        "Importante: Este assistente opera localmente sem conexão com APIs externas e não substitui o RH nem toma decisões trabalhistas.",
      links: [
        { label: "Ir para Central de Ponto", page: "punch" },
        { label: "Ver Ocorrências e Justificativas", page: "occurrences" },
      ],
    };
  };

  const handleSend = (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed) return;
    const resp = buildResponse(trimmed);
    setHistory((prev) => [
      ...prev,
      {
        id: "m" + Date.now() + Math.random(),
        question: trimmed,
        response: resp,
      },
    ]);
  };

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <h1>Assistente Operacional PontoNexo (IA)</h1>
          <p className="sub">
            Apoio informativo para dúvidas sobre modalidades de ponto,
            inconsistências e justificativas. Demonstração local sem envio de
            dados para APIs externas.
          </p>
        </div>
        <span className="badge info">
          Escopo ativo: {roles[role].shortLabel}
        </span>
      </div>

      <div className="assistant-layout">
        <AssistantFaqSidebar onSelectQuestion={handleSend} />

        <AssistantChatPanel
          role={role}
          history={history}
          onSend={handleSend}
          onClear={() => setHistory([])}
          go={go}
        />
      </div>
    </div>
  );
}

