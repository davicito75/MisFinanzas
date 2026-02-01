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
            "w-full flex items-center space-x-3 px-4 py-3 border border-transparent transition-all duration-200",
            active
                ? "bg-[#2a2a2f] text-[#e5e5e5] border-[#3a3a3f]"
                : "text-[#a0a0a5] hover:bg-[#1a1a1f] hover:text-[#e5e5e5] hover:border-[#3a3a3f]"
        )}
    >
        <Icon size={18} />
        <span className="font-medium text-sm">{label}</span>
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
        <div className="flex h-screen bg-[#0a0a0c] text-[#e5e5e5] overflow-hidden">
            {/* Sidebar Desktop - Hidden on mobile/tablet */}
            <aside className="hidden lg:flex flex-col w-64 border-r border-[#3a3a3f] bg-[#1a1a1f] p-0">
                <div className="flex items-center space-x-3 h-16 px-6 border-b border-[#3a3a3f]">
                    <div className="w-8 h-8 bg-[#2a2a2f] border border-[#3a3a3f] flex items-center justify-center">
                        <Receipt className="text-[#e5e5e5]" size={16} />
                    </div>
                    <span className="text-lg font-bold tracking-tight">Mis Finanzas</span>
                </div>

                <div className="p-6">
                    <div className="bg-[#2a2a2f] border border-[#3a3a3f] p-4 mb-6 flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#1a1a1f] border border-[#3a3a3f] flex items-center justify-center font-bold text-[#e5e5e5]">
                            {user?.name?.[0] || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate text-[#e5e5e5]">{user?.name || 'Usuario'}</p>
                            <p className="text-[10px] text-[#a0a0a5] font-bold uppercase tracking-widest truncate">{user?.email || 'Local'}</p>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        <button
                            onClick={onAddManual}
                            className="w-full flex items-center space-x-3 px-4 py-3 bg-[#e5e5e5] text-[#0a0a0c] hover:bg-white transition-all mb-6 font-bold text-sm"
                        >
                            <PlusCircle size={18} />
                            <span>Nuevo Registro</span>
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
                </div>

                <div className="mt-auto p-6 border-t border-[#3a3a3f] bg-[#0a0a0c]">
                    <button
                        disabled={isSyncing}
                        onClick={onSync}
                        className="w-full mb-3 flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#2a2a2f] hover:bg-[#3a3a3f] border border-[#3a3a3f] disabled:opacity-50 text-[#e5e5e5] font-semibold transition-all text-sm"
                    >
                        <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
                        <span>Sincronizar</span>
                    </button>
                    <button
                        onClick={onClearData}
                        className="w-full mb-3 flex items-center justify-center space-x-2 px-4 py-2.5 bg-transparent hover:bg-[#2a2a2f] text-[#a0a0a5] border border-[#3a3a3f] font-semibold transition-all text-sm"
                    >
                        <Trash2 size={16} />
                        <span>Limpiar Datos</span>
                    </button>
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-[#6a6a6f] hover:text-[#e5e5e5] transition-colors text-sm font-medium"
                    >
                        <LogOut size={16} />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Mobile Header - Simplified */}
                <header className="lg:hidden flex items-center justify-between p-4 border-b border-[#3a3a3f] bg-[#1a1a1f]">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-[#2a2a2f] border border-[#3a3a3f] flex items-center justify-center">
                            <Receipt className="text-[#a0a0a5]" size={16} />
                        </div>
                        <span className="font-semibold text-[#e5e5e5]">Mis Finanzas</span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(true)}>
                        <Menu className="text-[#a0a0a5]" />
                    </button>
                </header>

                {/* View Content with bottom nav padding */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar relative main-content-with-bottom-nav">
                    <div className="max-w-7xl mx-auto h-full relative z-10">
                        {children}
                    </div>
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
                <div className="fixed inset-0 z-50 bg-black/80 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
                    <aside
                        className="w-72 h-full bg-[#1a1a1f] border-r border-[#3a3a3f] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="border-b border-[#3a3a3f] p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-[#2a2a2f] border border-[#3a3a3f] flex items-center justify-center">
                                        <Receipt className="text-[#a0a0a5]" size={16} />
                                    </div>
                                    <span className="text-base font-semibold text-[#e5e5e5]">Mis Finanzas</span>
                                </div>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 hover:bg-[#2a2a2f] transition-colors"
                                >
                                    <X className="text-[#a0a0a5]" size={20} />
                                </button>
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="border-b border-[#3a3a3f] p-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-[#2a2a2f] border border-[#3a3a3f] flex items-center justify-center font-semibold text-[#a0a0a5] text-sm">
                                    {user?.name?.[0] || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-[#e5e5e5] truncate">{user?.name || 'Usuario'}</p>
                                    <p className="text-xs text-[#6a6a6f] truncate">{user?.email || 'Local'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-1">
                            {/* Primary Action */}
                            <button
                                onClick={() => {
                                    onAddManual();
                                    setIsMobileMenuOpen(false);
                                }}
                                className="w-full flex items-center space-x-3 px-3 h-10 bg-[#2a2a2f] hover:bg-[#3a3a3f] text-[#e5e5e5] transition-colors font-medium text-sm border border-[#3a3a3f]"
                            >
                                <PlusCircle size={18} />
                                <span>Nuevo Registro</span>
                            </button>

                            {/* Divider */}
                            <div className="h-px bg-[#3a3a3f] my-2"></div>

                            {/* Menu Items */}
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        onViewChange(item.id);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className={cn(
                                        "w-full flex items-center space-x-3 px-3 h-10 transition-colors font-medium text-sm",
                                        activeView === item.id
                                            ? "bg-[#2a2a2f] text-[#e5e5e5] border border-[#3a3a3f]"
                                            : "text-[#a0a0a5] hover:bg-[#2a2a2f] hover:text-[#e5e5e5]"
                                    )}
                                >
                                    <item.icon size={18} />
                                    <span className="flex-1 text-left">{item.label}</span>
                                    {activeView === item.id && (
                                        <div className="w-1 h-1 bg-[#a0a0a5]"></div>
                                    )}
                                </button>
                            ))}

                            {/* Divider */}
                            <div className="h-px bg-[#3a3a3f] my-2"></div>

                            {/* Actions */}
                            <button
                                disabled={isSyncing}
                                onClick={onSync}
                                className="w-full flex items-center space-x-3 px-3 h-10 bg-[#2a2a2f] hover:bg-[#3a3a3f] disabled:bg-[#1a1a1f] disabled:text-[#6a6a6f] text-[#e5e5e5] transition-colors font-medium text-sm border border-[#3a3a3f]"
                            >
                                <RefreshCw className={cn("w-[18px] h-[18px]", isSyncing && "animate-spin")} />
                                <span>Sincronizar</span>
                            </button>

                            <button
                                onClick={() => {
                                    onClearData();
                                    setIsMobileMenuOpen(false);
                                }}
                                className="w-full flex items-center space-x-3 px-3 h-10 text-[#a0a0a5] hover:bg-[#2a2a2f] hover:text-[#e5e5e5] transition-colors font-medium text-sm"
                            >
                                <Trash2 size={18} />
                                <span>Limpiar Datos</span>
                            </button>

                            <button
                                onClick={() => {
                                    onLogout();
                                    setIsMobileMenuOpen(false);
                                }}
                                className="w-full flex items-center space-x-3 px-3 h-10 text-[#a0a0a5] hover:bg-[#2a2a2f] hover:text-[#e5e5e5] transition-colors font-medium text-sm"
                            >
                                <LogOut size={18} />
                                <span>Cerrar Sesión</span>
                            </button>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
};
