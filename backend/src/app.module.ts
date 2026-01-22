import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { WorkoutsModule } from './workouts/workouts.module';
import { SessionsModule } from './sessions/sessions.module';
import { ReportsModule } from './reports/reports.module';
import { TrainingProgramsModule } from './training-programs/training-programs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    WorkoutsModule,
    SessionsModule,
    ReportsModule,
    TrainingProgramsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
