"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import DashboardShell from "@/components/layout/DashboardShell";

import {
  Course,
  Lesson,
  getCourse,
  getCourseLessons,
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

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadCourse() {
      setLoading(true);
      setError("");

      try {
        const courseData =
          await getCourse(documentId);

        const lessonData =
          await getCourseLessons(
            documentId
          );

        setCourse(courseData);
        setLessons(lessonData);
      } catch (error) {
        if (error instanceof ApiError) {
          if (error.status === 403) {
            setError(
              "You must enroll in this course before you can view its content."
            );
          } else {
            setError(error.message);
          }
        } else {
          setError(
            "Failed to load the course."
          );
        }
      } finally {
        setLoading(false);
      }
    }

    void loadCourse();
  }, [documentId]);

  return (
    <DashboardShell
      allowedRoles={["Student"]}
      title="Course"
      description="View the lessons included in your enrolled course."
    >
      {loading ? (
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
              href="/courses"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Back to Courses
            </Link>

            <Link
              href="/my-courses"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              My Courses
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
          <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              Enrolled Course
            </span>

            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
              {course.title}
            </h2>

            <p className="mt-4 max-w-3xl leading-7 text-slate-600">
              {course.description}
            </p>

            {course.instructor?.username && (
              <p className="mt-5 text-sm text-slate-500">
                Instructor:{" "}
                <span className="font-semibold text-slate-700">
                  {course.instructor.username}
                </span>
              </p>
            )}
          </section>

          <section>
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-slate-900">
                Lessons
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Complete the lessons in order.
              </p>
            </div>

            {lessons.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-8">
                <p className="text-slate-500">
                  No lessons have been added to this
                  course yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {lessons.map(
                  (lesson, index) => (
                    <Link
                      key={lesson.documentId}
                      href={`/lessons/${encodeURIComponent(
                        lesson.documentId
                      )}`}
                      className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 transition hover:border-blue-200 hover:bg-blue-50/30"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-700">
                        {index + 1}
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900">
                          {lesson.title}
                        </h3>

                        {lesson.videoUrl && (
                          <p className="mt-1 text-xs text-slate-500">
                            Video lesson
                          </p>
                        )}
                      </div>

                      <span className="ml-auto text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600">
                        →
                      </span>
                    </Link>
                  )
                )}
              </div>
            )}
          </section>
        </div>
      )}
    </DashboardShell>
  );
}