import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { WorkoutsService } from './workouts.service';
import {
  CreateWorkoutDto,
  UpdateWorkoutDto,
  AddExerciseDto,
  UpdateExerciseDto,
} from './dto/workout.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('workouts')
@UseGuards(AuthGuard)
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  @Get('next')
  getNextWorkout(@CurrentUser() user: any) {
    return this.workoutsService.getNextWorkout(user.id);
  }

  @Get('exercises/:exerciseId/history')
  getExerciseHistory(
    @Param('exerciseId') exerciseId: string,
    @CurrentUser() user: any,
    @Query('days') days?: string,
  ) {
    const daysLimit = days ? parseInt(days) : 30;
    return this.workoutsService.getExerciseHistory(
      exerciseId,
      user.id,
      daysLimit,
    );
  }

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('archived') archived?: string,
    @Query('programId') programId?: string,
  ) {
    const isArchived = archived === 'true';
    return this.workoutsService.findAll(
      user.id,
      isArchived,
      programId === 'null' ? undefined : programId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.workoutsService.findOne(id, user.id);
  }

  @Post()
  create(@CurrentUser() user: any, @Body() createWorkoutDto: CreateWorkoutDto) {
    return this.workoutsService.create(user.id, createWorkoutDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateWorkoutDto: UpdateWorkoutDto,
  ) {
    return this.workoutsService.update(id, user.id, updateWorkoutDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.workoutsService.remove(id, user.id);
  }

  @Patch(':id/archive')
  archive(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body('archived') archived: boolean,
  ) {
    return this.workoutsService.archive(id, user.id, archived);
  }

  @Post(':id/exercises')
  addExercise(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() addExerciseDto: AddExerciseDto,
  ) {
    return this.workoutsService.addExercise(id, user.id, addExerciseDto);
  }

  @Patch(':id/exercises/:exerciseId')
  updateExercise(
    @Param('id') id: string,
    @Param('exerciseId') exerciseId: string,
    @CurrentUser() user: any,
    @Body() updateExerciseDto: UpdateExerciseDto,
  ) {
    return this.workoutsService.updateExercise(
      id,
      exerciseId,
      user.id,
      updateExerciseDto,
    );
  }

  @Delete(':id/exercises/:exerciseId')
  removeExercise(
    @Param('id') id: string,
    @Param('exerciseId') exerciseId: string,
    @CurrentUser() user: any,
  ) {
    return this.workoutsService.removeExercise(id, exerciseId, user.id);
  }

  @Patch(':id/exercises/reorder')
  reorderExercises(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body('exerciseIds') exerciseIds: string[],
  ) {
    return this.workoutsService.reorderExercises(id, user.id, exerciseIds);
  }

  @Patch('reorder')
  reorderWorkouts(
    @CurrentUser() user: any,
    @Body('workoutIds') workoutIds: string[],
  ) {
    return this.workoutsService.reorderWorkouts(user.id, workoutIds);
  }
}
