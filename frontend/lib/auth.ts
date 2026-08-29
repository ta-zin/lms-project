export type UserRole =
  | "Admin"
  | "Content Manager"
  | "Instructor"
  | "Student";

export interface User {
  id: number;
  documentId?: string;
  username: string;
  email: string;
  confirmed?: boolean;
  blocked?: boolean;
  role?: {
    id: number;
    name: UserRole;
    type?: string;
    documentId?: string;
  };
}

export interface AuthSession {
  jwt: string;
  user: User;
}

const AUTH_STORAGE_KEY = "lms_auth";

export function saveAuth(session: AuthSession): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function getAuth(): AuthSession | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function getToken(): string | null {
  return getAuth()?.jwt ?? null;
}

export function getCurrentUser(): User | null {
  return getAuth()?.user ?? null;
}

export function getUserRole(): UserRole | null {
  return getCurrentUser()?.role?.name ?? null;
}

export function isLoggedIn(): boolean {
  return Boolean(getAuth()?.jwt);
}

export function logout(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function hasRole(
  allowedRoles: UserRole[],
  user: User | null = getCurrentUser()
): boolean {
  if (!user?.role?.name) return false;

  return allowedRoles.includes(user.role.name);
}

export function getDashboardPath(role: UserRole | null): string {
  switch (role) {
    case "Admin":
      return "/admin";

    case "Content Manager":
      return "/content-manager";

    case "Instructor":
      return "/instructor";

    case "Student":
      return "/dashboard";

    default:
      return "/";
  }
}