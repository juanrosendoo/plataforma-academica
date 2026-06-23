import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { useAuth } from "@/lib/auth-context";
import {
  atividadesDoAluno,
  atividadesDoProfessor,
  createAtividade,
  listAtividades,
  turmasDoProfessor,
} from "@/services/academic-service";
import { disciplinas as discMock, turmas as turmasMock } from "@/lib/mock-data";
import type { Atividade, Turma } from "@/types";

export const Route = createFileRoute("/_app/atividades")({
  component: AtividadesLayout,
});

function AtividadesLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (path !== "/atividades") return <Outlet />;
  return <AtividadesList />;
}

function fmt(s: string) {
  return new Date(s).toLocaleDateString("pt-BR");
}

function AtividadesList() {
  const { usuario } = useAuth();
  const [items, setItems] = useState<Atividade[] | null>(null);
  const [open, setOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!usuario) return;
    const p =
      usuario.tipo === "Aluno"
        ? atividadesDoAluno(usuario.id)
        : usuario.tipo === "Professor"
          ? atividadesDoProfessor(usuario.id)
          : listAtividades();
    p.then(setItems);
  }, [usuario, reloadKey]);

  return (
    <div>
      <PageHeader
        title="Atividades"
        description="Atividades e prazos."
        actions={
          usuario?.tipo === "Professor" && (
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Nova atividade
            </Button>
          )
        }
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Turma</TableHead>
                <TableHead className="w-32">Prazo</TableHead>
                <TableHead className="w-24">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!items &&
                [...Array(4)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-64" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  </TableRow>
                ))}
              {items?.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Nenhuma atividade.</TableCell></TableRow>
              )}
              {items?.map((a) => {
                const turma = turmasMock.find((t) => t.id === a.id_turma);
                const disc = discMock.find((d) => d.id === turma?.id_disciplina);
                const venceu = new Date(a.prazo) < new Date();
                return (
                  <TableRow key={a.id} className="cursor-pointer">
                    <TableCell className="font-medium">
                      <Link to="/atividades/$id" params={{ id: a.id }} className="hover:underline">
                        {a.titulo}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{disc?.nome} · {turma?.semestre}</TableCell>
                    <TableCell>{fmt(a.prazo)}</TableCell>
                    <TableCell>
                      <Badge variant={venceu ? "destructive" : "secondary"}>
                        {venceu ? "Encerrada" : "Aberta"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {usuario?.tipo === "Professor" && (
        <NovaAtividadeDialog
          open={open}
          onOpenChange={setOpen}
          idProfessor={usuario.id}
          onCreated={() => setReloadKey((k) => k + 1)}
        />
      )}
    </div>
  );
}

function NovaAtividadeDialog({
  open,
  onOpenChange,
  idProfessor,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  idProfessor: string;
  onCreated: () => void;
}) {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [prazo, setPrazo] = useState("");
  const [idTurma, setIdTurma] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) turmasDoProfessor(idProfessor).then(setTurmas);
  }, [open, idProfessor]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!idTurma) return;
    setSaving(true);
    try {
      await createAtividade({ titulo, descricao, prazo, id_turma: idTurma });
      toast.success("Atividade criada");
      onOpenChange(false);
      setTitulo(""); setDescricao(""); setPrazo(""); setIdTurma("");
      onCreated();
    } catch {
      toast.error("Falha ao criar atividade");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova atividade</DialogTitle>
          <DialogDescription>Defina título, descrição e prazo.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label>Turma</Label>
            <Select value={idTurma} onValueChange={setIdTurma}>
              <SelectTrigger><SelectValue placeholder="Selecione a turma" /></SelectTrigger>
              <SelectContent>
                {turmas.map((t) => {
                  const d = discMock.find((x) => x.id === t.id_disciplina);
                  return <SelectItem key={t.id} value={t.id}>{d?.nome} — {t.semestre}</SelectItem>;
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="titulo">Título</Label>
            <Input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Descrição</Label>
            <Textarea id="desc" rows={5} value={descricao} onChange={(e) => setDescricao(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prazo">Prazo</Label>
            <Input id="prazo" type="date" value={prazo} onChange={(e) => setPrazo(e.target.value)} required />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving || !idTurma}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar atividade
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
