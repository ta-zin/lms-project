
"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import { useParams } from "next/navigation";

import DashboardShell from "@/components/layout/DashboardShell";

import {
  Course,
  Lesson,
  createLesson,
  deleteLesson,
  getCourse,
  getEnrolledLessons,
  updateLesson,
} from "@/lib/courses";

import { ApiError } from "@/lib/api";

interface LessonFormState {
  title: string;
  content: string;
  videoUrl: string;
}

const EMPTY_FORM: LessonFormState = {
  title: "",
  content: "",
  videoUrl: "",
};

export default function InstructorCourseLessonsPage() {
  const params = useParams();

  const documentId =
    typeof params?.documentId === "string"
      ? params.documentId
      : "";

  const [course, setCourse] =
    useState<Course | null>(null);

  const [lessons, setLessons] =
    useState<Lesson[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [form, setForm] =
    useState<LessonFormState>(EMPTY_FORM);

  const [editingLessonId, setEditingLessonId] =
    useState<string | null>(null);

  async function loadPage() {
    if (!documentId) {
      setError("Course ID is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [courseData, allLessons] =
        await Promise.all([
          getCourse(documentId),
          getEnrolledLessons(),
        ]);

      setCourse(courseData);

      const courseLessons =
        allLessons.filter(
          (lesson) =>
            lesson.course?.documentId ===
            courseData.documentId
        );

      setLessons(courseLessons);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Failed to load course lessons."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPage();
  }, [documentId]);

  function handleInputChange(
    field: keyof LessonFormState,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingLessonId(null);
  }

  function startEdit(lesson: Lesson) {
    setEditingLessonId(
      lesson.documentId
    );

    setForm({
      title: lesson.title,
      content: lesson.content ?? "",
      videoUrl: lesson.videoUrl ?? "",
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

    const content =
      form.content.trim();

    const videoUrl =
      form.videoUrl.trim();

    if (!title) {
      setError(
        "Lesson title is required."
      );
      return;
    }

    if (!content && !videoUrl) {
      setError(
        "Add lesson content or a video URL."
      );
      return;
    }

    if (!documentId) {
      setError(
        "Course ID is missing."
      );
      return;
    }

    setSubmitting(true);

    try {
      if (editingLessonId) {
        const updatedLesson =
          await updateLesson(
            editingLessonId,
            {
              title,
              content,
              videoUrl,
            }
          );

        setLessons((current) =>
          current.map((lesson) =>
            lesson.documentId ===
            editingLessonId
              ? {
                  ...lesson,
                  ...updatedLesson,
                }
              : lesson
          )
        );

        setSuccess(
          "Lesson updated successfully."
        );
      } else {
        const createdLesson =
          await createLesson({
            title,
            content,
            videoUrl,
            course: documentId,
          });

        const normalizedLesson: Lesson = {
          ...createdLesson,
          course:
            createdLesson.course ??
            course,
        };

        setLessons((current) => [
          ...current,
          normalizedLesson,
        ]);

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
          "Something went wrong. Please try again."
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

    setError("");
    setSuccess("");

    try {
      await deleteLesson(
        lesson.documentId
      );

      setLessons((current) =>
        current.filter(
          (item) =>
            item.documentId !==
            lesson.documentId
        )
      );

      if (
        editingLessonId ===
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
    }
  }

  return (
    <DashboardShell
      allowedRoles={["Instructor"]}
      title={
        course
          ? `Lessons — ${course.title}`
          : "Course Lessons"
      }
      description="Create and manage lessons for your course."
    >
      <div className="space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/instructor/courses"
            className="inline-flex w-fit rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            ← Back to My Courses
          </Link>

          {course && (
            <div className="text-sm text-slate-500">
              {lessons.length}{" "}
              {lessons.length === 1
                ? "lesson"
                : "lessons"}
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-slate-500">
              Loading course...
            </p>
          </div>
        ) : (
          <>
            {course && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-blue-600">
                  Course
                </p>

                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                  {course.title}
                </h2>

                <p className="mt-3 leading-7 text-slate-600">
                  {course.description}
                </p>
              </section>
            )}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {editingLessonId
                      ? "Edit Lesson"
                      : "Add Lesson"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Add text content, a video URL, or
                    both.
                  </p>
                </div>

                {editingLessonId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div>
                  <label
                    htmlFor="lesson-title"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Lesson Title
                  </label>

                  <input
                    id="lesson-title"
                    type="text"
                    value={form.title}
                    onChange={(event) =>
                      handleInputChange(
                        "title",
                        event.target.value
                      )
                    }
                    placeholder="e.g. Introduction to React"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="lesson-content"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Lesson Content
                  </label>

                  <textarea
                    id="lesson-content"
                    rows={7}
                    value={form.content}
                    onChange={(event) =>
                      handleInputChange(
                        "content",
                        event.target.value
                      )
                    }
                    placeholder="Write the lesson content here..."
                    className="w-full resize-y rounded-lg border border-slate-300 px-4 py-3 text-sm leading-6 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="lesson-video"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Video URL
                  </label>

                  <input
                    id="lesson-video"
                    type="url"
                    value={form.videoUrl}
                    onChange={(event) =>
                      handleInputChange(
                        "videoUrl",
                        event.target.value
                      )
                    }
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    A YouTube, Vimeo, or direct video URL
                    is fine.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting
                    ? editingLessonId
                      ? "Updating..."
                      : "Creating..."
                    : editingLessonId
                    ? "Update Lesson"
                    : "Add Lesson"}
                </button>
              </form>
            </section>

            <section>
              <div className="mb-5">
                <h2 className="text-2xl font-bold text-slate-900">
                  Course Lessons
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  Manage the lessons in this course.
                </p>
              </div>

              {lessons.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900">
                    No lessons yet
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Create the first lesson using the
                    form above.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {lessons.map(
                    (lesson, index) => (
                      <article
                        key={
                          lesson.documentId
                        }
                        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                      >
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="mb-3 flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                Lesson {index + 1}
                              </span>

                              {lesson.videoUrl && (
                                <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                                  Video
                                </span>
                              )}
                            </div>

                            <h3 className="text-xl font-bold text-slate-900">
                              {lesson.title}
                            </h3>

                            {lesson.content && (
                              <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-600">
                                {lesson.content}
                              </p>
                            )}

                            {lesson.videoUrl && (
                              <a
                                href={
                                  lesson.videoUrl
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="mt-4 inline-flex break-all text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                              >
                                {lesson.videoUrl}
                              </a>
                            )}
                          </div>

                          <div className="flex shrink-0 gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                startEdit(
                                  lesson
                                )
                              }
                              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                void handleDelete(
                                  lesson
                                )
                              }
                              className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </article>
                    )
                  )}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
