-- Migration 006: Add exercise notes and program dates
-- Description: Adds notes field to workout_exercises and replaces period with structured dates in training_programs
-- Date: 2026-01-21

-- Add notes field to workout_exercises table
ALTER TABLE workout_exercises
ADD COLUMN notes TEXT;

-- Remove old period field and add structured date fields to training_programs
ALTER TABLE training_programs
DROP COLUMN period,
ADD COLUMN start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN end_date TIMESTAMP WITH TIME ZONE;

-- Add constraint to ensure end_date is after start_date (when both are provided)
ALTER TABLE training_programs
ADD CONSTRAINT check_program_dates
CHECK (end_date IS NULL OR start_date IS NULL OR end_date > start_date);

-- Add helpful comments for documentation
COMMENT ON COLUMN workout_exercises.notes IS 'Exercise-specific observations and instructions (max 500 chars suggested in UI)';
COMMENT ON COLUMN training_programs.start_date IS 'Program start date (optional)';
COMMENT ON COLUMN training_programs.end_date IS 'Program end date (optional)';

-- Update RLS policies remain unchanged (they reference user_id which isn't affected)
