import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';
import {
  CreateSessionDto,
  AddSetDto,
  UpdateSetDto,
  FinishSessionDto,
} from './dto/session.dto';

@Injectable()
export class SessionsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(userId: string, limit = 20, offset = 0) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('workout_sessions')
      .select(
        `
        *,
        workouts (
          id,
          name
        )
      `,
      )
      .eq('user_id', userId)
      .order('executed_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(error.message);
    return data;
  }

  async findOne(id: string, userId: string) {
    const supabase = this.supabaseService.getClient();

    const { data: session, error } = await supabase
      .from('workout_sessions')
      .select(
        `
        *,
        workouts (
          id,
          name,
          workout_exercises (
            id,
            name,
            muscle_group,
            order_index
          )
        )
      `,
      )
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !session) {
      throw new NotFoundException('Session not found');
    }

    // Get sets for this session
    const { data: sets } = await supabase
      .from('sets')
      .select('*')
      .eq('session_id', id)
      .order('created_at', { ascending: true });

    return { ...session, sets: sets || [] };
  }

  async create(userId: string, createSessionDto: CreateSessionDto) {
    const supabase = this.supabaseService.getClient();

    // Verify workout exists and belongs to user
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .select('id')
      .eq('id', createSessionDto.workout_id)
      .eq('user_id', userId)
      .single();

    if (workoutError || !workout) {
      throw new NotFoundException('Workout not found');
    }

    // Create session
    const { data: session, error } = await supabase
      .from('workout_sessions')
      .insert({
        user_id: userId,
        workout_id: createSessionDto.workout_id,
        executed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return this.findOne(session.id, userId);
  }

  async addSet(sessionId: string, userId: string, addSetDto: AddSetDto) {
    const session = await this.findOne(sessionId, userId);
    const supabase = this.supabaseService.getClient();

    // Verify exercise belongs to workout
    const { data: exercise } = await supabase
      .from('workout_exercises')
      .select('id')
      .eq('id', addSetDto.workout_exercise_id)
      .eq('workout_id', session.workout_id)
      .single();

    if (!exercise) {
      throw new BadRequestException('Exercise does not belong to this workout');
    }

    // Get current set count for this exercise in this session
    const { data: existingSets } = await supabase
      .from('sets')
      .select('set_number')
      .eq('session_id', sessionId)
      .eq('workout_exercise_id', addSetDto.workout_exercise_id)
      .order('set_number', { ascending: false })
      .limit(1);

    const nextSetNumber =
      existingSets && existingSets.length > 0
        ? existingSets[0].set_number + 1
        : 1;

    const { data: set, error } = await supabase
      .from('sets')
      .insert({
        session_id: sessionId,
        workout_exercise_id: addSetDto.workout_exercise_id,
        set_number: nextSetNumber,
        reps: addSetDto.reps,
        weight: addSetDto.weight,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return set;
  }

  async updateSet(
    sessionId: string,
    setId: string,
    userId: string,
    updateSetDto: UpdateSetDto,
  ) {
    await this.findOne(sessionId, userId); // Verify access
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('sets')
      .update(updateSetDto)
      .eq('id', setId)
      .eq('session_id', sessionId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async deleteSet(sessionId: string, setId: string, userId: string) {
    await this.findOne(sessionId, userId); // Verify access
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase
      .from('sets')
      .delete()
      .eq('id', setId)
      .eq('session_id', sessionId);

    if (error) throw new Error(error.message);
    return { message: 'Set deleted successfully' };
  }

  async finish(
    sessionId: string,
    userId: string,
    finishSessionDto: FinishSessionDto,
  ) {
    const session = await this.findOne(sessionId, userId); // Verify access
    const supabase = this.supabaseService.getClient();

    // Save all sets if provided
    if (finishSessionDto.sets && finishSessionDto.sets.length > 0) {
      // Verify all exercises belong to this workout
      const exerciseIds = [
        ...new Set(finishSessionDto.sets.map((s) => s.workout_exercise_id)),
      ];
      const { data: exercises } = await supabase
        .from('workout_exercises')
        .select('id')
        .eq('workout_id', session.workout_id)
        .in('id', exerciseIds);

      if (!exercises || exercises.length !== exerciseIds.length) {
        throw new BadRequestException(
          'One or more exercises do not belong to this workout',
        );
      }

      // Delete all existing sets for this session to avoid duplicates
      const { error: deleteError } = await supabase
        .from('sets')
        .delete()
        .eq('session_id', sessionId);

      if (deleteError) throw new Error(deleteError.message);

      // Insert all sets
      const setsToInsert = finishSessionDto.sets.map((set) => ({
        session_id: sessionId,
        workout_exercise_id: set.workout_exercise_id,
        set_number: set.set_number,
        reps: set.reps,
        weight: set.weight,
      }));

      const { error: setsError } = await supabase
        .from('sets')
        .insert(setsToInsert);

      if (setsError) throw new Error(setsError.message);
    }

    // Update session with notes and duration
    const updateData: any = {};
    if (finishSessionDto.notes) updateData.notes = finishSessionDto.notes;
    if (finishSessionDto.duration_minutes)
      updateData.duration_minutes = finishSessionDto.duration_minutes;

    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from('workout_sessions')
        .update(updateData)
        .eq('id', sessionId)
        .eq('user_id', userId);

      if (error) throw new Error(error.message);
    }

    return this.findOne(sessionId, userId);
  }

  async remove(sessionId: string, userId: string) {
    await this.findOne(sessionId, userId); // Verify access
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase
      .from('workout_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
    return { message: 'Session deleted successfully' };
  }

  async getSessionStats(sessionId: string, userId: string) {
    const session = await this.findOne(sessionId, userId);

    const totalSets = session.sets?.length || 0;
    const totalVolume =
      session.sets?.reduce(
        (acc: number, set: any) => acc + set.reps * set.weight,
        0,
      ) || 0;
    const exercisesWorked = new Set(
      session.sets?.map((s: any) => s.workout_exercise_id),
    ).size;

    return {
      totalSets,
      totalVolume,
      exercisesWorked,
    };
  }

  async getLastSessionData(workoutId: string, userId: string) {
    const supabase = this.supabaseService.getClient();

    // Verify workout exists and belongs to user
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .select('id')
      .eq('id', workoutId)
      .eq('user_id', userId)
      .single();

    if (workoutError || !workout) {
      throw new NotFoundException('Workout not found');
    }

    // Find last completed session for this workout
    const { data: lastSession, error: sessionError } = await supabase
      .from('workout_sessions')
      .select('id, executed_at')
      .eq('workout_id', workoutId)
      .eq('user_id', userId)
      .not('duration_minutes', 'is', null)
      .gt('duration_minutes', 0)
      .order('executed_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();

    // If no previous session, return empty object
    if (sessionError || !lastSession) {
      return {};
    }

    // Get all sets from the last session
    const { data: sets, error: setsError } = await supabase
      .from('sets')
      .select('workout_exercise_id, set_number, reps, weight')
      .eq('session_id', lastSession.id)
      .order('workout_exercise_id', { ascending: true })
      .order('set_number', { ascending: true });

    if (setsError || !sets) {
      return {};
    }

    // Group sets by exercise
    const exerciseData: Record<
      string,
      Array<{ set_number: number; reps: number; weight: number }>
    > = {};

    sets.forEach((set) => {
      if (!exerciseData[set.workout_exercise_id]) {
        exerciseData[set.workout_exercise_id] = [];
      }
      exerciseData[set.workout_exercise_id].push({
        set_number: set.set_number,
        reps: set.reps,
        weight: set.weight,
      });
    });

    return exerciseData;
  }
}
