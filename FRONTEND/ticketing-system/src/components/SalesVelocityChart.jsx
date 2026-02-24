import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, AreaChart, Area
} from 'recharts';
import { Play, TrendingUp, Calendar } from 'lucide-react';

const SalesVelocityChart = ({ stats }) => {
    const hourlyData = stats?.salesByHourOfDay?.map(h => ({
        hour: `${h.hour}:00`,
        sales: Number(h.sales),
        rawHour: h.hour
    })) || [];

    const dailyData = stats?.dailySales?.map(d => ({
        date: new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' }),
        fullDate: d.date,
        sales: Number(d.sales)
    })) || [];

    // Custom Tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg text-sm">
                    <p className="font-bold text-gray-900">{label}</p>
                    <p className="text-purple-600 font-medium">
                        $ {payload[0].value.toLocaleString()}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hourly Velocity (Heatmap Proxied by Bar Chart) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg flex items-center">
                            <Play className="w-5 h-5 mr-2 text-purple-500 fill-purple-500" />
                            Hourly Velocity
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Sales distribution by time of day (0-24h)
                        </p>
                    </div>
                </div>

                <div className="h-64">
                    {hourlyData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="hour"
                                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                                    axisLine={false}
                                    tickLine={false}
                                    interval={2}
                                />
                                <YAxis
                                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
                                <Bar
                                    dataKey="sales"
                                    fill="#8b5cf6"
                                    radius={[4, 4, 0, 0]}
                                    barSize={20}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400">
                            No hourly data available
                        </div>
                    )}
                </div>
            </div>

            {/* Daily Trend Line Graph */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-indigo-500" />
                            Weekly Trend
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Daily sales performance
                        </p>
                    </div>
                </div>

                <div className="h-64">
                    {dailyData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSalesVelocity" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#6366f1"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorSalesVelocity)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400">
                            No daily data available
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SalesVelocityChart;
