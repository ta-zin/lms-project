export type UserRole =
  | "Admin"
  | "Content Manager"
  | "Instructor"
  | "Student";

export interface UserRoleRelation {
  id: number;
  name: UserRole;
  type?: string;
  documentId?: string;
}

export interface User {
  id: number;
  documentId?: string;
  username: string;
  email: string;
  confirmed?: boolean;
  blocked?: boolean;
  role?: UserRoleRelation;
}

export interface AuthSession {
  jwt: string;
  user: User;
}

const AUTH_STORAGE_KEY = "lms_auth";

export function saveAuth(session: AuthSession): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify(session)
  );
}

export function getAuth(): AuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);

    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.jwt !== "string" ||
      !parsed.user ||
      typeof parsed.user !== "object"
    ) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    return parsed as AuthSession;
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
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function hasRole(
  allowedRoles: readonly UserRole[],
  user: User | null = getCurrentUser()
): boolean {
  const role = user?.role?.name;

  if (!role) {
    return false;
  }

  return allowedRoles.includes(role);
}

export function getDashboardPath(
  role: UserRole | null
): string {
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
      return "/login";
  }
}