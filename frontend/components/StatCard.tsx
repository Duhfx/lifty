'use client';

import { ReactNode } from 'react';

interface StatCardProps {
    icon: ReactNode;
    value: string | number;
    label: string;
    description?: string;
    trend?: 'up' | 'down' | 'neutral';
    color?: 'primary' | 'secondary' | 'accent' | 'indigo' | 'teal';
}

export function StatCard({ icon, value, label, description, color = 'primary' }: StatCardProps) {
    const colorMap = {
        primary: 'text-primary bg-primary/10',
        secondary: 'text-secondary-foreground bg-secondary',
        accent: 'text-accent-foreground bg-accent',
        indigo: 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-500/10',
        teal: 'text-teal-600 bg-teal-50 dark:text-teal-400 dark:bg-teal-500/10',
    };

    return (
        <div className="neo-card p-5 hover:border-primary/20 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                        {label}
                    </p>
                    <h3 className="text-2xl font-bold text-foreground tracking-tight">
                        {value}
                    </h3>
                </div>
                <div className={`p-2.5 rounded-xl ${colorMap[color] || colorMap.primary}`}>
                    {icon}
                </div>
            </div>
            {description && (
                <p className="text-xs text-muted-foreground">
                    {description}
                </p>
            )}
        </div>
    );
}