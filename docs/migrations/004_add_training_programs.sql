-- Migration: Add Training Programs Support
-- Date: 2026-01-20
-- Description: Creates training_programs table and links workouts to programs

-- =====================================================
-- 1. CREATE training_programs TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS training_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT false NOT NULL,
    is_archived BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- 2. ADD program_id TO workouts TABLE
-- =====================================================

ALTER TABLE workouts 
ADD COLUMN IF NOT EXISTS program_id UUID REFERENCES training_programs(id) ON DELETE SET NULL;

-- =====================================================
-- 3. CREATE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_training_programs_user_id ON training_programs(user_id);
CREATE INDEX IF NOT EXISTS idx_training_programs_user_active ON training_programs(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_workouts_program_id ON workouts(program_id);

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE training_programs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own programs
CREATE POLICY training_programs_select_policy ON training_programs
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can only insert their own programs
CREATE POLICY training_programs_insert_policy ON training_programs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own programs
CREATE POLICY training_programs_update_policy ON training_programs
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only delete their own programs
CREATE POLICY training_programs_delete_policy ON training_programs
    FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- 5. TRIGGER: Update updated_at timestamp
-- =====================================================

CREATE OR REPLACE FUNCTION update_training_programs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_training_programs_updated_at
    BEFORE UPDATE ON training_programs
    FOR EACH ROW
    EXECUTE FUNCTION update_training_programs_updated_at();

-- =====================================================
-- 6. TRIGGER: Ensure only one active program per user
-- =====================================================

CREATE OR REPLACE FUNCTION ensure_single_active_program()
RETURNS TRIGGER AS $$
BEGIN
    -- If setting a program to active, deactivate all others for this user
    IF NEW.is_active = true AND (TG_OP = 'INSERT' OR OLD.is_active = false) THEN
        UPDATE training_programs
        SET is_active = false
        WHERE user_id = NEW.user_id
          AND id != NEW.id
          AND is_active = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ensure_single_active_program
    BEFORE INSERT OR UPDATE ON training_programs
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_active_program();

-- =====================================================
-- 7. COMMENTS
-- =====================================================

COMMENT ON TABLE training_programs IS 'Training programs that group multiple workouts';
COMMENT ON COLUMN training_programs.is_active IS 'Only one program can be active per user at a time';
COMMENT ON COLUMN training_programs.is_archived IS 'Archived programs are hidden from main view';
COMMENT ON COLUMN workouts.program_id IS 'Links workout to a training program';
