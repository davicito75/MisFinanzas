import { supabase } from '../supabase/client';
import type { UserProfile } from '../../types';

export class SupabaseAuthService {
    /**
     * Register a new user with email and password
     */
    async register(email: string, password: string, name: string): Promise<UserProfile> {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    currency: 'CLP',
                    timezone: 'America/Santiago'
                }
            }
        });

        if (error) throw new Error(error.message);
        if (!data.user) throw new Error('No se pudo crear el usuario');

        // Get the created user profile
        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

        if (profileError) throw new Error(profileError.message);

        return {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            settings: {
                currency: profile.currency,
                timezone: profile.timezone
            }
        };
    }

    /**
     * Login with email and password
     */
    async login(email: string, password: string): Promise<UserProfile> {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw new Error(error.message);
        if (!data.user) throw new Error('No se pudo iniciar sesión');

        // Get user profile
        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

        if (profileError) throw new Error(profileError.message);

        return {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            settings: {
                currency: profile.currency,
                timezone: profile.timezone
            }
        };
    }

    /**
     * Logout current user
     */
    async logout(): Promise<void> {
        const { error } = await supabase.auth.signOut();
        if (error) throw new Error(error.message);
    }

    /**
     * Get current authenticated user
     */
    async getCurrentUser(): Promise<UserProfile | null> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return null;

        const { data: profile, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) return null;

        return {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            settings: {
                currency: profile.currency,
                timezone: profile.timezone
            }
        };
    }

    /**
     * Update user profile
     */
    async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No hay sesión activa');

        const updateData: any = {};
        if (updates.name) updateData.name = updates.name;
        if (updates.email) updateData.email = updates.email;
        if (updates.settings?.currency) updateData.currency = updates.settings.currency;
        if (updates.settings?.timezone) updateData.timezone = updates.settings.timezone;

        const { data: profile, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', user.id)
            .select()
            .single();

        if (error) throw new Error(error.message);

        return {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            settings: {
                currency: profile.currency,
                timezone: profile.timezone
            }
        };
    }

    /**
     * Check if user is authenticated
     */
    async isAuthenticated(): Promise<boolean> {
        const { data: { session } } = await supabase.auth.getSession();
        return !!session;
    }

    /**
     * Listen to auth state changes
     */
    onAuthStateChange(callback: (user: UserProfile | null) => void) {
        return supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                const profile = await this.getCurrentUser();
                callback(profile);
            } else {
                callback(null);
            }
        });
    }
}

export const supabaseAuthService = new SupabaseAuthService();
