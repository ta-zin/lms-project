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
  Question,
  Quiz,
  createQuestion,
  deleteQuestion,
  getQuiz,
  getQuizQuestions,
  updateQuestion,
} from "@/lib/quizzes";

import { ApiError } from "@/lib/api";

interface QuestionFormState {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
}

const initialForm: QuestionFormState = {
  question: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctAnswer: "",
};

export default function AdminQuizQuestionsPage() {
  const params = useParams();

  const documentId =
    typeof params?.documentId === "string"
      ? params.documentId
      : "";

  const [quiz, setQuiz] =
    useState<Quiz | null>(null);

  const [questions, setQuestions] =
    useState<Question[]>([]);

  const [form, setForm] =
    useState<QuestionFormState>(
      initialForm
    );

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
    if (!documentId) {
      setError("Quiz documentId is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [
        quizData,
        questionsData,
      ] = await Promise.all([
        getQuiz(documentId),
        getQuizQuestions(documentId),
      ]);

      setQuiz(quizData);
      setQuestions(questionsData);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Failed to load quiz questions."
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
    setForm(initialForm);
    setEditingDocumentId(null);
  }

  function startEdit(question: Question) {
    setError("");
    setSuccess("");

    setEditingDocumentId(
      question.documentId
    );

    setForm({
      question:
        question.question ?? "",
      optionA:
        question.optionA ?? "",
      optionB:
        question.optionB ?? "",
      optionC:
        question.optionC ?? "",
      optionD:
        question.optionD ?? "",
      correctAnswer:
        question.correctAnswer ?? "",
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

    if (!documentId) {
      setError(
        "Quiz documentId is missing."
      );
      return;
    }

    const cleanQuestion =
      form.question.trim();

    const cleanOptionA =
      form.optionA.trim();

    const cleanOptionB =
      form.optionB.trim();

    const cleanOptionC =
      form.optionC.trim();

    const cleanOptionD =
      form.optionD.trim();

    const cleanCorrectAnswer =
      form.correctAnswer.trim();

    if (!cleanQuestion) {
      setError(
        "Question is required."
      );
      return;
    }

    if (!cleanOptionA) {
      setError(
        "Option A is required."
      );
      return;
    }

    if (!cleanOptionB) {
      setError(
        "Option B is required."
      );
      return;
    }

    if (!cleanOptionC) {
      setError(
        "Option C is required."
      );
      return;
    }

    if (!cleanOptionD) {
      setError(
        "Option D is required."
      );
      return;
    }

    if (
      !["A", "B", "C", "D"].includes(
        cleanCorrectAnswer.toUpperCase()
      )
    ) {
      setError(
        "Correct answer must be A, B, C, or D."
      );
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        question: cleanQuestion,
        optionA: cleanOptionA,
        optionB: cleanOptionB,
        optionC: cleanOptionC,
        optionD: cleanOptionD,
        correctAnswer:
          cleanCorrectAnswer.toUpperCase(),
      };

      if (editingDocumentId) {
        const updatedQuestion =
          await updateQuestion(
            editingDocumentId,
            payload
          );

        setQuestions((current) =>
          current.map((item) =>
            item.documentId ===
            editingDocumentId
              ? {
                  ...item,
                  ...updatedQuestion,
                }
              : item
          )
        );

        setSuccess(
          "Question updated successfully."
        );
      } else {
        const createdQuestion =
          await createQuestion({
            ...payload,
            quiz: documentId,
          });

        setQuestions((current) => [
          ...current,
          {
            ...createdQuestion,
            quiz:
              createdQuestion.quiz ??
              quiz,
          },
        ]);

        setSuccess(
          "Question created successfully."
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
          "Failed to save question."
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(
    question: Question
  ) {
    const confirmed =
      window.confirm(
        "Delete this question?"
      );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    setDeletingId(
      question.documentId
    );

    try {
      await deleteQuestion(
        question.documentId
      );

      setQuestions((current) =>
        current.filter(
          (item) =>
            item.documentId !==
            question.documentId
        )
      );

      if (
        editingDocumentId ===
        question.documentId
      ) {
        resetForm();
      }

      setSuccess(
        "Question deleted successfully."
      );
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Failed to delete question."
        );
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <DashboardShell
      allowedRoles={["Admin"]}
      title={
        quiz
          ? `Manage Questions — ${quiz.title}`
          : "Manage Questions"
      }
      description="Create, edit, and delete MCQ questions for this quiz."
    >
      <div className="space-y-8">
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/quizzes"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            ← Back to Quizzes
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
              Loading questions...
            </p>
          </div>
        ) : (
          <>
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                  {editingDocumentId
                    ? "Edit Question"
                    : "Add Question"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add an MCQ question with four options and the correct answer.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div>
                  <label
                    htmlFor="question"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Question
                  </label>

                  <textarea
                    id="question"
                    rows={4}
                    value={form.question}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        question:
                          event.target.value,
                      }))
                    }
                    placeholder="What is JavaScript?"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="optionA"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Option A
                    </label>

                    <input
                      id="optionA"
                      type="text"
                      value={form.optionA}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          optionA:
                            event.target.value,
                        }))
                      }
                      placeholder="Programming language"
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="optionB"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Option B
                    </label>

                    <input
                      id="optionB"
                      type="text"
                      value={form.optionB}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          optionB:
                            event.target.value,
                        }))
                      }
                      placeholder="Database"
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="optionC"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Option C
                    </label>

                    <input
                      id="optionC"
                      type="text"
                      value={form.optionC}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          optionC:
                            event.target.value,
                        }))
                      }
                      placeholder="Operating system"
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="optionD"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Option D
                    </label>

                    <input
                      id="optionD"
                      type="text"
                      value={form.optionD}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          optionD:
                            event.target.value,
                        }))
                      }
                      placeholder="Browser"
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="correctAnswer"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Correct Answer
                  </label>

                  <select
                    id="correctAnswer"
                    value={form.correctAnswer}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        correctAnswer:
                          event.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="">
                      Select correct answer
                    </option>
                    <option value="A">
                      A
                    </option>
                    <option value="B">
                      B
                    </option>
                    <option value="C">
                      C
                    </option>
                    <option value="D">
                      D
                    </option>
                  </select>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting
                      ? "Saving..."
                      : editingDocumentId
                        ? "Update Question"
                        : "Add Question"}
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
                  Questions
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {questions.length}{" "}
                  {questions.length === 1
                    ? "question"
                    : "questions"}{" "}
                  in this quiz.
                </p>
              </div>

              {questions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
                  <p className="font-semibold text-slate-900">
                    No questions yet
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    Add the first question above.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {questions.map(
                    (question, index) => (
                      <article
                        key={
                          question.documentId
                        }
                        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-500">
                              Question {index + 1}
                            </p>

                            <h3 className="mt-2 text-lg font-bold text-slate-900">
                              {
                                question.question
                              }
                            </h3>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                startEdit(
                                  question
                                )
                              }
                              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                void handleDelete(
                                  question
                                )
                              }
                              disabled={
                                deletingId ===
                                question.documentId
                              }
                              className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deletingId ===
                              question.documentId
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </div>

                        <div className="mt-5 grid gap-3 md:grid-cols-2">
                          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                            <span className="font-bold">
                              A.
                            </span>{" "}
                            {
                              question.optionA
                            }
                          </div>

                          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                            <span className="font-bold">
                              B.
                            </span>{" "}
                            {
                              question.optionB
                            }
                          </div>

                          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                            <span className="font-bold">
                              C.
                            </span>{" "}
                            {
                              question.optionC
                            }
                          </div>

                          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                            <span className="font-bold">
                              D.
                            </span>{" "}
                            {
                              question.optionD
                            }
                          </div>
                        </div>

                        <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                          <span className="font-semibold text-emerald-800">
                            Correct Answer:
                          </span>{" "}
                          <span className="font-bold text-emerald-900">
                            {
                              question.correctAnswer
                            }
                          </span>
                        </div>
                      </article>
                    )
                  )}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </DashboardShell>
  );
}