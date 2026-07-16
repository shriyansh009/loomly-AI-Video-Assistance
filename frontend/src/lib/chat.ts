import { apiFetch } from "./api";

export function chat(conversationId: number, question: string) {
  return apiFetch(`/chat/${conversationId}`, {
    method: "POST",
    body: JSON.stringify({
      question,
    }),
  });
}