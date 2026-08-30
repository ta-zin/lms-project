import { ApiError, apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";

export interface QuizCourse {
  id: number;
  documentId: string;
  title: string;
}

export interface Quiz {
  id: number;
  documentId: string;
  title: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;
  course?: QuizCourse | null;
}

export interface Question {
  id: number;
  documentId: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer?: string;
  quiz?: Quiz | null;
}

export interface QuizResult {
  id: number;
  documentId: string;
  score: number;
  createdAt?: string;
  updatedAt?: string;
  quiz?: Quiz | null;
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

export async function getQuizzes(): Promise<Quiz[]> {
  const token = requireToken();

  const response =
    await apiFetch<StrapiListResponse<Quiz>>(
      "/quizzes?populate=course",
      {
        method: "GET",
        token,
      }
    );

  return response.data ?? [];
}

export async function getQuiz(
  documentId: string
): Promise<Quiz> {
  const token = requireToken();

  const response =
    await apiFetch<StrapiSingleResponse<Quiz>>(
      `/quizzes/${encodeURIComponent(documentId)}`,
      {
        method: "GET",
        token,
      }
    );

  if (!response.data) {
    throw new ApiError(
      "Quiz not found",
      404
    );
  }

  return response.data;
}

export async function getQuizQuestions(
  quizDocumentId: string
): Promise<Question[]> {
  const token = requireToken();

  const params = new URLSearchParams();

  params.set(
    "filters[quiz][documentId][$eq]",
    quizDocumentId
  );

  params.set(
    "pagination[pageSize]",
    "100"
  );

  const response =
    await apiFetch<
      StrapiListResponse<Question>
    >(
      `/questions?${params.toString()}`,
      {
        method: "GET",
        token,
      }
    );

  return response.data ?? [];
}

export async function submitQuizResult(
  quizDocumentId: string,
  score: number
): Promise<QuizResult> {
  const token = requireToken();

  const response =
    await apiFetch<
      StrapiSingleResponse<QuizResult>
    >(
      "/quiz-results",
      {
        method: "POST",
        token,
        body: JSON.stringify({
          data: {
            quiz: quizDocumentId,
            score,
          },
        }),
      }
    );

  if (!response.data) {
    throw new ApiError(
      "Failed to save quiz result",
      500
    );
  }

  return response.data;
}

export async function getMyQuizResults(): Promise<
  QuizResult[]
> {
  const token = requireToken();

  const response =
    await apiFetch<
      StrapiListResponse<QuizResult>
    >(
      "/quiz-results?populate=quiz",
      {
        method: "GET",
        token,
      }
    );

  return response.data ?? [];
}