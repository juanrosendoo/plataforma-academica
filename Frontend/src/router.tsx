import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

// 1. Instanciamos o QueryClient globalmente apenas uma vez
export const queryClient = new QueryClient();

// 2. Criamos e exportamos a instância do router exatamente como o main.tsx espera
export const router = createRouter({
  routeTree,
  context: { queryClient },
  scrollRestoration: true,
  defaultPreloadStaleTime: 0,
});

// 3. Isso garante que o TypeScript reconheça todas as suas rotas para o autocompletar funcionar
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}