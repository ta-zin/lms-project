const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(
  endpoint: string,
  options?: RequestInit
) {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  const response = await fetch(`${API_URL}${endpoint}`, options);

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}