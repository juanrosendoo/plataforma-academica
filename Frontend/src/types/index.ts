export type TipoUsuario = "Admin" | "Professor" | "Aluno";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  tipo: TipoUsuario;
}

export interface Professor {
  id_usuario: string;
  siape: string;
  departamento: string;
}

export interface Aluno {
  id_usuario: string;
  matricula: string;
  curso: string;
}

export interface Disciplina {
  id: string;
  nome: string;
  codigo: string;
  cargaHoraria: number;
}

export interface Turma {
  id: string;
  semestre: string;
  horario: string;
  id_disciplina: string;
  id_professor: string;
}

export interface Matricula {
  id_aluno: string;
  id_turma: string;
  data: string;
  status: "Ativa" | "Trancada" | "Concluida";
}

export interface Atividade {
  id: string;
  titulo: string;
  descricao: string;
  prazo: string;
  id_turma: string;
}

export interface Entrega {
  id: string;
  id_aluno: string;
  id_atividade: string;
  dataEntrega: string;
  conteudo: string;
  nota: number | null;
}
