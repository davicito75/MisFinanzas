import React, { useRef } from 'react';
import { User, Mail, Globe, Database, Download, Upload, Trash2, Shield, Settings as SettingsIcon, AlertTriangle } from 'lucide-react';
import type { AppState, UserProfile } from '../types';

interface SettingsViewProps {
    user: UserProfile | null;
    state: AppState;
    onImportData: (data: Partial<AppState>) => void;
    onClearData: () => void;
    onUpdateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

export const SettingsView = ({ user, state, onImportData, onClearData, onUpdateProfile }: SettingsViewProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSaving, setIsSaving] = React.useState(false);

    const [formData, setFormData] = React.useState({
        name: user?.name || '',
        email: user?.email || '',
        currency: user?.settings?.currency || 'CLP',
        timezone: user?.settings?.timezone || 'America/Santiago'
    });

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onUpdateProfile({
                name: formData.name,
                email: formData.email,
                settings: {
                    currency: formData.currency,
                    timezone: formData.timezone
                }
            });
            alert("Perfil actualizado correctamente.");
        } catch (err) {
            alert("Error al actualizar el perfil.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleExport = () => {
        const dataStr = JSON.stringify(state, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = `fingmail_backup_${new Date().toISOString().split('T')[0]}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                if (window.confirm("¿ESTÁS SEGURO? Importar datos sobrescribirá tu estado actual.")) {
                    onImportData(json);
                }
            } catch (err) {
                alert("Error al parsear el archivo JSON.");
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header>
                <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <SettingsIcon className="text-indigo-400" size={24} />
                    </div>
                    <h1 className="text-3xl font-bold">Configuración</h1>
                </div>
                <p className="text-slate-400">Personaliza tu experiencia y gestiona tus datos locales.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Section */}
                <div className="lg:col-span-2 space-y-6">
                    <section className="glass-card">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <User className="text-indigo-400" size={20} />
                                <h2 className="text-xl font-bold uppercase tracking-tight text-slate-200">Perfil de Usuario</h2>
                            </div>
                            <button
                                onClick={handleSaveProfile}
                                disabled={isSaving}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20"
                            >
                                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center">
                                    <Shield size={12} className="mr-1" /> Nombre Completo
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center">
                                    <Mail size={12} className="mr-1" /> Correo Principal
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center">
                                    <Globe size={12} className="mr-1" /> Moneda Preferida
                                </label>
                                <select
                                    value={formData.currency}
                                    onChange={e => setFormData({ ...formData, currency: e.target.value })}
                                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all appearance-none"
                                >
                                    <option value="CLP">CLP - Peso Chileno</option>
                                    <option value="USD">USD - Dólar Estadounidense</option>
                                    <option value="EUR">EUR - Euro</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center">
                                    <Globe size={12} className="mr-1" /> Zona Horaria
                                </label>
                                <select
                                    value={formData.timezone}
                                    onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all appearance-none"
                                >
                                    <option value="America/Santiago">America/Santiago (UTC-3)</option>
                                    <option value="UTC">Coordinated Universal Time (UTC)</option>
                                    <option value="America/New_York">America/New_York (UTC-5)</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    <section className="glass-card border-amber-500/20 bg-amber-500/5">
                        <div className="flex items-center space-x-3 mb-4">
                            <AlertTriangle className="text-amber-500" size={20} />
                            <h2 className="text-xl font-bold uppercase tracking-tight text-slate-200">Zona de Riesgo</h2>
                        </div>
                        <p className="text-slate-400 text-sm mb-6">
                            Estas acciones son irreversibles. Asegúrate de haber exportado un respaldo antes de continuar.
                        </p>

                        <button
                            onClick={onClearData}
                            className="flex items-center space-x-2 px-6 py-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-500 rounded-xl transition-all font-bold uppercase tracking-widest text-xs"
                        >
                            <Trash2 size={18} />
                            <span>Borrar Base de Datos Local</span>
                        </button>
                    </section>
                </div>

                {/* Data Management Section */}
                <div className="space-y-6">
                    <section className="glass-card flex flex-col items-center text-center py-10">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/5">
                            <Database className="text-emerald-500" size={32} />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Respaldo de Datos</h2>
                        <p className="text-slate-400 text-sm mb-8 px-4">
                            Descarga una copia de seguridad en formato JSON con todos tus movimientos y reglas.
                        </p>

                        <div className="w-full space-y-3">
                            <button
                                onClick={handleExport}
                                className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-600/20"
                            >
                                <Download size={18} />
                                <span>Exportar JSON</span>
                            </button>

                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".json"
                                onChange={handleFileChange}
                            />

                            <button
                                onClick={handleImportClick}
                                className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all border border-slate-700 font-black uppercase tracking-widest text-xs"
                            >
                                <Upload size={18} />
                                <span>Importar Backup</span>
                            </button>
                        </div>
                    </section>

                    <div className="glass-card p-4 bg-indigo-600/5 border-indigo-500/10">
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1">Privacidad</div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            FinGmail no almacena tus datos financieros en servidores externos. Todo reside en tu navegador y es gestionado únicamente por ti.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
