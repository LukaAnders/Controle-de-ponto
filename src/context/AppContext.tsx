import { createContext, useContext, useState, ReactNode } from "react";
import { Employee, Occ, OccStatus, Page, Rec, Role } from "../types";
import { employees0, occurrences0, records0, now } from "../data/mockData";

export const pageNames: Record<Page, string> = {
  overview: "Visão operacional",
  punch: "Central de Ponto",
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
    pages: ["punch", "occurrences", "assistant"],
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
}

const Ctx = createContext<AppContextValue>(null as unknown as AppContextValue);
export const useApp = () => useContext(Ctx);

export function Provider({ children }: { children: ReactNode }) {
  const [role, setRoleS] = useState<Role>("rh");
  const [page, setPage] = useState<Page>("overview");
  const [query, setQuery] = useState<Record<string, string>>({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [employees, setEmp] = useState<Employee[]>(employees0);
  const [allOccs, setOccs] = useState<Occ[]>(occurrences0);
  const [allRecs, setRecs] = useState<Rec[]>(records0);
  const [toast, setToast] = useState("");

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
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
