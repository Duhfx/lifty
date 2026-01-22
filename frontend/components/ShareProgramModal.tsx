'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTrainingProgramStore } from '@/store/trainingProgramStore';
import { X, Copy, Check, Share2, Eye, Download, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShareProgramModalProps {
    programId: string;
    programName: string;
    onClose: () => void;
}

// Componente Card Sóbrio
const NeoCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={cn("bg-white border border-slate-200 shadow-sm rounded-xl p-4", className)}>
        {children}
    </div>
);

export function ShareProgramModal({ programId, programName, onClose }: ShareProgramModalProps) {
    const { generateShareLink, removeShareLink } = useTrainingProgramStore();
    const [shareData, setShareData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [removing, setRemoving] = useState(false);

    useEffect(() => {
        // Lock body scroll
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    useEffect(() => {
        loadShareData();
    }, [programId]);

    const loadShareData = async () => {
        setLoading(true);
        try {
            const data = await generateShareLink(programId);
            setShareData(data);
        } catch (error) {
            alert('Erro ao gerar link de compartilhamento');
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        if (!shareData?.shareUrl) return;

        try {
            await navigator.clipboard.writeText(shareData.shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            alert('Erro ao copiar link');
        }
    };

    const handleRemove = async () => {
        if (!confirm('Remover compartilhamento? O link não funcionará mais.')) return;

        setRemoving(true);
        try {
            await removeShareLink(programId);
            onClose();
        } catch (error) {
            alert('Erro ao remover compartilhamento');
        } finally {
            setRemoving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
                <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <Share2 size={20} className="text-slate-400" />
                                Compartilhar
                            </h2>
                            <p className="text-sm text-slate-500 mt-1 line-clamp-1">{programName}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {loading ? (
                        <div className="py-12 flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-slate-800"></div>
                        </div>
                    ) : (
                        <>
                            {/* Share Link Input */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide ml-1 mb-1.5 block">
                                        Link Público
                                    </label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 relative">
                                            <Input
                                                type="text"
                                                value={shareData?.shareUrl || ''}
                                                readOnly
                                                className="w-full h-11 bg-slate-50 border-slate-200 text-slate-600 font-mono text-xs pr-4 rounded-xl focus:ring-0 focus:border-slate-300"
                                            />
                                        </div>
                                        <Button
                                            onClick={handleCopy}
                                            variant="outline"
                                            className={cn(
                                                "h-11 w-11 shrink-0 rounded-xl border transition-all p-0",
                                                copied 
                                                    ? "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700" 
                                                    : "bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300"
                                            )}
                                        >
                                            {copied ? <Check size={18} /> : <Copy size={18} />}
                                        </Button>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2 ml-1">
                                        Qualquer pessoa com este link poderá ver e copiar seu programa.
                                    </p>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-3">
                                    <NeoCard className="flex flex-col items-center justify-center py-3 bg-slate-50 border-slate-100">
                                        <Eye size={18} className="text-slate-400 mb-1" />
                                        <span className="text-xl font-bold text-slate-900">{shareData?.viewCount || 0}</span>
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Views</span>
                                    </NeoCard>
                                    <NeoCard className="flex flex-col items-center justify-center py-3 bg-slate-50 border-slate-100">
                                        <Download size={18} className="text-slate-400 mb-1" />
                                        <span className="text-xl font-bold text-slate-900">{shareData?.copyCount || 0}</span>
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Cópias</span>
                                    </NeoCard>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-2 border-t border-slate-100">
                                <Button
                                    variant="ghost"
                                    onClick={handleRemove}
                                    disabled={removing}
                                    className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 h-10 rounded-xl text-xs font-bold"
                                >
                                    {removing ? 'Removendo...' : 'Desativar Link e Remover'}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
