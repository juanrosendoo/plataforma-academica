import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Clock, GraduationCap, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getTurma, atividadesDaTurma } from "@/services/academic-service";
import type { Atividade } from "@/types";

export const Route = createFileRoute("/_app/turmas/$id")({
  component: TurmaDetalhe,
});

function TurmaDetalhe() {
  const { id } = Route.useParams();
  const [data, setData] = useState<Awaited<ReturnType<typeof getTurma>> | null>(null);
  const [atvs, setAtvs] = useState<Atividade[] | null>(null);

  useEffect(() => {
    getTurma(id).then(setData);
    atividadesDaTurma(id).then(setAtvs);
  }, [id]);

  if (!data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const { turma, disciplina, professor, alunos } = data;
  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/turmas"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Link>
      </Button>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{disciplina.nome}</h1>
          <Badge>{turma.semestre}</Badge>
        </div>
        <p className="font-mono text-sm text-muted-foreground">{disciplina.codigo} · {disciplina.cargaHoraria}h</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4 text-sm">
            <User className="h-5 w-5 text-primary" />
            <div>
              <p className="text-muted-foreground">Professor</p>
              <p className="font-medium">{professor.nome}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4 text-sm">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <p className="text-muted-foreground">Horário</p>
              <p className="font-medium">{turma.horario}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4 text-sm">
            <GraduationCap className="h-5 w-5 text-primary" />
            <div>
              <p className="text-muted-foreground">Alunos matriculados</p>
              <p className="font-medium">{alunos.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Alunos matriculados</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alunos.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.nome}</TableCell>
                  <TableCell className="text-muted-foreground">{a.email}</TableCell>
                </TableRow>
              ))}
              {alunos.length === 0 && (
                <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">Sem alunos.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Atividades da turma</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {!atvs && [...Array(2)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          {atvs?.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma atividade ainda.</p>}
          {atvs?.map((a) => (
            <Link
              key={a.id}
              to="/atividades/$id"
              params={{ id: a.id }}
              className="flex items-center justify-between rounded-md border bg-card p-3 text-sm transition hover:border-primary/50"
            >
              <span className="font-medium">{a.titulo}</span>
              <span className="text-muted-foreground">Prazo: {new Date(a.prazo).toLocaleDateString("pt-BR")}</span>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
