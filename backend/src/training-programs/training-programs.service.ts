import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';
import {
  CreateTrainingProgramDto,
  UpdateTrainingProgramDto,
} from './dto/training-program.dto';

@Injectable()
export class TrainingProgramsService {
  constructor(private readonly supabaseService: SupabaseService) { }

  async findAll(userId: string, archived: boolean = false) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('training_programs')
      .select(
        `
                *,
                workouts (
                    id,
                    name,
                    is_archived
                )
            `,
      )
      .eq('user_id', userId)
      .eq('is_archived', archived)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async findOne(id: string, userId: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('training_programs')
      .select(
        `
                *,
                workouts (
                    id,
                    name,
                    description,
                    is_archived,
                    order_index,
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

    if (error || !data) {
      throw new NotFoundException('Training program not found');
    }

    return data;
  }

  async findActive(userId: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('training_programs')
      .select(
        `
                *,
                workouts (
                    id,
                    name,
                    is_archived
                )
            `,
      )
      .eq('user_id', userId)
      .eq('is_active', true)
      .eq('is_archived', false)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }

    return data || null;
  }

  async create(userId: string, createDto: CreateTrainingProgramDto) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('training_programs')
      .insert({
        user_id: userId,
        name: createDto.name,
        description: createDto.description,
        start_date: createDto.start_date,
        end_date: createDto.end_date,
        is_active: createDto.is_active || false,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return this.findOne(data.id, userId);
  }

  async update(
    id: string,
    userId: string,
    updateDto: UpdateTrainingProgramDto,
  ) {
    await this.findOne(id, userId); // Check ownership

    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('training_programs')
      .update(updateDto)
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
      .from('training_programs')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);

    return { message: 'Training program deleted successfully' };
  }

  async activate(id: string, userId: string) {
    await this.findOne(id, userId); // Check ownership

    const supabase = this.supabaseService.getClient();

    // The trigger will automatically deactivate other programs
    const { data, error } = await supabase
      .from('training_programs')
      .update({ is_active: true })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return this.findOne(id, userId);
  }

  async getStats(id: string, userId: string) {
    await this.findOne(id, userId); // Check ownership

    const supabase = this.supabaseService.getClient();

    // Get all workouts in this program
    const { data: workouts } = await supabase
      .from('workouts')
      .select('id')
      .eq('program_id', id);

    if (!workouts || workouts.length === 0) {
      return {
        totalWorkouts: 0,
        totalSessions: 0,
        totalVolume: 0,
        lastSessionAt: null,
      };
    }

    const workoutIds = workouts.map((w) => w.id);

    // Get sessions for these workouts
    const { data: sessions } = await supabase
      .from('workout_sessions')
      .select('id, executed_at')
      .in('workout_id', workoutIds)
      .order('executed_at', { ascending: false });

    // Get total volume (sum of all sets)
    const { data: sets } = await supabase
      .from('sets')
      .select('weight, reps')
      .in('session_id', sessions?.map((s) => s.id) || []);

    const totalVolume =
      sets?.reduce((acc, set) => acc + set.weight * set.reps, 0) || 0;

    return {
      totalWorkouts: workouts.length,
      totalSessions: sessions?.length || 0,
      totalVolume,
      lastSessionAt: sessions?.[0]?.executed_at || null,
    };
  }

  // ============================================
  // SHARING METHODS
  // ============================================

  async generateShareLink(programId: string, userId: string) {
    await this.findOne(programId, userId); // Check ownership

    const supabase = this.supabaseService.getClient();

    // Check if share already exists
    const { data: existingShare, error: fetchError } = await supabase
      .from('program_shares')
      .select('*')
      .eq('program_id', programId)
      .eq('created_by', userId)
      .maybeSingle(); // Use maybeSingle instead of single to avoid error when not found

    // If found, return existing share
    if (existingShare) {
      const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/share/${existingShare.share_token}`;
      return {
        shareToken: existingShare.share_token,
        shareUrl,
        viewCount: existingShare.view_count,
        copyCount: existingShare.copy_count,
        createdAt: existingShare.created_at,
      };
    }

    // Generate new token using crypto
    const crypto = require('crypto');
    const shareToken = crypto.randomBytes(16).toString('hex');

    // Create new share
    const { data: newShare, error } = await supabase
      .from('program_shares')
      .insert({
        program_id: programId,
        share_token: shareToken,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/share/${shareToken}`;

    return {
      shareToken: newShare.share_token,
      shareUrl,
      viewCount: 0,
      copyCount: 0,
      createdAt: newShare.created_at,
    };
  }

  async getSharedProgram(token: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.rpc('get_shared_program', {
      token,
    });

    // Log for debugging
    console.log('RPC call result:', { data, error, token });

    if (error) {
      console.error('Supabase RPC error:', error);
      throw new Error(`Failed to fetch shared program: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error('Shared program not found');
    }

    const program = data[0];

    // Check if program data is valid
    if (!program.program_id) {
      console.error('Invalid program data:', program);
      throw new Error('Invalid shared program data');
    }

    return {
      programId: program.program_id,
      programName: program.program_name,
      programDescription: program.program_description,
      startDate: program.start_date,
      endDate: program.end_date,
      creatorEmail: program.creator_email,
      creatorName: program.creator_name,
      workoutCount: program.workout_count,
      workouts: (program.workouts || []).map((w: any) => ({
        id: w.id,
        name: w.name,
        description: w.description,
        orderIndex: w.order_index,
        exercises: (w.exercises || []).map((e: any) => ({
          name: e.name,
          muscleGroup: e.muscle_group,
          suggestedSets: e.suggested_sets,
          suggestedReps: e.suggested_reps,
          notes: e.notes,
          orderIndex: e.order_index,
        })),
      })),
    };
  }

  async copySharedProgram(token: string, userId: string) {
    const sharedProgram = await this.getSharedProgram(token);
    const supabase = this.supabaseService.getClient();

    // Create new program for the user
    const { data: newProgram, error: programError } = await supabase
      .from('training_programs')
      .insert({
        user_id: userId,
        name: `${sharedProgram.programName} (cópia)`,
        description: sharedProgram.programDescription,
        start_date: sharedProgram.startDate,
        end_date: sharedProgram.endDate,
        is_active: false,
      })
      .select()
      .single();

    if (programError) throw new Error(programError.message);

    // Copy all workouts
    for (const workout of sharedProgram.workouts) {
      const { data: newWorkout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          user_id: userId,
          program_id: newProgram.id,
          name: workout.name,
          description: workout.description,
          order_index: workout.orderIndex,
        })
        .select()
        .single();

      if (workoutError) throw new Error(workoutError.message);

      // Copy all exercises for this workout
      if (workout.exercises && workout.exercises.length > 0) {
        const exercisesToInsert = workout.exercises.map((exercise: any) => ({
          workout_id: newWorkout.id,
          name: exercise.name,
          muscle_group: exercise.muscleGroup,
          suggested_sets: exercise.suggestedSets,
          suggested_reps: exercise.suggestedReps,
          notes: exercise.notes,
          order_index: exercise.orderIndex,
        }));

        const { error: exercisesError } = await supabase
          .from('workout_exercises')
          .insert(exercisesToInsert);

        if (exercisesError) throw new Error(exercisesError.message);
      }
    }

    // Increment copy counter
    await supabase.rpc('increment_copy_count', { token });

    return {
      programId: newProgram.id,
      message: 'Programa copiado com sucesso!',
    };
  }

  async removeShareLink(programId: string, userId: string) {
    await this.findOne(programId, userId); // Check ownership

    const supabase = this.supabaseService.getClient();

    const { error } = await supabase
      .from('program_shares')
      .delete()
      .eq('program_id', programId)
      .eq('created_by', userId);

    if (error) throw new Error(error.message);

    return { message: 'Share link removed successfully' };
  }
}
