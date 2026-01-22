-- Migration: Add Creator Name to Shared Program
-- Date: 2026-01-22
-- Description: Updates get_shared_program function to include creator's full name

-- =====================================================
-- 1. UPDATE get_shared_program FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION get_shared_program(token TEXT)
RETURNS TABLE (
    program_id UUID,
    program_name VARCHAR(255),
    program_description TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    creator_email VARCHAR(255),
    creator_name VARCHAR(255),
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
        COALESCE(p.full_name, split_part(u.email, '@', 1), 'Usuário') as creator_name,
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
    LEFT JOIN profiles p ON p.id = tp.user_id
    WHERE ps.share_token = token
    AND tp.is_archived = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 2. COMMENTS
-- =====================================================

COMMENT ON FUNCTION get_shared_program IS 'Public function to retrieve shared program data by token, including creator name';
