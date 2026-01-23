'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Dumbbell, ArrowRight } from 'lucide-react';

// Componente Card Sóbrio
const NeoCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={cn("bg-white border border-slate-200 shadow-sm rounded-xl p-8", className)}>
        {children}
    </div>
);

export default function LoginPage() {
    const router = useRouter();
    const { signIn, user, loading: authLoading } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [formLoading, setFormLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!authLoading && user) {
            router.replace('/dashboard');
        }
    }, [user, authLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setFormLoading(true);

        try {
            await signIn(email, password);
            router.push('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao fazer login');
            setFormLoading(false);
        }
    };

    if (authLoading || user) {
        return (
            <div className="h-screen overflow-hidden flex items-center justify-center bg-slate-50">
                <div className="animate-spin h-8 w-8 border-2 border-slate-200 border-t-slate-800 rounded-full" />
            </div>
        );
    }

    return (
        <div className="h-screen overflow-hidden flex items-center justify-center p-4 bg-slate-50">
            <div className="w-full max-w-md space-y-6">
                
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shadow-md mb-4">
                        <Dumbbell className="text-white w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Bem-vindo</h1>
                    <p className="text-sm text-slate-500">
                        Entre para continuar sua evolução
                    </p>
                </div>

                <NeoCard>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 text-xs font-medium bg-red-50 text-red-600 rounded-lg border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">
                                Email
                            </label>
                            <Input
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={formLoading}
                                className="bg-slate-50 border-slate-100 h-11"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                    Senha
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-[10px] font-bold text-slate-400 hover:text-slate-900 transition-colors"
                                >
                                    Esqueceu a senha?
                                </Link>
                            </div>
                            <Input
                                type="password"
                                placeholder="Sua senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={formLoading}
                                className="bg-slate-50 border-slate-100 h-11"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 shadow-md mt-2"
                            disabled={formLoading}
                        >
                            {formLoading ? 'Entrando...' : 'Entrar'}
                            {!formLoading && <ArrowRight size={18} className="ml-2" />}
                        </Button>
                    </form>
                </NeoCard>

                <div className="text-center text-sm text-slate-500">
                    Não tem uma conta?{' '}
                    <Link href="/signup" className="text-slate-900 hover:underline font-bold">
                        Criar conta
                    </Link>
                </div>
            </div>
        </div>
    );
}