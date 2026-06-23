import { delay } from "./http";
import { usuarios } from "@/lib/mock-data";
import type { Usuario } from "@/types";

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

/**
 * POST {AUTH_BASE_URL}/auth/login
 * Mock: aceita qualquer senha; usuário identificado pelo e-mail.
 */
export async function login(email: string, senha: string): Promise<LoginResponse> {
  await delay(null, 700);
  if (!senha) throw new Error("Senha obrigatória");
  const usuario = usuarios.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!usuario) throw new Error("Credenciais inválidas");
  return { token: `mock-token-${usuario.id}`, usuario };
}

export async function me(token: string): Promise<Usuario> {
  await delay(null, 300);
  const id = token.replace("mock-token-", "");
  const u = usuarios.find((u) => u.id === id);
  if (!u) throw new Error("Sessão inválida");
  return u;
}
