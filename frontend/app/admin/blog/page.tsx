"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import DashboardShell from "@/components/layout/DashboardShell";

import {
  BlogPost,
  createBlog,
  deleteBlog,
  getManageBlogs,
  publishBlog,
  unpublishBlog,
  updateBlog,
} from "@/lib/blog";

import { ApiError } from "@/lib/api";

interface FormState {
  title: string;
  body: string;
  coverImageUrl: string;
}

const initialForm: FormState = {
  title: "",
  body: "",
  coverImageUrl: "",
};

export default function AdminBlogPage() {
    const [readingBlog, setReadingBlog] =
  useState<BlogPost | null>(null);

const [showReadModal, setShowReadModal] =
  useState(false);
  const [blogs, setBlogs] =
    useState<BlogPost[]>([]);

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

  const [publishingId, setPublishingId] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


    function handleRead(blog: BlogPost) {
  setReadingBlog(blog);
  setShowReadModal(true);
}
  async function loadBlogs() {
    try {
      setLoading(true);
      setError("");

      const data =
        await getManageBlogs();

      setBlogs(data);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Failed to load blog posts."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadBlogs();
  }, []);

  function resetForm() {
    setForm(initialForm);
    setEditingDocumentId(null);
  }

  function startEdit(blog: BlogPost) {
    setError("");
    setSuccess("");

    setEditingDocumentId(
      blog.documentId
    );

    setForm({
      title: blog.title ?? "",
      body: blog.body ?? "",
      coverImageUrl:
        blog.coverImageUrl ?? "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function isPublished(
    blog: BlogPost
  ): boolean {
    return Boolean(
      blog.publishedAt
    );
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

      const body =
        form.body.trim();

      const coverImageUrl =
        form.coverImageUrl.trim();

      if (!title) {
        throw new ApiError(
          "Blog title is required.",
          400
        );
      }

      if (!body) {
        throw new ApiError(
          "Blog body is required.",
          400
        );
      }

      if (editingDocumentId) {
        const updated =
          await updateBlog(
            editingDocumentId,
            {
              title,
              body,
              coverImageUrl,
            }
          );

        setBlogs((currentBlogs) =>
          currentBlogs.map((blog) =>
            blog.documentId ===
            editingDocumentId
              ? {
                  ...blog,
                  ...updated,
                }
              : blog
          )
        );

        setSuccess(
          "Blog post updated successfully."
        );
      } else {
        const created =
          await createBlog({
            title,
            body,
            coverImageUrl,
          });

        setBlogs((currentBlogs) => [
          created,
          ...currentBlogs,
        ]);

        setSuccess(
          "Blog post created as draft."
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
            ? "Failed to update blog post."
            : "Failed to create blog post."
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePublish(
    blog: BlogPost
  ) {
    const published =
      isPublished(blog);

    setPublishingId(
      blog.documentId
    );
    setError("");
    setSuccess("");

    try {
      const updated = published
        ? await unpublishBlog(
            blog.documentId
          )
        : await publishBlog(
            blog.documentId
          );

      setBlogs((currentBlogs) =>
        currentBlogs.map((item) =>
          item.documentId ===
          blog.documentId
            ? {
                ...item,
                ...updated,
              }
            : item
        )
      );   

      setSuccess(
        published
          ? "Blog post moved back to draft."
          : "Blog post published successfully."
      );
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          published
            ? "Failed to unpublish blog post."
            : "Failed to publish blog post."
        );
      }
    } finally {
      setPublishingId(null);
    }
  }

  async function handleDelete(
    blog: BlogPost
  ) {
    const confirmed =
      window.confirm(
        `Delete "${blog.title}"? This action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    setDeletingId(
      blog.documentId
    );
    setError("");
    setSuccess("");

    try {
      await deleteBlog(
        blog.documentId
      );

      setBlogs((currentBlogs) =>
        currentBlogs.filter(
          (item) =>
            item.documentId !==
            blog.documentId
        )
      );

      if (
        editingDocumentId ===
        blog.documentId
      ) {
        resetForm();
      }

      setSuccess(
        "Blog post deleted successfully."
      );
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Failed to delete blog post."
        );
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <DashboardShell
      allowedRoles={["Admin"]}
      title="Manage Blog"
      description="Create, edit, publish, unpublish, and delete blog posts."
    >
      <div className="space-y-8">
        {/* FORM */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              {editingDocumentId
                ? "Edit Blog Post"
                : "Create Blog Post"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              New posts are created as drafts.
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
            <div>
              <label
                htmlFor="blog-title"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Title
                <span className="text-red-500">
    *
  </span>
              </label>

              <input
                id="blog-title"
                type="text"
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title:
                      event.target.value,
                  }))
                }
                placeholder="Enter blog title"
                disabled={submitting}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="blog-body"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Body
                <span className="text-red-500">
    *
  </span>
              </label>

              <textarea
                id="blog-body"
                value={form.body}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    body:
                      event.target.value,
                  }))
                }
                placeholder="Write your blog post..."
                rows={12}
                disabled={submitting}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm leading-6 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="cover-image-url"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Cover Image URL
              </label>

              <input
                id="cover-image-url"
                type="url"
                value={
                  form.coverImageUrl
                }
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    coverImageUrl:
                      event.target.value,
                  }))
                }
                placeholder="https://example.com/image.jpg"
                disabled={submitting}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? editingDocumentId
                    ? "Updating..."
                    : "Creating..."
                  : editingDocumentId
                    ? "Update Post"
                    : "Create Draft"}
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

        {/* POSTS */}
        <section>
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                All Blog Posts
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Manage published and draft posts.
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
              {blogs.length}{" "}
              {blogs.length === 1
                ? "post"
                : "posts"}
            </span>
          </div>

          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
              <p className="text-sm text-slate-500">
                Loading blog posts...
              </p>
            </div>
          ) : blogs.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
              <h3 className="font-semibold text-slate-900">
                No blog posts yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Create your first post above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {blogs.map((blog) => {
                const published =
                  isPublished(blog);

                const isDeleting =
                  deletingId ===
                  blog.documentId;

                const isPublishing =
                  publishingId ===
                  blog.documentId;

                return (
                  <article
                    key={
                      blog.documentId
                    }
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-bold text-slate-900">
                            {blog.title}
                          </h3>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              published
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {published
                              ? "Published"
                              : "Draft"}
                          </span>
                        </div>

                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                          {blog.body}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                          <span>
                            Author:{" "}
                            {blog.author
                              ?.username ??
                              "Unknown"}
                          </span>

                          <span>
                            ID:{" "}
                            {
                              blog.documentId
                            }
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        <button
  type="button"
  onClick={() =>
    handleRead(blog)
  }
  disabled={
    isDeleting ||
    isPublishing
  }
  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
>
  Read
</button>
                        <button
                          type="button"
                          onClick={() =>
                            startEdit(
                              blog
                            )
                          }
                          disabled={
                            isDeleting ||
                            isPublishing
                          }
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handlePublish(
                              blog
                            )
                          }
                          disabled={
                            isDeleting ||
                            isPublishing
                          }
                          className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                            published
                              ? "border border-amber-200 bg-white text-amber-700 hover:bg-amber-50"
                              : "bg-green-600 text-white hover:bg-green-700"
                          } disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                          {isPublishing
                            ? published
                              ? "Unpublishing..."
                              : "Publishing..."
                            : published
                              ? "Unpublish"
                              : "Publish"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              blog
                            )
                          }
                          disabled={
                            isDeleting ||
                            isPublishing
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

      {showReadModal &&
  readingBlog && (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={() => {
        setShowReadModal(false);
        setReadingBlog(null);
      }}
    >
      <div
        className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Blog Post
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Read Post
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowReadModal(false);
              setReadingBlog(null);
            }}
            className="rounded-lg px-3 py-2 text-xl font-semibold text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {readingBlog.coverImageUrl && (
            <div className="mb-6 overflow-hidden rounded-xl">
              <img
                src={
                  readingBlog.coverImageUrl
                }
                alt={readingBlog.title}
                className="h-64 w-full object-cover"
              />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {readingBlog.title}
            </h1>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                readingBlog.publishedAt
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {readingBlog.publishedAt
                ? "Published"
                : "Draft"}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
            <span>
              Author:{" "}
              <strong className="text-slate-700">
                {readingBlog.author
                  ?.username ??
                  "Unknown"}
              </strong>
            </span>

            {readingBlog.createdAt && (
              <span>
                Created:{" "}
                {new Date(
                  readingBlog.createdAt
                ).toLocaleDateString()}
              </span>
            )}
          </div>

          <div className="mt-8 whitespace-pre-wrap text-base leading-8 text-slate-700">
            {readingBlog.body}
          </div>

          <div className="mt-8 flex justify-end border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={() => {
                setShowReadModal(false);
                setReadingBlog(null);
              }}
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )}
    </DashboardShell>
  );
}