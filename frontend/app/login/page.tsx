"use client";

import {
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  ApiError,
  apiFetch,
} from "@/lib/api";

import {
  getDashboardPath,
  saveAuth,
  User,
} from "@/lib/auth";

interface LoginResponse {
  jwt: string;
  user: User;
}

export default function LoginPage() {
  const router = useRouter();

  const [identifier, setIdentifier] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setError("");
    setLoading(true);

    try {
      const loginResponse =
        await apiFetch<LoginResponse>(
          "/auth/local",
          {
            method: "POST",
            body: JSON.stringify({
              identifier: identifier.trim(),
              password,
            }),
          }
        );

      const currentUser =
        await apiFetch<User>(
          "/users/me?populate=role",
          {
            method: "GET",
            token: loginResponse.jwt,
          }
        );

      if (!currentUser.role?.name) {
        throw new Error(
          "Your account does not have a valid LMS role."
        );
      }

      saveAuth({
        jwt: loginResponse.jwt,
        user: currentUser,
      });

      router.replace(
        getDashboardPath(
          currentUser.role.name
        )
      );
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-md items-center">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8">
            <p className="text-sm font-semibold text-blue-600">
              LMS Platform
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Welcome back
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Sign in to continue learning.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="identifier"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email or username
              </label>

              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(event) =>
                  setIdentifier(
                    event.target.value
                  )
                }
                required
                autoComplete="username"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                required
                autoComplete="current-password"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Signing in..."
                : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <a
              href="/register"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Create one
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}