import React from 'react';
import { Zap, TrendingUp, TrendingDown, Clock, AlertCircle } from 'lucide-react';

const SmartInsightsPanel = ({ stats }) => {
    // Helper to format currency
    const formatCurrency = (val) => `$${val?.toLocaleString() || '0'}`;

    // Logic to generate insights
    const generateInsights = () => {
        const insights = [];

        if (!stats) return insights;

        const hourly = stats.salesByHourOfDay?.map(h => ({ ...h, sales: Number(h.sales) })) || [];
        const daily = stats.dailySales?.map(d => ({ ...d, sales: Number(d.sales) })) || [];

        // 1. Peak Hour Insight
        if (hourly.length > 0) {
            const peakHour = hourly.reduce((max, curr) => (!max || curr.sales > max.sales) ? curr : max, null);
            if (peakHour && peakHour.sales > 0) {
                const hourInt = peakHour.hour;
                const nextHour = (hourInt + 1) % 24;
                const ampm = hourInt >= 12 ? 'PM' : 'AM';
                const displayHour = hourInt % 12 || 12;

                insights.push({
                    icon: <Clock className="w-5 h-5 text-orange-500" />,
                    title: "Peak Sales Hour",
                    text: `Most sales happen between ${displayHour} ${ampm} - ${displayHour === 12 && nextHour === 1 ? '1' : (nextHour % 12 || 12)} ${nextHour >= 12 ? 'PM' : 'AM'}.`,
                    type: 'highlight'
                });
            }
        }

        // 2. Growth Insight (Last Day vs Previous Day)
        if (daily.length >= 2) {
            const lastDay = daily[daily.length - 1];
            const prevDay = daily[daily.length - 2];

            if (lastDay.sales > 0 && prevDay.sales > 0) {
                const growth = ((lastDay.sales - prevDay.sales) / prevDay.sales) * 100;
                if (growth > 10) {
                    insights.push({
                        icon: <TrendingUp className="w-5 h-5 text-green-500" />,
                        title: "Sales Trending Up",
                        text: `Sales increased by ${Math.round(growth)}% yesterday compared to the day before.`,
                        type: 'positive'
                    });
                } else if (growth < -10) {
                    insights.push({
                        icon: <TrendingDown className="w-5 h-5 text-red-500" />,
                        title: "Sales Slowdown",
                        text: `Sales dropped by ${Math.round(Math.abs(growth))}% yesterday. Consider a new promo code.`,
                        type: 'negative'
                    });
                }
            }
        }

        // 3. Continuous Drop (3 days)
        if (daily.length >= 3) {
            const last3 = daily.slice(-3);
            const isDropping = last3[0].sales > last3[1].sales && last3[1].sales > last3[2].sales;
            if (isDropping) {
                insights.push({
                    icon: <AlertCircle className="w-5 h-5 text-blue-500" />,
                    title: "Momentum Alert",
                    text: "3 days of continuous drop detected. It might be time to send an email blast.",
                    type: 'info'
                });
            }
        }

        // 4. Default if empty
        if (insights.length === 0) {
            insights.push({
                icon: <Zap className="w-5 h-5 text-purple-500" />,
                title: "AI Analysis",
                text: "Gathering more data to generate smart insights...",
                type: 'neutral'
            });
        }

        return insights;
    };

    const insights = generateInsights();

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
                <div className="bg-white p-2 rounded-lg shadow-sm">
                    <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">Smart Insights</h3>
                    <p className="text-xs text-gray-500">AI-powered analytics</p>
                </div>
            </div>

            <div className="space-y-4">
                {insights.map((insight, index) => (
                    <div key={index} className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex gap-4">
                            <div className="mt-1">{insight.icon}</div>
                            <div>
                                <h4 className="font-bold text-gray-800 text-sm">{insight.title}</h4>
                                <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                                    {insight.text}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SmartInsightsPanel;
