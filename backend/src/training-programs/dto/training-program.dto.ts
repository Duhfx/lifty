import {
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
  IsISO8601,
  ValidateIf,
  ValidateBy,
  ValidationOptions,
} from 'class-validator';

// Custom validator to check if end_date is after start_date
function IsEndDateAfterStartDate(validationOptions?: ValidationOptions) {
  return ValidateBy(
    {
      name: 'isEndDateAfterStartDate',
      validator: {
        validate: (value: any, args: any) => {
          const object = args.object as any;
          if (!object.start_date || !object.end_date) {
            return true; // Skip validation if either date is missing
          }
          return new Date(object.end_date) > new Date(object.start_date);
        },
        defaultMessage: () => 'end_date must be after start_date',
      },
    },
    validationOptions,
  );
}

export class CreateTrainingProgramDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsISO8601()
  @IsOptional()
  start_date?: string;

  @IsISO8601()
  @IsOptional()
  @IsEndDateAfterStartDate()
  end_date?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

export class UpdateTrainingProgramDto {
  @IsString()
  @MaxLength(255)
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsISO8601()
  @IsOptional()
  start_date?: string;

  @IsISO8601()
  @IsOptional()
  @IsEndDateAfterStartDate()
  end_date?: string;

  @IsBoolean()
  @IsOptional()
  is_archived?: boolean;
}

export class ActivateTrainingProgramDto {
  @IsBoolean()
  is_active: boolean;
}
