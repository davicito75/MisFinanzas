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
        <div className="glass-card border border-[#3a3a3f] bg-[#0a0a0c] p-6">
            <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-[#1a1a1f] border border-[#3a3a3f] text-[#a0a0a5]">
                    <Zap size={20} className="" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight font-outfit text-[#e5e5e5]">IA Insights</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {insights.map((insight, i) => (
                    <div key={i} className="flex flex-col space-y-3 p-4 bg-[#1a1a1f] border border-[#3a3a3f] hover:border-[#6a6a6f] transition-all group">
                        <div className={`p-2 ${insight.bg} ${insight.color} w-fit rounded-none border border-current opacity-80 group-hover:opacity-100 transition-opacity`}>
                            <insight.icon size={20} />
                        </div>
                        <h4 className="font-bold text-[#e5e5e5]">{insight.title}</h4>
                        <p className="text-sm text-[#a0a0a5] leading-relaxed font-medium">{insight.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
