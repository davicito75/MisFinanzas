import type { AppState } from '../../types';

export interface StorageProvider {
    saveState(state: AppState): Promise<void>;
    loadState(): Promise<AppState | null>;
    clearState(): Promise<void>;
}
