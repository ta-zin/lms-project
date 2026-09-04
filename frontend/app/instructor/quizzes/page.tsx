"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import DashboardShell from "@/components/layout/DashboardShell";

import {
  Quiz,
  createQuiz,
  deleteQuiz,
  getQuizzes,
  updateQuiz,
} from "@/lib/quizzes";

import {
  Course,
  getCourses,
} from "@/lib/courses";

import { ApiError } from "@/lib/api";

interface FormState {
  title: string;
  course: string;
}

const initialForm: FormState = {
  title: "",
  course: "",
};

export default function InstructorQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

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

      setQuizzes(quizzesData);
      setCourses(coursesData);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else if (error instanceof Error) {
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

  useEffect(() => {
    void loadData();
  }, []);

  const sortedQuizzes = useMemo(
    () =>
      [...quizzes].sort((a, b) => {
        const aTime = new Date(
          a.updatedAt ??
            a.createdAt ??
            0
        ).getTime();

        const bTime = new Date(
          b.updatedAt ??
            b.createdAt ??
            0
        ).getTime();

        return bTime - aTime;
      }),
    [quizzes]
  );

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

    if (!form.course) {
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

        const selectedCourse =
          courses.find(
            (course) =>
              course.documentId ===
              form.course
          );

        setQuizzes((current) =>
          current.map((quiz) =>
            quiz.documentId ===
            editingDocumentId
              ? {
                  ...quiz,
                  ...updatedQuiz,
                  course:
                    updatedQuiz.course ??
                    selectedCourse ??
                    quiz.course ??
                    null,
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
              selectedCourse ??
              null,
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
      allowedRoles={["Instructor"]}
      title="Manage Quizzes"
      description="Create and manage quizzes across your own courses."
    >
      <div className="space-y-8">
        <div className="flex flex-wrap gap-3">
          <Link
            href="/instructor"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            ← Back to Dashboard
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
                ? "Update the quiz title or move it to another one of your courses."
                : "Create a quiz for one of your courses."}
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
                placeholder="JavaScript Basics Quiz"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-purple-500"
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
                    course:
                      event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-purple-500"
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

              <p className="mt-2 text-xs text-slate-500">
                You can only select courses assigned to you.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-purple-600 px-5 py-3 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
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

        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-slate-900">
              My Quizzes
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {sortedQuizzes.length}{" "}
              {sortedQuizzes.length === 1
                ? "quiz"
                : "quizzes"}{" "}
              across your courses.
            </p>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <p className="text-sm text-slate-500">
                Loading quizzes...
              </p>
            </div>
          ) : sortedQuizzes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
              <p className="font-semibold text-slate-900">
                No quizzes yet
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Create your first quiz above.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {sortedQuizzes.map((quiz) => (
                <article
                  key={quiz.documentId}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                      Quiz
                    </span>
                  </div>

                  <h3 className="mt-4 text-xl font-bold text-slate-900">
                    {quiz.title}
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Course:{" "}
                    <span className="font-semibold text-slate-700">
                      {quiz.course?.title ??
                        "Unknown course"}
                    </span>
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href={`/instructor/quizzes/${quiz.documentId}`}
                      className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      Manage Questions
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        startEdit(quiz)
                      }
                      className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void handleDelete(
                          quiz
                        )
                      }
                      disabled={
                        deletingId ===
                        quiz.documentId
                      }
                      className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId ===
                      quiz.documentId
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}