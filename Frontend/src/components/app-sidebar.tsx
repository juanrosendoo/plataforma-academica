import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, GraduationCap, LayoutDashboard, ClipboardList, LogOut, Users } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Turmas", url: "/turmas", icon: Users },
  { title: "Disciplinas", url: "/disciplinas", icon: BookOpen },
  { title: "Atividades", url: "/atividades", icon: ClipboardList },
];

export function AppSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { usuario, logout } = useAuth();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold leading-none">Acadêmico</span>
            <span className="text-xs text-muted-foreground">Gestão UNI</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((it) => (
                <SidebarMenuItem key={it.url}>
                  <SidebarMenuButton asChild isActive={path === it.url || path.startsWith(it.url + "/")}>
                    <Link to={it.url} className="flex items-center gap-2">
                      <it.icon className="h-4 w-4" />
                      <span>{it.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 pb-2 group-data-[collapsible=icon]:hidden">
          {usuario && (
            <div className="mb-2 rounded-md bg-muted/50 p-2">
              <p className="truncate text-sm font-medium">{usuario.nome}</p>
              <p className="text-xs text-muted-foreground">{usuario.tipo}</p>
            </div>
          )}
          <Button variant="outline" size="sm" className="w-full" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
