from datetime import date

from sqlalchemy.orm import Session

import models


USUARIOS = [
    {"id": "u1", "nome": "Ana Admin", "email": "admin@uni.edu", "tipo": "Admin"},
    {"id": "u2", "nome": "Prof. Carlos Silva", "email": "professor@uni.edu", "tipo": "Professor"},
    {"id": "u3", "nome": "Prof. Marta Souza", "email": "marta@uni.edu", "tipo": "Professor"},
    {"id": "u4", "nome": "Joao Aluno", "email": "aluno@uni.edu", "tipo": "Aluno"},
    {"id": "u5", "nome": "Maria Estudante", "email": "maria@uni.edu", "tipo": "Aluno"},
    {"id": "u6", "nome": "Pedro Discente", "email": "pedro@uni.edu", "tipo": "Aluno"},
]

PROFESSORES = [
    {"id_usuario": "u2", "siape": "123456", "departamento": "Computacao"},
    {"id_usuario": "u3", "siape": "654321", "departamento": "Matematica"},
]

ALUNOS = [
    {"id_usuario": "u4", "matricula": "2024001", "curso": "Eng. de Software"},
    {"id_usuario": "u5", "matricula": "2024002", "curso": "Ciencia da Computacao"},
    {"id_usuario": "u6", "matricula": "2024003", "curso": "Eng. de Software"},
]

DISCIPLINAS = [
    {"id": "d1", "nome": "Estruturas de Dados", "codigo": "INF101", "cargaHoraria": 60},
    {"id": "d2", "nome": "Banco de Dados", "codigo": "INF202", "cargaHoraria": 80},
    {"id": "d3", "nome": "Calculo I", "codigo": "MAT101", "cargaHoraria": 90},
    {"id": "d4", "nome": "Engenharia de Software", "codigo": "INF303", "cargaHoraria": 60},
]

TURMAS = [
    {"id": "t1", "semestre": "2026.1", "horario": "Seg/Qua 08:00-10:00", "id_disciplina": "d1", "id_professor": "u2"},
    {"id": "t2", "semestre": "2026.1", "horario": "Ter/Qui 10:00-12:00", "id_disciplina": "d2", "id_professor": "u2"},
    {"id": "t3", "semestre": "2026.1", "horario": "Seg/Qua 14:00-16:00", "id_disciplina": "d3", "id_professor": "u3"},
    {"id": "t4", "semestre": "2026.1", "horario": "Sex 08:00-12:00", "id_disciplina": "d4", "id_professor": "u2"},
]

MATRICULAS = [
    {"id_aluno": "u4", "id_turma": "t1", "data": date(2026, 2, 1), "status": "Ativa"},
    {"id_aluno": "u4", "id_turma": "t2", "data": date(2026, 2, 1), "status": "Ativa"},
    {"id_aluno": "u4", "id_turma": "t4", "data": date(2026, 2, 1), "status": "Ativa"},
    {"id_aluno": "u5", "id_turma": "t1", "data": date(2026, 2, 1), "status": "Ativa"},
    {"id_aluno": "u5", "id_turma": "t3", "data": date(2026, 2, 1), "status": "Ativa"},
    {"id_aluno": "u6", "id_turma": "t1", "data": date(2026, 2, 1), "status": "Ativa"},
    {"id_aluno": "u6", "id_turma": "t2", "data": date(2026, 2, 1), "status": "Ativa"},
]

ATIVIDADES = [
    {
        "id": "a1",
        "titulo": "Trabalho 1 - Listas Encadeadas",
        "descricao": "Implemente uma lista duplamente encadeada com operacoes de insercao, remocao e busca.",
        "prazo": date(2026, 7, 5),
        "id_turma": "t1",
    },
    {
        "id": "a2",
        "titulo": "Projeto SQL - Modelagem",
        "descricao": "Modele um banco de dados relacional para um sistema de biblioteca.",
        "prazo": date(2026, 7, 10),
        "id_turma": "t2",
    },
    {
        "id": "a3",
        "titulo": "Documento de Requisitos",
        "descricao": "Elabore o documento de requisitos funcionais e nao funcionais do projeto da turma.",
        "prazo": date(2026, 6, 30),
        "id_turma": "t4",
    },
]

ENTREGAS = [
    {
        "id": "e1",
        "id_aluno": "u5",
        "id_atividade": "a1",
        "dataEntrega": date(2026, 6, 20),
        "conteudo": "Repositorio: github.com/maria/lista-encadeada",
        "nota": 9.0,
    },
    {
        "id": "e2",
        "id_aluno": "u6",
        "id_atividade": "a1",
        "dataEntrega": date(2026, 6, 21),
        "conteudo": "Solucao em C++ anexada.",
        "nota": None,
    },
]


def seed_academic_data(db: Session) -> None:
    if db.query(models.Disciplina).first():
        return

    for usuario in USUARIOS:
        db.add(models.Usuario(**usuario))
    for professor in PROFESSORES:
        db.add(models.Professor(**professor))
    for aluno in ALUNOS:
        db.add(models.Aluno(**aluno))
    for disciplina in DISCIPLINAS:
        db.add(models.Disciplina(**disciplina))
    for turma in TURMAS:
        db.add(models.Turma(**turma))
    for matricula in MATRICULAS:
        db.add(models.Matricula(**matricula))
    for atividade in ATIVIDADES:
        db.add(models.Atividade(**atividade))
    for entrega in ENTREGAS:
        db.add(models.Entrega(**entrega))
    db.commit()
