import { ApiError, apiFetch } from "@/lib/api";

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

export async function getPublishedBlogs(): Promise<
  BlogPost[]
> {
  const response =
    await apiFetch<
      StrapiListResponse<BlogPost>
    >(
      "/blog-posts",
      {
        method: "GET",
      }
    );

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