from fastapi import FastAPI
import os

app = FastAPI(title="Auth Service")

@app.get("/")
def health_check():
    # Isso prova que a variável de ambiente do Docker Compose está funcionando
    db_url = os.getenv("DB_URL", "Variável DB_URL não encontrada")
    return {"status": "ok", "service": "auth-service", "db_url_config": db_url}

@app.get("/users/{user_id}")
def get_user_status(user_id: int):
    # Retorno simulando validação de usuário
    return {"user_id": user_id, "active": True, "role": "student"}