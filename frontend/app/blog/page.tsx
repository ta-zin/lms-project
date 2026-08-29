"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  BlogPost,
  getPublishedBlogs,
} from "@/lib/blog";

import { ApiError } from "@/lib/api";

export default function BlogPage() {
  const [posts, setPosts] =
    useState<BlogPost[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadBlogs() {
      setLoading(true);
      setError("");

      try {
        const data =
          await getPublishedBlogs();

        setPosts(data);
      } catch (error) {
        if (error instanceof ApiError) {
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

    void loadBlogs();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-xl font-bold text-slate-900"
          >
            LMS
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/courses"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Courses
            </Link>

            <Link
              href="/login"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-blue-600">
            LMS Blog
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
            Learn beyond the classroom
          </h1>

          <p className="mt-4 text-lg leading-8 text-slate-600">
            Read articles, learning tips and insights
            from our content team.
          </p>
        </div>

        {loading ? (
          <div className="mt-10 rounded-xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-500">
              Loading blog posts...
            </p>
          </div>
        ) : error ? (
          <div className="mt-10 rounded-xl border border-red-200 bg-red-50 p-6">
            <p className="text-sm text-red-700">
              {error}
            </p>
          </div>
        ) : posts.length === 0 ? (
          <div className="mt-10 rounded-xl border border-slate-200 bg-white p-10 text-center">
            <h2 className="text-xl font-bold text-slate-900">
              No published posts yet
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Check back later for new articles.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.documentId}
                className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                {post.coverImageUrl ? (
                  <img
                    src={post.coverImageUrl}
                    alt={post.title}
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center bg-slate-100">
                    <span className="text-sm font-medium text-slate-400">
                      LMS Blog
                    </span>
                  </div>
                )}

                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                    Article
                  </p>

                  <h2 className="mt-2 text-xl font-bold text-slate-900">
                    {post.title}
                  </h2>

                  <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-600">
                    {post.body}
                  </p>

                  <div className="mt-auto pt-6">
                    <Link
                      href={`/blog/${encodeURIComponent(
                        post.documentId
                      )}`}
                      className="inline-flex rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      Read Article
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}