from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class UsuarioOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    nome: str
    email: str
    tipo: str


class ProfessorOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_usuario: str
    siape: str
    departamento: str


class AlunoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_usuario: str
    matricula: str
    curso: str


class DisciplinaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    nome: str
    codigo: str
    cargaHoraria: int


class TurmaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    semestre: str
    horario: str
    id_disciplina: str
    id_professor: str


class AtividadeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    titulo: str
    descricao: str
    prazo: date
    id_turma: str


class AtividadeCreate(BaseModel):
    titulo: str
    descricao: str
    prazo: date
    id_turma: str


class EntregaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    id_aluno: str
    id_atividade: str
    dataEntrega: date
    conteudo: str
    nota: float | None = None


class EntregaComAlunoOut(EntregaOut):
    aluno: UsuarioOut


class EntregaCreate(BaseModel):
    id_aluno: str
    conteudo: str = Field(min_length=1)


class NotaUpdate(BaseModel):
    nota: float


class TurmaDetailOut(BaseModel):
    turma: TurmaOut
    disciplina: DisciplinaOut
    professor: UsuarioOut
    alunos: list[UsuarioOut]


class AtividadeDetailOut(BaseModel):
    atividade: AtividadeOut
    turma: TurmaOut
    disciplina: DisciplinaOut
