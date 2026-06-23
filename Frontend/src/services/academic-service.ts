import { ACADEMIC_BASE_URL, http } from "./http";
import type { Atividade, Disciplina, Entrega, Turma, Usuario } from "@/types";

export async function listDisciplinas(): Promise<Disciplina[]> {
  return http<Disciplina[]>(ACADEMIC_BASE_URL, "/disciplinas");
}

export async function listTurmas(): Promise<Turma[]> {
  return http<Turma[]>(ACADEMIC_BASE_URL, "/turmas");
}

export async function getTurma(id: string) {
  return http<{
    turma: Turma;
    disciplina: Disciplina;
    professor: Usuario;
    alunos: Usuario[];
  }>(ACADEMIC_BASE_URL, `/turmas/${id}`);
}

export async function turmasDoProfessor(idProfessor: string): Promise<Turma[]> {
  return http<Turma[]>(ACADEMIC_BASE_URL, `/professores/${idProfessor}/turmas`);
}

export async function turmasDoAluno(idAluno: string): Promise<Turma[]> {
  return http<Turma[]>(ACADEMIC_BASE_URL, `/alunos/${idAluno}/turmas`);
}

export async function listAtividades(): Promise<Atividade[]> {
  return http<Atividade[]>(ACADEMIC_BASE_URL, "/atividades");
}

export async function atividadesDaTurma(idTurma: string): Promise<Atividade[]> {
  return http<Atividade[]>(ACADEMIC_BASE_URL, `/turmas/${idTurma}/atividades`);
}

export async function atividadesDoAluno(idAluno: string): Promise<Atividade[]> {
  return http<Atividade[]>(ACADEMIC_BASE_URL, `/alunos/${idAluno}/atividades`);
}

export async function atividadesDoProfessor(idProfessor: string): Promise<Atividade[]> {
  return http<Atividade[]>(ACADEMIC_BASE_URL, `/professores/${idProfessor}/atividades`);
}

export async function getAtividade(id: string) {
  return http<{
    atividade: Atividade;
    turma: Turma;
    disciplina: Disciplina;
  }>(ACADEMIC_BASE_URL, `/atividades/${id}`);
}

export async function createAtividade(data: Omit<Atividade, "id">): Promise<Atividade> {
  return http<Atividade>(ACADEMIC_BASE_URL, "/atividades", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function entregasDaAtividade(idAtividade: string) {
  return http<(Entrega & { aluno: Usuario })[]>(
    ACADEMIC_BASE_URL,
    `/atividades/${idAtividade}/entregas`,
  );
}

export async function minhaEntrega(idAtividade: string, idAluno: string): Promise<Entrega | null> {
  return http<Entrega | null>(ACADEMIC_BASE_URL, `/atividades/${idAtividade}/entregas/${idAluno}`);
}

export async function submeterEntrega(
  idAtividade: string,
  idAluno: string,
  conteudo: string,
): Promise<Entrega> {
  return http<Entrega>(ACADEMIC_BASE_URL, `/atividades/${idAtividade}/entregas`, {
    method: "POST",
    body: JSON.stringify({ id_aluno: idAluno, conteudo }),
  });
}

export async function atribuirNota(idEntrega: string, nota: number): Promise<Entrega> {
  return http<Entrega>(ACADEMIC_BASE_URL, `/entregas/${idEntrega}/nota`, {
    method: "PATCH",
    body: JSON.stringify({ nota }),
  });
}

export async function getProfessorInfo(idUsuario: string) {
  return http(ACADEMIC_BASE_URL, `/professores/info/${idUsuario}`);
}

export async function getAlunoInfo(idUsuario: string) {
  return http(ACADEMIC_BASE_URL, `/alunos/info/${idUsuario}`);
}
