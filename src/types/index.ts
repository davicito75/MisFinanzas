export type MovementType = 'gasto' | 'ingreso';
export type MovementStatus = 'pendiente_confirmacion' | 'confirmado' | 'descartado';
export type Frequency = 'mensual' | 'anual';

export interface Movement {
    id: string;
    date: string;
    amount: number;
    currency: string;
    type: MovementType;
    category: string;
    merchant: string;
    description: string;
    source: 'gmail' | 'manual';
    emailId?: string;
    confidenceScore: number;
    rawExtract?: string;
    status: MovementStatus;
    tags?: string[];
}

export interface Subscription {
    id: string;
    name: string;
    amount: number;
    currency: string;
    frequency: Frequency;
    nextBillingDate: string;
    category: string;
    active: boolean;
    movementIds?: string[];
    remindersEnabled?: boolean;
}

export interface Rule {
    id: string;
    condition: {
        field: 'subject' | 'from' | 'body';
        operator: 'contains' | 'equals';
        value: string;
    };
    actions: {
        category?: string;
        type?: MovementType;
        status?: MovementStatus;
    };
}

export interface SyncState {
    lastProcessedEmailId?: string;
    lastSyncTimestamp: string;
    totalProcessedCount: number;
    ignoredSubscriptions?: string[];
}

export interface UserProfile {
    id: string;
    email: string;
    name: string;
    settings: {
        currency: string;
        timezone: string;
    };
}

export interface User extends UserProfile {
    password?: string; // Only for local storage simulation
}

export interface AppState {
    movements: Movement[];
    subscriptions: Subscription[];
    rules: Rule[];
    syncState: SyncState;
    profile: UserProfile | null;
    isAuthenticated: boolean;
    ignoredSubscriptions?: string[]; // Names of merchants to ignore for detection
}
