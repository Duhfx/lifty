-- Migration: Add Program Sharing Support
-- Date: 2026-01-21
-- Description: Creates program_shares table and public sharing functionality

-- =====================================================
-- 1. CREATE program_shares TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS program_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,
    share_token VARCHAR(32) UNIQUE NOT NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    view_count INTEGER DEFAULT 0 NOT NULL,
    copy_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    last_accessed_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- 2. CREATE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_program_shares_token ON program_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_program_shares_program_id ON program_shares(program_id);
CREATE INDEX IF NOT EXISTS idx_program_shares_created_by ON program_shares(created_by);

-- =====================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE program_shares ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read shares (public access via token)
CREATE POLICY program_shares_public_select ON program_shares
    FOR SELECT
    USING (true);

-- Policy: Users can only create shares for their own programs
CREATE POLICY program_shares_insert_policy ON program_shares
    FOR INSERT
    WITH CHECK (
        created_by = auth.uid() AND
        EXISTS (
            SELECT 1 FROM training_programs
            WHERE id = program_shares.program_id
            AND user_id = auth.uid()
        )
    );

-- Policy: Users can only update their own shares
CREATE POLICY program_shares_update_policy ON program_shares
    FOR UPDATE
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

-- Policy: Users can only delete their own shares
CREATE POLICY program_shares_delete_policy ON program_shares
    FOR DELETE
    USING (created_by = auth.uid());

-- =====================================================
-- 4. FUNCTION: Get Shared Program (Public Access)
-- =====================================================

CREATE OR REPLACE FUNCTION get_shared_program(token TEXT)
RETURNS TABLE (
    program_id UUID,
    program_name VARCHAR(255),
    program_description TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    creator_email VARCHAR(255),
    workout_count INTEGER,
    workouts JSONB
) AS $$
BEGIN
    -- Increment view counter
    UPDATE program_shares
    SET view_count = view_count + 1,
        last_accessed_at = NOW()
    WHERE share_token = token;

    -- Return program data
    RETURN QUERY
    SELECT
        tp.id,
        tp.name,
        tp.description,
        tp.start_date,
        tp.end_date,
        COALESCE(u.email, 'Usuário') as creator_email,
        (SELECT COUNT(*)::INTEGER FROM workouts w WHERE w.program_id = tp.id AND w.is_archived = false),
        COALESCE(
            (SELECT jsonb_agg(
                jsonb_build_object(
                    'id', w.id,
                    'name', w.name,
                    'description', w.description,
                    'order_index', w.order_index,
                    'exercises', (
                        SELECT jsonb_agg(
                            jsonb_build_object(
                                'name', we.name,
                                'muscle_group', we.muscle_group,
                                'suggested_sets', we.suggested_sets,
                                'suggested_reps', we.suggested_reps,
                                'notes', we.notes,
                                'order_index', we.order_index
                            ) ORDER BY we.order_index
                        )
                        FROM workout_exercises we
                        WHERE we.workout_id = w.id
                    )
                ) ORDER BY w.order_index
            )
            FROM workouts w
            WHERE w.program_id = tp.id AND w.is_archived = false),
            '[]'::jsonb
        )
    FROM program_shares ps
    JOIN training_programs tp ON tp.id = ps.program_id
    LEFT JOIN auth.users u ON u.id = tp.user_id
    WHERE ps.share_token = token
    AND tp.is_archived = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. FUNCTION: Increment Copy Count
-- =====================================================

CREATE OR REPLACE FUNCTION increment_copy_count(token TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE program_shares
    SET copy_count = copy_count + 1
    WHERE share_token = token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. COMMENTS
-- =====================================================

COMMENT ON TABLE program_shares IS 'Stores public sharing links for training programs';
COMMENT ON COLUMN program_shares.share_token IS 'Unique token for public access (32 char hex)';
COMMENT ON COLUMN program_shares.view_count IS 'Number of times the share link was accessed';
COMMENT ON COLUMN program_shares.copy_count IS 'Number of times the program was copied';
COMMENT ON FUNCTION get_shared_program IS 'Public function to retrieve shared program data by token';
