from sqlalchemy import Column, Integer, String, ForeignKey, Date, Float
from sqlalchemy.orm import relationship
from database import Base

class Professor(Base):
    __tablename__ = "professores"
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, unique=True, nullable=False) 
    siape = Column(String(20), unique=True, nullable=False)
    departamento = Column(String(100), nullable=False)
    
    turmas = relationship("Turma", back_populates="professor")

class Aluno(Base):
    __tablename__ = "alunos"
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, unique=True, nullable=False) 
    matricula = Column(String(20), unique=True, nullable=False)
    curso = Column(String(100), nullable=False)

    matriculas_turmas = relationship("Matricula", back_populates="aluno")
    entregas = relationship("Entrega", back_populates="aluno")

class Disciplina(Base):
    __tablename__ = "disciplinas"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(150), nullable=False)
    codigo = Column(String(20), unique=True, nullable=False)
    carga_horaria = Column(Integer, nullable=False)

    turmas = relationship("Turma", back_populates="disciplina")

class Turma(Base):
    __tablename__ = "turmas"
    id = Column(Integer, primary_key=True, index=True)
    semestre = Column(String(10), nullable=False)
    horario = Column(String(50), nullable=False)
    
    disciplina_id = Column(Integer, ForeignKey("disciplinas.id"))
    professor_id = Column(Integer, ForeignKey("professores.id"))

    disciplina = relationship("Disciplina", back_populates="turmas")
    professor = relationship("Professor", back_populates="turmas")
    matriculas = relationship("Matricula", back_populates="turma")
    atividades = relationship("Atividade", back_populates="turma")

class Matricula(Base):
    __tablename__ = "matriculas"
    aluno_id = Column(Integer, ForeignKey("alunos.id"), primary_key=True)
    turma_id = Column(Integer, ForeignKey("turmas.id"), primary_key=True)
    data = Column(Date, nullable=False)
    status = Column(String(20), nullable=False)

    aluno = relationship("Aluno", back_populates="matriculas_turmas")
    turma = relationship("Turma", back_populates="matriculas")

class Atividade(Base):
    __tablename__ = "atividades"
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(150), nullable=False)
    descricao = Column(String(255))
    prazo = Column(Date, nullable=False)
    
    turma_id = Column(Integer, ForeignKey("turmas.id"))
    turma = relationship("Turma", back_populates="atividades")
    entregas = relationship("Entrega", back_populates="atividade")

class Entrega(Base):
    __tablename__ = "entregas"
    aluno_id = Column(Integer, ForeignKey("alunos.id"), primary_key=True)
    atividade_id = Column(Integer, ForeignKey("atividades.id"), primary_key=True)
    data_entrega = Column(Date, nullable=False)
    nota = Column(Float)

    aluno = relationship("Aluno", back_populates="entregas")
    atividade = relationship("Atividade", back_populates="entregas")