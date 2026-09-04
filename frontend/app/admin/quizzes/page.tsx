"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import DashboardShell from "@/components/layout/DashboardShell";

import {
  Course,
  getCourses,
} from "@/lib/courses";

import {
  Quiz,
  createQuiz,
  deleteQuiz,
  getQuizzes,
  updateQuiz,
} from "@/lib/quizzes";

import { ApiError } from "@/lib/api";

interface FormState {
  title: string;
  course: string;
}

const initialForm: FormState = {
  title: "",
  course: "",
};

export default function AdminQuizzesPage() {
  const [quizzes, setQuizzes] =
    useState<Quiz[]>([]);

  const [courses, setCourses] =
    useState<Course[]>([]);

  const [form, setForm] =
    useState<FormState>(initialForm);

  const [editingDocumentId, setEditingDocumentId] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [
        quizzesData,
        coursesData,
      ] = await Promise.all([
        getQuizzes(),
        getCourses(),
      ]);

      const sortedQuizzes = [
        ...quizzesData,
      ].sort((a, b) => {
        const dateA = new Date(
          a.updatedAt ??
            a.createdAt ??
            0
        ).getTime();

        const dateB = new Date(
          b.updatedAt ??
            b.createdAt ??
            0
        ).getTime();

        return dateB - dateA;
      });

      setQuizzes(sortedQuizzes);
      setCourses(coursesData);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Failed to load quiz data."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  function resetForm() {
    setForm(initialForm);
    setEditingDocumentId(null);
  }

  function startEdit(quiz: Quiz) {
    setError("");
    setSuccess("");

    setEditingDocumentId(
      quiz.documentId
    );

    setForm({
      title: quiz.title ?? "",
      course:
        quiz.course?.documentId ?? "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanTitle =
      form.title.trim();

    if (!cleanTitle) {
      setError(
        "Quiz title is required."
      );
      return;
    }

    if (
      !editingDocumentId &&
      !form.course
    ) {
      setError(
        "Please select a course."
      );
      return;
    }

    setSubmitting(true);

    try {
      if (editingDocumentId) {
        const updatedQuiz =
          await updateQuiz(
            editingDocumentId,
            {
              title: cleanTitle,
              course: form.course,
            }
          );

        setQuizzes((current) =>
          current.map((quiz) =>
            quiz.documentId ===
            editingDocumentId
              ? {
                  ...quiz,
                  ...updatedQuiz,
                }
              : quiz
          )
        );

        setSuccess(
          "Quiz updated successfully."
        );
      } else {
        const createdQuiz =
          await createQuiz({
            title: cleanTitle,
            course: form.course,
          });

        const selectedCourse =
          courses.find(
            (course) =>
              course.documentId ===
              form.course
          );

        setQuizzes((current) => [
          {
            ...createdQuiz,
            course:
              createdQuiz.course ??
              (selectedCourse
                ? {
                    id:
                      selectedCourse.id,
                    documentId:
                      selectedCourse.documentId,
                    title:
                      selectedCourse.title,
                  }
                : null),
          },
          ...current,
        ]);

        setSuccess(
          "Quiz created successfully."
        );
      }

      resetForm();
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Failed to save quiz."
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(
    quiz: Quiz
  ) {
    const confirmed =
      window.confirm(
        `Delete "${quiz.title}"?`
      );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");
    setDeletingId(
      quiz.documentId
    );

    try {
      await deleteQuiz(
        quiz.documentId
      );

      setQuizzes((current) =>
        current.filter(
          (item) =>
            item.documentId !==
            quiz.documentId
        )
      );

      if (
        editingDocumentId ===
        quiz.documentId
      ) {
        resetForm();
      }

      setSuccess(
        "Quiz deleted successfully."
      );
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Failed to delete quiz."
        );
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <DashboardShell
      allowedRoles={["Admin"]}
      title="Manage Quizzes"
      description="Create, update, and delete quizzes across all courses."
    >
      <div className="space-y-8">
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            ← Back to Admin
          </Link>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              {editingDocumentId
                ? "Edit Quiz"
                : "Create Quiz"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {editingDocumentId
                ? "Update the quiz title."
                : "Create a new quiz for a course."}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="quiz-title"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Quiz Title
              </label>

              <input
                id="quiz-title"
                type="text"
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title:
                      event.target.value,
                  }))
                }
                placeholder="Enter quiz title"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
              />
            </div>

            <div>
  <label
    htmlFor="quiz-course"
    className="mb-2 block text-sm font-semibold text-slate-700"
  >
    Course
  </label>

  <select
    id="quiz-course"
    value={form.course}
    onChange={(event) =>
      setForm((current) => ({
        ...current,
        course: event.target.value,
      }))
    }
    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500"
  >
    <option value="">
      Select a course
    </option>

    {courses.map((course) => (
      <option
        key={course.documentId}
        value={course.documentId}
      >
        {course.title}
      </option>
    ))}
  </select>
</div>



            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? "Saving..."
                  : editingDocumentId
                    ? "Update Quiz"
                    : "Create Quiz"}
              </button>

              {editingDocumentId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-xl font-bold text-slate-900">
              All Quizzes
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {quizzes.length} quiz
              {quizzes.length !== 1
                ? "zes"
                : ""}
            </p>
          </div>

          {loading ? (
            <div className="p-10 text-center">
              <p className="text-sm text-slate-500">
                Loading quizzes...
              </p>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm text-slate-500">
                No quizzes found.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Quiz
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Course
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {quizzes.map((quiz) => (
                    <tr
                      key={quiz.documentId}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-6 py-5">
                        <p className="font-semibold text-slate-900">
                          {quiz.title}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {quiz.documentId}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <p className="text-sm text-slate-700">
                          {quiz.course
                            ?.title ??
                            "No course"}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex flex-wrap justify-end gap-2">
  <Link
    href={`/admin/quizzes/${quiz.documentId}`}
    className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
  >
    Manage Questions
  </Link>

  <button
    type="button"
    onClick={() =>
      startEdit(quiz)
    }
    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
  >
    Edit
  </button>

  <button
    type="button"
    onClick={() =>
      void handleDelete(quiz)
    }
    disabled={
      deletingId ===
      quiz.documentId
    }
    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {deletingId ===
    quiz.documentId
      ? "Deleting..."
      : "Delete"}
  </button>
</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}