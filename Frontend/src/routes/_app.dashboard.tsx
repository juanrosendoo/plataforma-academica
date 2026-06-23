import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarClock, ClipboardCheck, GraduationCap, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/page-header";
import {
  atividadesDoAluno,
  atividadesDoProfessor,
  entregasDaAtividade,
  listAtividades,
  listDisciplinas,
  listTurmas,
  turmasDoAluno,
  turmasDoProfessor,
} from "@/services/academic-service";
import { disciplinas as discMock } from "@/lib/mock-data";
import type { Atividade, Turma } from "@/types";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

function fmtData(s: string) {
  return new Date(s).toLocaleDateString("pt-BR");
}

function Dashboard() {
  const { usuario } = useAuth();
  if (!usuario) return null;

  if (usuario.tipo === "Aluno") return <DashboardAluno idAluno={usuario.id} />;
  if (usuario.tipo === "Professor") return <DashboardProfessor idProfessor={usuario.id} />;
  return <DashboardAdmin />;
}

function StatCard({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: typeof Users;
  label: string;
  value: number | string;
  loading?: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          {loading ? <Skeleton className="mt-1 h-7 w-12" /> : <p className="text-2xl font-semibold">{value}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardAluno({ idAluno }: { idAluno: string }) {
  const [turmas, setTurmas] = useState<Turma[] | null>(null);
  const [atvs, setAtvs] = useState<Atividade[] | null>(null);

  useEffect(() => {
    turmasDoAluno(idAluno).then(setTurmas);
    atividadesDoAluno(idAluno).then(setAtvs);
  }, [idAluno]);

  const pendentes = (atvs ?? []).filter((a) => new Date(a.prazo) >= new Date()).sort((a, b) => a.prazo.localeCompare(b.prazo));

  return (
    <div>
      <PageHeader title="Dashboard" description="Visão geral das suas turmas e atividades." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={GraduationCap} label="Turmas ativas" value={turmas?.length ?? 0} loading={!turmas} />
        <StatCard icon={CalendarClock} label="Atividades pendentes" value={pendentes.length} loading={!atvs} />
        <StatCard icon={ClipboardCheck} label="Total de atividades" value={atvs?.length ?? 0} loading={!atvs} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Próximas atividades</CardTitle>
            <CardDescription>Entregas mais próximas do prazo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!atvs && [...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            {atvs && pendentes.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma atividade pendente.</p>
            )}
            {pendentes.slice(0, 5).map((a) => (
              <Link
                key={a.id}
                to="/atividades/$id"
                params={{ id: a.id }}
                className="block rounded-lg border bg-card p-4 transition hover:border-primary/50 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{a.titulo}</p>
                    <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{a.descricao}</p>
                  </div>
                  <Badge variant="outline">{fmtData(a.prazo)}</Badge>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Minhas turmas</CardTitle>
            <CardDescription>Turmas em que você está matriculado.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!turmas && [...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            {turmas?.map((t) => {
              const d = discMock.find((x) => x.id === t.id_disciplina);
              return (
                <Link
                  key={t.id}
                  to="/turmas/$id"
                  params={{ id: t.id }}
                  className="flex items-center justify-between rounded-lg border bg-card p-4 transition hover:border-primary/50"
                >
                  <div>
                    <p className="font-medium">{d?.nome}</p>
                    <p className="text-sm text-muted-foreground">{t.horario}</p>
                  </div>
                  <Badge>{t.semestre}</Badge>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardProfessor({ idProfessor }: { idProfessor: string }) {
  const [turmas, setTurmas] = useState<Turma[] | null>(null);
  const [atvs, setAtvs] = useState<Atividade[] | null>(null);
  const [aguardando, setAguardando] = useState<number | null>(null);

  useEffect(() => {
    turmasDoProfessor(idProfessor).then(setTurmas);
    atividadesDoProfessor(idProfessor).then(async (lista) => {
      setAtvs(lista);
      const counts = await Promise.all(
        lista.map(async (a) => {
          const ents = await entregasDaAtividade(a.id);
          return ents.filter((e) => e.nota == null).length;
        }),
      );
      setAguardando(counts.reduce((s, n) => s + n, 0));
    });
  }, [idProfessor]);

  return (
    <div>
      <PageHeader title="Dashboard" description="Resumo do semestre." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={Users} label="Turmas no semestre" value={turmas?.length ?? 0} loading={!turmas} />
        <StatCard icon={ClipboardCheck} label="Atividades criadas" value={atvs?.length ?? 0} loading={!atvs} />
        <StatCard
          icon={CalendarClock}
          label="Entregas aguardando correção"
          value={aguardando ?? 0}
          loading={aguardando === null}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Minhas turmas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!turmas && [...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            {turmas?.map((t) => {
              const d = discMock.find((x) => x.id === t.id_disciplina);
              return (
                <Link
                  key={t.id}
                  to="/turmas/$id"
                  params={{ id: t.id }}
                  className="flex items-center justify-between rounded-lg border bg-card p-4 transition hover:border-primary/50"
                >
                  <div>
                    <p className="font-medium">{d?.nome}</p>
                    <p className="text-sm text-muted-foreground">{t.horario}</p>
                  </div>
                  <Badge>{t.semestre}</Badge>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividades recentes</CardTitle>
            <CardDescription>Gerencie entregas e atribua notas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!atvs && [...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            {atvs?.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma atividade criada.</p>}
            {atvs?.slice(0, 5).map((a) => (
              <Link
                key={a.id}
                to="/atividades/$id"
                params={{ id: a.id }}
                className="flex items-center justify-between rounded-lg border bg-card p-4 transition hover:border-primary/50"
              >
                <div>
                  <p className="font-medium">{a.titulo}</p>
                  <p className="text-sm text-muted-foreground">Prazo: {fmtData(a.prazo)}</p>
                </div>
              </Link>
            ))}
            <Button asChild variant="outline" className="w-full">
              <Link to="/atividades">Ver todas</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardAdmin() {
  const [counts, setCounts] = useState<{ d: number; t: number; a: number } | null>(null);
  useEffect(() => {
    Promise.all([listDisciplinas(), listTurmas(), listAtividades()]).then(([d, t, a]) =>
      setCounts({ d: d.length, t: t.length, a: a.length }),
    );
  }, []);
  return (
    <div>
      <PageHeader title="Dashboard" description="Visão geral da plataforma." />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={GraduationCap} label="Disciplinas" value={counts?.d ?? 0} loading={!counts} />
        <StatCard icon={Users} label="Turmas" value={counts?.t ?? 0} loading={!counts} />
        <StatCard icon={ClipboardCheck} label="Atividades" value={counts?.a ?? 0} loading={!counts} />
      </div>
    </div>
  );
}
