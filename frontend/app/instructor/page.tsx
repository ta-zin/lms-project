
"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";

import DashboardShell from "@/components/layout/DashboardShell";

import {
  Course,
  getCourses,
  getEnrolledLessons,
  getInstructorCourseProgress,
  Lesson,
} from "@/lib/courses";

import { ApiError } from "@/lib/api";

interface CourseProgressSummary {
  totalLessons: number;
  students: number;
  averageProgress: number;
}

export default function InstructorDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  const [progressSummary, setProgressSummary] =
    useState<CourseProgressSummary>({
      totalLessons: 0,
      students: 0,
      averageProgress: 0,
    });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const [courseData, lessonData] =
          await Promise.all([
            getCourses(),
            getEnrolledLessons(),
          ]);

        setCourses(courseData);

        /*
         * Instructor course list is already restricted by
         * the backend to the current instructor's courses.
         */
        const ownCourseIds = new Set(
          courseData.map(
            (course) => course.documentId
          )
        );

        const ownLessons = lessonData.filter(
          (lesson) =>
            lesson.course?.documentId &&
            ownCourseIds.has(
              lesson.course.documentId
            )
        );

        setLessons(ownLessons);

        /*
         * Get progress for every course owned by the instructor.
         *
         * The backend returns:
         * {
         *   course,
         *   totalLessons,
         *   students: [
         *     {
         *       student,
         *       totalLessons,
         *       completedLessons,
         *       percentage
         *     }
         *   ]
         * }
         */
        const progressResults =
          await Promise.all(
            courseData.map(async (course) => {
              try {
                const result =
                  await getInstructorCourseProgress(
                    course.documentId
                  );

                return result;
              } catch {
                return null;
              }
            })
          );

        let totalStudents = 0;
        let totalProgress = 0;
        let progressCount = 0;

        for (const result of progressResults) {
  if (!result) {
    continue;
  }

  const students = result.students;

  totalStudents += students.length;

  for (const student of students) {
    totalProgress += student.percentage ?? 0;

    progressCount += 1;
  }
}

        setProgressSummary({
          totalLessons: ownLessons.length,
          students: totalStudents,
          averageProgress:
            progressCount > 0
              ? Math.round(
                  totalProgress /
                    progressCount
                )
              : 0,
        });
      } catch (error) {
        if (error instanceof ApiError) {
          setError(error.message);
        } else if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(
            "Unable to load dashboard statistics."
          );
        }
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  const courseCount = useMemo(
    () => courses.length,
    [courses]
  );

  const lessonCount = useMemo(
    () => lessons.length,
    [lessons]
  );

  return (
    <DashboardShell
      allowedRoles={["Instructor"]}
      title="Instructor Dashboard"
      description="Manage your own courses, lessons, quizzes and student progress."
    >
      <div className="space-y-8">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* STATS */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          
        <Link
              href="/instructor/courses" className="block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
          >
          
            <p className="text-sm font-medium text-slate-500">
              My Courses
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {loading ? "—" : courseCount}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Courses created and managed by you.
            </p>
            <p className="mt-4 text-sm font-semibold text-blue-600">
              View My Courses →
            </p>
                </Link>





          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Lessons
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {loading ? "—" : lessonCount}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Total lessons across your courses.
            </p>
          </div>

          <Link href="/instructor/progress" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Student Progress
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {loading
                ? "—"
                : `${progressSummary.averageProgress}%`}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Average completion across students in
              your courses.
            </p>
            <p className="mt-4 text-sm font-semibold text-blue-600">
              View Progress →
            </p>
          </Link>
        </div>

        {/* ADDITIONAL SUMMARY */}
        <div className="grid gap-5 md:grid-cols-2">
          <Link
            href="/instructor/progress"
            className="block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
          >
            <p className="text-sm font-medium text-slate-500">
              Enrolled Students
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {loading
                ? "—"
                : progressSummary.students}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Unique students with recorded progress in
              your courses.
            </p>

            <p className="mt-4 text-sm font-semibold text-blue-600">
              View Enrolled Students →
            </p>
          </Link>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Average Completion
            </p>

            <div className="mt-3 flex items-end gap-3">
              <p className="text-3xl font-bold text-slate-900">
                {loading
                  ? "—"
                  : `${progressSummary.averageProgress}%`}
              </p>

              {!loading && (
                <div className="mb-2 h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all"
                    style={{
                      width: `${progressSummary.averageProgress}%`,
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
          <h2 className="text-lg font-bold text-slate-900">
            Course Management
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Manage your courses and lessons. Quiz
            management and detailed student progress
            will be connected next.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/instructor/courses"
              className="inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Manage My Courses
            </Link>

            <Link
              href="/instructor/courses"
              className="inline-flex rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Manage Lessons
            </Link>
            <Link
    href="/instructor/quizzes"
    className="inline-flex rounded-lg border border-purple-300 bg-white px-5 py-3 text-sm font-semibold text-purple-700 transition hover:bg-purple-50"
  >
    Manage Quizzes
  </Link>
          </div>
        </div>

        {/* COURSE OVERVIEW */}
        <section>
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">
              My Courses Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your currently managed courses.
            </p>
          </div>

          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <p className="text-sm text-slate-500">
                Loading courses...
              </p>
            </div>
          ) : courses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
              <p className="font-semibold text-slate-900">
                No courses yet
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Create your first course to get started.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {courses.map((course) => {
                const courseLessonCount =
                  lessons.filter(
                    (lesson) =>
                      lesson.course?.documentId ===
                      course.documentId
                  ).length;

                return (
                  <div
                    key={course.documentId}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <h3 className="text-lg font-bold text-slate-900">
                      {course.title}
                    </h3>

                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                      {course.description}
                    </p>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="text-sm text-slate-500">
                        {courseLessonCount}{" "}
                        {courseLessonCount === 1
                          ? "lesson"
                          : "lessons"}
                      </span>

                      <Link
                        href={`/instructor/courses/${course.documentId}`}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                      >
                        Manage →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}