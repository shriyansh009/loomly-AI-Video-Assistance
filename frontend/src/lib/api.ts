export { login, signup, getCurrentUser, getDashboard } from "./auth";

const API_URL = "http://127.0.0.1:8000";

export async function askLLM(question: string, transcript: string, conversationId?: number) {
  return apiFetch("/LLM/ask", {
    method: "POST",
    body: JSON.stringify({
      question,
      transcript,
      conversation_id: conversationId,
    }),
  });
}

export function isYouTubeUrl(value: string): boolean {
  const text = value.trim();
  if (!text) return false;

  try {
    const url = new URL(text);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    return (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "youtu.be" ||
      host.endsWith(".youtube.com")
    );
  } catch {
    return false;
  }
}

export async function uploadFile(file: File, conversationId?: number) {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);

  const endpoint = conversationId ? `/upload/${conversationId}` : "/upload/";

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    body: formData,
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Unable to upload file");
  }

  return response.json();
}

export async function uploadYouTubeUrl(url: string, conversationId?: number) {
  const token = getToken();
  const formData = new FormData();
  formData.append("url", url);

  const endpoint = conversationId ? `/upload/${conversationId}` : "/upload/";

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    body: formData,
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Unable to process YouTube URL");
  }

  return response.json();
}

function getToken() {
  return localStorage.getItem("token");
}

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = getToken();

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Something went wrong");
  }

  return response.json();
}