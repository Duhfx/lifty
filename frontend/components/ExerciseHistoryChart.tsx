'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/lib/supabase';
import { X, TrendingUp, Calendar, Dumbbell, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExerciseHistoryData {
    exerciseId: string;
    daysLimit: number;
    totalSessions: number;
    maxWeightOverall: number;
    history: {
        sessionId: string;
        date: string;
        maxWeight: number;
        totalSets: number;
    }[];
}

interface ExerciseHistoryChartProps {
    exerciseId: string;
    exerciseName: string;
    onClose: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Componente Card Sóbrio para Stats
const StatBox = ({ label, value, icon: Icon, colorClass = "text-slate-900" }: { label: string, value: string | number, icon: any, colorClass?: string }) => (
    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col items-center justify-center text-center">
        <Icon size={16} className="text-slate-400 mb-1.5" />
        <span className={cn("text-lg font-bold leading-none mb-1", colorClass)}>{value}</span>
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
    </div>
);

export function ExerciseHistoryChart({ exerciseId, exerciseName, onClose }: ExerciseHistoryChartProps) {
    const [data, setData] = useState<ExerciseHistoryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Lock body scroll when mounted
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [exerciseId]);

    const fetchHistory = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const response = await fetch(`${API_URL}/workouts/exercises/${exerciseId}/history?days=30`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch exercise history');

            const historyData = await response.json();
            setData(historyData);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    };

    const chartData = data?.history.map(h => ({
        date: h.date,  // Keep original date for proper data key
        dateFormatted: formatDate(h.date),
        peso: h.maxWeight,
    })) || [];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
            {/* Click outside to close */}
            <div className="absolute inset-0" onClick={onClose} />
            
            <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl relative z-10 animate-scale-in flex flex-col max-h-[85vh]">
                <div className="p-6 pb-2 flex items-start justify-between border-b border-slate-50 shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 leading-tight pr-4">{exerciseName}</h2>
                        <p className="text-xs text-slate-500 font-medium mt-1">Evolução de Carga (30 dias)</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors shrink-0"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto no-scrollbar">
                    {loading ? (
                        <div className="py-12 flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-slate-800"></div>
                        </div>
                    ) : error ? (
                        <div className="py-12 text-center">
                            <p className="text-red-500 text-sm font-medium">{error}</p>
                        </div>
                    ) : data && data.history.length > 0 ? (
                        <>
                            <div className="flex items-center justify-between gap-4 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Recorde Pessoal</p>
                                    <p className="text-2xl font-bold text-indigo-600 leading-none mt-1">{data.maxWeightOverall}<span className="text-sm text-indigo-400 ml-0.5">kg</span></p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Treinos</p>
                                    <p className="text-xl font-bold text-slate-700 leading-none mt-1">{data.totalSessions}</p>
                                </div>
                            </div>

                            <div className="h-48 mb-6 w-full -ml-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#f1f5f9"
                                            vertical={false}
                                        />
                                        <XAxis
                                            dataKey="date"
                                            stroke="#94a3b8"
                                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => formatDate(value)}
                                            dy={10}
                                            interval="preserveStartEnd"
                                        />
                                        <YAxis
                                            stroke="#94a3b8"
                                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }}
                                            tickLine={false}
                                            axisLine={false}
                                            width={30}
                                            domain={['dataMin - 5', 'dataMax + 5']}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '12px',
                                                color: '#0f172a',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                padding: '8px 12px'
                                            }}
                                            formatter={(value: any) => [`${value} kg`, 'Carga']}
                                            labelFormatter={(label) => formatDate(String(label))}
                                            cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="peso"
                                            stroke="#4f46e5"
                                            strokeWidth={3}
                                            dot={{ fill: '#fff', stroke: '#4f46e5', strokeWidth: 2, r: 4 }}
                                            activeDot={{ r: 6, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-2">Últimos Registros</h3>
                                {data.history.slice().reverse().slice(0, 3).map((session) => (
                                    <div key={session.sessionId} className="flex items-center justify-between p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-100 transition-colors">
                                        <span className="text-xs font-semibold text-slate-500 capitalize">{formatDate(session.date)}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded">{session.totalSets} sets</span>
                                            <span className="text-sm font-bold text-slate-900">{session.maxWeight}kg</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="py-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white flex items-center justify-center shadow-sm text-slate-300">
                                <TrendingUp size={24} />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 mb-1">
                                Sem dados suficientes
                            </h3>
                            <p className="text-xs text-slate-500 max-w-[180px] mx-auto leading-relaxed">
                                Continue treinando este exercício para visualizar sua evolução aqui.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}