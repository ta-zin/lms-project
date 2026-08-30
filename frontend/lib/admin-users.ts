import { ApiError, apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";

export type AdminUserRole =
  | "Admin"
  | "Content Manager"
  | "Instructor"
  | "Student";

export interface AdminUser {
  id: number;
  documentId: string;
  username: string;
  email: string;
  confirmed?: boolean;
  blocked?: boolean;
  createdAt?: string;
  updatedAt?: string;
  role?: {
    id: number;
    name: AdminUserRole;
    type?: string;
    documentId?: string;
  } | null;
}

function getRequiredToken(): string {
  const token = getToken();

  if (!token) {
    throw new ApiError(
      "Authentication required",
      401
    );
  }

  return token;
}

export async function getAdminUsers(): Promise<
  AdminUser[]
> {
  const token =
    getRequiredToken();

  const response =
    await apiFetch<{
      data: AdminUser[];
    }>("/admin/users", {
      method: "GET",
      token,
    });

  return response.data || [];
}

export async function updateUserRole(
  documentId: string,
  role: AdminUserRole
): Promise<AdminUser> {
  const token =
    getRequiredToken();

  const response =
    await apiFetch<{
      data: AdminUser;
    }>(
      `/admin/users/${encodeURIComponent(
        documentId
      )}/role`,
      {
        method: "PUT",
        token,
        body: JSON.stringify({
          role,
        }),
      }
    );

  if (!response.data) {
    throw new ApiError(
      "Failed to update user role",
      500
    );
  }

  return response.data;
}

export async function deleteAdminUser(
  documentId: string
): Promise<void> {
  const token =
    getRequiredToken();

  await apiFetch(
    `/admin/users/${encodeURIComponent(
      documentId
    )}`,
    {
      method: "DELETE",
      token,
    }
  );
}