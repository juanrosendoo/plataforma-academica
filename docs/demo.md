# Roteiro De Demonstração

Este roteiro foi pensado para a apresentação final do projeto.

## 1. Preparação

Abrir Docker Desktop e confirmar que ele está rodando.

Subir backend, bancos e observabilidade:

```powershell
cd Backend\infra
copy .env.example .env
docker-compose up --build
```

Em outro terminal, subir frontend:

```powershell
cd Frontend
npm install
npm run dev
```

URLs:

- Frontend: `http://localhost:8080`
- API Gateway: `http://localhost:8000`
- Observabilidade: `http://localhost:3100`
- Grafana: `http://localhost:3000`
- Prometheus: `http://localhost:9090`

## 2. Mostrar Arquitetura

Abrir `docs/architecture.md` e explicar:

- Separação em microsserviços.
- API Gateway como entrada única.
- `auth_db` separado de `academic_db`.
- JWT para autenticação.
- Observabilidade com Prometheus, Grafana, Loki e Promtail.

## 3. Login Como Aluno

No frontend:

```text
http://localhost:8080
```

Credenciais:

```text
Email: aluno@uni.edu
Senha: aluno123
```

Demonstrar:

- Login com JWT.
- Visualização de turmas.
- Visualização de atividades.
- Submissão de entrega.

Fluxo técnico:

```text
Frontend -> API Gateway -> auth-service
Frontend -> API Gateway -> academic-service
```

## 4. Login Como Professor

Credenciais:

```text
Email: professor@uni.edu
Senha: professor123
```

Demonstrar:

- Acesso às turmas do professor.
- Criação de atividade.
- Visualização de entregas.
- Atribuição de nota.

## 5. Fluxo De Atividade, Entrega E Nota

Usar o frontend ou Swagger para demonstrar:

1. Professor cria atividade.
2. Aluno envia entrega.
3. Professor atribui nota.
4. Sistema atualiza os dados acadêmicos.

Swagger:

- Gateway: `http://localhost:8000/docs`
- Auth: `http://localhost:8001/docs`
- Academic: `http://localhost:8002/docs`

Endpoints úteis via gateway:

```text
GET http://localhost:8000/health
POST http://localhost:8000/auth/login
GET http://localhost:8000/academic/disciplinas
GET http://localhost:8000/academic/turmas
GET http://localhost:8000/academic/atividades
```

## 6. Mostrar Observabilidade

Abrir:

```text
http://localhost:3100
```

Demonstrar:

- Link para Grafana.
- Link para Prometheus targets.
- Link para readiness do Loki.

Abrir Prometheus:

```text
http://localhost:9090/targets
```

Mostrar targets `UP`.

Abrir Grafana:

```text
http://localhost:3000
```

Login:

```text
admin / admin
```

Abrir dashboard:

```text
Observabilidade da Plataforma Acadêmica
```

Mostrar:

- Taxa de requisições.
- Latência P95.
- Erros 5xx em `0`.
- Requisições em andamento.
- Logs dos serviços.

Gerar tráfego:

```powershell
Invoke-RestMethod http://localhost:8000/health
Invoke-RestMethod http://localhost:8000/academic/disciplinas
Invoke-RestMethod http://localhost:8000/academic/turmas
```

## 7. Mostrar Pipeline CI

No GitHub, abrir a aba:

```text
Actions
```

Demonstrar que o pipeline executa:

- Testes backend.
- Lint backend com Ruff.
- Lint frontend com `npm run lint`.
- Auditoria frontend com `npm audit`.
- Auditoria backend com `pip-audit`.
- Scan com Trivy.
- Build das imagens Docker.

## 8. Mostrar Imagens No GHCR

No GitHub, abrir:

```text
Packages
```

Imagens esperadas:

```text
ghcr.io/juanrosendoo/plataforma-academica/auth-service:<version>
ghcr.io/juanrosendoo/plataforma-academica/academic-service:<version>
ghcr.io/juanrosendoo/plataforma-academica/gateway-service:<version>
```

Tags esperadas:

- `vYYYY.MM.DD.run_number`
- `latest`
- `sha-<short_sha>`

## 9. Deploy Local Kubernetes

Confirmar contexto:

```powershell
kubectl config current-context
kubectl get nodes
```

Deploy esperado:

```powershell
.\scripts\deploy-local-k8s.ps1 -Version vYYYY.MM.DD.run_number
```

Verificar:

```powershell
kubectl get pods -n plataforma-academica
kubectl get svc -n plataforma-academica
kubectl rollout status deployment/auth-service -n plataforma-academica
kubectl rollout status deployment/academic-service -n plataforma-academica
kubectl rollout status deployment/gateway-service -n plataforma-academica
```

Testar gateway no Kubernetes:

```powershell
kubectl port-forward svc/gateway-service 8000:8000 -n plataforma-academica
Invoke-RestMethod http://localhost:8000/health
```

## 10. Demonstrar Rollback

Executar:

```powershell
.\scripts\rollback-local-k8s.ps1
```

Ou manualmente:

```powershell
kubectl rollout undo deployment/auth-service -n plataforma-academica
kubectl rollout undo deployment/academic-service -n plataforma-academica
kubectl rollout undo deployment/gateway-service -n plataforma-academica
```

Validar:

```powershell
kubectl rollout status deployment/auth-service -n plataforma-academica
kubectl rollout status deployment/academic-service -n plataforma-academica
kubectl rollout status deployment/gateway-service -n plataforma-academica
```

## 11. Fechamento Da Apresentação

Pontos para destacar:

- O sistema usa microsserviços independentes.
- Cada serviço possui banco ou responsabilidade própria.
- API Gateway centraliza o acesso.
- JWT protege ações acadêmicas.
- Docker Compose sobe a infraestrutura local.
- Observabilidade cobre métricas, logs e dashboards.
- CI/CD gera qualidade, imagens versionadas e base para deploy.
- Kubernetes local demonstra a estratégia de entrega automatizada.
