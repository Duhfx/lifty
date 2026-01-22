import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface Exercise {
    id: string;
    name: string;
    muscle_group?: string;
    order_index: number;
    suggested_sets?: number;
    suggested_reps?: number;
    notes?: string;
}

interface Workout {
    id: string;
    program_id?: string;
    name: string;
    description?: string;
    is_archived: boolean;
    workout_exercises: Exercise[];
    created_at: string;
}

interface WorkoutStore {
    workouts: Workout[];
    nextWorkout: Workout | null;
    loading: boolean;
    error: string | null;

    fetchWorkouts: (archived?: boolean, programId?: string) => Promise<void>;
    fetchNextWorkout: () => Promise<void>;
    getWorkout: (id: string) => Promise<Workout | null>;
    createWorkout: (data: { name: string; description?: string; exercises?: Omit<Exercise, 'id' | 'order_index'>[] }) => Promise<Workout>;
    updateWorkout: (id: string, data: { name?: string; description?: string }) => Promise<void>;
    deleteWorkout: (id: string) => Promise<void>;
    archiveWorkout: (id: string, archived: boolean) => Promise<void>;
    reorderWorkouts: (workoutIds: string[]) => Promise<void>;
    addExercise: (workoutId: string, exercise: { name: string; muscle_group?: string; suggested_sets?: number; suggested_reps?: number; notes?: string }) => Promise<void>;
    updateExercise: (workoutId: string, exerciseId: string, data: { name?: string; muscle_group?: string; notes?: string; suggested_sets?: number; suggested_reps?: number }) => Promise<void>;
    deleteExercise: (workoutId: string, exerciseId: string) => Promise<void>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
    workouts: [],
    nextWorkout: null,
    loading: false,
    error: null,

    fetchNextWorkout: async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const response = await fetch(`${API_URL}/workouts/next`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch next workout');

            const data = await response.json();
            set({ nextWorkout: data });
        } catch (error: any) {
            set({ error: error.message });
        }
    },

    fetchWorkouts: async (archived = false, programId?: string) => {
        set({ loading: true, error: null });
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const queryParams = new URLSearchParams({
                archived: String(archived),
            });
            
            if (programId) {
                queryParams.append('programId', programId);
            }

            const response = await fetch(`${API_URL}/workouts?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch workouts');

            const data = await response.json();
            set({ workouts: data, loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },

    getWorkout: async (id: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const response = await fetch(`${API_URL}/workouts/${id}`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch workout');

            return await response.json();
        } catch (error: any) {
            set({ error: error.message });
            return null;
        }
    },

    createWorkout: async (data) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const response = await fetch(`${API_URL}/workouts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Failed to create workout');

            const workout = await response.json();
            set((state) => ({ workouts: [workout, ...state.workouts] }));
            return workout;
        } catch (error: any) {
            set({ error: error.message });
            throw error;
        }
    },

    updateWorkout: async (id, data) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const response = await fetch(`${API_URL}/workouts/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Failed to update workout');

            const updated = await response.json();
            set((state) => ({
                workouts: state.workouts.map((w) => (w.id === id ? updated : w)),
            }));
        } catch (error: any) {
            set({ error: error.message });
            throw error;
        }
    },

    deleteWorkout: async (id) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const response = await fetch(`${API_URL}/workouts/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to delete workout');

            set((state) => ({
                workouts: state.workouts.filter((w) => w.id !== id),
            }));
        } catch (error: any) {
            set({ error: error.message });
            throw error;
        }
    },

    archiveWorkout: async (id, archived) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const response = await fetch(`${API_URL}/workouts/${id}/archive`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ archived }),
            });

            if (!response.ok) throw new Error('Failed to archive workout');

            await get().fetchWorkouts(archived);
        } catch (error: any) {
            set({ error: error.message });
            throw error;
        }
    },

    reorderWorkouts: async (workoutIds) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const response = await fetch(`${API_URL}/workouts/reorder`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ workoutIds }),
            });

            if (!response.ok) throw new Error('Failed to reorder workouts');

            await get().fetchWorkouts();
            await get().fetchNextWorkout();
        } catch (error: any) {
            set({ error: error.message });
            throw error;
        }
    },

    addExercise: async (workoutId, exercise) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const response = await fetch(`${API_URL}/workouts/${workoutId}/exercises`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify(exercise),
            });

            if (!response.ok) throw new Error('Failed to add exercise');
        } catch (error: any) {
            set({ error: error.message });
            throw error;
        }
    },

    updateExercise: async (workoutId, exerciseId, data) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const response = await fetch(`${API_URL}/workouts/${workoutId}/exercises/${exerciseId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Failed to update exercise');
        } catch (error: any) {
            set({ error: error.message });
            throw error;
        }
    },

    deleteExercise: async (workoutId, exerciseId) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const response = await fetch(`${API_URL}/workouts/${workoutId}/exercises/${exerciseId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to delete exercise');
        } catch (error: any) {
            set({ error: error.message });
            throw error;
        }
    },
}));
