'use client';

import { useState } from 'react';
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

export default function SignUpPage() {
    const router = useRouter();
    const signUp = useAuthStore((state) => state.signUp);

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [gender, setGender] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }

        if (password.length < 6) {
            setError('A senha deve ter no mínimo 6 caracteres');
            return;
        }

        if (!gender) {
            setError('Por favor, selecione seu gênero');
            return;
        }

        setLoading(true);

        try {
            await signUp(email, password, {
                fullName,
                birthDate,
                gender
            });
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Erro ao criar conta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
            <div className="w-full max-w-md space-y-6">
                
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shadow-md mb-4">
                        <Dumbbell className="text-white w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Criar Conta</h1>
                    <p className="text-sm text-slate-500">
                        Comece sua jornada de evolução hoje
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
                                Nome Completo
                            </label>
                            <Input
                                type="text"
                                placeholder="Seu nome"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                disabled={loading}
                                className="bg-slate-50 border-slate-100 h-11"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">
                                    Nascimento
                                </label>
                                <Input
                                    type="date"
                                    value={birthDate}
                                    onChange={(e) => setBirthDate(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="bg-slate-50 border-slate-100 h-11 text-sm w-full"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">
                                    Gênero
                                </label>
                                <select
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="w-full h-11 px-3 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all appearance-none"
                                >
                                    <option value="" disabled>Selecione</option>
                                    <option value="masculino">Masculino</option>
                                    <option value="feminino">Feminino</option>
                                    <option value="outro">Outro</option>
                                    <option value="nao_informar">Prefiro não informar</option>
                                </select>
                            </div>
                        </div>

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
                                disabled={loading}
                                className="bg-slate-50 border-slate-100 h-11"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">
                                Senha
                            </label>
                            <Input
                                type="password"
                                placeholder="Mínimo 6 caracteres"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                                className="bg-slate-50 border-slate-100 h-11"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1">
                                Confirmar Senha
                            </label>
                            <Input
                                type="password"
                                placeholder="Digite a senha novamente"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={loading}
                                className="bg-slate-50 border-slate-100 h-11"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 shadow-md mt-2"
                            disabled={loading}
                        >
                            {loading ? 'Criando...' : 'Criar Conta'}
                            {!loading && <ArrowRight size={18} className="ml-2" />}
                        </Button>
                    </form>
                </NeoCard>

                <div className="text-center text-sm text-slate-500">
                    Já tem uma conta?{' '}
                    <Link href="/login" className="text-slate-900 hover:underline font-bold">
                        Fazer login
                    </Link>
                </div>
            </div>
        </div>
    );
}
