import { apiFetch } from "./api";

export async function signup(
  full_name: string,
  email: string,
  password: string
) {
  return apiFetch("/signup", {
    method: "POST",
    body: JSON.stringify({
      full_name,
      email,
      password,
    }),
  });
}

export async function login(
  email: string,
  password: string
) {
  return apiFetch("/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
}

export async function getCurrentUser() {
  return apiFetch("/me");
}

export async function getDashboard() {
  return apiFetch("/dashboard");
}