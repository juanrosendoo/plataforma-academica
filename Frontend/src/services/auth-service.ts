import { AUTH_BASE_URL, http } from "./http";
import type { Usuario } from "@/types";

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

export async function login(email: string, senha: string): Promise<LoginResponse> {
  return http<LoginResponse>(AUTH_BASE_URL, "/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, senha }),
  });
}

export async function me(_token: string): Promise<Usuario> {
  return http<Usuario>(AUTH_BASE_URL, "/auth/me");
}
