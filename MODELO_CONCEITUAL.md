# Modelo Conceitual - Banco de Dados da Plataforma

Esse documento descreve a modelagem de dados da plataforma acadêmica, detalhando as entidades, atributos e os relacionamentos que estruturam o banco de dados central (`mysql:8.0`).

---

## 1. Dicionário de Entidades e Atributos

### Entidade: Usuario
Responsável por armazenar as credenciais básicas de acesso à plataforma. É a tabela base utilizada pelo `auth-service`.
*   `id` (Chave Primária): Identificador único do usuário.
*   `nome`: Nome completo do usuário.
*   `email`: Endereço de e-mail (utilizado como login).
*   `senha`: Hash seguro da senha de acesso.
*   `tipo`: Define o perfil do usuário na plataforma (ex: "Administrador", "Professor", "Aluno").

### Entidade: Professor
Extensão dos dados do usuário com informações específicas para o corpo docente.
*   `id` (Chave Primária / Chave Estrangeira): Vinculado diretamente ao `id` da tabela `Usuario`.
*   `siape`: Registro funcional do professor na instituição.
*   `departamento`: Setor ou área acadêmica à qual o professor pertence.

### Entidade: Aluno
Extensão dos dados do usuário com informações específicas para o corpo discente.
*   `id` (Chave Primária / Chave Estrangeira): Vinculado diretamente ao `id` da tabela `Usuario`.
*   `matricula`: Código de identificação estudantil único.
*   `curso`: Nome do curso de graduação ao qual o aluno está vinculado.

### Entidade: Disciplina
Representa as matérias ofertadas pela instituição de ensino.
*   `id` (Chave Primária): Identificador único da disciplina.
*   `nome`: Nome da matéria (ex: "Arquitetura DevOps").
*   `codigo`: Código acadêmico da disciplina (ex: "ENG123").
*   `cargaHoraria`: Quantidade de horas totais da disciplina.

### Entidade: Turma
Instanciação de uma disciplina em um período letivo específico.
*   `id` (Chave Primária): Identificador único da turma.
*   `semestre`: O período em que a turma está ocorrendo (ex: "2026.1").
*   `horario`: Dias e horários das aulas.

### Entidade: Atividade
Tarefas ou avaliações criadas por um professor dentro de uma turma específica.
*   `id` (Chave Primária): Identificador único da atividade.
*   `titulo`: Título descritivo da tarefa.
*   `descricao`: Detalhes, instruções e requisitos da atividade.
*   `prazo`: Data e horário limite para o envio.

---

## 2. Relacionamentos e Regras de Negócio

*   **Professor -> Turma (Ministra):** Relacionamento de **1:N** (Um para Muitos). Um professor pode ministrar várias turmas ao longo do semestre, mas cada turma possui apenas um professor responsável associado a ela.
*   **Disciplina -> Turma (Composição):** Relacionamento de **1:N**. Uma disciplina base pode dar origem a múltiplas turmas físicas ou virtuais diferentes no mesmo semestre ou em semestres distintos.
*   **Aluno -> Turma (Matricula):** Relacionamento de **N:M** (Muitos para Muitos). Um aluno pode se matricular em várias turmas, e uma turma conterá vários alunos. Esse vínculo gera a tabela associativa **Matricula**, que armazena os atributos:
    *   `data`: Data em que a inscrição foi realizada.
    *   `status`: Situação do aluno na disciplina (ex: "Ativo", "Trancado", "Concluído").
*   **Turma -> Atividade (Possui):** Relacionamento de **1:N**. Uma turma pode ter uma lista de diversas atividades agendadas, mas cada atividade pertence exclusivamente àquela turma onde foi criada.
*   **Aluno -> Atividade (Entrega):** Relacionamento de **N:M**. Diversos alunos realizam entregas para diversas atividades da grade. Esse vínculo gera a tabela associativa **Entrega**, que armazena os atributos:
    *   `dataEntrega`: Momento exato em que o aluno submeteu a resolução.
    *   `nota`: Valor da pontuação atribuída pelo professor após a correção (campo populado a posteriori).