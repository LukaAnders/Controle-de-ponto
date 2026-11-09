import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useApp, roles, SELF } from "../../contexto/ContextoApp";
import { formatDateBR, TODAY } from "../../dados/dadosSimulados";
import { Page } from "../../tipos";

export interface AssistantResponse {
  intent: string;
  generalGuidance: string;
  userContextInfo: string;
  links: { label: string; page: Page; query?: Record<string, string> }[];
}

export interface ChatItem {
  id: string;
  question: string;
  response: AssistantResponse;
}

interface AssistantChatValue {
  history: ChatItem[];
  isLoading: boolean;
  sendMessage: (question: string) => Promise<void>;
  clearHistory: () => void;
}

const STORAGE_KEY = "pontonexo_assistant_history_v2";
const AssistantChatContext = createContext<AssistantChatValue | null>(null);

function readHistory(): ChatItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as ChatItem[]) : [];
  } catch {
    return [];
  }
}

export function AssistantChatProvider({ children }: { children: ReactNode }) {
  const { role, employees, occs, recs } = useApp();
  const [history, setHistory] = useState<ChatItem[]>(readHistory);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      // O histórico permanece disponível na sessão se o armazenamento estiver cheio.
    }
  }, [history]);

  const sendMessage = useCallback(
    async (question: string) => {
      const trimmed = question.trim();
      if (!trimmed || isLoading) return;
      setIsLoading(true);

      const self = employees.find((employee) => employee.id === SELF) || employees[0];
      const openOccs = occs.filter(
        (occ) => occ.status === "Pendente" || occ.status.startsWith("Em "),
      );
      const context = {
        perfilAtivo: roles[role].label,
        resumoPerfil: roles[role].shortLabel,
        usuarioLogado: roles[role].user,
        paginasPermitidas: roles[role].pages,
        totalFuncionariosVisiveis: employees.length,
        ocorrenciasTotaisVisiveis: occs.length,
        ocorrenciasAbertas: openOccs.length,
        registrosRecentesVisiveis: recs.length,
        funcionarioProprio: self
          ? {
              nome: self.name,
              matricula: self.reg,
              modalidade: self.mode,
              homeOfficeAutorizado:
                self.remote.allowed && self.remote.until >= TODAY,
              homeOfficeValidade: formatDateBR(self.remote.until),
            }
          : null,
      };

      let response: AssistantResponse | null = null;
      let errorNote = "";
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 30000);

      try {
        const apiResponse = await fetch("/api/assistente", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: trimmed, context }),
          signal: controller.signal,
        });

        const data = await apiResponse.json().catch(() => null);
        if (!apiResponse.ok) {
          errorNote = data?.error || `A API respondeu com status ${apiResponse.status}.`;
        } else if (data?.intent && data?.generalGuidance) {
          const allowedPages = roles[role].pages;
          const links = Array.isArray(data.links)
            ? data.links.filter(
                (link: { label?: string; page?: string }) =>
                  link &&
                  typeof link.label === "string" &&
                  typeof link.page === "string" &&
                  allowedPages.includes(link.page as Page),
              )
            : [];
          response = {
            intent: String(data.intent),
            generalGuidance: String(data.generalGuidance),
            userContextInfo: String(
              data.userContextInfo || `Resposta para o perfil ${roles[role].shortLabel}.`,
            ),
            links,
          };
        }
      } catch (error) {
        errorNote =
          error instanceof Error && error.name === "AbortError"
            ? "A consulta excedeu o tempo limite. Tente novamente."
            : "Não foi possível conectar ao assistente agora.";
      } finally {
        window.clearTimeout(timeoutId);
      }

      if (!response) {
        const topic = trimmed.toLocaleLowerCase("pt-BR");
        const hasHomeOffice = /home.?office|remot|autoriza/.test(topic);
        const hasJustification = /justific|aus[eê]ncia|atestado|atraso/.test(topic);
        const hasIncomplete = /incompleto|inconsist/.test(topic);
        const hasStatus = /status|andamento|minha justificativa/.test(topic);
        const guidance = hasHomeOffice
          ? "O registro pelo Ponto Digital fora da empresa exige autorização de Home Office ativa e dentro da validade, cadastrada pelo RH."
          : hasIncomplete
            ? "Um dia pode aparecer incompleto quando falta uma batida de entrada, saída ou retorno. Confira o histórico na Central de Ponto e, se necessário, abra uma ocorrência para o RH."
            : hasJustification
              ? "Acesse Ocorrências e justificativas, escolha Nova justificativa e informe a data, o horário e o motivo. A decisão fica com o RH ou gestor."
              : hasStatus
                ? `No seu perfil ha ${openOccs.length} ocorrencia(s) pendente(s) ou em analise. Consulte Ocorrencias e justificativas para ver os detalhes. O assistente nao altera o status.`
                : "Posso ajudar com registro de ponto, catraca, justificativas, ocorrências e regras de Home Office. Qual é a sua dúvida?";
        const fallback: AssistantResponse = {
          intent: hasHomeOffice
            ? "Regras de Home Office"
            : hasIncomplete
              ? "Registro incompleto"
              : hasJustification
                ? "Enviar uma justificativa"
                : hasStatus
                  ? "Status das ocorrências"
                  : "Como posso ajudar?",
          generalGuidance: guidance,
          userContextInfo: `${roles[role].shortLabel}${errorNote ? ` · ${errorNote}` : " · Orientação local"}`,
          links: [
            {
              label: hasJustification || hasStatus ? "Ver ocorrências" : "Abrir Central de Ponto",
              page: hasJustification || hasStatus ? "occurrences" : "punch",
            },
          ],
        };
        response = fallback;
      }

      setHistory((current) => [
        {
          id: `chat-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          question: trimmed,
          response: response!,
        },
        ...current,
      ]);
      setIsLoading(false);
    },
    [employees, isLoading, occs, recs, role],
  );

  const value = useMemo(
    () => ({
      history,
      isLoading,
      sendMessage,
      clearHistory: () => setHistory([]),
    }),
    [history, isLoading, sendMessage],
  );

  return (
    <AssistantChatContext.Provider value={value}>
      {children}
    </AssistantChatContext.Provider>
  );
}

export function useAssistantChat() {
  const value = useContext(AssistantChatContext);
  if (!value) {
    throw new Error("useAssistantChat precisa estar dentro de AssistantChatProvider.");
  }
  return value;
}
