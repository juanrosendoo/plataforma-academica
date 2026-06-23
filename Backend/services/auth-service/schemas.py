from pydantic import BaseModel, ConfigDict


class UsuarioOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    nome: str
    email: str
    tipo: str


class LoginIn(BaseModel):
    email: str
    senha: str


class LoginOut(BaseModel):
    token: str
    usuario: UsuarioOut
