# PRD – Aplicativo PWA de Controle de Treino em Academia

## 1. Visão Geral

**Nome provisório:** Lifty

**Objetivo do produto:**
Criar um aplicativo web no formato PWA para controle detalhado de treinos em academia, permitindo ao usuário registrar cargas, repetições e acompanhar sua evolução ao longo do tempo, com arquitetura preparada para se tornar um aplicativo mobile oficial no futuro.

**Problema que resolve:**
Usuários que treinam musculação normalmente registram seus treinos em papel ou apps limitados, sem histórico estruturado de evolução por exercício e sem visualizações claras de progresso.

**Público-alvo:**
- Praticantes de musculação iniciantes e intermediários
- Usuários que treinam sozinhos e desejam acompanhar progressão de carga
- Personal trainers (futuro)

## 2. Objetivos de Negócio

**Posicionamento inicial:** B2C (usuário final). Arquitetura preparada para futura expansão B2B (personal trainers, academias), sem compromisso no MVP.

- Oferecer uma ferramenta simples e confiável de registro de treinos
- Criar base para monetização futura (premium, personal trainers, academias)
- Arquitetura escalável para app mobile nativo

## 3. Escopo Inicial (MVP)

**Contexto de desenvolvimento:** Projeto hobby / side project. Priorizar simplicidade, baixo custo operacional e facilidade de manutenção por um único desenvolvedor.

### Funcionalidades Obrigatórias

1. **Autenticação de Usuário**
   - Login e cadastro via Supabase Auth (email/senha, Google)
   - Gerenciamento de sessão e refresh token

2. **Cadastro de Treinos**
   - Criar treino (ex: Treino A, Treino B)
   - Dentro do treino, **adicionar exercícios dinamicamente**
   - Definir ordem dos exercícios
   - Exercícios são criados no contexto do treino (não há catálogo global obrigatório no MVP)

3. **Registro de Séries**
   Para cada exercício em um treino:
   - Número da série
   - Quantidade de repetições
   - Peso (kg) de cada repetição
   - Data/hora

4. **Arquivamento de Treinos**
   - Marcar treino como arquivado
   - Visualizar lista de treinos ativos e arquivados
   - Treinos arquivados são somente leitura

5. **Visualização de Evolução**
   - Gráfico de evolução do **peso máximo por exercício** ao longo do tempo
   - Filtro por período (30 dias, 90 dias, todos)
   - Seleção de exercício

   - Gráfico de evolução do **peso máximo por exercício** ao longo do tempo
   - Filtro por período (30 dias, 90 dias, todos)
   - Seleção de exercício


## 5. Requisitos Funcionais

### 5.1 Autenticação
- Usuário deve conseguir:
  - Criar conta
  - Fazer login/logout
  - Recuperar senha

### 5.2 Treinos e Exercícios
- Criar, editar, excluir treino
- Dentro de um treino:
  - Adicionar exercício (nome, grupo muscular opcional)
  - Editar ou remover exercício do treino
- Não há necessidade de cadastro global de exercícios no MVP
- Arquivar e desarquivar treino
- Listar treinos ativos e arquivados separadamente

### 5.3 Registro de Séries
- Para cada execução de treino:
  - Registrar múltiplas séries por exercício
  - Editar ou excluir registros

### 5.4 Relatórios e Gráficos
- Gráfico de linha:
  - Eixo X: datas
  - Eixo Y: peso máximo do dia para o exercício
- Deve ser possível comparar períodos


### 5.1 Autenticação
- Usuário deve conseguir:
  - Criar conta
  - Fazer login/logout
  - Recuperar senha

### 5.2 Treinos
- Criar, editar, excluir treino
- Arquivar e desarquivar treino
- Listar treinos ativos e arquivados separadamente

### 5.3 Registro de Séries
- Para cada execução de treino:
  - Registrar múltiplas séries por exercício
  - Editar ou excluir registros

### 5.4 Relatórios e Gráficos
- Gráfico de linha:
  - Eixo X: datas
  - Eixo Y: peso máximo do dia para o exercício
- Deve ser possível comparar períodos

## 6. Requisitos Não Funcionais

- Aplicação PWA
  - Instalável em Android/iOS

- Performance
  - Tempo de resposta da API < 300ms em média

- Segurança
  - JWT
  - Row Level Security no Supabase

- Escalabilidade
  - Arquitetura desacoplada frontend/backend

## 7. Arquitetura Técnica

### 7.1 Frontend

- Framework: React + Vite ou Next.js
- PWA: Service Workers + Manifest
- Gráficos: Recharts ou Chart.js

### 7.2 Backend

- **API:** Nest.js (recomendado)
  - Estrutura modular
  - Controllers + Services
  - Validação com class-validator

- Alternativa:
  - Fastify + Zod (mais leve, menos opinionado)

### 7.3 Autenticação

- Supabase Auth
  - JWT validado no backend
  - Middleware de autenticação no Nest.js

### 7.4 Banco de Dados

- PostgreSQL (via Supabase)

Tabelas principais:

- users (gerenciado pelo Supabase)
- workouts
- workout_exercises  *(exercícios pertencem a um treino)*
- workout_sessions
- sets

Exemplo simplificado:

- workouts
  - id
  - user_id
  - name
  - is_archived

- workout_exercises
  - id
  - workout_id
  - name
  - order_index

- workout_sessions
  - id
  - user_id
  - workout_id
  - executed_at

- sets
  - id
  - session_id
  - workout_exercise_id
  - reps
  - weight

## 8. API (Alto Nível)

### Endpoints principais

- POST /auth/login
- GET /workouts
- POST /workouts
- PATCH /workouts/{id}/archive

- POST /sessions
- POST /sessions/{id}/sets

- GET /reports/exercises/{exerciseId}/max-weight

## 9. UX / Telas Principais

1. Tela de Login

2. Dashboard
   - Último treino realizado
   - Atalho para iniciar treino

3. Tela de Edição de Treino
   - Nome do treino
   - Botão: "Adicionar Exercício"
   - Lista de exercícios do treino (reordenável)

4. Tela de Treino Ativo
   - Lista de exercícios do treino
   - Para cada exercício:
     - Campo rápido para reps e peso
     - Adicionar nova série

5. Tela de Histórico
   - Lista de sessões passadas

6. Tela de Gráficos
   - Seleção de exercício (a partir dos exercícios já usados em treinos)
   - Gráfico de evolução


1. Tela de Login
2. Dashboard
   - Último treino realizado
   - Atalho para iniciar treino

3. Tela de Treino Ativo
   - Lista de exercícios
   - Registro rápido de séries

4. Tela de Histórico
   - Lista de sessões passadas

5. Tela de Gráficos
   - Seleção de exercício
   - Gráfico de evolução

## 10. Métricas de Sucesso

- Usuários ativos semanais
- % de usuários que registram treinos por 4 semanas seguidas
- Nº médio de exercícios registrados por usuário

## 11. Riscos

- Abandono precoce do usuário
- Complexidade excessiva no registro de séries
- Dependência forte de UX para retenção


## 13. Roadmap Sugerido

**Premissas:**
- Time pequeno (1 dev)
- Infraestrutura de baixo custo
- Evitar overengineering no MVP
- Boas práticas de segurança



**Fase 1 – MVP**
- Autenticação
- Cadastro de treino
- Registro de séries
- Gráficos básicos

**Fase 2**
- Metas
- Progressão automática
- Exportação

**Fase 3**
- App nativo
- Personal trainers
- Treinos compartilhados

