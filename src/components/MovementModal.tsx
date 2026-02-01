import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Calendar, Tag, CreditCard, ShoppingBag, Type } from 'lucide-react';
import type { Movement, MovementType } from '../types';

interface MovementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (movement: Movement) => void;
    onDelete?: (id: string) => void;
    initialData?: Movement;
}

export const MovementModal = ({ isOpen, onClose, onSave, onDelete, initialData }: MovementModalProps) => {
    const [formData, setFormData] = useState<Partial<Movement>>({
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        currency: 'CLP',
        type: 'gasto',
        category: 'Otros',
        merchant: '',
        description: '',
        status: 'confirmado',
        source: 'manual'
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                date: new Date().toISOString().split('T')[0],
                amount: 0,
                currency: 'CLP',
                type: 'gasto',
                category: 'Otros',
                merchant: '',
                description: '',
                status: 'confirmado',
                source: 'manual'
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            id: initialData?.id || crypto.randomUUID(),
            confidenceScore: initialData?.confidenceScore || 1.0,
        } as Movement);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass-card w-full max-w-lg animate-in fade-in zoom-in duration-200 shadow-2xl border-indigo-500/20">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold gradient-text">
                        {initialData ? 'Editar Movimiento' : 'Nuevo Movimiento Manual'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Fecha</label>
                            <div className="relative group">
                                <div className="input-icon-wrapper !left-3">
                                    <Calendar size={16} />
                                </div>
                                <input
                                    type="date"
                                    required
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2 input-with-icon pr-3 text-slate-200 focus:ring-2 focus:ring-indigo-500/50 font-medium"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Tipo</label>
                            <select
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2 px-3 text-slate-200 focus:ring-2 focus:ring-indigo-500/50"
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value as MovementType })}
                            >
                                <option value="gasto">Gasto</option>
                                <option value="ingreso">Ingreso</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Monto</label>
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
                            <label className="text-xs font-semibold text-slate-500 uppercase">Moneda</label>
                            <select
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2 px-3 text-slate-200 focus:ring-2 focus:ring-indigo-500/50"
                                value={formData.currency}
                                onChange={e => setFormData({ ...formData, currency: e.target.value })}
                            >
                                <option value="CLP">CLP</option>
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Comercio / Origen</label>
                        <div className="relative group">
                            <div className="input-icon-wrapper !left-3">
                                <ShoppingBag size={16} />
                            </div>
                            <input
                                type="text"
                                required
                                placeholder="Ej: Starbucks, Enel, Sueldo..."
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2 input-with-icon pr-3 text-slate-200 focus:ring-2 focus:ring-indigo-500/50 font-medium"
                                value={formData.merchant}
                                onChange={e => setFormData({ ...formData, merchant: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Categoría</label>
                        <div className="relative group">
                            <div className="input-icon-wrapper !left-3">
                                <Tag size={16} />
                            </div>
                            <select
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2 input-with-icon pr-3 text-slate-200 focus:ring-2 focus:ring-indigo-500/50 font-medium appearance-none"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="Servicios">Servicios</option>
                                <option value="Suscripciones">Suscripciones</option>
                                <option value="Alimentación">Alimentación</option>
                                <option value="Transporte">Transporte</option>
                                <option value="Finanzas">Finanzas</option>
                                <option value="Compras">Compras</option>
                                <option value="Otros">Otros</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Descripción (Opcional)</label>
                        <div className="relative group">
                            <div className="input-icon-wrapper !top-5 !left-3">
                                <Type size={16} />
                            </div>
                            <textarea
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2 input-with-icon pr-3 text-slate-200 focus:ring-2 focus:ring-indigo-500/50 font-medium"
                                rows={2}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 gap-3">
                        {initialData && onDelete && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (confirm('¿Estás seguro de eliminar este movimiento?')) {
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
                                <span>{initialData ? 'Guardar Cambios' : 'Crear Movimiento'}</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
