# Como Executar a Migração no Supabase

## Passo a Passo

### 1. Acesse o SQL Editor do Supabase

1. Acesse o [dashboard do Supabase](https://app.supabase.com)
2. Selecione seu projeto **Lifty**
3. No menu lateral, clique em **SQL Editor**

### 2. Execute as Migrações

Execute cada arquivo de migração na ordem:

#### Migration 001: Schema Inicial
1. Clique em **New query** (botão verde)
2. Abra o arquivo `docs/migrations/001_initial_schema.sql`
3. **Copie TODO o conteúdo** do arquivo
4. **Cole** no SQL Editor do Supabase
5. Clique em **Run** (ou pressione Ctrl+Enter)

#### Migration 002: Training Programs
1. Clique em **New query** novamente
2. Abra o arquivo `docs/migrations/002_training_programs.sql`
3. Copie e cole o conteúdo
4. Clique em **Run**

#### Migration 003: Program Sharing
1. Clique em **New query**
2. Abra o arquivo `docs/migrations/003_program_sharing.sql`
3. Copie e cole o conteúdo
4. Clique em **Run**

#### Migration 004: Avatar Storage
1. Clique em **New query**
2. Abra o arquivo `docs/migrations/004_setup_avatar_storage.sql`
3. Copie e cole o conteúdo
4. Clique em **Run**

### 3. Verifique se Funcionou

Você deve ver a mensagem: **Success. No rows returned**

Para confirmar que as tabelas foram criadas:

1. No menu lateral, clique em **Table Editor**
2. Você deve ver as seguintes tabelas:
   - `workouts`
   - `workout_exercises`
   - `workout_sessions`
   - `sets`

### 4. Verificar RLS (Row Level Security)

1. Clique em qualquer tabela (ex: `workouts`)
2. Vá na aba **Policies**
3. Você deve ver 4 políticas criadas:
   - Users can view own workouts
   - Users can create own workouts
   - Users can update own workouts
   - Users can delete own workouts

## O que Foi Criado

### Tabelas

1. **workouts** - Treinos do usuário
   - `id`, `user_id`, `name`, `description`, `is_archived`

2. **workout_exercises** - Exercícios de cada treino
   - `id`, `workout_id`, `name`, `muscle_group`, `order_index`

3. **workout_sessions** - Sessões de treino executadas
   - `id`, `user_id`, `workout_id`, `executed_at`, `notes`

4. **sets** - Séries executadas em cada sessão
   - `id`, `session_id`, `workout_exercise_id`, `set_number`, `reps`, `weight`

5. **training_programs** - Programas de treinamento
   - `id`, `user_id`, `name`, `description`, `is_active`, `is_archived`

6. **program_shares** - Compartilhamento de programas
   - `id`, `program_id`, `share_token`, `view_count`, `copy_count`

### Storage Buckets

1. **avatars** - Fotos de perfil dos usuários
   - Bucket público para leitura
   - Limite de 5MB por arquivo
   - Formatos aceitos: JPEG, PNG, WebP, GIF
   - RLS policies para upload/update/delete apenas pelo proprietário

### Segurança (RLS)

Todas as tabelas têm **Row Level Security** habilitado, garantindo que:
- Usuários só podem ver/editar/deletar seus próprios dados
- Dados de outros usuários são completamente inacessíveis

### Índices

Índices criados para otimizar consultas frequentes:
- Buscar treinos por usuário
- Filtrar treinos arquivados
- Listar sessões por data
- Buscar séries por sessão

## Problemas Comuns

### Erro: "relation already exists"

Se você já executou o script antes, algumas tabelas podem já existir. Isso é normal e seguro, pois usamos `IF NOT EXISTS`.

### Erro de permissão

Certifique-se de estar logado com a conta correta no Supabase.

## Próximos Passos

Após executar a migração com sucesso:

1. Teste criar uma conta no app (http://localhost:3000/signup)
2. Faça login
3. Acesse o dashboard

As tabelas estarão prontas para uso quando começarmos a implementar a Fase 2 (Gestão de Treinos).
