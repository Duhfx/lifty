'use client';

import { useEffect, useState, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useSessionStore } from '@/store/sessionStore';
import { useWorkoutStore } from '@/store/workoutStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExerciseHistoryChart } from '@/components/ExerciseHistoryChart';
import { 
    Clock, 
    CheckCircle2, 
    History as HistoryIcon, 
    ChevronDown, 
    Check, 
    AlertCircle, 
    RotateCcw,
    Trophy,
    ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Componente Card Sóbrio
const NeoCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={cn("bg-white border border-slate-200 shadow-sm rounded-xl p-5", className)}>
        {children}
    </div>
);

interface SetInput {
    setNumber: number;
    reps: string;
    weight: string;
}

export default function WorkoutStartPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { getWorkout } = useWorkoutStore();
    const {
        currentSession,
        timerSeconds,
        createSession,
        finishSession,
        fetchLastSessionData,
        saveSessionProgress,
    } = useSessionStore();

    const [workout, setWorkout] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [finishNotes, setFinishNotes] = useState('');
    const [showFinishModal, setShowFinishModal] = useState(false);
    const [showHistoryExerciseId, setShowHistoryExerciseId] = useState<string | null>(null);
    const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
    const [exerciseInputs, setExerciseInputs] = useState<Record<string, SetInput[]>>({});
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
    const savedSetsRef = useRef<Set<string>>(new Set());
    const [expandedExercises, setExpandedExercises] = useState<Set<string>>(new Set());
    const sessionCreatedRef = useRef(false);

    useEffect(() => {
        const init = async () => {
            await loadWorkout();
            if (!currentSession && !sessionCreatedRef.current) {
                try {
                    sessionCreatedRef.current = true;
                    await createSession(id);
                } catch (error) {
                    sessionCreatedRef.current = false;
                    router.push('/dashboard');
                }
            }
        };
        init();
    }, [id]);

    useEffect(() => {
        if (!currentSession) return;
        const saveProgress = async () => {
            setIsSaving(true);
            const backupData = {
                exerciseInputs,
                completedExercises: Array.from(completedExercises),
                timestamp: new Date().toISOString(),
            };
            localStorage.setItem(`session_${currentSession.id}`, JSON.stringify(backupData));
            const setsToSave: { exerciseId: string; reps: number; weight: number }[] = [];
            Object.entries(exerciseInputs).forEach(([exerciseId, sets]) => {
                sets.forEach((set, index) => {
                    const setKey = `${exerciseId}-${index}`;
                    if (set.reps && set.weight && !savedSetsRef.current.has(setKey)) {
                        setsToSave.push({
                            exerciseId,
                            reps: parseInt(set.reps),
                            weight: parseFloat(set.weight),
                        });
                        savedSetsRef.current.add(setKey);
                    }
                });
            });
            if (setsToSave.length > 0) {
                try {
                    await saveSessionProgress(currentSession.id, setsToSave);
                    setLastSaved(new Date());
                } catch (error) {
                    console.error('Auto-save failed:', error);
                }
            }
            setIsSaving(false);
        };
        const interval = setInterval(30000, saveProgress);
        return () => clearInterval(interval);
    }, [currentSession, exerciseInputs, completedExercises]);

    useEffect(() => {
        if (!currentSession) return;
        const savedData = localStorage.getItem(`session_${currentSession.id}`);
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                const savedTime = new Date(parsed.timestamp);
                const minutesAgo = Math.floor((Date.now() - savedTime.getTime()) / 60000);
                if (minutesAgo < 120) setShowRecoveryDialog(true);
            } catch (error) {}
        }
    }, [currentSession]);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (currentSession) {
                e.preventDefault();
                e.returnValue = 'Você tem um treino em andamento. Deseja realmente sair?';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [currentSession]);

    const toggleExerciseExpanded = (exerciseId: string) => {
        setExpandedExercises(prev => {
            const newSet = new Set<string>(prev);
            if (newSet.has(exerciseId)) newSet.delete(exerciseId);
            else newSet.add(exerciseId);
            return newSet;
        });
    };

    const checkExerciseCompletion = (exerciseId: string) => {
        if (completedExercises.has(exerciseId)) return;

        const sets = exerciseInputs[exerciseId] || [];
        if (sets.length > 0) {
            const allSetsFilled = sets.every(set => 
                set.reps && 
                !isNaN(parseInt(set.reps)) && 
                parseInt(set.reps) > 0 &&
                set.weight && 
                !isNaN(parseFloat(set.weight)) && 
                parseFloat(set.weight) > 0
            );

            if (allSetsFilled) {
                setCompletedExercises(prev => new Set(prev).add(exerciseId));
            }
        }
    };

    const saveSetData = async (exerciseId: string, reps: string, weight: string) => {
        if (!currentSession || !reps || !weight) return;
        
        const parsedReps = parseInt(reps);
        const parsedWeight = parseFloat(weight);

        if (isNaN(parsedReps) || isNaN(parsedWeight) || parsedReps <= 0 || parsedWeight <= 0) return;

        setIsSaving(true);
        try {
            await saveSessionProgress(currentSession.id, [{
                exerciseId,
                reps: parsedReps,
                weight: parsedWeight,
            }]);
            setLastSaved(new Date());
        } catch (error) {
            console.error('Failed to save set:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const loadWorkout = async () => {
        try {
            const data = await getWorkout(id);
            setWorkout(data);
            
            if (data?.workout_exercises) {
                const lastSessionData = await fetchLastSessionData(id);
                
                // Fetch latest state of current session to get saved sets
                let currentSessionSets: any[] = [];
                if (currentSession?.id) {
                    const fullSession = await useSessionStore.getState().getSession(currentSession.id);
                    if (fullSession?.sets) {
                        currentSessionSets = fullSession.sets;
                    }
                }

                const inputs: Record<string, SetInput[]> = {};
                const restoredCompletedExercises = new Set<string>();

                data.workout_exercises.forEach((exercise: any) => {
                    const savedSets = currentSessionSets.filter((s: any) => s.workout_exercise_id === exercise.id).sort((a: any, b: any) => a.set_number - b.set_number);
                    const hasSavedData = savedSets.length > 0;
                    
                    const suggestedSets = Math.max(exercise.suggested_sets || 3, savedSets.length);
                    const historySets = lastSessionData[exercise.id] || [];

                    inputs[exercise.id] = Array.from({ length: suggestedSets }, (_, i) => {
                        // Priority: 1. Current Session Saved Data, 2. Last Session History, 3. Default
                        if (hasSavedData) {
                            const savedSet = savedSets[i];
                            return {
                                setNumber: i + 1,
                                reps: savedSet?.reps?.toString() || '',
                                weight: savedSet?.weight?.toString() || '',
                            };
                        } else {
                            const lastSet = historySets[i];
                            return {
                                setNumber: i + 1,
                                reps: lastSet?.reps?.toString() || exercise.suggested_reps?.toString() || '',
                                weight: lastSet?.weight?.toString() || '',
                            };
                        }
                    });

                    // Check if exercise was fully completed in saved state
                    if (hasSavedData) {
                        const allFilled = inputs[exercise.id].every(s => s.reps && s.weight && parseFloat(s.reps) > 0 && parseFloat(s.weight) > 0);
                        if (allFilled) {
                            restoredCompletedExercises.add(exercise.id);
                        }
                    }
                });
                
                setExerciseInputs(inputs);
                setCompletedExercises(restoredCompletedExercises);

                if (data.workout_exercises.length > 0) {
                    setExpandedExercises(new Set([data.workout_exercises[0].id]));
                }
            }
        } catch (error) {
            router.push('/workouts');
        } finally {
            setLoading(false);
        }
    };

    const toggleExerciseComplete = (exerciseId: string) => {
        const isCurrentlyCompleted = completedExercises.has(exerciseId);
        if (!isCurrentlyCompleted) {
            const exerciseSets = exerciseInputs[exerciseId] || [];
            if (!exerciseSets.some(set => set.reps && set.weight)) {
                alert('Preencha pelo menos 1 série');
                return;
            }
        }
        setCompletedExercises(prev => {
            const newSet = new Set(prev);
            if (newSet.has(exerciseId)) newSet.delete(exerciseId);
            else newSet.add(exerciseId);
            return newSet;
        });
    };

    const handleFinish = async () => {
        if (!currentSession) return;
        try {
            const allSets: any[] = [];
            Object.entries(exerciseInputs).forEach(([exerciseId, sets]) => {
                sets.forEach(set => {
                    if (set.reps && set.weight) {
                        allSets.push({
                            workout_exercise_id: exerciseId,
                            set_number: set.setNumber,
                            reps: parseInt(set.reps),
                            weight: parseFloat(set.weight),
                        });
                    }
                });
            });
            await finishSession(currentSession.id, finishNotes, allSets);
            router.push('/dashboard');
        } catch (error) {
            alert('Erro ao finalizar');
        }
    };

    const handleRecoverData = () => {
        if (!currentSession) return;
        const savedData = localStorage.getItem(`session_${currentSession.id}`);
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                setExerciseInputs(parsed.exerciseInputs);
                setCompletedExercises(new Set(parsed.completedExercises));
                setShowRecoveryDialog(false);
            } catch (error) {
                alert('Erro ao recuperar dados');
            }
        }
    };

    const handleDiscardRecovery = () => {
        if (currentSession) {
            localStorage.removeItem(`session_${currentSession.id}`);
        }
        setShowRecoveryDialog(false);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getFilledSets = (exerciseId: string) => {
        return exerciseInputs[exerciseId]?.filter(s => s.reps && s.weight).length || 0;
    };

    const totalExercises = workout?.workout_exercises?.length || 0;
    const completedCount = completedExercises.size;
    const progressPercentage = totalExercises > 0 ? (completedCount / totalExercises) * 100 : 0;

    if (loading || !currentSession) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center animate-fade-in">
                        <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Iniciando Treino</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen pb-32 animate-fade-in max-w-md mx-auto">
                {/* --- HEADER FIXO CLEAN --- */}
                <div className="sticky top-0 z-[49] -mx-4 px-4 bg-white/95 backdrop-blur-md border-b border-slate-200 pt-2 pb-3">
                    <div className="flex items-center justify-between gap-4 mb-3">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => router.push('/dashboard')}
                            className="h-9 w-9 rounded-lg text-slate-500 hover:bg-slate-100 shrink-0"
                        >
                            <ArrowLeft size={20} />
                        </Button>
                        
                        <div className="flex-1 text-center min-w-0">
                            <h1 className="text-base font-bold text-slate-900 truncate">{workout?.name}</h1>
                            <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500">
                                <Clock size={12} />
                                <span className="tabular-nums">{formatTime(timerSeconds)}</span>
                            </div>
                        </div>

                        <Button 
                            onClick={() => setShowFinishModal(true)} 
                            size="sm"
                            className="h-9 px-4 rounded-lg bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs"
                        >
                            Finalizar
                        </Button>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-slate-900 transition-all duration-500 ease-out" 
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>

                {/* --- EXERCISE LIST --- */}
                <div className="py-6 space-y-4">
                    {workout?.workout_exercises
                        ?.sort((a: any, b: any) => a.order_index - b.order_index)
                        .map((exercise: any, exerciseIndex: number) => {
                            const isCompleted = completedExercises.has(exercise.id);
                            const isExpanded = expandedExercises.has(exercise.id);
                            const sets = exerciseInputs[exercise.id] || [];
                            const filledSets = getFilledSets(exercise.id);

                            return (
                                <NeoCard 
                                    key={exercise.id} 
                                    className={cn(
                                        "p-0 overflow-hidden transition-all duration-300",
                                        isCompleted ? "border-emerald-200 bg-emerald-50/10" : ""
                                    )}
                                >
                                    {/* Exercise Item Header */}
                                    <div 
                                        className="p-4 flex items-start gap-4 cursor-pointer active:bg-slate-50 transition-colors"
                                        onClick={() => toggleExerciseExpanded(exercise.id)}
                                    >
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all shrink-0 mt-0.5",
                                            isCompleted 
                                                ? "bg-emerald-500 text-white" 
                                                : "bg-slate-100 text-slate-500"
                                        )}>
                                            {isCompleted ? <Check size={16} strokeWidth={3} /> : exerciseIndex + 1}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h3 className={cn(
                                                    "font-bold text-base leading-tight truncate pr-2",
                                                    isCompleted ? "text-emerald-900" : "text-slate-900"
                                                )}>
                                                    {exercise.name}
                                                </h3>
                                                <ChevronDown 
                                                    className={cn("text-slate-300 transition-transform duration-300 shrink-0", isExpanded && "rotate-180")} 
                                                    size={20} 
                                                />
                                            </div>
                                            
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                                    {exercise.muscle_group || 'Geral'}
                                                </span>
                                                <span className="text-xs font-medium text-slate-500">
                                                    {filledSets}/{sets.length} séries
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Panel */}
                                    {isExpanded && (
                                        <div className="px-4 pb-5 animate-fade-in border-t border-slate-100 pt-4 bg-slate-50/50">
                                            {/* Notes */}
                                            {exercise.notes && (
                                                <div className="mb-4 p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-2">
                                                    <AlertCircle size={14} className="text-slate-400 mt-0.5 shrink-0" />
                                                    <p className="text-xs text-slate-500 italic">"{exercise.notes}"</p>
                                                </div>
                                            )}

                                            {/* Sets Grid */}
                                            <div className="space-y-2">
                                                <div className="grid grid-cols-12 gap-2 px-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                                    <div className="col-span-2 text-center">Set</div>
                                                    <div className="col-span-5 text-center">Reps</div>
                                                    <div className="col-span-5 text-center">Kg</div>
                                                </div>
                                                
                                                {sets.map((setInput, idx) => (
                                                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                                                        <div className="col-span-2 flex justify-center">
                                                            <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-400">
                                                                {idx + 1}
                                                            </div>
                                                        </div>

                                                        <div className="col-span-5">
                                                            <Input 
                                                                type="number" 
                                                                inputMode="numeric"
                                                                className="h-10 text-center bg-white border-slate-200 focus:border-slate-400 focus:ring-0 text-sm font-bold rounded-lg"
                                                                value={setInput.reps}
                                                                                                                                    placeholder="0"
                                                                                                                                    onBlur={() => {
                                                                                                                                        checkExerciseCompletion(exercise.id);
                                                                                                                                        saveSetData(exercise.id, setInput.reps, setInput.weight);
                                                                                                                                    }}
                                                                                                                                    onChange={(e) => {
                                                                                                                                        setExerciseInputs(prev => ({
                                                                                                                                            ...prev, [exercise.id]: prev[exercise.id].map((input, i) => i === idx ? { ...input, reps: e.target.value } : input)
                                                                                                                                        }));
                                                                                                                                    }}
                                                                                                                                />                                                        </div>

                                                        <div className="col-span-5">
                                                            <Input 
                                                                type="number" 
                                                                inputMode="decimal"
                                                                step="0.5"
                                                                className="h-10 text-center bg-white border-slate-200 focus:border-slate-400 focus:ring-0 text-sm font-bold rounded-lg"
                                                                value={setInput.weight}
                                                                                                                                    placeholder="0"
                                                                                                                                    onBlur={() => {
                                                                                                                                        checkExerciseCompletion(exercise.id);
                                                                                                                                        saveSetData(exercise.id, setInput.reps, setInput.weight);
                                                                                                                                    }}
                                                                                                                                    onChange={(e) => {
                                                                                                                                        setExerciseInputs(prev => ({
                                                                                                                                            ...prev, [exercise.id]: prev[exercise.id].map((input, i) => i === idx ? { ...input, weight: e.target.value } : input)
                                                                                                                                        }));
                                                                                                                                    }}
                                                                                                                                />                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Actions */}
                                            <div className="grid grid-cols-2 gap-2 mt-5">
                                                <Button 
                                                    variant="outline" 
                                                    className="rounded-lg h-10 border-slate-200 text-slate-500 hover:text-slate-900 text-xs font-bold"
                                                    onClick={(e) => { e.stopPropagation(); setShowHistoryExerciseId(exercise.id); }}
                                                >
                                                    <HistoryIcon size={14} className="mr-2" /> Histórico
                                                </Button>
                                                
                                                <Button 
                                                    className={cn(
                                                        "rounded-lg h-10 font-bold text-xs transition-all",
                                                        isCompleted 
                                                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200" 
                                                            : "bg-slate-900 text-white hover:bg-slate-800"
                                                    )}
                                                    onClick={(e) => { e.stopPropagation(); toggleExerciseComplete(exercise.id); }}
                                                >
                                                    {isCompleted ? (
                                                        <><RotateCcw size={14} className="mr-2" /> Refazer</>
                                                    ) : (
                                                        <><Check size={14} className="mr-2" /> Concluir</>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </NeoCard>
                            );
                        })}
                </div>

                {/* --- RECOVERY DIALOG --- */}
                {showRecoveryDialog && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                        <NeoCard className="w-full max-w-sm text-center p-6 space-y-4">
                            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto border border-amber-100">
                                <AlertCircle size={24} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Dados encontrados</h2>
                                <p className="text-sm text-slate-500 mt-1">Deseja recuperar o progresso anterior?</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" onClick={handleDiscardRecovery} className="flex-1 rounded-lg text-slate-500 font-bold">Não</Button>
                                <Button onClick={handleRecoverData} className="flex-1 rounded-lg bg-slate-900 text-white font-bold">Sim, recuperar</Button>
                            </div>
                        </NeoCard>
                    </div>
                )}

                {/* --- FINISH MODAL --- */}
                {showFinishModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
                        <NeoCard className="w-full max-w-sm p-6 shadow-2xl border-none">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <Trophy size={32} />
                                </div>
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Treino Finalizado!</h2>
                                <p className="text-slate-500 text-sm mt-1">Bom trabalho.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="bg-slate-50 p-3 rounded-xl text-center border border-slate-100">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Tempo</span>
                                    <span className="text-lg font-bold text-slate-900 tabular-nums">{formatTime(timerSeconds)}</span>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl text-center border border-slate-100">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Conclusão</span>
                                    <span className="text-lg font-bold text-slate-900">{Math.round(progressPercentage)}%</span>
                                </div>
                            </div>

                            <div className="space-y-2 mb-6">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notas</label>
                                <textarea
                                    value={finishNotes}
                                    onChange={(e) => setFinishNotes(e.target.value)}
                                    placeholder="Como foi o treino?"
                                    className="w-full min-h-[80px] px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-sm resize-none transition-all placeholder:text-slate-400"
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button variant="ghost" className="flex-1 rounded-xl h-12 font-bold text-slate-500 hover:text-slate-900 border border-slate-200" onClick={() => setShowFinishModal(false)}>Voltar</Button>
                                <Button className="flex-1 rounded-xl h-12 font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-md" onClick={handleFinish}>Confirmar</Button>
                            </div>
                        </NeoCard>
                    </div>
                )}

                {/* Exercise History Modal */}
                {showHistoryExerciseId && (
                    <ExerciseHistoryChart
                        exerciseId={showHistoryExerciseId}
                        exerciseName={workout?.workout_exercises?.find((e: any) => e.id === showHistoryExerciseId)?.name || 'Exercício'}
                        onClose={() => setShowHistoryExerciseId(null)}
                    />
                )}
            </div>
        </DashboardLayout>
    );
}
