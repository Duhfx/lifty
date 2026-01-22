import { Module } from '@nestjs/common';
import { TrainingProgramsService } from './training-programs.service';
import { TrainingProgramsController } from './training-programs.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [TrainingProgramsController],
  providers: [TrainingProgramsService],
  exports: [TrainingProgramsService],
})
export class TrainingProgramsModule {}
