from sqlalchemy import Column, Integer, String, Enum
from database import Base
import enum

class TipoUsuario(str, enum.Enum):
    ALUNO = "aluno"
    PROFESSOR = "professor"

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(150), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    senha = Column(String(255), nullable=False)
    tipo = Column(Enum(TipoUsuario), nullable=False)