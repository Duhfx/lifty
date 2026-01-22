-- Migration 005: Enhanced Workflow
-- Date: 2026-01-20
-- Description: Adds period to programs and suggested sets/reps to exercises

-- =====================================================
-- 1. ADD period TO training_programs
-- =====================================================

ALTER TABLE training_programs 
ADD COLUMN IF NOT EXISTS period VARCHAR(100);

COMMENT ON COLUMN training_programs.period IS 'Optional period label for the training program, e.g. "Bulking Nov-Jan 2025"';

-- =====================================================
-- 2. ADD suggested_sets AND suggested_reps TO workout_exercises
-- =====================================================

ALTER TABLE workout_exercises 
ADD COLUMN IF NOT EXISTS suggested_sets INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS suggested_reps INTEGER DEFAULT 12;

COMMENT ON COLUMN workout_exercises.suggested_sets IS 'Recommended number of sets for this exercise';
COMMENT ON COLUMN workout_exercises.suggested_reps IS 'Recommended number of repetitions per set';
