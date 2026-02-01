import { describe, it, expect } from 'vitest';
import { TransactionParser } from './TransactionParser';

describe('TransactionParser', () => {
    it('should parse a CLP expense from Chile', () => {
        const subject = "Comprobante de Pago PedidosYa";
        const body = "Hola David, pagaste $ 12.500 con tu tarjeta terminada en 1234. ¡Gracias por tu compra!";
        const sender = "PedidosYa <noreply@pedidosya.com>";
        const result = TransactionParser.parse('msg-1', subject, body, sender, '2026-01-20');

        expect(result.amount).toBe(12500);
        expect(result.currency).toBe('CLP');
        expect(result.type).toBe('gasto');
        expect(result.merchant).toBe('PedidosYa');
        expect(result.category).toBe('Alimentación');
    });

    it('should parse a USD subscription', () => {
        const subject = "Your Google Storage receipt";
        const body = "Payment of 1.99 USD was successful on Jan 15.";
        const sender = "Google <billing-noreply@google.com>";
        const result = TransactionParser.parse('msg-2', subject, body, sender, '2026-01-15');

        expect(result.amount).toBe(1.99);
        expect(result.currency).toBe('USD');
        expect(result.merchant).toBe('Google');
        expect(result.category).toBe('Suscripciones');
    });

    it('should parse a BRL received transfer', () => {
        const subject = "Você recebeu um PIX!";
        const body = "Recibiste R$ 500,00 de Juan Perez.";
        const sender = "NuBank <no-reply@nubank.com.br>";
        const result = TransactionParser.parse('msg-3', subject, body, sender, '2026-01-25');

        expect(result.amount).toBe(500);
        expect(result.currency).toBe('BRL');
        expect(result.type).toBe('ingreso');
    });

    it('should infer "Transporte" for Uber', () => {
        const subject = "Tu viaje del lunes";
        const body = "Total: $ 3.500";
        const sender = "Uber <uber.chile@uber.com>";
        const result = TransactionParser.parse('msg-4', subject, body, sender, '2026-01-10');

        expect(result.merchant).toBe('Uber');
        expect(result.category).toBe('Transporte');
    });
});
