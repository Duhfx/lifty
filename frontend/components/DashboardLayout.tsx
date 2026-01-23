'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useWorkoutStore } from '@/store/workoutStore';
import { useSessionStore } from '@/store/sessionStore';
import {
    LayoutDashboard,
    Dumbbell,
    History,
    TrendingUp,
    LogOut,
    ChevronLeft,
    ChevronRight,
    User
} from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
}

const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Programas', path: '/programs', icon: Dumbbell },
    { name: 'Histórico', path: '/history', icon: History },
];

export function DashboardLayout({ children }: LayoutProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, loading, signOut } = useAuthStore();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const fetchWorkouts = useWorkoutStore(s => s.fetchWorkouts);
    const fetchSessions = useSessionStore(s => s.fetchSessions);

    useEffect(() => {
        const saved = localStorage.getItem('sidebarCollapsed');
        if (saved !== null) setSidebarCollapsed(JSON.parse(saved));
    }, []);

    const toggleSidebar = () => {
        const newState = !sidebarCollapsed;
        setSidebarCollapsed(newState);
        localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
    };

    useEffect(() => {
        if (!loading && !user) router.push('/login');
    }, [user, loading, router]);

    // Prefetching inteligente em background
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Usar requestIdleCallback para não bloquear thread principal (com fallback)
        const callback = () => {
            // Prefetch baseado na rota atual
            if (pathname === '/dashboard') {
                // Usuário no dashboard, provavelmente vai para programas
                fetchWorkouts();
            } else if (pathname === '/programs') {
                // Usuário em programas, provavelmente volta ao dashboard
                fetchSessions();
            }
        };

        if ('requestIdleCallback' in window) {
            const idleCallback = requestIdleCallback(callback, { timeout: 2000 });
            return () => cancelIdleCallback(idleCallback);
        } else {
            // Fallback para navegadores sem suporte
            const timeout = setTimeout(callback, 100);
            return () => clearTimeout(timeout);
        }
    }, [pathname, fetchWorkouts, fetchSessions]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) return null;

    const isActive = (path: string) => {
        if (path === '/dashboard') return pathname === path;
        return pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Desktop Sidebar */}
            <aside className={`fixed left-0 top-0 z-40 h-screen bg-card border-r border-border hidden lg:flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-72'}`}>
                <div className={`h-20 flex items-center px-6 ${sidebarCollapsed ? 'justify-center px-0' : ''}`}>
                    <button onClick={() => router.push('/dashboard')} className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-teal-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Dumbbell className="text-white w-5 h-5" />
                        </div>
                        {!sidebarCollapsed && <span className="text-xl font-bold tracking-tight">Lifty</span>}
                    </button>
                </div>

                <nav className="flex-1 py-6 px-4 space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => router.push(item.path)}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 ${isActive(item.path) ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'} ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
                        >
                            <item.icon size={22} strokeWidth={isActive(item.path) ? 2.5 : 2} />
                            {!sidebarCollapsed && <span>{item.name}</span>}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-border/50 space-y-2">
                    <button onClick={toggleSidebar} className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-muted-foreground hover:bg-muted/50 transition-all ${sidebarCollapsed ? 'justify-center px-0' : ''}`}>
                        {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                        {!sidebarCollapsed && <span className="text-sm">Recolher</span>}
                    </button>
                    <button onClick={async () => { await signOut(); router.push('/login'); }} className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all ${sidebarCollapsed ? 'justify-center px-0' : ''}`}>
                        <LogOut size={20} />
                        {!sidebarCollapsed && <span className="text-sm">Sair</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Navigation (Fixed Sober Bar) */}
            <div className="lg:hidden fixed bottom-0 left-0 w-full z-[9999] bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <nav className="max-w-md mx-auto px-6 py-2 flex justify-between items-center">
                    {navItems.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                prefetch={true}
                                className={`p-3 rounded-lg transition-all duration-200 flex flex-col items-center gap-1 ${
                                    active ? 'text-slate-900 bg-slate-100 scale-105' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                }`}
                                onMouseEnter={() => {
                                    if (item.path === '/programs') fetchWorkouts();
                                    if (item.path === '/dashboard') fetchSessions();
                                }}
                            >
                                <item.icon size={22} strokeWidth={active ? 2.5 : 2} />
                            </Link>
                        );
                    })}

                    <Link
                        href="/profile"
                        prefetch={true}
                        className={`p-3 rounded-lg transition-all duration-200 flex flex-col items-center gap-1 ${
                            isActive('/profile') ? 'text-slate-900 bg-slate-100 scale-105' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        <User size={22} strokeWidth={isActive('/profile') ? 2.5 : 2} />
                    </Link>
                </nav>
            </div>

            <main className={`min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'} pb-[80px] lg:pb-8`}>
                <div className="container mx-auto max-w-7xl p-4 lg:p-8 animate-fade-in">
                    {children}
                </div>
            </main>
        </div>
    );
}
