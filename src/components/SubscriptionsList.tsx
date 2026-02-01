import { Calendar, CreditCard, Bell, Plus, Receipt, Trash2, Pencil } from 'lucide-react';
import type { Subscription } from '../types';
import { cn } from './Layout';

interface SubscriptionsListProps {
    subscriptions: Subscription[];
    onEdit: (sub: Subscription) => void;
    onDelete: (id: string) => void;
    onAdd: () => void;
    onToggleReminder: (id: string) => void;
}

export const SubscriptionsList = ({ subscriptions, onEdit, onDelete, onAdd, onToggleReminder }: SubscriptionsListProps) => {
    const activeSubs = subscriptions.filter(s => s.active);
    const totalMonthly = activeSubs
        .filter(s => s.frequency === 'mensual')
        .reduce((acc, s) => acc + s.amount, 0);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Suscripciones</h1>
                    <p className="text-slate-400">Gestiona tus pagos recurrentes y evita cargos inesperados.</p>
                </div>
                <button
                    onClick={onAdd}
                    className="primary-button flex items-center space-x-2"
                >
                    <Plus size={18} />
                    <span>Nueva Suscripción</span>
                </button>
            </header>

            {/* Summary Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card bg-indigo-600/10 border-indigo-500/20">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-indigo-600 rounded-xl">
                            <Calendar className="text-white" size={24} />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm font-medium">Costo Mensual Estimado</p>
                            <h2 className="text-3xl font-bold">$ {totalMonthly.toLocaleString()}</h2>
                        </div>
                    </div>
                </div>
                <div className="glass-card bg-emerald-600/10 border-emerald-500/20">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-emerald-600 rounded-xl">
                            <CreditCard className="text-white" size={24} />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm font-medium">Suscripciones Activas</p>
                            <h2 className="text-3xl font-bold">{activeSubs.length}</h2>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Subscriptions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subscriptions.map((sub) => (
                    <div key={sub.id} className="glass-card flex flex-col justify-between group/card relative overflow-hidden">
                        {/* Status Glow Background */}
                        {sub.active && <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl rounded-full" />}

                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center font-bold text-indigo-400 border border-slate-700">
                                        {sub.name[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold mb-0 text-slate-100">{sub.name}</h3>
                                        <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                                            {sub.category}
                                        </span>
                                    </div>
                                </div>
                                <div className={cn(
                                    "w-3 h-3 rounded-full border-2",
                                    sub.active
                                        ? "bg-emerald-500 border-emerald-400/30 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                                        : "bg-slate-700 border-slate-600"
                                )} />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Monto {sub.frequency === 'mensual' ? 'Mensual' : 'Anual'}</p>
                                        <p className="text-2xl font-black text-slate-100">{sub.currency} {sub.amount.toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Cobro</p>
                                        <p className="text-slate-200 font-bold text-sm">
                                            {new Date(sub.nextBillingDate).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 mt-6 border-t border-slate-800/50 flex justify-between items-center">
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => onToggleReminder(sub.id)}
                                    className={cn(
                                        "p-2 rounded-lg transition-all",
                                        sub.remindersEnabled
                                            ? "text-indigo-400 bg-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.2)]"
                                            : "text-slate-500 hover:text-slate-400 hover:bg-slate-800"
                                    )}
                                    title={sub.remindersEnabled ? "Recordatorios activados" : "Activar recordatorios"}
                                >
                                    <Bell size={18} fill={sub.remindersEnabled ? "currentColor" : "none"} />
                                </button>
                                <button
                                    onClick={() => onEdit(sub)}
                                    className="p-2 text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all"
                                >
                                    <Pencil size={18} />
                                </button>
                            </div>
                            <button
                                onClick={() => onDelete(sub.id)}
                                className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                {subscriptions.length === 0 && (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-500">
                        <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 opacity-50">
                            <Receipt size={32} />
                        </div>
                        <p className="text-lg">No se detectaron suscripciones aún.</p>
                        <p className="text-sm opacity-60">Sincroniza tus correos para encontrar pagos recurrentes.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
