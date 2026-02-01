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
        <div className="glass-card group overflow-hidden relative border border-[#3a3a3f] bg-[#1a1a1f] p-6 hover:border-[#4a4a4f] transition-all duration-300">
            <div className="flex justify-between items-start mb-4 relative">
                <div className={cn(
                    "p-2.5 transition-transform group-hover:scale-105",
                    type === 'income' ? "bg-emerald-500/10 text-emerald-500" :
                        type === 'expense' ? "bg-rose-500/10 text-rose-500" :
                            "bg-indigo-500/10 text-indigo-400"
                )}>
                    <Icon size={22} />
                </div>
                {trend !== undefined && (
                    <div className={cn(
                        "flex items-center space-x-1 px-2 py-0.5 text-xs font-bold border",
                        isPositive ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/20" : "bg-rose-500/5 text-rose-500 border-rose-500/20"
                    )}>
                        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        <span>{Math.abs(trend)}%</span>
                    </div>
                )}
            </div>

            <h3 className="text-[#a0a0a5] text-xs font-bold mb-1 uppercase tracking-widest">{title}</h3>
            <div className="flex items-baseline space-x-2">
                <span className="text-lg font-medium text-[#6a6a6f] font-outfit">{currency}</span>
                <span className="text-3xl font-extrabold tracking-tight text-[#e5e5e5] font-outfit">
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

export const Dashboard = ({ movements, onViewChange }: DashboardProps) => {
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
        .reduce((acc, movement) => {
            const existing = acc.find(c => c.name === movement.category);
            const value = normalize(movement.amount, movement.currency);
            if (existing) {
                existing.value += value;
            } else {
                acc.push({ name: movement.category, value });
            }
            return acc;
        }, [] as { name: string; value: number }[])
        .sort((a, b) => b.value - a.value);

    // Recent activity doesn't need to be restricted to this month, but should be filtered
    const activeMovements = movements
        .filter(m => m.status !== 'descartado')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#14b8a6', '#f59e0b'];

    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-24 md:pb-0">
            {/* Header Area - Clean & Minimal */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#3a3a3f] pb-6">
                <div>
                    <h1 className="text-3xl font-black text-[#e5e5e5] tracking-tight mb-1">
                        Resumen Financiero
                    </h1>
                    <p className="text-[#a0a0a5] font-medium flex items-center space-x-2">
                        <Calendar size={16} />
                        <span className="capitalize">{monthName} {yearName}</span>
                    </p>
                </div>

                {/* No "EN VIVO" Badge anymore */}
            </div>

            <AIInsights movements={movements} />

            {/* Stats Grid - Normalized Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="Balance Total"
                    amount={balance}
                    currency="CLP"
                    type="balance"
                    icon={Wallet}
                />
                <StatCard
                    title="Ingresos"
                    amount={totalIncome}
                    currency="CLP"
                    trend={incomeTrend}
                    type="income"
                    icon={TrendingUp}
                />
                <StatCard
                    title="Gastos"
                    amount={totalExpense}
                    currency="CLP"
                    trend={expenseTrend}
                    type="expense"
                    icon={TrendingDown}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                {/* Category Chart - Left */}
                <div className="glass-card lg:col-span-12 xl:col-span-4 min-h-[500px] border border-[#3a3a3f] bg-[#1a1a1f] p-6">
                    <h3 className="text-xl font-black mb-1 text-[#e5e5e5]">Distribución</h3>
                    <p className="text-[#a0a0a5] text-sm font-medium mb-8">Desglose de gastos por categoría</p>

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
                                        paddingAngle={4}
                                        dataKey="value"
                                        animationBegin={0}
                                        animationDuration={1000}
                                        stroke="none"
                                    >
                                        {categoryData.map((_entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                                stroke="rgba(10, 10, 12, 1)"
                                                strokeWidth={2}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1a1a1f',
                                            borderColor: '#3a3a3f',
                                            borderRadius: '0px',
                                            padding: '8px 12px',
                                            fontSize: '11px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                                        }}
                                        itemStyle={{ color: '#e5e5e5', fontSize: '11px', fontWeight: 'bold' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>

                            {/* Center Text for Donut */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-[9px] md:text-[10px] font-bold text-[#6a6a6f] uppercase tracking-widest">Gasto Total</span>
                                <span className="text-xl md:text-2xl font-black stat-value text-[#e5e5e5]">${totalExpense.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 md:mt-8 grid grid-cols-2 gap-3 md:gap-4">
                        {categoryData.slice(0, 4).map((item, i) => (
                            <div key={item.name} className="flex items-center space-x-2 md:space-x-3 bg-[#2a2a2f] p-3 border border-[#3a3a3f]">
                                <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-none shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                <div className="min-w-0">
                                    <p className="text-[9px] md:text-[10px] font-bold text-[#a0a0a5] uppercase truncate">{item.name}</p>
                                    <p className="text-[11px] md:text-xs font-black text-[#e5e5e5] truncate">${item.value.toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Transactions - Right */}
                <div className="glass-card lg:col-span-12 xl:col-span-8 flex flex-col min-h-[500px] border border-[#3a3a3f] bg-[#1a1a1f] p-6">
                    <div className="flex justify-between items-start mb-10">
                        <div>
                            <h3 className="text-xl font-black mb-1 text-[#e5e5e5]">Última Actividad</h3>
                            <p className="text-[#a0a0a5] text-sm font-medium">Movimientos recientes en tus cuentas</p>
                        </div>
                        <button
                            onClick={() => onViewChange('movements')}
                            className="px-4 py-2 bg-[#2a2a2f] text-[#a0a0a5] text-xs font-bold hover:bg-[#3a3a3f] hover:text-[#e5e5e5] transition-all flex items-center group border border-[#3a3a3f]"
                        >
                            Ver historial completo
                            <ChevronRight size={14} className="ml-2 transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                        {activeMovements.length > 0 ? (
                            activeMovements.slice(0, 6).map((m) => (
                                <div key={m.id} className="group flex items-center justify-between p-4 bg-[#0a0a0c] hover:bg-[#2a2a2f] transition-all border border-[#3a3a3f]">
                                    <div className="flex items-center space-x-5">
                                        <div className={cn(
                                            "w-12 h-12 flex items-center justify-center transition-all duration-300 shadow-sm border border-[#3a3a3f]",
                                            m.type === 'ingreso' ? "bg-[#1a1a1f] text-emerald-500" : "bg-[#1a1a1f] text-[#a0a0a5] group-hover:text-[#e5e5e5]"
                                        )}>
                                            {m.type === 'ingreso' ? <ArrowUpRight size={20} /> :
                                                m.category === 'Suscripciones' ? <RefreshCw size={20} className="w-5 h-5" /> : <CreditCard size={20} />}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black mb-1 text-[#e5e5e5] group-hover:text-white transition-colors uppercase tracking-tight">{m.merchant || m.description}</h4>
                                            <div className="flex items-center space-x-3">
                                                <span className="text-[10px] px-2 py-0.5 bg-[#2a2a2f] text-[#a0a0a5] font-bold uppercase tracking-wider border border-[#3a3a3f]">{m.category}</span>
                                                <div className="flex items-center text-[10px] text-[#6a6a6f] font-bold uppercase whitespace-nowrap">
                                                    <Calendar size={10} className="mr-1" />
                                                    {m.date}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={cn(
                                            "text-sm font-black mb-1 font-outfit",
                                            m.type === 'ingreso' ? "text-emerald-500" : "text-[#e5e5e5]"
                                        )}>
                                            {m.type === 'ingreso' ? '+' : '-'}${Number(m.amount).toLocaleString()}
                                        </p>
                                        <p className="text-[10px] font-bold text-[#6a6a6f] uppercase tracking-widest">{m.currency}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-40 text-[#6a6a6f]">
                                <Receipt size={48} className="mb-4 opacity-20" />
                                <p className="text-sm font-medium">No hay movimientos recientes</p>
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
