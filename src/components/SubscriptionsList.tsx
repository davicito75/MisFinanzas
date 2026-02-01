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
        <div className="space-y-6 md:space-y-8 animate-fade-in text-[#e5e5e5]">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black font-outfit">Suscripciones</h1>
                    <p className="text-[#a0a0a5] text-sm md:text-base">Gestiona tus pagos recurrentes y evita cargos inesperados.</p>
                </div>
                <button
                    onClick={onAdd}
                    className="primary-button flex items-center space-x-2 text-sm md:text-base rounded-none bg-[#e5e5e5] text-[#0a0a0c] hover:bg-white border-0"
                >
                    <Plus size={18} />
                    <span>Nueva Suscripción</span>
                </button>
            </header>

            {/* Summary Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <div className="glass-card bg-[#1a1a1f] border border-[#3a3a3f] p-4 text-[#e5e5e5]">
                    <div className="flex items-center space-x-3 md:space-x-4">
                        <div className="p-2.5 md:p-3 bg-[#e5e5e5] text-[#0a0a0c]">
                            <Calendar className="md:w-6 md:h-6" size={20} />
                        </div>
                        <div>
                            <p className="text-[#a0a0a5] text-xs md:text-sm font-medium">Costo Mensual Estimado</p>
                            <h2 className="text-2xl md:text-3xl font-black font-outfit text-[#e5e5e5]">$ {totalMonthly.toLocaleString()}</h2>
                        </div>
                    </div>
                </div>
                <div className="glass-card bg-[#1a1a1f] border border-[#3a3a3f] p-4 text-[#e5e5e5]">
                    <div className="flex items-center space-x-3 md:space-x-4">
                        <div className="p-2.5 md:p-3 bg-[#e5e5e5] text-[#0a0a0c]">
                            <CreditCard className="md:w-6 md:h-6" size={20} />
                        </div>
                        <div>
                            <p className="text-[#a0a0a5] text-xs md:text-sm font-medium">Suscripciones Activas</p>
                            <h2 className="text-2xl md:text-3xl font-black font-outfit text-[#e5e5e5]">{activeSubs.length}</h2>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Subscriptions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {subscriptions.map((sub) => (
                    <div key={sub.id} className="glass-card flex flex-col justify-between group/card relative overflow-hidden bg-[#1a1a1f] border border-[#3a3a3f] hover:border-[#6a6a6f] transition-all p-6">
                        {/* Status Glow Background - REMOVED for cleaner look */}

                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-[#2a2a2f] flex items-center justify-center font-bold text-[#e5e5e5] border border-[#3a3a3f]">
                                        {sub.name[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black font-outfit mb-0 text-[#e5e5e5]">{sub.name}</h3>
                                        <span className="text-[10px] text-[#6a6a6f] font-black uppercase tracking-widest px-2 py-0.5 bg-[#0a0a0c] border border-[#3a3a3f]">
                                            {sub.category}
                                        </span>
                                    </div>
                                </div>
                                <div className={cn(
                                    "w-3 h-3 border-2 border-[#1a1a1f]",
                                    sub.active
                                        ? "bg-emerald-500 shadow-sm"
                                        : "bg-[#3a3a3f]"
                                )} />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] text-[#6a6a6f] uppercase font-black tracking-widest mb-1">Monto {sub.frequency === 'mensual' ? 'Mensual' : 'Anual'}</p>
                                        <p className="text-2xl font-black text-[#e5e5e5] font-outfit">{sub.currency} {sub.amount.toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-[#6a6a6f] uppercase font-black tracking-widest mb-1">Cobro</p>
                                        <p className="text-[#a0a0a5] font-bold text-sm">
                                            {new Date(sub.nextBillingDate).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 mt-6 border-t border-[#3a3a3f] flex justify-between items-center">
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => onToggleReminder(sub.id)}
                                    className={cn(
                                        "p-2 transition-all hover:bg-[#2a2a2f]",
                                        sub.remindersEnabled
                                            ? "text-[#e5e5e5] bg-[#3a3a3f]"
                                            : "text-[#a0a0a5] hover:text-[#e5e5e5]"
                                    )}
                                    title={sub.remindersEnabled ? "Recordatorios activados" : "Activar recordatorios"}
                                >
                                    <Bell size={18} fill={sub.remindersEnabled ? "currentColor" : "none"} />
                                </button>
                                <button
                                    onClick={() => onEdit(sub)}
                                    className="p-2 text-[#a0a0a5] hover:text-[#e5e5e5] hover:bg-[#2a2a2f] transition-all"
                                >
                                    <Pencil size={18} />
                                </button>
                            </div>
                            <button
                                onClick={() => onDelete(sub.id)}
                                className="p-2 text-[#a0a0a5] hover:text-rose-500 hover:bg-[#2a2a2f] transition-all"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                {subscriptions.length === 0 && (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-[#6a6a6f]">
                        <div className="w-16 h-16 bg-[#1a1a1f] flex items-center justify-center mb-4 opacity-50 border border-[#3a3a3f]">
                            <Receipt size={32} />
                        </div>
                        <p className="text-lg font-bold">No se detectaron suscripciones aún.</p>
                        <p className="text-sm opacity-60">Sincroniza tus correos para encontrar pagos recurrentes.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
