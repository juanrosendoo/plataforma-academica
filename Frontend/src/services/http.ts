/**
 * HTTP service base.
 * Endpoint real via API Gateway:
 *   API_BASE_URL=http://localhost:8000
 *
 * Esta camada centraliza a configuração para facilitar a troca
 * dos mocks por chamadas reais a FastAPI.
 */
export const API_BASE_URL = "http://localhost:8000";
export const AUTH_BASE_URL = API_BASE_URL;
export const ACADEMIC_BASE_URL = `${API_BASE_URL}/academic`;

export function delay<T>(value: T, ms = 600): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("auth_token");
}

export async function http<T>(
  base: string,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${base}${path}`, { ...init, headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}
