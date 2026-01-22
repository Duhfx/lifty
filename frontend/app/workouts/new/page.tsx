'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useWorkoutStore } from '@/store/workoutStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Exercise {
    name: string;
    muscle_group: string;
}

const MUSCLE_GROUPS = [
    'Peito',
    'Costas',
    'Ombros',
    'Bíceps',
    'Tríceps',
    'Antebraço',
    'Abdômen',
    'Quadríceps',
    'Posterior',
    'Glúteos',
    'Panturrilha',
];

export default function NewWorkoutPage() {
    const router = useRouter();
    const createWorkout = useWorkoutStore((state) => state.createWorkout);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [newExerciseName, setNewExerciseName] = useState('');
    const [newExerciseMuscle, setNewExerciseMuscle] = useState('');
    const [loading, setLoading] = useState(false);
    const [showMuscleSelect, setShowMuscleSelect] = useState(false);

    const addExercise = () => {
        if (!newExerciseName.trim()) return;

        setExercises([
            ...exercises,
            {
                name: newExerciseName.trim(),
                muscle_group: newExerciseMuscle,
            },
        ]);
        setNewExerciseName('');
        setNewExerciseMuscle('');
        setShowMuscleSelect(false);
    };

    const removeExercise = (index: number) => {
        setExercises(exercises.filter((_, i) => i !== index));
    };

    const moveExercise = (index: number, direction: 'up' | 'down') => {
        const newExercises = [...exercises];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= exercises.length) return;
        [newExercises[index], newExercises[newIndex]] = [newExercises[newIndex], newExercises[index]];
        setExercises(newExercises);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            alert('Nome do treino é obrigatório');
            return;
        }

        setLoading(true);

        try {
            await createWorkout({
                name,
                description: description || undefined,
                exercises: exercises.length > 0 ? exercises : undefined,
            });
            router.push('/workouts');
        } catch {
            alert('Erro ao criar treino');
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto">
                {/* Page Header */}
                <div className="mb-8 animate-fade-in-up">
                    <button
                        onClick={() => router.push('/workouts')}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        Voltar para treinos
                    </button>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-foreground">Novo Treino</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Crie um treino personalizado com seus exercícios favoritos
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Workout Info Card */}
                    <div className="bg-card border border-border rounded-xl overflow-hidden animate-fade-in-up animation-delay-100">
                        <div className="px-6 py-4 border-b border-border bg-muted/30">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h2 className="font-semibold text-foreground">Informações do Treino</h2>
                            </div>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium text-foreground flex items-center gap-1">
                                    Nome do Treino
                                    <span className="text-destructive">*</span>
                                </label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ex: Treino A - Peito e Tríceps"
                                    required
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="description" className="text-sm font-medium text-foreground">
                                    Descrição
                                    <span className="text-muted-foreground font-normal ml-1">(opcional)</span>
                                </label>
                                <Input
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Ex: Treino focado em hipertrofia"
                                    className="h-11"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Exercises Card */}
                    <div className="bg-card border border-border rounded-xl overflow-hidden animate-fade-in-up animation-delay-200">
                        <div className="px-6 py-4 border-b border-border bg-muted/30">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                        </svg>
                                    </div>
                                    <h2 className="font-semibold text-foreground">Exercícios</h2>
                                </div>
                                {exercises.length > 0 && (
                                    <span className="text-sm text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                                        {exercises.length} exercício{exercises.length !== 1 && 's'}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="p-6">
                            {/* Exercise List */}
                            {exercises.length > 0 ? (
                                <div className="space-y-3 mb-6">
                                    {exercises.map((exercise, index) => (
                                        <div
                                            key={index}
                                            className="group flex items-center gap-3 p-3 bg-muted/50 hover:bg-muted rounded-lg transition-colors"
                                        >
                                            {/* Order Number */}
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold flex-shrink-0">
                                                {index + 1}
                                            </div>

                                            {/* Exercise Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-foreground truncate">
                                                    {exercise.name}
                                                </p>
                                                {exercise.muscle_group && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {exercise.muscle_group}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    type="button"
                                                    onClick={() => moveExercise(index, 'up')}
                                                    disabled={index === 0}
                                                    className="p-1.5 rounded-md hover:bg-background disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => moveExercise(index, 'down')}
                                                    disabled={index === exercises.length - 1}
                                                    className="p-1.5 rounded-md hover:bg-background disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removeExercise(index)}
                                                    className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                /* Empty State */
                                <div className="text-center py-8 mb-6 border-2 border-dashed border-border rounded-xl">
                                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-muted flex items-center justify-center">
                                        <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                    </div>
                                    <p className="text-muted-foreground text-sm">
                                        Nenhum exercício adicionado ainda
                                    </p>
                                    <p className="text-muted-foreground/60 text-xs mt-1">
                                        Adicione exercícios usando o formulário abaixo
                                    </p>
                                </div>
                            )}

                            {/* Add Exercise Form */}
                            <div className="pt-4 border-t border-border">
                                <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Adicionar Exercício
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="flex-1">
                                        <Input
                                            value={newExerciseName}
                                            onChange={(e) => setNewExerciseName(e.target.value)}
                                            placeholder="Nome do exercício"
                                            className="h-11"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addExercise();
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="relative sm:w-48">
                                        <button
                                            type="button"
                                            onClick={() => setShowMuscleSelect(!showMuscleSelect)}
                                            className="w-full h-11 px-3 flex items-center justify-between bg-background border border-input rounded-md text-sm transition-colors hover:bg-accent"
                                        >
                                            <span className={newExerciseMuscle ? 'text-foreground' : 'text-muted-foreground'}>
                                                {newExerciseMuscle || 'Grupo muscular'}
                                            </span>
                                            <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                        {showMuscleSelect && (
                                            <div className="absolute bottom-full left-0 right-0 mb-1 bg-card border border-border rounded-lg shadow-lg z-50 py-1 max-h-48 overflow-y-auto">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setNewExerciseMuscle('');
                                                        setShowMuscleSelect(false);
                                                    }}
                                                    className="w-full px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted transition-colors"
                                                >
                                                    Nenhum
                                                </button>
                                                {MUSCLE_GROUPS.map((muscle) => (
                                                    <button
                                                        key={muscle}
                                                        type="button"
                                                        onClick={() => {
                                                            setNewExerciseMuscle(muscle);
                                                            setShowMuscleSelect(false);
                                                        }}
                                                        className={`w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors ${
                                                            newExerciseMuscle === muscle ? 'text-primary bg-primary/5' : 'text-foreground'
                                                        }`}
                                                    >
                                                        {muscle}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={addExercise}
                                        disabled={!newExerciseName.trim()}
                                        className="h-11 px-6"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                        </svg>
                                        Adicionar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2 animate-fade-in-up animation-delay-300">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push('/workouts')}
                            disabled={loading}
                            className="h-11 px-6"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !name.trim()}
                            className="h-11 px-8 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle
                                            className="opacity-25"
                                            cx="12" cy="12" r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="none"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Salvando...
                                </span>
                            ) : (
                                <>
                                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Salvar Treino
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
