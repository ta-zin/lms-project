"use client";

import Link from "next/link";

import type { Course } from "@/lib/courses";

interface CourseCardProps {
  course: Course;
  enrolled?: boolean;
  onEnroll?: (
    courseDocumentId: string
  ) => void;
  enrolling?: boolean;
}

export default function CourseCard({
  course,
  enrolled = false,
  onEnroll,
  enrolling = false,
}: CourseCardProps) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex-1">
        <div className="mb-4 flex items-start justify-between gap-4">
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            Course
          </span>

          {enrolled && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Enrolled
            </span>
          )}
        </div>

        <h2 className="text-xl font-bold text-slate-900">
          {course.title}
        </h2>

        <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-600">
          {course.description}
        </p>

        {course.instructor?.username && (
          <p className="mt-4 text-sm text-slate-500">
            Instructor:{" "}
            <span className="font-medium text-slate-700">
              {course.instructor.username}
            </span>
          </p>
        )}
      </div>

      <div className="mt-6">
        {enrolled ? (
          <Link
            href={`/courses/${encodeURIComponent(
              course.documentId
            )}`}
            className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Open Course
          </Link>
        ) : (
          <button
            type="button"
            disabled={enrolling}
            onClick={() =>
              onEnroll?.(course.documentId)
            }
            className="w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {enrolling
              ? "Enrolling..."
              : "Enroll Now"}
          </button>
        )}
      </div>
    </article>
  );
}