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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="glass-card w-full max-w-lg animate-in fade-in zoom-in duration-200 border border-[#3a3a3f] bg-[#0a0a0c] p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black font-outfit text-[#e5e5e5]">
                        {initialData ? 'Editar Movimiento' : 'Nuevo Movimiento Manual'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-[#1a1a1f] transition-colors text-[#e5e5e5]">
                        <X size={20} className="text-[#a0a0a5]" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#6a6a6f] uppercase tracking-widest">Fecha</label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a0a0a5]">
                                    <Calendar size={16} />
                                </div>
                                <input
                                    type="date"
                                    required
                                    className="w-full bg-[#1a1a1f] border border-[#3a3a3f] py-2.5 pl-10 pr-3 text-[#e5e5e5] focus:outline-none focus:border-[#e5e5e5] transition-all font-medium text-sm"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#6a6a6f] uppercase tracking-widest">Tipo</label>
                            <select
                                className="w-full bg-[#1a1a1f] border border-[#3a3a3f] py-2.5 px-3 text-[#e5e5e5] focus:outline-none focus:border-[#e5e5e5] transition-all font-medium text-sm"
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
                            <label className="text-xs font-bold text-[#6a6a6f] uppercase tracking-widest">Moneda</label>
                            <select
                                className="w-full bg-[#1a1a1f] border border-[#3a3a3f] py-2.5 px-3 text-[#e5e5e5] focus:outline-none focus:border-[#e5e5e5] transition-all font-medium text-sm"
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
                        <label className="text-xs font-bold text-[#6a6a6f] uppercase tracking-widest">Comercio / Origen</label>
                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a0a0a5]">
                                <ShoppingBag size={16} />
                            </div>
                            <input
                                type="text"
                                required
                                placeholder="Ej: Starbucks, Enel, Sueldo..."
                                className="w-full bg-[#1a1a1f] border border-[#3a3a3f] py-2.5 pl-10 pr-3 text-[#e5e5e5] focus:outline-none focus:border-[#e5e5e5] transition-all font-medium text-sm placeholder-[#6a6a6f]"
                                value={formData.merchant}
                                onChange={e => setFormData({ ...formData, merchant: e.target.value })}
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
                        <label className="text-xs font-bold text-[#6a6a6f] uppercase tracking-widest">Descripción (Opcional)</label>
                        <div className="relative group">
                            <div className="absolute left-3 top-4 text-[#a0a0a5]">
                                <Type size={16} />
                            </div>
                            <textarea
                                className="w-full bg-[#1a1a1f] border border-[#3a3a3f] py-2.5 pl-10 pr-3 text-[#e5e5e5] focus:outline-none focus:border-[#e5e5e5] transition-all font-medium text-sm"
                                rows={2}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-[#3a3a3f] mt-6">
                        {initialData && onDelete && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (confirm('¿Estás seguro de eliminar este movimiento?')) {
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
                                <span>{initialData ? 'Guardar Cambios' : 'Crear Movimiento'}</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
