import type {
  Usuario,
  Professor,
  Aluno,
  Disciplina,
  Turma,
  Matricula,
  Atividade,
  Entrega,
} from "@/types";

export const usuarios: Usuario[] = [
  { id: "u1", nome: "Ana Admin", email: "admin@uni.edu", tipo: "Admin" },
  { id: "u2", nome: "Prof. Carlos Silva", email: "professor@uni.edu", tipo: "Professor" },
  { id: "u3", nome: "Prof. Marta Souza", email: "marta@uni.edu", tipo: "Professor" },
  { id: "u4", nome: "João Aluno", email: "aluno@uni.edu", tipo: "Aluno" },
  { id: "u5", nome: "Maria Estudante", email: "maria@uni.edu", tipo: "Aluno" },
  { id: "u6", nome: "Pedro Discente", email: "pedro@uni.edu", tipo: "Aluno" },
];

export const professores: Professor[] = [
  { id_usuario: "u2", siape: "123456", departamento: "Computação" },
  { id_usuario: "u3", siape: "654321", departamento: "Matemática" },
];

export const alunos: Aluno[] = [
  { id_usuario: "u4", matricula: "2024001", curso: "Eng. de Software" },
  { id_usuario: "u5", matricula: "2024002", curso: "Ciência da Computação" },
  { id_usuario: "u6", matricula: "2024003", curso: "Eng. de Software" },
];

export const disciplinas: Disciplina[] = [
  { id: "d1", nome: "Estruturas de Dados", codigo: "INF101", cargaHoraria: 60 },
  { id: "d2", nome: "Banco de Dados", codigo: "INF202", cargaHoraria: 80 },
  { id: "d3", nome: "Cálculo I", codigo: "MAT101", cargaHoraria: 90 },
  { id: "d4", nome: "Engenharia de Software", codigo: "INF303", cargaHoraria: 60 },
];

export const turmas: Turma[] = [
  { id: "t1", semestre: "2026.1", horario: "Seg/Qua 08:00-10:00", id_disciplina: "d1", id_professor: "u2" },
  { id: "t2", semestre: "2026.1", horario: "Ter/Qui 10:00-12:00", id_disciplina: "d2", id_professor: "u2" },
  { id: "t3", semestre: "2026.1", horario: "Seg/Qua 14:00-16:00", id_disciplina: "d3", id_professor: "u3" },
  { id: "t4", semestre: "2026.1", horario: "Sex 08:00-12:00", id_disciplina: "d4", id_professor: "u2" },
];

export const matriculas: Matricula[] = [
  { id_aluno: "u4", id_turma: "t1", data: "2026-02-01", status: "Ativa" },
  { id_aluno: "u4", id_turma: "t2", data: "2026-02-01", status: "Ativa" },
  { id_aluno: "u4", id_turma: "t4", data: "2026-02-01", status: "Ativa" },
  { id_aluno: "u5", id_turma: "t1", data: "2026-02-01", status: "Ativa" },
  { id_aluno: "u5", id_turma: "t3", data: "2026-02-01", status: "Ativa" },
  { id_aluno: "u6", id_turma: "t1", data: "2026-02-01", status: "Ativa" },
  { id_aluno: "u6", id_turma: "t2", data: "2026-02-01", status: "Ativa" },
];

export const atividades: Atividade[] = [
  {
    id: "a1",
    titulo: "Trabalho 1 — Listas Encadeadas",
    descricao: "Implemente uma lista duplamente encadeada com operações de inserção, remoção e busca.",
    prazo: "2026-07-05",
    id_turma: "t1",
  },
  {
    id: "a2",
    titulo: "Projeto SQL — Modelagem",
    descricao: "Modele um banco de dados relacional para um sistema de biblioteca.",
    prazo: "2026-07-10",
    id_turma: "t2",
  },
  {
    id: "a3",
    titulo: "Documento de Requisitos",
    descricao: "Elabore o documento de requisitos funcionais e não funcionais do projeto da turma.",
    prazo: "2026-06-30",
    id_turma: "t4",
  },
];

export const entregas: Entrega[] = [
  {
    id: "e1",
    id_aluno: "u5",
    id_atividade: "a1",
    dataEntrega: "2026-06-20",
    conteudo: "Repositório: github.com/maria/lista-encadeada",
    nota: 9.0,
  },
  {
    id: "e2",
    id_aluno: "u6",
    id_atividade: "a1",
    dataEntrega: "2026-06-21",
    conteudo: "Solução em C++ anexada.",
    nota: null,
  },
];
