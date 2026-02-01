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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass-card w-full max-w-lg animate-in fade-in zoom-in duration-200 shadow-2xl border-indigo-500/20">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold gradient-text">
                        {initialData ? 'Editar Suscripción' : 'Nueva Suscripción'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Nombre del Servicio</label>
                        <div className="relative group">
                            <div className="input-icon-wrapper !left-3">
                                <ShoppingBag size={16} />
                            </div>
                            <input
                                type="text"
                                required
                                placeholder="Ej: Netflix, Spotify, iCloud..."
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2 input-with-icon pr-3 text-slate-200 focus:ring-2 focus:ring-indigo-500/50 font-medium"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Monto</label>
                            <div className="relative group">
                                <div className="input-icon-wrapper !left-3">
                                    <CreditCard size={16} />
                                </div>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2 input-with-icon pr-3 text-slate-200 focus:ring-2 focus:ring-indigo-500/50 font-medium"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Frecuencia</label>
                            <select
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2 px-3 text-slate-200 focus:ring-2 focus:ring-indigo-500/50 font-medium appearance-none"
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
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Próximo Cobro</label>
                            <div className="relative group">
                                <div className="input-icon-wrapper !left-3">
                                    <Calendar size={16} />
                                </div>
                                <input
                                    type="date"
                                    required
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2 input-with-icon pr-3 text-slate-200 focus:ring-2 focus:ring-indigo-500/50 font-medium"
                                    value={formData.nextBillingDate}
                                    onChange={e => setFormData({ ...formData, nextBillingDate: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Categoría</label>
                            <div className="relative group">
                                <div className="input-icon-wrapper !left-3">
                                    <Tag size={16} />
                                </div>
                                <select
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2 input-with-icon pr-3 text-slate-200 focus:ring-2 focus:ring-indigo-500/50 font-medium appearance-none"
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
                                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500/50"
                                checked={formData.active}
                                onChange={e => setFormData({ ...formData, active: e.target.checked })}
                            />
                            <label htmlFor="active" className="text-sm font-medium text-slate-300">Suscripción activa</label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="reminders"
                                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500/50"
                                checked={!!formData.remindersEnabled}
                                onChange={e => setFormData({ ...formData, remindersEnabled: e.target.checked })}
                            />
                            <label htmlFor="reminders" className="text-sm font-medium text-slate-300">Recordatorios</label>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 gap-3">
                        {initialData && onDelete && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (confirm('¿Estás seguro de eliminar esta suscripción?')) {
                                        onDelete(initialData.id);
                                        onClose();
                                    }
                                }}
                                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors border border-rose-500/20"
                            >
                                <Trash2 size={18} />
                                <span>Eliminar</span>
                            </button>
                        )}
                        <div className="flex gap-3 ml-auto">
                            <button
                                type="button"
                                onClick={onClose}
                                className="secondary-button"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="primary-button flex items-center space-x-2"
                            >
                                <Save size={18} />
                                <span>{initialData ? 'Guardar Cambios' : 'Crear Suscripción'}</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
