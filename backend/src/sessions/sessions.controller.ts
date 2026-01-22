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
import { SessionsService } from './sessions.service';
import {
  CreateSessionDto,
  AddSetDto,
  UpdateSetDto,
  FinishSessionDto,
} from './dto/session.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('sessions')
@UseGuards(AuthGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.sessionsService.findAll(
      user.id,
      limit ? parseInt(limit) : 20,
      offset ? parseInt(offset) : 0,
    );
  }

  @Get('workout/:workoutId/last-session-data')
  getLastSessionData(
    @Param('workoutId') workoutId: string,
    @CurrentUser() user: any,
  ) {
    return this.sessionsService.getLastSessionData(workoutId, user.id);
  }

  @Get(':id/stats')
  getStats(@Param('id') id: string, @CurrentUser() user: any) {
    return this.sessionsService.getSessionStats(id, user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.sessionsService.findOne(id, user.id);
  }

  @Post()
  create(@CurrentUser() user: any, @Body() createSessionDto: CreateSessionDto) {
    return this.sessionsService.create(user.id, createSessionDto);
  }

  @Post(':id/sets')
  addSet(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() addSetDto: AddSetDto,
  ) {
    return this.sessionsService.addSet(id, user.id, addSetDto);
  }

  @Patch(':id/sets/:setId')
  updateSet(
    @Param('id') id: string,
    @Param('setId') setId: string,
    @CurrentUser() user: any,
    @Body() updateSetDto: UpdateSetDto,
  ) {
    return this.sessionsService.updateSet(id, setId, user.id, updateSetDto);
  }

  @Delete(':id/sets/:setId')
  deleteSet(
    @Param('id') id: string,
    @Param('setId') setId: string,
    @CurrentUser() user: any,
  ) {
    return this.sessionsService.deleteSet(id, setId, user.id);
  }

  @Patch(':id/finish')
  finish(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() finishSessionDto: FinishSessionDto,
  ) {
    return this.sessionsService.finish(id, user.id, finishSessionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.sessionsService.remove(id, user.id);
  }
}
