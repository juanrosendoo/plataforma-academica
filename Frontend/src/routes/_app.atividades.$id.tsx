import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, CalendarClock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/lib/auth-context";
import {
  atribuirNota,
  entregasDaAtividade,
  getAtividade,
  minhaEntrega,
  submeterEntrega,
} from "@/services/academic-service";
import type { Entrega, Usuario } from "@/types";

export const Route = createFileRoute("/_app/atividades/$id")({
  component: AtividadeDetalhe,
});

function fmt(s: string) {
  return new Date(s).toLocaleDateString("pt-BR");
}

function AtividadeDetalhe() {
  const { id } = Route.useParams();
  const { usuario } = useAuth();
  const [data, setData] = useState<Awaited<ReturnType<typeof getAtividade>> | null>(null);

  useEffect(() => {
    getAtividade(id).then(setData);
  }, [id]);

  if (!data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const { atividade, disciplina, turma } = data;
  const venceu = new Date(atividade.prazo) < new Date();

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/atividades"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Link>
      </Button>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{atividade.titulo}</h1>
          <Badge variant={venceu ? "destructive" : "secondary"}>{venceu ? "Encerrada" : "Aberta"}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {disciplina.nome} · {turma.semestre} · {turma.horario}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Descrição</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarClock className="h-4 w-4" /> Prazo: {fmt(atividade.prazo)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
            {atividade.descricao}
          </p>
        </CardContent>
      </Card>

      {usuario?.tipo === "Aluno" && <EntregaAluno idAtividade={id} idAluno={usuario.id} />}
      {usuario?.tipo === "Professor" && <EntregasProfessor idAtividade={id} />}
    </div>
  );
}

function EntregaAluno({ idAtividade, idAluno }: { idAtividade: string; idAluno: string }) {
  const [entrega, setEntrega] = useState<Entrega | null | undefined>(undefined);
  const [conteudo, setConteudo] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    minhaEntrega(idAtividade, idAluno).then((e) => {
      setEntrega(e);
      if (e) setConteudo(e.conteudo);
    });
  }, [idAtividade, idAluno]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await submeterEntrega(idAtividade, idAluno, conteudo);
      setEntrega(r);
      toast.success("Entrega enviada");
    } catch {
      toast.error("Falha ao enviar entrega");
    } finally {
      setSaving(false);
    }
  }

  if (entrega === undefined) return <Skeleton className="h-40 w-full" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Minha entrega</CardTitle>
      </CardHeader>
      <CardContent>
        {entrega?.nota != null && (
          <div className="mb-4 rounded-md border bg-primary/5 p-3 text-sm">
            Nota atribuída: <span className="font-semibold text-primary">{entrega.nota.toFixed(1)}</span>
          </div>
        )}
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="conteudo">Conteúdo da entrega (texto, link ou descrição do arquivo)</Label>
            <Textarea
              id="conteudo"
              rows={6}
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              required
              placeholder="Cole aqui o link do repositório, texto ou descrição."
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {entrega ? `Enviada em ${fmt(entrega.dataEntrega)}` : "Você ainda não enviou."}
            </p>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {entrega ? "Atualizar entrega" : "Enviar entrega"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function EntregasProfessor({ idAtividade }: { idAtividade: string }) {
  const [items, setItems] = useState<(Entrega & { aluno: Usuario })[] | null>(null);

  useEffect(() => {
    entregasDaAtividade(idAtividade).then(setItems);
  }, [idAtividade]);

  async function setNota(idEntrega: string, valor: string) {
    const n = Number(valor);
    if (Number.isNaN(n) || n < 0 || n > 10) {
      toast.error("Nota inválida (0–10)");
      return;
    }
    try {
      const upd = await atribuirNota(idEntrega, n);
      setItems((prev) => prev?.map((e) => (e.id === upd.id ? { ...e, nota: upd.nota } : e)) ?? null);
      toast.success("Nota atribuída");
    } catch {
      toast.error("Falha ao salvar nota");
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Entregas dos alunos</CardTitle></CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Aluno</TableHead>
              <TableHead>Entrega</TableHead>
              <TableHead className="w-32">Data</TableHead>
              <TableHead className="w-40">Nota</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!items && [...Array(3)].map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={4}><Skeleton className="h-6 w-full" /></TableCell>
              </TableRow>
            ))}
            {items?.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Nenhuma entrega ainda.</TableCell></TableRow>
            )}
            {items?.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="font-medium">{e.aluno.nome}</TableCell>
                <TableCell className="max-w-md truncate text-sm text-muted-foreground">{e.conteudo}</TableCell>
                <TableCell>{fmt(e.dataEntrega)}</TableCell>
                <TableCell>
                  <NotaInput defaultValue={e.nota} onSave={(v) => setNota(e.id, v)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function NotaInput({ defaultValue, onSave }: { defaultValue: number | null; onSave: (v: string) => void }) {
  const [v, setV] = useState(defaultValue?.toString() ?? "");
  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        min={0}
        max={10}
        step="0.1"
        value={v}
        onChange={(e) => setV(e.target.value)}
        className="h-8 w-20"
      />
      <Button size="sm" variant="outline" onClick={() => onSave(v)}>Salvar</Button>
    </div>
  );
}
