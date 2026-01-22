'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
    title: string;
    description?: string;
    backHref?: string;
    action?: React.ReactNode;
    className?: string;
}

export function PageHeader({ title, description, backHref, action, className }: PageHeaderProps) {
    const router = useRouter();

    return (
        <div className={cn("flex flex-col gap-4 mb-6 md:mb-8 animate-fade-in", className)}>
            <div className="flex items-center gap-3">
                {/* Back Button - Minimalist Style */}
                {backHref && (
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => router.push(backHref)}
                        className="-ml-3 h-10 w-10 rounded-full text-muted-foreground hover:text-foreground hover:bg-slate-100/50 shrink-0 transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </Button>
                )}

                {/* Title & Description Container */}
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl md:text-3xl font-bold tracking-tight text-foreground truncate leading-tight">
                        {title}
                    </h1>
                    {description && (
                        <p className="hidden md:block text-muted-foreground mt-1 text-sm">
                            {description}
                        </p>
                    )}
                </div>

                {/* Action Area (Right side) */}
                {action && (
                    <div className="shrink-0">
                        {action}
                    </div>
                )}
            </div>

            {/* Mobile Description (Shown below title only on mobile) */}
            {description && (
                <p className="md:hidden text-sm text-muted-foreground leading-relaxed -mt-2 pl-1">
                    {description}
                </p>
            )}
        </div>
    );
}
