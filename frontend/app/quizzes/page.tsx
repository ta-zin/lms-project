"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import DashboardShell from "@/components/layout/DashboardShell";

import {
  Quiz,
  getQuizzes,
} from "@/lib/quizzes";

import { ApiError } from "@/lib/api";

export default function QuizzesPage() {
  const [quizzes, setQuizzes] =
    useState<Quiz[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadQuizzes() {
      setLoading(true);
      setError("");

      try {
        const data =
          await getQuizzes();

        setQuizzes(data);
      } catch (error) {
        if (error instanceof ApiError) {
          setError(error.message);
        } else {
          setError(
            "Failed to load quizzes."
          );
        }
      } finally {
        setLoading(false);
      }
    }

    void loadQuizzes();
  }, []);

  return (
    <DashboardShell
      allowedRoles={["Student"]}
      title="Quizzes"
      description="Take quizzes from your enrolled courses and test your knowledge."
    >
      {loading ? (
        <div className="grid gap-5 md:grid-cols-2">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="h-48 animate-pulse rounded-2xl bg-white"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h2 className="font-semibold text-red-900">
            Unable to load quizzes
          </h2>

          <p className="mt-2 text-sm text-red-700">
            {error}
          </p>

          <Link
            href="/dashboard"
            className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Back to Dashboard
          </Link>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <h2 className="text-xl font-bold text-slate-900">
            No quizzes available
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Your enrolled courses do not have any quizzes
            yet.
          </p>

          <Link
            href="/courses"
            className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Explore Courses
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {quizzes.map((quiz) => (
            <article
              key={quiz.documentId}
              className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                Quiz
              </span>

              <h2 className="mt-4 text-xl font-bold text-slate-900">
                {quiz.title}
              </h2>

              {quiz.course?.title && (
                <p className="mt-2 text-sm text-slate-500">
                  Course:{" "}
                  <span className="font-medium text-slate-700">
                    {quiz.course.title}
                  </span>
                </p>
              )}

              <div className="mt-auto pt-6">
                <Link
                  href={`/quizzes/${encodeURIComponent(
                    quiz.documentId
                  )}`}
                  className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  Start Quiz →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}