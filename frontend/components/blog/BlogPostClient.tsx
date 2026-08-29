"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  BlogPost,
  getPublishedBlog,
} from "@/lib/blog";

import { ApiError } from "@/lib/api";

interface BlogPostClientProps {
  documentId: string;
}

export default function BlogPostClient({
  documentId,
}: BlogPostClientProps) {
  const [post, setPost] =
    useState<BlogPost | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadPost() {
      setLoading(true);
      setError("");

      try {
        const data =
          await getPublishedBlog(
            documentId
          );

        setPost(data);
      } catch (error) {
        if (error instanceof ApiError) {
          setError(error.message);
        } else {
          setError(
            "Failed to load the blog post."
          );
        }
      } finally {
        setLoading(false);
      }
    }

    void loadPost();
  }, [documentId]);

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-xl font-bold text-slate-900"
          >
            LMS
          </Link>

          <Link
            href="/blog"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            ← Back to Blog
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-12">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-slate-500">
              Loading article...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <h1 className="text-xl font-bold text-red-900">
              Unable to load article
            </h1>

            <p className="mt-2 text-sm text-red-700">
              {error}
            </p>

            <Link
              href="/blog"
              className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Back to Blog
            </Link>
          </div>
        ) : !post ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-slate-500">
              Blog post not found.
            </p>
          </div>
        ) : (
          <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {post.coverImageUrl && (
              <img
                src={post.coverImageUrl}
                alt={post.title}
                className="h-72 w-full object-cover"
              />
            )}

            <div className="p-7 sm:p-10">
              <p className="text-sm font-semibold text-blue-600">
                LMS Blog
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {post.title}
              </h1>

              {post.author?.username && (
                <p className="mt-4 text-sm text-slate-500">
                  By{" "}
                  <span className="font-semibold text-slate-700">
                    {post.author.username}
                  </span>
                </p>
              )}

              <div className="mt-8 whitespace-pre-wrap text-base leading-8 text-slate-700">
                {post.body}
              </div>
            </div>
          </article>
        )}
      </div>
    </main>
  );
}