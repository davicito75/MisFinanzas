import { supabase } from '../supabase/client';
import type { AppState, Movement, Subscription, Rule } from '../../types';

export class SupabaseStorageProvider {
    /**
     * Load complete app state for the current user
     */
    async loadState(): Promise<Partial<AppState> | null> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            // Load all data in parallel
            const [movementsRes, subscriptionsRes, rulesRes, syncStateRes] = await Promise.all([
                supabase.from('movements').select('*').eq('user_id', user.id).order('date', { ascending: false }),
                supabase.from('subscriptions').select('*').eq('user_id', user.id).order('next_billing_date', { ascending: true }),
                supabase.from('rules').select('*').eq('user_id', user.id),
                supabase.from('sync_state').select('*').eq('user_id', user.id).single()
            ]);

            if (movementsRes.error) throw movementsRes.error;
            if (subscriptionsRes.error) throw subscriptionsRes.error;
            if (rulesRes.error) throw rulesRes.error;

            // Transform database records to app types
            const movements: Movement[] = movementsRes.data.map(m => ({
                id: m.id,
                date: m.date,
                amount: parseFloat(m.amount),
                currency: m.currency,
                type: m.type as 'gasto' | 'ingreso',
                category: m.category,
                merchant: m.merchant,
                description: m.description || '',
                source: m.source as 'gmail' | 'manual',
                emailId: m.email_id,
                confidenceScore: m.confidence_score ? parseFloat(m.confidence_score) : 0,
                rawExtract: m.raw_extract,
                status: m.status as 'pendiente_confirmacion' | 'confirmado' | 'descartado',
                tags: m.tags || []
            }));

            const subscriptions: Subscription[] = subscriptionsRes.data.map(s => ({
                id: s.id,
                name: s.name,
                amount: parseFloat(s.amount),
                currency: s.currency,
                frequency: s.frequency as 'mensual' | 'anual',
                nextBillingDate: s.next_billing_date,
                category: s.category,
                active: s.active,
                remindersEnabled: s.reminders_enabled,
                movementIds: s.movement_ids || []
            }));

            const rules: Rule[] = rulesRes.data.map(r => ({
                id: r.id,
                condition: {
                    field: r.condition_field as 'subject' | 'from' | 'body',
                    operator: r.condition_operator as 'contains' | 'equals',
                    value: r.condition_value
                },
                actions: {
                    category: r.action_category,
                    type: r.action_type as 'gasto' | 'ingreso' | undefined,
                    status: r.action_status as 'pendiente_confirmacion' | 'confirmado' | 'descartado' | undefined
                }
            }));

            const syncState = syncStateRes.data ? {
                lastProcessedEmailId: syncStateRes.data.last_processed_email_id || undefined,
                lastSyncTimestamp: syncStateRes.data.last_sync_timestamp || '',
                totalProcessedCount: syncStateRes.data.total_processed_count || 0,
                ignoredSubscriptions: syncStateRes.data.ignored_subscriptions || []
            } : {
                lastSyncTimestamp: '',
                totalProcessedCount: 0,
                ignoredSubscriptions: []
            };

            return {
                movements,
                subscriptions,
                rules,
                syncState
            };
        } catch (error) {
            console.error('Error loading state from Supabase:', error);
            return null;
        }
    }

    /**
     * Save complete app state for the current user
     */
    async saveState(state: Partial<AppState>): Promise<void> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No authenticated user');

            // Save movements
            if (state.movements) {
                await this.saveMovements(user.id, state.movements);
            }

            // Save subscriptions
            if (state.subscriptions) {
                await this.saveSubscriptions(user.id, state.subscriptions);
            }

            // Save rules
            if (state.rules) {
                await this.saveRules(user.id, state.rules);
            }

            // Save sync state
            if (state.syncState) {
                await this.saveSyncState(user.id, state.syncState);
            }
        } catch (error) {
            console.error('Error saving state to Supabase:', error);
            throw error;
        }
    }

    /**
     * Save movements (upsert)
     */
    private async saveMovements(userId: string, movements: Movement[]): Promise<void> {
        const dbMovements = movements.map(m => ({
            id: m.id,
            user_id: userId,
            date: m.date,
            amount: m.amount,
            currency: m.currency,
            type: m.type,
            category: m.category,
            merchant: m.merchant,
            description: m.description || null,
            source: m.source,
            email_id: m.emailId || null,
            confidence_score: m.confidenceScore || 0,
            raw_extract: m.rawExtract || null,
            status: m.status,
            tags: m.tags || []
        }));

        const { error } = await supabase
            .from('movements')
            .upsert(dbMovements, { onConflict: 'id' });

        if (error) throw error;
    }

    /**
     * Save subscriptions (upsert)
     */
    private async saveSubscriptions(userId: string, subscriptions: Subscription[]): Promise<void> {
        const dbSubscriptions = subscriptions.map(s => ({
            id: s.id,
            user_id: userId,
            name: s.name,
            amount: s.amount,
            currency: s.currency,
            frequency: s.frequency,
            next_billing_date: s.nextBillingDate,
            category: s.category,
            active: s.active,
            reminders_enabled: s.remindersEnabled || false,
            movement_ids: s.movementIds || []
        }));

        const { error } = await supabase
            .from('subscriptions')
            .upsert(dbSubscriptions, { onConflict: 'id' });

        if (error) throw error;
    }

    /**
     * Save rules (upsert)
     */
    private async saveRules(userId: string, rules: Rule[]): Promise<void> {
        const dbRules = rules.map(r => ({
            id: r.id,
            user_id: userId,
            condition_field: r.condition.field,
            condition_operator: r.condition.operator,
            condition_value: r.condition.value,
            action_category: r.actions.category || null,
            action_type: r.actions.type || null,
            action_status: r.actions.status || null
        }));

        const { error } = await supabase
            .from('rules')
            .upsert(dbRules, { onConflict: 'id' });

        if (error) throw error;
    }

    /**
     * Save sync state (upsert)
     */
    private async saveSyncState(userId: string, syncState: AppState['syncState']): Promise<void> {
        const { error } = await supabase
            .from('sync_state')
            .upsert({
                user_id: userId,
                last_processed_email_id: syncState.lastProcessedEmailId || null,
                last_sync_timestamp: syncState.lastSyncTimestamp || null,
                total_processed_count: syncState.totalProcessedCount || 0,
                ignored_subscriptions: syncState.ignoredSubscriptions || []
            }, { onConflict: 'user_id' });

        if (error) throw error;
    }

    /**
     * Delete a movement
     */
    async deleteMovement(id: string): Promise<void> {
        const { error } = await supabase
            .from('movements')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    /**
     * Delete a subscription
     */
    async deleteSubscription(id: string): Promise<void> {
        const { error } = await supabase
            .from('subscriptions')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    /**
     * Subscribe to real-time changes
     */
    subscribeToChanges(callback: () => void) {
        const channel = supabase
            .channel('db-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'movements' }, callback)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'subscriptions' }, callback)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'rules' }, callback)
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }
}

export const supabaseStorageProvider = new SupabaseStorageProvider();
