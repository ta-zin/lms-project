"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import DashboardShell from "@/components/layout/DashboardShell";

import {
  Course,
  Lesson,
  createLesson,
  deleteLesson,
  getCourses,
  getEnrolledLessons,
  updateLesson,
} from "@/lib/courses";

import { ApiError } from "@/lib/api";

interface FormState {
  title: string;
  content: string;
  videoUrl: string;
  course: string;
}

const initialForm: FormState = {
  title: "",
  content: "",
  videoUrl: "",
  course: "",
};

export default function AdminLessonsPage() {
  const [lessons, setLessons] =
    useState<Lesson[]>([]);

  const [courses, setCourses] =
    useState<Course[]>([]);

  const [form, setForm] =
    useState<FormState>(initialForm);

  const [editingDocumentId, setEditingDocumentId] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

async function loadData(
  showLoading = true
) {
  try {
    if (showLoading) {
      setLoading(true);
    }

    setError("");

    const [
      coursesData,
      lessonsData,
    ] = await Promise.all([
      getCourses(),
      getEnrolledLessons(),
    ]);

    setCourses(coursesData);

const sortedLessons = [
  ...lessonsData,
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

setLessons(sortedLessons);
  } catch (error) {
    if (error instanceof ApiError) {
      setError(error.message);
    } else if (error instanceof Error) {
      setError(error.message);
    } else {
      setError(
        "Failed to load lessons and courses."
      );
    }
  } finally {
    if (showLoading) {
      setLoading(false);
    }
  }
}

  useEffect(() => {
    void loadData();
  }, []);

  function resetForm() {
    setForm(initialForm);
    setEditingDocumentId(null);
  }

  function startEdit(lesson: Lesson) {
    setError("");
    setSuccess("");

    setEditingDocumentId(
      lesson.documentId
    );

    setForm({
      title: lesson.title ?? "",
      content: lesson.content ?? "",
      videoUrl: lesson.videoUrl ?? "",
      course:
        lesson.course?.documentId ?? "",
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
    const title =
      form.title.trim();

    if (!title) {
      throw new ApiError(
        "Lesson title is required.",
        400
      );
    }

    if (!form.course) {
      throw new ApiError(
        "Please select a course.",
        400
      );
    }

    if (editingDocumentId) {
      await updateLesson(
        editingDocumentId,
        {
          title,
          content:
            form.content.trim() ||
            undefined,
          videoUrl:
            form.videoUrl.trim() ||
            undefined,
        }
      );

      await loadData(false);

      setSuccess(
        "Lesson updated successfully."
      );
    } else {
      await createLesson({
        title,
        content:
          form.content.trim() ||
          undefined,
        videoUrl:
          form.videoUrl.trim() ||
          undefined,
        course: form.course,
      });

      await loadData(false);

      setSuccess(
        "Lesson created successfully."
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
          ? "Failed to update lesson."
          : "Failed to create lesson."
      );
    }
  } finally {
    setSubmitting(false);
  }
}

  async function handleDelete(
    lesson: Lesson
  ) {
    const confirmed =
      window.confirm(
        `Delete "${lesson.title}"? This action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    setDeletingId(
      lesson.documentId
    );

    setError("");
    setSuccess("");

    try {
      await deleteLesson(
        lesson.documentId
      );

      setLessons((currentLessons) =>
        currentLessons.filter(
          (item) =>
            item.documentId !==
            lesson.documentId
        )
      );

      if (
        editingDocumentId ===
        lesson.documentId
      ) {
        resetForm();
      }

      setSuccess(
        "Lesson deleted successfully."
      );
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Failed to delete lesson."
        );
      }
    } finally {
      setDeletingId(null);
    }
  }

  function getCourseName(
  course?: Course | null
) {
  if (!course) {
    return "Unknown course";
  }

  const matchedCourse =
    courses.find(
      (item) =>
        item.documentId ===
          course.documentId ||
        item.id === course.id
    );

  return (
    matchedCourse?.title ??
    course.title ??
    "Unknown course"
  );
}

  return (
    <DashboardShell
      allowedRoles={["Admin"]}
      title="Manage Lessons"
      description="Create, edit, and delete lessons across all courses."
    >
      
      <div className="space-y-8">
        {/* FORM */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              {editingDocumentId
                ? "Edit Lesson"
                : "Create Lesson"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add lesson content to any course.
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
            {/* COURSE */}
            <div>
              <label
                htmlFor="course"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Course
                <span className="text-red-500">
    *
  </span>
              </label>

              <select
                id="course"
                value={form.course}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    course:
                      event.target.value,
                  }))
                }
                disabled={submitting}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              >
                <option value="">
                  Select a course
                </option>

                {courses.map((course) => (
                  <option
                    key={
                      course.documentId
                    }
                    value={
                      course.documentId
                    }
                  >
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            {/* TITLE */}
            <div>
              <label
                htmlFor="lesson-title"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Lesson Title
                <span className="text-red-500">
    *
  </span>
              </label>

              <input
                id="lesson-title"
                type="text"
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title:
                      event.target.value,
                  }))
                }
                placeholder="Enter lesson title"
                disabled={submitting}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* CONTENT */}
            <div>
              <label
                htmlFor="lesson-content"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Content
              </label>

              <textarea
                id="lesson-content"
                value={form.content}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    content:
                      event.target.value,
                  }))
                }
                placeholder="Write lesson content..."
                rows={10}
                disabled={submitting}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm leading-6 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* VIDEO URL */}
            <div>
              <label
                htmlFor="video-url"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Video URL
              </label>

              <input
                id="video-url"
                type="url"
                value={form.videoUrl}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    videoUrl:
                      event.target.value,
                  }))
                }
                placeholder="https://youtube.com/..."
                disabled={submitting}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={
                  submitting ||
                  courses.length === 0
                }
                className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? editingDocumentId
                    ? "Updating..."
                    : "Creating..."
                  : editingDocumentId
                    ? "Update Lesson"
                    : "Create Lesson"}
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

        {/* LESSON LIST */}
        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                All Lessons
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Manage lessons from every course.
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
              {lessons.length}{" "}
              {lessons.length === 1
                ? "lesson"
                : "lessons"}
            </span>
          </div>

          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
              <p className="text-sm text-slate-500">
                Loading lessons...
              </p>
            </div>
          ) : lessons.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
              <h3 className="font-semibold text-slate-900">
                No lessons found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Create a lesson using the form
                above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {lessons.map((lesson) => {
                const isDeleting =
                  deletingId ===
                  lesson.documentId;

                return (
                  <article
                    key={
                      lesson.documentId
                    }
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-bold text-slate-900">
                            {lesson.title}
                          </h3>

                          {lesson.publishedAt ? (
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                              Published
                            </span>
                          ) : (
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                              Draft
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-sm font-medium text-blue-600">
                          Course:{" "}
                          {getCourseName(
                            lesson.course
                          )}
                        </p>

                        {lesson.content && (
                          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                            {lesson.content}
                          </p>
                        )}

                        {lesson.videoUrl && (
                          <p className="mt-3 truncate text-xs text-slate-500">
                            Video:{" "}
                            {
                              lesson.videoUrl
                            }
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            startEdit(
                              lesson
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
                              lesson
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
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}