import base64
import hashlib
import hmac
import json
from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient

from main import app


client = TestClient(app)


def _b64encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def token(user_id: str, tipo: str) -> str:
    now = datetime.now(timezone.utc)
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "sub": user_id,
        "tipo": tipo,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=60)).timestamp()),
    }
    signing_input = ".".join(
        [
            _b64encode(json.dumps(header, separators=(",", ":")).encode()),
            _b64encode(json.dumps(payload, separators=(",", ":")).encode()),
        ]
    )
    signature = hmac.new(b"dev-secret-change-me", signing_input.encode(), hashlib.sha256).digest()
    return f"{signing_input}.{_b64encode(signature)}"


def auth(user_id: str, tipo: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token(user_id, tipo)}"}


def test_list_disciplinas():
    response = client.get("/disciplinas")

    assert response.status_code == 200
    assert response.json()[0]["codigo"] == "INF101"


def test_get_turma_detail():
    response = client.get("/turmas/t1")

    assert response.status_code == 200
    data = response.json()
    assert data["turma"]["id"] == "t1"
    assert data["disciplina"]["id"] == "d1"
    assert len(data["alunos"]) == 3


def test_create_submit_and_grade_flow_with_roles():
    created = client.post(
        "/atividades",
        json={
            "titulo": "Teste API",
            "descricao": "Atividade criada pelo teste",
            "prazo": "2026-08-01",
            "id_turma": "t1",
        },
        headers=auth("u2", "Professor"),
    )

    assert created.status_code == 201
    atividade_id = created.json()["id"]

    entrega = client.post(
        f"/atividades/{atividade_id}/entregas",
        json={"id_aluno": "u4", "conteudo": "Entrega de teste"},
        headers=auth("u4", "Aluno"),
    )

    assert entrega.status_code == 200
    entrega_id = entrega.json()["id"]

    nota = client.patch(
        f"/entregas/{entrega_id}/nota",
        json={"nota": 9.5},
        headers=auth("u2", "Professor"),
    )
    assert nota.status_code == 200
    assert nota.json()["nota"] == 9.5


def test_create_activity_requires_professor_or_admin():
    response = client.post(
        "/atividades",
        json={
            "titulo": "Bloqueada",
            "descricao": "Aluno nao pode criar",
            "prazo": "2026-08-01",
            "id_turma": "t1",
        },
        headers=auth("u4", "Aluno"),
    )

    assert response.status_code == 403


def test_submit_delivery_requires_own_student_token():
    response = client.post(
        "/atividades/a1/entregas",
        json={"id_aluno": "u5", "conteudo": "Tentativa invalida"},
        headers=auth("u4", "Aluno"),
    )

    assert response.status_code == 403


def test_grade_requires_professor_token():
    response = client.patch(
        "/entregas/e1/nota",
        json={"nota": 8.0},
        headers=auth("u4", "Aluno"),
    )

    assert response.status_code == 403
