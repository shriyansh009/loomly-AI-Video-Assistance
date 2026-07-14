import { apiFetch } from "./api";

export function getConversations() {
  return apiFetch("/conversations");
}

export function getConversation(id: number) {
  return apiFetch(`/conversations/${id}`);
}

export function createConversation(title = "New Chat") {
  return apiFetch("/conversations", {
    method: "POST",
    body: JSON.stringify({
      title,
    }),
  });
}

export function updateConversation(
  id: number,
  title: string
) {
  return apiFetch(`/conversations/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      title,
    }),
  });
}

export function deleteConversation(id: number) {
  return apiFetch(`/conversations/${id}`, {
    method: "DELETE",
  });
}