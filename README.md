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