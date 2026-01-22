import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class ShareProgramResponseDto {
    shareToken: string;
    shareUrl: string;
    viewCount: number;
    copyCount: number;
    createdAt: Date;
}

export class SharedProgramDto {
    programId: string;
    programName: string;
    programDescription?: string;
    startDate?: string;
    endDate?: string;
    creatorEmail: string;
    workoutCount: number;
    workouts: Array<{
        id: string;
        name: string;
        description?: string;
        orderIndex: number;
        exercises: Array<{
            name: string;
            muscleGroup?: string;
            suggestedSets: number;
            suggestedReps: number;
            notes?: string;
            orderIndex: number;
        }>;
    }>;
}

export class CopyProgramResponseDto {
    programId: string;
    message: string;
}
