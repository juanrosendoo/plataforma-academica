from fastapi.testclient import TestClient

from main import app


client = TestClient(app)


def test_read_root():
    response = client.get("/")
    assert response.status_code == 200


def test_login_and_me():
    response = client.post(
        "/auth/login",
        json={"email": "aluno@uni.edu", "senha": "qualquer-senha"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["token"] == "mock-token-u4"
    assert data["usuario"]["tipo"] == "Aluno"

    me = client.get("/auth/me", headers={"Authorization": f"Bearer {data['token']}"})
    assert me.status_code == 200
    assert me.json()["email"] == "aluno@uni.edu"


def test_login_rejects_unknown_user():
    response = client.post(
        "/auth/login",
        json={"email": "missing@uni.edu", "senha": "x"},
    )

    assert response.status_code == 401
