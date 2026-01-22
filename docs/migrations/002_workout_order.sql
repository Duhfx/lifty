-- Migration: Adicionar ordem aos treinos
-- Execute este script no Supabase SQL Editor

-- =====================================================
-- ADICIONAR COLUNA order_index
-- =====================================================

-- Adiciona coluna order_index para definir ordem da rotina
ALTER TABLE workouts
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- =====================================================
-- ÍNDICE PARA ORDENAÇÃO
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_workouts_user_order
ON workouts(user_id, order_index);

-- =====================================================
-- INICIALIZAR ORDEM BASEADA NA DATA DE CRIAÇÃO
-- =====================================================

-- Define order_index inicial baseado na ordem de criação
WITH ordered_workouts AS (
  SELECT id, user_id,
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) - 1 as new_order
  FROM workouts
)
UPDATE workouts w
SET order_index = ow.new_order
FROM ordered_workouts ow
WHERE w.id = ow.id;

-- =====================================================
-- FIM DA MIGRAÇÃO
-- =====================================================
