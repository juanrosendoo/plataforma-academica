# Deploy

## Visão Geral

O projeto suporta dois modos de execução:

- Desenvolvimento local com Docker Compose.
- Deploy local em Kubernetes usando Docker Desktop Kubernetes.

Para a entrega final, a estratégia definida é:

- Registry: GitHub Container Registry, `ghcr.io`.
- Versionamento automático via GitHub Actions.
- Deploy local em Kubernetes.
- Scripts PowerShell para aplicar manifests e realizar rollback.

## Docker Compose Local

Pré-requisitos:

- Docker Desktop.
- Docker Compose.
- Node.js e npm para rodar o frontend localmente.

Passos:

```powershell
cd Backend\infra
copy .env.example .env
docker-compose up --build
```

Serviços principais:

| Serviço | URL |
| --- | --- |
| API Gateway | `http://localhost:8000` |
| Auth Service | `http://localhost:8001` |
| Academic Service | `http://localhost:8002` |
| Grafana | `http://localhost:3000` |
| Observabilidade | `http://localhost:3100` |
| Loki API | `http://localhost:3101` |
| Prometheus | `http://localhost:9090` |

Frontend:

```powershell
cd Frontend
npm install
npm run dev
```

URL:

```text
http://localhost:8080
```

## Variáveis De Ambiente

O Docker Compose lê variáveis a partir de `Backend/infra/.env`.

Use `Backend/infra/.env.example` como base:

```env
MYSQL_ROOT_PASSWORD=change-me
AUTH_DB_NAME=auth_db
ACADEMIC_DB_NAME=academic_db

JWT_SECRET_KEY=change-this-secret
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=60

AUTH_SERVICE_URL=http://auth-service:8000
ACADEMIC_SERVICE_URL=http://academic-service:8000
LOG_LEVEL=INFO
```

O arquivo `.env` não deve ser commitado.

## Imagens No GHCR

Padrão definido para as imagens:

```text
ghcr.io/<owner>/<repo>/auth-service:<version>
ghcr.io/<owner>/<repo>/academic-service:<version>
ghcr.io/<owner>/<repo>/gateway-service:<version>
```

Para este repositório, o formato esperado é:

```text
ghcr.io/juanrosendoo/plataforma-academica/auth-service:<version>
ghcr.io/juanrosendoo/plataforma-academica/academic-service:<version>
ghcr.io/juanrosendoo/plataforma-academica/gateway-service:<version>
```

Tags esperadas:

- `vYYYY.MM.DD.run_number`
- `latest`
- `sha-<short_sha>`

Observação: a implementação final do workflow de build e push fica na parte da Pessoa A.

## Kubernetes Local

Plataforma alvo: Docker Desktop Kubernetes.

Pré-requisitos:

- Docker Desktop com Kubernetes habilitado.
- `kubectl` configurado para o contexto do Docker Desktop.
- Imagens publicadas no GHCR.

Verificação:

```powershell
kubectl config current-context
kubectl get nodes
```

Contexto esperado:

```text
docker-desktop
```

## Estrutura Esperada De Manifests

A estrutura definida para a Pessoa A criar é:

```text
k8s/
  namespace.yaml
  secrets.example.yaml
  configmap.yaml
  mysql-auth.yaml
  mysql-academic.yaml
  auth-service.yaml
  academic-service.yaml
  gateway-service.yaml
  observability/
    prometheus.yaml
    grafana.yaml
    loki.yaml
    promtail.yaml
```

Namespace:

```text
plataforma-academica
```

## Deploy Local Em Kubernetes

Script esperado:

```text
scripts/deploy-local-k8s.ps1
```

Comando esperado:

```powershell
.\scripts\deploy-local-k8s.ps1 -Version vYYYY.MM.DD.run_number
```

O script deve:

1. Criar o namespace.
2. Aplicar secrets e configmaps.
3. Aplicar bancos MySQL.
4. Aplicar serviços backend.
5. Aplicar observabilidade.
6. Atualizar imagens dos deployments com a versão informada.
7. Aguardar rollouts.

Comandos equivalentes esperados:

```powershell
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/mysql-auth.yaml
kubectl apply -f k8s/mysql-academic.yaml
kubectl apply -f k8s/auth-service.yaml
kubectl apply -f k8s/academic-service.yaml
kubectl apply -f k8s/gateway-service.yaml
kubectl apply -f k8s/observability/
```

## Verificação Do Deploy

```powershell
kubectl get pods -n plataforma-academica
kubectl get svc -n plataforma-academica
kubectl rollout status deployment/auth-service -n plataforma-academica
kubectl rollout status deployment/academic-service -n plataforma-academica
kubectl rollout status deployment/gateway-service -n plataforma-academica
```

Health checks esperados:

```powershell
kubectl port-forward svc/gateway-service 8000:8000 -n plataforma-academica
Invoke-RestMethod http://localhost:8000/health
```

Endpoints esperados:

- Gateway: `/health`
- Auth Service: `/`
- Academic Service: `/`
- Métricas: `/metrics`

## Rollback

Script esperado:

```text
scripts/rollback-local-k8s.ps1
```

Comando esperado:

```powershell
.\scripts\rollback-local-k8s.ps1
```

Comandos equivalentes:

```powershell
kubectl rollout undo deployment/auth-service -n plataforma-academica
kubectl rollout undo deployment/academic-service -n plataforma-academica
kubectl rollout undo deployment/gateway-service -n plataforma-academica
```

Validação após rollback:

```powershell
kubectl rollout status deployment/auth-service -n plataforma-academica
kubectl rollout status deployment/academic-service -n plataforma-academica
kubectl rollout status deployment/gateway-service -n plataforma-academica
```

## Observações Para A Entrega

Como o alvo escolhido é Kubernetes local, o GitHub Actions não precisa acessar diretamente o cluster local. O pipeline deve:

1. Rodar testes, lint e verificações de segurança.
2. Construir as imagens.
3. Publicar no GHCR.
4. Gerar versão automática.

O deploy final é executado localmente por script usando as imagens versionadas.
