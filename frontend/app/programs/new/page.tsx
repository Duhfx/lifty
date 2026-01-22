'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTrainingProgramStore } from '@/store/trainingProgramStore';
import { useWorkoutStore } from '@/store/workoutStore';
import { 
    ChevronLeft, 
    Plus, 
    Dumbbell, 
    CheckCircle2, 
    ArrowRight,
    Trash2,
    MoveUp,
    MoveDown,
    Layout,
    Calendar,
    FileText,
    Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface WorkoutData {
    tempId: string;
    name: string;
    description?: string;
    exercises: ExerciseData[];
}

interface ExerciseData {
    tempId: string;
    name: string;
    muscle_group?: string;
    suggested_sets: number;
    suggested_reps: number;
    notes?: string;
}

// Componente Card Sóbrio
const NeoCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={cn("bg-white border border-slate-200 shadow-sm rounded-xl p-5", className)}>
        {children}
    </div>
);

export default function NewProgramPage() {
    const router = useRouter();
    const { createProgram } = useTrainingProgramStore();
    const { createWorkout } = useWorkoutStore();

    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Step 1: Program Details
    const [programName, setProgramName] = useState('');
    const [programDescription, setProgramDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Step 2: Workouts
    const [workouts, setWorkouts] = useState<WorkoutData[]>([]);
    const [newWorkoutName, setNewWorkoutName] = useState('');
    const [newWorkoutDescription, setNewWorkoutDescription] = useState('');

    // Step 3: Exercises (for selected workout)
    const [selectedWorkoutIndex, setSelectedWorkoutIndex] = useState<number | null>(null);
    const [newExerciseName, setNewExerciseName] = useState('');
    const [newExerciseMuscle, setNewExerciseMuscle] = useState('');
    const [newExerciseSets, setNewExerciseSets] = useState('3');
    const [newExerciseReps, setNewExerciseReps] = useState('12');
    const [newExerciseNotes, setNewExerciseNotes] = useState('');

    // Validation functions
    const canProceedFromStep1 = () => {
        if (!programName.trim()) return false;
        if (startDate && endDate) {
            return new Date(endDate) > new Date(startDate);
        }
        return true;
    };

    const canProceedFromStep2 = () => {
        return workouts.length > 0;
    };

    const canProceedFromStep3 = () => {
        return workouts.every(workout => workout.exercises.length > 0);
    };

    // Step 2: Workout Management
    const handleAddWorkout = () => {
        if (!newWorkoutName.trim()) return;

        const newWorkout: WorkoutData = {
            tempId: `temp-${Date.now()}`,
            name: newWorkoutName,
            description: newWorkoutDescription || undefined,
            exercises: [],
        };

        setWorkouts([...workouts, newWorkout]);
        setNewWorkoutName('');
        setNewWorkoutDescription('');
    };

    const handleRemoveWorkout = (index: number) => {
        setWorkouts(workouts.filter((_, i) => i !== index));
        if (selectedWorkoutIndex === index) {
            setSelectedWorkoutIndex(null);
        } else if (selectedWorkoutIndex !== null && selectedWorkoutIndex > index) {
            setSelectedWorkoutIndex(selectedWorkoutIndex - 1);
        }
    };

    const handleMoveWorkoutUp = (index: number) => {
        if (index === 0) return;
        const newWorkouts = [...workouts];
        [newWorkouts[index - 1], newWorkouts[index]] = [newWorkouts[index], newWorkouts[index - 1]];
        setWorkouts(newWorkouts);
        if (selectedWorkoutIndex === index) setSelectedWorkoutIndex(index - 1);
        else if (selectedWorkoutIndex === index - 1) setSelectedWorkoutIndex(index);
    };

    const handleMoveWorkoutDown = (index: number) => {
        if (index === workouts.length - 1) return;
        const newWorkouts = [...workouts];
        [newWorkouts[index], newWorkouts[index + 1]] = [newWorkouts[index + 1], newWorkouts[index]];
        setWorkouts(newWorkouts);
        if (selectedWorkoutIndex === index) setSelectedWorkoutIndex(index + 1);
        else if (selectedWorkoutIndex === index + 1) setSelectedWorkoutIndex(index);
    };

    // Step 3: Exercise Management
    const handleAddExercise = () => {
        if (selectedWorkoutIndex === null || !newExerciseName.trim()) return;

        const newExercise: ExerciseData = {
            tempId: `temp-${Date.now()}`,
            name: newExerciseName,
            muscle_group: newExerciseMuscle || undefined,
            suggested_sets: parseInt(newExerciseSets) || 3,
            suggested_reps: parseInt(newExerciseReps) || 12,
            notes: newExerciseNotes || undefined,
        };

        const updatedWorkouts = [...workouts];
        updatedWorkouts[selectedWorkoutIndex].exercises.push(newExercise);
        setWorkouts(updatedWorkouts);

        setNewExerciseName('');
        setNewExerciseMuscle('');
        setNewExerciseSets('3');
        setNewExerciseReps('12');
        setNewExerciseNotes('');
    };

    const handleRemoveExercise = (workoutIndex: number, exerciseIndex: number) => {
        const updatedWorkouts = [...workouts];
        updatedWorkouts[workoutIndex].exercises = updatedWorkouts[workoutIndex].exercises.filter(
            (_, i) => i !== exerciseIndex
        );
        setWorkouts(updatedWorkouts);
    };

    // Navigation
    const handleNext = () => {
        if (currentStep === 1 && !canProceedFromStep1()) return;
        if (currentStep === 2 && !canProceedFromStep2()) return;
        if (currentStep === 3 && !canProceedFromStep3()) {
            alert('Adicione pelo menos um exercício para cada treino');
            return;
        }
        setCurrentStep(currentStep + 1);
    };

    const handleBack = () => {
        setCurrentStep(currentStep - 1);
    };

    // Final Submission
    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const program = await createProgram({
                name: programName,
                description: programDescription || undefined,
                start_date: startDate || undefined,
                end_date: endDate || undefined,
                is_active: true,
            });

            for (let i = 0; i < workouts.length; i++) {
                const workoutData = workouts[i];
                await createWorkout({
                    name: workoutData.name,
                    description: workoutData.description,
                    exercises: workoutData.exercises.map(ex => ({
                        name: ex.name,
                        muscle_group: ex.muscle_group,
                        suggested_sets: ex.suggested_sets,
                        suggested_reps: ex.suggested_reps,
                        notes: ex.notes,
                    })),
                });
            }

            router.push(`/programs/${program.id}`);
        } catch (error) {
            alert('Erro ao criar programa. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const steps = [
        { id: 1, label: 'Info', icon: FileText },
        { id: 2, label: 'Treinos', icon: Layout },
        { id: 3, label: 'Exercícios', icon: Dumbbell },
        { id: 4, label: 'Revisão', icon: CheckCircle2 },
    ];

    const progressPercentage = (currentStep / steps.length) * 100;

    return (
        <DashboardLayout>
            <div className="max-w-md mx-auto space-y-6 pb-32">
                {/* --- HEADER SIMPLIFICADO --- */}
                <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-3">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => router.push('/programs')}
                            className="rounded-lg hover:bg-slate-100 -ml-2"
                        >
                            <ChevronLeft size={24} className="text-slate-600" />
                        </Button>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">
                            Novo Programa
                        </h1>
                    </div>

                    {/* Progress Indicator */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            {steps.map((step) => (
                                <div key={step.id} className="flex flex-col items-center gap-1.5">
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 border",
                                        currentStep === step.id 
                                            ? "bg-slate-900 text-white border-slate-900 shadow-sm" 
                                            : currentStep > step.id 
                                                ? "bg-slate-100 text-slate-900 border-slate-200" 
                                                : "bg-white text-slate-300 border-slate-100"
                                    )}>
                                        <step.icon size={14} />
                                    </div>
                                    <span className={cn(
                                        "text-[9px] font-bold uppercase tracking-wider",
                                        currentStep === step.id ? "text-slate-900" : "text-slate-400"
                                    )}>
                                        {step.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-slate-900 transition-all duration-500" 
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* --- STEP CONTENT --- */}
                
                {/* STEP 1: PROGRAM DETAILS */}
                {currentStep === 1 && (
                    <NeoCard className="space-y-6">
                        <div className="space-y-1">
                            <h2 className="text-base font-bold text-slate-900">Informações Básicas</h2>
                            <p className="text-xs text-slate-500">Defina o nome e objetivo do seu projeto.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Nome do Programa</label>
                                <Input
                                    value={programName}
                                    onChange={(e) => setProgramName(e.target.value)}
                                    placeholder="Ex: Evolução 2026"
                                    className="h-11 rounded-xl bg-slate-50 border-slate-100 focus:border-slate-300 focus:ring-0"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Descrição</label>
                                <textarea
                                    value={programDescription}
                                    onChange={(e) => setProgramDescription(e.target.value)}
                                    placeholder="Foco em hipertrofia, 4x semana..."
                                    className="w-full min-h-[100px] px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-slate-300 transition-all text-sm text-slate-900 placeholder:text-slate-400"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Início</label>
                                    <Input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="bg-slate-50 border-slate-100 h-10 text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Término</label>
                                    <Input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        min={startDate}
                                        className="bg-slate-50 border-slate-100 h-10 text-xs"
                                    />
                                </div>
                            </div>
                        </div>
                    </NeoCard>
                )}

                {/* STEP 2: ADD WORKOUTS */}
                {currentStep === 2 && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="space-y-1 px-1">
                            <h2 className="text-base font-bold text-slate-900">Estrutura de Treinos</h2>
                            <p className="text-xs text-slate-500">Adicione os treinos da semana (A, B, C...).</p>
                        </div>

                        {/* List of Added Workouts */}
                        {workouts.length > 0 && (
                            <div className="space-y-2">
                                {workouts.map((workout, index) => (
                                    <NeoCard key={workout.tempId} className="p-3 flex items-center gap-3">
                                        <div className="flex flex-col gap-0.5">
                                            <button onClick={() => handleMoveWorkoutUp(index)} disabled={index === 0} className="p-0.5 text-slate-300 hover:text-slate-900 disabled:opacity-10"><MoveUp size={12} /></button>
                                            <button onClick={() => handleMoveWorkoutDown(index)} disabled={index === workouts.length - 1} className="p-0.5 text-slate-300 hover:text-slate-900 disabled:opacity-10"><MoveDown size={12} /></button>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm text-slate-900 truncate">{workout.name}</p>
                                            <p className="text-[10px] text-slate-400 uppercase font-bold">{workout.exercises.length} exercícios</p>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveWorkout(index)} className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50"><Trash2 size={16} /></Button>
                                    </NeoCard>
                                ))}
                            </div>
                        )}

                        {/* Add Workout Form */}
                        <NeoCard className="bg-slate-50 border-dashed border-slate-300 space-y-3">
                            <Input
                                value={newWorkoutName}
                                onChange={(e) => setNewWorkoutName(e.target.value)}
                                placeholder="Nome (ex: Treino A)"
                                className="bg-white border-slate-100"
                            />
                            <Button onClick={handleAddWorkout} className="w-full rounded-lg bg-white text-slate-900 border-slate-200 hover:bg-slate-100 text-xs font-bold" variant="outline">
                                <Plus size={16} className="mr-2" /> Adicionar Treino
                            </Button>
                        </NeoCard>
                    </div>
                )}

                {/* STEP 3: ADD EXERCISES */}
                {currentStep === 3 && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="space-y-1 px-1">
                            <h2 className="text-base font-bold text-slate-900">Exercícios</h2>
                            <p className="text-xs text-slate-500">Adicione exercícios para cada treino.</p>
                        </div>

                        {/* Horizontal Workout Selector */}
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                            {workouts.map((workout, index) => (
                                <button
                                    key={workout.tempId}
                                    onClick={() => setSelectedWorkoutIndex(index)}
                                    className={cn(
                                        "px-4 py-3 rounded-xl border transition-all flex flex-col items-start gap-0.5 min-w-[120px] text-left",
                                        selectedWorkoutIndex === index 
                                            ? "border-slate-900 bg-slate-900 text-white shadow-sm" 
                                            : "border-slate-200 bg-white text-slate-400"
                                    )}
                                >
                                    <span className="text-[8px] font-bold uppercase tracking-wider opacity-60">Treino {index + 1}</span>
                                    <span className="font-bold text-xs truncate w-full">{workout.name}</span>
                                </button>
                            ))}
                        </div>

                        {selectedWorkoutIndex !== null ? (
                            <div className="space-y-4 pt-1">
                                {/* Exercise List */}
                                <div className="space-y-2">
                                    {workouts[selectedWorkoutIndex].exercises.map((exercise, exIndex) => (
                                        <NeoCard key={exercise.tempId} className="p-3 flex items-center gap-3">
                                            <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0">{exIndex + 1}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-xs text-slate-900">{exercise.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{exercise.suggested_sets} × {exercise.suggested_reps} reps</p>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => handleRemoveExercise(selectedWorkoutIndex, exIndex)} className="h-8 w-8 text-slate-300 hover:text-red-500"><Trash2 size={16} /></Button>
                                        </NeoCard>
                                    ))}
                                </div>

                                {/* Add Exercise Compact Form */}
                                <NeoCard className="bg-slate-50 border-slate-200 space-y-4">
                                    <Input
                                        value={newExerciseName}
                                        onChange={(e) => setNewExerciseName(e.target.value)}
                                        placeholder="Nome do exercício"
                                        className="bg-white border-slate-100 h-10 text-sm"
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Séries</label>
                                            <Input type="number" value={newExerciseSets} onChange={(e) => setNewExerciseSets(e.target.value)} className="bg-white border-slate-100 h-9" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Reps</label>
                                            <Input type="number" value={newExerciseReps} onChange={(e) => setNewExerciseReps(e.target.value)} className="bg-white border-slate-100 h-9" />
                                        </div>
                                    </div>
                                    <Button onClick={handleAddExercise} className="w-full rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold h-10">
                                        Adicionar Exercício
                                    </Button>
                                </NeoCard>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-400 text-xs italic">Selecione um treino acima.</div>
                        )}
                    </div>
                )}

                {/* STEP 4: REVIEW */}
                {currentStep === 4 && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="space-y-1 px-1">
                            <h2 className="text-base font-bold text-slate-900">Revisão Final</h2>
                            <p className="text-xs text-slate-500">Confira se está tudo correto.</p>
                        </div>

                        <div className="space-y-4">
                            <NeoCard className="bg-slate-900 text-white border-none">
                                <h3 className="font-bold text-lg leading-tight mb-1">{programName}</h3>
                                <p className="text-slate-400 text-xs line-clamp-2 mb-4">{programDescription || 'Sem descrição'}</p>
                                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    <div className="flex items-center gap-1"><Calendar size={12} /> {startDate ? format(new Date(startDate), 'dd/MM/yy') : 'Imediato'}</div>
                                    <div className="flex items-center gap-1"><Layout size={12} /> {workouts.length} Treinos</div>
                                </div>
                            </NeoCard>

                            <div className="space-y-2">
                                {workouts.map((w, idx) => (
                                    <NeoCard key={w.tempId} className="p-4 bg-white border-slate-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Treino {idx + 1}</span>
                                            <span className="text-[9px] font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded uppercase">{w.exercises.length} itens</span>
                                        </div>
                                        <p className="font-bold text-sm text-slate-900 mb-2">{w.name}</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {w.exercises.map(ex => (
                                                <span key={ex.tempId} className="px-2 py-0.5 bg-slate-50 rounded text-[9px] font-medium text-slate-500 border border-slate-100">{ex.name}</span>
                                            ))}
                                        </div>
                                    </NeoCard>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- FOOTER NAVIGATION --- */}
                <div className="fixed bottom-[60px] lg:bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-[40] lg:relative lg:bg-transparent lg:border-0 lg:p-0 lg:mt-8">
                    <div className="max-w-md mx-auto flex gap-3">
                        {currentStep > 1 && (
                            <Button 
                                variant="outline" 
                                onClick={handleBack} 
                                disabled={isSubmitting}
                                className="h-12 px-6 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm"
                            >
                                <ChevronLeft size={20} />
                            </Button>
                        )}

                        <Button 
                            onClick={currentStep < 4 ? handleNext : handleSubmit} 
                            disabled={isSubmitting || (currentStep === 4 && !canProceedFromStep3())}
                            className="flex-1 h-12 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-md"
                        >
                            {isSubmitting ? 'Criando...' : currentStep < 4 ? 'Continuar' : 'Salvar Programa'}
                            {currentStep < 4 && !isSubmitting && <ArrowRight size={18} className="ml-2" />}
                            {currentStep === 4 && !isSubmitting && <CheckCircle2 size={18} className="ml-2" />}
                        </Button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}