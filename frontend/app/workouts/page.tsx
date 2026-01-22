'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { useWorkoutStore } from '@/store/workoutStore';
import { Button } from '@/components/ui/button';
import { 
    Dumbbell, 
    Plus, 
    Play, 
    Edit2, 
    Archive, 
    Trash2, 
    GripVertical, 
    ArchiveRestore,
    Layout,
    ListTodo
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Workout {
    id: string;
    name: string;
    description?: string;
    is_archived: boolean;
    workout_exercises: { id: string; name: string; muscle_group?: string; order_index: number }[];
    created_at: string;
}

interface SortableWorkoutItemProps {
    workout: Workout;
    onStart: () => void;
    onEdit: () => void;
    onArchive: () => void;
    onDelete: () => void;
    isDraggable: boolean;
}

function SortableWorkoutItem({ workout, onStart, onEdit, onArchive, onDelete, isDraggable }: SortableWorkoutItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: workout.id, disabled: !isDraggable });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className={cn("relative", isDragging && "z-50")}>
            <div className={cn(
                "neo-card p-5 group flex flex-col sm:flex-row sm:items-center gap-4 transition-all duration-300",
                isDragging ? "opacity-50 scale-95 border-primary shadow-2xl" : "hover:border-indigo-200"
            )}>
                {/* Drag Handle + Icon + Info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    {isDraggable && (
                        <div
                            {...attributes}
                            {...listeners}
                            className="w-8 h-12 flex items-center justify-center cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors touch-none"
                        >
                            <GripVertical size={20} />
                        </div>
                    )}
                    
                    <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border",
                        workout.is_archived 
                            ? "bg-slate-50 border-slate-100 text-slate-400" 
                            : "bg-indigo-50 border-indigo-100 text-indigo-600"
                    )}>
                        <Dumbbell size={24} />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-bold text-lg text-foreground truncate group-hover:text-primary transition-colors">
                                {workout.name}
                            </h3>
                            {workout.is_archived && (
                                <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-500 rounded-md uppercase">
                                    Arquivado
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate max-w-md">
                            {workout.description || 'Nenhuma descrição adicionada'}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span className="flex items-center gap-1"><ListTodo size={12} /> {workout.workout_exercises?.length || 0} Exercícios</span>
                        </div>
                    </div>
                </div>

                {/* Desktop Actions */}
                <div className="flex items-center gap-2 shrink-0 pt-4 sm:pt-0 border-t sm:border-0 border-slate-50">
                    {!workout.is_archived ? (
                        <>
                            <Button
                                onClick={onStart}
                                variant="premium"
                                size="sm"
                                className="h-10 px-4 rounded-xl font-bold"
                            >
                                <Play size={16} className="mr-2 fill-current" /> Iniciar
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onEdit}
                                className="rounded-xl text-slate-400 hover:text-foreground"
                            >
                                <Edit2 size={18} />
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onArchive}
                            className="rounded-xl text-primary font-bold hover:bg-indigo-50"
                        >
                            <ArchiveRestore size={18} className="mr-2" /> Restaurar
                        </Button>
                    )}
                    
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onArchive}
                        className={cn("rounded-xl text-slate-300 hover:text-slate-600", workout.is_archived && "hidden")}
                    >
                        <Archive size={18} />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onDelete}
                        className="rounded-xl text-slate-300 hover:text-destructive hover:bg-destructive/10"
                    >
                        <Trash2 size={18} />
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function WorkoutsPage() {
    const router = useRouter();
    const { workouts, loading, fetchWorkouts, deleteWorkout, archiveWorkout, reorderWorkouts } = useWorkoutStore();
    const [showArchived, setShowArchived] = useState(false);
    const [localWorkouts, setLocalWorkouts] = useState<Workout[]>([]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        fetchWorkouts(showArchived);
    }, [showArchived, fetchWorkouts]);

    useEffect(() => {
        setLocalWorkouts(workouts);
    }, [workouts]);

    const handleDelete = async (id: string) => {
        if (!confirm('Deseja deletar este treino permanentemente?')) return;
        try {
            await deleteWorkout(id);
        } catch {
            alert('Erro ao deletar treino');
        }
    };

    const handleArchive = async (id: string, archived: boolean) => {
        try {
            await archiveWorkout(id, !archived);
        } catch {
            alert('Erro ao arquivar treino');
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = localWorkouts.findIndex((w) => w.id === active.id);
            const newIndex = localWorkouts.findIndex((w) => w.id === over.id);
            const newOrder = arrayMove(localWorkouts, oldIndex, newIndex);
            setLocalWorkouts(newOrder);
            try {
                await reorderWorkouts(newOrder.map((w) => w.id));
            } catch {
                setLocalWorkouts(workouts);
                alert('Erro ao salvar nova ordem');
            }
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="max-w-4xl mx-auto py-20 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500/20 border-t-indigo-500 mx-auto"></div>
                    <p className="mt-4 text-muted-foreground font-medium uppercase text-xs tracking-widest">Carregando Treinos</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
                {/* --- HEADER --- */}
                <PageHeader 
                    title="Meus Treinos"
                    description={showArchived ? 'Sua biblioteca de treinos arquivados' : 'Arraste para organizar sua rotina de treinamento'}
                    action={
                        <Button
                            variant="premium"
                            onClick={() => router.push('/workouts/new')}
                            className="h-12 px-6 shadow-xl shadow-indigo-500/20 rounded-2xl"
                        >
                            <Plus className="w-5 h-5 mr-2" /> Novo Treino
                        </Button>
                    }
                />

                {/* --- TABS & FILTERS --- */}
                <div className="flex items-center gap-2 p-1.5 bg-slate-100/50 rounded-2xl w-fit">
                    <button
                        onClick={() => setShowArchived(false)}
                        className={cn(
                            "px-6 py-2.5 text-sm font-bold rounded-xl transition-all",
                            !showArchived ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        Ativos
                    </button>
                    <button
                        onClick={() => setShowArchived(true)}
                        className={cn(
                            "px-6 py-2.5 text-sm font-bold rounded-xl transition-all",
                            showArchived ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        Arquivados
                    </button>
                </div>

                {/* --- LIST SECTION --- */}
                {localWorkouts.length === 0 ? (
                    <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-[2.5rem]">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300">
                            <Layout size={40} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">
                            {showArchived ? 'Nenhum treino arquivado' : 'Sua lista está vazia'}
                        </h3>
                        <p className="text-muted-foreground mb-8 max-w-xs mx-auto text-sm">
                            {showArchived 
                                ? 'Treinos que você não usa mais podem ser guardados aqui.' 
                                : 'Cada treino é uma oportunidade de evolução. Crie seu primeiro agora!'}
                        </p>
                        {!showArchived && (
                            <Button variant="premium" onClick={() => router.push('/workouts/new')}>
                                Começar Agora
                            </Button>
                        )}
                    </div>
                ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={localWorkouts.map((w) => w.id)} strategy={verticalListSortingStrategy}>
                            <div className="grid gap-4">
                                {localWorkouts.map((workout) => (
                                    <SortableWorkoutItem
                                        key={workout.id}
                                        workout={workout}
                                        isDraggable={!showArchived}
                                        onStart={() => router.push(`/workouts/${workout.id}/start`)}
                                        onEdit={() => router.push(`/workouts/${workout.id}/edit`)}
                                        onArchive={() => handleArchive(workout.id, workout.is_archived)}
                                        onDelete={() => handleDelete(workout.id)}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </div>
        </DashboardLayout>
    );
}