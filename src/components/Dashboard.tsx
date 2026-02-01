import React from 'react';
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    CreditCard,
    Receipt,
    Calendar,
    ChevronRight
} from 'lucide-react';
import {
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie
} from 'recharts';
import type { Movement } from '../types';
import { cn } from './Layout';
import { AIInsights } from './AIInsights';

interface StatCardProps {
    title: string;
    amount: number;
    currency: string;
    trend?: number;
    type: 'income' | 'expense' | 'balance';
    icon: React.ElementType;
}

const StatCard = ({ title, amount, currency, trend, type, icon: Icon }: StatCardProps) => {
    const isPositive = (trend ?? 0) >= 0;

    return (
        <div className="glass-card group overflow-hidden relative">
            <div className={cn(
                "absolute -right-4 -top-4 w-24 h-24 blur-2xl opacity-10 rounded-full transition-opacity group-hover:opacity-20",
                type === 'income' ? "bg-emerald-500" :
                    type === 'expense' ? "bg-rose-500" :
                        "bg-indigo-500"
            )} />

            <div className="flex justify-between items-start mb-6 relative">
                <div className={cn(
                    "p-3 rounded-2xl transition-transform group-hover:scale-110 shadow-lg",
                    type === 'income' ? "bg-emerald-500/20 text-emerald-400 shadow-emerald-500/10" :
                        type === 'expense' ? "bg-rose-500/20 text-rose-400 shadow-rose-500/10" :
                            "bg-indigo-500/20 text-indigo-400 shadow-indigo-500/10"
                )}>
                    <Icon size={24} />
                </div>
                {trend !== undefined && (
                    <div className={cn(
                        "flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-bold",
                        isPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                    )}>
                        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        <span>{Math.abs(trend)}%</span>
                    </div>
                )}
            </div>

            <h3 className="text-slate-400 text-xs font-bold mb-1 uppercase tracking-[0.1em]">{title}</h3>
            <div className="flex items-baseline space-x-2">
                <span className="text-xl font-medium text-slate-500 font-outfit">{currency}</span>
                <span className="text-3xl font-extrabold tracking-tight stat-value font-outfit">
                    {amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
            </div>
        </div>
    );
};

interface DashboardProps {
    movements: Movement[];
    onViewChange: (view: 'dashboard' | 'movements' | 'subscriptions' | 'settings') => void;
}

interface DashboardProps {
    movements: Movement[];
    onViewChange: (view: 'dashboard' | 'movements' | 'subscriptions' | 'settings') => void;
    userName?: string;
}

export const Dashboard = ({ movements, onViewChange, userName }: DashboardProps) => {
    const now = new Date();
    const currentMonthKey = now.toISOString().substring(0, 7);

    // Find movements for current month
    let monthlyMovements = movements.filter(m =>
        m.status !== 'descartado' &&
        m.date.startsWith(currentMonthKey)
    );

    // If current month is empty, fallback to the latest month available in data
    let displayedMonthKey = currentMonthKey;
    if (monthlyMovements.length === 0 && movements.length > 0) {
        const sortedMovements = [...movements]
            .filter(m => m.status !== 'descartado')
            .sort((a, b) => b.date.localeCompare(a.date));
        if (sortedMovements.length > 0) {
            displayedMonthKey = sortedMovements[0].date.substring(0, 7);
            monthlyMovements = movements.filter(m =>
                m.status !== 'descartado' &&
                m.date.startsWith(displayedMonthKey)
            );
        }
    }

    const displayedDate = new Date(displayedMonthKey + '-02'); // -02 to avoid TZ issues
    const monthName = displayedDate.toLocaleString('es-ES', { month: 'long' });
    const yearName = displayedDate.getFullYear();

    // Helper for normalization (Approximate rates)
    const normalize = (amount: number, currency: string) => {
        if (currency === 'USD') return amount * 950;
        if (currency === 'EUR') return amount * 1050;
        return amount;
    };

    // Aggregations (Normalized to CLP for calculation)
    const totalIncome = monthlyMovements
        .filter(m => m.type === 'ingreso')
        .reduce((acc, m) => acc + normalize(m.amount, m.currency), 0);

    const totalExpense = monthlyMovements
        .filter(m => m.type === 'gasto')
        .reduce((acc, m) => acc + normalize(m.amount, m.currency), 0);

    const balance = totalIncome - totalExpense;

    // Previous month stats for trends
    const prevDate = new Date(displayedMonthKey + '-02');
    prevDate.setMonth(prevDate.getMonth() - 1);
    const prevMonthKey = prevDate.toISOString().substring(0, 7);

    const prevMovements = movements.filter(m =>
        m.status !== 'descartado' &&
        m.date.startsWith(prevMonthKey)
    );

    const prevIncome = prevMovements
        .filter(m => m.type === 'ingreso')
        .reduce((acc, m) => acc + normalize(m.amount, m.currency), 0);

    const prevExpense = prevMovements
        .filter(m => m.type === 'gasto')
        .reduce((acc, m) => acc + normalize(m.amount, m.currency), 0);

    const calculateTrend = (current: number, previous: number) => {
        if (previous === 0) return 0;
        return Number(((current - previous) / previous * 100).toFixed(1));
    };

    const incomeTrend = calculateTrend(totalIncome, prevIncome);
    const expenseTrend = calculateTrend(totalExpense, prevExpense);

    const categoryData = monthlyMovements
        .filter(m => m.type === 'gasto')
        .reduce((acc: any[], m) => {
            const normalizedAmount = normalize(m.amount, m.currency);
            const existing = acc.find(x => x.name === m.category);
            if (existing) {
                existing.value += normalizedAmount;
            } else {
                acc.push({ name: m.category, value: normalizedAmount });
            }
            return acc;
        }, []);

    // Recent activity doesn't need to be restricted to this month, but should be filtered
    const activeMovements = movements
        .filter(m => m.status !== 'descartado')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'];

    return (
        <div className="space-y-6 md:space-y-8 animate-fade-in">
            <header className="flex flex-col gap-4 md:gap-6 pb-4 border-b border-white/5">
                <div>
                    <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">En vivo</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black gradient-text tracking-tighter mb-2">Hola de nuevo{userName ? `, ${userName}` : ''}</h1>
                    <p className="text-slate-400 text-sm md:text-base lg:text-lg font-medium">Controla tus finanzas con inteligencia.</p>
                </div>
                <div className="flex items-center">
                    <div className="glass-card !py-2 md:!py-3 !px-3 md:!px-5 !rounded-xl md:!rounded-2xl border border-indigo-500/20 bg-indigo-500/5 shadow-xl shadow-indigo-500/5 flex items-center space-x-3 md:space-x-4">
                        <div className="p-1.5 md:p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                            <Calendar size={18} className="md:w-5 md:h-5" />
                        </div>
                        <div>
                            <p className="text-[9px] md:text-[10px] uppercase font-bold text-indigo-400/60 tracking-wider mb-0">Periodo actual</p>
                            <p className="text-xs md:text-sm font-bold text-indigo-100 uppercase">{monthName} {yearName}</p>
                        </div>
                    </div>
                </div>
            </header>

            <AIInsights movements={movements} />

            {/* Grid Sections */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <StatCard
                    title="Total Ingresos"
                    amount={totalIncome}
                    currency="$"
                    trend={incomeTrend || undefined}
                    type="income"
                    icon={TrendingUp}
                />
                <StatCard
                    title="Total Gastos"
                    amount={totalExpense}
                    currency="$"
                    trend={expenseTrend || undefined}
                    type="expense"
                    icon={TrendingDown}
                />
                <StatCard
                    title="Balance Neto"
                    amount={balance}
                    currency="$"
                    type="balance"
                    icon={Wallet}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                {/* Category Chart - Left */}
                <div className="glass-card lg:col-span-5 flex flex-col min-h-[400px] md:min-h-[500px] border-indigo-500/10 min-w-0 overflow-hidden">
                    <div className="mb-6 md:mb-8">
                        <h3 className="text-lg md:text-xl font-black mb-1">Distribución</h3>
                        <p className="text-slate-500 text-xs md:text-sm font-medium">Gastos segmentados por categoría</p>
                    </div>

                    {/* FIXED HEIGHT CONTAINER FOR RECHARTS */}
                    <div className="w-full" style={{ minHeight: '250px', height: '250px' }}>
                        <div className="w-full h-full relative">
                            <ResponsiveContainer width="100%" height="100%" minWidth={250} minHeight={250}>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={85}
                                        paddingAngle={8}
                                        dataKey="value"
                                        animationBegin={0}
                                        animationDuration={1000}
                                    >
                                        {categoryData.map((_entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                                stroke="rgba(255,255,255,0.05)"
                                                strokeWidth={2}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(10, 10, 12, 0.95)',
                                            borderColor: 'rgba(99, 102, 241, 0.2)',
                                            borderRadius: '12px',
                                            padding: '8px 12px',
                                            fontSize: '11px'
                                        }}
                                        itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>

                            {/* Center Text for Donut */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest">Gasto Total</span>
                                <span className="text-xl md:text-2xl font-black stat-value">${totalExpense.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 md:mt-8 grid grid-cols-2 gap-3 md:gap-4">
                        {categoryData.slice(0, 4).map((item, i) => (
                            <div key={item.name} className="flex items-center space-x-2 md:space-x-3 bg-white/5 p-2 md:p-3 rounded-lg md:rounded-xl border border-white/5">
                                <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                <div className="min-w-0">
                                    <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase truncate">{item.name}</p>
                                    <p className="text-[11px] md:text-xs font-black truncate">${item.value.toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Transactions - Right */}
                <div className="glass-card lg:col-span-7 flex flex-col min-h-[500px]">
                    <div className="flex justify-between items-start mb-10">
                        <div>
                            <h3 className="text-xl font-black mb-1">Última Actividad</h3>
                            <p className="text-slate-500 text-sm font-medium">Movimientos recientes en tus cuentas</p>
                        </div>
                        <button
                            onClick={() => onViewChange('movements')}
                            className="px-4 py-2 rounded-xl bg-white/5 text-indigo-400 text-xs font-bold hover:bg-white/10 transition-all flex items-center group border border-white/5"
                        >
                            Ver historial completo
                            <ChevronRight size={14} className="ml-2 transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                        {activeMovements.length > 0 ? (
                            activeMovements.slice(0, 6).map((m) => (
                                <div key={m.id} className="group flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] hover:bg-indigo-500/[0.05] transition-all border border-white/[0.03] hover:border-indigo-500/20">
                                    <div className="flex items-center space-x-5">
                                        <div className={cn(
                                            "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:rotate-6 shadow-lg",
                                            m.type === 'ingreso' ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-300"
                                        )}>
                                            {m.type === 'ingreso' ? <ArrowUpRight size={24} /> :
                                                m.category === 'Suscripciones' ? <RefreshCw size={24} className="w-5 h-5" /> : <CreditCard size={24} />}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black mb-1 group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{m.merchant || m.description}</h4>
                                            <div className="flex items-center space-x-3">
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold uppercase tracking-wider border border-white/5">{m.category}</span>
                                                <div className="flex items-center text-[10px] text-slate-600 font-bold uppercase whitespace-nowrap">
                                                    <Calendar size={10} className="mr-1" />
                                                    {m.date}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={cn(
                                            "text-lg font-black stat-value mb-1",
                                            m.type === 'ingreso' ? "text-emerald-400" : "text-white"
                                        )}>
                                            {m.type === 'ingreso' ? '+' : '-'}{m.currency} {m.amount.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                                        </div>
                                        <div className={cn(
                                            "text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-md inline-block",
                                            m.status === 'confirmado' ? "text-emerald-500 bg-emerald-500/10" : "text-amber-500 bg-amber-500/10"
                                        )}>
                                            {m.status.split('_')[0]}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-700 space-y-4">
                                <div className="p-8 bg-white/5 rounded-full">
                                    <Receipt size={64} className="opacity-20 translate-y-2 animate-bounce" />
                                </div>
                                <p className="font-black text-xl tracking-tight opacity-40 uppercase">Sin movimientos</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Internal icon for subscription indicator
const RefreshCw = ({ size, className }: { size?: number, className?: string }) => (
    <svg
        width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        className={className}
    >
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
        <path d="M16 16h5v5" />
    </svg>
);
