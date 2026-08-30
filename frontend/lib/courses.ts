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
  publishedAt?: string | null;
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

export interface LessonProgress {
  id: number;
  documentId: string;
  completed: boolean;
  student?: {
    id: number;
    documentId?: string;
    username?: string;
  } | null;
  lesson?: Lesson | null;
}

export interface CourseProgress {
  course?: Course | null;
  totalLessons: number;
  completedLessons: number;
  percentage: number;
  progress: LessonProgress[];
}

interface StrapiListResponse<T> {
  data: T[];
  meta?: unknown;
}

interface StrapiSingleResponse<T> {
  data: T | null;
  meta?: unknown;
}


interface InstructorStudentProgress {
  student?: {
    id: number;
    documentId?: string;
    username?: string;
    email?: string;
  } | null;

  totalLessons: number;
  completedLessons: number;
  percentage: number;
  progress: LessonProgress[];
}

interface InstructorCourseProgress {
  course?: Course | null;
  totalLessons: number;
  students: InstructorStudentProgress[];
}

type CourseProgressResponse =
  | {
      data: CourseProgress;
    }
  | {
      data: InstructorCourseProgress;
    };



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
      "/courses?populate=instructor",
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
      "/enrollments?populate=course",
      {
        method: "GET",
        token,
      }
    );

  return response.data ?? [];
}

/**
 * Student lesson access is already restricted
 * by the Strapi backend to enrolled courses.
 *
 * We populate the course relation because the
 * frontend needs to identify the course that each
 * lesson belongs to.
 */
export async function getEnrolledLessons(): Promise<
  Lesson[]
> {
  const token = requireToken();

  const response =
    await apiFetch<StrapiListResponse<Lesson>>(
      "/lessons?populate=course&pagination[pageSize]=100",
      {
        method: "GET",
        token,
      }
    );

  return response.data ?? [];
}

export async function getLesson(
  documentId: string
): Promise<Lesson> {
  const token = requireToken();

  const response =
    await apiFetch<StrapiSingleResponse<Lesson>>(
      `/lessons/${encodeURIComponent(documentId)}`,
      {
        method: "GET",
        token,
      }
    );

  if (!response.data) {
    throw new ApiError(
      "Lesson not found",
      404
    );
  }

  return response.data;
}

export async function getMyLessonProgress(): Promise<
  LessonProgress[]
> {
  const token = requireToken();

  const response =
    await apiFetch<
      StrapiListResponse<LessonProgress>
    >(
      "/lesson-progresses",
      {
        method: "GET",
        token,
      }
    );

  return response.data ?? [];
}


export async function getCourseProgress(
  courseDocumentId: string
): Promise<
  CourseProgress | InstructorCourseProgress
> {
  const token = requireToken();

  const response =
    await apiFetch<CourseProgressResponse>(
      `/lesson-progresses/course/${encodeURIComponent(
        courseDocumentId
      )}`,
      {
        method: "GET",
        token,
      }
    );

  if (!response.data) {
    throw new ApiError(
      "Course progress not found",
      404
    );
  }

  return response.data;
}



export async function completeLesson(
  lessonDocumentId: string
): Promise<LessonProgress> {
  const token = requireToken();

  const response =
    await apiFetch<
      StrapiSingleResponse<LessonProgress>
    >(
      "/lesson-progresses",
      {
        method: "POST",
        token,
        body: JSON.stringify({
          data: {
            lesson: lessonDocumentId,
          },
        }),
      }
    );

  if (!response.data) {
    throw new ApiError(
      "Failed to complete lesson",
      500
    );
  }

  return response.data;
}

export async function uncompleteLesson(
  progressDocumentId: string
): Promise<void> {
  const token = requireToken();

  await apiFetch(
    `/lesson-progresses/${encodeURIComponent(
      progressDocumentId
    )}`,
    {
      method: "DELETE",
      token,
    }
  );
}

export interface CreateCourseInput {
  title: string;
  description: string;
}

export interface UpdateCourseInput {
  title: string;
  description: string;
}

export async function createCourse(
  input: CreateCourseInput
): Promise<Course> {
  const token = requireToken();

  const response =
    await apiFetch<StrapiSingleResponse<Course>>(
      "/courses",
      {
        method: "POST",
        token,
        body: JSON.stringify({
          data: {
            title: input.title,
            description: input.description,
          },
        }),
      }
    );

  if (!response.data) {
    throw new ApiError(
      "Failed to create course",
      500
    );
  }

  return response.data;
}

export async function updateCourse(
  documentId: string,
  input: UpdateCourseInput
): Promise<Course> {
  const token = requireToken();

  const response =
    await apiFetch<StrapiSingleResponse<Course>>(
      `/courses/${encodeURIComponent(documentId)}`,
      {
        method: "PUT",
        token,
        body: JSON.stringify({
          data: {
            title: input.title,
            description: input.description,
          },
        }),
      }
    );

  if (!response.data) {
    throw new ApiError(
      "Failed to update course",
      500
    );
  }

  return response.data;
}

export async function deleteCourse(
  documentId: string
): Promise<void> {
  const token = requireToken();

  await apiFetch(
    `/courses/${encodeURIComponent(documentId)}`,
    {
      method: "DELETE",
      token,
    }
  );
}


export interface CreateLessonInput {
  title: string;
  content?: string;
  videoUrl?: string;
  course: string;
}

export interface UpdateLessonInput {
  title: string;
  content?: string;
  videoUrl?: string;
  course?: string;
}

export async function createLesson(
  input: CreateLessonInput
): Promise<Lesson> {
  const token = requireToken();

  const response =
    await apiFetch<StrapiSingleResponse<Lesson>>(
      "/lessons",
      {
        method: "POST",
        token,
        body: JSON.stringify({
          data: {
            title: input.title,
            content: input.content || null,
            videoUrl: input.videoUrl || null,
            course: input.course,
          },
        }),
      }
    );

  if (!response.data) {
    throw new ApiError(
      "Failed to create lesson",
      500
    );
  }

  return response.data;
}

export async function updateLesson(
  documentId: string,
  input: UpdateLessonInput
): Promise<Lesson> {
  const token = requireToken();

  const response =
    await apiFetch<StrapiSingleResponse<Lesson>>(
      `/lessons/${encodeURIComponent(documentId)}`,
      {
        method: "PUT",
        token,
        body: JSON.stringify({
          data: {
            title: input.title,
            content: input.content || null,
            videoUrl: input.videoUrl || null,
            ...(input.course
              ? { course: input.course }
              : {}),
          },
        }),
      }
    );

  if (!response.data) {
    throw new ApiError(
      "Failed to update lesson",
      500
    );
  }

  return response.data;
}

export async function deleteLesson(
  documentId: string
): Promise<void> {
  const token = requireToken();

  await apiFetch(
    `/lessons/${encodeURIComponent(documentId)}`,
    {
      method: "DELETE",
      token,
    }
  );
}