"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import DashboardShell from "@/components/layout/DashboardShell";

import {
  Course,
  Enrollment,
  getMyEnrollments,
} from "@/lib/courses";

import { ApiError } from "@/lib/api";

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] =
    useState<Enrollment[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function load() {
      try {
        const data =
          await getMyEnrollments();

        setEnrollments(data);
      } catch (error) {
        if (error instanceof ApiError) {
          setError(error.message);
        } else {
          setError(
            "Failed to load your courses."
          );
        }
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const courses = enrollments
    .map(
      (enrollment) =>
        enrollment.course
    )
    .filter(
      (course): course is Course =>
        Boolean(course)
    );

  return (
    <DashboardShell
      allowedRoles={["Student"]}
      title="My Courses"
      description="Continue your enrolled courses and keep learning."
    >
      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-500">
            Loading your courses...
          </p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-700">
            {error}
          </p>
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <h2 className="text-xl font-bold text-slate-900">
            You have not enrolled in any course
          </h2>

          <p className="mt-2 text-slate-600">
            Explore the course library and start
            learning.
          </p>

          <Link
            href="/courses"
            className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Explore Courses
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <article
              key={course.documentId}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Enrolled
              </span>

              <h2 className="mt-4 text-xl font-bold text-slate-900">
                {course.title}
              </h2>

              <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-600">
                {course.description}
              </p>

              <Link
                href={`/courses/${encodeURIComponent(
                  course.documentId
                )}`}
                className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Continue Learning
              </Link>
            </article>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}