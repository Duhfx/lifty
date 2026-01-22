'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useTrainingProgramStore } from '@/store/trainingProgramStore';
import { useWorkoutStore } from '@/store/workoutStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShareProgramModal } from '@/components/ShareProgramModal';
import { 
    ChevronLeft, 
    Plus, 
    Share2, 
    Edit2, 
    Trash2, 
    Dumbbell, 
    CheckCircle2, 
    Layout,
    Calendar,
    Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Componente Card Sóbrio
const NeoCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={cn("bg-white border border-slate-200 shadow-sm rounded-xl p-5", className)}>
        {children}
    </div>
);

export default function ProgramDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { getProgram, activateProgram } = useTrainingProgramStore();
    const { createWorkout, deleteWorkout } = useWorkoutStore();

    const [program, setProgram] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showNewWorkoutModal, setShowNewWorkoutModal] = useState(false);
    const [newWorkoutName, setNewWorkoutName] = useState('');
    const [newWorkoutDescription, setNewWorkoutDescription] = useState('');
    const [creating, setCreating] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);

    useEffect(() => {
        loadProgram();
    }, []);

    const loadProgram = async () => {
        try {
            const data = await getProgram(id);
            setProgram(data);
        } catch (error) {
            router.push('/programs');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateWorkout = async () => {
        if (!newWorkoutName.trim()) return;

        setCreating(true);
        try {
            const wasActive = program.is_active;
            if (!wasActive) {
                await activateProgram(id);
            }

            await createWorkout({
                name: newWorkoutName,
                description: newWorkoutDescription || undefined,
            });

            setShowNewWorkoutModal(false);
            setNewWorkoutName('');
            setNewWorkoutDescription('');
            await loadProgram();
        } catch (error) {
            alert('Erro ao criar treino');
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteWorkout = async (e: React.MouseEvent, workoutId: string) => {
        e.stopPropagation();
        if (!confirm('Deletar este treino?')) return;

        try {
            await deleteWorkout(workoutId);
            await loadProgram();
        } catch (error) {
            alert('Erro ao deletar treino');
        }
    };

    const handleActivateProgram = async () => {
        try {
            await activateProgram(id);
            await loadProgram();
        } catch (error) {
            alert('Erro ao ativar programa');
        }
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

    if (!program) return null;

    const activeWorkouts = program.workouts?.filter((w: any) => !w.is_archived) || [];

    return (
        <DashboardLayout>
            <div className="max-w-md mx-auto space-y-6 pb-20">
                {/* --- HEADER --- */}
                <div className="flex items-center justify-between pt-2">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => router.push('/programs')}
                        className="rounded-lg hover:bg-slate-100 -ml-2"
                    >
                        <ChevronLeft size={24} className="text-slate-600" />
                    </Button>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-slate-400 hover:text-slate-900 rounded-lg"
                            onClick={() => setShowShareModal(true)}
                        >
                            <Share2 size={20} />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-slate-400 hover:text-slate-900 rounded-lg"
                            onClick={() => router.push(`/programs/${id}/edit`)}
                        >
                            <Settings size={20} />
                        </Button>
                    </div>
                </div>

                {/* --- PROGRAM INFO --- */}
                <NeoCard className={cn(program.is_active ? "border-slate-300 bg-slate-50" : "")}>
                    <div className="space-y-2">
                        <div className="flex items-start justify-between">
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-tight">
                                {program.name}
                            </h1>
                            {program.is_active && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider shrink-0">
                                    <CheckCircle2 size={10} className="fill-current" />
                                    Ativo
                                </span>
                            )}
                        </div>
                        {program.description && (
                            <p className="text-slate-500 text-sm leading-relaxed">
                                {program.description}
                            </p>
                        )}
                        <div className="flex items-center gap-4 pt-2 text-xs font-medium text-slate-400 uppercase tracking-wide">
                            <span className="flex items-center gap-1">
                                <Layout size={12} /> {activeWorkouts.length} Treinos
                            </span>
                            {program.start_date && (
                                <span className="flex items-center gap-1">
                                    <Calendar size={12} /> {format(new Date(program.start_date), 'dd/MM/yy')}
                                </span>
                            )}
                        </div>
                    </div>
                    {!program.is_active && (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                            <Button 
                                onClick={handleActivateProgram}
                                className="w-full h-10 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-sm font-bold"
                            >
                                Tornar Ativo
                            </Button>
                        </div>
                    )}
                </NeoCard>

                {/* --- WORKOUTS LIST --- */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-base font-bold text-slate-900">Treinos</h2>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-bold text-xs"
                            onClick={() => setShowNewWorkoutModal(true)}
                        >
                            <Plus size={16} className="mr-1" /> Adicionar
                        </Button>
                    </div>

                    {activeWorkouts.length > 0 ? (
                        <div className="space-y-3">
                            {activeWorkouts.map((workout: any) => (
                                <NeoCard
                                    key={workout.id}
                                    className="p-4 flex flex-col gap-3 transition-colors"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-base text-slate-900">{workout.name}</h3>
                                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                                                {workout.description || 'Sem descrição'}
                                            </p>
                                        </div>
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                                            <Dumbbell size={16} />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            {workout.workout_exercises?.length || 0} exercícios
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-slate-300 hover:text-slate-600 rounded"
                                                onClick={() => router.push(`/workouts/${workout.id}/edit`)}
                                            >
                                                <Edit2 size={14} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded"
                                                onClick={(e) => handleDeleteWorkout(e, workout.id)}
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                </NeoCard>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white border border-dashed border-slate-200 rounded-xl">
                            <p className="text-xs text-slate-500 mb-3">Nenhum treino nesta rotina.</p>
                            <Button 
                                onClick={() => setShowNewWorkoutModal(true)} 
                                variant="outline"
                                className="h-9 text-xs rounded-lg border-slate-200"
                            >
                                Criar Primeiro Treino
                            </Button>
                        </div>
                    )}
                </div>

                {/* --- CREATE WORKOUT MODAL --- */}
                {showNewWorkoutModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
                        <NeoCard className="w-full max-w-sm p-6 space-y-5 shadow-2xl border-none">
                            <h2 className="text-lg font-bold text-slate-900">Novo Treino</h2>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Nome</label>
                                    <Input
                                        value={newWorkoutName}
                                        onChange={(e) => setNewWorkoutName(e.target.value)}
                                        placeholder="Ex: Treino A"
                                        className="bg-slate-50 border-slate-100"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Descrição</label>
                                    <textarea
                                        value={newWorkoutDescription}
                                        onChange={(e) => setNewWorkoutDescription(e.target.value)}
                                        placeholder="Opcional..."
                                        className="w-full min-h-[80px] px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-slate-300 transition-all text-sm text-slate-900 placeholder:text-slate-400 resize-none"
                                    />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1 rounded-lg border-slate-200"
                                        onClick={() => {
                                            setShowNewWorkoutModal(false);
                                            setNewWorkoutName('');
                                            setNewWorkoutDescription('');
                                        }}
                                        disabled={creating}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        className="flex-1 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                                        onClick={handleCreateWorkout}
                                        disabled={!newWorkoutName.trim() || creating}
                                    >
                                        {creating ? 'Criando...' : 'Criar'}
                                    </Button>
                                </div>
                            </div>
                        </NeoCard>
                    </div>
                )}

                {/* Share Modal */}
                {showShareModal && (
                    <ShareProgramModal
                        programId={program.id}
                        programName={program.name}
                        onClose={() => setShowShareModal(false)}
                    />
                )}
            </div>
        </DashboardLayout>
    );
}