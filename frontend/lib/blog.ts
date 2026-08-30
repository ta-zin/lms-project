import {
  ApiError,
  apiFetch,
} from "@/lib/api";

import { getToken } from "@/lib/auth";

export interface BlogAuthor {
  id: number;
  documentId?: string;
  username?: string;
  email?: string;
}

export interface BlogPost {
  id: number;
  documentId: string;
  title: string;
  body: string;
  coverImageUrl?: string | null;
  curr_status?: "draft" | "published";
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  author?: BlogAuthor | null;
}

interface StrapiListResponse<T> {
  data: T[];
  meta?: unknown;
}

interface StrapiSingleResponse<T> {
  data: T | null;
  meta?: unknown;
}

function requireToken(): string {
  const token = getToken();

  if (!token) {
    throw new ApiError(
      "Authentication required",
      401
    );
  }

  return token;
}

/*
 * PUBLIC
 */

export async function getPublishedBlogs(): Promise<
  BlogPost[]
> {
  const response =
    await apiFetch<
      StrapiListResponse<BlogPost>
    >("/blog-posts", {
      method: "GET",
    });

  return response.data ?? [];
}

export async function getPublishedBlog(
  documentId: string
): Promise<BlogPost> {
  const response =
    await apiFetch<
      StrapiSingleResponse<BlogPost>
    >(
      `/blog-posts/${encodeURIComponent(
        documentId
      )}`,
      {
        method: "GET",
      }
    );

  if (!response.data) {
    throw new ApiError(
      "Blog post not found",
      404
    );
  }

  return response.data;
}

/*
 * ADMIN / CONTENT MANAGER
 */

export async function getManageBlogs(): Promise<
  BlogPost[]
> {
  const token = requireToken();

  const [
    draftResponse,
    publishedResponse,
  ] = await Promise.all([
    apiFetch<
      StrapiListResponse<BlogPost>
    >("/blog-posts/manage", {
      method: "GET",
      token,
    }),

    apiFetch<
      StrapiListResponse<BlogPost>
    >("/blog-posts", {
      method: "GET",
    }),
  ]);

  const drafts = draftResponse.data ?? [];
  const published =
    publishedResponse.data ?? [];

  const map = new Map<
    string,
    BlogPost
  >();

  for (const blog of drafts) {
    map.set(
      blog.documentId,
      blog
    );
  }

  for (const blog of published) {
    map.set(
      blog.documentId,
      blog
    );
  }

  return Array.from(map.values()).sort(
    (a, b) => {
      const aDate =
        a.updatedAt ??
        a.createdAt ??
        "";

      const bDate =
        b.updatedAt ??
        b.createdAt ??
        "";

      return (
        new Date(bDate).getTime() -
        new Date(aDate).getTime()
      );
    }
  );
}

export interface CreateBlogInput {
  title: string;
  body: string;
  coverImageUrl?: string;
}

export async function createBlog(
  input: CreateBlogInput
): Promise<BlogPost> {
  const token = requireToken();

  const response =
    await apiFetch<
      StrapiSingleResponse<BlogPost>
    >("/blog-posts", {
      method: "POST",
      token,
      body: JSON.stringify({
        data: {
          title: input.title,
          body: input.body,
          ...(input.coverImageUrl
            ? {
                coverImageUrl:
                  input.coverImageUrl,
              }
            : {}),
        },
      }),
    });

  if (!response.data) {
    throw new ApiError(
      "Failed to create blog post",
      500
    );
  }

  return response.data;
}

export interface UpdateBlogInput {
  title: string;
  body: string;
  coverImageUrl?: string;
}

export async function updateBlog(
  documentId: string,
  input: UpdateBlogInput
): Promise<BlogPost> {
  const token = requireToken();

  const response =
    await apiFetch<
      StrapiSingleResponse<BlogPost>
    >(
      `/blog-posts/${encodeURIComponent(
        documentId
      )}`,
      {
        method: "PUT",
        token,
        body: JSON.stringify({
          data: {
            title: input.title,
            body: input.body,
            ...(input.coverImageUrl
              ? {
                  coverImageUrl:
                    input.coverImageUrl,
                }
              : {}),
          },
        }),
      }
    );

  if (!response.data) {
    throw new ApiError(
      "Failed to update blog post",
      500
    );
  }

  return response.data;
}

export async function deleteBlog(
  documentId: string
): Promise<void> {
  const token = requireToken();

  await apiFetch(
    `/blog-posts/${encodeURIComponent(
      documentId
    )}`,
    {
      method: "DELETE",
      token,
    }
  );
}

export async function publishBlog(
  documentId: string
): Promise<BlogPost> {
  const token = requireToken();

  const response =
    await apiFetch<
      StrapiSingleResponse<BlogPost>
    >(
      `/blog-posts/${encodeURIComponent(
        documentId
      )}/publish`,
      {
        method: "POST",
        token,
      }
    );

  if (!response.data) {
    throw new ApiError(
      "Failed to publish blog post",
      500
    );
  }

  return response.data;
}

export async function unpublishBlog(
  documentId: string
): Promise<BlogPost> {
  const token = requireToken();

  const response =
    await apiFetch<
      StrapiSingleResponse<BlogPost>
    >(
      `/blog-posts/${encodeURIComponent(
        documentId
      )}/unpublish`,
      {
        method: "POST",
        token,
      }
    );

  if (!response.data) {
    throw new ApiError(
      "Failed to unpublish blog post",
      500
    );
  }

  return response.data;
}