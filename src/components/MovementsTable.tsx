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
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold">Movimientos</h1>
                <div className="flex space-x-3">
                    <button className="secondary-button flex items-center space-x-2">
                        <Download size={18} />
                        <span>Exportar</span>
                    </button>
                </div>
            </header>

            {/* Filters Bar */}
            <div className="glass-card flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative group">
                    <div className="input-icon-wrapper !left-3">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por comercio o descripción..."
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2 input-with-icon pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/50 transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-3">
                    <select
                        className="bg-slate-900/50 border border-slate-700 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/50"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value as any)}
                    >
                        <option value="all">Todos los tipos</option>
                        <option value="gasto">Gastos</option>
                        <option value="ingreso">Ingresos</option>
                    </select>
                    <select
                        className="bg-slate-900/50 border border-slate-700 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/50"
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

            {/* Table Content */}
            <div className="glass-card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-800 bg-slate-900/30">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Comercio / Descripción</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Categoría</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Monto</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Estado</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {currentItems.map((m) => (
                                <tr key={m.id} className="hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                                        {m.date}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-slate-200">{m.merchant}</span>
                                            <span className="text-xs text-slate-500 max-w-[200px] truncate">{m.description}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400">
                                            {m.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={cn(
                                            "text-sm font-bold",
                                            m.type === 'ingreso' ? "text-emerald-500" : "text-slate-200"
                                        )}>
                                            {m.type === 'ingreso' ? '+' : '-'}{m.currency} {m.amount.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex justify-center">
                                            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800/50 text-xs font-medium text-slate-400 border border-slate-700/50">
                                                {getStatusIcon(m.status)}
                                                <span className="capitalize">{m.status.replace('_', ' ')}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => onUpdateStatus(m.id, 'confirmado')}
                                                className="p-1.5 rounded-md text-slate-500 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all opacity-0 group-hover:opacity-100"
                                                title="Confirmar"
                                            >
                                                <CheckCircle2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => onUpdateStatus(m.id, 'descartado')}
                                                className="p-1.5 rounded-md text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                                                title="Descartar"
                                            >
                                                <XCircle size={18} />
                                            </button>
                                            {m.emailId && (
                                                <a
                                                    href={`https://mail.google.com/mail/u/0/#inbox/${m.emailId}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 rounded-md text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all opacity-0 group-hover:opacity-100"
                                                    title="Ver en Gmail"
                                                >
                                                    <ExternalLink size={18} />
                                                </a>
                                            )}
                                            <button
                                                onClick={() => onEdit(m)}
                                                className="p-1.5 rounded-md text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all opacity-0 group-hover:opacity-100"
                                                title="Editar"
                                            >
                                                <PenSquare size={18} />
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
                    <div className="flex items-center justify-between px-6 py-4 bg-slate-900/30 border-t border-slate-800">
                        <span className="text-sm text-slate-500">
                            Mostrando {currentItems.length} de {filteredMovements.length} movimientos
                        </span>
                        <div className="flex space-x-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                className="p-2 rounded-lg bg-slate-800 text-slate-400 disabled:opacity-30"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                className="p-2 rounded-lg bg-slate-800 text-slate-400 disabled:opacity-30"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {currentItems.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-20 text-slate-500">
                        <Search size={48} className="mb-4 opacity-20" />
                        <p className="text-lg">No se encontraron movimientos con los filtros actuales</p>
                    </div>
                )}
            </div>
        </div>
    );
};
