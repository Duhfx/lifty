# Configuração do Storage de Avatares no Supabase

Para permitir que os usuários façam upload de fotos de perfil, é necessário criar um bucket no Supabase Storage.

## Passos para configurar:

### 1. Acessar o Supabase Storage
1. Acesse o dashboard do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto Lifty
3. No menu lateral, clique em **Storage**

### 2. Criar o Bucket "avatars"
1. Clique em **New Bucket**
2. Configure:
   - **Name**: `avatars`
   - **Public bucket**: ✅ **Marcar como público** (para permitir acesso às imagens)
   - **File size limit**: 5MB (ou conforme preferir)
   - **Allowed MIME types**: image/jpeg, image/png, image/webp, image/gif

3. Clique em **Create bucket**

### 3. Configurar Políticas de Segurança (RLS)

Após criar o bucket, configure as políticas de acesso:

#### Política 1: Upload de Avatar (Apenas proprietário)
```sql
-- Nome: "Users can upload their own avatar"
-- Operação: INSERT
-- Tabela: avatars
-- Política:
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'avatars' AND
  auth.uid()::text = (storage.filename(name))::text
);
```

#### Política 2: Atualização de Avatar (Apenas proprietário)
```sql
-- Nome: "Users can update their own avatar"
-- Operação: UPDATE
-- Tabela: avatars
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'avatars' AND
  auth.uid()::text = (storage.filename(name))::text
);
```

#### Política 3: Leitura Pública
```sql
-- Nome: "Avatar images are publicly accessible"
-- Operação: SELECT
-- Tabela: avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

#### Política 4: Deletar Avatar (Apenas proprietário)
```sql
-- Nome: "Users can delete their own avatar"
-- Operação: DELETE
-- Tabela: avatars
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'avatars' AND
  auth.uid()::text = (storage.filename(name))::text
);
```

### 4. Aplicar as Políticas

1. No Supabase Dashboard, vá em **Storage** > **Policies**
2. Selecione o bucket `avatars`
3. Clique em **New Policy**
4. Para cada política acima:
   - Clique em **Create a new policy**
   - Cole o SQL correspondente
   - Clique em **Save**

### 5. Verificar Configuração

Após configurar, você pode testar:
1. Fazer login no app
2. Ir em Perfil
3. Clicar no avatar
4. Selecionar uma imagem
5. Verificar se o upload foi bem-sucedido

## Estrutura de Arquivos

Os avatares serão salvos com o seguinte padrão:
```
avatars/
  └── {user_id}-{timestamp}.{ext}
```

Exemplo: `avatars/abc123-1234567890.jpg`

## Troubleshooting

### Erro: "new row violates row-level security policy"
- Verifique se as políticas RLS foram aplicadas corretamente
- Certifique-se de que o bucket está marcado como público

### Erro: "Bucket not found"
- Verifique se o bucket `avatars` foi criado
- Verifique se o nome está correto (minúsculas)

### Imagem não aparece
- Verifique se o bucket é público
- Verifique se a política SELECT está configurada para `public`
- Verifique a URL no console do navegador

## Notas Importantes

- As imagens têm limite de 5MB por padrão
- Formatos aceitos: JPEG, PNG, WebP, GIF
- As imagens antigas são mantidas (não são deletadas automaticamente ao fazer novo upload)
- Para otimização, considere implementar compressão de imagem no futuro
