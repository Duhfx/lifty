import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface TrainingProgram {
    id: string;
    name: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    is_active: boolean;
    is_archived: boolean;
    created_at: string;
    workouts?: {
        id: string;
        name: string;
        is_archived: boolean;
    }[];
}

interface ProgramStats {
    totalWorkouts: number;
    totalSessions: number;
    totalVolume: number;
    lastSessionAt: string | null;
}

interface ShareData {
    shareToken: string;
    shareUrl: string;
    viewCount: number;
    copyCount: number;
    createdAt: string;
}

interface SharedProgram {
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

interface TrainingProgramStore {
    programs: TrainingProgram[];
    activeProgram: TrainingProgram | null;
    loading: boolean;
    error: string | null;

    fetchPrograms: (archived?: boolean) => Promise<void>;
    fetchActiveProgram: () => Promise<void>;
    getProgram: (id: string) => Promise<TrainingProgram | null>;
    createProgram: (data: { name: string; description?: string; start_date?: string; end_date?: string; is_active?: boolean }) => Promise<TrainingProgram>;
    updateProgram: (id: string, data: { name?: string; description?: string; start_date?: string; end_date?: string; is_archived?: boolean }) => Promise<void>;
    deleteProgram: (id: string) => Promise<void>;
    activateProgram: (id: string) => Promise<void>;
    getStats: (id: string) => Promise<ProgramStats>;

    // Sharing methods
    generateShareLink: (programId: string) => Promise<ShareData>;
    getSharedProgram: (token: string) => Promise<SharedProgram>;
    copySharedProgram: (token: string) => Promise<string>;
    removeShareLink: (programId: string) => Promise<void>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const useTrainingProgramStore = create<TrainingProgramStore>((set, get) => ({
    programs: [],
    activeProgram: null,
    loading: false,
    error: null,

    fetchPrograms: async (archived = false) => {
        set({ loading: true, error: null });
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const response = await fetch(`${API_URL}/training-programs?archived=${archived}`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch programs');

            const data = await response.json();
            set({ programs: data, loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },

    fetchActiveProgram: async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const response = await fetch(`${API_URL}/training-programs/active`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    set({ activeProgram: null });
                    return;
                }
                throw new Error('Failed to fetch active program');
            }

            const data = await response.json();
            set({ activeProgram: data });
        } catch (error: any) {
            set({ error: error.message });
        }
    },

    getProgram: async (id: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const response = await fetch(`${API_URL}/training-programs/${id}`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch program');

            return await response.json();
        } catch (error: any) {
            set({ error: error.message });
            return null;
        }
    },

    createProgram: async (data) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const response = await fetch(`${API_URL}/training-programs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Failed to create program');

            const program = await response.json();
            set((state) => ({ programs: [program, ...state.programs] }));

            // If this program was created as active, update activeProgram
            if (program.is_active) {
                set({ activeProgram: program });
            }

            return program;
        } catch (error: any) {
            set({ error: error.message });
            throw error;
        }
    },

    updateProgram: async (id, data) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const response = await fetch(`${API_URL}/training-programs/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Failed to update program');

            const updated = await response.json();
            set((state) => ({
                programs: state.programs.map((p) => (p.id === id ? updated : p)),
            }));
        } catch (error: any) {
            set({ error: error.message });
            throw error;
        }
    },

    deleteProgram: async (id) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const response = await fetch(`${API_URL}/training-programs/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to delete program');

            set((state) => ({
                programs: state.programs.filter((p) => p.id !== id),
            }));
        } catch (error: any) {
            set({ error: error.message });
            throw error;
        }
    },

    activateProgram: async (id) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const response = await fetch(`${API_URL}/training-programs/${id}/activate`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to activate program');

            const activated = await response.json();

            // Update all programs in state
            set((state) => ({
                programs: state.programs.map((p) => ({
                    ...p,
                    is_active: p.id === id,
                })),
                activeProgram: activated,
            }));
        } catch (error: any) {
            set({ error: error.message });
            throw error;
        }
    },

    getStats: async (id: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const response = await fetch(`${API_URL}/training-programs/${id}/stats`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch stats');

            return await response.json();
        } catch (error: any) {
            set({ error: error.message });
            throw error;
        }
    },

    // ============================================
    // SHARING METHODS
    // ============================================

    generateShareLink: async (programId: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const response = await fetch(`${API_URL}/training-programs/${programId}/share`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to generate share link');

            return await response.json();
        } catch (error: any) {
            set({ error: error.message });
            throw error;
        }
    },

    getSharedProgram: async (token: string) => {
        try {
            // Public endpoint - no authentication required
            const response = await fetch(`${API_URL}/training-programs/shared/${token}`);

            if (!response.ok) throw new Error('Failed to fetch shared program');

            return await response.json();
        } catch (error: any) {
            set({ error: error.message });
            throw error;
        }
    },

    copySharedProgram: async (token: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const response = await fetch(`${API_URL}/training-programs/shared/${token}/copy`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to copy program');

            const result = await response.json();
            return result.programId;
        } catch (error: any) {
            set({ error: error.message });
            throw error;
        }
    },

    removeShareLink: async (programId: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const response = await fetch(`${API_URL}/training-programs/${programId}/share`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to remove share link');
        } catch (error: any) {
            set({ error: error.message });
            throw error;
        }
    },
}));
