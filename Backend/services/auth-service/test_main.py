from fastapi.testclient import TestClient

from main import app


client = TestClient(app)


def test_read_root():
    response = client.get("/")
    assert response.status_code == 200


def test_metrics_endpoint_exposes_prometheus_metrics():
    response = client.get("/metrics")

    assert response.status_code == 200
    assert "text/plain" in response.headers["content-type"]
    assert "http_requests_total" in response.text


def test_login_and_me():
    response = client.post(
        "/auth/login",
        json={"email": "aluno@uni.edu", "senha": "aluno123"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["token"].count(".") == 2
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


def test_login_rejects_wrong_password():
    response = client.post(
        "/auth/login",
        json={"email": "aluno@uni.edu", "senha": "senha-errada"},
    )

    assert response.status_code == 401
