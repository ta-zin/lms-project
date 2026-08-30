
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import DashboardShell from "@/components/layout/DashboardShell";

import { getAdminUsers } from "@/lib/admin-users";
import { getCourses } from "@/lib/courses";

import { ApiError } from "@/lib/api";

interface DashboardStats {
  totalUsers: number;
  students: number;
  instructors: number;
  courses: number;
}

const initialStats: DashboardStats = {
  totalUsers: 0,
  students: 0,
  instructors: 0,
  courses: 0,
};

const stats = [
  {
    key: "totalUsers",
    label: "Total Users",
    href: "/admin/users",
  },
  {
    key: "students",
    label: "Students",
    href: "/admin/users?role=Student",
  },
  {
    key: "instructors",
    label: "Instructors",
    href: "/admin/users?role=Instructor",
  },
  {
    key: "courses",
    label: "Courses",
    href: "/admin/courses",
  },
] as const;

export default function AdminDashboard() {
  const searchParams = useSearchParams();

  const [dashboardStats, setDashboardStats] =
    useState<DashboardStats>(
      initialStats
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        setError("");

        const [users, courses] =
          await Promise.all([
            getAdminUsers(),
            getCourses(),
          ]);

        const students =
          users.filter(
            (user) =>
              user.role?.name ===
              "Student"
          ).length;

        const instructors =
          users.filter(
            (user) =>
              user.role?.name ===
              "Instructor"
          ).length;

        setDashboardStats({
          totalUsers: users.length,
          students,
          instructors,
          courses: courses.length,
        });
      } catch (error) {
        if (error instanceof ApiError) {
          setError(error.message);
        } else if (
          error instanceof Error
        ) {
          setError(error.message);
        } else {
          setError(
            "Failed to load dashboard statistics."
          );
        }
      } finally {
        setLoading(false);
      }
    }

    void loadStats();
  }, []);

  function getStatValue(
    key: keyof DashboardStats
  ) {
    if (loading) {
      return "—";
    }

    return dashboardStats[key];
  }

  return (
    <DashboardShell
      allowedRoles={["Admin"]}
      title="Admin Dashboard"
      description="Manage users, roles, courses, lessons and platform content."
    >
      {error && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {item.label}
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {getStatValue(
                    item.key
                  )}
                </p>
              </div>

              <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600">
                →
              </span>
            </div>

            <p className="mt-4 text-xs font-semibold text-blue-600 opacity-0 transition group-hover:opacity-100">
              View details
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">
          Quick Access
        </h2>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/admin/users"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Manage Users
          </Link>

          <Link
            href="/admin/courses"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Manage Courses
          </Link>

          <Link
            href="/admin/lessons"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Manage Lessons
          </Link>

          <Link
            href="/admin/blog"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Manage Blog
          </Link>
        </div>
      </div>
    </DashboardShell>
  );
}