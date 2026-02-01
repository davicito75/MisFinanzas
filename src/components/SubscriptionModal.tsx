import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Calendar, CreditCard, Tag, ShoppingBag } from 'lucide-react';
import type { Subscription, Frequency } from '../types';

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (subscription: Subscription) => void;
    onDelete?: (id: string) => void;
    initialData?: Subscription;
}

export const SubscriptionModal = ({ isOpen, onClose, onSave, onDelete, initialData }: SubscriptionModalProps) => {
    const [formData, setFormData] = useState<Partial<Subscription>>({
        name: '',
        amount: 0,
        currency: 'CLP',
        frequency: 'mensual',
        nextBillingDate: new Date().toISOString().split('T')[0],
        category: 'Suscripciones',
        active: true,
        remindersEnabled: false
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                remindersEnabled: !!initialData.remindersEnabled
            });
        } else {
            setFormData({
                name: '',
                amount: 0,
                currency: 'CLP',
                frequency: 'mensual',
                nextBillingDate: new Date().toISOString().split('T')[0],
                category: 'Suscripciones',
                active: true,
                remindersEnabled: false
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            id: initialData?.id || `sub-${crypto.randomUUID()}`,
        } as Subscription);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="glass-card w-full max-w-lg animate-in fade-in zoom-in duration-200 border border-[#3a3a3f] bg-[#0a0a0c] p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black font-outfit text-[#e5e5e5]">
                        {initialData ? 'Editar Suscripción' : 'Nueva Suscripción'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-[#1a1a1f] transition-colors text-[#e5e5e5]">
                        <X size={20} className="text-[#a0a0a5]" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#6a6a6f] uppercase tracking-widest">Nombre del Servicio</label>
                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a0a0a5]">
                                <ShoppingBag size={16} />
                            </div>
                            <input
                                type="text"
                                required
                                placeholder="Ej: Netflix, Spotify, iCloud..."
                                className="w-full bg-[#1a1a1f] border border-[#3a3a3f] py-2.5 pl-10 pr-3 text-[#e5e5e5] focus:outline-none focus:border-[#e5e5e5] transition-all font-medium text-sm placeholder-[#6a6a6f]"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#6a6a6f] uppercase tracking-widest">Monto</label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a0a0a5]">
                                    <CreditCard size={16} />
                                </div>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    className="w-full bg-[#1a1a1f] border border-[#3a3a3f] py-2.5 pl-10 pr-3 text-[#e5e5e5] focus:outline-none focus:border-[#e5e5e5] transition-all font-medium text-sm"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#6a6a6f] uppercase tracking-widest">Frecuencia</label>
                            <select
                                className="w-full bg-[#1a1a1f] border border-[#3a3a3f] py-2.5 px-3 text-[#e5e5e5] focus:outline-none focus:border-[#e5e5e5] transition-all font-medium text-sm"
                                value={formData.frequency}
                                onChange={e => setFormData({ ...formData, frequency: e.target.value as Frequency })}
                            >
                                <option value="mensual">Mensual</option>
                                <option value="anual">Anual</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#6a6a6f] uppercase tracking-widest">Próximo Cobro</label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a0a0a5]">
                                    <Calendar size={16} />
                                </div>
                                <input
                                    type="date"
                                    required
                                    className="w-full bg-[#1a1a1f] border border-[#3a3a3f] py-2.5 pl-10 pr-3 text-[#e5e5e5] focus:outline-none focus:border-[#e5e5e5] transition-all font-medium text-sm"
                                    value={formData.nextBillingDate}
                                    onChange={e => setFormData({ ...formData, nextBillingDate: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#6a6a6f] uppercase tracking-widest">Categoría</label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a0a0a5]">
                                    <Tag size={16} />
                                </div>
                                <select
                                    className="w-full bg-[#1a1a1f] border border-[#3a3a3f] py-2.5 pl-10 pr-3 text-[#e5e5e5] focus:outline-none focus:border-[#e5e5e5] transition-all font-medium text-sm appearance-none"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="Suscripciones">Suscripciones</option>
                                    <option value="Servicios">Servicios</option>
                                    <option value="Otros">Otros</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 pt-2">
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="active"
                                className="w-4 h-4 rounded-none border border-[#3a3a3f] bg-[#1a1a1f] text-emerald-500 focus:ring-offset-0 focus:ring-0"
                                checked={formData.active}
                                onChange={e => setFormData({ ...formData, active: e.target.checked })}
                            />
                            <label htmlFor="active" className="text-sm font-medium text-[#a0a0a5]">Suscripción activa</label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="reminders"
                                className="w-4 h-4 rounded-none border border-[#3a3a3f] bg-[#1a1a1f] text-indigo-500 focus:ring-offset-0 focus:ring-0"
                                checked={!!formData.remindersEnabled}
                                onChange={e => setFormData({ ...formData, remindersEnabled: e.target.checked })}
                            />
                            <label htmlFor="reminders" className="text-sm font-medium text-[#a0a0a5]">Recordatorios</label>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-[#3a3a3f] mt-6 gap-3">
                        {initialData && onDelete && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (confirm('¿Estás seguro de eliminar esta suscripción?')) {
                                        onDelete(initialData.id);
                                        onClose();
                                    }
                                }}
                                className="flex items-center space-x-2 px-4 py-2 bg-[#1a1a1f] text-rose-500 hover:bg-[#2a2a2f] transition-colors border border-[#3a3a3f] font-bold text-xs uppercase tracking-wider"
                            >
                                <Trash2 size={16} />
                                <span>Eliminar</span>
                            </button>
                        )}
                        <div className="flex gap-3 ml-auto">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 bg-transparent border border-[#3a3a3f] text-[#e5e5e5] hover:bg-[#1a1a1f] transition-colors font-bold text-xs uppercase tracking-wider"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="flex items-center space-x-2 px-5 py-2.5 bg-[#e5e5e5] text-[#0a0a0c] hover:bg-white transition-colors font-bold text-xs uppercase tracking-wider"
                            >
                                <Save size={16} />
                                <span>{initialData ? 'Guardar Cambios' : 'Crear Suscripción'}</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
