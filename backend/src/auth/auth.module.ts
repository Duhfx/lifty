import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SupabaseService } from './supabase.service';
import { AuthGuard } from './auth.guard';

@Module({
  providers: [AuthService, SupabaseService, AuthGuard],
  controllers: [AuthController],
  exports: [SupabaseService, AuthGuard, AuthService],
})
export class AuthModule {}
