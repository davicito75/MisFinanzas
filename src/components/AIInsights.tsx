import { Lightbulb, TrendingDown, Target, Zap, AlertTriangle } from 'lucide-react';
import type { Movement } from '../types';

interface AIInsightsProps {
    movements: Movement[];
}

export const AIInsights = ({ movements }: AIInsightsProps) => {
    const generateInsights = () => {
        const insights = [];
        const activeMovements = movements.filter(m => m.status !== 'descartado' && m.type === 'gasto');

        if (activeMovements.length === 0) return [{
            title: "Esperando datos",
            description: "Sincroniza tus correos para recibir recomendaciones financieras personalizadas.",
            icon: Zap,
            color: "text-indigo-400",
            bg: "bg-indigo-500/10"
        }];

        const categoryTotals = activeMovements.reduce((acc: Record<string, number>, m) => {
            const amount = m.currency === 'USD' ? m.amount * 950 : m.amount;
            acc[m.category] = (acc[m.category] || 0) + amount;
            return acc;
        }, {});

        const totalSpent = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

        // 1. Subscription Check
        const subSpent = categoryTotals['Suscripciones'] || 0;
        if (subSpent > (totalSpent * 0.15)) {
            insights.push({
                title: "Optimiza Suscripciones",
                description: "Tus suscripciones representan un " + Math.round((subSpent / totalSpent) * 100) + "% de tus gastos. Considera revisar servicios que no usas.",
                icon: TrendingDown,
                color: "text-amber-400",
                bg: "bg-amber-500/10"
            });
        }

        // 2. High Category Alert
        const topCategory = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a)[0];
        if (topCategory && topCategory[1] > (totalSpent * 0.4)) {
            insights.push({
                title: `Gasto en ${topCategory[0]}`,
                description: `Has concentrado casi la mitad de tus gastos en esta categoría. ¿Es un gasto planificado?`,
                icon: AlertTriangle,
                color: "text-rose-400",
                bg: "bg-rose-500/10"
            });
        }

        // 3. Positive Trend / Savings
        if (totalSpent < 500000) {
            insights.push({
                title: "Capacidad de Ahorro",
                description: "Tus gastos están bajo control este periodo. Buen momento para mover un excedente a inversión.",
                icon: Target,
                color: "text-emerald-400",
                bg: "bg-emerald-500/10"
            });
        }

        // 4. Default Insight
        if (insights.length < 3) {
            insights.push({
                title: "Análisis de Patrones",
                description: "Sigue registrando tus gastos manuales para una visión 360 de tu salud financiera.",
                icon: Lightbulb,
                color: "text-blue-400",
                bg: "bg-blue-500/10"
            });
        }

        return insights.slice(0, 3);
    };

    const insights = generateInsights();

    return (
        <div className="glass-card border-indigo-500/20 bg-indigo-500/5">
            <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                    <Zap size={20} className="animate-pulse" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight">IA Insights</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {insights.map((insight, i) => (
                    <div key={i} className="flex flex-col space-y-3 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all group">
                        <div className={`p-2 rounded-xl ${insight.bg} ${insight.color} w-fit group-hover:scale-110 transition-transform`}>
                            <insight.icon size={20} />
                        </div>
                        <h4 className="font-bold text-slate-100">{insight.title}</h4>
                        <p className="text-sm text-slate-400 leading-relaxed font-medium">{insight.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
