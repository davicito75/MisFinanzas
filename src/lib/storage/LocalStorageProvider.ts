import type { AppState } from '../../types';
import type { StorageProvider } from './StorageProvider';

const STORAGE_KEY = 'fingmail_state';

export class LocalStorageProvider implements StorageProvider {
    async saveState(state: AppState): Promise<void> {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
            console.error('Error saving state to LocalStorage:', error);
            throw error;
        }
    }

    async loadState(): Promise<AppState | null> {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (!data) return null;
            return JSON.parse(data) as AppState;
        } catch (error) {
            console.error('Error loading state from LocalStorage:', error);
            return null;
        }
    }

    async clearState(): Promise<void> {
        localStorage.removeItem(STORAGE_KEY);
    }

    exportJSON(): string {
        const data = localStorage.getItem(STORAGE_KEY);
        return data || '{}';
    }

    importJSON(json: string): void {
        try {
            const state = JSON.parse(json);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
            console.error('Error importing JSON to LocalStorage:', error);
            throw error;
        }
    }
}

export const localStorageProvider = new LocalStorageProvider();
