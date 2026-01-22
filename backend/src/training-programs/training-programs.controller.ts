import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseBoolPipe,
} from '@nestjs/common';
import { TrainingProgramsService } from './training-programs.service';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import {
  CreateTrainingProgramDto,
  UpdateTrainingProgramDto,
} from './dto/training-program.dto';

@Controller('training-programs')
@UseGuards(AuthGuard)
export class TrainingProgramsController {
  constructor(
    private readonly trainingProgramsService: TrainingProgramsService,
  ) { }

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Query('archived', new ParseBoolPipe({ optional: true }))
    archived?: boolean,
  ) {
    return this.trainingProgramsService.findAll(user.id, archived || false);
  }

  @Get('active')
  async findActive(@CurrentUser() user: any) {
    return this.trainingProgramsService.findActive(user.id);
  }

  @Get(':id')
  async findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.trainingProgramsService.findOne(id, user.id);
  }

  @Get(':id/stats')
  async getStats(@CurrentUser() user: any, @Param('id') id: string) {
    return this.trainingProgramsService.getStats(id, user.id);
  }

  @Post()
  async create(
    @CurrentUser() user: any,
    @Body() createDto: CreateTrainingProgramDto,
  ) {
    return this.trainingProgramsService.create(user.id, createDto);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateTrainingProgramDto,
  ) {
    return this.trainingProgramsService.update(id, user.id, updateDto);
  }

  @Patch(':id/activate')
  async activate(@CurrentUser() user: any, @Param('id') id: string) {
    return this.trainingProgramsService.activate(id, user.id);
  }

  @Delete(':id')
  async remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.trainingProgramsService.remove(id, user.id);
  }

  // ============================================
  // SHARING ENDPOINTS
  // ============================================

  @Post(':id/share')
  async generateShareLink(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.trainingProgramsService.generateShareLink(id, user.id);
  }

  @Get('shared/:token')
  @Public()
  async getSharedProgram(@Param('token') token: string) {
    return this.trainingProgramsService.getSharedProgram(token);
  }

  @Post('shared/:token/copy')
  async copySharedProgram(
    @CurrentUser() user: any,
    @Param('token') token: string,
  ) {
    return this.trainingProgramsService.copySharedProgram(token, user.id);
  }

  @Delete(':id/share')
  async removeShareLink(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.trainingProgramsService.removeShareLink(id, user.id);
  }
}

// Public decorator to bypass auth guard
function Public() {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata('isPublic', true, descriptor.value);
    return descriptor;
  };
}
