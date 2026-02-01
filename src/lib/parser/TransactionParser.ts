import type { Movement, MovementType } from '../../types';

export class TransactionParser {
    // Regex that catches numbers with/without symbols and with various separators
    private static AMOUNT_REGEX = /(?:[$\u20ACR$£€]|(?:CLP|USD|BRL|EUR|ARS|MXN))\s?([\d.,]{1,})|([\d.,]{3,})\s?(?:[$\u20ACR$£€]|(?:CLP|USD|BRL|EUR|ARS|MXN))|(?:\b(?:pago|total|monto|monto pagado|boleta|factura|clp)\b[:\s]*)(\d[\d.,]*\d|\d)/gi;

    // Keywords for bill detection
    private static BILL_KEYWORDS = [
        'vencimiento', 'factura', 'boleta', 'nro de cliente', 'cuenta no',
        'servicio', 'suministro', 'pago de cuenta', 'total a pagar',
        'fecha de emisión', 'detalle de cobros', 'consumo', 'valor a pagar',
        'monto pagado', 'comprobante de pago'
    ];

    private static SERVICE_PROVIDERS = [
        'enel', 'aguas andinas', 'metrogas', 'vtr', 'movistar', 'entel', 'claro',
        'chilquinta', 'cge', 'essbio', 'esval', 'sencillito', 'servipag', 'unired'
    ];

    static parse(emailId: string, subject: string, body: string, sender: string, date: string): Movement {
        const fullContent = `${subject}\n${sender}\n${body}`.toLowerCase();

        const amountData = this.extractAmount(fullContent, subject);
        const type = this.inferType(fullContent, sender);
        const merchant = this.extractMerchant(sender, subject, body);
        const category = this.inferCategory(merchant, fullContent);

        const confidenceScore = this.calculateConfidence(amountData.amount, merchant, fullContent);

        return {
            id: emailId,
            date: date || new Date().toISOString().split('T')[0],
            amount: amountData.amount,
            currency: amountData.currency,
            type: type,
            category: category,
            merchant: merchant,
            description: subject,
            source: 'gmail',
            emailId: emailId,
            confidenceScore: confidenceScore,
            rawExtract: body.substring(0, 500),
            status: confidenceScore > 0.8 ? 'confirmado' : 'pendiente_confirmacion'
        };
    }

    private static extractAmount(text: string, subject: string): { amount: number; currency: string } {
        const lowerText = text.toLowerCase();

        // 1. Detect Currency first - Default to CLP as it's the user's primary context
        let currency = 'CLP';
        if (lowerText.includes('usd') || lowerText.includes('u$s')) currency = 'USD';
        else if (lowerText.includes('r$') || lowerText.includes('brl')) currency = 'BRL';
        else if (lowerText.includes('€') || lowerText.includes('eur')) currency = 'EUR';
        else if (lowerText.includes('clp') || lowerText.includes('$')) currency = 'CLP';

        // 2. Extract potential numbers
        // Combine subject and body for a wider search
        const combined = `${subject}\n${text}`;
        const matches = Array.from(combined.matchAll(this.AMOUNT_REGEX));

        if (matches.length === 0) return { amount: 0, currency };

        const candidates = matches.map(m => {
            // Group 1: Symbol prefix, Group 2: Symbol suffix, Group 3: Keyword prefix
            const raw = m[1] || m[2] || m[3];
            if (!raw) return 0;

            let val = raw.replace(/\s/g, '');

            // CLP/CL specific normalization: typically "10.000" or "10500"
            if (currency === 'CLP') {
                // Remove all separators for CLP (no decimals usually used in consumers)
                val = val.replace(/\./g, '').replace(/,/g, '');
            } else {
                // International normalization (USD/EUR)
                if (val.includes('.') && val.includes(',')) {
                    val = val.lastIndexOf('.') > val.lastIndexOf(',') ? val.replace(/,/g, '') : val.replace(/\./g, '').replace(',', '.');
                } else if (val.includes(',')) {
                    val = val.split(',').pop()?.length === 2 ? val.replace(',', '.') : val.replace(/,/g, '');
                }
            }
            return parseFloat(val) || 0;
        }).filter(v => v > 0);

        // Heuristic: If there are multiple numbers, pick the most "monetary" one
        let finalAmount = 0;
        if (candidates.length > 0) {
            // 1. Try to find symbols in subject first (very common in bank notifications)
            const subjectMatches = Array.from(subject.matchAll(/(?:\$|CLP)\s?([\d.,]+)/gi));
            if (subjectMatches.length > 0) {
                const sVal = subjectMatches[0][1].replace(/\./g, '').replace(/,/g, '');
                finalAmount = parseFloat(sVal) || 0;
            }

            // 2. If subject has nothing, look for the MOST REASONABLE candidate in body
            if (finalAmount === 0) {
                // Filter candidates: avoid anything > 2 millions (conservative for daily expense app)
                // or anything that looks like a year (2024, 2025, 2026)
                const reasonableOnes = candidates.filter(v => v > 10 && v < 2000000 && ![2023, 2024, 2025, 2026].includes(v));

                if (reasonableOnes.length > 0) {
                    // Pick the highest reasonable one (usually the total)
                    finalAmount = Math.max(...reasonableOnes);
                } else if (candidates.length > 0) {
                    // Fallback to first if none are "reasonable" but still existing
                    finalAmount = candidates[0];
                }
            }
        }

        return { amount: finalAmount, currency };
    }

    private static inferType(text: string, _sender: string): MovementType {
        const incomeKeywords = ['abonado', 'recibido', 'depósito', 'deposit', 'received', 'transferencia recibida', 'abono', 'pix', 'devolución', 'pago recibido'];
        const expenseKeywords = ['pago', 'compra', 'confirmación de orden', 'factura', 'boleta', 'cargo', 'cobro', 'vencimiento', 'debitado'];

        if (incomeKeywords.some(kw => text.includes(kw))) return 'ingreso';
        if (expenseKeywords.some(kw => text.includes(kw))) return 'gasto';

        return 'gasto';
    }

    private static extractMerchant(sender: string, subject: string, _body: string): string {
        const senderName = sender.split('<')[0].replace(/"/g, '').trim();
        const lowerSubject = subject.toLowerCase();

        for (const provider of this.SERVICE_PROVIDERS) {
            if (senderName.toLowerCase().includes(provider) || lowerSubject.includes(provider)) {
                return provider.charAt(0).toUpperCase() + provider.slice(1);
            }
        }

        const patterns = [
            /pago a ([\w\s]+)/i,
            /recibo de ([\w\s]+)/i,
            /comprobante de ([\w\s]+)/i,
            /transferido a ([\w\s]+)/i,
            /notificación de ([\w\s]+)/i
        ];

        for (const pattern of patterns) {
            const match = subject.match(pattern);
            if (match && match[1]) {
                const found = match[1].trim();
                // Avoid capturing generic terms
                if (found.length > 2 && found.length < 30 && !found.toLowerCase().includes('pago')) return found;
            }
        }

        if (senderName && !senderName.includes('@')) return senderName;
        return senderName.split('@')[0] || 'Desconocido';
    }

    private static inferCategory(merchant: string, text: string): string {
        const categories: Record<string, string[]> = {
            'Servicios': ['enel', 'agua', 'gas', 'luz', 'metrogas', 'chilquinta', 'cge', 'essbio', 'esval', 'vtr', 'movistar', 'entel', 'claro', 'internet', 'telefonía', 'electricidad', 'sencillito', 'servipag'],
            'Suscripciones': ['netflix', 'spotify', 'google', 'apple', 'disney', 'hbo', 'amazon prime', 'youtube', 'linkedin', 'canva', 'midjourney', 'openai'],
            'Alimentación': ['pedidosya', 'uber eats', 'rappi', 'jumbo', 'lider', 'unimarc', 'tottus', 'supermercadoSync', 'restaurant', 'cafe', 'mcdonald'],
            'Transporte': ['uber', 'cabify', 'didi', 'gasolinera', 'shell', 'copec', 'terpel', 'metro', 'bip'],
            'Finanzas': ['banco', 'santander', 'itau', 'scotiabank', 'bci', 'estado', 'transferencia', 'pago tarjeta', 'ripely', 'falabella'],
            'Compras': ['mercadolibre', 'amazon', 'falabella', 'ripley', 'paris', 'aliexpress', 'ebay', 'h&m', 'zara']
        };

        const lowerMerchant = merchant.toLowerCase();
        for (const [cat, keywords] of Object.entries(categories)) {
            if (keywords.some(kw => lowerMerchant.includes(kw) || text.includes(kw))) {
                return cat;
            }
        }

        return 'Otros';
    }

    private static calculateConfidence(amount: number, merchant: string, text: string): number {
        let score = 0.4;

        if (amount > 0) score += 0.3;
        if (merchant !== 'Desconocido' && merchant.length > 2) score += 0.2;

        if (this.BILL_KEYWORDS.some(kw => text.includes(kw))) score += 0.2;

        if (amount === 0) score = 0.1;

        return Math.max(0, Math.min(score, 1));
    }
}
