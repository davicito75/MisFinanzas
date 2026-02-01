import React from 'react';
import { LayoutDashboard, Receipt, Table, Settings, LogOut, Menu, X, PlusCircle, RefreshCw, Trash2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for combining tailwind classes safely
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SidebarItemProps {
    icon: React.ElementType;
    label: string;
    active?: boolean;
    onClick: () => void;
}

const SidebarItem = ({ icon: Icon, label, active, onClick }: SidebarItemProps) => (
    <button
        onClick={onClick}
        className={cn(
            "w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200",
            active
                ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
        )}
    >
        <Icon size={20} />
        <span className="font-medium">{label}</span>
    </button>
);

interface LayoutProps {
    children: React.ReactNode;
    activeView: string;
    onViewChange: (view: any) => void;
    onSync: () => void;
    onAddManual: () => void;
    onClearData: () => void;
    onLogout: () => void;
    user: any;
    isSyncing: boolean;
}

export const AppLayout = ({ children, activeView, onViewChange, onSync, onAddManual, onClearData, onLogout, user, isSyncing }: LayoutProps) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const menuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'movements', icon: Table, label: 'Movimientos' },
        { id: 'subscriptions', icon: Receipt, label: 'Suscripciones' },
        { id: 'settings', icon: Settings, label: 'Configuración' },
    ];

    return (
        <div className="flex h-screen bg-[#0a0a0c] text-slate-100 overflow-hidden">
            {/* Sidebar Desktop - Hidden on mobile/tablet */}
            <aside className="hidden lg:flex flex-col w-64 border-r border-slate-800 bg-[#0e0e11] p-6">
                <div className="flex items-center space-x-3 mb-6 px-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <Receipt className="text-white" size={18} />
                    </div>
                    <span className="text-xl font-bold tracking-tight">FinGmail</span>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 mb-10 flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/10">
                        {user?.name?.[0] || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate text-slate-100">{user?.name || 'Usuario'}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">{user?.email || 'Local'}</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    <button
                        onClick={onAddManual}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-600/20 transition-all mb-4 group"
                    >
                        <PlusCircle size={20} className="group-hover:scale-110 transition-transform" />
                        <span className="font-semibold">Nuevo Registro</span>
                    </button>
                    {menuItems.map((item) => (
                        <SidebarItem
                            key={item.id}
                            icon={item.icon}
                            label={item.label}
                            active={activeView === item.id}
                            onClick={() => onViewChange(item.id)}
                        />
                    ))}
                </nav>

                <div className="mt-auto pt-6 border-t border-slate-800">
                    <button
                        disabled={isSyncing}
                        onClick={onSync}
                        className="w-full mb-4 flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 rounded-lg font-semibold transition-all shadow-lg shadow-indigo-600/20"
                    >
                        <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
                        <span>Sincronizar</span>
                    </button>
                    <button
                        onClick={onClearData}
                        className="w-full mb-4 flex items-center justify-center space-x-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg font-semibold transition-all"
                    >
                        <Trash2 size={16} />
                        <span>Limpiar Datos</span>
                    </button>
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-slate-500 hover:text-rose-400 transition-colors group"
                    >
                        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Mobile Header - Simplified */}
                <header className="lg:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-[#0e0e11]">
                    <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
                            <Receipt className="text-white" size={14} />
                        </div>
                        <span className="font-bold">FinGmail</span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(true)}>
                        <Menu className="text-slate-400" />
                    </button>
                </header>

                {/* View Content with bottom nav padding */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar relative main-content-with-bottom-nav">
                    <div className="max-w-7xl mx-auto h-full relative z-10">
                        {children}
                    </div>

                    {/* Ambient Elements */}
                    <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none -z-0" />
                    <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none -z-0" />
                    <div className="fixed top-[20%] left-[10%] w-[30%] h-[30%] bg-purple-600/5 blur-[100px] rounded-full pointer-events-none -z-0" />
                </div>
            </main>

            {/* Bottom Navigation - Mobile/Tablet Only */}
            <nav className="bottom-nav">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onViewChange(item.id)}
                        className={cn("bottom-nav-item", activeView === item.id && "active")}
                    >
                        <item.icon size={22} className="bottom-nav-icon" />
                        <span className="bottom-nav-label">{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden">
                    <aside className="w-80 h-full bg-[#0e0e11] p-6 shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
                        <div className="flex items-center justify-between mb-8 flex-shrink-0">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                                    <Receipt className="text-white" size={18} />
                                </div>
                                <span className="text-xl font-bold">FinGmail</span>
                            </div>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <X className="text-slate-400" size={24} />
                            </button>
                        </div>

                        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 mb-8 flex items-center space-x-3 flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center font-bold text-white text-lg">
                                {user?.name?.[0] || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-base font-bold truncate">{user?.name || 'Usuario'}</p>
                                <p className="text-xs text-slate-500 font-medium truncate">{user?.email || 'Local'}</p>
                            </div>
                        </div>

                        <nav className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
                            <button
                                onClick={() => {
                                    onAddManual();
                                    setIsMobileMenuOpen(false);
                                }}
                                className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 mb-4 text-base font-semibold"
                            >
                                <PlusCircle size={22} />
                                <span>Nuevo Registro</span>
                            </button>
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        onViewChange(item.id);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className={cn(
                                        "w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 text-base font-medium",
                                        activeView === item.id
                                            ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                                            : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                                    )}
                                >
                                    <item.icon size={22} />
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </nav>

                        <div className="mt-auto pt-6 border-t border-slate-800 space-y-3 flex-shrink-0">
                            <button
                                disabled={isSyncing}
                                onClick={onSync}
                                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 rounded-xl font-semibold transition-all text-base"
                            >
                                <RefreshCw className={cn("w-5 h-5", isSyncing && "animate-spin")} />
                                <span>Sincronizar</span>
                            </button>
                            <button
                                onClick={() => {
                                    onClearData();
                                    setIsMobileMenuOpen(false);
                                }}
                                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl font-semibold transition-all text-base"
                            >
                                <Trash2 size={18} />
                                <span>Limpiar Datos</span>
                            </button>
                            <button
                                onClick={() => {
                                    onLogout();
                                    setIsMobileMenuOpen(false);
                                }}
                                className="w-full flex items-center space-x-3 px-4 py-3 text-slate-500 hover:text-rose-400 transition-colors border border-transparent text-base font-medium"
                            >
                                <LogOut size={20} />
                                <span>Cerrar Sesión</span>
                            </button>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
};
