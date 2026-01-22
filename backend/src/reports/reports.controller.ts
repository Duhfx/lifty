import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('reports')
@UseGuards(AuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /**
   * Get all unique exercises that the user has performed
   */
  @Get('exercises')
  async getUniqueExercises(@CurrentUser() user: { userId: string }) {
    return this.reportsService.getUniqueExercises(user.userId);
  }

  /**
   * Get max weight evolution for an exercise
   */
  @Get('exercises/:exerciseId/max-weight')
  async getMaxWeightProgress(
    @CurrentUser() user: { userId: string },
    @Param('exerciseId') exerciseId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getMaxWeightProgress(
      user.userId,
      exerciseId,
      startDate,
      endDate,
    );
  }

  /**
   * Get volume evolution for an exercise
   */
  @Get('exercises/:exerciseId/volume')
  async getVolumeProgress(
    @CurrentUser() user: { userId: string },
    @Param('exerciseId') exerciseId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getVolumeProgress(
      user.userId,
      exerciseId,
      startDate,
      endDate,
    );
  }

  /**
   * Get general statistics for an exercise
   */
  @Get('exercises/:exerciseId/stats')
  async getExerciseStats(
    @CurrentUser() user: { userId: string },
    @Param('exerciseId') exerciseId: string,
  ) {
    return this.reportsService.getExerciseStats(user.userId, exerciseId);
  }
}
