import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Employee, Occ, OccStatus, Page, Rec, Role } from "../tipos";
import { employees0, occurrences0, records0, now } from "../dados/dadosSimulados";
import {
  initialResponsibility,
  isTerminalStatus,
  OccurrenceAction,
  roleHasPermission,
} from "../paginas/Ocorrencias/regrasOcorrencia";

const actionByResultStatus: Partial<Record<OccStatus, OccurrenceAction>> = {
  Aprovada: "aprovar",
  Rejeitada: "rejeitar",
  "Em análise": "solicitar-informacoes",
  "Encaminhada para revisão": "encaminhar-para-revisao",
};

function actionFromResultStatus(status: OccStatus): OccurrenceAction | null {
  return actionByResultStatus[status] ?? null;
}

const STORAGE_KEYS = {
  role: "pontonexo_role_v1",
  employees: "pontonexo_employees_v1",
  occs: "pontonexo_occs_v1",
  recs: "pontonexo_recs_v1",
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export const pageNames: Record<Page, string> = {
  overview: "Visão operacional",
  punch: "Central de Ponto",
  timebank: "Banco de horas",
  employees: "Funcionários",
  occurrences: "Ocorrências e justificativas",
  assistant: "Assistente de IA",
};

export const roles: Record<
  Role,
  {
    label: string;
    shortLabel: string;
    segmentLabel: string;
    user: string;
    userRole: string;
    avatar: string;
    scopeNote: string;
    pages: Page[];
  }
> = {
  rh: {
    label: "RH / Administrador",
    shortLabel: "Administração RH",
    segmentLabel: "Organização (RH)",
    user: "Marina Costa",
    userRole: "Coordenação de RH e Operações de Pessoas",
    avatar: "MC",
    scopeNote: "Acesso administrativo integral a todos os setores",
    pages: ["overview", "punch", "employees", "occurrences", "assistant"],
  },
  gestor: {
    label: "Gestor (Setor Tecnologia)",
    shortLabel: "Gestor · Tecnologia",
    segmentLabel: "Meu Setor (Gestor)",
    user: "Paulo Ramos",
    userRole: "Gerente de Engenharia e QA",
    avatar: "PR",
    scopeNote: "Visão restrita ao setor de Tecnologia",
    pages: ["overview", "punch", "employees", "occurrences", "assistant"],
  },
  funcionario: {
    label: "Funcionário (Ana Souza)",
    shortLabel: "Colaboradora",
    segmentLabel: "Pessoal (Funcionário)",
    user: "Ana Souza",
    userRole: "Desenvolvedora Pleno · Matrícula 1001",
    avatar: "AS",
    scopeNote: "Acesso individual restrito aos próprios registros",
    pages: ["punch", "timebank", "occurrences", "assistant"],
  },
};

export const SELF = "e1";
export const MGR_DEPT = "Tecnologia";

export interface AppContextValue {
  role: Role;
  setRole: (r: Role) => void;
  page: Page;
  query: Record<string, string>;
  go: (p: Page, q?: Record<string, string>) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  employees: Employee[];
  allEmployeesCount: number;
  occs: Occ[];
  recs: Rec[];
  toast: string;
  notify: (m: string) => void;
  saveEmployee: (e: Employee) => void;
  addRec: (r: Omit<Rec, "id" | "time">[]) => void;
  actOcc: (id: string, s: OccStatus, label: string, note?: string) => void;
  addOcc: (o: Omit<Occ, "id" | "requestedAt" | "history" | "status">) => void;
  resetDemoData: () => void;
}

const Ctx = createContext<AppContextValue>(null as unknown as AppContextValue);
export const useApp = () => useContext(Ctx);

export function Provider({ children }: { children: ReactNode }) {
  const [role, setRoleS] = useState<Role>(() =>
    loadFromStorage<Role>(STORAGE_KEYS.role, "rh"),
  );
  const [page, setPage] = useState<Page>("overview");
  const [query, setQuery] = useState<Record<string, string>>({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [employees, setEmp] = useState<Employee[]>(() =>
    loadFromStorage<Employee[]>(STORAGE_KEYS.employees, employees0),
  );
  const [allOccs, setOccs] = useState<Occ[]>(() =>
    loadFromStorage<Occ[]>(STORAGE_KEYS.occs, occurrences0),
  );
  const [allRecs, setRecs] = useState<Rec[]>(() =>
    loadFromStorage<Rec[]>(STORAGE_KEYS.recs, records0),
  );
  const [toast, setToast] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.role, JSON.stringify(role));
    } catch {
      // Ignora erro de cota/privacidade do navegador
    }
  }, [role]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.employees, JSON.stringify(employees));
    } catch {
      // Ignora erro de cota/privacidade do navegador
    }
  }, [employees]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.occs, JSON.stringify(allOccs));
    } catch {
      // Ignora erro de cota/privacidade do navegador
    }
  }, [allOccs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.recs, JSON.stringify(allRecs));
    } catch {
      // Ignora erro de cota/privacidade do navegador
    }
  }, [allRecs]);

  const notify = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 4200);
  };

  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);

  const go = (p: Page, q: Record<string, string> = {}) => {
    const allowedPages = roles[role].pages;
    const targetPage = allowedPages.includes(p) ? p : allowedPages[0];
    setPage(targetPage);
    setQuery(q);
  };

  const setRole = (r: Role) => {
    setRoleS(r);
    const nextPages = roles[r].pages;
    if (!nextPages.includes(page)) {
      setPage(nextPages[0]);
    }
    setQuery({});
    notify(`Perfil alternado para: ${roles[r].label} (simulação de acesso).`);
  };

  const visE = (id: string) =>
    role === "rh" ||
    (role === "funcionario"
      ? id === SELF
      : employees.find((e) => e.id === id)?.dept === MGR_DEPT);

  const value: AppContextValue = {
    role,
    setRole,
    page,
    query,
    go,
    sidebarCollapsed,
    toggleSidebar,
    toast,
    notify,
    employees: employees.filter((e) => visE(e.id)),
    allEmployeesCount: employees.length,
    occs: allOccs.filter((x) => visE(x.empId)),
    recs: allRecs.filter((x) => visE(x.empId)),
    saveEmployee: (e) => {
      const exists = employees.some((x) => x.id === e.id);
      setEmp((l) =>
        exists ? l.map((x) => (x.id === e.id ? e : x)) : [e, ...l],
      );
      notify(
        exists
          ? `Cadastro de ${e.name} atualizado (operação demonstrativa).`
          : `Funcionário ${e.name} cadastrado com sucesso (demonstrativo).`,
      );
    },
    addRec: (l) =>
      setRecs((p) => [
        ...l.map((x, i) => ({ ...x, id: "r" + Date.now() + i, time: now() })),
        ...p,
      ]),
    actOcc: (id, s, label, note) => {
      const oc = allOccs.find((x) => x.id === id);
      if (!oc) return;

      if (isTerminalStatus(oc.status)) {
        notify(
          `Ação não realizada: a ocorrência já está finalizada com status "${oc.status}".`,
        );
        return;
      }

      const action = actionFromResultStatus(s);
      if (!action || !roleHasPermission(role, action)) {
        notify(
          `Ação não autorizada para o perfil ${roles[role].shortLabel}. Nenhuma alteração foi realizada.`,
        );
        return;
      }

      setOccs((l) =>
        l.map((x) =>
          x.id === id
            ? {
                ...x,
                status: s,
                history: [
                  ...x.history,
                  {
                    action: label,
                    by: `${roles[role].user} (${roles[role].shortLabel})`,
                    at: now(),
                    note: note?.trim() || undefined,
                  },
                ],
              }
            : x,
        ),
      );
      if (s === "Aprovada" && oc.type === "homeoffice") {
        setEmp((l) =>
          l.map((e) =>
            e.id === oc.empId
              ? {
                  ...e,
                  remote: {
                    allowed: true,
                    until: "2026-12-31",
                    by: `${roles[role].user} (RH)`,
                  },
                }
              : e,
          ),
        );
      }
      notify(
        `${label} — status atualizado para "${s}" e registrado no histórico.`,
      );
    },
    addOcc: (o) => {
      const newOcc: Occ = {
        ...o,
        id: "o" + (allOccs.length + 1 + Math.floor(Math.random() * 90)),
        requestedAt: now(),
        status: "Pendente",
        responsibility: {
          current: initialResponsibility(),
          next: "rh",
        },
        history: [
          {
            action: "Solicitação cadastrada na plataforma",
            by: `${roles[role].user} (fictício)`,
            at: now(),
          },
        ],
      };
      setOccs((prev) => [newOcc, ...prev]);
      notify("Solicitação registrada para análise do RH (demonstrativo).");
    },
    resetDemoData: () => {
      setEmp(employees0);
      setOccs(occurrences0);
      setRecs(records0);
      setRoleS("rh");
      setPage("overview");
      setQuery({});
      try {
        localStorage.removeItem(STORAGE_KEYS.employees);
        localStorage.removeItem(STORAGE_KEYS.occs);
        localStorage.removeItem(STORAGE_KEYS.recs);
        localStorage.removeItem(STORAGE_KEYS.role);
      } catch {
        // Ignora erro
      }
      notify("Dados iniciais da demonstração restaurados no navegador.");
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
