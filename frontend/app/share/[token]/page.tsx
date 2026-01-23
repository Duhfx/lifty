'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useTrainingProgramStore } from '@/store/trainingProgramStore';
import { supabase } from '@/lib/supabase';
import { 
    Dumbbell, 
    Calendar, 
    CheckCircle2, 
    Download, 
    Layout, 
    ChevronRight,
    LogIn,
    UserPlus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { InstallPrompt } from '@/components/InstallPrompt';
import { IOSInstallBanner } from '@/components/IOSInstallBanner';

// Componente Card Sóbrio
const NeoCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={cn("bg-white border border-slate-200 shadow-sm rounded-xl p-5", className)}>
        {children}
    </div>
);

export default function SharedProgramPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params);
    const router = useRouter();
    const { getSharedProgram, copySharedProgram } = useTrainingProgramStore();

    const [program, setProgram] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [copying, setCopying] = useState(false);

    useEffect(() => {
        checkAuth();
        loadProgram();
    }, [token]);

    const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
    };

    const loadProgram = async () => {
        try {
            const data = await getSharedProgram(token);
            setProgram(data);
        } catch (err: any) {
            setError(err.message || 'Programa não encontrado');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        if (!isAuthenticated) {
            localStorage.setItem('returnTo', `/share/${token}`);
            router.push('/login');
            return;
        }

        setCopying(true);
        try {
            const newProgramId = await copySharedProgram(token);
            router.push(`/programs/${newProgramId}`);
        } catch (error) {
            alert('Erro ao copiar programa');
        } finally {
            setCopying(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-slate-800"></div>
            </div>
        );
    }

    if (error || !program) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="text-center max-w-sm">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-slate-900 flex items-center justify-center shadow-md">
                        <Dumbbell size={32} className="text-white" />
                    </div>
                    <h1 className="text-lg font-bold text-slate-900 mb-2">Programa não encontrado</h1>
                    <p className="text-sm text-slate-500 mb-6">
                        O link pode ter expirado ou sido removido pelo criador.
                    </p>
                    <Button
                        onClick={() => router.push('/')}
                        variant="outline"
                        className="rounded-xl border-slate-200"
                    >
                        Voltar para Home
                    </Button>
                </div>
            </div>
        );
    }

    const totalExercises = program.workouts.reduce((acc: number, w: any) => acc + (w.exercises?.length || 0), 0);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
            {/* --- HEADER --- */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-md mx-auto px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shadow-sm">
                            <Dumbbell className="text-white w-4 h-4" />
                        </div>
                        <span className="text-lg font-bold tracking-tight">Lifty</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {isAuthenticated ? (
                            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')} className="text-slate-600 font-medium">
                                Dashboard
                            </Button>
                        ) : (
                            <Button variant="ghost" size="sm" onClick={() => router.push('/login')} className="text-slate-600 font-medium">
                                <LogIn size={16} className="mr-1.5" /> Entrar
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-md mx-auto px-6 py-8 space-y-8">
                
                {/* --- HERO SUMMARY --- */}
                <div className="text-center space-y-6">
                    <div className="space-y-4">
                        {/* Creator Avatar and Name */}
                        <div className="flex flex-col items-center gap-3">
                            {program.creatorAvatar ? (
                                <img
                                    src={program.creatorAvatar}
                                    alt={program.creatorName || 'Criador'}
                                    className="w-16 h-16 rounded-full border-2 border-slate-200 shadow-sm object-cover"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-teal-500 flex items-center justify-center text-white font-bold text-xl shadow-sm border-2 border-slate-200">
                                    {(program.creatorName || program.creatorEmail?.split('@')[0] || 'U')[0].toUpperCase()}
                                </div>
                            )}
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500 shadow-sm">
                                Compartilhado por {program.creatorName || program.creatorEmail?.split('@')[0]}
                            </span>
                        </div>

                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
                            {program.programName}
                        </h1>
                        {program.programDescription && (
                            <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
                                {program.programDescription}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <NeoCard className="flex flex-col items-center justify-center py-4 bg-slate-900 text-white border-none">
                            <span className="text-2xl font-bold">{program.workoutCount}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Treinos</span>
                        </NeoCard>
                        <NeoCard className="flex flex-col items-center justify-center py-4">
                            <span className="text-2xl font-bold text-slate-900">{totalExercises}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Exercícios</span>
                        </NeoCard>
                    </div>

                    <Button
                        onClick={handleCopy}
                        disabled={copying}
                        className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-200"
                    >
                        {copying ? 'Importando...' : 'Importar Programa'}
                        {!copying && <Download size={18} className="ml-2" />}
                    </Button>
                </div>

                {/* --- WORKOUTS LIST --- */}
                <div className="space-y-4">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 px-1">
                        <Layout size={18} className="text-slate-400" />
                        Conteúdo
                    </h2>
                    
                    <div className="space-y-3">
                        {program.workouts.map((workout: any, index: number) => (
                            <NeoCard key={workout.id} className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                {index + 1}
                                            </span>
                                            <h3 className="font-bold text-sm text-slate-900">{workout.name}</h3>
                                        </div>
                                        {workout.description && (
                                            <p className="text-xs text-slate-500 pl-7 line-clamp-1">{workout.description}</p>
                                        )}
                                    </div>
                                    <span className="text-[10px] font-bold bg-slate-50 text-slate-500 px-2 py-1 rounded border border-slate-100">
                                        {workout.exercises?.length || 0} exercícios
                                    </span>
                                </div>

                                {workout.exercises && workout.exercises.length > 0 && (
                                    <div className="pl-7 flex flex-wrap gap-1.5">
                                        {workout.exercises.slice(0, 3).map((ex: any, i: number) => (
                                            <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-50 rounded border border-slate-100 text-slate-500">
                                                {ex.name}
                                            </span>
                                        ))}
                                        {workout.exercises.length > 3 && (
                                            <span className="text-[10px] px-2 py-0.5 bg-slate-50 rounded border border-slate-100 text-slate-400">
                                                +{workout.exercises.length - 3}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </NeoCard>
                        ))}
                    </div>
                </div>

                {!isAuthenticated && (
                    <NeoCard className="text-center mt-8">
                        <h3 className="text-sm font-bold text-slate-900 mb-2">Gostou deste programa?</h3>
                        <p className="text-xs text-slate-500 mb-5">
                            Crie uma conta para importar, acompanhar seus treinos e criar seus próprios programas.
                        </p>

                        <div className="space-y-2">
                            <Button
                                className="w-full h-11 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 shadow-md"
                                onClick={() => {
                                    localStorage.setItem('returnTo', `/share/${token}`);
                                    router.push('/signup');
                                }}
                            >
                                <UserPlus size={16} className="mr-2" /> Criar Conta Grátis
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full h-9 text-slate-600 font-medium text-sm hover:bg-slate-50"
                                onClick={() => {
                                    localStorage.setItem('returnTo', `/share/${token}`);
                                    router.push('/login');
                                }}
                            >
                                Já tenho conta
                            </Button>
                        </div>
                    </NeoCard>
                )}
                {/* Install Prompts */}
                <InstallPrompt context="share" />
                <IOSInstallBanner />
            </main>
        </div>
    );
}

