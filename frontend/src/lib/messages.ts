import { apiFetch } from "./api";

export function getMessages(conversationId: number) {
  return apiFetch(
    `/conversations/${conversationId}/messages`
  );
}

export function sendMessage(
  conversationId: number,
  content: string
) {
  return apiFetch(
    `/conversations/${conversationId}/messages`,
    {
      method: "POST",
      body: JSON.stringify({
        content,
      }),
    }
  );
}