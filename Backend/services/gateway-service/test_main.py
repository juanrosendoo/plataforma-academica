import httpx
from fastapi.testclient import TestClient

from main import app


client = TestClient(app)


def test_health():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "gateway-service"}


def test_responsibilities_are_documented():
    response = client.get("/responsibilities")

    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "gateway-service"
    assert data["routing_status"] == "active"
    assert data["routes"]["/auth/*"] == "auth-service /auth/*"
    assert "Keep business rules inside domain services" in data["responsibilities"]


def test_cors_allows_local_frontend_ports():
    response = client.options(
        "/health",
        headers={
            "Origin": "http://127.0.0.1:8080",
            "Access-Control-Request-Method": "GET",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://127.0.0.1:8080"


def test_auth_route_preserves_auth_prefix(monkeypatch):
    captured = {}

    async def fake_request(self, method, url, content=None, headers=None):
        captured["method"] = method
        captured["url"] = str(url)
        captured["headers"] = headers
        captured["content"] = content
        return httpx.Response(200, json={"token": "mock-token-u4"})

    monkeypatch.setattr(httpx.AsyncClient, "request", fake_request)

    response = client.post(
        "/auth/login?remember=true",
        json={"email": "aluno@uni.edu", "senha": "x"},
        headers={"Authorization": "Bearer test-token"},
    )

    assert response.status_code == 200
    assert response.json() == {"token": "mock-token-u4"}
    assert captured["method"] == "POST"
    assert captured["url"] == "http://127.0.0.1:8001/auth/login?remember=true"
    assert captured["headers"]["authorization"] == "Bearer test-token"
    assert b"aluno@uni.edu" in captured["content"]


def test_academic_route_strips_academic_prefix(monkeypatch):
    captured = {}

    async def fake_request(self, method, url, content=None, headers=None):
        captured["method"] = method
        captured["url"] = str(url)
        return httpx.Response(200, json=[{"id": "d1", "nome": "Estruturas de Dados"}])

    monkeypatch.setattr(httpx.AsyncClient, "request", fake_request)

    response = client.get("/academic/disciplinas")

    assert response.status_code == 200
    assert response.json()[0]["id"] == "d1"
    assert captured["method"] == "GET"
    assert captured["url"] == "http://127.0.0.1:8002/disciplinas"


def test_downstream_error_status_is_preserved(monkeypatch):
    async def fake_request(self, method, url, content=None, headers=None):
        return httpx.Response(404, json={"detail": "Nao encontrado"})

    monkeypatch.setattr(httpx.AsyncClient, "request", fake_request)

    response = client.get("/academic/turmas/missing")

    assert response.status_code == 404
    assert response.json() == {"detail": "Nao encontrado"}


def test_unavailable_downstream_returns_503(monkeypatch):
    async def fake_request(self, method, url, content=None, headers=None):
        request = httpx.Request(method, url)
        raise httpx.ConnectError("connection failed", request=request)

    monkeypatch.setattr(httpx.AsyncClient, "request", fake_request)

    response = client.get("/academic/disciplinas")

    assert response.status_code == 503
    assert response.json() == {"detail": "Downstream service unavailable"}
