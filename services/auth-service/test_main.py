from fastapi.testclient import TestClient
from main import app  # Certifique-se de que a sua instância do FastAPI se chama 'app' no arquivo main.py

client = TestClient(app)

def test_read_root():
    response = client.get("/")  # Testa a rota raiz
    assert response.status_code == 200