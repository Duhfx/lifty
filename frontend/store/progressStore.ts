import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface Exercise {
    id: string;
    name: string;
    muscle_group: string;
}

interface MaxWeightData {
    date: string;
    maxWeight: number;
    reps: number;
}

interface VolumeData {
    date: string;
    totalVolume: number;
    totalSets: number;
}

interface ExerciseStats {
    maxWeightEver: number;
    avgWeight: number;
    totalSets: number;
    lastExecutedAt: string | null;
}

type PeriodFilter = '30d' | '90d' | '6m' | 'all';

interface ProgressStore {
    exercises: Exercise[];
    selectedExercise: Exercise | null;
    maxWeightData: MaxWeightData[];
    volumeData: VolumeData[];
    stats: ExerciseStats | null;
    period: PeriodFilter;
    loading: boolean;
    error: string | null;

    fetchExercises: () => Promise<void>;
    selectExercise: (exercise: Exercise | null) => void;
    setPeriod: (period: PeriodFilter) => void;
    fetchMaxWeight: (exerciseId: string) => Promise<void>;
    fetchVolume: (exerciseId: string) => Promise<void>;
    fetchStats: (exerciseId: string) => Promise<void>;
    fetchAllData: (exerciseId: string) => Promise<void>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

function getDateRange(period: PeriodFilter): { startDate?: string; endDate?: string } {
    if (period === 'all') return {};

    const now = new Date();
    const endDate = now.toISOString().split('T')[0];

    let startDate: Date;
    switch (period) {
        case '30d':
            startDate = new Date(now.setDate(now.getDate() - 30));
            break;
        case '90d':
            startDate = new Date(now.setDate(now.getDate() - 90));
            break;
        case '6m':
            startDate = new Date(now.setMonth(now.getMonth() - 6));
            break;
        default:
            return {};
    }

    return {
        startDate: startDate.toISOString().split('T')[0],
        endDate,
    };
}

export const useProgressStore = create<ProgressStore>((set, get) => ({
    exercises: [],
    selectedExercise: null,
    maxWeightData: [],
    volumeData: [],
    stats: null,
    period: '30d',
    loading: false,
    error: null,

    fetchExercises: async () => {
        set({ loading: true, error: null });
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const response = await fetch(`${API_URL}/reports/exercises`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` },
            });

            if (!response.ok) throw new Error('Failed to fetch exercises');
            const data = await response.json();
            set({ exercises: data, loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },

    selectExercise: (exercise) => {
        set({ selectedExercise: exercise });
        if (exercise) {
            get().fetchAllData(exercise.id);
        } else {
            set({ maxWeightData: [], volumeData: [], stats: null });
        }
    },

    setPeriod: (period) => {
        set({ period });
        const exercise = get().selectedExercise;
        if (exercise) {
            get().fetchMaxWeight(exercise.id);
            get().fetchVolume(exercise.id);
        }
    },

    fetchMaxWeight: async (exerciseId) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const { startDate, endDate } = getDateRange(get().period);
            let url = `${API_URL}/reports/exercises/${exerciseId}/max-weight`;
            const params = new URLSearchParams();
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            if (params.toString()) url += `?${params.toString()}`;

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${session.access_token}` },
            });

            if (!response.ok) throw new Error('Failed to fetch max weight data');
            const data = await response.json();
            set({ maxWeightData: data });
        } catch (error: any) {
            set({ error: error.message });
        }
    },

    fetchVolume: async (exerciseId) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const { startDate, endDate } = getDateRange(get().period);
            let url = `${API_URL}/reports/exercises/${exerciseId}/volume`;
            const params = new URLSearchParams();
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            if (params.toString()) url += `?${params.toString()}`;

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${session.access_token}` },
            });

            if (!response.ok) throw new Error('Failed to fetch volume data');
            const data = await response.json();
            set({ volumeData: data });
        } catch (error: any) {
            set({ error: error.message });
        }
    },

    fetchStats: async (exerciseId) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const response = await fetch(`${API_URL}/reports/exercises/${exerciseId}/stats`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` },
            });

            if (!response.ok) throw new Error('Failed to fetch stats');
            const data = await response.json();
            set({ stats: data });
        } catch (error: any) {
            set({ error: error.message });
        }
    },

    fetchAllData: async (exerciseId) => {
        set({ loading: true });
        await Promise.all([
            get().fetchMaxWeight(exerciseId),
            get().fetchVolume(exerciseId),
            get().fetchStats(exerciseId),
        ]);
        set({ loading: false });
    },
}));
