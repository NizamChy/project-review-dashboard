const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
export type ApiError = Error & {
  fields?: Record<string, string[]>;
  status?: number;
};
export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("pr_token") : null;
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type"))
    headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      cache: "no-store",
    });
  } catch {
    throw Object.assign(
      new Error("Could not reach the API. Make sure the backend is running."),
      { status: 0 },
    );
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw Object.assign(new Error(data.message ?? "Request failed."), {
      status: response.status,
      fields: data.errors,
    });
  return data as T;
}
export function saveSession(data: {
  token: string;
  user: { id: string; name: string; email: string; role: "STUDENT" | "MENTOR" };
}) {
  localStorage.setItem("pr_token", data.token);
  localStorage.setItem("pr_user", JSON.stringify(data.user));
}
export function readUser() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("pr_user") ?? "null") as {
      id: string;
      name: string;
      email: string;
      role: "STUDENT" | "MENTOR";
    } | null;
  } catch {
    return null;
  }
}
export function signOut() {
  localStorage.removeItem("pr_token");
  localStorage.removeItem("pr_user");
  window.location.href = "/login";
}
