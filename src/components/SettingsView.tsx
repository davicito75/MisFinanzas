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
        <div className="space-y-6 md:space-y-8 animate-fade-in text-[#e5e5e5]">
            <header>
                <div className="flex items-center space-x-2 md:space-x-3 mb-2">
                    <div className="p-1.5 md:p-2 bg-[#2a2a2f] border border-[#3a3a3f]">
                        <SettingsIcon className="text-[#a0a0a5] w-5 md:w-6 h-5 md:h-6" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black font-outfit">Configuración</h1>
                </div>
                <p className="text-[#a0a0a5] text-sm md:text-base">Personaliza tu experiencia y gestiona tus datos locales.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Profile Section */}
                <div className="lg:col-span-2 space-y-4 md:space-y-6">
                    <section className="glass-card bg-[#1a1a1f] border border-[#3a3a3f] p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-0 mb-4 md:mb-6">
                            <div className="flex items-center space-x-2 md:space-x-3">
                                <User className="text-[#e5e5e5] w-[18px] md:w-5 h-[18px] md:h-5" />
                                <h2 className="text-lg md:text-xl font-black uppercase tracking-tight text-[#e5e5e5] font-outfit">Perfil de Usuario</h2>
                            </div>
                            <button
                                onClick={handleSaveProfile}
                                disabled={isSaving}
                                className="w-full sm:w-auto px-4 py-2 bg-[#e5e5e5] hover:bg-white disabled:opacity-50 text-[#0a0a0c] text-xs font-bold uppercase tracking-widest transition-all"
                            >
                                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#6a6a6f] uppercase tracking-widest flex items-center">
                                    <Shield size={12} className="mr-1" /> Nombre Completo
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-[#0a0a0c] border border-[#3a3a3f] px-4 py-2.5 md:py-3 text-[#e5e5e5] font-medium focus:outline-none focus:border-[#e5e5e5] transition-all text-sm md:text-base"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#6a6a6f] uppercase tracking-widest flex items-center">
                                    <Mail size={12} className="mr-1" /> Correo Principal
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-[#0a0a0c] border border-[#3a3a3f] px-4 py-2.5 md:py-3 text-[#e5e5e5] font-medium focus:outline-none focus:border-[#e5e5e5] transition-all text-sm md:text-base"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#6a6a6f] uppercase tracking-widest flex items-center">
                                    <Globe size={12} className="mr-1" /> Moneda Preferida
                                </label>
                                <select
                                    value={formData.currency}
                                    onChange={e => setFormData({ ...formData, currency: e.target.value })}
                                    className="w-full bg-[#0a0a0c] border border-[#3a3a3f] px-4 py-2.5 md:py-3 text-[#e5e5e5] font-medium focus:outline-none focus:border-[#e5e5e5] transition-all appearance-none text-sm md:text-base"
                                >
                                    <option value="CLP">CLP - Peso Chileno</option>
                                    <option value="USD">USD - Dólar Estadounidense</option>
                                    <option value="EUR">EUR - Euro</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#6a6a6f] uppercase tracking-widest flex items-center">
                                    <Globe size={12} className="mr-1" /> Zona Horaria
                                </label>
                                <select
                                    value={formData.timezone}
                                    onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                                    className="w-full bg-[#0a0a0c] border border-[#3a3a3f] px-4 py-2.5 md:py-3 text-[#e5e5e5] font-medium focus:outline-none focus:border-[#e5e5e5] transition-all appearance-none text-sm md:text-base"
                                >
                                    <option value="America/Santiago">America/Santiago (UTC-3)</option>
                                    <option value="UTC">Coordinated Universal Time (UTC)</option>
                                    <option value="America/New_York">America/New_York (UTC-5)</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    <section className="glass-card border border-[#3a3a3f] bg-[#0a0a0c] p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <AlertTriangle className="text-amber-500" size={20} />
                            <h2 className="text-xl font-black uppercase tracking-tight text-[#e5e5e5] font-outfit">Zona de Riesgo</h2>
                        </div>
                        <p className="text-[#a0a0a5] text-sm mb-6">
                            Estas acciones son irreversibles. Asegúrate de haber exportado un respaldo antes de continuar.
                        </p>

                        <button
                            onClick={onClearData}
                            className="flex items-center space-x-2 px-6 py-3 bg-[#1a1a1f] hover:bg-[#2a2a2f] border border-rose-900/30 hover:border-rose-500/50 text-rose-500 transition-all font-bold uppercase tracking-widest text-xs"
                        >
                            <Trash2 size={18} />
                            <span>Borrar Base de Datos Local</span>
                        </button>
                    </section>
                </div>

                {/* Data Management Section */}
                <div className="space-y-6">
                    <section className="glass-card flex flex-col items-center text-center py-10 bg-[#1a1a1f] border border-[#3a3a3f]">
                        <div className="w-16 h-16 bg-[#2a2a2f] flex items-center justify-center mb-6 border border-[#3a3a3f]">
                            <Database className="text-[#e5e5e5]" size={32} />
                        </div>
                        <h2 className="text-xl font-black mb-2 text-[#e5e5e5] font-outfit">Respaldo de Datos</h2>
                        <p className="text-[#a0a0a5] text-sm mb-8 px-4">
                            Descarga una copia de seguridad en formato JSON con todos tus movimientos y reglas.
                        </p>

                        <div className="w-full space-y-3 px-6">
                            <button
                                onClick={handleExport}
                                className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-[#e5e5e5] hover:bg-white text-[#0a0a0c] transition-all font-black uppercase tracking-widest text-xs"
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
                                className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-[#0a0a0c] hover:bg-[#2a2a2f] text-[#a0a0a5] hover:text-[#e5e5e5] transition-all border border-[#3a3a3f] font-black uppercase tracking-widest text-xs"
                            >
                                <Upload size={18} />
                                <span>Importar Backup</span>
                            </button>
                        </div>
                    </section>

                    <div className="glass-card p-4 bg-[#0a0a0c] border border-[#3a3a3f]">
                        <div className="text-[10px] text-[#6a6a6f] uppercase tracking-widest font-black mb-1">Privacidad</div>
                        <p className="text-xs text-[#a0a0a5] leading-relaxed">
                            FinGmail no almacena tus datos financieros en servidores externos. Todo reside en tu navegador y es gestionado únicamente por ti.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
