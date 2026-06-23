from sqlalchemy import Column, Date, Float, ForeignKey, String, Text, Integer
from sqlalchemy.orm import relationship

from database import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(String(20), primary_key=True, index=True)
    nome = Column(String(150), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    tipo = Column(String(20), nullable=False)


class Professor(Base):
    __tablename__ = "professores"

    id_usuario = Column(String(20), ForeignKey("usuarios.id"), primary_key=True)
    siape = Column(String(20), unique=True, nullable=False)
    departamento = Column(String(100), nullable=False)

    usuario = relationship("Usuario")
    turmas = relationship("Turma", back_populates="professor")


class Aluno(Base):
    __tablename__ = "alunos"

    id_usuario = Column(String(20), ForeignKey("usuarios.id"), primary_key=True)
    matricula = Column(String(20), unique=True, nullable=False)
    curso = Column(String(100), nullable=False)

    usuario = relationship("Usuario")
    matriculas_turmas = relationship("Matricula", back_populates="aluno")
    entregas = relationship("Entrega", back_populates="aluno")


class Disciplina(Base):
    __tablename__ = "disciplinas"

    id = Column(String(20), primary_key=True, index=True)
    nome = Column(String(150), nullable=False)
    codigo = Column(String(20), unique=True, nullable=False)
    cargaHoraria = Column(Integer, nullable=False)

    turmas = relationship("Turma", back_populates="disciplina")


class Turma(Base):
    __tablename__ = "turmas"

    id = Column(String(20), primary_key=True, index=True)
    semestre = Column(String(10), nullable=False)
    horario = Column(String(50), nullable=False)
    id_disciplina = Column(String(20), ForeignKey("disciplinas.id"), nullable=False)
    id_professor = Column(String(20), ForeignKey("professores.id_usuario"), nullable=False)

    disciplina = relationship("Disciplina", back_populates="turmas")
    professor = relationship("Professor", back_populates="turmas")
    matriculas = relationship("Matricula", back_populates="turma")
    atividades = relationship("Atividade", back_populates="turma")


class Matricula(Base):
    __tablename__ = "matriculas"

    id_aluno = Column(String(20), ForeignKey("alunos.id_usuario"), primary_key=True)
    id_turma = Column(String(20), ForeignKey("turmas.id"), primary_key=True)
    data = Column(Date, nullable=False)
    status = Column(String(20), nullable=False)

    aluno = relationship("Aluno", back_populates="matriculas_turmas")
    turma = relationship("Turma", back_populates="matriculas")


class Atividade(Base):
    __tablename__ = "atividades"

    id = Column(String(20), primary_key=True, index=True)
    titulo = Column(String(150), nullable=False)
    descricao = Column(Text, nullable=False)
    prazo = Column(Date, nullable=False)
    id_turma = Column(String(20), ForeignKey("turmas.id"), nullable=False)

    turma = relationship("Turma", back_populates="atividades")
    entregas = relationship("Entrega", back_populates="atividade")


class Entrega(Base):
    __tablename__ = "entregas"

    id = Column(String(20), primary_key=True, index=True)
    id_aluno = Column(String(20), ForeignKey("alunos.id_usuario"), nullable=False)
    id_atividade = Column(String(20), ForeignKey("atividades.id"), nullable=False)
    dataEntrega = Column(Date, nullable=False)
    conteudo = Column(Text, nullable=False)
    nota = Column(Float)

    aluno = relationship("Aluno", back_populates="entregas")
    atividade = relationship("Atividade", back_populates="entregas")
