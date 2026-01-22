'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function LoginScreen() {
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
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            {/* Branding Panel */}
            <div className="relative w-full lg:w-[45%] min-h-[320px] lg:min-h-screen bg-gradient-to-br from-indigo-600 to-indigo-900 overflow-hidden flex flex-col justify-start lg:justify-center items-center p-8 lg:p-12 pt-16 lg:pt-12">
                {/* Geometric Pattern Overlay */}
                <div className="geometric-pattern" />

                {/* Noise Texture */}
                <div className="noise-texture absolute inset-0" />

                {/* Decorative Elements */}
                <div className="decorative-circle w-[500px] h-[500px] -top-[200px] -right-[200px] opacity-20" />
                <div className="decorative-circle w-[300px] h-[300px] -bottom-[100px] -left-[100px] opacity-15" />

                {/* Content */}
                <div className="relative z-10 text-center lg:text-left max-w-md animate-slide-in-left">
                    {/* Logo */}
                    <div className="mb-6 lg:mb-8">
                        <h1 className="text-5xl lg:text-7xl font-extrabold text-white tracking-tight">
                            LIFTY
                        </h1>
                        <div className="mt-2 h-1.5 w-16 lg:w-24 bg-white/40 rounded-full mx-auto lg:mx-0" />
                    </div>

                    {/* Tagline */}
                    <p className="text-xl lg:text-2xl text-white/90 font-medium leading-relaxed">
                        Evolua a cada treino.
                    </p>
                    <p className="mt-3 text-base lg:text-lg text-white/70 max-w-sm mx-auto lg:mx-0">
                        O design definitivo para sua jornada de força e evolução constante.
                    </p>

                    {/* Feature highlights - hidden on mobile */}
                    <div className="hidden lg:flex flex-col gap-4 mt-12 text-white/70 text-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-white/50" />
                            <span>Registre treinos detalhados</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-white/50" />
                            <span>Acompanhe sua evolução</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-white/50" />
                            <span>Visualize estatísticas em tempo real</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Panel */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background relative z-20 -mt-10 lg:mt-0 rounded-t-[2.5rem] lg:rounded-none">
                <div className="w-full max-w-[400px]">
                    <div className="mb-8 lg:mb-10 animate-fade-in-up">
                        <h2 className="text-3xl font-bold text-foreground tracking-tight">
                            Bem-vindo
                        </h2>
                        <p className="mt-2 text-muted-foreground">
                            Entre para continuar sua evolução
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 text-sm bg-destructive/10 text-destructive rounded-2xl border border-destructive/20 animate-fade-in">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2 animate-fade-in-up animation-delay-100">
                            <label htmlFor="email" className="text-sm font-medium text-foreground ml-1">
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={formLoading}
                            />
                        </div>

                        <div className="space-y-2 animate-fade-in-up animation-delay-200">
                            <div className="flex items-center justify-between ml-1">
                                <label htmlFor="password" className="text-sm font-medium text-foreground">
                                    Senha
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                                >
                                    Esqueceu a senha?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Sua senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={formLoading}
                            />
                        </div>

                        <div className="pt-2 animate-fade-in-up animation-delay-300">
                            <Button
                                type="submit"
                                variant="premium"
                                className="w-full"
                                disabled={formLoading}
                            >
                                {formLoading ? 'Entrando...' : 'Entrar'}
                            </Button>
                        </div>

                        <div className="text-center pt-2 animate-fade-in-up animation-delay-400">
                            <p className="text-sm text-muted-foreground">
                                Não tem uma conta?{' '}
                                <Link
                                    href="/signup"
                                    className="text-primary hover:text-primary/80 font-bold transition-colors"
                                >
                                    Criar conta
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
