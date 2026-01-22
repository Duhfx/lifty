'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useSessionStore } from '@/store/sessionStore';
import { Button } from '@/components/ui/button';
import { 
    ChevronRight, 
    Trash2, 
    History, 
    Clock, 
    Search
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Componente Card Sóbrio
const NeoCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-white border border-slate-200 shadow-sm rounded-xl p-5 ${className}`}>
        {children}
    </div>
);

export default function HistoryPage() {
    const router = useRouter();
    const { sessions, loading, fetchSessions, deleteSession } = useSessionStore();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    const formatDate = (date: string) => {
        return format(new Date(date), "d 'de' MMMM", { locale: ptBR });
    };

    const formatTime = (date: string) => {
        return format(new Date(date), "HH:mm");
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm('Deletar esta sessão permanentemente?')) return;
        try {
            await deleteSession(id);
            fetchSessions();
        } catch (error) {
            alert('Erro ao deletar');
        }
    };

    // Filter sessions
    const filteredSessions = sessions.filter(session => 
        session.workouts?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        formatDate(session.executed_at).toLowerCase().includes(searchTerm.toLowerCase())
    );

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
            <div className="max-w-md mx-auto space-y-4 pb-20">
                
                {/* 1. HEADER SIMPLIFICADO */}
                <div className="flex flex-col gap-4 pt-2">
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">
                        Histórico
                    </h1>
                    
                    {sessions.length > 0 && (
                        <div className="relative group w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 transition-colors" size={18} />
                            <input 
                                type="text" 
                                placeholder="Buscar treino..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 focus:ring-0 transition-all text-sm text-slate-900 placeholder:text-slate-400 shadow-sm"
                            />
                        </div>
                    )}
                </div>

                {/* 2. LISTA DE SESSÕES */}
                {sessions.length === 0 ? (
                    <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-xl">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300">
                            <History size={32} />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mb-1">Nenhum registro</h3>
                        <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto">
                            Seus treinos finalizados aparecerão aqui.
                        </p>
                        <Button 
                            className="bg-slate-900 text-white hover:bg-slate-800 rounded-lg h-10 px-6 font-medium text-sm shadow-sm"
                            onClick={() => router.push('/workouts')}
                        >
                            Começar Treino
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredSessions.map((session) => (
                            <NeoCard 
                                key={session.id} 
                                className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer group !border-slate-200"
                            >
                                <div 
                                    onClick={() => router.push(`/history/${session.id}`)}
                                    className="flex items-center gap-4 flex-1"
                                >
                                    {/* Icon Box */}
                                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex flex-col items-center justify-center text-slate-600 border border-slate-100 shrink-0">
                                        <span className="text-sm font-bold leading-none">{new Date(session.executed_at).getDate()}</span>
                                        <span className="text-[9px] font-bold uppercase text-slate-400">{format(new Date(session.executed_at), 'MMM', { locale: ptBR })}</span>
                                    </div>
                                    
                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-slate-900 truncate">
                                            {session.workouts?.name || 'Treino Avulso'}
                                        </h4>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-0.5">
                                            <span className="flex items-center gap-1"><Clock size={12} /> {formatTime(session.executed_at)}</span>
                                            {session.duration_minutes && (
                                                <>
                                                    <span className="text-slate-300">•</span>
                                                    <span>{session.duration_minutes} min</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Arrow */}
                                    <div className="text-right">
                                        <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                                    </div>
                                </div>
                            </NeoCard>
                        ))}
                        
                        {filteredSessions.length === 0 && searchTerm && (
                            <div className="text-center py-10 text-slate-400 text-sm">
                                Nenhum treino encontrado para "{searchTerm}"
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}