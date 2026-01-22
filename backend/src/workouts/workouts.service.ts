import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';
import {
  CreateWorkoutDto,
  UpdateWorkoutDto,
  AddExerciseDto,
  UpdateExerciseDto,
} from './dto/workout.dto';

@Injectable()
export class WorkoutsService {
  constructor(private readonly supabaseService: SupabaseService) { }

  async findAll(userId: string, archived: boolean = false, programId?: string) {
    const supabase = this.supabaseService.getClient();

    let query = supabase
      .from('workouts')
      .select(
        `
        *,
        workout_exercises (
          id,
          name,
          muscle_group,
          order_index,
          suggested_sets,
          suggested_reps,
          notes
        )
      `,
      )
      .eq('user_id', userId)
      .eq('is_archived', archived);

    // Filter by program if specified
    if (programId !== undefined) {
      if (programId === null) {
        query = query.is('program_id', null);
      } else {
        query = query.eq('program_id', programId);
      }
    }

    const { data, error } = await query.order('order_index', {
      ascending: true,
    });

    if (error) throw new Error(error.message);
    return data;
  }

  async findOne(id: string, userId: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('workouts')
      .select(
        `
        *,
        workout_exercises (
          id,
          name,
          muscle_group,
          order_index,
          suggested_sets,
          suggested_reps,
          notes
        )
      `,
      )
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Workout not found');
    }

    return data;
  }

  async create(userId: string, createWorkoutDto: CreateWorkoutDto) {
    const supabase = this.supabaseService.getClient();

    const { name, description, exercises } = createWorkoutDto;

    // Get active training program
    const { data: activeProgram } = await supabase
      .from('training_programs')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .eq('is_archived', false)
      .single();

    // Create workout
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .insert({
        user_id: userId,
        name,
        description,
        program_id: activeProgram?.id || null,
      })
      .select()
      .single();

    if (workoutError) throw new Error(workoutError.message);

    // Add exercises if provided
    if (exercises && exercises.length > 0) {
      const exercisesToInsert = exercises.map((exercise, index) => ({
        workout_id: workout.id,
        name: exercise.name,
        muscle_group: exercise.muscle_group,
        order_index: index,
        suggested_sets: exercise.suggested_sets || 3,
        suggested_reps: exercise.suggested_reps || 12,
        notes: exercise.notes,
      }));

      const { error: exercisesError } = await supabase
        .from('workout_exercises')
        .insert(exercisesToInsert);

      if (exercisesError) throw new Error(exercisesError.message);
    }

    return this.findOne(workout.id, userId);
  }

  async update(id: string, userId: string, updateWorkoutDto: UpdateWorkoutDto) {
    await this.findOne(id, userId); // Check ownership

    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('workouts')
      .update(updateWorkoutDto)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId); // Check ownership

    const supabase = this.supabaseService.getClient();

    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
    return { message: 'Workout deleted successfully' };
  }

  async archive(id: string, userId: string, archived: boolean) {
    return this.update(id, userId, { is_archived: archived });
  }

  async addExercise(
    workoutId: string,
    userId: string,
    addExerciseDto: AddExerciseDto,
  ) {
    await this.findOne(workoutId, userId); // Check ownership

    const supabase = this.supabaseService.getClient();

    // Get current max order_index
    const { data: exercises } = await supabase
      .from('workout_exercises')
      .select('order_index')
      .eq('workout_id', workoutId)
      .order('order_index', { ascending: false })
      .limit(1);

    const nextOrder =
      exercises && exercises.length > 0 ? exercises[0].order_index + 1 : 0;

    const { data, error } = await supabase
      .from('workout_exercises')
      .insert({
        workout_id: workoutId,
        name: addExerciseDto.name,
        muscle_group: addExerciseDto.muscle_group,
        order_index: nextOrder,
        suggested_sets: addExerciseDto.suggested_sets || 3,
        suggested_reps: addExerciseDto.suggested_reps || 12,
        notes: addExerciseDto.notes,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateExercise(
    workoutId: string,
    exerciseId: string,
    userId: string,
    updateExerciseDto: UpdateExerciseDto,
  ) {
    await this.findOne(workoutId, userId); // Check ownership

    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('workout_exercises')
      .update(updateExerciseDto)
      .eq('id', exerciseId)
      .eq('workout_id', workoutId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async removeExercise(workoutId: string, exerciseId: string, userId: string) {
    await this.findOne(workoutId, userId); // Check ownership

    const supabase = this.supabaseService.getClient();

    const { error } = await supabase
      .from('workout_exercises')
      .delete()
      .eq('id', exerciseId)
      .eq('workout_id', workoutId);

    if (error) throw new Error(error.message);
    return { message: 'Exercise deleted successfully' };
  }

  async reorderExercises(
    workoutId: string,
    userId: string,
    exerciseIds: string[],
  ) {
    await this.findOne(workoutId, userId); // Check ownership

    const supabase = this.supabaseService.getClient();

    // Update order_index for each exercise
    const updates = exerciseIds.map((id, index) =>
      supabase
        .from('workout_exercises')
        .update({ order_index: index })
        .eq('id', id)
        .eq('workout_id', workoutId),
    );

    await Promise.all(updates);

    return { message: 'Exercises reordered successfully' };
  }

  async reorderWorkouts(userId: string, workoutIds: string[]) {
    const supabase = this.supabaseService.getClient();

    // Update order_index for each workout
    const updates = workoutIds.map((id, index) =>
      supabase
        .from('workouts')
        .update({ order_index: index })
        .eq('id', id)
        .eq('user_id', userId),
    );

    await Promise.all(updates);

    return { message: 'Workouts reordered successfully' };
  }

  async getNextWorkout(userId: string) {
    const supabase = this.supabaseService.getClient();

    // Get active training program
    const { data: activeProgram } = await supabase
      .from('training_programs')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .eq('is_archived', false)
      .single();

    // Get all non-archived workouts from active program ordered by order_index
    let query = supabase
      .from('workouts')
      .select(
        `
                *,
                workout_exercises (
                    id,
                    name,
                    muscle_group,
                    order_index,
                    suggested_sets,
                    suggested_reps,
                    notes
                )
            `,
      )
      .eq('user_id', userId)
      .eq('is_archived', false);

    // Filter by active program if exists
    if (activeProgram) {
      query = query.eq('program_id', activeProgram.id);
    }

    const { data: workouts, error: workoutsError } = await query.order(
      'order_index',
      { ascending: true },
    );

    if (workoutsError) throw new Error(workoutsError.message);
    if (!workouts || workouts.length === 0) return null;

    const workoutIds = workouts.map(w => w.id);

    // Get the most recent session matching one of the active workouts
    const { data: lastSession } = await supabase
      .from('workout_sessions')
      .select('workout_id')
      .eq('user_id', userId)
      .in('workout_id', workoutIds)
      .order('executed_at', { ascending: false })
      .limit(1)
      .single();

    // If no sessions yet, return first workout
    if (!lastSession) {
      return workouts[0];
    }

    // Find the last workout's position in the list
    const lastWorkoutIndex = workouts.findIndex(
      (w) => w.id === lastSession.workout_id,
    );

    // If last workout not found (deleted/archived), return first
    if (lastWorkoutIndex === -1) {
      return workouts[0];
    }

    // Return next workout in rotation (circular)
    const nextIndex = (lastWorkoutIndex + 1) % workouts.length;
    return workouts[nextIndex];
  }

  async getExerciseHistory(
    exerciseId: string,
    userId: string,
    daysLimit: number = 30,
  ) {
    const supabase = this.supabaseService.getClient();

    // First, verify the exercise belongs to user's workout
    const { data: exercise, error: exerciseError } = await supabase
      .from('workout_exercises')
      .select('workout_id, workouts!inner(user_id)')
      .eq('id', exerciseId)
      .single();

    if (exerciseError || !exercise) {
      throw new NotFoundException('Exercise not found');
    }

    // Check if user owns the workout (workouts is an array when using !inner)
    const workout = Array.isArray(exercise.workouts)
      ? exercise.workouts[0]
      : exercise.workouts;
    if (!workout || workout.user_id !== userId) {
      throw new NotFoundException('Exercise not found');
    }

    // Get date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysLimit);

    // Get all sets for this exercise within the date range
    const { data: sets, error } = await supabase
      .from('sets')
      .select(
        `
                id,
                reps,
                weight,
                created_at,
                workout_sessions!inner(
                    id,
                    executed_at,
                    user_id
                )
            `,
      )
      .eq('workout_exercise_id', exerciseId)
      .eq('workout_sessions.user_id', userId)
      .gte('workout_sessions.executed_at', startDate.toISOString())
      .lte('workout_sessions.executed_at', endDate.toISOString())
      .order('workout_sessions(executed_at)', { ascending: true });

    if (error) throw new Error(error.message);

    // Group sets by session and calculate max weight per session
    const sessionMap = new Map();

    if (sets && sets.length > 0) {
      sets.forEach((set: any) => {
        const sessionId = set.workout_sessions.id;
        const sessionDate = set.workout_sessions.executed_at;

        if (!sessionMap.has(sessionId)) {
          sessionMap.set(sessionId, {
            sessionId,
            date: sessionDate,
            maxWeight: set.weight,
            totalSets: 1,
          });
        } else {
          const session = sessionMap.get(sessionId);
          session.maxWeight = Math.max(session.maxWeight, set.weight);
          session.totalSets += 1;
        }
      });
    }

    // Convert map to array and sort by date
    const history = Array.from(sessionMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    return {
      exerciseId,
      daysLimit,
      totalSessions: history.length,
      maxWeightOverall:
        history.length > 0 ? Math.max(...history.map((h) => h.maxWeight)) : 0,
      history,
    };
  }
}
