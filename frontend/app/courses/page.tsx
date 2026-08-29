"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import DashboardShell from "@/components/layout/DashboardShell";
import CourseCard from "@/components/courses/CourseCard";

import {
  Course,
  enrollInCourse,
  getCourses,
  getMyEnrollments,
} from "@/lib/courses";

import { ApiError } from "@/lib/api";

export default function CoursesPage() {
  const [courses, setCourses] =
    useState<Course[]>([]);

  const [enrolledCourseIds, setEnrolledCourseIds] =
    useState<Set<string>>(new Set());

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [enrollingCourseId, setEnrollingCourseId] =
    useState<string | null>(null);

  async function loadCourses() {
    setLoading(true);
    setError("");

    try {
      const [
        courseData,
        enrollmentData,
      ] = await Promise.all([
        getCourses(),
        getMyEnrollments(),
      ]);

      const enrolledIds = new Set(
        enrollmentData
          .map(
            (enrollment) =>
              enrollment.course?.documentId
          )
          .filter(
            (
              documentId
            ): documentId is string =>
              Boolean(documentId)
          )
      );

      setCourses(courseData);
      setEnrolledCourseIds(enrolledIds);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          setError(
            "Please sign in to browse courses."
          );
        } else {
          setError(error.message);
        }
      } else {
        setError(
          "Failed to load courses."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCourses();
  }, []);

  async function handleEnroll(
    courseDocumentId: string
  ) {
    setError("");
    setEnrollingCourseId(courseDocumentId);

    try {
      await enrollInCourse(
        courseDocumentId
      );

      setEnrolledCourseIds(
        (current) =>
          new Set([
            ...current,
            courseDocumentId,
          ])
      );
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError(
          "Enrollment failed. Please try again."
        );
      }
    } finally {
      setEnrollingCourseId(null);
    }
  }

  return (
    <DashboardShell
      allowedRoles={["Student"]}
      title="Explore Courses"
      description="Browse available courses and enroll in the ones you want to study."
    >
      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-500">
            Loading courses...
          </p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-700">
            {error}
          </p>

          {error.includes("sign in") && (
            <Link
              href="/login"
              className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Sign in
            </Link>
          )}
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <h2 className="text-lg font-semibold text-slate-900">
            No courses available
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            There are no published courses available
            right now.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <CourseCard
              key={course.documentId}
              course={course}
              enrolled={enrolledCourseIds.has(
                course.documentId
              )}
              enrolling={
                enrollingCourseId ===
                course.documentId
              }
              onEnroll={handleEnroll}
            />
          ))}
        </div>
      )}
    </DashboardShell>
  );
}