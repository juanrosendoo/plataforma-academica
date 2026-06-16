from fastapi import FastAPI
import os

app = FastAPI(title="Academic Service")

@app.get("/")
def health_check():
    db_url = os.getenv("DB_URL", "Variável DB_URL não encontrada")
    return {"status": "ok", "service": "academic-service", "db_url_config": db_url}