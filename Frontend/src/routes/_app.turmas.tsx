import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { listTurmas, turmasDoAluno, turmasDoProfessor } from "@/services/academic-service";
import { disciplinas as discMock, usuarios } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";
import type { Turma } from "@/types";

export const Route = createFileRoute("/_app/turmas")({
  component: TurmasLayout,
});

function TurmasLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (path !== "/turmas") return <Outlet />;
  return <TurmasList />;
}

function TurmasList() {
  const { usuario } = useAuth();
  const [items, setItems] = useState<Turma[] | null>(null);

  useEffect(() => {
    if (!usuario) return;
    const p =
      usuario.tipo === "Aluno"
        ? turmasDoAluno(usuario.id)
        : usuario.tipo === "Professor"
          ? turmasDoProfessor(usuario.id)
          : listTurmas();
    p.then(setItems);
  }, [usuario]);

  return (
    <div>
      <PageHeader title="Turmas" description="Turmas do semestre." />
      {!items && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-36 w-full" />)}
        </div>
      )}
      {items && items.length === 0 && (
        <Card><CardContent className="p-8 text-center text-muted-foreground">Nenhuma turma encontrada.</CardContent></Card>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items?.map((t) => {
          const d = discMock.find((x) => x.id === t.id_disciplina);
          const prof = usuarios.find((u) => u.id === t.id_professor);
          return (
            <Link key={t.id} to="/turmas/$id" params={{ id: t.id }}>
              <Card className="h-full transition hover:border-primary/50 hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{d?.nome}</CardTitle>
                    <Badge variant="secondary">{t.semestre}</Badge>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground">{d?.codigo}</p>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" /> {t.horario}
                  </p>
                  <p className="text-muted-foreground">Professor: <span className="text-foreground">{prof?.nome}</span></p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
