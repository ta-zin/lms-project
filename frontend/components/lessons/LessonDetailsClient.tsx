"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import DashboardShell from "@/components/layout/DashboardShell";

import {
  CourseProgress,
  Lesson,
  completeLesson,
  getCourseProgress,
  getLesson,
} from "@/lib/courses";

import { ApiError } from "@/lib/api";

interface LessonDetailsClientProps {
  documentId: string;
}

export default function LessonDetailsClient({
  documentId,
}: LessonDetailsClientProps) {
  const [lesson, setLesson] =
    useState<Lesson | null>(null);

  const [courseProgress, setCourseProgress] =
    useState<CourseProgress | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [completing, setCompleting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  useEffect(() => {
    async function loadLesson() {
      setLoading(true);
      setError("");

      try {
        const lessonData =
          await getLesson(documentId);

        setLesson(lessonData);

        const courseDocumentId =
          lessonData.course?.documentId;

        if (!courseDocumentId) {
          throw new Error(
            "This lesson is not associated with a course."
          );
        }

        const progress =
          await getCourseProgress(
            courseDocumentId
          );

        setCourseProgress(progress);
      } catch (error) {
        if (error instanceof ApiError) {
          setError(error.message);
        } else if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(
            "Failed to load the lesson."
          );
        }
      } finally {
        setLoading(false);
      }
    }

    void loadLesson();
  }, [documentId]);

  const currentProgress =
    courseProgress?.progress.find(
      (item) =>
        item.lesson?.documentId ===
        documentId
    ) ?? null;

  const completed =
    currentProgress?.completed === true;

  async function handleComplete() {
    if (
      completed ||
      completing ||
      !lesson
    ) {
      return;
    }

    setCompleting(true);
    setError("");
    setSuccessMessage("");

    try {
      await completeLesson(
        lesson.documentId
      );

      /*
       * Re-fetch from backend so both:
       * - lesson completion state
       * - course percentage
       *
       * come from the database.
       */
      const courseDocumentId =
        lesson.course?.documentId;

      if (!courseDocumentId) {
        throw new Error(
          "Course information is missing."
        );
      }

      const updatedProgress =
        await getCourseProgress(
          courseDocumentId
        );

      setCourseProgress(
        updatedProgress
      );

      setSuccessMessage(
        "Lesson marked as complete."
      );
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Failed to complete the lesson."
        );
      }
    } finally {
      setCompleting(false);
    }
  }

  if (loading) {
    return (
      <DashboardShell
        allowedRoles={["Student"]}
        title="Lesson"
        description="Study the lesson and track your progress."
      >
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-500">
            Loading lesson...
          </p>
        </div>
      </DashboardShell>
    );
  }

  if (error && !lesson) {
    return (
      <DashboardShell
        allowedRoles={["Student"]}
        title="Lesson"
        description="Study the lesson and track your progress."
      >
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-900">
            Unable to open lesson
          </h2>

          <p className="mt-2 text-sm text-red-700">
            {error}
          </p>

          <Link
            href="/my-courses"
            className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Back to My Courses
          </Link>
        </div>
      </DashboardShell>
    );
  }

  if (!lesson) {
    return (
      <DashboardShell
        allowedRoles={["Student"]}
        title="Lesson"
        description="Study the lesson and track your progress."
      >
        <div className="rounded-xl border border-slate-200 bg-white p-8">
          <p className="text-slate-500">
            Lesson not found.
          </p>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      allowedRoles={["Student"]}
      title="Lesson"
      description="Study the lesson and track your progress."
    >
      <div className="mx-auto max-w-4xl space-y-6">
        <Link
          href={
            lesson.course?.documentId
              ? `/courses/${encodeURIComponent(
                  lesson.course.documentId
                )}`
              : "/my-courses"
          }
          className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          ← Back to Course
        </Link>

        <article className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              Lesson
            </span>

            {completed && (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                ✓ Completed
              </span>
            )}
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
            {lesson.title}
          </h1>

          {lesson.course?.title && (
            <p className="mt-2 text-sm text-slate-500">
              Course:{" "}
              <span className="font-semibold text-slate-700">
                {lesson.course.title}
              </span>
            </p>
          )}

          {lesson.content && (
            <div className="mt-8 whitespace-pre-wrap text-base leading-8 text-slate-700">
              {lesson.content}
            </div>
          )}

          {lesson.videoUrl && (
            <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="font-semibold text-slate-900">
                Video Lesson
              </h2>

              <a
                href={lesson.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 block break-all text-sm text-blue-600 hover:underline"
              >
                {lesson.videoUrl}
              </a>
            </div>
          )}

          {!lesson.content &&
            !lesson.videoUrl && (
              <div className="mt-8 rounded-xl bg-slate-50 p-6 text-sm text-slate-500">
                No lesson content has been added.
              </div>
            )}

          <div className="mt-10 border-t border-slate-200 pt-6">
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {successMessage}
              </div>
            )}

            <div className="mb-5 rounded-xl bg-slate-50 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">
                  Course Progress
                </span>

                <span className="text-lg font-bold text-blue-600">
                  {courseProgress?.percentage ?? 0}%
                </span>
              </div>

              <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-500"
                  style={{
                    width: `${
                      courseProgress?.percentage ?? 0
                    }%`,
                  }}
                />
              </div>

              <p className="mt-2 text-xs text-slate-500">
                {courseProgress?.completedLessons ?? 0}{" "}
                of{" "}
                {courseProgress?.totalLessons ?? 0}{" "}
                lessons completed
              </p>
            </div>

            <button
              type="button"
              disabled={
                completed ||
                completing
              }
              onClick={handleComplete}
              className={`w-full rounded-lg px-5 py-3 font-semibold transition ${
                completed
                  ? "cursor-default bg-emerald-100 text-emerald-700"
                  : "bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              }`}
            >
              {completed
                ? "✓ Lesson Completed"
                : completing
                  ? "Saving..."
                  : "Mark as Complete"}
            </button>
          </div>
        </article>
      </div>
    </DashboardShell>
  );
}