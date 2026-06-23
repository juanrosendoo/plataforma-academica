import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Usuario } from "@/types";
import { login as loginApi } from "@/services/auth-service";

interface AuthCtx {
  usuario: Usuario | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<Usuario>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(USER_KEY);
    if (raw) {
      try {
        setUsuario(JSON.parse(raw) as Usuario);
      } catch {
        /* ignore */
      }
    }
    setLoading(false);
  }, []);

  async function login(email: string, senha: string) {
    const { token, usuario } = await loginApi(email, senha);
    window.localStorage.setItem(TOKEN_KEY, token);
    window.localStorage.setItem(USER_KEY, JSON.stringify(usuario));
    setUsuario(usuario);
    return usuario;
  }

  function logout() {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    setUsuario(null);
  }

  return <Ctx.Provider value={{ usuario, loading, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth fora de AuthProvider");
  return ctx;
}
