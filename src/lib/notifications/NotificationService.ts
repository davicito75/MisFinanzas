import type { Subscription } from '../../types';

export class NotificationService {
    static async requestPermission(): Promise<boolean> {
        if (!('Notification' in window)) {
            console.error('Este navegador no soporta notificaciones de escritorio.');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }

        return false;
    }

    static async sendNotification(title: string, options?: NotificationOptions) {
        if (Notification.permission === 'granted') {
            new Notification(title, {
                icon: '/vite.svg', // Default icon
                ...options
            });
        }
    }

    static checkUpcomingSubscriptions(subscriptions: Subscription[]) {
        const today = new Date();
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(today.getDate() + 3);

        subscriptions.forEach(sub => {
            if (!sub.active || !sub.remindersEnabled) return;

            const billingDate = new Date(sub.nextBillingDate);

            // If the billing date is within the next 3 days and not in the past
            if (billingDate >= today && billingDate <= threeDaysFromNow) {
                const diffDays = Math.ceil((billingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                const message = diffDays === 0
                    ? `¡Hoy vence tu suscripción de ${sub.name}!`
                    : `Tu suscripción de ${sub.name} vence en ${diffDays} días.`;

                this.sendNotification('Recordatorio de Suscripción', {
                    body: `${message}\nMonto: ${sub.currency} ${sub.amount.toLocaleString()}`,
                    tag: `sub-reminder-${sub.id}` // Prevent duplicate notifications for same sub
                });
            }
        });
    }
}
