'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useWorkoutStore } from '@/store/workoutStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    ChevronLeft, 
    Plus, 
    Dumbbell, 
    Trash2, 
    Edit2, 
    CheckCircle2,
    Layout,
    ListChecks
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Exercise {
    id: string;
    name: string;
    muscle_group?: string;
    order_index: number;
    suggested_sets?: number;
    suggested_reps?: number;
    notes?: string;
}

// Componente Card Sóbrio
const NeoCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={cn("bg-white border border-slate-200 shadow-sm rounded-xl p-5", className)}>
        {children}
    </div>
);

export default function EditWorkoutPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { getWorkout, updateWorkout, addExercise, updateExercise, deleteExercise } = useWorkoutStore();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [exercises, setExercises] = useState<Exercise[]>([]);
    
    // New Exercise Form State
    const [newExerciseName, setNewExerciseName] = useState('');
    const [newExerciseMuscle, setNewExerciseMuscle] = useState('');
    const [newExerciseSets, setNewExerciseSets] = useState('3');
    const [newExerciseReps, setNewExerciseReps] = useState('12');
    const [newExerciseNotes, setNewExerciseNotes] = useState('');
    
    // Editing state
    const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

    useEffect(() => {
        loadWorkout();
    }, []);

    const loadWorkout = async () => {
        try {
            const workout = await getWorkout(id);
            if (workout) {
                setName(workout.name);
                setDescription(workout.description || '');
                setExercises(workout.workout_exercises || []);
            }
        } catch (error) {
            router.push('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveBasicInfo = async () => {
        if (!name.trim()) return;
        setSaving(true);
        try {
            await updateWorkout(id, { name, description: description || undefined });
        } catch (error) {
            alert('Erro ao atualizar treino');
        } finally {
            setSaving(false);
        }
    };

    const handleAddExercise = async () => {
        if (!newExerciseName.trim()) return;
        try {
            await addExercise(id, {
                name: newExerciseName,
                muscle_group: newExerciseMuscle || undefined,
                suggested_sets: parseInt(newExerciseSets) || 3,
                suggested_reps: parseInt(newExerciseReps) || 12,
                notes: newExerciseNotes || undefined,
            });
            setNewExerciseName('');
            setNewExerciseMuscle('');
            setNewExerciseSets('3');
            setNewExerciseReps('12');
            setNewExerciseNotes('');
            await loadWorkout();
        } catch (error) {
            alert('Erro ao adicionar exercício');
        }
    };

    const handleSaveExercise = async () => {
        if (!editingExercise) return;
        try {
            await updateExercise(id, editingExercise.id, {
                name: editingExercise.name,
                muscle_group: editingExercise.muscle_group,
                suggested_sets: editingExercise.suggested_sets,
                suggested_reps: editingExercise.suggested_reps,
                notes: editingExercise.notes,
            });
            setEditingExercise(null);
            await loadWorkout();
        } catch (error) {
            alert('Erro ao atualizar exercício');
        }
    };

    const handleDeleteExercise = async (exerciseId: string) => {
        if (!confirm('Remover este exercício?')) return;
        try {
            await deleteExercise(id, exerciseId);
            await loadWorkout();
        } catch (error) {
            alert('Erro ao remover exercício');
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

    return (
        <DashboardLayout>
            <div className="max-w-md mx-auto space-y-6 pb-32">
                {/* --- HEADER --- */}
                <div className="flex items-center gap-3 pt-2">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => router.back()}
                        className="rounded-lg hover:bg-slate-100 -ml-2"
                    >
                        <ChevronLeft size={24} className="text-slate-600" />
                    </Button>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">
                        Editar Treino
                    </h1>
                </div>

                {/* --- BASIC INFO --- */}
                <NeoCard className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Nome do Treino</label>
                        <div className="flex gap-2">
                            <Input 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                placeholder="Ex: Peito e Tríceps"
                                className="h-11 rounded-xl bg-slate-50 border-slate-100 focus:border-slate-300 focus:ring-0"
                            />
                            <Button 
                                onClick={handleSaveBasicInfo} 
                                disabled={saving || !name.trim()} 
                                size="icon"
                                className="h-11 w-11 shrink-0 bg-slate-900 text-white rounded-xl"
                            >
                                <CheckCircle2 size={20} />
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">Descrição</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Breve descrição..."
                            className="w-full min-h-[60px] px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-slate-300 transition-all text-sm text-slate-900 placeholder:text-slate-400 resize-none"
                        />
                    </div>
                </NeoCard>

                {/* --- EXERCISES LIST --- */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <ListChecks size={18} className="text-slate-400" />
                            Exercícios ({exercises.length})
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {exercises.map((exercise, idx) => (
                            <NeoCard key={exercise.id} className="p-0 overflow-hidden">
                                {editingExercise?.id === exercise.id ? (
                                    <div className="p-4 space-y-4 animate-fade-in bg-slate-50">
                                        <div className="space-y-3">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Nome</label>
                                                <Input 
                                                    value={editingExercise.name} 
                                                    onChange={(e) => setEditingExercise({...editingExercise, name: e.target.value})} 
                                                    className="bg-white border-slate-200 h-9 text-sm"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Grupo</label>
                                                    <Input 
                                                        value={editingExercise.muscle_group || ''} 
                                                        onChange={(e) => setEditingExercise({...editingExercise, muscle_group: e.target.value})} 
                                                        placeholder="Ex: Peito"
                                                        className="bg-white border-slate-200 h-9 text-xs"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Sets</label>
                                                        <Input 
                                                            type="number"
                                                            value={editingExercise.suggested_sets || ''} 
                                                            onChange={(e) => setEditingExercise({...editingExercise, suggested_sets: parseInt(e.target.value) || 0})} 
                                                            className="bg-white border-slate-200 h-9 text-xs"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Reps</label>
                                                        <Input 
                                                            type="number"
                                                            value={editingExercise.suggested_reps || ''} 
                                                            onChange={(e) => setEditingExercise({...editingExercise, suggested_reps: parseInt(e.target.value) || 0})} 
                                                            className="bg-white border-slate-200 h-9 text-xs"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Notas</label>
                                                <textarea
                                                    value={editingExercise.notes || ''}
                                                    onChange={(e) => setEditingExercise({...editingExercise, notes: e.target.value})}
                                                    placeholder="Observações..."
                                                    className="w-full min-h-[60px] px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 text-xs text-slate-900 placeholder:text-slate-400 resize-none transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-2 pt-1">
                                            <Button size="sm" onClick={handleSaveExercise} className="flex-1 bg-slate-900 text-white rounded-lg font-bold h-9 text-xs">Salvar</Button>
                                            <Button size="sm" variant="ghost" onClick={() => setEditingExercise(null)} className="flex-1 rounded-lg h-9 text-xs border border-slate-200 bg-white hover:bg-slate-100">Cancelar</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 flex items-center gap-4 group">
                                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">{idx + 1}</div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-sm text-slate-900 truncate">{exercise.name}</h4>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{exercise.muscle_group || 'Geral'}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => setEditingExercise(exercise)} className="h-8 w-8 text-slate-300 hover:text-slate-600 rounded-lg"><Edit2 size={14} /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteExercise(exercise.id)} className="h-8 w-8 text-slate-300 hover:text-red-500 rounded-lg"><Trash2 size={14} /></Button>
                                        </div>
                                    </div>
                                )}
                            </NeoCard>
                        ))}

                        {/* Add Exercise Form Card */}
                        <NeoCard className="bg-slate-50 border-dashed border-slate-300 space-y-4">
                            <div className="flex items-center gap-2 text-slate-900 font-bold text-[10px] uppercase tracking-widest mb-2">
                                <Plus size={14} /> Novo Exercício
                            </div>
                            
                            <div className="space-y-3">
                                <Input 
                                    value={newExerciseName} 
                                    onChange={(e) => setNewExerciseName(e.target.value)} 
                                    placeholder="Nome do exercício" 
                                    className="bg-white border-slate-100 h-10 text-sm" 
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <Input 
                                        value={newExerciseMuscle} 
                                        onChange={(e) => setNewExerciseMuscle(e.target.value)} 
                                        placeholder="Grupo (ex: Peito)" 
                                        className="bg-white border-slate-100 h-9 text-xs" 
                                    />
                                    <div className="flex gap-2">
                                        <Input type="number" value={newExerciseSets} onChange={(e) => setNewExerciseSets(e.target.value)} placeholder="Sets" className="bg-white border-slate-100 h-9 text-xs" />
                                        <Input type="number" value={newExerciseReps} onChange={(e) => setNewExerciseReps(e.target.value)} placeholder="Reps" className="bg-white border-slate-100 h-9 text-xs" />
                                    </div>
                                </div>
                                <textarea
                                    value={newExerciseNotes}
                                    onChange={(e) => setNewExerciseNotes(e.target.value)}
                                    placeholder="Observações..."
                                    className="w-full min-h-[80px] px-3 py-2 bg-white border border-slate-100 rounded-xl focus:outline-none focus:border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 resize-none"
                                />
                                <Button 
                                    onClick={handleAddExercise} 
                                    className="w-full h-10 rounded-lg bg-slate-900 text-white font-bold text-xs shadow-sm" 
                                    disabled={!newExerciseName.trim()}
                                >
                                    Adicionar ao Treino
                                </Button>
                            </div>
                        </NeoCard>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}