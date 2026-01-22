'use client';

import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    TooltipProps,
    Area,
    AreaChart,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DataPoint {
    date: string;
    maxWeight?: number;
    reps?: number;
    totalVolume?: number;
    totalSets?: number;
}

interface ProgressChartProps {
    data: DataPoint[];
    type: 'weight' | 'volume';
    loading?: boolean;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: ReadonlyArray<{ payload: DataPoint }>;
    label?: string | number;
    type: 'weight' | 'volume';
}

function CustomTooltip({ active, payload, label, type }: CustomTooltipProps) {
    if (!active || !payload || !payload.length || !label) return null;

    const data = payload[0].payload;
    const formattedDate = format(parseISO(String(label)), "dd 'de' MMM", { locale: ptBR });

    return (
        <div className="bg-background/95 backdrop-blur-sm border border-border/50 rounded-xl px-4 py-3 shadow-2xl">
            <p className="text-xs text-muted-foreground mb-1.5 font-medium">{formattedDate}</p>
            {type === 'weight' ? (
                <>
                    <p className="text-xl font-bold text-emerald-500">{data.maxWeight} kg</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{data.reps} reps</p>
                </>
            ) : (
                <>
                    <p className="text-xl font-bold text-teal-500">{data.totalVolume?.toLocaleString()} kg</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{data.totalSets} séries</p>
                </>
            )}
        </div>
    );
}

export function ProgressChart({ data, type, loading }: ProgressChartProps) {
    if (loading) {
        return (
            <div className="h-72 bg-card rounded-xl border border-border flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-muted rounded-full"></div>
                    <div className="w-24 h-4 bg-muted rounded"></div>
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="h-72 bg-card rounded-xl border border-border flex items-center justify-center">
                <div className="text-center px-6">
                    <svg
                        className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                    </svg>
                    <p className="text-muted-foreground">Nenhum dado para exibir</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">
                        Registre seus treinos para ver a evolução
                    </p>
                </div>
            </div>
        );
    }

    const dataKey = type === 'weight' ? 'maxWeight' : 'totalVolume';
    const color = type === 'weight' ? '#10b981' : '#14b8a6'; // Brighter emerald and teal
    const gradientId = `gradient-${type}`;

    return (
        <div className="h-72 bg-gradient-to-br from-card to-muted/20 rounded-xl border border-border/50 p-6 shadow-lg">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                        strokeOpacity={0.3}
                        vertical={false}
                    />
                    <XAxis
                        dataKey="date"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => format(parseISO(value), 'dd/MM', { locale: ptBR })}
                    />
                    <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => type === 'volume' ? `${(value / 1000).toFixed(0)}k` : value}
                    />
                    <Tooltip content={(props) => <CustomTooltip {...props} type={type} />} />
                    <Area
                        type="monotone"
                        dataKey={dataKey}
                        stroke={color}
                        strokeWidth={3}
                        fill={`url(#${gradientId})`}
                        dot={{
                            stroke: color,
                            strokeWidth: 2,
                            r: 5,
                            fill: color,
                            fillOpacity: 0.8
                        }}
                        activeDot={{
                            stroke: color,
                            strokeWidth: 3,
                            r: 7,
                            fill: color,
                            fillOpacity: 1,
                            filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.6))'
                        }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
