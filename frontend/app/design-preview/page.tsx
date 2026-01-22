'use client';

import React from 'react';
import { 
    Activity, 
    Calendar, 
    ChevronRight, 
    Dumbbell, 
    Flame, 
    History, 
    LayoutDashboard, 
    Play, 
    Settings, 
    TrendingUp, 
    Trophy,
    User
} from 'lucide-react';
import { 
    Area, 
    AreaChart, 
    ResponsiveContainer, 
    Tooltip, 
    XAxis, 
    YAxis 
} from 'recharts';

// --- DATA MOCKS ---

const WORKOUT_ROUTINES = [

    { 

        id: 'a', 

        name: 'Treino A - Peito', 

        subtitle: 'e Tríceps',

        lastPerformed: '3 dias atrás', 

        color: 'bg-slate-900',

        tags: ['Supino Reto', 'Crucifixo', 'Tríceps Corda', 'Mergulho']

    },

    { 

        id: 'b', 

        name: 'Treino B - Costas', 

        subtitle: 'e Bíceps',

        lastPerformed: '5 dias atrás', 

        color: 'bg-indigo-950',

        tags: ['Puxada Alta', 'Remada Curvada', 'Rosca Direta', 'Martelo']

    },

    { 

        id: 'c', 

        name: 'Treino C - Pernas', 

        subtitle: 'e Ombros',

        lastPerformed: '7 dias atrás', 

        color: 'bg-slate-800',

        tags: ['Agachamento', 'Leg Press', 'Extensora', 'Elev. Lateral']

    },

];



const RECENT_HISTORY = [

    { id: 1, name: 'Treino A - Peito e Tríceps', date: 'Hoje, 09:30', duration: '55min', vol: '4.2t' },

    { id: 2, name: 'Treino B - Costas e Bíceps', date: 'Ontem, 18:45', duration: '62min', vol: '5.1t' },

    { id: 3, name: 'Treino C - Pernas', date: 'Segunda, 19:00', duration: '70min', vol: '6.8t' },

];



// --- COMPONENTS ---



const NeoCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (

    <div className={`neo-card rounded-xl p-5 ${className}`}>

        {children}

    </div>

);



const NavItem = ({ icon: Icon, active = false }: { icon: any, active?: boolean }) => (

    <button className={`p-3 rounded-lg transition-all duration-200 flex flex-col items-center gap-1 relative ${active ? 'text-slate-900 bg-slate-100' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>

        <Icon size={22} strokeWidth={active ? 2.5 : 2} />

    </button>

);



export default function DesignPreviewPage() {

    return (

        <div className="neo-theme-wrapper">

            <style jsx global>{`

                :root {

                    --bg-main: #f8fafc;   /* Slate 50 */

                    --text-main: #0f172a; /* Slate 900 */

                    --text-muted: #64748b;

                    

                    /* Sober Card */

                    --card-bg: #ffffff;

                    --card-border: #e2e8f0; /* Slate 200 */

                    --card-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);

                    

                    /* Accents */

                    --accent-primary: #0f172a;

                    --nav-bg: #ffffff;

                }



                .neo-theme-wrapper {

                    background-color: var(--bg-main);

                    color: var(--text-main);

                    min-height: 100vh;

                }



                .neo-card {

                    background: var(--card-bg);

                    border: 1px solid var(--card-border);

                    box-shadow: var(--card-shadow);

                    transition: all 0.2s ease;

                }



                .neo-gradient-text {

                    color: #0f172a;

                }



                /* Hide Scrollbar for Horizontal Scroll */

                .no-scrollbar::-webkit-scrollbar {

                    display: none;

                }

                .no-scrollbar {

                    -ms-overflow-style: none;

                    scrollbar-width: none;

                }

            `}</style>



            <div className="font-sans pb-32 relative overflow-x-hidden">

                

                {/* Clean Background */}

                <div className="max-w-md mx-auto min-h-screen">

                    

                    {/* --- MAIN CONTENT --- */}

                    <main className="p-6 space-y-6 relative z-10">

                        

                        {/* Header Modernizado (Sóbrio) */}

                        <header className="flex items-center justify-between mt-2">

                            <div className="flex items-center gap-4">

                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">

                                    <User size={20} className="text-slate-600" />

                                </div>

                                <h1 className="text-lg font-bold tracking-tight text-slate-900">

                                    Olá, Eduardo

                                </h1>

                            </div>

                            <button className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors shadow-sm">

                                <Settings size={20} />

                            </button>

                        </header>



                        {/* Stats Grid */}

                        <div className="grid grid-cols-2 gap-4">

                            <NeoCard className="group hover:border-slate-300">

                                <div className="flex justify-between items-start mb-2">

                                    <p className="text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wide">Sequência</p>

                                    <Flame size={18} className="text-slate-400" />

                                </div>

                                <div className="flex items-baseline gap-1">

                                    <span className="text-2xl font-bold text-slate-900">12</span>

                                    <span className="text-xs text-[var(--text-muted)]">dias</span>

                                </div>

                            </NeoCard>



                            <NeoCard className="group hover:border-slate-300">

                                <div className="flex justify-between items-start mb-2">

                                    <p className="text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wide">Total</p>

                                    <Trophy size={18} className="text-slate-400" />

                                </div>

                                <div className="flex items-baseline gap-1">

                                    <span className="text-2xl font-bold text-slate-900">42</span>

                                    <span className="text-xs text-[var(--text-muted)]">treinos</span>

                                </div>

                            </NeoCard>

                        </div>



                                                {/* Horizontal Scroll Workouts (Carousel) */}



                                                <section>



                                                    <div className="flex items-center justify-between mb-3 px-1">



                                                        <h3 className="text-base font-bold text-slate-900">Seus Treinos</h3>



                                                    </div>



                                                    <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar snap-x snap-mandatory">



                                                        {WORKOUT_ROUTINES.map((routine) => (



                                                            <div key={routine.id} className={`snap-center shrink-0 w-[85%] rounded-xl ${routine.color} p-5 relative overflow-hidden shadow-md text-white flex flex-col justify-between min-h-[160px] transition-transform active:scale-[0.98]`}>



                                                                



                                                                {/* Top Section */}



                                                                <div className="relative z-10 flex justify-between items-start">



                                                                    <div>



                                                                        <h3 className="text-xl font-bold leading-none">{routine.name}</h3>



                                                                        <p className="text-white/60 text-sm font-medium">{routine.subtitle}</p>



                                                                    </div>



                                                                    <button className="w-10 h-10 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-lg hover:bg-slate-50 transition-colors shrink-0">



                                                                        <Play fill="currentColor" size={16} className="ml-0.5" />



                                                                    </button>



                                                                </div>



                        



                                                                {/* Tags Section */}



                                                                <div className="relative z-10 mt-4">



                                                                    <div className="flex flex-wrap gap-2 mb-3">



                                                                        {routine.tags.slice(0, 3).map((tag) => (



                                                                            <span key={tag} className="px-2 py-1 rounded-[6px] bg-white/10 border border-white/5 text-[10px] font-medium text-white/90 backdrop-blur-sm">



                                                                                {tag}



                                                                            </span>



                                                                        ))}



                                                                        {routine.tags.length > 3 && (



                                                                            <span className="px-2 py-1 rounded-[6px] bg-white/5 border border-white/5 text-[10px] text-white/60">



                                                                                +{routine.tags.length - 3}



                                                                            </span>



                                                                        )}



                                                                    </div>



                                                                    



                                                                    <div className="flex items-center gap-2 text-white/40 text-[10px] font-medium uppercase tracking-wider">



                                                                        <Calendar size={12} />



                                                                        <span>Realizado: {routine.lastPerformed}</span>



                                                                    </div>



                                                                </div>



                                                            </div>



                                                        ))}



                                                    </div>



                                                </section>



                        {/* Recent History List */}

                        <section>

                            <div className="flex items-center justify-between mb-3 px-1">

                                <h3 className="text-base font-bold text-slate-900">Histórico Recente</h3>

                                <button className="text-slate-900 text-xs font-bold hover:underline">Ver tudo</button>

                            </div>

                            <div className="space-y-2">

                                {RECENT_HISTORY.map((item) => (

                                    <NeoCard key={item.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer group shadow-sm">

                                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:text-slate-900 transition-colors border border-slate-100">

                                            <History size={18} />

                                        </div>

                                        <div className="flex-1 min-w-0">

                                            <h4 className="text-sm font-semibold truncate text-slate-900">{item.name}</h4>

                                            <p className="text-[10px] uppercase tracking-wide text-slate-500 font-medium">{item.date} • {item.duration}</p>

                                        </div>

                                        <div className="text-right whitespace-nowrap">

                                            <p className="text-sm font-bold text-slate-900">{item.vol}</p>

                                            <p className="text-[10px] text-slate-500 font-medium">vol</p>

                                        </div>

                                        <ChevronRight size={14} className="text-slate-300" />

                                    </NeoCard>

                                ))}

                            </div>

                        </section>



                    </main>

                </div>





                {/* --- MOBILE BOTTOM NAVIGATION (Structured) --- */}

                <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 pb-safe">

                    <div className="max-w-md mx-auto px-6 py-2 flex justify-between items-center">

                        <NavItem icon={LayoutDashboard} active />

                        <NavItem icon={Calendar} />

                        <NavItem icon={TrendingUp} />

                        <NavItem icon={User} />

                    </div>

                </div>

            </div>

        </div>

    );

}
