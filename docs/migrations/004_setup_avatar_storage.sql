-- ============================================
-- Migration: Setup Avatar Storage
-- Description: Create avatars bucket and RLS policies
-- Date: 2026-01-22
-- ============================================

-- PARTE 1: LIMPEZA - Remover políticas e buckets antigos se existirem
-- ============================================

-- Remover todas as políticas relacionadas a avatares/profiles em storage.objects
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'storage'
        AND tablename = 'objects'
        AND (policyname ILIKE '%avatar%' OR policyname ILIKE '%profile%')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', policy_record.policyname);
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- Remover bucket se existir (cuidado: isso deleta todos os arquivos)
-- DELETE FROM storage.buckets WHERE id = 'avatars';

-- PARTE 2: CRIAÇÃO - Criar bucket e políticas
-- ============================================

-- 1. Criar o bucket 'avatars' (público para leitura)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB em bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- 2. Política: Upload de Avatar (Apenas proprietário)
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (SPLIT_PART(name, '/', 1) = 'avatars' OR name LIKE auth.uid()::text || '%')
);

-- 3. Política: Atualização de Avatar (Apenas proprietário)
CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (SPLIT_PART(name, '/', 1) = 'avatars' OR name LIKE auth.uid()::text || '%')
)
WITH CHECK (
  bucket_id = 'avatars' AND
  (SPLIT_PART(name, '/', 1) = 'avatars' OR name LIKE auth.uid()::text || '%')
);

-- 4. Política: Leitura Pública (Qualquer pessoa pode ver avatares)
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- 5. Política: Deletar Avatar (Apenas proprietário)
CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (SPLIT_PART(name, '/', 1) = 'avatars' OR name LIKE auth.uid()::text || '%')
);

-- PARTE 3: VERIFICAÇÃO - Conferir se tudo foi criado corretamente
-- ============================================

-- Verificar bucket criado
SELECT
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id = 'avatars';

-- Verificar políticas criadas
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage'
AND policyname LIKE '%avatar%'
ORDER BY policyname;
