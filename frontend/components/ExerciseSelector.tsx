'use client';

import { useState, useMemo } from 'react';

interface Exercise {
    id: string;
    name: string;
    muscle_group: string;
}

interface ExerciseSelectorProps {
    exercises: Exercise[];
    selectedExercise: Exercise | null;
    onSelect: (exercise: Exercise | null) => void;
    loading?: boolean;
}

const muscleGroupLabels: Record<string, string> = {
    chest: 'Peito',
    back: 'Costas',
    shoulders: 'Ombros',
    biceps: 'Bíceps',
    triceps: 'Tríceps',
    legs: 'Pernas',
    core: 'Core',
    other: 'Outros',
};

export function ExerciseSelector({
    exercises,
    selectedExercise,
    onSelect,
    loading,
}: ExerciseSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');

    // Group exercises by muscle group
    const groupedExercises = useMemo(() => {
        const filtered = exercises.filter((ex) =>
            ex.name.toLowerCase().includes(search.toLowerCase())
        );

        const groups: Record<string, Exercise[]> = {};
        for (const exercise of filtered) {
            const group = exercise.muscle_group || 'other';
            if (!groups[group]) groups[group] = [];
            groups[group].push(exercise);
        }

        return groups;
    }, [exercises, search]);

    return (
        <div className="relative">
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                disabled={loading}
                className="w-full flex items-center justify-between px-4 py-3 bg-card border border-border rounded-xl text-left hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
            >
                <span className={selectedExercise ? 'text-foreground' : 'text-muted-foreground'}>
                    {loading ? 'Carregando...' : selectedExercise?.name || 'Selecione um exercício'}
                </span>
                <svg
                    className={`w-5 h-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-scale-in">
                    {/* Search Input */}
                    <div className="p-3 border-b border-border">
                        <input
                            type="text"
                            placeholder="Buscar exercício..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    {/* Exercise List */}
                    <div className="max-h-64 overflow-y-auto">
                        {Object.entries(groupedExercises).length === 0 ? (
                            <div className="p-4 text-center text-muted-foreground text-sm">
                                Nenhum exercício encontrado
                            </div>
                        ) : (
                            Object.entries(groupedExercises).map(([group, exs]) => (
                                <div key={group}>
                                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase bg-muted/50">
                                        {muscleGroupLabels[group] || group}
                                    </div>
                                    {exs.map((exercise) => (
                                        <button
                                            key={exercise.id}
                                            type="button"
                                            onClick={() => {
                                                onSelect(exercise);
                                                setIsOpen(false);
                                                setSearch('');
                                            }}
                                            className={`w-full px-4 py-3 text-left text-sm hover:bg-muted transition-colors ${selectedExercise?.id === exercise.id
                                                    ? 'bg-primary/10 text-primary font-medium'
                                                    : 'text-foreground'
                                                }`}
                                        >
                                            {exercise.name}
                                        </button>
                                    ))}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Overlay to close dropdown */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => {
                        setIsOpen(false);
                        setSearch('');
                    }}
                />
            )}
        </div>
    );
}
