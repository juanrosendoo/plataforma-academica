from fastapi.testclient import TestClient

from main import app


client = TestClient(app)


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


def test_create_submit_and_grade_flow():
    created = client.post(
        "/atividades",
        json={
            "titulo": "Teste API",
            "descricao": "Atividade criada pelo teste",
            "prazo": "2026-08-01",
            "id_turma": "t1",
        },
    )

    assert created.status_code == 201
    atividade_id = created.json()["id"]

    entrega = client.post(
        f"/atividades/{atividade_id}/entregas",
        json={"id_aluno": "u4", "conteudo": "Entrega de teste"},
    )

    assert entrega.status_code == 200
    entrega_id = entrega.json()["id"]

    nota = client.patch(f"/entregas/{entrega_id}/nota", json={"nota": 9.5})
    assert nota.status_code == 200
    assert nota.json()["nota"] == 9.5
