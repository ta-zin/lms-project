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

import {
  AdminUser,
  getAdminUsers,
} from "@/lib/admin-users";

import { ApiError } from "@/lib/api";

interface FormState {
  title: string;
  description: string;
  instructor: string;
}

const initialForm: FormState = {
  title: "",
  description: "",
  instructor: "",
};

export default function AdminCoursesPage() {
  const [courses, setCourses] =
    useState<Course[]>([]);

  const [instructors, setInstructors] =
    useState<AdminUser[]>([]);

  const [form, setForm] =
    useState<FormState>(initialForm);

  const [editingDocumentId, setEditingDocumentId] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [loadingInstructors, setLoadingInstructors] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  async function loadData() {
    try {
      setLoading(true);
      setLoadingInstructors(true);
      setError("");

      const [
        coursesData,
        usersData,
      ] = await Promise.all([
        getCourses(),
        getAdminUsers(),
      ]);

      const sortedCourses = [
  ...coursesData,
].sort((a, b) => {
  const dateA = new Date(
    a.updatedAt ??
      a.createdAt ??
      0
  ).getTime();

  const dateB = new Date(
    b.updatedAt ??
      b.createdAt ??
      0
  ).getTime();

  return dateB - dateA;
});

setCourses(sortedCourses);

setInstructors(
  usersData.filter(
    (user) =>
      user.role?.name ===
      "Instructor"
  )
);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Failed to load course data."
        );
      }
    } finally {
      setLoading(false);
      setLoadingInstructors(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  function resetForm() {
    setForm(initialForm);
    setEditingDocumentId(null);
  }

  function startEdit(course: Course) {
    setError("");
    setSuccess("");

    setEditingDocumentId(
      course.documentId
    );

    setForm({
      title: course.title ?? "",
      description:
        course.description ?? "",
      instructor:
        course.instructor?.id
          ? String(course.instructor.id)
          : "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

 async function handleSubmit(
  event: FormEvent<HTMLFormElement>
) {
  event.preventDefault();

  setSubmitting(true);
  setError("");
  setSuccess("");

  try {
    if (!form.title.trim()) {
      throw new ApiError(
        "Course title is required.",
        400
      );
    }

    if (!form.description.trim()) {
      throw new ApiError(
        "Course description is required.",
        400
      );
    }

    if (!form.instructor) {
      throw new ApiError(
        "Please select an instructor.",
        400
      );
    }

    const instructorId =
      Number(form.instructor);

    if (
      !Number.isInteger(instructorId) ||
      instructorId <= 0
    ) {
      throw new ApiError(
        "Invalid instructor.",
        400
      );
    }

if (editingDocumentId) {
  const newTitle =
    form.title.trim();

  const newDescription =
    form.description.trim();

  await updateCourse(
    editingDocumentId,
    {
      title: newTitle,
      description: newDescription,
    }
  );

  setCourses((currentCourses) => {
    const currentCourse =
      currentCourses.find(
        (course) =>
          course.documentId ===
          editingDocumentId
      );

    if (!currentCourse) {
      return currentCourses;
    }

    const updatedCourse: Course = {
      ...currentCourse,
      title: newTitle,
      description: newDescription,
      updatedAt:
        new Date().toISOString(),
    };

    return [
      updatedCourse,
      ...currentCourses.filter(
        (course) =>
          course.documentId !==
          editingDocumentId
      ),
    ];
  });

  setSuccess(
    "Course updated successfully."
  );
} else {
      const newCourse =
        await createCourse({
          title: form.title.trim(),
          description:
            form.description.trim(),
          instructor: instructorId,
        });

setCourses((currentCourses) => [
  newCourse,
  ...currentCourses,
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
        editingDocumentId
          ? "Failed to update course."
          : "Failed to create course."
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

    setDeletingId(
      course.documentId
    );
    setError("");
    setSuccess("");

    try {
      await deleteCourse(
        course.documentId
      );

      setCourses((currentCourses) =>
        currentCourses.filter(
          (item) =>
            item.documentId !==
            course.documentId
        )
      );

      if (
        editingDocumentId ===
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
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <DashboardShell
      allowedRoles={["Admin"]}
      title="Manage Courses"
      description="Create, edit, and delete courses across the LMS."
    >
      <div className="space-y-8">
        {/* COURSE FORM */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              {editingDocumentId
                ? "Edit Course"
                : "Create Course"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {editingDocumentId
                ? "Update the course information below."
                : "Add a new course to the LMS."}
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
            >
              {success}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* TITLE */}
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Course Title
                <span className="text-red-500">
    *
  </span>
              </label>

              <input
                id="title"
                type="text"
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title:
                      event.target.value,
                  }))
                }
                placeholder="Enter course title"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                disabled={submitting}
              />
            </div>

            {/* DESCRIPTION */}
            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Description
                <span className="text-red-500">
    *
  </span>
              </label>

              <textarea
                id="description"
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description:
                      event.target.value,
                  }))
                }
                placeholder="Enter course description"
                rows={5}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                disabled={submitting}
              />
            </div>

            {/* INSTRUCTOR */}
            <div>
              <label
                htmlFor="instructor"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Instructor
                <span className="text-red-500">
    *
  </span>
              </label>

              <select
                id="instructor"
                value={form.instructor}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    instructor:
                      event.target.value,
                  }))
                }
                disabled={
                  submitting ||
                  loadingInstructors
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <option value="">
                  {loadingInstructors
                    ? "Loading instructors..."
                    : "Select an instructor"}
                </option>

                {instructors.map(
                  (instructor) => (
                    <option
                      key={
                        instructor.documentId
                      }
                      value={String(
                        instructor.id
                      )}
                    >
                      {instructor.username}{" "}
                      ({instructor.email})
                    </option>
                  )
                )}
              </select>

              {!loadingInstructors &&
                instructors.length ===
                  0 && (
                  <p className="mt-2 text-xs text-amber-600">
                    No Instructor users are
                    available. Promote a
                    Student to Instructor
                    from Manage Users first.
                  </p>
                )}
            </div>

            {/* BUTTONS */}
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={
                  submitting ||
                  loadingInstructors ||
                  instructors.length === 0
                }
                className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? editingDocumentId
                    ? "Updating..."
                    : "Creating..."
                  : editingDocumentId
                    ? "Update Course"
                    : "Create Course"}
              </button>

              {editingDocumentId && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={submitting}
                  className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* COURSE LIST */}
        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                All Courses
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Manage every course across the
                LMS.
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
              {courses.length}{" "}
              {courses.length === 1
                ? "course"
                : "courses"}
            </span>
          </div>

          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <p className="text-sm text-slate-500">
                Loading courses...
              </p>
            </div>
          ) : courses.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <h3 className="font-semibold text-slate-900">
                No courses found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Create the first course using
                the form above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => {
                const isDeleting =
                  deletingId ===
                  course.documentId;

                return (
                  <div
                    key={
                      course.documentId
                    }
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-slate-900">
                          {course.title}
                        </h3>

                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                          {
                            course.description
                          }
                        </p>

                        <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                          <span>
                            Course ID:{" "}
                            {
                              course.documentId
                            }
                          </span>

                          {course.instructor
                            ?.username && (
                            <span>
                              Instructor:{" "}
                              {
                                course
                                  .instructor
                                  .username
                              }
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        <Link
            href="/admin/lessons"
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
            Lessons
          </Link>

                        <button
                          type="button"
                          onClick={() =>
                            startEdit(
                              course
                            )
                          }
                          disabled={
                            isDeleting
                          }
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              course
                            )
                          }
                          disabled={
                            isDeleting
                          }
                          className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isDeleting
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
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