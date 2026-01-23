'use client';

import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { useWorkoutStore } from '@/store/workoutStore';
import { useSessionStore } from '@/store/sessionStore';
import { useTrainingProgramStore } from '@/store/trainingProgramStore';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
    Calendar,
    ChevronRight,
    Dumbbell,
    Flame,
    Play,
    Settings,
    Trophy,
    History,
    User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { InstallPrompt } from '@/components/InstallPrompt';

// Componente Card Sóbrio
const NeoCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-white border border-slate-200 shadow-sm rounded-xl p-5 ${className}`}>
        {children}
    </div>
);

// Cores para os cards de treino
const CARD_COLORS = ['bg-slate-900', 'bg-indigo-950', 'bg-slate-800', 'bg-zinc-900', 'bg-neutral-800'];

export default function DashboardPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { workouts, nextWorkout, fetchWorkouts, fetchNextWorkout, loading: workoutsLoading } = useWorkoutStore();
    const { sessions, currentSession, fetchSessions, loading: sessionsLoading } = useSessionStore();
    const { activeProgram } = useTrainingProgramStore();
    const nextWorkoutRef = useRef<HTMLDivElement>(null);

    // Simplificar greeting
    const userName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Atleta';

    useEffect(() => {
        // Disparar fetches em paralelo, mas não bloquear
        // Se cache existe, UI renderiza imediatamente
        Promise.all([
            fetchWorkouts(),
            fetchSessions(),
            fetchNextWorkout()
        ]);
    }, [fetchWorkouts, fetchSessions, fetchNextWorkout]);

    // Scroll to next suggested workout (instant, before paint)
    useLayoutEffect(() => {
        if (nextWorkoutRef.current && nextWorkout && !currentSession && !workoutsLoading) {
            nextWorkoutRef.current.scrollIntoView({
                block: 'nearest',
                inline: 'center'
            });
        }
    }, [nextWorkout, currentSession, workoutsLoading]);

    // Dados Calculados
    let activeWorkouts = workouts.filter(w => !w.is_archived);
    if (activeProgram) {
        activeWorkouts = activeWorkouts.filter(w => w.program_id === activeProgram.id);
    }

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeekSessions = sessions.filter(s => new Date(s.executed_at) >= oneWeekAgo);
    const recentSessions = sessions.slice(0, 3);

    // Helpers
    const getLastPerformedText = (workoutId: string) => {
        const lastSession = sessions.find(s => s.workout_id === workoutId);
        if (!lastSession) return 'Nunca realizado';

        const diff = differenceInDays(new Date(), new Date(lastSession.executed_at));
        if (diff === 0) return 'Hoje';
        if (diff === 1) return 'Ontem';
        return `${diff} dias atrás`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const diffDays = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Hoje';
        if (diffDays === 1) return 'Ontem';
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    };

    // Mostrar skeleton APENAS se loading E não tem dados em cache
    const hasWorkoutsData = workouts.length > 0;
    const hasSessionsData = sessions.length > 0;
    const isInitialLoad = (workoutsLoading || sessionsLoading) && !hasWorkoutsData && !hasSessionsData;

    // Find active workout if session exists
    const currentWorkout = currentSession ? workouts.find(w => w.id === currentSession.workout_id) : null;

    return (
        <DashboardLayout>
            <InstallPrompt />
            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                body {
                    overflow-x: hidden;
                    overscroll-behavior-x: none;
                }
                .workout-carousel {
                    overscroll-behavior-x: contain;
                    -webkit-overflow-scrolling: touch;
                }
            `}</style>
            <div className="max-w-md mx-auto space-y-4 overflow-x-hidden">
                
                {/* 1. HEADER (Sóbrio) */}
                <header className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                            {user?.user_metadata?.avatar_url ? (
                                <img
                                    src={user.user_metadata.avatar_url}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User size={20} className="text-slate-600" />
                            )}
                        </div>
                        <h1 className="text-lg font-bold tracking-tight text-slate-900">
                            Olá, {userName}
                        </h1>
                    </div>
                    <button className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors shadow-sm">
                        <Settings size={20} />
                    </button>
                </header>

                {/* 2. STATS GRID */}
                <div className="grid grid-cols-2 gap-4">
                    <NeoCard className="group hover:border-slate-300 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Sequência</p>
                            <Flame size={18} className="text-slate-400 group-hover:text-amber-500 transition-colors" />
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-slate-900">{thisWeekSessions.length}</span>
                            <span className="text-xs text-slate-500">dias</span>
                        </div>
                    </NeoCard>

                    <NeoCard className="group hover:border-slate-300 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">Total</p>
                            <Trophy size={18} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-slate-900">{sessions.length}</span>
                            <span className="text-xs text-slate-500">treinos</span>
                        </div>
                    </NeoCard>
                </div>

                {/* 3. TREINOS / CONTINUAR */}
                <section>
                    <div className="flex items-center justify-between mb-3 px-1">
                        <h3 className="text-base font-bold text-slate-900">
                            {currentSession ? 'Em Andamento' : 'Seus Programas'}
                        </h3>
                        {!currentSession && (
                            <button onClick={() => router.push('/programs')} className="text-slate-900 text-xs font-bold hover:underline">Ver todos</button>
                        )}
                    </div>

                    {isInitialLoad ? (
                        <div className="h-40 rounded-xl bg-slate-100 animate-pulse" />
                    ) : currentSession && currentWorkout ? (
                        /* CARD CONTINUAR TREINO */
                        <div 
                            onClick={() => router.push(`/workouts/${currentWorkout.id}/start`)}
                            className="w-full rounded-xl bg-slate-900 p-5 relative overflow-hidden shadow-lg shadow-indigo-500/20 text-white flex flex-col justify-between min-h-[160px] cursor-pointer active:scale-[0.98] transition-transform"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Play size={80} />
                            </div>
                            
                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-white/10 text-white text-[10px] font-bold uppercase tracking-wider mb-3 backdrop-blur-sm border border-white/10">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> 
                                    Treinando Agora
                                </div>
                                <h3 className="text-2xl font-bold leading-tight mr-8">{currentWorkout.name}</h3>
                            </div>

                            <div className="relative z-10 mt-4 flex items-center justify-between">
                                <p className="text-slate-400 text-xs font-medium">
                                    {currentWorkout.workout_exercises?.length || 0} exercícios restantes
                                </p>
                                <Button 
                                    size="sm"
                                    className="bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs h-9 px-4 rounded-lg"
                                >
                                    Continuar <ChevronRight size={14} className="ml-1" />
                                </Button>
                            </div>
                        </div>
                    ) : activeWorkouts.length > 0 ? (
                        <div className="workout-carousel flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar snap-x snap-mandatory">
                            {activeWorkouts.map((workout, index) => {
                                const colorClass = CARD_COLORS[index % CARD_COLORS.length];
                                const lastPerformed = getLastPerformedText(workout.id);
                                const tags = workout.workout_exercises?.slice(0, 3).map(e => e.name) || [];
                                const remainingTags = (workout.workout_exercises?.length || 0) - 3;
                                const isNextSuggested = nextWorkout?.id === workout.id;

                                return (
                                    <div
                                        key={workout.id}
                                        ref={isNextSuggested ? nextWorkoutRef : null}
                                        onClick={() => router.push(`/workouts/${workout.id}/start`)}
                                        className={`snap-center shrink-0 w-[85%] rounded-xl ${colorClass} p-5 relative overflow-hidden shadow-md text-white flex flex-col justify-between min-h-[160px] transition-transform active:scale-[0.98] cursor-pointer`}
                                    >
                                        {/* Next Suggested Badge */}
                                        {isNextSuggested && (
                                            <div className="absolute top-3 left-3 z-20">
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-400 text-slate-900 text-[10px] font-bold uppercase tracking-wider shadow-lg">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-900 animate-pulse" />
                                                    Próximo Sugerido
                                                </div>
                                            </div>
                                        )}

                                        {/* Top Section */}
                                        <div className="relative z-10 flex justify-between items-start">
                                            <div className={isNextSuggested ? 'mt-8' : ''}>
                                                <h3 className="text-xl font-bold leading-tight mr-2 line-clamp-2">{workout.name}</h3>
                                            </div>
                                            <button className="w-10 h-10 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-lg hover:bg-slate-50 transition-colors shrink-0">
                                                <Play fill="currentColor" size={16} className="ml-0.5" />
                                            </button>
                                        </div>

                                        {/* Tags Section */}
                                        <div className="relative z-10 mt-4">
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {tags.map((tag) => (
                                                    <span key={tag} className="px-2 py-1 rounded-[6px] bg-white/10 border border-white/5 text-[10px] font-medium text-white/90 backdrop-blur-sm truncate max-w-[100px]">
                                                        {tag}
                                                    </span>
                                                ))}
                                                {remainingTags > 0 && (
                                                    <span className="px-2 py-1 rounded-[6px] bg-white/5 border border-white/5 text-[10px] text-white/60">
                                                        +{remainingTags}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2 text-white/40 text-[10px] font-medium uppercase tracking-wider">
                                                <Calendar size={12} />
                                                <span>Último: {lastPerformed}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <p className="text-sm text-slate-500 mb-2">Nenhum programa encontrado</p>
                            <button onClick={() => router.push('/programs/new')} className="text-sm font-bold text-indigo-600 hover:underline">
                                Criar Primeiro Programa
                            </button>
                        </div>
                    )}
                </section>

                {/* 4. HISTÓRICO RECENTE */}
                <section>
                    <div className="flex items-center justify-between mb-3 px-1">
                        <h3 className="text-base font-bold text-slate-900">Histórico Recente</h3>
                        <button onClick={() => router.push('/history')} className="text-slate-900 text-xs font-bold hover:underline">Ver tudo</button>
                    </div>
                    <div className="space-y-2">
                        {recentSessions.length > 0 ? recentSessions.map((session) => (
                            <NeoCard 
                                key={session.id} 
                                className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer group shadow-sm !border-slate-200"
                            >
                                <div 
                                    onClick={() => router.push(`/history/${session.id}`)}
                                    className="flex items-center gap-4 flex-1"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:text-slate-900 transition-colors border border-slate-100 shrink-0">
                                        <History size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-semibold truncate text-slate-900">{session.workouts?.name || 'Treino Realizado'}</h4>
                                        <p className="text-[10px] uppercase tracking-wide text-slate-500 font-medium">
                                            {formatDate(session.executed_at)}
                                            {session.duration_minutes && ` • ${session.duration_minutes}min`}
                                        </p>
                                    </div>
                                    <div className="text-right whitespace-nowrap">
                                        <ChevronRight size={14} className="text-slate-300" />
                                    </div>
                                </div>
                            </NeoCard>
                        )) : (
                            <div className="text-center py-6 text-slate-400 text-xs italic">
                                Sem histórico recente.
                            </div>
                        )}
                    </div>
                </section>

            </div>
        </DashboardLayout>
    );
}
