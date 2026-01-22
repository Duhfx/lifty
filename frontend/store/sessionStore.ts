import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { offlineQueue } from '@/lib/offlineQueue';

interface Set {
    id: string;
    workout_exercise_id: string;
    set_number: number;
    reps: number;
    weight: number;
}

interface Session {
    id: string;
    workout_id: string;
    executed_at: string;
    notes?: string;
    duration_minutes?: number;
    workouts?: { id: string; name: string };
    sets?: Set[];
}

interface LastSessionData {
    [exerciseId: string]: Array<{ set_number: number; reps: number; weight: number }>;
}

interface SessionStore {
    sessions: Session[];
    currentSession: Session | null;
    loading: boolean;
    error: string | null;
    timerSeconds: number;
    timerRunning: boolean;
    lastSessionData: LastSessionData | null;

    fetchSessions: () => Promise<void>;
    getSession: (id: string) => Promise<Session | null>;
    createSession: (workoutId: string) => Promise<Session>;
    addSet: (sessionId: string, exerciseId: string, reps: number, weight: number) => Promise<Set>;
    updateSet: (sessionId: string, setId: string, reps: number, weight: number) => Promise<void>;
    deleteSet: (sessionId: string, setId: string) => Promise<void>;
    saveSessionProgress: (sessionId: string, setsData: { exerciseId: string; reps: number; weight: number }[]) => Promise<void>;
    finishSession: (sessionId: string, notes?: string, sets?: any[]) => Promise<void>;
    deleteSession: (sessionId: string) => Promise<void>;
    startTimer: () => void;
    stopTimer: () => void;
    resetTimer: () => void;
    setCurrentSession: (session: Session | null) => void;
    fetchLastSessionData: (workoutId: string) => Promise<LastSessionData>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

let timerInterval: NodeJS.Timeout | null = null;

export const useSessionStore = create<SessionStore>((set, get) => ({
    sessions: [],
    currentSession: null,
    loading: false,
    error: null,
    timerSeconds: 0,
    timerRunning: false,
    lastSessionData: null,

    fetchSessions: async () => {
        set({ loading: true, error: null });
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const response = await fetch(`${API_URL}/sessions`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` },
            });

            if (!response.ok) throw new Error('Failed to fetch sessions');
            const data = await response.json();
            set({ sessions: data, loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },

    getSession: async (id: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const response = await fetch(`${API_URL}/sessions/${id}`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` },
            });

            if (!response.ok) throw new Error('Failed to fetch session');
            return await response.json();
        } catch (error: any) {
            set({ error: error.message });
            return null;
        }
    },

    createSession: async (workoutId: string) => {
        try {
            console.log('🟢 [FRONTEND] Creating session for workout:', workoutId);

            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                console.error('🔴 [FRONTEND] Not authenticated');
                throw new Error('Not authenticated');
            }

            console.log('🟢 [FRONTEND] User authenticated, calling API...');

            const response = await fetch(`${API_URL}/sessions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ workout_id: workoutId }),
            });

            console.log('🟢 [FRONTEND] API Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('🔴 [FRONTEND] API Error:', errorText);
                throw new Error('Failed to create session');
            }

            const newSession = await response.json();
            console.log('✅ [FRONTEND] Session created successfully:', newSession);

            set({ currentSession: newSession });
            get().startTimer();
            return newSession;
        } catch (error: any) {
            console.error('🔴 [FRONTEND] Create session error:', error);
            set({ error: error.message });
            throw error;
        }
    },

    addSet: async (sessionId, exerciseId, reps, weight) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const response = await fetch(`${API_URL}/sessions/${sessionId}/sets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    workout_exercise_id: exerciseId,
                    reps,
                    weight,
                }),
            });

            if (!response.ok) throw new Error('Failed to add set');

            const newSet = await response.json();

            // Refresh current session
            const updatedSession = await get().getSession(sessionId);
            set({ currentSession: updatedSession });

            return newSet;
        } catch (error: any) {
            set({ error: error.message });
            throw error;
        }
    },

    updateSet: async (sessionId, setId, reps, weight) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const response = await fetch(`${API_URL}/sessions/${sessionId}/sets/${setId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ reps, weight }),
            });

            if (!response.ok) throw new Error('Failed to update set');

            const updatedSession = await get().getSession(sessionId);
            set({ currentSession: updatedSession });
        } catch (error: any) {
            set({ error: error.message });
            throw error;
        }
    },

    deleteSet: async (sessionId, setId) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const response = await fetch(`${API_URL}/sessions/${sessionId}/sets/${setId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${session.access_token}` },
            });

            if (!response.ok) throw new Error('Failed to delete set');

            const updatedSession = await get().getSession(sessionId);
            set({ currentSession: updatedSession });
        } catch (error: any) {
            set({ error: error.message });
            throw error;
        }
    },

    saveSessionProgress: async (sessionId, setsData) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            // Save each set that has both reps and weight
            const validSets = setsData.filter(set => set.reps > 0 && set.weight > 0);

            // Save sets to backend
            for (const setData of validSets) {
                await fetch(`${API_URL}/sessions/${sessionId}/sets`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify({
                        workout_exercise_id: setData.exerciseId,
                        reps: setData.reps,
                        weight: setData.weight,
                    }),
                });
            }

            // No need to refresh session immediately for auto-save
            // The UI will refresh when needed
        } catch (error: any) {
            // Silent fail for auto-save - we don't want to interrupt the user
            console.error('Auto-save failed:', error);

            // Adicionar à fila offline
            const validSets = setsData.filter(set => set.reps > 0 && set.weight > 0);
            for (const setData of validSets) {
                offlineQueue.add({
                    endpoint: `${API_URL}/sessions/${sessionId}/sets`,
                    method: 'POST',
                    body: {
                        workout_exercise_id: setData.exerciseId,
                        reps: setData.reps,
                        weight: setData.weight,
                    },
                });
            }
        }
    },

    finishSession: async (sessionId, notes?, sets?) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const duration = Math.floor(get().timerSeconds / 60);

            const response = await fetch(`${API_URL}/sessions/${sessionId}/finish`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    notes,
                    duration_minutes: duration,
                    sets: sets || [],
                }),
            });

            if (!response.ok) throw new Error('Failed to finish session');

            get().stopTimer();
            get().resetTimer();
            set({ currentSession: null });
        } catch (error: any) {
            set({ error: error.message });
            throw error;
        }
    },

    deleteSession: async (sessionId) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const response = await fetch(`${API_URL}/sessions/${sessionId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${session.access_token}` },
            });

            if (!response.ok) throw new Error('Failed to delete session');

            set((state) => ({
                sessions: state.sessions.filter((s) => s.id !== sessionId),
            }));
        } catch (error: any) {
            set({ error: error.message });
            throw error;
        }
    },

    startTimer: () => {
        if (timerInterval) return;
        set({ timerRunning: true });
        timerInterval = setInterval(() => {
            set((state) => ({ timerSeconds: state.timerSeconds + 1 }));
        }, 1000);
    },

    stopTimer: () => {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        set({ timerRunning: false });
    },

    resetTimer: () => {
        set({ timerSeconds: 0 });
    },

    setCurrentSession: (session) => {
        set({ currentSession: session });
    },

    fetchLastSessionData: async (workoutId: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const response = await fetch(`${API_URL}/sessions/workout/${workoutId}/last-session-data`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` },
            });

            if (!response.ok) throw new Error('Failed to fetch last session data');
            const data = await response.json();
            set({ lastSessionData: data });
            return data;
        } catch (error: any) {
            set({ error: error.message, lastSessionData: null });
            return {};
        }
    },
}));
