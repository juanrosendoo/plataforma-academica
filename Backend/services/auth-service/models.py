import enum

from sqlalchemy import Column, Enum, String

from database import Base


class TipoUsuario(str, enum.Enum):
    ADMIN = "Admin"
    PROFESSOR = "Professor"
    ALUNO = "Aluno"


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(String(20), primary_key=True, index=True)
    nome = Column(String(150), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    senha = Column(String(255), nullable=False)
    tipo = Column(Enum(TipoUsuario), nullable=False)
