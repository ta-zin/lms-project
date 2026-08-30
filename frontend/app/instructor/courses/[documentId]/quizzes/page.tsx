"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import { useParams } from "next/navigation";

import DashboardShell from "@/components/layout/DashboardShell";

import {
  Course,
  getCourse,
} from "@/lib/courses";

import {
  Quiz,
  createQuiz,
  deleteQuiz,
  getQuizzes,
  updateQuiz,
} from "@/lib/quizzes";

import { ApiError } from "@/lib/api";

export default function InstructorCourseQuizzesPage() {
  const params = useParams();

  const documentId =
    typeof params?.documentId === "string"
      ? params.documentId
      : "";

  const [course, setCourse] =
    useState<Course | null>(null);

  const [quizzes, setQuizzes] =
    useState<Quiz[]>([]);

  const [title, setTitle] =
    useState("");

  const [editingQuizId, setEditingQuizId] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  async function loadData() {
    if (!documentId) {
      setError("Course ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [
        courseData,
        allQuizzes,
      ] = await Promise.all([
        getCourse(documentId),
        getQuizzes(),
      ]);

      setCourse(courseData);

      const courseQuizzes =
        allQuizzes.filter(
          (quiz) =>
            quiz.course?.documentId ===
            documentId
        );

      setQuizzes(courseQuizzes);
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
  }, [documentId]);

  function resetForm() {
    setTitle("");
    setEditingQuizId(null);
  }

  function startEdit(quiz: Quiz) {
    setEditingQuizId(
      quiz.documentId
    );

    setTitle(quiz.title);
    setError("");
    setSuccess("");

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
      title.trim();

    if (!cleanTitle) {
      setError(
        "Quiz title is required."
      );
      return;
    }

    if (!documentId) {
      setError(
        "Course ID is missing."
      );
      return;
    }

    setSubmitting(true);

    try {
      if (editingQuizId) {
        const updatedQuiz =
          await updateQuiz(
            editingQuizId,
            {
              title: cleanTitle,
            }
          );

        setQuizzes((current) =>
          current.map((quiz) =>
            quiz.documentId ===
            editingQuizId
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
            course: documentId,
          });

        setQuizzes((current) => [
          ...current,
          {
            ...createdQuiz,
            course:
              createdQuiz.course ??
              course,
          },
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
        editingQuizId ===
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
    }
  }

  return (
    <DashboardShell
      allowedRoles={["Instructor"]}
      title={
        course
          ? `Quizzes — ${course.title}`
          : "Course Quizzes"
      }
      description="Create and manage quizzes for this course."
    >
      <div className="space-y-8">
        <div className="flex flex-wrap gap-3">
          <Link
            href={
              documentId
                ? `/instructor/courses/${documentId}`
                : "/instructor/courses"
            }
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            ← Back to Course
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

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-slate-500">
              Loading quizzes...
            </p>
          </div>
        ) : (
          <>
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                  {editingQuizId
                    ? "Edit Quiz"
                    : "Create Quiz"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Create an MCQ quiz for this course.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4 sm:flex-row sm:items-end"
              >
                <div className="flex-1">
                  <label
                    htmlFor="quiz-title"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Quiz Title
                  </label>

                  <input
                    id="quiz-title"
                    type="text"
                    value={title}
                    onChange={(event) =>
                      setTitle(
                        event.target.value
                      )
                    }
                    placeholder="JavaScript Basics Quiz"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-purple-600 px-5 py-3 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting
                    ? "Saving..."
                    : editingQuizId
                    ? "Update Quiz"
                    : "Create Quiz"}
                </button>

                {editingQuizId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                )}
              </form>
            </section>

            <section>
              <div className="mb-5">
                <h2 className="text-2xl font-bold text-slate-900">
                  Quizzes
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {quizzes.length}{" "}
                  {quizzes.length === 1
                    ? "quiz"
                    : "quizzes"}{" "}
                  in this course.
                </p>
              </div>

              {quizzes.length === 0 ? (
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
                  {quizzes.map((quiz) => (
                    <article
                      key={
                        quiz.documentId
                      }
                      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                    >
                      <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                        Quiz
                      </span>

                      <h3 className="mt-4 text-xl font-bold text-slate-900">
                        {quiz.title}
                      </h3>

                      <div className="mt-6 flex flex-wrap gap-3">
                        <Link
                          href={`/instructor/quizzes/${quiz.documentId}`}
                          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                          Questions
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            startEdit(
                              quiz
                            )
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
                          className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </DashboardShell>
  );
}