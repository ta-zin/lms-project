const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(
    message: string,
    status: number,
    details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

type ApiFetchOptions = RequestInit & {
  token?: string | null;
};

function getApiUrl(): string {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured. Add it to your .env.local file."
    );
  }

  return API_URL.replace(/\/$/, "");
}

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const {
    token,
    headers,
    ...requestOptions
  } = options;

  const requestHeaders = new Headers(headers);

  if (
    !requestHeaders.has("Content-Type") &&
    requestOptions.body
  ) {
    requestHeaders.set(
      "Content-Type",
      "application/json"
    );
  }

  requestHeaders.set("Accept", "application/json");

  if (token) {
    requestHeaders.set(
      "Authorization",
      `Bearer ${token}`
    );
  }

  const cleanEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  const response = await fetch(
    `${getApiUrl()}${cleanEndpoint}`,
    {
      ...requestOptions,
      headers: requestHeaders,
    }
  );

  let responseData: unknown = null;

  try {
    responseData = await response.json();
  } catch {
    responseData = null;
  }

  if (!response.ok) {
    let message = `API Error: ${response.status}`;

    if (
      typeof responseData === "object" &&
      responseData !== null &&
      "error" in responseData
    ) {
      const error = responseData.error;

      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string"
      ) {
        message = error.message;
      }
    }

    throw new ApiError(
      message,
      response.status,
      responseData
    );
  }

  return responseData as T;
}