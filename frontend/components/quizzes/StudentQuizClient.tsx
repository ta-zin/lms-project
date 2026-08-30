"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import DashboardShell from "@/components/layout/DashboardShell";

import {
  Question,
  Quiz,
  getQuiz,
  getQuizQuestions,
  submitQuizResult,
} from "@/lib/quizzes";

import { ApiError } from "@/lib/api";

interface StudentQuizClientProps {
  documentId: string;
}

type AnswerMap = Record<string, string>;

interface QuizResultState {
  score: number;
  total: number;
  percentage: number;
}

export default function StudentQuizClient({
  documentId,
}: StudentQuizClientProps) {
  const [quiz, setQuiz] =
    useState<Quiz | null>(null);

  const [questions, setQuestions] =
    useState<Question[]>([]);

  const [answers, setAnswers] =
    useState<AnswerMap>({});

  const [result, setResult] =
    useState<QuizResultState | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadQuiz() {
      setLoading(true);
      setError("");

      try {
        const quizData =
          await getQuiz(documentId);

        const questionData =
          await getQuizQuestions(
            documentId
          );

        setQuiz(quizData);
        setQuestions(questionData);
      } catch (error) {
        if (error instanceof ApiError) {
          setError(error.message);
        } else {
          setError(
            "Failed to load quiz."
          );
        }
      } finally {
        setLoading(false);
      }
    }

    void loadQuiz();
  }, [documentId]);

  function handleAnswer(
    questionDocumentId: string,
    answer: string
  ) {
    setAnswers((current) => ({
      ...current,
      [questionDocumentId]:
        answer,
    }));
  }

  async function handleSubmit() {
    if (
      submitting ||
      !quiz
    ) {
      return;
    }

    setError("");

    const unanswered =
      questions.filter(
        (question) =>
          !answers[
            question.documentId
          ]
      );

    if (unanswered.length > 0) {
      setError(
        "Please answer every question before submitting."
      );
      return;
    }

    setSubmitting(true);

    try {
      let score = 0;

      questions.forEach(
        (question) => {
          const selected =
            answers[
              question.documentId
            ];

          if (
            question.correctAnswer &&
            selected
              .trim()
              .toUpperCase() ===
              question.correctAnswer
                .trim()
                .toUpperCase()
          ) {
            score += 1;
          }
        }
      );

      await submitQuizResult(
        quiz.documentId,
        score
      );

      setResult({
        score,
        total: questions.length,
        percentage:
          questions.length > 0
            ? Math.round(
                (score /
                  questions.length) *
                  100
              )
            : 0,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError(
          "Failed to submit quiz."
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleRetry() {
    setAnswers({});
    setResult(null);
    setError("");
  }

  if (loading) {
    return (
      <DashboardShell
        allowedRoles={["Student"]}
        title="Quiz"
        description="Test your knowledge."
      >
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-500">
            Loading quiz...
          </p>
        </div>
      </DashboardShell>
    );
  }

  if (error && !quiz) {
    return (
      <DashboardShell
        allowedRoles={["Student"]}
        title="Quiz"
        description="Test your knowledge."
      >
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-900">
            Unable to open quiz
          </h2>

          <p className="mt-2 text-sm text-red-700">
            {error}
          </p>

          <Link
            href="/my-courses"
            className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Back to My Courses
          </Link>
        </div>
      </DashboardShell>
    );
  }

  if (!quiz) {
    return null;
  }

  if (result) {
    return (
      <DashboardShell
        allowedRoles={["Student"]}
        title="Quiz Result"
        description="Your quiz result has been saved."
      >
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue-50">
            <span className="text-2xl font-bold text-blue-600">
              {result.percentage}%
            </span>
          </div>

          <h2 className="mt-6 text-2xl font-bold text-slate-900">
            {quiz.title}
          </h2>

          <p className="mt-3 text-slate-600">
            You scored{" "}
            <span className="font-bold text-slate-900">
              {result.score}
            </span>{" "}
            out of{" "}
            <span className="font-bold text-slate-900">
              {result.total}
            </span>
            .
          </p>

          <div className="mt-8 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600"
              style={{
                width: `${result.percentage}%`,
              }}
            />
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={handleRetry}
              className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Retry Quiz
            </button>

            <Link
              href="/my-courses"
              className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back to My Courses
            </Link>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      allowedRoles={["Student"]}
      title={quiz.title}
      description="Choose one answer for each question."
    >
      <div className="mx-auto max-w-3xl">
        {questions.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-500">
              This quiz has no questions yet.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-5">
              <p className="text-sm font-medium text-blue-800">
                {questions.length}{" "}
                {questions.length === 1
                  ? "question"
                  : "questions"}
              </p>
            </div>

            <div className="space-y-5">
              {questions.map(
                (question, index) => {
                  const options = [
                    {
                      key: "A",
                      value:
                        question.optionA,
                    },
                    {
                      key: "B",
                      value:
                        question.optionB,
                    },
                    {
                      key: "C",
                      value:
                        question.optionC,
                    },
                    {
                      key: "D",
                      value:
                        question.optionD,
                    },
                  ];

                  return (
                    <section
                      key={
                        question.documentId
                      }
                      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                    >
                      <h2 className="text-lg font-semibold leading-7 text-slate-900">
                        {index + 1}.{" "}
                        {question.question}
                      </h2>

                      <div className="mt-5 space-y-3">
                        {options.map(
                          (option) => {
                            const selected =
                              answers[
                                question.documentId
                              ] ===
                              option.key;

                            return (
                              <label
                                key={
                                  option.key
                                }
                                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                                  selected
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-slate-200 hover:bg-slate-50"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`question-${question.documentId}`}
                                  value={
                                    option.key
                                  }
                                  checked={
                                    selected
                                  }
                                  onChange={() =>
                                    handleAnswer(
                                      question.documentId,
                                      option.key
                                    )
                                  }
                                  className="mt-1"
                                />

                                <span className="text-sm leading-6 text-slate-700">
                                  <span className="mr-2 font-bold text-slate-900">
                                    {
                                      option.key
                                    }
                                    .
                                  </span>

                                  {
                                    option.value
                                  }
                                </span>
                              </label>
                            );
                          }
                        )}
                      </div>
                    </section>
                  );
                }
              )}
            </div>

            {error && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="mt-6 w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Submitting..."
                : "Submit Quiz"}
            </button>
          </>
        )}
      </div>
    </DashboardShell>
  );
}