'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useTrainingProgramStore } from '@/store/trainingProgramStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Componente Card Sóbrio
const NeoCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={cn("bg-white border border-slate-200 shadow-sm rounded-xl p-5", className)}>
        {children}
    </div>
);

export default function EditProgramPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { getProgram, updateProgram } = useTrainingProgramStore();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        loadProgram();
    }, []);

    const loadProgram = async () => {
        try {
            const program = await getProgram(id);
            if (program) {
                setName(program.name);
                setDescription(program.description || '');
                setStartDate(program.start_date ? new Date(program.start_date).toISOString().split('T')[0] : '');
                setEndDate(program.end_date ? new Date(program.end_date).toISOString().split('T')[0] : '');
            }
        } catch (error) {
            router.push('/programs');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) return;

        setSaving(true);
        try {
            await updateProgram(id, {
                name,
                description: description || undefined,
                start_date: startDate || undefined,
                end_date: endDate || undefined,
            });
            router.push(`/programs/${id}`);
        } catch (error) {
            alert('Erro ao salvar');
            setSaving(false);
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
            <div className="max-w-md mx-auto space-y-6 pb-20">
                {/* --- HEADER --- */}
                <div className="flex items-center gap-3 pt-2">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => router.push(`/programs/${id}`)}
                        className="rounded-lg hover:bg-slate-100 -ml-2"
                    >
                        <ChevronLeft size={24} className="text-slate-600" />
                    </Button>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">
                        Editar Programa
                    </h1>
                </div>

                <NeoCard className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">
                                Nome *
                            </label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Nome do programa"
                                maxLength={255}
                                className="bg-slate-50 border-slate-100 h-11"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">
                                Descrição
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Descreva o objetivo..."
                                className="w-full min-h-[120px] px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-slate-300 transition-all text-sm text-slate-900 placeholder:text-slate-400 resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">
                                    Início
                                </label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="bg-slate-50 border-slate-100 h-10 text-xs"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">
                                    Fim
                                </label>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="bg-slate-50 border-slate-100 h-10 text-xs"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button
                            variant="outline"
                            onClick={() => router.push(`/programs/${id}`)}
                            disabled={saving}
                            className="flex-1 rounded-xl border-slate-200"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={!name.trim() || saving}
                            className="flex-1 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold"
                        >
                            {saving ? 'Salvando...' : 'Salvar'} 
                            {!saving && <CheckCircle2 size={16} className="ml-2" />}
                        </Button>
                    </div>
                </NeoCard>
            </div>
        </DashboardLayout>
    );
}