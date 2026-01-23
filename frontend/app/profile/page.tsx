'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Calendar, UserCircle, LogOut, Save, Camera, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Componente Card Sóbrio
const NeoCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={cn("bg-white border border-slate-200 shadow-sm rounded-xl p-5", className)}>
        {children}
    </div>
);

export default function ProfilePage() {
    const router = useRouter();
    const { user, signOut, refreshUser } = useAuthStore();

    const [loading, setLoading] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [fullName, setFullName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [gender, setGender] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            setFullName(user.user_metadata?.full_name || '');
            setBirthDate(user.user_metadata?.birth_date || '');
            setGender(user.user_metadata?.gender || '');
            setAvatarUrl(user.user_metadata?.avatar_url || '');
        }
    }, [user]);

    const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        // Validar tipo e tamanho
        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione uma imagem válida (JPEG, PNG, WebP ou GIF)');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('A imagem deve ter no máximo 5MB');
            return;
        }

        setUploadingPhoto(true);
        try {
            // Criar nome único para o arquivo
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            // Upload para Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) {
                if (uploadError.message.includes('not found')) {
                    throw new Error('Bucket "avatars" não encontrado. Verifique a configuração do Supabase Storage.');
                }
                throw uploadError;
            }

            // Obter URL pública
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // Atualizar user metadata
            const { error: updateError } = await supabase.auth.updateUser({
                data: { avatar_url: publicUrl }
            });

            if (updateError) throw updateError;

            setAvatarUrl(publicUrl);
            await refreshUser();
            alert('Foto atualizada com sucesso!');
        } catch (error: any) {
            console.error('Upload error:', error);
            const errorMessage = error.message || 'Erro ao fazer upload da foto. Tente novamente.';
            alert(errorMessage);
        } finally {
            setUploadingPhoto(false);
            // Limpar input para permitir re-upload da mesma imagem se necessário
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    full_name: fullName,
                    birth_date: birthDate,
                    gender: gender,
                }
            });

            if (error) throw error;
            alert('Perfil atualizado com sucesso!');
        } catch (error) {
            alert('Erro ao atualizar perfil');
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        if (confirm('Tem certeza que deseja sair?')) {
            await signOut();
            router.push('/login');
        }
    };

    if (!user) return null;

    const userInitials = fullName
        ? fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : user.email?.substring(0, 2).toUpperCase();

    return (
        <DashboardLayout>
            <div className="max-w-md mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center gap-3 pt-2">
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">
                        Meu Perfil
                    </h1>
                </div>

                {/* Avatar Section */}
                <div className="flex flex-col items-center justify-center py-6">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                    />
                    <div className="relative group mb-2">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingPhoto}
                            className="relative w-24 h-24 rounded-3xl bg-slate-900 flex items-center justify-center text-3xl font-bold text-white shadow-lg overflow-hidden group-hover:ring-4 ring-slate-900/20 transition-all"
                        >
                            {uploadingPhoto ? (
                                <Loader2 className="w-8 h-8 animate-spin" />
                            ) : avatarUrl ? (
                                <>
                                    <img
                                        src={avatarUrl}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Camera size={24} className="text-white" />
                                    </div>
                                </>
                            ) : (
                                <>
                                    {userInitials}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Camera size={24} className="text-white" />
                                    </div>
                                </>
                            )}
                        </button>
                    </div>
                    <p className="text-xs text-slate-400 text-center mb-3">Clique para alterar foto</p>
                    <h2 className="text-lg font-bold text-slate-900">{fullName || 'Usuário'}</h2>
                    <p className="text-sm text-slate-500">{user.email}</p>
                </div>

                {/* Form */}
                <NeoCard className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1 flex items-center gap-1">
                            <User size={12} /> Nome Completo
                        </label>
                        <Input
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Seu nome"
                            className="bg-slate-50 border-slate-100 h-11"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1 flex items-center gap-1">
                            <Mail size={12} /> Email (Não alterável)
                        </label>
                        <Input
                            value={user.email}
                            disabled
                            className="bg-slate-100 border-transparent text-slate-500 cursor-not-allowed h-11 opacity-100"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1 flex items-center gap-1">
                                <Calendar size={12} /> Nascimento
                            </label>
                            <Input
                                type="date"
                                value={birthDate}
                                onChange={(e) => setBirthDate(e.target.value)}
                                className="bg-slate-50 border-slate-100 h-11 text-sm w-full"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1 flex items-center gap-1">
                                <UserCircle size={12} /> Gênero
                            </label>
                            <select
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                className="w-full h-11 px-3 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all appearance-none"
                            >
                                <option value="">Selecione</option>
                                <option value="masculino">Masculino</option>
                                <option value="feminino">Feminino</option>
                                <option value="outro">Outro</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button
                            onClick={handleSave}
                            disabled={loading}
                            className="w-full h-12 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 shadow-sm"
                        >
                            {loading ? 'Salvando...' : 'Salvar Alterações'}
                            {!loading && <Save size={18} className="ml-2" />}
                        </Button>
                    </div>
                </NeoCard>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-200/60">
                    <Button
                        variant="ghost"
                        onClick={handleSignOut}
                        className="w-full h-12 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 font-medium"
                    >
                        <LogOut size={18} className="mr-2" />
                        Sair da Conta
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    );
}
