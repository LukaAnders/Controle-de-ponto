import {
  Occ,
  OccStatus,
  OccurrenceResponsibility,
  Role,
  ResponsibilityStage,
} from "../../tipos";

/**
 * A responsabilidade é mantida separada do status da ocorrência.
 * "supervisao-administrativa" descreve uma capacidade futura de supervisão;
 * não é um novo perfil existente no sistema.
 */
export type { ResponsibilityStage } from "../../tipos";

export type OccurrenceAction =
  | "aprovar"
  | "rejeitar"
  | "solicitar-informacoes"
  | "encaminhar-para-revisao";

export type OccurrencePermission =
  | "criar"
  | "visualizar-propria"
  | "responder-informacoes"
  | "visualizar-escopo"
  | "visualizar-global"
  | "analisar"
  | "aprovar"
  | "rejeitar"
  | "solicitar-informacoes"
  | "encaminhar-para-revisao"
  | "supervisionar";

export interface WorkflowState {
  status: OccStatus;
  responsible: ResponsibilityStage;
}

export interface WorkflowTransition {
  status: OccStatus;
  responsible: ResponsibilityStage;
}

const permissionsByRole: Record<Role, readonly OccurrencePermission[]> = {
  funcionario: ["criar", "visualizar-propria", "responder-informacoes"],
  gestor: [
    "visualizar-escopo",
    "analisar",
    "aprovar",
    "rejeitar",
    "solicitar-informacoes",
    "encaminhar-para-revisao",
  ],
  rh: [
    "visualizar-global",
    "analisar",
    "aprovar",
    "rejeitar",
    "solicitar-informacoes",
    "encaminhar-para-revisao",
  ],
};

/** Permissões previstas para uma futura camada de supervisão administrativa. */
export const administrativeOversightPermissions: readonly OccurrencePermission[] = [
  "visualizar-global",
  "analisar",
  "aprovar",
  "rejeitar",
  "solicitar-informacoes",
  "encaminhar-para-revisao",
  "supervisionar",
];

export function permissionsForRole(role: Role): readonly OccurrencePermission[] {
  return permissionsByRole[role];
}

export function roleHasPermission(
  role: Role,
  permission: OccurrencePermission,
): boolean {
  return permissionsForRole(role).includes(permission);
}

export function isTerminalStatus(status: OccStatus): boolean {
  return status === "Aprovada" || status === "Rejeitada";
}

/**
 * Adapta os dados atuais, que só armazenam status, para o workflow futuro.
 * A regra não altera o objeto Occ nem persiste a etapa.
 */
export function workflowStateFromStatus(status: OccStatus): WorkflowState {
  return {
    status,
    responsible:
      status === "Encaminhada para revisão" || isTerminalStatus(status)
        ? "rh"
        : "gestor",
  };
}

export function initialResponsibility(): ResponsibilityStage {
  return "gestor";
}

const responsibilityStages: readonly ResponsibilityStage[] = [
  "colaborador",
  "gestor",
  "rh",
  "supervisao-administrativa",
];

function isResponsibilityStage(value: unknown): value is ResponsibilityStage {
  return (
    typeof value === "string" &&
    responsibilityStages.includes(value as ResponsibilityStage)
  );
}

function isValidResponsibility(
  value: unknown,
): value is OccurrenceResponsibility {
  if (!value || typeof value !== "object") return false;

  const responsibility = value as Partial<OccurrenceResponsibility>;
  return (
    isResponsibilityStage(responsibility.current) &&
    (responsibility.next === undefined ||
      isResponsibilityStage(responsibility.next))
  );
}

function fallbackResponsibility(
  status: OccStatus,
): OccurrenceResponsibility | undefined {
  switch (status) {
    case "Pendente":
      return { current: "gestor", next: "rh" };
    case "Em análise":
      return { current: "gestor" };
    case "Encaminhada para revisão":
      return { current: "rh" };
    case "Aprovada":
    case "Rejeitada":
      return undefined;
  }
}

/**
 * ObtÃ©m a responsabilidade efetiva sem alterar ou persistir a ocorrÃªncia.
 * Dados antigos usam um fallback explÃ­cito baseado apenas no status.
 */
export function effectiveResponsibility(
  occurrence: Occ,
): OccurrenceResponsibility | undefined {
  if (isTerminalStatus(occurrence.status)) return undefined;
  if (isValidResponsibility(occurrence.responsibility)) {
    return occurrence.responsibility;
  }
  return fallbackResponsibility(occurrence.status);
}

function actionPermission(action: OccurrenceAction): OccurrencePermission {
  return action;
}

function canActAtStage(
  role: Role,
  stage: ResponsibilityStage,
  action: OccurrenceAction,
): boolean {
  if (!roleHasPermission(role, actionPermission(action))) return false;
  if (role === "funcionario") return false;

  if (action === "encaminhar-para-revisao") {
    return stage === "gestor" || stage === "rh";
  }

  if (action === "solicitar-informacoes") {
    return stage === "gestor" || stage === "rh";
  }

  return stage === "gestor" || stage === "rh";
}

export function canPerformAction(
  role: Role,
  state: WorkflowState,
  action: OccurrenceAction,
): boolean {
  if (isTerminalStatus(state.status)) return false;
  return canActAtStage(role, state.responsible, action);
}

/**
 * Calcula somente a próxima transição. Não verifica usuário, storage ou API;
 * combine esta função com canPerformAction antes de aplicá-la.
 */
export function transitionForAction(
  state: WorkflowState,
  action: OccurrenceAction,
): WorkflowTransition | null {
  if (isTerminalStatus(state.status)) return null;

  switch (action) {
    case "aprovar":
      return { status: "Aprovada", responsible: state.responsible };
    case "rejeitar":
      return { status: "Rejeitada", responsible: state.responsible };
    case "solicitar-informacoes":
      return { status: "Em análise", responsible: "colaborador" };
    case "encaminhar-para-revisao":
      if (state.responsible === "gestor") {
        return { status: "Encaminhada para revisão", responsible: "rh" };
      }
      if (state.responsible === "rh") {
        return {
          status: "Encaminhada para revisão",
          responsible: "supervisao-administrativa",
        };
      }
      return null;
  }
}
