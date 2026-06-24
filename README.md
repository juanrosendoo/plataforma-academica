# Plataforma de Gerenciamento Acadêmico

Plataforma acadêmica baseada em microsserviços para uma startup, com backend em FastAPI, frontend React/Vite, bancos MySQL, API Gateway, Docker Compose e stack de observabilidade com Prometheus, Grafana, Loki e Promtail.

## Serviços

- `auth-service`: autenticação, usuários, senhas com hash e emissão de JWT.
- `academic-service`: disciplinas, turmas, atividades, entregas e notas.
- `gateway-service`: entrada única da API para o frontend.
- `Frontend`: aplicação web React/Vite.
- `db-auth` e `db-academic`: bancos MySQL separados por domínio.
- `prometheus`, `grafana`, `loki`, `promtail`: métricas, dashboards e logs centralizados.

## Execução Local Com Docker Compose

```powershell
cd Backend\infra
copy .env.example .env
docker-compose up --build
```

URLs principais:

- Frontend: `http://localhost:8080`
- API Gateway: `http://localhost:8000`
- Auth Service: `http://localhost:8001`
- Academic Service: `http://localhost:8002`
- Observabilidade: `http://localhost:3100`
- Grafana: `http://localhost:3000`
- Prometheus: `http://localhost:9090`
- Loki API: `http://localhost:3101`

O frontend roda separadamente:

```powershell
cd Frontend
npm install
npm run dev
```

## Credenciais de Demonstração

| Perfil | Email | Senha |
| --- | --- | --- |
| Admin | `admin@uni.edu` | `admin123` |
| Professor | `professor@uni.edu` | `professor123` |
| Professor | `marta@uni.edu` | `professor123` |
| Aluno | `aluno@uni.edu` | `aluno123` |
| Aluno | `maria@uni.edu` | `aluno123` |
| Aluno | `pedro@uni.edu` | `aluno123` |

## Documentação Técnica

- [Arquitetura](docs/architecture.md)
- [Deploy](docs/deployment.md)
- [Observabilidade](docs/observability.md)
- [Roteiro de demonstração](docs/demo.md)

## Desenvolvimento

Fluxo recomendado:

1. Criar branch a partir de `main`.
2. Implementar a tarefa.
3. Executar testes e validações locais.
4. Abrir Pull Request.
5. Realizar Code Review antes do merge.

Estratégia de versionamento sugerida para o projeto: Trunk-Based Development com branches curtas no padrão `feat/*`, `fix/*`, `chore/*` e Pull Requests para `main`.
