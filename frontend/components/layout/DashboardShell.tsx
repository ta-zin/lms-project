"use client";

import {
  ReactNode,
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  getDashboardPath,
  getCurrentUser,
  getUserRole,
  hasRole,
  UserRole,
} from "@/lib/auth";

import LogoutButton from "./LogoutButton";

interface DashboardShellProps {
  children: ReactNode;
  allowedRoles: readonly UserRole[];
  title: string;
  description: string;
}

interface NavigationItem {
  label: string;
  href: string;
}

function getNavigation(
  role: UserRole | null
): NavigationItem[] {
  switch (role) {
    case "Student":
      return [
        {
          label: "Dashboard",
          href: "/dashboard",
        },
        {
          label: "Courses",
          href: "/courses",
        },
        {
          label: "My Courses",
          href: "/my-courses",
        },
        {
          label: "Blog",
          href: "/blog",
        },
      ];

    case "Instructor":
      return [
        {
          label: "Dashboard",
          href: "/instructor",
        },
        {
          label: "My Courses",
          href: "/instructor/courses",
        },
        {
          label: "Student Progress",
          href: "/instructor/progress",
        },
        {
          label: "Blog",
          href: "/blog",
        },
      ];

    case "Content Manager":
      return [
        {
          label: "Dashboard",
          href: "/content-manager",
        },
        {
          label: "Courses",
          href: "/content-manager/courses",
        },
        {
          label: "Lessons",
          href: "/content-manager/lessons",
        },
        {
          label: "Quizzes",
          href: "/content-manager/quizzes",
        },
        {
          label: "Blog",
          href: "/content-manager/blog",
        },
      ];

    case "Admin":
      return [
        {
          label: "Dashboard",
          href: "/admin",
        },
        {
          label: "Users",
          href: "/admin/users",
        },
        {
          label: "Courses",
          href: "/admin/courses",
        },
        {
          label: "Lessons",
          href: "/admin/lessons",
        },
        {
          label: "Blog",
          href: "/admin/blog",
        },
      ];

    default:
      return [];
  }
}

export default function DashboardShell({
  children,
  allowedRoles,
  title,
  description,
}: DashboardShellProps) {
  const pathname = usePathname();

  const [hydrated, setHydrated] =
    useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-sm text-slate-500">
          Loading...
        </div>
      </main>
    );
  }

  const user = getCurrentUser();
  const role = getUserRole();

  if (!user || !role) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="max-w-md text-center">
          <p className="text-sm font-semibold text-red-600">
            Authentication required
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Please sign in
          </h1>

          <p className="mt-3 text-slate-600">
            You need to be logged in to access
            this section.
          </p>

          <Link
            href="/login"
            className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Go to Login
          </Link>
        </div>
      </main>
    );
  }

  const hasAccess = hasRole(
    allowedRoles,
    user
  );

  if (!hasAccess) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="max-w-md text-center">
          <p className="text-sm font-semibold text-red-600">
            403
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Access denied
          </h1>

          <p className="mt-3 text-slate-600">
            Your current role does not have
            permission to access this section.
          </p>

          <Link
            href={getDashboardPath(role)}
            className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Go to my dashboard
          </Link>
        </div>
      </main>
    );
  }

  const navigation = getNavigation(role);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            href={getDashboardPath(role)}
            className="text-xl font-bold text-slate-900"
          >
            LMS
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-900">
                {user.username}
              </p>

              <p className="text-xs text-slate-500">
                {role}
              </p>
            </div>

            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        <aside className="hidden min-h-[calc(100vh-73px)] w-64 border-r border-slate-200 bg-white p-5 md:block">
          <nav
            aria-label="Dashboard navigation"
            className="space-y-1"
          >
            {navigation.map((item) => {
              const active =
                pathname === item.href ||
                pathname.startsWith(
                  `${item.href}/`
                );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-lg px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {title}
            </h1>

            <p className="mt-2 max-w-3xl text-slate-600">
              {description}
            </p>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}