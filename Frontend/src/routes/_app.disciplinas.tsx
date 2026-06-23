import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { listDisciplinas } from "@/services/academic-service";
import { useAuth } from "@/lib/auth-context";
import type { Disciplina } from "@/types";

export const Route = createFileRoute("/_app/disciplinas")({
  component: DisciplinasPage,
});

function DisciplinasPage() {
  const { usuario } = useAuth();
  const [items, setItems] = useState<Disciplina[] | null>(null);

  useEffect(() => {
    listDisciplinas().then(setItems);
  }, []);

  return (
    <div>
      <PageHeader
        title="Disciplinas"
        description="Catálogo de disciplinas oferecidas."
        actions={
          usuario?.tipo === "Admin" && (
            <Button onClick={() => toast.info("Em breve: cadastro de disciplina.")}>
              <Plus className="mr-2 h-4 w-4" /> Nova disciplina
            </Button>
          )
        }
      />
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="w-40 text-right">Carga horária</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!items &&
                [...Array(4)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-64" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-12" /></TableCell>
                  </TableRow>
                ))}
              {items?.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-mono text-sm">{d.codigo}</TableCell>
                  <TableCell className="font-medium">{d.nome}</TableCell>
                  <TableCell className="text-right">{d.cargaHoraria}h</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
