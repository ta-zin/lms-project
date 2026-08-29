"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import DashboardShell from "@/components/layout/DashboardShell";

import {
  Course,
  CourseProgress,
  Lesson,
  getCourse,
  getCourseProgress,
  getEnrolledLessons,
} from "@/lib/courses";

import { ApiError } from "@/lib/api";

interface CourseDetailsClientProps {
  documentId: string;
}

export default function CourseDetailsClient({
  documentId,
}: CourseDetailsClientProps) {
  const [course, setCourse] =
    useState<Course | null>(null);

  const [lessons, setLessons] =
    useState<Lesson[]>([]);

  const [courseProgress, setCourseProgress] =
    useState<CourseProgress | null>(null);

  const [loadingCourse, setLoadingCourse] =
    useState(true);

  const [loadingProgress, setLoadingProgress] =
    useState(true);

  const [error, setError] =
    useState("");

  const [progressError, setProgressError] =
    useState("");

  useEffect(() => {
    async function loadCourse() {
      setLoadingCourse(true);
      setError("");

      try {
        const courseData =
          await getCourse(documentId);

        setCourse(courseData);

        /**
         * Load lessons separately.
         *
         * This is important because a progress
         * request must never prevent the actual
         * course/lesson content from rendering.
         */
        const enrolledLessons =
          await getEnrolledLessons();

        /**
         * Strapi relation data can be returned
         * in different shapes depending on the
         * response representation, so handle both
         * direct and nested relation objects.
         */
  const currentCourseLessons =
  enrolledLessons.filter((lesson) => {
    const course = lesson.course;

    if (!course) {
      return false;
    }

    return (
      course.documentId ===
      courseData.documentId
    );
  });
        setLessons(
          currentCourseLessons
        );
      } catch (error) {
        if (error instanceof ApiError) {
          setError(error.message);
        } else {
          setError(
            "Failed to load the course."
          );
        }
      } finally {
        setLoadingCourse(false);
      }
    }

    void loadCourse();
  }, [documentId]);

  useEffect(() => {
    async function loadProgress() {
      setLoadingProgress(true);
      setProgressError("");

      try {
        const progress =
          await getCourseProgress(
            documentId
          );

        setCourseProgress(progress);
      } catch (error) {
        if (error instanceof ApiError) {
          setProgressError(
            error.message
          );
        } else {
          setProgressError(
            "Unable to load course progress."
          );
        }
      } finally {
        setLoadingProgress(false);
      }
    }

    void loadProgress();
  }, [documentId]);

  function getLessonStatus(
    lesson: Lesson
  ): boolean {
    return Boolean(
      courseProgress?.progress.some(
        (item) => {
          const progressLesson =
            item.lesson;

          return (
            progressLesson?.documentId ===
              lesson.documentId &&
            item.completed === true
          );
        }
      )
    );
  }

  return (
    <DashboardShell
      allowedRoles={["Student"]}
      title="Course"
      description="Continue your learning journey."
    >
      {loadingCourse ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-500">
            Loading course...
          </p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-900">
            Unable to open course
          </h2>

          <p className="mt-2 text-sm leading-6 text-red-700">
            {error}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/my-courses"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Back to My Courses
            </Link>

            <Link
              href="/courses"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Explore Courses
            </Link>
          </div>
        </div>
      ) : !course ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8">
          <p className="text-slate-500">
            Course not found.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Course header */}
          <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  Enrolled Course
                </span>

                <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
                  {course.title}
                </h2>

                <p className="mt-4 text-base leading-7 text-slate-600">
                  {course.description}
                </p>

                {course.instructor?.username && (
                  <p className="mt-5 text-sm text-slate-500">
                    Instructor:{" "}
                    <span className="font-semibold text-slate-700">
                      {
                        course.instructor
                          .username
                      }
                    </span>
                  </p>
                )}
              </div>

              {/* Progress */}
              <div className="w-full shrink-0 rounded-xl bg-slate-50 p-5 lg:w-72">
                {loadingProgress ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700">
                        Course Progress
                      </span>

                      <span className="text-sm text-slate-400">
                        Loading...
                      </span>
                    </div>

                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full w-0 rounded-full bg-blue-600" />
                    </div>
                  </>
                ) : progressError ? (
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      Course Progress
                    </p>

                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      Progress is temporarily unavailable.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700">
                        Course Progress
                      </span>

                      <span className="text-lg font-bold text-blue-600">
                        {
                          courseProgress?.percentage ??
                          0
                        }%
                      </span>
                    </div>

                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all duration-500"
                        style={{
                          width: `${
                            courseProgress?.percentage ??
                            0
                          }%`,
                        }}
                      />
                    </div>

                    <p className="mt-3 text-xs text-slate-500">
                      {
                        courseProgress?.completedLessons ??
                        0
                      }{" "}
                      of{" "}
                      {
                        courseProgress?.totalLessons ??
                        lessons.length
                      }{" "}
                      lessons completed
                    </p>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Lessons */}
          <section>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Course Lessons
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  Open a lesson to study its content.
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
                {lessons.length}{" "}
                {lessons.length === 1
                  ? "lesson"
                  : "lessons"}
              </span>
            </div>

            {lessons.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
                <h3 className="font-semibold text-slate-900">
                  No lessons available
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  This course does not have any
                  published lessons yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {lessons.map(
                  (lesson, index) => {
                    const completed =
                      getLessonStatus(
                        lesson
                      );

                    return (
                      <Link
                        key={
                          lesson.documentId
                        }
                        href={`/lessons/${encodeURIComponent(
                          lesson.documentId
                        )}`}
                        className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                      >
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                            completed
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-700"
                          }`}
                        >
                          {completed
                            ? "✓"
                            : index + 1}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-slate-900">
                            {lesson.title}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {completed
                              ? "Completed"
                              : "Not completed"}
                          </p>
                        </div>

                        <span className="text-sm font-medium text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600">
                          Open →
                        </span>
                      </Link>
                    );
                  }
                )}
              </div>
            )}
          </section>
        </div>
      )}
    </DashboardShell>
  );
}