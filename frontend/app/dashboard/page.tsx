"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import DashboardShell from "@/components/layout/DashboardShell";

import {
  CourseProgress,
  getCourseProgress,
  getMyEnrollments,
} from "@/lib/courses";

import { ApiError } from "@/lib/api";


interface DashboardStats {
  enrolledCourses: number;
  completedLessons: number;
  averageProgress: number;
}


function isCourseProgress(
  progress: unknown
): progress is CourseProgress {
  return (
    typeof progress === "object" &&
    progress !== null &&
    "percentage" in progress &&
    "completedLessons" in progress &&
    "progress" in progress
  );
}


export default function StudentDashboard() {
  const [stats, setStats] =
    useState<DashboardStats>({
      enrolledCourses: 0,
      completedLessons: 0,
      averageProgress: 0,
    });


  const [loading, setLoading] =
    useState(true);


  const [error, setError] =
    useState("");


  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const enrollments =
          await getMyEnrollments();


        const validEnrollments =
          enrollments.filter(
            (enrollment) =>
              Boolean(
                enrollment.course
                  ?.documentId
              )
          );


        const progressResponses =
          await Promise.all(
            validEnrollments.map(
              (enrollment) =>
                getCourseProgress(
                  enrollment.course!.documentId
                )
            )
          );


        const progressResults =
          progressResponses.filter(
            isCourseProgress
          );


        const completedLessons =
          progressResults.reduce(
            (total, progress) =>
              total +
              progress.completedLessons,
            0
          );


        const averageProgress =
          progressResults.length > 0
            ? Math.round(
                progressResults.reduce(
                  (total, progress) =>
                    total +
                    progress.percentage,
                  0
                ) /
                  progressResults.length
              )
            : 0;


        setStats({
          enrolledCourses:
            validEnrollments.length,

          completedLessons,

          averageProgress,
        });


      } catch (error) {

        if (error instanceof ApiError) {
          setError(
            error.message
          );

        } else if (
          error instanceof Error
        ) {
          setError(
            error.message
          );

        } else {
          setError(
            "Failed to load dashboard statistics."
          );
        }

      } finally {
        setLoading(false);
      }
    }


    void loadDashboard();

  }, []);


  return (
    <DashboardShell
      allowedRoles={["Student"]}
      title="Student Dashboard"
      description="Continue learning and track your progress."
    >

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}


      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <p className="text-sm font-medium text-slate-500">
            Enrolled Courses
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {loading
              ? "..."
              : stats.enrolledCourses}
          </p>

          <Link
            href="/my-courses"
            className="mt-4 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            View my courses →
          </Link>

        </div>


        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <p className="text-sm font-medium text-slate-500">
            Completed Lessons
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {loading
              ? "..."
              : stats.completedLessons}
          </p>

          <p className="mt-4 text-sm text-slate-500">
            Lessons completed across your enrolled courses.
          </p>

        </div>


        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <p className="text-sm font-medium text-slate-500">
            Average Progress
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {loading
              ? "..."
              : `${stats.averageProgress}%`}
          </p>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">

            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
              style={{
                width: `${stats.averageProgress}%`,
              }}
            />

          </div>

        </div>

      </div>


      <div className="mt-8 grid gap-5 md:grid-cols-2">

        <Link
          href="/courses"
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-200 hover:shadow-md"
        >

          <h2 className="text-lg font-bold text-slate-900">
            Explore Courses
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Browse available courses and enroll in something new.
          </p>

          <span className="mt-4 inline-block text-sm font-semibold text-blue-600">
            Browse courses →
          </span>

        </Link>


        <Link
          href="/blog"
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-200 hover:shadow-md"
        >

          <h2 className="text-lg font-bold text-slate-900">
            Read the Blog
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Read published articles from the LMS content team.
          </p>

          <span className="mt-4 inline-block text-sm font-semibold text-blue-600">
            Open blog →
          </span>

        </Link>

      </div>

    </DashboardShell>
  );
}