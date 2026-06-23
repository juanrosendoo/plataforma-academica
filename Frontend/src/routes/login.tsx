import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GraduationCap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { login, usuario } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (usuario) navigate({ to: "/dashboard", replace: true });
  }, [usuario, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(email, senha);
      toast.success(`Bem-vindo(a), ${u.nome}!`);
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      toast.error("Falha na autenticação", {
        description: err instanceof Error ? err.message : "Verifique e-mail e senha.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6" />
          <span className="font-semibold">Plataforma Acadêmica</span>
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold leading-tight">
            Gerencie disciplinas, turmas e atividades em um só lugar.
          </h1>
          <p className="text-primary-foreground/80">
            Uma experiência unificada para administradores, professores e alunos.
          </p>
        </div>
        <p className="text-xs text-primary-foreground/60">© Universidade — todos os direitos reservados.</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Entrar</CardTitle>
            <CardDescription>Acesse com seu e-mail institucional.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="voce@uni.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Entrar
              </Button>
              <div className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
                <p className="mb-1 font-medium text-foreground">Usuários de teste (qualquer senha):</p>
                <ul className="space-y-0.5">
                  <li>admin@uni.edu — Administrador</li>
                  <li>professor@uni.edu — Professor</li>
                  <li>aluno@uni.edu — Aluno</li>
                </ul>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
