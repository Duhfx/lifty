import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface UserData {
    fullName: string;
    birthDate: string;
    gender: string;
}

interface AuthStore {
    user: User | null;
    session: Session | null;
    loading: boolean;

    signUp: (email: string, password: string, userData: UserData) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    initialize: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    session: null,
    loading: true,

    signUp: async (email: string, password: string, userData: UserData) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: userData.fullName,
                    birth_date: userData.birthDate,
                    gender: userData.gender,
                }
            }
        });

        if (error) throw error;

        set({ user: data.user, session: data.session });
    },

    signIn: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        set({ user: data.user, session: data.session });
    },

    signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        set({ user: null, session: null });
    },

    initialize: async () => {
        set({ loading: true });

        const { data: { session } } = await supabase.auth.getSession();

        set({
            user: session?.user ?? null,
            session,
            loading: false
        });

        supabase.auth.onAuthStateChange((_event, session) => {
            set({ user: session?.user ?? null, session });
        });
    },

    refreshUser: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            set({ user });
        }
    },
}));
