
"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import DashboardShell from "@/components/layout/DashboardShell";

import {
  Course,
  getCourses,
  getCourseProgress,
} from "@/lib/courses";

import { ApiError } from "@/lib/api";

interface StudentProgress {
  student?: {
    id: number;
    documentId?: string;
    username?: string;
    email?: string;
  } | null;

  totalLessons: number;
  completedLessons: number;
  percentage: number;
}

interface CourseProgressData {
  course: Course;
  totalLessons: number;
  students: StudentProgress[];
}

export default function InstructorProgressPage() {
  const [courses, setCourses] = useState<
    CourseProgressData[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadProgress() {
      setLoading(true);
      setError("");

      try {
        const courseList =
          await getCourses();

        const results =
          await Promise.all(
            courseList.map(async (course) => {
              try {
                const result =
                  await getCourseProgress(
                    course.documentId
                  );

                /*
                 * Instructor response:
                 *
                 * {
                 *   course,
                 *   totalLessons,
                 *   students: [...]
                 * }
                 */
                if (
                  "students" in result
                ) {
                  return {
                    course,
                    totalLessons:
                      result.totalLessons,
                    students:
                      result.students.map(
                        (item: any) => ({
                          student:
                            item.student,
                          totalLessons:
                            item.totalLessons,
                          completedLessons:
                            item.completedLessons,
                          percentage:
                            item.percentage,
                        })
                      ),
                  };
                }

                return {
                  course,
                  totalLessons:
                    result.totalLessons,
                  students: [],
                };
              } catch {
                return {
                  course,
                  totalLessons: 0,
                  students: [],
                };
              }
            })
          );

        setCourses(results);
      } catch (error) {
        if (error instanceof ApiError) {
          setError(error.message);
        } else if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(
            "Failed to load student progress."
          );
        }
      } finally {
        setLoading(false);
      }
    }

    void loadProgress();
  }, []);

  return (
    <DashboardShell
      allowedRoles={["Instructor"]}
      title="Enrolled Students"
      description="View students enrolled in your courses and their lesson progress."
    >
      <div className="space-y-8">
        <Link
          href="/instructor"
          className="inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          ← Back to Dashboard
        </Link>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-slate-500">
              Loading enrolled students...
            </p>
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              No courses found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Create a course first.
            </p>
          </div>
        ) : (
          courses.map((courseData) => (
            <section
              key={
                courseData.course.documentId
              }
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="border-b border-slate-200 p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {courseData.course.title}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {courseData.totalLessons}{" "}
                      {courseData.totalLessons ===
                      1
                        ? "lesson"
                        : "lessons"}
                    </p>
                  </div>

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                    {courseData.students.length}{" "}
                    {courseData.students.length ===
                    1
                      ? "student"
                      : "students"}
                  </span>
                </div>
              </div>

              {courseData.students.length ===
              0 ? (
                <div className="p-8 text-center">
                  <p className="font-semibold text-slate-900">
                    No students with progress yet
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    Students will appear here once
                    progress data is available.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-left">
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                          Student
                        </th>

                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                          Email
                        </th>

                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                          Completed
                        </th>

                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                          Progress
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {courseData.students.map(
                        (studentData) => {
                          const student =
                            studentData.student;

                          return (
                            <tr
                              key={
                                student?.id
                              }
                              className="border-b border-slate-100 last:border-0"
                            >
                              <td className="px-6 py-5">
                                <p className="font-semibold text-slate-900">
                                  {student?.username ||
                                    "Unknown Student"}
                                </p>
                              </td>

                              <td className="px-6 py-5 text-sm text-slate-600">
                                {student?.email ||
                                  "—"}
                              </td>

                              <td className="px-6 py-5 text-sm font-medium text-slate-700">
                                {
                                  studentData.completedLessons
                                }{" "}
                                /{" "}
                                {
                                  studentData.totalLessons
                                }
                              </td>

                              <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                  <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                      className="h-full rounded-full bg-blue-600"
                                      style={{
                                        width: `${studentData.percentage}%`,
                                      }}
                                    />
                                  </div>

                                  <span className="text-sm font-bold text-slate-900">
                                    {
                                      studentData.percentage
                                    }
                                    %
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))
        )}
      </div>
    </DashboardShell>
  );
}