import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';

export interface ExerciseProgress {
  date: string;
  maxWeight: number;
  reps: number;
}

export interface VolumeProgress {
  date: string;
  totalVolume: number;
  totalSets: number;
}

export interface ExerciseStats {
  maxWeightEver: number;
  avgWeight: number;
  totalSets: number;
  lastExecutedAt: string | null;
}

@Injectable()
export class ReportsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Get all unique exercises that the user has performed (from sets data)
   */
  async getUniqueExercises(userId: string) {
    const supabase = this.supabaseService.getClient();

    // Get all workout_exercise_ids from user's sets
    const { data: sessions, error: sessionsError } = await supabase
      .from('workout_sessions')
      .select('id')
      .eq('user_id', userId);

    if (sessionsError) throw new Error(sessionsError.message);
    if (!sessions || sessions.length === 0) return [];

    const sessionIds = sessions.map((s) => s.id);

    // Get all sets from these sessions
    const { data: sets, error: setsError } = await supabase
      .from('sets')
      .select('workout_exercise_id')
      .in('session_id', sessionIds);

    if (setsError) throw new Error(setsError.message);
    if (!sets || sets.length === 0) return [];

    // Get unique exercise IDs
    const uniqueExerciseIds = [
      ...new Set(sets.map((s) => s.workout_exercise_id)),
    ];

    // Get exercise details
    const { data: exercises, error: exercisesError } = await supabase
      .from('workout_exercises')
      .select('id, name, muscle_group')
      .in('id', uniqueExerciseIds);

    if (exercisesError) throw new Error(exercisesError.message);
    return exercises || [];
  }

  /**
   * Get max weight evolution for an exercise over time
   */
  async getMaxWeightProgress(
    userId: string,
    exerciseId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<ExerciseProgress[]> {
    const supabase = this.supabaseService.getClient();

    // Build query for sets with this exercise
    let query = supabase
      .from('sets')
      .select(
        `
                weight,
                reps,
                workout_sessions!inner (
                    id,
                    user_id,
                    executed_at
                )
            `,
      )
      .eq('workout_exercise_id', exerciseId)
      .eq('workout_sessions.user_id', userId);

    if (startDate) {
      query = query.gte('workout_sessions.executed_at', startDate);
    }
    if (endDate) {
      query = query.lte('workout_sessions.executed_at', endDate);
    }

    const { data: sets, error } = await query;
    if (error) throw new Error(error.message);
    if (!sets || sets.length === 0) return [];

    // Group by date and find max weight per day
    const dateMap = new Map<string, { maxWeight: number; reps: number }>();

    for (const set of sets) {
      const session = set.workout_sessions as any;
      const date = new Date(session.executed_at).toISOString().split('T')[0];
      const current = dateMap.get(date);

      if (!current || set.weight > current.maxWeight) {
        dateMap.set(date, { maxWeight: set.weight, reps: set.reps });
      }
    }

    // Convert to array sorted by date
    return Array.from(dateMap.entries())
      .map(([date, data]) => ({
        date,
        maxWeight: data.maxWeight,
        reps: data.reps,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get volume evolution for an exercise over time
   * Volume = sum of (reps × weight) for all sets
   */
  async getVolumeProgress(
    userId: string,
    exerciseId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<VolumeProgress[]> {
    const supabase = this.supabaseService.getClient();

    let query = supabase
      .from('sets')
      .select(
        `
                weight,
                reps,
                workout_sessions!inner (
                    id,
                    user_id,
                    executed_at
                )
            `,
      )
      .eq('workout_exercise_id', exerciseId)
      .eq('workout_sessions.user_id', userId);

    if (startDate) {
      query = query.gte('workout_sessions.executed_at', startDate);
    }
    if (endDate) {
      query = query.lte('workout_sessions.executed_at', endDate);
    }

    const { data: sets, error } = await query;
    if (error) throw new Error(error.message);
    if (!sets || sets.length === 0) return [];

    // Group by date and sum volume
    const dateMap = new Map<
      string,
      { totalVolume: number; totalSets: number }
    >();

    for (const set of sets) {
      const session = set.workout_sessions as any;
      const date = new Date(session.executed_at).toISOString().split('T')[0];
      const volume = set.reps * set.weight;
      const current = dateMap.get(date) || { totalVolume: 0, totalSets: 0 };

      dateMap.set(date, {
        totalVolume: current.totalVolume + volume,
        totalSets: current.totalSets + 1,
      });
    }

    return Array.from(dateMap.entries())
      .map(([date, data]) => ({
        date,
        totalVolume: data.totalVolume,
        totalSets: data.totalSets,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get general statistics for an exercise
   */
  async getExerciseStats(
    userId: string,
    exerciseId: string,
  ): Promise<ExerciseStats> {
    const supabase = this.supabaseService.getClient();

    const { data: sets, error } = await supabase
      .from('sets')
      .select(
        `
                weight,
                reps,
                workout_sessions!inner (
                    id,
                    user_id,
                    executed_at
                )
            `,
      )
      .eq('workout_exercise_id', exerciseId)
      .eq('workout_sessions.user_id', userId);

    if (error) throw new Error(error.message);
    if (!sets || sets.length === 0) {
      return {
        maxWeightEver: 0,
        avgWeight: 0,
        totalSets: 0,
        lastExecutedAt: null,
      };
    }

    let maxWeight = 0;
    let totalWeight = 0;
    let lastExecutedAt: string | null = null;

    for (const set of sets) {
      const session = set.workout_sessions as any;
      if (set.weight > maxWeight) maxWeight = set.weight;
      totalWeight += set.weight;

      if (!lastExecutedAt || session.executed_at > lastExecutedAt) {
        lastExecutedAt = session.executed_at;
      }
    }

    return {
      maxWeightEver: maxWeight,
      avgWeight: Math.round((totalWeight / sets.length) * 10) / 10,
      totalSets: sets.length,
      lastExecutedAt,
    };
  }
}
