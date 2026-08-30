
"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import DashboardShell from "@/components/layout/DashboardShell";

import {
  Course,
  createCourse,
  deleteCourse,
  getCourses,
  updateCourse,
} from "@/lib/courses";

import { ApiError } from "@/lib/api";

interface FormState {
  title: string;
  description: string;
}

const EMPTY_FORM: FormState = {
  title: "",
  description: "",
};

export default function InstructorCoursesPage() {
  const [courses, setCourses] =
    useState<Course[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [form, setForm] =
    useState<FormState>(EMPTY_FORM);

  const [editingCourseId, setEditingCourseId] =
    useState<string | null>(null);

  async function loadCourses() {
    setLoading(true);
    setError("");

    try {
      const data = await getCourses();

      setCourses(data);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else if (error instanceof Error) {
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

  useEffect(() => {
    void loadCourses();
  }, []);

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingCourseId(null);
  }

  function handleInputChange(
    field: keyof FormState,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function startEdit(course: Course) {
    setEditingCourseId(
      course.documentId
    );

    setForm({
      title: course.title,
      description: course.description,
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const title =
      form.title.trim();

    const description =
      form.description.trim();

    if (!title) {
      setError(
        "Course title is required."
      );
      return;
    }

    if (!description) {
      setError(
        "Course description is required."
      );
      return;
    }

    setSubmitting(true);

    try {
      if (editingCourseId) {
        const updatedCourse =
          await updateCourse(
            editingCourseId,
            {
              title,
              description,
            }
          );

        setCourses((current) =>
          current.map((course) =>
            course.documentId ===
            editingCourseId
              ? {
                  ...course,
                  ...updatedCourse,
                }
              : course
          )
        );

        setSuccess(
          "Course updated successfully."
        );
      } else {
        const createdCourse =
          await createCourse({
            title,
            description,
          });

        setCourses((current) => [
          createdCourse,
          ...current,
        ]);

        setSuccess(
          "Course created successfully."
        );
      }

      resetForm();
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(
    course: Course
  ) {
    const confirmed =
      window.confirm(
        `Delete "${course.title}"? This action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await deleteCourse(
        course.documentId
      );

      setCourses((current) =>
        current.filter(
          (item) =>
            item.documentId !==
            course.documentId
        )
      );

      if (
        editingCourseId ===
        course.documentId
      ) {
        resetForm();
      }

      setSuccess(
        "Course deleted successfully."
      );
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Failed to delete course."
        );
      }
    }
  }

  return (
    <DashboardShell
      allowedRoles={["Instructor"]}
      title="My Courses"
      description="Create and manage the courses that you teach."
    >
      <div className="space-y-8">
        {/* FORM */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingCourseId
                    ? "Edit Course"
                    : "Create Course"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingCourseId
                    ? "Update the details of your course."
                    : "Add a new course to your teaching library."}
                </p>
              </div>

              {editingCourseId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="course-title"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Course Title
              </label>

              <input
                id="course-title"
                type="text"
                value={form.title}
                onChange={(event) =>
                  handleInputChange(
                    "title",
                    event.target.value
                  )
                }
                placeholder="e.g. Full Stack Web Development"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="course-description"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Course Description
              </label>

              <textarea
                id="course-description"
                rows={5}
                value={form.description}
                onChange={(event) =>
                  handleInputChange(
                    "description",
                    event.target.value
                  )
                }
                placeholder="Describe what students will learn in this course..."
                className="w-full resize-y rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? editingCourseId
                  ? "Updating..."
                  : "Creating..."
                : editingCourseId
                ? "Update Course"
                : "Create Course"}
            </button>
          </form>
        </section>

        {/* COURSE LIST */}
        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Your Courses
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Manage the courses assigned to you.
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
              {courses.length}{" "}
              {courses.length === 1
                ? "course"
                : "courses"}
            </span>
          </div>

          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <p className="text-sm text-slate-500">
                Loading your courses...
              </p>
            </div>
          ) : courses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">
                No courses yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Create your first course using the
                form above.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {courses.map((course) => (
                <article
                  key={course.documentId}
                  className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex-1">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        Course
                      </span>

                      <span className="text-xs font-medium text-slate-400">
                        Published
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900">
                      {course.title}
                    </h3>

                    <p className="mt-3 line-clamp-5 text-sm leading-6 text-slate-600">
                      {course.description}
                    </p>
                  </div>

                  {/* COURSE ACTIONS */}
                  <div className="mt-6 grid grid-cols-3 gap-3">
                    <Link
                      href={`/instructor/courses/${course.documentId}`}
                      className="rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      Lessons
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        startEdit(course)
                      }
                      className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void handleDelete(course)
                      }
                      className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}  