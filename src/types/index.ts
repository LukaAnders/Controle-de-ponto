export type Mode = "Presencial" | "Híbrido" | "Remoto";

export interface RemoteWorkAuthorization {
  allowed: boolean;
  until: string;
  by: string;
}

export interface Employee {
  id: string;
  name: string;
  reg: string;
  dept: string;
  role: string;
  mode: Mode;
  schedule: string;
  active: boolean;
  remote: RemoteWorkAuthorization;
}

export interface Rec {
  id: string;
  empId: string;
  modality: "Digital" | "Catraca" | "Convencional";
  kind: "Registro de ponto" | "Evento de acesso";
  detail?: string;
  time: string;
  status: string;
}

export type OccType = "incompleto" | "justificativa" | "homeoffice";

export type OccStatus =
  | "Pendente"
  | "Em análise"
  | "Aprovada"
  | "Rejeitada"
  | "Encaminhada para revisão";

export type Priority = "Alta" | "Média" | "Baixa";

export interface AuditEntry {
  action: string;
  by: string;
  at: string;
  note?: string;
}

export interface Occ {
  id: string;
  empId: string;
  type: OccType;
  date: string;
  relatedTime: string;
  requestedAt: string;
  summary: string;
  justification: string;
  involvedRecords: string[];
  notes: string;
  status: OccStatus;
  priority: Priority;
  aiAnalysis: {
    problemSummary: string;
    toVerify: string;
    nextSteps: string;
    missingData: string;
  };
  history: AuditEntry[];
}

export type Page =
  | "overview"
  | "punch"
  | "employees"
  | "occurrences"
  | "assistant";

export type Role = "rh" | "gestor" | "funcionario";

