# Fases de Desenvolvimento - Lifty

## Visão Geral

Este documento detalha o plano de desenvolvimento do **Lifty**, um aplicativo PWA para controle de treinos em academia. O desenvolvimento está estruturado em fases incrementais, priorizando a entrega de valor rápida e a construção de uma base sólida para evolução futura.

**Princípios de Design:**
- Interface moderna, sóbria e premium
- Paleta de cores sofisticada (evitar cores primárias básicas)
- Tipografia moderna (Google Fonts: Inter, Roboto ou Outfit)
- Micro-animações e transições suaves
- Dark mode nativo
- Glassmorphism e gradientes sutis

---

## Fase 0: Preparação e Setup do Projeto ✅

**Duração estimada:** 2-3 dias  
**Status:** ✅ **COMPLETA**

### Objetivos
- Configurar ambiente de desenvolvimento
- Definir estrutura de pastas e convenções
- Configurar ferramentas de qualidade de código
- Estabelecer design system base

### Tarefas

#### 0.1 Setup do Repositório
- [ ] Inicializar repositório Git (usuário fará depois)
- [x] Configurar `.gitignore`
- [x] Criar estrutura de pastas
- [x] Documentar README.md principal

#### 0.2 Setup do Frontend
- [x] Inicializar projeto Next.js com TypeScript
- [x] Configurar PWA (next-pwa instalado)
- [x] Instalar dependências principais:
  - Tailwind CSS ✅
  - Radix UI ✅
  - Recharts ✅
  - Zustand ✅
  - React Hook Form + Zod ✅
  - date-fns ✅
  - Framer Motion ✅
- [x] Configurar ESLint (incluído)
- [x] Configurar variáveis de ambiente (.env.local)

#### 0.3 Setup do Backend
- [x] Inicializar projeto Nest.js com TypeScript
- [x] Instalar dependências principais:
  - @nestjs/config ✅
  - @nestjs/jwt ✅
  - @supabase/supabase-js ✅
  - class-validator ✅
  - class-transformer ✅
- [x] Configurar estrutura modular
- [x] Configurar variáveis de ambiente (.env)
- [x] Configurar CORS

#### 0.4 Setup do Supabase
- [x] Instruções criadas para o usuário

#### 0.5 Design System Base
- [x] Definir paleta de cores premium
- [x] Configurar tokens no Tailwind
- [x] Criar componentes UI base:
  - Button ✅
  - Input ✅
  - Card ✅

### Entregáveis
- ✅ Repositório configurado
- ✅ Frontend e Backend rodando localmente
- ✅ Design system documentado
- ✅ Componentes UI base criados
- ✅ Instruções Supabase documentadas

---

## Fase 1: Autenticação e Estrutura Base ✅ COMPLETA

**Duração estimada:** 5-7 dias  
**Status:** ✅ **COMPLETA**

### Objetivos
- Implementar sistema de autenticação completo
- Criar layout base da aplicação
- Estabelecer comunicação frontend-backend
- Configurar banco de dados inicial

### Tarefas

#### 1.1 Backend - Autenticação
- [x] Criar módulo `auth` ✅:
  - `auth.controller.ts` ✅
  - `auth.service.ts` ✅
  - `supabase.service.ts` ✅
  - `auth.guard.ts` ✅
  - `current-user.decorator.ts` ✅
- [x] Implementar endpoints ✅:
  - `POST /auth/signup` ✅
  - `POST /auth/signin` ✅
  - `POST /auth/refresh` ✅
  - `GET /auth/me` ✅
- [x] Integrar com Supabase Auth ✅
- [x] Validar JWT em todas as rotas protegidas ✅
- [x] Criar decorator `@CurrentUser()` ✅

#### 1.2 Frontend - Autenticação
- [x] Criar páginas ✅:
  - `/login` - Tela de login ✅
  - `/signup` - Tela de cadastro ✅
- [x] Criar serviço de autenticação (`lib/supabase.ts`) ✅
- [x] Criar store de autenticação (Zustand - `authStore.ts`) ✅
- [x] Criar `AuthProvider` ✅
- [x] Implementar proteção de rotas (middleware) ✅

#### 1.3 Banco de Dados - Schema Inicial
- [x] Criar migration inicial no Supabase ✅
- [X] **EXECUTAR** migration no Supabase (ver `docs/migrations/README.md`)
- [x] Tabelas criadas no script ✅:
  ```sql
  - workouts
  - workout_exercises
  - workout_sessions
  - sets
  ```
- [x] Configurar Row Level Security (RLS) ✅ (no script)
- [x] Criar índices para performance ✅ (no script)

#### 1.4 Layout Base da Aplicação
- [x] Criar componente `Layout` ✅
- [x] Navbar premium com logo ✅
- [x] Menu de navegação ✅
- [x] Implementar navegação ✅
- [x] Criar página `/dashboard` ✅
- [x] Middleware de proteção ✅

### Entregáveis
- ✅ Usuário pode criar conta e fazer login
- ✅ Tokens gerenciados corretamente
- ✅ Layout base responsivo e premium
- ✅ Banco de dados estruturado com RLS
- ✅ Rotas protegidas funcionando

---

## Fase 2: Gestão de Treinos ⚡ EM ANDAMENTO

**Duração estimada:** 7-10 dias

### Objetivos
- Implementar CRUD completo de treinos
- Permitir adicionar/editar/remover exercícios em treinos
- Implementar arquivamento de treinos
- Criar interface intuitiva e visualmente atraente

### Tarefas

#### 2.1 Backend - Módulo de Treinos
- [x] Criar módulo `workouts` ✅
- [x] DTOs (CreateWorkoutDto, UpdateWorkoutDto, etc.) ✅
- [x] `workouts.controller.ts` ✅
- [x] `workouts.service.ts` ✅
- [x] Implementar endpoints ✅:
  - `GET /workouts` - Listar treinos (query: archived=true/false) ✅
  - `GET /workouts/:id` - Detalhes do treino ✅
  - `POST /workouts` - Criar treino ✅
  - `PATCH /workouts/:id` - Editar treino ✅
  - `DELETE /workouts/:id` - Deletar treino ✅
  - `PATCH /workouts/:id/archive` - Arquivar/desarquivar ✅
  - `POST /workouts/:id/exercises` - Adicionar exercício ✅
  - `PATCH /workouts/:id/exercises/:exerciseId` - Editar exercício ✅
  - `DELETE /workouts/:id/exercises/:exerciseId` - Remover exercício ✅
  - `PATCH /workouts/:id/exercises/reorder` - Reordenar exercícios ✅
- [x] Implementar validações ✅
- [x] Proteção com AuthGuard ✅

#### 2.2 Frontend - Páginas de Treinos
- [x] Criar página `/workouts` - Lista de treinos ✅:
  - Tabs: "Ativos" e "Arquivados" ✅
  - Cards premium para cada treino ✅
  - Ações: Editar, Arquivar, Deletar ✅
  - Empty state elegante ✅
- [x] Criar página `/workouts/new` - Criar treino ✅:
  - Formulário com validação ✅
  - Seção "Exercícios" ✅
  - Adicionar/remover exercícios ✅
- [x] Criar página `/workouts/:id/edit` - Editar treino ✅:
  - Carregar dados existentes ✅
  - Editar nome e descrição ✅
  - Gerenciar exercícios ✅
- [ ] Implementar drag & drop para reordenar exercícios (opcional)

#### 2.3 Componentes Reutilizáveis
- [x] WorkoutCard integrado na página ✅
- [x] Formulários de exercícios ✅

#### 2.4 Gerenciamento de Estado
- [x] Criar store Zustand para treinos ✅
- [x] Ações: fetch, create, update, delete, archive ✅
- [x] Loading states ✅
- [x] Integração com API ✅

### Entregáveis
- ✅ Usuário pode criar, editar e deletar treinos
- ✅ Adicionar/remover exercícios em treinos
- ⏸️ Reordenar exercícios via drag & drop (opcional - próxima iteração)
- ✅ Arquivar e desarquivar treinos
- ✅ Interface responsiva e premium
- ✅ Validações funcionando corretamente
- ✅ Integração frontend-backend completa

**Status:** ✅ FASE 2 COMPLETA (95% - drag & drop opcional)

---

## Fase 3: Registro de Treinos (Sessões e Séries) ✅ COMPLETA

**Duração estimada:** 10-14 dias  
**Status:** ✅ **COMPLETA**

### Objetivos
- ✅ Implementar fluxo de execução de treino
- ✅ Registrar séries (reps + peso) de forma rápida e intuitiva
- ✅ Criar histórico de sessões
- ✅ Permitir edição de registros passados

### Tarefas

#### 3.1 Backend - Módulo de Sessões
- [x] Criar módulo `sessions` ✅
- [x] DTOs (CreateSessionDto, AddSetDto, etc.) ✅
- [x] Implementar endpoints ✅:
  - `POST /sessions` - Iniciar nova sessão ✅
  - `GET /sessions` - Listar sessões ✅
  - `GET /sessions/:id` - Detalhes da sessão ✅
  - `POST /sessions/:id/sets` - Adicionar série ✅
  - `PATCH /sessions/:id/sets/:setId` - Editar série ✅
  - `DELETE /sessions/:id/sets/:setId` - Deletar série ✅
  - `PATCH /sessions/:id/finish` - Finalizar sessão ✅
  - `DELETE /sessions/:id` - Deletar sessão ✅
- [x] AuthGuard em todas as rotas ✅
- [x] Estatísticas da sessão ✅

#### 3.2 Frontend - Execução de Treino
- [x] Criar página `/workouts/:id/start` ✅:
  - Header com timer funcional ✅
  - Lista de exercícios do treino ✅
  - Formulário rápido para adicionar série ✅
  - Séries registradas exibidas ✅
  - Modal de confirmação ao finalizar ✅
- [x] Timer funcional com contagem ✅
- [x] Botão "Iniciar" na listagem de treinos ✅

#### 3.3 Frontend - Histórico de Treinos
- [x] Criar página `/history` ✅:
  - Lista de sessões ordenada por data ✅
  - Cards com nome, data e duração ✅
  - Botões Ver Detalhes e Deletar ✅
- [x] Criar página `/history/:id` ✅:
  - Estatísticas (duração, séries, volume) ✅
  - Lista de exercícios e séries ✅
  - Notas da sessão ✅

#### 3.4 Gerenciamento de Estado
- [x] Criar `useSessionStore` (Zustand) ✅
- [x] Timer com start/stop/reset ✅
- [x] CRUD completo de sets ✅
- [x] Loading states ✅

### Entregáveis
- ✅ Usuário pode iniciar treino e registrar séries
- ✅ Interface rápida e intuitiva para registro
- ✅ Timer de treino funcional
- ✅ Histórico completo de sessões
- ✅ Estatísticas de volume e séries
- ✅ Validações e feedback visual

---


## Fase 4: Visualização de Evolução (Gráficos) ✅ COMPLETA

**Duração estimada:** 7-10 dias
**Status:** ✅ **COMPLETA**

### Objetivos
- ✅ Implementar gráficos de evolução por exercício
- ✅ Permitir filtros por período
- ✅ Exibir estatísticas relevantes
- ✅ Design premium e responsivo

### Tarefas

#### 4.1 Backend - Módulo de Relatórios
- [x] Criar módulo `reports`:
  - `reports.controller.ts` ✅
  - `reports.service.ts` ✅
- [x] Implementar endpoints:
  - `GET /reports/exercises` - Listar exercícios únicos do usuário ✅
  - `GET /reports/exercises/:exerciseId/max-weight` - Evolução do peso máximo ✅
    - Query params: `startDate`, `endDate`
    - Retornar: `[{ date, maxWeight, reps }]`
  - `GET /reports/exercises/:exerciseId/volume` - Evolução do volume total ✅
  - `GET /reports/exercises/:exerciseId/stats` - Estatísticas gerais ✅:
    - Peso máximo histórico
    - Média de peso
    - Total de séries
    - Última execução
- [x] Implementar lógica:
  - Agrupar séries por data ✅
  - Calcular peso máximo do dia ✅
  - Calcular volume total (soma de reps × peso) ✅
  - Otimizar queries (índices, agregações) ✅

#### 4.2 Frontend - Página de Gráficos
- [x] Criar página `/progress` - Evolução ✅:
  - Seletor de exercício:
    - Dropdown premium ✅
    - Busca/filtro ✅
    - Agrupar por grupo muscular ✅
  - Filtro de período:
    - Tabs: "30 dias", "90 dias", "6 meses", "Todos" ✅
    - Date picker customizado (opcional)
  - Gráfico de linha (Recharts):
    - Eixo X: Datas ✅
    - Eixo Y: Peso máximo (kg) ✅
    - Tooltip customizado ✅:
      - Data
      - Peso máximo
      - Repetições
    - Gradiente sob a linha ✅
    - Animação de entrada
    - Responsivo (mobile: simplificado) ✅
  - Cards de estatísticas ✅:
    - Peso máximo histórico
    - Média de peso
    - Total de séries
    - Última execução
    - Design: Cards com ícones e cores
  - Empty state ✅:
    - Quando exercício não tem dados
    - Mensagem motivacional

#### 4.3 Componentes de Gráficos
- [x] Criar `ProgressChart` ✅:
  - Wrapper do Recharts
  - Configuração premium:
    - Cores do design system
    - Gradientes
    - Tooltips customizados
    - Animações suaves
  - Responsivo (ajustar para mobile)
- [x] Criar `StatCard` ✅:
  - Ícone
  - Valor principal (grande)
  - Label
  - Variação (opcional, ex: +5kg vs. mês anterior)
  - Cores e animações
- [x] Criar `ExerciseSelector` ✅:
  - Dropdown com busca
  - Agrupamento por músculo
  - Design premium

#### 4.4 Otimizações
- [ ] Implementar cache de dados de gráficos (React Query - próxima iteração)
- [ ] Lazy loading de gráficos (próxima iteração)
- [x] Skeleton loading states ✅

### Entregáveis
- ✅ Gráficos de evolução funcionais
- ✅ Filtros por período
- ✅ Estatísticas relevantes exibidas
- ✅ Design premium e responsivo
- ✅ Performance otimizada

---

## Fase 5: PWA e Otimizações

**Duração estimada:** 5-7 dias

### Objetivos
- Configurar PWA completo (instalável)
- Implementar offline-first (básico)
- Otimizar performance
- Preparar para produção

### Tarefas

#### 5.1 Configuração PWA
- [ ] Configurar `next-pwa`:
  - Service Worker
  - Cache strategies:
    - API: Network First (com fallback)
    - Assets estáticos: Cache First
  - Offline fallback page
- [ ] Criar `manifest.json`:
  - Nome: Lifty
  - Ícones (múltiplos tamanhos: 192x192, 512x512)
  - Theme color (do design system)
  - Background color
  - Display: standalone
  - Orientation: portrait
- [ ] Gerar ícones e splash screens:
  - Usar ferramenta: PWA Asset Generator
  - Design premium (logo + gradiente)
- [ ] Testar instalação:
  - Android (Chrome)
  - iOS (Safari)

#### 5.2 Offline-First (Básico)
- [ ] Implementar cache de dados críticos:
  - Lista de treinos
  - Último treino ativo
- [ ] Criar fila de sincronização:
  - Armazenar ações offline (IndexedDB)
  - Sincronizar quando online
  - Feedback visual (badge "Sincronizando...")
- [ ] Detectar status de conexão:
  - Exibir banner quando offline
  - Desabilitar ações que requerem conexão

#### 5.3 Otimizações de Performance
- [ ] Frontend:
  - Code splitting (lazy loading de rotas)
  - Otimizar imagens (next/image)
  - Minificar CSS/JS
  - Remover console.logs
  - Lighthouse audit (score > 90)
- [ ] Backend:
  - Adicionar compressão (gzip)
  - Implementar rate limiting
  - Otimizar queries (EXPLAIN ANALYZE)
  - Adicionar índices faltantes
- [ ] Geral:
  - Configurar CDN (Vercel/Cloudflare)
  - Habilitar HTTP/2

#### 5.4 Testes e Qualidade
- [ ] Testes unitários (backend):
  - Services principais (auth, workouts, sessions)
  - Coverage > 70%
- [ ] Testes E2E (frontend):
  - Fluxo completo: Login → Criar treino → Executar → Ver gráfico
  - Usar Playwright ou Cypress
- [ ] Testes de acessibilidade:
  - Lighthouse (Accessibility score > 90)
  - Navegação por teclado
  - Screen reader friendly

#### 5.5 Deploy e Infraestrutura
- [ ] Frontend:
  - Deploy na Vercel
  - Configurar domínio customizado (opcional)
  - Variáveis de ambiente
- [ ] Backend:
  - Deploy no Railway, Render ou Fly.io
  - Configurar variáveis de ambiente
  - Health check endpoint
- [ ] Supabase:
  - Revisar políticas RLS
  - Configurar backups automáticos
  - Monitoramento de uso
- [ ] CI/CD:
  - GitHub Actions:
    - Lint e testes em PRs
    - Deploy automático em merge

### Entregáveis
- ✅ PWA instalável em Android e iOS
- ✅ Funcionalidade offline básica
- ✅ Performance otimizada (Lighthouse > 90)
- ✅ Testes implementados
- ✅ Aplicação em produção

---

## Fase 6: Refinamentos e Melhorias UX

**Duração estimada:** 5-7 dias

### Objetivos
- Polir interface e interações
- Adicionar micro-animações
- Melhorar onboarding
- Coletar feedback inicial

### Tarefas

#### 6.1 Onboarding
- [ ] Criar tour guiado (primeira vez):
  - Biblioteca: react-joyride ou intro.js
  - Passos:
    1. Bem-vindo ao Lifty
    2. Crie seu primeiro treino
    3. Adicione exercícios
    4. Inicie um treino
    5. Veja sua evolução
  - Design premium (tooltips customizados)
- [ ] Criar página de boas-vindas:
  - Após signup
  - Explicar benefícios
  - CTA: "Criar Primeiro Treino"

#### 6.2 Micro-animações
- [ ] Adicionar animações:
  - Transições de página (Framer Motion)
  - Hover effects em cards e botões
  - Loading spinners customizados
  - Success/error animations (Lottie)
  - Skeleton loaders
- [ ] Feedback tátil:
  - Vibração ao adicionar série (mobile)
  - Haptic feedback em ações importantes

#### 6.3 Melhorias de UX
- [ ] Dashboard aprimorado:
  - Último treino realizado (resumo)
  - Próximo treino sugerido
  - Estatísticas rápidas:
    - Treinos este mês
    - Séries totais
    - Exercício mais frequente
  - Gráfico de frequência semanal
- [ ] Atalhos e produtividade:
  - Botão "Repetir Último Treino"
  - Sugestão de peso baseado em histórico
  - Templates de treino (copiar treino existente)
- [ ] Notificações (opcional):
  - Push notifications (PWA)
  - Lembrete de treino (configurável)

#### 6.4 Perfil e Configurações
- [ ] Criar página `/profile`:
  - Informações do usuário
  - Avatar (upload via Supabase Storage)
  - Editar nome/email
  - Alterar senha
- [ ] Criar página `/settings`:
  - Preferências:
    - Dark mode (toggle)
    - Unidade de peso (kg/lbs)
    - Notificações
  - Sobre o app (versão, termos, privacidade)
  - Logout

#### 6.5 Feedback e Analytics
- [ ] Implementar analytics básico:
  - Google Analytics ou Plausible
  - Eventos:
    - Treino criado
    - Sessão iniciada
    - Sessão finalizada
    - Gráfico visualizado
- [ ] Adicionar formulário de feedback:
  - Modal ou página dedicada
  - Enviar para email ou Notion

### Entregáveis
- ✅ Onboarding intuitivo
- ✅ Micro-animações implementadas
- ✅ Dashboard informativo
- ✅ Perfil e configurações funcionais
- ✅ Analytics configurado

---

## Fase 7: Lançamento e Iteração

**Duração estimada:** Contínua

### Objetivos
- Lançar MVP para usuários beta
- Coletar feedback
- Iterar com base em dados
- Planejar próximas features

### Tarefas

#### 7.1 Preparação para Lançamento
- [ ] Revisar checklist de qualidade:
  - [ ] Todos os fluxos principais funcionam
  - [ ] Sem bugs críticos
  - [ ] Performance aceitável
  - [ ] Responsivo em mobile
  - [ ] PWA instalável
  - [ ] Acessibilidade básica
- [ ] Criar materiais de marketing:
  - Landing page (opcional)
  - Screenshots para app stores
  - Vídeo demo
- [ ] Documentação:
  - FAQ
  - Guia de uso
  - Política de privacidade
  - Termos de uso

#### 7.2 Lançamento Beta
- [ ] Recrutar beta testers:
  - Amigos, família, comunidade
  - 10-20 usuários iniciais
- [ ] Monitorar:
  - Erros (Sentry)
  - Performance (Vercel Analytics)
  - Uso (Google Analytics)
- [ ] Coletar feedback:
  - Formulário in-app
  - Entrevistas 1:1
  - Grupo no WhatsApp/Discord

#### 7.3 Iteração
- [ ] Priorizar melhorias com base em feedback:
  - Bugs críticos (imediato)
  - Melhorias de UX (curto prazo)
  - Novas features (médio prazo)
- [ ] Ciclo de releases:
  - Semanal ou quinzenal
  - Changelog público

#### 7.4 Roadmap Futuro
- [ ] Features planejadas (Fase 2):
  - Metas de treino
  - Progressão automática de carga
  - Exportação de dados (CSV, PDF)
  - Compartilhamento de treinos
  - Biblioteca de exercícios global
  - Fotos de progresso
- [ ] Features planejadas (Fase 3):
  - App nativo (React Native ou Flutter)
  - Modo personal trainer (B2B)
  - Integração com wearables
  - Planos de treino gerados por IA

### Entregáveis
- ✅ MVP lançado para beta
- ✅ Feedback coletado
- ✅ Roadmap atualizado
- ✅ Ciclo de iteração estabelecido

---

## Considerações Finais

### Princípios de Desenvolvimento
1. **Simplicidade primeiro:** Evitar overengineering no MVP
2. **Qualidade visual:** Design premium é diferencial competitivo
3. **Performance:** App deve ser rápido e responsivo
4. **Segurança:** RLS e validações em todas as camadas
5. **Escalabilidade:** Arquitetura preparada para crescimento

### Tecnologias Confirmadas
- **Frontend:** Next.js + TypeScript + Tailwind CSS + Radix UI
- **Backend:** Nest.js + TypeScript
- **Banco:** PostgreSQL (Supabase)
- **Auth:** Supabase Auth
- **Gráficos:** Recharts
- **Estado:** Zustand
- **Animações:** Framer Motion
- **Deploy:** Vercel (frontend) + Railway/Render (backend)

### Estimativa Total
- **Desenvolvimento:** 8-12 semanas (1 desenvolvedor)
- **Custo operacional:** ~$0-20/mês (tier gratuito Supabase + Vercel)

### Próximos Passos
1. Revisar e aprovar este plano
2. Iniciar Fase 0 (Setup)
3. Criar repositório e estrutura inicial
4. Definir design system detalhado (cores, tipografia, componentes)

---

**Documento criado em:** 2026-01-20  
**Versão:** 1.0  
**Autor:** Equipe Lifty
