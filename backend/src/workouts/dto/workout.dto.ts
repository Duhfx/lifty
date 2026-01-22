import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExerciseDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  muscle_group?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  suggested_sets?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  suggested_reps?: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;
}

export class CreateWorkoutDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExerciseDto)
  @IsOptional()
  exercises?: CreateExerciseDto[];
}

export class UpdateWorkoutDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  is_archived?: boolean;
}

export class AddExerciseDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  muscle_group?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  suggested_sets?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  suggested_reps?: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;
}

export class UpdateExerciseDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  muscle_group?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;
}

export class ReorderExercisesDto {
  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  exerciseIds: number[];
}
