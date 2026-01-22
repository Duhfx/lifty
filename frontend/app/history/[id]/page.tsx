'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useSessionStore } from '@/store/sessionStore';
import { Button } from '@/components/ui/button';
import { 
    ChevronLeft, 
    Trash2, 
    Calendar, 
    Clock, 
    Dumbbell, 
    FileText,
    Weight,
    ListChecks,
    History
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Componente Card Sóbrio
const NeoCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-white border border-slate-200 shadow-sm rounded-xl p-5 ${className}`}>
        {children}
    </div>
);

// Stat Box Sóbrio
const StatBox = ({ label, value, icon: Icon }: { label: string, value: string | number, icon: any }) => (
    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col items-center justify-center text-center">
        <Icon size={18} className="text-slate-400 mb-2" />
        <span className="text-xl font-bold text-slate-900 leading-none mb-1">{value}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
    </div>
);

interface Exercise {
    id: string;
    name: string;
    muscle_group?: string;
}

interface WorkoutWithExercises {
    id: string;
    name: string;
    workout_exercises: Exercise[];
}

interface SessionDetails {
    id: string;
    executed_at: string;
    notes?: string;
    duration_minutes?: number;
    workouts?: WorkoutWithExercises;
    sets: {
        id: string;
        workout_exercise_id: string;
        set_number: number;
        reps: number;
        weight: number;
    }[];
}

export default function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { getSession, deleteSession } = useSessionStore();
    const [session, setSession] = useState<SessionDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSession();
    }, []);

    const loadSession = async () => {
        try {
            const data = await getSession(id);
            setSession(data as SessionDetails | null);
        } catch (error) {
            router.push('/history');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: string) => {
        return format(new Date(date), "EEEE, d 'de' MMMM", { locale: ptBR });
    };

    const handleBack = () => router.push('/history');

    const handleDelete = async () => {
        if (!confirm('Deseja deletar este registro permanentemente?')) return;
        try {
            await deleteSession(id);
            router.push('/history');
        } catch (error) {
            alert('Erro ao deletar');
        }
    };

    const getExerciseSets = (exerciseId: string) => {
        return session?.sets?.filter((s) => s.workout_exercise_id === exerciseId) || [];
    };

    const getTotalSets = () => session?.sets?.length || 0;

    const getTotalVolume = () => {
        return session?.sets?.reduce((acc, set) => acc + (set.reps * set.weight), 0) || 0;
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="max-w-md mx-auto py-20 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-slate-800 mx-auto"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!session) return null;

    return (
        <DashboardLayout>
            <div className="max-w-md mx-auto space-y-6 pb-20">
                {/* --- HEADER --- */}
                <div className="flex items-center justify-between pt-2">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={handleBack}
                        className="rounded-lg hover:bg-slate-100 -ml-2"
                    >
                        <ChevronLeft size={24} className="text-slate-600" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                        onClick={handleDelete}
                    >
                        <Trash2 size={20} />
                    </Button>
                </div>

                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-tight">
                        {session.workouts?.name || 'Treino Avulso'}
                    </h1>
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                        <Calendar size={14} />
                        <span className="capitalize">{formatDate(session.executed_at)}</span>
                    </div>
                </div>

                {/* --- QUICK STATS --- */}
                <div className="grid grid-cols-3 gap-3">
                    <StatBox 
                        label="Duração" 
                        value={session.duration_minutes ? `${session.duration_minutes}m` : '--'} 
                        icon={Clock} 
                    />
                    <StatBox 
                        label="Sets" 
                        value={getTotalSets()} 
                        icon={ListChecks} 
                    />
                    <StatBox 
                        label="Volume" 
                        value={`${(getTotalVolume() / 1000).toFixed(1)}t`} 
                        icon={Weight} 
                    />
                </div>

                {/* --- NOTES SECTION --- */}
                {session.notes && (
                    <NeoCard className="bg-slate-50 border-slate-100">
                        <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-widest mb-2">
                            <FileText size={14} /> Notas
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed">{session.notes}</p>
                    </NeoCard>
                )}

                {/* --- EXERCISES & SETS --- */}
                <div className="space-y-4">
                    <h2 className="text-base font-bold flex items-center gap-2 text-slate-900 mt-6">
                        <Dumbbell size={18} />
                        Exercícios
                    </h2>

                    <div className="space-y-4">
                        {session.workouts?.workout_exercises?.map((exercise) => {
                            const exerciseSets = getExerciseSets(exercise.id);
                            if (exerciseSets.length === 0) return null;

                            return (
                                <NeoCard key={exercise.id} className="p-0 overflow-hidden">
                                    <div className="p-4 border-b border-slate-100 flex items-start justify-between bg-white">
                                        <div>
                                            <h3 className="font-bold text-base text-slate-900">{exercise.name}</h3>
                                            {exercise.muscle_group && (
                                                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">{exercise.muscle_group}</span>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Total</span>
                                            <span className="text-sm font-bold text-slate-900">
                                                {exerciseSets.reduce((acc, s) => acc + (s.reps * s.weight), 0)}kg
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="divide-y divide-slate-100">
                                        {exerciseSets.map((set, idx) => (
                                            <div key={set.id} className="flex justify-between items-center p-3 hover:bg-slate-50/50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                                        {idx + 1}
                                                    </span>
                                                    <span className="text-sm font-medium text-slate-400">Série</span>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <div className="text-right">
                                                        <span className="text-sm font-bold text-slate-900">{set.reps}</span>
                                                        <span className="text-[10px] text-slate-400 ml-1">reps</span>
                                                    </div>
                                                    <div className="text-right w-16">
                                                        <span className="text-sm font-bold text-slate-900">{set.weight}</span>
                                                        <span className="text-[10px] text-slate-400 ml-1">kg</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </NeoCard>
                            );
                        })}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}