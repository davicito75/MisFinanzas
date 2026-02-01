import { useState } from 'react';
import {
    Search,
    Download,
    CheckCircle2,
    XCircle,
    Clock,
    ExternalLink,
    ChevronLeft,
    ChevronRight,
    PenSquare
} from 'lucide-react';
import type { Movement, MovementStatus, MovementType } from '../types';
import { cn } from './Layout';

interface MovementsTableProps {
    movements: Movement[];
    onUpdateStatus: (id: string, status: MovementStatus) => void;
    onEdit: (movement: Movement) => void;
}

export const MovementsTable = ({ movements, onUpdateStatus, onEdit }: MovementsTableProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<MovementType | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<MovementStatus | 'all'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredMovements = movements.filter(m => {
        const matchesSearch =
            m.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || m.type === typeFilter;
        const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
    });

    const totalPages = Math.ceil(filteredMovements.length / itemsPerPage);
    const currentItems = filteredMovements.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getStatusIcon = (status: MovementStatus) => {
        switch (status) {
            case 'confirmado': return <CheckCircle2 className="text-emerald-500" size={16} />;
            case 'descartado': return <XCircle className="text-rose-500" size={16} />;
            default: return <Clock className="text-amber-500" size={16} />;
        }
    };

    return (
        <div className="space-y-4 md:space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                <h1 className="text-2xl md:text-3xl font-bold">Movimientos</h1>
                <div className="flex space-x-3">
                    <button className="secondary-button flex items-center space-x-2 text-sm">
                        <Download size={16} className="md:w-[18px] md:h-[18px]" />
                        <span>Exportar</span>
                    </button>
                </div>
            </header>

            {/* Filters Bar */}
            <div className="glass-card flex flex-col gap-3 md:gap-4 border border-[#3a3a3f] bg-[#1a1a1f] p-4">
                <div className="flex-1 relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a0a0a5]">
                        <Search size={16} className="md:w-[18px] md:h-[18px]" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por comercio o descripción..."
                        className="w-full bg-[#0a0a0c] border border-[#3a3a3f] py-2.5 md:py-2 pl-10 pr-4 text-[#e5e5e5] focus:outline-none focus:border-[#e5e5e5] transition-all font-medium text-sm md:text-base placeholder-[#6a6a6f]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <select
                        className="flex-1 bg-[#0a0a0c] border border-[#3a3a3f] py-2.5 md:py-2 px-3 md:px-4 text-[#e5e5e5] focus:outline-none focus:border-[#e5e5e5] text-sm md:text-base"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value as any)}
                    >
                        <option value="all">Todos los tipos</option>
                        <option value="gasto">Gastos</option>
                        <option value="ingreso">Ingresos</option>
                    </select>
                    <select
                        className="flex-1 bg-[#0a0a0c] border border-[#3a3a3f] py-2.5 md:py-2 px-3 md:px-4 text-[#e5e5e5] focus:outline-none focus:border-[#e5e5e5] text-sm md:text-base"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                    >
                        <option value="all">Todos los estados</option>
                        <option value="pendiente_confirmacion">Pendiente</option>
                        <option value="confirmado">Confirmado</option>
                        <option value="descartado">Descartado</option>
                    </select>
                </div>
            </div>


            {/* Desktop Table View - Hidden on Mobile */}
            <div className="hidden md:block glass-card p-0 overflow-hidden border border-[#3a3a3f]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[#3a3a3f] bg-[#1a1a1f]">
                                <th className="px-6 py-4 text-xs font-bold text-[#a0a0a5] uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#a0a0a5] uppercase tracking-wider">Comercio / Descripción</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#a0a0a5] uppercase tracking-wider">Categoría</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#a0a0a5] uppercase tracking-wider">Monto</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#a0a0a5] uppercase tracking-wider text-center">Estado</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#a0a0a5] uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#3a3a3f] bg-[#0a0a0c]">
                            {currentItems.map((m) => (
                                <tr key={m.id} className="hover:bg-[#1a1a1f] transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#a0a0a5]">
                                        {m.date}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-[#e5e5e5]">{m.merchant}</span>
                                            <span className="text-xs text-[#a0a0a5] max-w-[200px] truncate">{m.description}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-bold bg-[#1a1a1f] text-[#e5e5e5] border border-[#3a3a3f] uppercase tracking-wider">
                                            {m.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={cn(
                                            "font-bold font-outfit",
                                            m.type === 'ingreso' ? "text-emerald-500" : "text-[#e5e5e5]"
                                        )}>
                                            {m.type === 'ingreso' ? '+' : '-'}${Number(m.amount).toLocaleString()}
                                        </span>
                                        <span className="text-xs text-[#6a6a6f] ml-1 font-bold">{m.currency}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex justify-center">
                                            <div className="flex items-center space-x-1.5 px-2 py-0.5 text-xs font-bold text-[#a0a0a5] uppercase tracking-wider border border-[#3a3a3f] bg-[#1a1a1f]">
                                                {getStatusIcon(m.status)}
                                                <span className="capitalize">{m.status.replace('_', ' ')}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                        <div className="flex justify-end space-x-1">
                                            <button
                                                onClick={() => onUpdateStatus(m.id, 'confirmado')}
                                                className="p-1.5 text-[#a0a0a5] hover:text-emerald-500 hover:bg-[#1a1a1f] transition-all"
                                                title="Confirmar"
                                            >
                                                <CheckCircle2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => onUpdateStatus(m.id, 'descartado')}
                                                className="p-1.5 text-[#a0a0a5] hover:text-rose-500 hover:bg-[#1a1a1f] transition-all"
                                                title="Descartar"
                                            >
                                                <XCircle size={16} />
                                            </button>
                                            {m.emailId && (
                                                <a
                                                    href={`https://mail.google.com/mail/u/0/#inbox/${m.emailId}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 text-[#a0a0a5] hover:text-[#e5e5e5] hover:bg-[#1a1a1f] transition-all"
                                                    title="Ver en Gmail"
                                                >
                                                    <ExternalLink size={16} />
                                                </a>
                                            )}
                                            <button
                                                onClick={() => onEdit(m)}
                                                className="p-1.5 text-[#a0a0a5] hover:text-[#e5e5e5] hover:bg-[#1a1a1f] transition-all"
                                                title="Editar"
                                            >
                                                <PenSquare size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 md:px-6 py-3 md:py-4 bg-[#1a1a1f] border-t border-[#3a3a3f]">
                        <span className="text-xs md:text-sm text-[#a0a0a5]">
                            Mostrando {currentItems.length} de {filteredMovements.length} movimientos
                        </span>
                        <div className="flex space-x-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                className="p-2 border border-[#3a3a3f] hover:bg-[#2a2a2f] text-[#e5e5e5] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                className="p-2 border border-[#3a3a3f] hover:bg-[#2a2a2f] text-[#e5e5e5] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Card View - Hidden on Desktop */}
            <div className="md:hidden space-y-3">
                {currentItems.map((m) => (
                    <div key={m.id} className="glass-card border border-[#3a3a3f] bg-[#1a1a1f] p-4">
                        {/* Header: Merchant & Amount */}
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-bold text-[#e5e5e5] truncate">{m.merchant}</h3>
                                <p className="text-xs text-[#a0a0a5] truncate mt-0.5">{m.description}</p>
                            </div>
                            <div className="ml-3 text-right flex-shrink-0">
                                <div className={cn(
                                    "text-lg font-black font-outfit",
                                    m.type === 'ingreso' ? "text-emerald-500" : "text-[#e5e5e5]"
                                )}>
                                    {m.type === 'ingreso' ? '+' : '-'}${Number(m.amount).toLocaleString()}
                                </div>
                                <div className="text-[10px] font-bold text-[#6a6a6f] uppercase tracking-widest">{m.currency}</div>
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-3 border-t border-[#3a3a3f] border-b py-3 font-mono text-xs">
                            <div>
                                <p className="text-[10px] font-bold text-[#6a6a6f] uppercase tracking-wider mb-1">Fecha</p>
                                <p className="text-[#e5e5e5] font-medium">{m.date}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-[#6a6a6f] uppercase tracking-wider mb-1">Categoría</p>
                                <span className="inline-block px-1.5 py-0.5 bg-[#0a0a0c] border border-[#3a3a3f] text-[#e5e5e5] text-[10px] uppercase font-bold tracking-wider">
                                    {m.category}
                                </span>
                            </div>
                        </div>

                        {/* Status Badge */}
                        <div className="mb-3">
                            <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 text-xs font-bold text-[#a0a0a5] uppercase tracking-wider border border-[#3a3a3f] bg-[#0a0a0c]">
                                {getStatusIcon(m.status)}
                                <span className="capitalize">{m.status.replace('_', ' ')}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex border-t border-[#3a3a3f] divide-x divide-[#3a3a3f]">
                            <button
                                onClick={() => onUpdateStatus(m.id, 'confirmado')}
                                className="flex-1 flex items-center justify-center space-x-2 py-3 bg-[#1a1a1f] hover:bg-[#2a2a2f] text-emerald-500 transition-all text-xs font-bold uppercase tracking-wider active:bg-[#0a0a0c]"
                            >
                                <CheckCircle2 size={16} />
                                <span>Confirmar</span>
                            </button>
                            <button
                                onClick={() => onUpdateStatus(m.id, 'descartado')}
                                className="flex-1 flex items-center justify-center space-x-2 py-3 bg-[#1a1a1f] hover:bg-[#2a2a2f] text-rose-500 transition-all text-xs font-bold uppercase tracking-wider active:bg-[#0a0a0c]"
                            >
                                <XCircle size={16} />
                                <span>Descartar</span>
                            </button>
                            <button
                                onClick={() => onEdit(m)}
                                className="px-4 py-3 bg-[#1a1a1f] hover:bg-[#2a2a2f] text-[#a0a0a5] transition-all active:bg-[#0a0a0c]"
                                title="Editar"
                            >
                                <PenSquare size={16} />
                            </button>
                            {m.emailId && (
                                <a
                                    href={`https://mail.google.com/mail/u/0/#inbox/${m.emailId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-3 bg-[#1a1a1f] hover:bg-[#2a2a2f] text-[#a0a0a5] transition-all active:bg-[#0a0a0c]"
                                    title="Ver en Gmail"
                                >
                                    <ExternalLink size={16} />
                                </a>
                            )}
                        </div>
                    </div>
                ))}

                {/* Mobile Pagination */}
                {totalPages > 1 && (
                    <div className="flex flex-col items-center gap-3 pt-4">
                        <span className="text-xs text-slate-500">
                            Mostrando {currentItems.length} de {filteredMovements.length} movimientos
                        </span>
                        <div className="flex space-x-3">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed touch-target-sm font-medium"
                            >
                                <ChevronLeft size={18} />
                                <span>Anterior</span>
                            </button>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed touch-target-sm font-medium"
                            >
                                <span>Siguiente</span>
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Empty State */}
            {currentItems.length === 0 && (
                <div className="flex flex-col items-center justify-center p-20 text-slate-500">
                    <Search size={48} className="mb-4 opacity-20" />
                    <p className="text-lg">No se encontraron movimientos con los filtros actuales</p>
                </div>
            )}
        </div>
    );
};
