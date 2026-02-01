import React, { useState } from 'react';
import { ArrowRight, Receipt, AlertCircle } from 'lucide-react';
import { supabaseAuthService } from '../lib/auth/SupabaseAuthService';
import type { UserProfile } from '../types';

interface LoginViewProps {
    onLoginSuccess: (user: UserProfile) => void;
}

export const LoginView = ({ onLoginSuccess }: LoginViewProps) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            let user: UserProfile;
            if (isLogin) {
                user = await supabaseAuthService.login(email, password);
            } else {
                user = await supabaseAuthService.register(email, password, name);
            }
            onLoginSuccess(user);
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error inesperado.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient Background Elements - REPLACED with subtle gradients */}
            <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#2a2a2f]/20 blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#3a3a3f]/20 blur-[100px] pointer-events-none" />

            <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="glass-card !p-8 border border-[#3a3a3f] bg-[#0a0a0c] shadow-2xl">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-[#e5e5e5] flex items-center justify-center mb-4 border border-[#3a3a3f]">
                            <Receipt className="text-[#0a0a0c]" size={32} />
                        </div>
                        <h1 className="text-4xl font-black font-outfit tracking-tighter text-[#e5e5e5]">Mis Finanzas</h1>
                        <p className="text-[#6a6a6f] font-medium mt-2">
                            {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta local'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#a0a0a5] ml-1">NOMBRE COMPLETO</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-[#1a1a1f] border border-[#3a3a3f] py-3 px-4 text-[#e5e5e5] placeholder:text-[#6a6a6f] focus:outline-none focus:border-[#e5e5e5] transition-all font-medium"
                                    placeholder="David González"
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#a0a0a5] ml-1">CORREO ELECTRÓNICO</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#1a1a1f] border border-[#3a3a3f] py-3 px-4 text-[#e5e5e5] placeholder:text-[#6a6a6f] focus:outline-none focus:border-[#e5e5e5] transition-all font-medium"
                                placeholder="david@ejemplo.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#a0a0a5] ml-1">CONTRASEÑA</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#1a1a1f] border border-[#3a3a3f] py-3 px-4 text-[#e5e5e5] placeholder:text-[#6a6a6f] focus:outline-none focus:border-[#e5e5e5] transition-all font-medium"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="flex items-center space-x-2 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium animate-in fade-in duration-300">
                                <AlertCircle size={18} className="flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#e5e5e5] hover:bg-white text-[#0a0a0c] py-4 font-black uppercase tracking-widest text-sm transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-[#0a0a0c]/30 border-t-[#0a0a0c] rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>{isLogin ? 'Entrar' : 'Registrarse'}</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                            }}
                            className="text-[#6a6a6f] hover:text-[#e5e5e5] transition-colors text-sm font-bold uppercase tracking-tight"
                        >
                            {isLogin
                                ? '¿No tienes cuenta? Regístrate aquí'
                                : '¿Ya tienes cuenta? Inicia sesión'}
                        </button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-[#3a3a3f] text-[10px] text-[#6a6a6f] text-center uppercase tracking-widest font-black italic">
                        🔐 Datos gestionados con Supabase
                    </div>
                </div>
            </div>
        </div>
    );
};
