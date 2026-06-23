import { delay } from "./http";
import {
  alunos,
  atividades as atividadesMock,
  disciplinas,
  entregas as entregasMock,
  matriculas,
  professores,
  turmas,
  usuarios,
} from "@/lib/mock-data";
import type { Atividade, Disciplina, Entrega, Turma, Usuario } from "@/types";

// Estado em memória para mutação durante a sessão
let _atividades = [...atividadesMock];
let _entregas = [...entregasMock];

export async function listDisciplinas(): Promise<Disciplina[]> {
  return delay([...disciplinas], 500);
}

export async function listTurmas(): Promise<Turma[]> {
  return delay([...turmas], 500);
}

export async function getTurma(id: string) {
  await delay(null, 400);
  const turma = turmas.find((t) => t.id === id);
  if (!turma) throw new Error("Turma não encontrada");
  const disciplina = disciplinas.find((d) => d.id === turma.id_disciplina)!;
  const professor = usuarios.find((u) => u.id === turma.id_professor)!;
  const alunosTurma: Usuario[] = matriculas
    .filter((m) => m.id_turma === id)
    .map((m) => usuarios.find((u) => u.id === m.id_aluno)!)
    .filter(Boolean);
  return { turma, disciplina, professor, alunos: alunosTurma };
}

export async function turmasDoProfessor(idProfessor: string): Promise<Turma[]> {
  return delay(turmas.filter((t) => t.id_professor === idProfessor), 500);
}

export async function turmasDoAluno(idAluno: string): Promise<Turma[]> {
  const ids = matriculas.filter((m) => m.id_aluno === idAluno).map((m) => m.id_turma);
  return delay(turmas.filter((t) => ids.includes(t.id)), 500);
}

export async function listAtividades(): Promise<Atividade[]> {
  return delay([..._atividades], 500);
}

export async function atividadesDaTurma(idTurma: string): Promise<Atividade[]> {
  return delay(_atividades.filter((a) => a.id_turma === idTurma), 400);
}

export async function atividadesDoAluno(idAluno: string): Promise<Atividade[]> {
  const ids = matriculas.filter((m) => m.id_aluno === idAluno).map((m) => m.id_turma);
  return delay(_atividades.filter((a) => ids.includes(a.id_turma)), 500);
}

export async function atividadesDoProfessor(idProfessor: string): Promise<Atividade[]> {
  const ids = turmas.filter((t) => t.id_professor === idProfessor).map((t) => t.id);
  return delay(_atividades.filter((a) => ids.includes(a.id_turma)), 500);
}

export async function getAtividade(id: string) {
  await delay(null, 300);
  const atividade = _atividades.find((a) => a.id === id);
  if (!atividade) throw new Error("Atividade não encontrada");
  const turma = turmas.find((t) => t.id === atividade.id_turma)!;
  const disciplina = disciplinas.find((d) => d.id === turma.id_disciplina)!;
  return { atividade, turma, disciplina };
}

export async function createAtividade(data: Omit<Atividade, "id">): Promise<Atividade> {
  await delay(null, 600);
  const nova: Atividade = { ...data, id: `a${Date.now()}` };
  _atividades = [..._atividades, nova];
  return nova;
}

export async function entregasDaAtividade(idAtividade: string) {
  await delay(null, 400);
  return _entregas
    .filter((e) => e.id_atividade === idAtividade)
    .map((e) => ({
      ...e,
      aluno: usuarios.find((u) => u.id === e.id_aluno)!,
    }));
}

export async function minhaEntrega(idAtividade: string, idAluno: string): Promise<Entrega | null> {
  await delay(null, 300);
  return _entregas.find((e) => e.id_atividade === idAtividade && e.id_aluno === idAluno) ?? null;
}

export async function submeterEntrega(
  idAtividade: string,
  idAluno: string,
  conteudo: string,
): Promise<Entrega> {
  await delay(null, 600);
  const existente = _entregas.find(
    (e) => e.id_atividade === idAtividade && e.id_aluno === idAluno,
  );
  if (existente) {
    existente.conteudo = conteudo;
    existente.dataEntrega = new Date().toISOString().slice(0, 10);
    return existente;
  }
  const nova: Entrega = {
    id: `e${Date.now()}`,
    id_aluno: idAluno,
    id_atividade: idAtividade,
    conteudo,
    dataEntrega: new Date().toISOString().slice(0, 10),
    nota: null,
  };
  _entregas = [..._entregas, nova];
  return nova;
}

export async function atribuirNota(idEntrega: string, nota: number): Promise<Entrega> {
  await delay(null, 500);
  const e = _entregas.find((x) => x.id === idEntrega);
  if (!e) throw new Error("Entrega não encontrada");
  e.nota = nota;
  return e;
}

export function getProfessorInfo(idUsuario: string) {
  return professores.find((p) => p.id_usuario === idUsuario);
}
export function getAlunoInfo(idUsuario: string) {
  return alunos.find((a) => a.id_usuario === idUsuario);
}
