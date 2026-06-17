from fastapi import FastAPI
import os
import httpx

app = FastAPI(title="Academic Service")

@app.get("/")
def health_check():
    db_url = os.getenv("DB_URL", "Variável DB_URL não encontrada")
    return {"status": "ok", "service": "academic-service", "db_url_config": db_url}

@app.get("/validar-aluno/{user_id}")
async def validar_aluno(user_id: int):
    # O endereço usa o nome do serviço definido no docker-compose.yml e a porta interna 8000
    url = f"http://auth-service:8000/users/{user_id}" 
    
    async with httpx.AsyncClient() as client:
        try:
            # Dispara a requisição REST GET
            response = await client.get(url)
            
            if response.status_code == 200:
                return {"status": "Integrado com sucesso", "dados_auth": response.json()}
                
            raise HTTPException(status_code=response.status_code, detail="Falha ao consultar Auth Service")
            
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail="Auth Service indisponível")