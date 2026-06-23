import os
from datetime import date

import httpx
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models
import schemas
from database import SessionLocal, engine, get_db
from observability import setup_observability
from seed import seed_academic_data


def seed_data():
    db = SessionLocal()
    try:
        seed_academic_data(db)
    finally:
        db.close()


models.Base.metadata.create_all(bind=engine)
seed_data()

app = FastAPI(title="Academic Service")
setup_observability(app, "academic-service")

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


def get_or_404(db: Session, model, item_id: str, label: str):
    item = db.query(model).filter(model.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail=f"{label} nao encontrada")
    return item


def next_id(db: Session, model, prefix: str) -> str:
    ids = [row[0] for row in db.query(model.id).all()]
    nums = [int(item.removeprefix(prefix)) for item in ids if item.startswith(prefix) and item.removeprefix(prefix).isdigit()]
    return f"{prefix}{max(nums, default=0) + 1}"


@app.get("/")
def health_check():
    db_url = os.getenv("DB_URL", "sqlite:///./academic.db")
    return {"status": "ok", "service": "academic-service", "db_url_config": db_url}


@app.get("/disciplinas", response_model=list[schemas.DisciplinaOut])
def listar_disciplinas(db: Session = Depends(get_db)):
    return db.query(models.Disciplina).order_by(models.Disciplina.codigo).all()


@app.get("/turmas", response_model=list[schemas.TurmaOut])
def listar_turmas(db: Session = Depends(get_db)):
    return db.query(models.Turma).order_by(models.Turma.id).all()


@app.get("/turmas/{turma_id}", response_model=schemas.TurmaDetailOut)
def obter_turma(turma_id: str, db: Session = Depends(get_db)):
    turma = get_or_404(db, models.Turma, turma_id, "Turma")
    alunos = [matricula.aluno.usuario for matricula in turma.matriculas]
    return {
        "turma": turma,
        "disciplina": turma.disciplina,
        "professor": turma.professor.usuario,
        "alunos": alunos,
    }


@app.get("/professores/{id_professor}/turmas", response_model=list[schemas.TurmaOut])
def turmas_do_professor(id_professor: str, db: Session = Depends(get_db)):
    return (
        db.query(models.Turma)
        .filter(models.Turma.id_professor == id_professor)
        .order_by(models.Turma.id)
        .all()
    )


@app.get("/alunos/{id_aluno}/turmas", response_model=list[schemas.TurmaOut])
def turmas_do_aluno(id_aluno: str, db: Session = Depends(get_db)):
    return (
        db.query(models.Turma)
        .join(models.Matricula)
        .filter(models.Matricula.id_aluno == id_aluno)
        .order_by(models.Turma.id)
        .all()
    )


@app.get("/atividades", response_model=list[schemas.AtividadeOut])
def listar_atividades(db: Session = Depends(get_db)):
    return db.query(models.Atividade).order_by(models.Atividade.prazo).all()


@app.post("/atividades", response_model=schemas.AtividadeOut, status_code=201)
def criar_atividade(payload: schemas.AtividadeCreate, db: Session = Depends(get_db)):
    get_or_404(db, models.Turma, payload.id_turma, "Turma")
    atividade = models.Atividade(id=next_id(db, models.Atividade, "a"), **payload.model_dump())
    db.add(atividade)
    db.commit()
    db.refresh(atividade)
    return atividade


@app.get("/turmas/{id_turma}/atividades", response_model=list[schemas.AtividadeOut])
def atividades_da_turma(id_turma: str, db: Session = Depends(get_db)):
    return (
        db.query(models.Atividade)
        .filter(models.Atividade.id_turma == id_turma)
        .order_by(models.Atividade.prazo)
        .all()
    )


@app.get("/alunos/{id_aluno}/atividades", response_model=list[schemas.AtividadeOut])
def atividades_do_aluno(id_aluno: str, db: Session = Depends(get_db)):
    return (
        db.query(models.Atividade)
        .join(models.Turma)
        .join(models.Matricula)
        .filter(models.Matricula.id_aluno == id_aluno)
        .order_by(models.Atividade.prazo)
        .all()
    )


@app.get("/professores/{id_professor}/atividades", response_model=list[schemas.AtividadeOut])
def atividades_do_professor(id_professor: str, db: Session = Depends(get_db)):
    return (
        db.query(models.Atividade)
        .join(models.Turma)
        .filter(models.Turma.id_professor == id_professor)
        .order_by(models.Atividade.prazo)
        .all()
    )


@app.get("/atividades/{atividade_id}", response_model=schemas.AtividadeDetailOut)
def obter_atividade(atividade_id: str, db: Session = Depends(get_db)):
    atividade = get_or_404(db, models.Atividade, atividade_id, "Atividade")
    return {
        "atividade": atividade,
        "turma": atividade.turma,
        "disciplina": atividade.turma.disciplina,
    }


@app.get("/atividades/{id_atividade}/entregas", response_model=list[schemas.EntregaComAlunoOut])
def entregas_da_atividade(id_atividade: str, db: Session = Depends(get_db)):
    entregas = (
        db.query(models.Entrega)
        .filter(models.Entrega.id_atividade == id_atividade)
        .order_by(models.Entrega.dataEntrega)
        .all()
    )
    return [{**schemas.EntregaOut.model_validate(entrega).model_dump(), "aluno": entrega.aluno.usuario} for entrega in entregas]


@app.get("/atividades/{id_atividade}/entregas/{id_aluno}", response_model=schemas.EntregaOut | None)
def minha_entrega(id_atividade: str, id_aluno: str, db: Session = Depends(get_db)):
    return (
        db.query(models.Entrega)
        .filter(models.Entrega.id_atividade == id_atividade, models.Entrega.id_aluno == id_aluno)
        .first()
    )


@app.post("/atividades/{id_atividade}/entregas", response_model=schemas.EntregaOut)
def submeter_entrega(id_atividade: str, payload: schemas.EntregaCreate, db: Session = Depends(get_db)):
    get_or_404(db, models.Atividade, id_atividade, "Atividade")
    aluno = db.query(models.Aluno).filter(models.Aluno.id_usuario == payload.id_aluno).first()
    if not aluno:
        raise HTTPException(status_code=404, detail="Aluno nao encontrado")

    entrega = (
        db.query(models.Entrega)
        .filter(models.Entrega.id_atividade == id_atividade, models.Entrega.id_aluno == payload.id_aluno)
        .first()
    )
    if entrega:
        entrega.conteudo = payload.conteudo
        entrega.dataEntrega = date.today()
    else:
        entrega = models.Entrega(
            id=next_id(db, models.Entrega, "e"),
            id_aluno=payload.id_aluno,
            id_atividade=id_atividade,
            conteudo=payload.conteudo,
            dataEntrega=date.today(),
            nota=None,
        )
        db.add(entrega)

    db.commit()
    db.refresh(entrega)
    return entrega


@app.patch("/entregas/{id_entrega}/nota", response_model=schemas.EntregaOut)
def atribuir_nota(id_entrega: str, payload: schemas.NotaUpdate, db: Session = Depends(get_db)):
    if payload.nota < 0 or payload.nota > 10:
        raise HTTPException(status_code=400, detail="Nota invalida")

    entrega = get_or_404(db, models.Entrega, id_entrega, "Entrega")
    entrega.nota = payload.nota
    db.commit()
    db.refresh(entrega)
    return entrega


@app.get("/professores/info/{id_usuario}", response_model=schemas.ProfessorOut | None)
def professor_info(id_usuario: str, db: Session = Depends(get_db)):
    return db.query(models.Professor).filter(models.Professor.id_usuario == id_usuario).first()


@app.get("/alunos/info/{id_usuario}", response_model=schemas.AlunoOut | None)
def aluno_info(id_usuario: str, db: Session = Depends(get_db)):
    return db.query(models.Aluno).filter(models.Aluno.id_usuario == id_usuario).first()


@app.get("/validar-aluno/{user_id}")
async def validar_aluno(user_id: str):
    url = f"http://auth-service:8000/users/{user_id}"

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url)
            if response.status_code == 200:
                return {"status": "Integrado com sucesso", "dados_auth": response.json()}
            raise HTTPException(status_code=response.status_code, detail="Falha ao consultar Auth Service")
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail="Auth Service indisponivel")


@app.get("/alunos", response_model=list[schemas.AlunoOut])
def listar_alunos(db: Session = Depends(get_db)):
    return db.query(models.Aluno).order_by(models.Aluno.id_usuario).all()
