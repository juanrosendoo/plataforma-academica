# Plataforma de Gerenciamento Acadêmico

## Documento Arquitetural e Definição dos Microsserviços
Para atender ao cenário de uma plataforma acadêmica escalável voltada para o modelo de negócios de uma startup, optamos por uma arquitetura baseada em microsserviços. O sistema foi dividido inicialmente em dois serviços independentes para garantir a separação de responsabilidades e evitar o acoplamento do código:

1. **Auth Service**: Responsável centralizado pelo gerenciamento de usuários (professores e alunos), credenciais, armazenamento seguro de senhas e autenticação simples.
2. **Academic Service**: Responsável pelas regras de negócio acadêmicas core, controlando o ciclo de vida de disciplinas, turmas, atividades, entregas e matrículas.

### Justificativas e Decisões Técnicas
*   **Stack Tecnológica:** As APIs REST foram desenvolvidas em **Python** utilizando o framework **FastAPI** e o servidor **Uvicorn**. Escolhemos o FastAPI por sua alta performance, suporte nativo a operações assíncronas e geração automatizada de documentação (Swagger UI), o que acelera o desenvolvimento de microsserviços.
*   **Banco de Dados:** O banco de dados escolhido foi o **MySQL 8.0**. Como o domínio acadêmico possui entidades altamente estruturadas e ligadas por fortes relacionamentos (como Aluno, Turma e Matrícula), o modelo relacional garante a consistência e a integridade referencial dos dados exigidas pelo sistema.
*   **Comunicação:** A comunicação entre os serviços ocorrerá via chamadas HTTP seguindo o padrão **API REST**, permitindo que o *Academic Service* consulte o *Auth Service* para validar usuários de forma rápida e síncrona.
*   **Isolamento e Segurança:** Cada microsserviço roda em seu próprio container Docker de forma totalmente independente, garantindo o isolamento da infraestrutura exigido pelo projeto. Seguindo as boas práticas de DevOps, todas as credenciais e strings de conexão foram externalizadas em um arquivo `.env` local e são injetadas dinamicamente nos containers via variáveis de ambiente, impedindo a exposição de dados sensíveis no código-fonte.

*Nota: O modelo conceitual (diagrama que detalha as entidades Usuario, Aluno, Professor, Disciplina, Turma, Matricula, Atividade e Entrega) encontra-se na pasta raiz deste repositório para avaliação do modelo de dados.*

## Como rodar o projeto (Sprint 1)
Navegue até a pasta `infra/` e execute o comando para subir toda a infraestrutura de forma orquestrada:
```bash
docker-compose up --build
```

## API Gateway Responsibilities
The `gateway-service` is the planned single public API entry point for the frontend. Its responsibility is to centralize browser-facing concerns such as CORS, basic request logging, health checks, service URL configuration, and forwarding authentication headers to downstream services.

The gateway must not own academic or authentication business rules. User data remains in `auth-service`, and academic data such as classes, activities, submissions, and grades remains in `academic-service`.

The gateway exposes `/auth/*` for auth-service requests and `/academic/*` for academic-service requests. For example, `POST /auth/login` is forwarded to auth-service as `/auth/login`, while `GET /academic/disciplinas` is forwarded to academic-service as `/disciplinas`.

## Authentication
The platform uses PBKDF2 password hashes in `auth-service` and signed JWT access tokens. The frontend stores the returned token and sends it as `Authorization: Bearer <token>` through the API Gateway.

Demo credentials:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@uni.edu` | `admin123` |
| Professor | `professor@uni.edu` | `professor123` |
| Professor | `marta@uni.edu` | `professor123` |
| Aluno | `aluno@uni.edu` | `aluno123` |
| Aluno | `maria@uni.edu` | `aluno123` |
| Aluno | `pedro@uni.edu` | `aluno123` |

Protected academic actions require valid roles:

- Professors or admins can create activities.
- Students can submit only their own deliveries.
- Professors or admins can assign grades.

## Environment Configuration
Docker Compose reads environment variables from `Backend/infra/.env`.

For local development, use:

```bash
cd Backend/infra
cp .env.example .env
docker compose up --build
```

The `.env` file is ignored by Git because it may contain local secrets. Commit `.env.example`, not `.env`.

## Database Access
When running with Docker Compose, two MySQL databases are exposed locally:

| Service | Host | Port | Database | User |
| --- | --- | --- | --- | --- |
| Auth DB | `localhost` | `3308` | `auth_db` | `root` |
| Academic DB | `localhost` | `3307` | `academic_db` | `root` |

The password comes from `MYSQL_ROOT_PASSWORD` in `Backend/infra/.env`.

You can inspect the databases with a GUI such as DBeaver or MySQL Workbench using the connection data above.

You can also use Docker directly:

```bash
docker compose exec db-auth mysql -uroot -p auth_db
docker compose exec db-academic mysql -uroot -p academic_db
```

Useful SQL commands:

```sql
SHOW TABLES;
SELECT * FROM usuarios;
SELECT * FROM atividades;
SELECT * FROM entregas;
```
