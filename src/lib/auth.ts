import { useCallback, useEffect, useState } from "react";

/* ------------------------------------------------------------------
 * Autenticação local do SYNX + controle de acesso (Owner).
 * Owner embutido: cria/apaga logins, define permissões de página
 * e visualiza o histórico de pesquisas dos usuários.
 * ------------------------------------------------------------------ */

export type PermissionId = "synx-search" | "osint" | "modules" | "settings";

export interface PermissionDef {
  id: PermissionId;
  label: string;
  description: string;
}

export const PERMISSIONS: PermissionDef[] = [
  {
    id: "synx-search",
    label: "Synx Search",
    description: "Consulta de logs, credenciais e vazamentos",
  },
  {
    id: "osint",
    label: "OSINT Intelligence",
    description: "Investigação avançada e análise de vínculos",
  },
  {
    id: "modules",
    label: "Módulos",
    description: "Painel de módulos e consultas rápidas",
  },
  {
    id: "settings",
    label: "Configurações",
    description: "Temas, aparência e perfil",
  },
];

export const ALL_PERMISSIONS: PermissionId[] = PERMISSIONS.map((p) => p.id);

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  cpf: string;
  role: string;
  password: string;
  permissions?: PermissionId[];
  createdAt?: number;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  cpf?: string;
  permissions?: PermissionId[];
}

export interface SearchLog {
  id: string;
  userId: string;
  userName: string;
  module: string;
  tool: string;
  query: string;
  status: "ok" | "erro";
  at: number;
}

const USERS_DB_KEY = "synx_users_db";
const SESSION_KEY = "synx_user";
const LOGS_KEY = "synx_search_logs";

/* Credenciais embutidas do Owner */
export const OWNER_EMAIL = "owner@synx.io";
export const OWNER_CPF = "000.000.000-00";
export const OWNER_PASSWORD = "SynxOwner@2026";

const hashPassword = (value: string) => {
  let h = 0;
  for (let i = 0; i < value.length; i++) {
    const c = value.charCodeAt(i);
    h = (h << 5) - h + c;
    h = h & h;
  }
  return (
    Math.abs(h).toString(36) + btoa(value.split("").reverse().join("")).slice(0, 16)
  );
};

function readUsersRaw(): StoredUser[] {
  if (typeof localStorage === "undefined") return [];
  const raw = localStorage.getItem(USERS_DB_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as StoredUser[];
    } catch {
      return [];
    }
  }
  return [];
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
}

/** Garante que o Owner embutido sempre exista. */
export function ensureOwner(): StoredUser[] {
  const users = readUsersRaw();
  const idx = users.findIndex((u) => u.role === "owner");
  const owner: StoredUser = {
    id: "usr_owner",
    name: "Owner",
    email: OWNER_EMAIL,
    cpf: OWNER_CPF,
    role: "owner",
    password: hashPassword(OWNER_PASSWORD),
    permissions: [...ALL_PERMISSIONS],
    createdAt: Date.now(),
  };
  if (idx === -1) {
    users.unshift(owner);
  } else {
    users[idx] = { ...owner, ...users[idx], role: "owner", permissions: [...ALL_PERMISSIONS] };
  }
  writeUsers(users);
  return users;
}

export function listUsers(): StoredUser[] {
  return ensureOwner();
}

export function createUser(data: {
  name: string;
  email: string;
  cpf?: string;
  password: string;
  permissions: PermissionId[];
}) {
  if (!data.name || !data.email || !data.password) {
    return { success: false, message: "Preencha nome, email e senha" };
  }
  const users = ensureOwner();
  const email = data.email.toLowerCase().trim();
  if (users.some((u) => u.email.toLowerCase().trim() === email)) {
    return { success: false, message: "Este email já está cadastrado" };
  }
  const created: StoredUser = {
    id: "usr_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    name: data.name.trim(),
    email,
    cpf: data.cpf?.trim() || "",
    role: "user",
    password: hashPassword(data.password),
    permissions: data.permissions,
    createdAt: Date.now(),
  };
  users.push(created);
  writeUsers(users);
  return { success: true, message: "Login criado com sucesso", user: created };
}

export function deleteUser(id: string) {
  const users = ensureOwner();
  const target = users.find((u) => u.id === id);
  if (!target) return { success: false, message: "Usuário não encontrado" };
  if (target.role === "owner") {
    return { success: false, message: "Não é possível excluir o Owner" };
  }
  writeUsers(users.filter((u) => u.id !== id));
  return { success: true, message: "Login excluído" };
}

export function setUserPermissions(id: string, permissions: PermissionId[]) {
  const users = ensureOwner();
  const next = users.map((u) =>
    u.id === id && u.role !== "owner" ? { ...u, permissions } : u,
  );
  writeUsers(next);
  return next;
}

export function resetUserPassword(id: string, password: string) {
  if (!password || password.length < 4) {
    return { success: false, message: "Senha muito curta" };
  }
  const users = ensureOwner();
  writeUsers(
    users.map((u) => (u.id === id ? { ...u, password: hashPassword(password) } : u)),
  );
  return { success: true, message: "Senha atualizada" };
}

/* ----------------------------- Histórico ----------------------------- */

export function readLogs(): SearchLog[] {
  if (typeof localStorage === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LOGS_KEY) || "[]") as SearchLog[];
  } catch {
    return [];
  }
}

export function logSearch(entry: {
  module: string;
  tool: string;
  query: string;
  status: "ok" | "erro";
}) {
  if (typeof localStorage === "undefined") return;
  let session: SessionUser | null = null;
  try {
    session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    session = null;
  }
  const logs = readLogs();
  logs.unshift({
    id: "log_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    userId: session?.id || "anon",
    userName: session?.name || "Desconhecido",
    at: Date.now(),
    ...entry,
  });
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs.slice(0, 500)));
  window.dispatchEvent(new Event("synx:logs"));
}

export function clearLogs() {
  localStorage.removeItem(LOGS_KEY);
  window.dispatchEvent(new Event("synx:logs"));
}

/* ------------------------------- Hook -------------------------------- */

export function useAuth() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ensureOwner();
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as SessionUser;
        const fresh = readUsersRaw().find((u) => u.id === parsed.id);
        const session: SessionUser = fresh
          ? {
              id: fresh.id,
              name: fresh.name,
              email: fresh.email,
              role: fresh.role,
              cpf: fresh.cpf,
              permissions:
                fresh.role === "owner"
                  ? [...ALL_PERMISSIONS]
                  : fresh.permissions || [],
            }
          : parsed;
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        setUser(session);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((identifier: string, password: string) => {
    if (!identifier || !password) {
      return { success: false, message: "Preencha todos os campos" };
    }
    const users = ensureOwner();
    const email = identifier.toLowerCase().trim();
    const digits = identifier.replace(/\D/g, "");
    const found = users.find(
      (u) =>
        u.email.toLowerCase().trim() === email ||
        (u.cpf &&
          (u.cpf.trim() === identifier.trim() ||
            (digits.length > 0 && u.cpf.replace(/\D/g, "") === digits))),
    );
    if (!found) return { success: false, message: "Usuário não encontrado" };
    if (found.password !== hashPassword(password)) {
      return { success: false, message: "Senha incorreta" };
    }
    const session: SessionUser = {
      id: found.id,
      name: found.name,
      email: found.email,
      role: found.role,
      cpf: found.cpf,
      permissions:
        found.role === "owner" ? [...ALL_PERMISSIONS] : found.permissions || [],
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
    setIsAuthenticated(true);
    return { success: true, message: "Login realizado com sucesso!" };
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const isOwner = user?.role === "owner";
  const can = useCallback(
    (permission?: PermissionId) => {
      if (!permission) return true;
      if (!user) return false;
      if (user.role === "owner") return true;
      return (user.permissions || []).includes(permission);
    },
    [user],
  );

  return { user, isAuthenticated, isLoading, isOwner, can, login, logout };
}
