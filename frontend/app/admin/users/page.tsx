"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import DashboardShell from "@/components/layout/DashboardShell";

import {
  AdminUser,
  AdminUserRole,
  deleteAdminUser,
  getAdminUsers,
  updateUserRole,
} from "@/lib/admin-users";

import { ApiError } from "@/lib/api";

const roles: AdminUserRole[] = [
  "Student",
  "Instructor",
  "Content Manager",
  "Admin",
];

export default function AdminUsersPage() {
  const searchParams =
    useSearchParams();

  const roleParam =
    searchParams.get("role");

  const roleFilter: AdminUserRole | null =
    roles.includes(
      roleParam as AdminUserRole
    )
      ? (roleParam as AdminUserRole)
      : null;

  const [users, setUsers] =
    useState<AdminUser[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      const data =
        await getAdminUsers();

      setUsers(data);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else if (
        error instanceof Error
      ) {
        setError(error.message);
      } else {
        setError(
          "Failed to load users."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!roleFilter) {
      return users;
    }

    return users.filter(
      (user) =>
        user.role?.name === roleFilter
    );
  }, [users, roleFilter]);

  async function handleRoleChange(
    documentId: string,
    role: AdminUserRole
  ) {
    try {
      setUpdatingId(documentId);
      setError("");

      const updatedUser =
        await updateUserRole(
          documentId,
          role
        );

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.documentId ===
          documentId
            ? updatedUser
            : user
        )
      );
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else if (
        error instanceof Error
      ) {
        setError(error.message);
      } else {
        setError(
          "Failed to update user role."
        );
      }
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(
    user: AdminUser
  ) {
    const confirmed =
      window.confirm(
        `Delete ${user.username}? This action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(
        user.documentId
      );

      setError("");

      await deleteAdminUser(
        user.documentId
      );

      setUsers((currentUsers) =>
        currentUsers.filter(
          (item) =>
            item.documentId !==
            user.documentId
        )
      );
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else if (
        error instanceof Error
      ) {
        setError(error.message);
      } else {
        setError(
          "Failed to delete user."
        );
      }
    } finally {
      setDeletingId(null);
    }
  }

  const pageTitle =
    roleFilter
      ? roleFilter ===
        "Content Manager"
        ? "Content Managers"
        : `${roleFilter}s`
      : "Manage Users";

  const pageDescription =
    roleFilter
      ? `View and manage all users with the ${roleFilter} role.`
      : "View registered users, change their LMS roles, and remove accounts.";

  return (
    <DashboardShell
      allowedRoles={["Admin"]}
      title={pageTitle}
      description={pageDescription}
    >
      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/admin/users"
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            !roleFilter
              ? "bg-blue-600 text-white"
              : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          All Users
        </Link>

        <Link
          href="/admin/users?role=Student"
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            roleFilter === "Student"
              ? "bg-blue-600 text-white"
              : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          Students
        </Link>

        <Link
          href="/admin/users?role=Instructor"
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            roleFilter ===
            "Instructor"
              ? "bg-blue-600 text-white"
              : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          Instructors
        </Link>

        <Link
          href="/admin/users?role=Content%20Manager"
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            roleFilter ===
            "Content Manager"
              ? "bg-blue-600 text-white"
              : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          Content Managers
        </Link>

        <Link
          href="/admin/users?role=Admin"
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            roleFilter === "Admin"
              ? "bg-blue-600 text-white"
              : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          Admins
        </Link>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="mb-4">
        <p className="text-sm text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-700">
            {filteredUsers.length}
          </span>{" "}
          {filteredUsers.length === 1
            ? "user"
            : "users"}
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Loading users...
          </div>
        ) : filteredUsers.length ===
          0 ? (
          <div className="p-8 text-center">
            <h3 className="font-semibold text-slate-900">
              No users found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              No users match this role.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    User
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Email
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Role
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredUsers.map(
                  (user) => {
                    const role =
                      user.role?.name ??
                      "Student";

                    const isUpdating =
                      updatingId ===
                      user.documentId;

                    const isDeleting =
                      deletingId ===
                      user.documentId;

                    return (
                      <tr
                        key={
                          user.documentId
                        }
                        className="hover:bg-slate-50"
                      >
                        <td className="whitespace-nowrap px-6 py-4">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {
                                user.username
                              }
                            </p>

                            <p className="text-xs text-slate-500">
                              ID:{" "}
                              {user.id}
                            </p>
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                          {user.email}
                        </td>

                        <td className="px-6 py-4">
                          <select
                            value={role}
                            disabled={
                              isUpdating ||
                              isDeleting
                            }
                            onChange={(
                              event
                            ) =>
                              handleRoleChange(
                                user.documentId,
                                event
                                  .target
                                  .value as AdminUserRole
                              )
                            }
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                          >
                            {roles.map(
                              (
                                roleOption
                              ) => (
                                <option
                                  key={
                                    roleOption
                                  }
                                  value={
                                    roleOption
                                  }
                                >
                                  {
                                    roleOption
                                  }
                                </option>
                              )
                            )}
                          </select>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              user.blocked
                                ? "bg-red-100 text-red-700"
                                : user.confirmed
                                  ? "bg-green-100 text-green-700"
                                  : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {user.blocked
                              ? "Blocked"
                              : user.confirmed
                                ? "Active"
                                : "Unconfirmed"}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <button
                            type="button"
                            disabled={
                              isDeleting
                            }
                            onClick={() =>
                              handleDelete(
                                user
                              )
                            }
                            className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isDeleting
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}