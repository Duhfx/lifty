import {
  IsString,
  IsOptional,
  IsUUID,
  IsNumber,
  IsInt,
  Min,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSessionDto {
  @IsUUID()
  workout_id: string;
}

export class AddSetDto {
  @IsUUID()
  workout_exercise_id: string;

  @IsInt()
  @Min(1)
  reps: number;

  @IsNumber()
  @Min(0)
  weight: number;
}

export class UpdateSetDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  reps?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  weight?: number;
}

export class SetDataDto {
  @IsUUID()
  workout_exercise_id: string;

  @IsInt()
  @Min(1)
  set_number: number;

  @IsInt()
  @Min(1)
  reps: number;

  @IsNumber()
  @Min(0)
  weight: number;
}

export class FinishSessionDto {
  @IsString()
  @IsOptional()
  notes?: string;

  @IsInt()
  @IsOptional()
  duration_minutes?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SetDataDto)
  @IsOptional()
  sets?: SetDataDto[];
}
