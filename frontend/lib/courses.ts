import { ApiError, apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";

export interface CourseInstructor {
  id: number;
  documentId?: string;
  username?: string;
  email?: string;
}

export interface Course {
  id: number;
  documentId: string;
  title: string;
  description: string;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  instructor?: CourseInstructor | null;
}

export interface Lesson {
  id: number;
  documentId: string;
  title: string;
  content?: string | null;
  videoUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
  course?: Course | null;
}

export interface Enrollment {
  id: number;
  documentId: string;
  student?: {
    id: number;
    documentId?: string;
    username?: string;
    email?: string;
  } | null;
  course?: Course | null;
  createdAt?: string;
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

export async function getCourses(): Promise<Course[]> {
  const token = requireToken();

  const response =
    await apiFetch<StrapiListResponse<Course>>(
      "/courses",
      {
        method: "GET",
        token,
      }
    );

  return response.data ?? [];
}

export async function getCourse(
  documentId: string
): Promise<Course> {
  const token = requireToken();

  const response =
    await apiFetch<StrapiSingleResponse<Course>>(
      `/courses/${encodeURIComponent(documentId)}`,
      {
        method: "GET",
        token,
      }
    );

  if (!response.data) {
    throw new ApiError(
      "Course not found",
      404
    );
  }

  return response.data;
}

export async function enrollInCourse(
  courseDocumentId: string
): Promise<Enrollment> {
  const token = requireToken();

  const response =
    await apiFetch<StrapiSingleResponse<Enrollment>>(
      "/enrollments",
      {
        method: "POST",
        token,
        body: JSON.stringify({
          data: {
            course: courseDocumentId,
          },
        }),
      }
    );

  if (!response.data) {
    throw new ApiError(
      "Enrollment failed",
      500
    );
  }

  return response.data;
}

export async function getMyEnrollments(): Promise<
  Enrollment[]
> {
  const token = requireToken();

  const response =
    await apiFetch<StrapiListResponse<Enrollment>>(
      "/enrollments",
      {
        method: "GET",
        token,
      }
    );

  return response.data ?? [];
}

export async function getCourseLessons(
  courseDocumentId: string
): Promise<Lesson[]> {
  const token = requireToken();

  const params = new URLSearchParams();

  params.set(
    "filters[course][documentId][$eq]",
    courseDocumentId
  );

  const response =
    await apiFetch<StrapiListResponse<Lesson>>(
      `/lessons?${params.toString()}`,
      {
        method: "GET",
        token,
      }
    );

  return response.data ?? [];
}