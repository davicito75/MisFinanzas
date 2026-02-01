import { TransactionParser } from '../parser/TransactionParser';
import type { Movement } from '../../types';

declare global {
    interface Window {
        google: any;
        gapi: any;
    }
}

/**
 * Service to interact with Gmail API using Google Identity Services (GIS)
 * and GAPI for data fetching.
 */
export class GmailService {
    private static CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    private static SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';
    private static DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'];
    private static tokenClient: any = null;
    private static gapiInited = false;
    private static gisInited = false;

    /**
     * Initializes GAPI and GIS
     */
    static async initialize(): Promise<void> {
        if (this.gapiInited && this.gisInited) return;

        return new Promise((resolve) => {
            const checkReady = () => {
                if (window.gapi && window.google) {
                    this.initGapi().then(() => {
                        this.initGis();
                        resolve();
                    });
                } else {
                    setTimeout(checkReady, 100);
                }
            };
            checkReady();
        });
    }

    private static async initGapi(): Promise<void> {
        return new Promise((resolve) => {
            window.gapi.load('client', async () => {
                await window.gapi.client.init({
                    discoveryDocs: this.DISCOVERY_DOCS,
                });
                this.gapiInited = true;
                resolve();
            });
        });
    }

    private static initGis(): void {
        this.tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: this.CLIENT_ID,
            scope: this.SCOPES,
            callback: '', // defined at request time
        });
        this.gisInited = true;
    }

    /**
     * Requests a token from the user or retrieves cached token
     */
    static async requestToken(): Promise<string> {
        await this.initialize();

        // Try to use cached token first
        const cachedToken = sessionStorage.getItem('gmail_access_token');
        const expiresAt = sessionStorage.getItem('gmail_token_expires_at');

        if (cachedToken && expiresAt) {
            const expiryTime = parseInt(expiresAt);
            const now = Date.now();

            // If token is still valid (with 5 min buffer), use it
            if (now < expiryTime - (5 * 60 * 1000)) {
                console.log('Using cached Gmail token');
                window.gapi.client.setToken({ access_token: cachedToken });
                return cachedToken;
            } else {
                // Token expired, clear cache
                sessionStorage.removeItem('gmail_access_token');
                sessionStorage.removeItem('gmail_token_expires_at');
            }
        }

        // Request new token
        return new Promise((resolve, reject) => {
            this.tokenClient.callback = async (resp: any) => {
                if (resp.error !== undefined) {
                    reject(resp);
                    return;
                }

                // Cache the token
                const expiresAt = Date.now() + (resp.expires_in * 1000);
                sessionStorage.setItem('gmail_access_token', resp.access_token);
                sessionStorage.setItem('gmail_token_expires_at', String(expiresAt));

                console.log('New Gmail token obtained and cached');
                resolve(resp.access_token);
            };

            const existingToken = window.gapi.client.getToken();

            if (existingToken === null) {
                // First time - show consent screen
                this.tokenClient.requestAccessToken({ prompt: 'consent' });
            } else {
                // Already authenticated - silent refresh
                this.tokenClient.requestAccessToken({ prompt: '' });
            }
        });
    }

    /**
     * Fetches recent financial emails and parses them into Movements
     */
    static async syncMovements(token: string): Promise<Movement[]> {
        window.gapi.client.setToken({ access_token: token });

        // Deep Search Query: Includes bills, utilities, invoices and specific Chilean/Latam payment platforms
        const query = 'subject:(pago OR comprobante OR recibo OR receipt OR invoice OR bill OR factura OR boleta OR vencimiento OR cargo OR "estado de cuenta" OR "payment confirmed" OR "transferencia recibida") ' +
            'OR "total a pagar" OR "fecha de vencimiento" OR "monto pagado" OR "detalle de su cuenta"';

        const response = await window.gapi.client.gmail.users.messages.list({
            userId: 'me',
            q: query,
            maxResults: 100 // Increased limit for deeper history
        });

        const messages = response.result.messages || [];
        const movements: Movement[] = [];

        for (const msg of messages) {
            try {
                const fullMsg = await window.gapi.client.gmail.users.messages.get({
                    userId: 'me',
                    id: msg.id
                });

                const parsed = this.parseGmailMessage(fullMsg.result);
                if (parsed) {
                    movements.push(parsed);
                }
            } catch (error) {
                console.error(`Error processing message ${msg.id}:`, error);
            }
        }

        return movements;
    }

    private static parseGmailMessage(message: any): Movement | null {
        const headers = message.payload.headers;
        const subject = headers.find((h: any) => h.name === 'Subject')?.value || '';
        const from = headers.find((h: any) => h.name === 'From')?.value || '';
        const dateStr = headers.find((h: any) => h.name === 'Date')?.value || '';

        // Decode body
        let body = '';
        if (message.payload.parts) {
            // Simplify: get the first text/plain or text/html part
            const part = message.payload.parts.find((p: any) => p.mimeType === 'text/plain' || p.mimeType === 'text/html');
            if (part && part.body.data) {
                body = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
            }
        } else if (message.payload.body.data) {
            body = atob(message.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        }

        // Use TransactionParser
        const movement = TransactionParser.parse(message.id, subject, body, from, new Date(dateStr).toISOString().split('T')[0]);

        if (movement) {
            return movement;
        }

        return null;
    }

    /**
     * Clear cached token (call on logout)
     */
    static clearToken(): void {
        sessionStorage.removeItem('gmail_access_token');
        sessionStorage.removeItem('gmail_token_expires_at');

        // Also clear GAPI token
        if (window.gapi?.client?.getToken()) {
            window.gapi.client.setToken(null);
        }

        console.log('Gmail token cache cleared');
    }
}
