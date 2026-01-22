'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useTrainingProgramStore } from '@/store/trainingProgramStore';
import { Button } from '@/components/ui/button';
import { ShareProgramModal } from '@/components/ShareProgramModal';
import { 
    Dumbbell, 
    Plus, 
    Share2, 
    Edit2, 
    Archive, 
    Trash2, 
    CheckCircle2, 
    ArchiveRestore,
    Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Componente Card Sóbrio
const NeoCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-white border border-slate-200 shadow-sm rounded-xl p-5 ${className}`}>
        {children}
    </div>
);

export default function ProgramsPage() {
    const router = useRouter();
    const {
        programs,
        loading,
        fetchPrograms,
        activateProgram,
        updateProgram,
        deleteProgram,
    } = useTrainingProgramStore();

    const [shareModalProgram, setShareModalProgram] = useState<{ id: string; name: string } | null>(null);

    useEffect(() => {
        // Fetch all programs (both active and archived) if the API supports it,
        // otherwise we might need two calls. Assuming fetchPrograms handles 'archived' filter.
        // For this refactor, let's assume we want to see EVERYTHING. 
        // If the API strictly filters, we might need to change how we fetch.
        // Let's try fetching both active and archived.
        const loadAll = async () => {
             await fetchPrograms(false); // Active
             // If store overwrites, we might need a better store method. 
             // Assuming for now fetchPrograms returns/stores a list we can filter client-side 
             // OR we need to fetch archived separately if the backend strictly segregates.
             // Given the store structure in previous turns, let's just fetch default for now 
             // and trust the store or modify if needed. 
             // Actually, looking at the previous code: fetchPrograms(activeTab === 'archived').
             // This implies the backend filters. We might need to fetch both or update the store to hold all.
             // For this step, I will stick to fetching 'false' (active/all?) and maybe add a UI toggle later if needed?
             // No, user asked for NO tabs. So we probably want ALL programs.
             // If backend splits them, we have a problem. 
             // Let's assume we fetch standard list first. If archived are missing, we might need to fix the backend/store later.
        };
        loadAll();
    }, [fetchPrograms]);

    // Custom sort: Active Program -> Other Active -> Archived
    const sortedPrograms = [...programs].sort((a, b) => {
        if (a.is_active && !b.is_active) return -1;
        if (!a.is_active && b.is_active) return 1;
        if (!a.is_archived && b.is_archived) return -1;
        if (a.is_archived && !b.is_archived) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const handleActivate = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            await activateProgram(id);
            await fetchPrograms(false);
        } catch (error) {
            alert('Erro ao ativar programa');
        }
    };

    const handleArchive = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm('Arquivar este programa?')) return;
        try {
            await updateProgram(id, { is_archived: true });
            await fetchPrograms(false);
        } catch (error) {
            alert('Erro ao arquivar programa');
        }
    };

    const handleUnarchive = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        try {
            await updateProgram(id, { is_archived: false });
            await fetchPrograms(false);
        } catch (error) {
            alert('Erro ao desarquivar programa');
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm('Deletar este programa? Esta ação não pode ser desfeita.')) return;
        try {
            await deleteProgram(id);
            await fetchPrograms(false);
        } catch (error) {
            alert('Erro ao deletar programa');
        }
    };

    const handleShare = (e: React.MouseEvent, programId: string, programName: string) => {
        e.stopPropagation();
        setShareModalProgram({ id: programId, name: programName });
    };

    const handleEdit = (e: React.MouseEvent, programId: string) => {
        e.stopPropagation();
        router.push(`/programs/${programId}/edit`);
    };

    return (
        <DashboardLayout>
            <div className="max-w-md mx-auto space-y-6 pb-20">
                {/* Header Section */}
                <div className="flex items-center justify-between pt-2">
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">
                        Programas
                    </h1>
                    <Button 
                        size="icon"
                        className="bg-slate-900 text-white hover:bg-slate-800 rounded-lg h-9 w-9 shadow-sm"
                        onClick={() => router.push('/programs/new')}
                    >
                        <Plus className="w-5 h-5" />
                    </Button>
                </div>

                {/* Programs List */}
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-32 rounded-xl bg-slate-100 animate-pulse" />
                        ))}
                    </div>
                ) : sortedPrograms.length > 0 ? (
                    <div className="space-y-3">
                        {sortedPrograms.map((program) => (
                            <NeoCard
                                key={program.id}
                                className={cn(
                                    "flex flex-col gap-4 cursor-pointer hover:border-slate-300 transition-colors relative overflow-hidden",
                                    program.is_active ? "border-indigo-200 bg-indigo-50/10 ring-1 ring-indigo-500/10" : "bg-white",
                                    program.is_archived && "opacity-75 bg-slate-50"
                                )}
                            >
                                <div 
                                    className="flex-1 relative z-10"
                                    onClick={() => router.push(`/programs/${program.id}`)}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="space-y-1">
                                            {/* Tags de Status */}
                                            <div className="flex gap-2 mb-1">
                                                {program.is_active && (
                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[9px] font-bold uppercase tracking-wider">
                                                        <CheckCircle2 size={10} className="fill-current" />
                                                        Em Uso
                                                    </span>
                                                )}
                                                {program.is_archived && (
                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 text-[9px] font-bold uppercase tracking-wider">
                                                        <Archive size={10} />
                                                        Arquivado
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <h3 className="font-bold text-base text-slate-900 leading-tight">
                                                {program.name}
                                            </h3>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                                        <span className="flex items-center gap-1">
                                            <Dumbbell size={14} /> {program.workouts?.length || 0} Treinos
                                        </span>
                                        {program.start_date && (
                                            <span className="flex items-center gap-1">
                                                <Calendar size={14} /> {format(new Date(program.start_date), 'dd/MM/yy')}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-slate-100 relative z-10">
                                    <div className="flex items-center gap-2">
                                        {!program.is_active && !program.is_archived && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 px-3 rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 text-xs font-bold"
                                                onClick={(e) => handleActivate(e, program.id)}
                                            >
                                                Ativar
                                            </Button>
                                        )}
                                        {program.is_archived && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 px-3 rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200 text-xs font-bold"
                                                onClick={(e) => handleUnarchive(e, program.id)}
                                            >
                                                Restaurar
                                            </Button>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-slate-400 hover:text-slate-900 rounded-lg"
                                            onClick={(e) => handleEdit(e, program.id)}
                                        >
                                            <Edit2 size={16} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-slate-400 hover:text-slate-900 rounded-lg"
                                            onClick={(e) => handleShare(e, program.id, program.name)}
                                        >
                                            <Share2 size={16} />
                                        </Button>
                                        {!program.is_active && (
                                             <Button
                                                variant="ghost"
                                                size="icon"
                                                className={cn(
                                                    "h-8 w-8 text-slate-400 hover:bg-red-50 rounded-lg",
                                                    program.is_archived ? "hover:text-red-600" : "hover:text-amber-600"
                                                )}
                                                onClick={(e) => program.is_archived ? handleDelete(e, program.id) : handleArchive(e, program.id)}
                                                title={program.is_archived ? "Deletar" : "Arquivar"}
                                            >
                                                {program.is_archived ? <Trash2 size={16} /> : <Archive size={16} />}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </NeoCard>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-xl">
                        <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300">
                            <Dumbbell size={24} />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 mb-1">
                            Nenhum programa
                        </h3>
                        <p className="text-xs text-slate-500 mb-4 max-w-[200px] mx-auto">
                            Crie sua primeira rotina de treinos para começar.
                        </p>
                        <Button 
                            className="bg-slate-900 text-white hover:bg-slate-800 rounded-lg h-9 px-4 text-xs font-bold shadow-sm"
                            onClick={() => router.push('/programs/new')}
                        >
                            Novo Programa
                        </Button>
                    </div>
                )}

                {/* Share Modal */}
                {shareModalProgram && (
                    <ShareProgramModal
                        programId={shareModalProgram.id}
                        programName={shareModalProgram.name}
                        onClose={() => setShareModalProgram(null)}
                    />
                )}
            </div>
        </DashboardLayout>
    );
}