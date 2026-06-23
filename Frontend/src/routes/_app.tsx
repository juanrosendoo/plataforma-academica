import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { usuario, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !usuario) navigate({ to: "/login", replace: true });
  }, [loading, usuario, navigate]);

  if (loading || !usuario) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-14 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-5" />
            <span className="text-sm font-medium text-muted-foreground">
              Plataforma Acadêmica
            </span>
            <div className="ml-auto text-sm">
              <span className="text-muted-foreground">Logado como </span>
              <span className="font-medium">{usuario.nome}</span>
              <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {usuario.tipo}
              </span>
            </div>
          </header>
          <main className="flex-1 bg-muted/30 p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
