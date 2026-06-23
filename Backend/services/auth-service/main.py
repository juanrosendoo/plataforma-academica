import os

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models
import schemas
from database import SessionLocal, engine, get_db
from observability import setup_observability
from seed import seed_auth_data


def seed_data():
    db = SessionLocal()
    try:
        seed_auth_data(db)
    finally:
        db.close()


models.Base.metadata.create_all(bind=engine)
seed_data()

app = FastAPI(title="Auth Service")
setup_observability(app, "auth-service")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def seed_data_on_startup():
    seed_data()


def usuario_from_token(authorization: str | None, db: Session) -> models.Usuario:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token ausente")

    token = authorization.removeprefix("Bearer ").strip()
    if not token.startswith("mock-token-"):
        raise HTTPException(status_code=401, detail="Token invalido")

    user_id = token.replace("mock-token-", "", 1)
    usuario = db.query(models.Usuario).filter(models.Usuario.id == user_id).first()
    if not usuario:
        raise HTTPException(status_code=401, detail="Sessao invalida")
    return usuario


@app.get("/")
def health_check():
    db_url = os.getenv("DB_URL", "sqlite:///./auth.db")
    return {"status": "ok", "service": "auth-service", "db_url_config": db_url}


@app.post("/auth/login", response_model=schemas.LoginOut)
def login(payload: schemas.LoginIn, db: Session = Depends(get_db)):
    if not payload.senha:
        raise HTTPException(status_code=400, detail="Senha obrigatoria")

    usuario = (
        db.query(models.Usuario)
        .filter(models.Usuario.email == payload.email.lower())
        .first()
    )
    if not usuario:
        raise HTTPException(status_code=401, detail="Credenciais invalidas")

    return {"token": f"mock-token-{usuario.id}", "usuario": usuario}


@app.get("/auth/me", response_model=schemas.UsuarioOut)
def me(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
):
    return usuario_from_token(authorization, db)


@app.get("/users/{user_id}")
def get_user_status(user_id: str, db: Session = Depends(get_db)):
    usuario = db.query(models.Usuario).filter(models.Usuario.id == user_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario nao encontrado")
    return {"user_id": usuario.id, "active": True, "role": usuario.tipo.value}
