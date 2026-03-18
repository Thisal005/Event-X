import React, { useEffect, useState, useRef, useCallback } from 'react';
import { getEventStats } from '../../api/eventService';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {
    X, TrendingUp, Users, Ticket, DollarSign,
    RefreshCw, Wifi, WifiOff, Calendar, BarChart3,
    CheckCircle, XCircle, ArrowUpRight, Clock, ChevronLeft
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const EventStatsPanel = ({ event, onBack }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [connected, setConnected] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);
    const clientRef = useRef(null);

    // Fetch stats function - simplified
    const fetchStats = useCallback(async () => {
        if (!event?.id) return;

        console.log('Fetching stats for event:', event.id);
        setLoading(true);
        setError(null);

        try {
            const data = await getEventStats(event.id);
            console.log('Fetched stats data:', data);

            if (data && typeof data === 'object') {
                setStats(data);
                setLastUpdate(new Date());
                console.log('Stats set successfully');
            } else {
                console.warn('Received invalid stats from API:', data);
                setError('Invalid data received');
            }
        } catch (err) {
            console.error('Failed to fetch stats:', err);
            setError('Failed to load event statistics');
        } finally {
            setLoading(false);
            console.log('Loading set to false');
        }
    }, [event?.id]);

    // Initial fetch - only on mount
    useEffect(() => {
        fetchStats();
    }, []); // Empty dependency - only run once on mount

    // WebSocket connection for real-time updates
    useEffect(() => {
        const eventId = event?.id;
        if (!eventId) return;

        // Prevent multiple connections
        if (clientRef.current?.active) {
            return;
        }

        let isSubscribed = true; // Local flag for this effect instance

        const client = new Client({
            webSocketFactory: () => new SockJS(import.meta.env.VITE_WS_URL || '/ws'),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            debug: (str) => {
                // Uncomment for debugging: console.log('STOMP:', str);
            },
            onConnect: () => {
                if (!isSubscribed) return;
                setConnected(true);
                console.log('WebSocket connected for event stats');

                client.subscribe(`/topic/event/${eventId}/stats`, (message) => {
                    if (!isSubscribed) return;
                    try {
                        const newStats = JSON.parse(message.body);
                        console.log('Received WebSocket stats:', newStats);

                        if (newStats && typeof newStats === 'object' && newStats.totalTickets !== undefined) {
                            setStats(newStats);
                            setLastUpdate(new Date());
                        } else {
                            console.warn('Received invalid stats data, ignoring:', newStats);
                        }
                    } catch (e) {
                        console.error('Failed to parse stats message:', e);
                    }
                });
            },
            onDisconnect: () => {
                if (!isSubscribed) return;
                setConnected(false);
                console.log('WebSocket disconnected');
            },
            onStompError: (frame) => {
                console.error('STOMP error:', frame);
                if (isSubscribed) {
                    setConnected(false);
                }
            },
            onWebSocketError: (evt) => {
                console.error('WebSocket error:', evt);
            }
        });

        clientRef.current = client;
        client.activate();

        return () => {
            isSubscribed = false;
            if (clientRef.current?.active) {
                clientRef.current.deactivate();
                clientRef.current = null;
            }
        };
    }, [event?.id]);

    if (!event) return null;

    const ticketTypeData = stats?.ticketTypeStats?.map(tt => ({
        name: tt.name,
        sold: tt.sold,
        available: tt.quantity - tt.sold,
        total: tt.quantity
    })) || [];

    const salesPercentage = stats ? (stats.totalTicketsSold / stats.totalTickets * 100).toFixed(1) : 0;

    const statusData = stats ? [
        { name: 'Valid', value: stats.totalTicketsSold - stats.refundedCount - stats.cancelledCount - stats.attendanceCount, color: '#10b981' },
        { name: 'Checked In', value: stats.attendanceCount, color: '#8b5cf6' },
        { name: 'Refunded', value: stats.refundedCount, color: '#ef4444' },
        { name: 'Cancelled', value: stats.cancelledCount, color: '#6b7280' }
    ].filter(d => d.value > 0) : [];

    return (
        <div className="space-y-6">
            {/* Header with back button */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            title="Back to Events"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold">{event.name}</h2>
                            <div className="flex items-center gap-4 mt-2 text-purple-100">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(event.date).toLocaleDateString()}
                                </span>
                                <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${connected ? 'bg-green-400/20 text-green-100' : 'bg-red-400/20 text-red-100'
                                    }`}>
                                    {connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                                    {connected ? 'Live' : 'Offline'}
                                </span>
                                {lastUpdate && (
                                    <span className="text-xs text-purple-200">
                                        Updated: {lastUpdate.toLocaleTimeString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={fetchStats}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Refresh Stats"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Content */}
            {loading && !stats ? (
                <div className="flex items-center justify-center h-64 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex flex-col items-center gap-3">
                        <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
                        <p className="text-gray-500">Loading statistics...</p>
                    </div>
                </div>
            ) : error ? (
                <div className="flex items-center justify-center h-64 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="text-center">
                        <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                        <p className="text-gray-600">{error}</p>
                        <button
                            onClick={fetchStats}
                            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            ) : stats && (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-2xl border border-emerald-100">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-emerald-100 rounded-xl">
                                    <DollarSign className="w-5 h-5 text-emerald-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-600">Revenue</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                                ${parseFloat(stats.totalRevenue || 0).toLocaleString()}
                            </p>
                            <p className="text-xs text-emerald-600 mt-1">
                                {stats.totalOrders} orders
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-5 rounded-2xl border border-purple-100">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-purple-100 rounded-xl">
                                    <Ticket className="w-5 h-5 text-purple-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-600">Tickets Sold</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                                {stats.totalTicketsSold} / {stats.totalTickets}
                            </p>
                            <div className="mt-2 bg-purple-200/50 rounded-full h-2 overflow-hidden">
                                <div
                                    className="h-full bg-purple-600 rounded-full transition-all duration-500"
                                    style={{ width: `${salesPercentage}%` }}
                                />
                            </div>
                            <p className="text-xs text-purple-600 mt-1">{salesPercentage}% sold</p>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-2xl border border-blue-100">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-blue-100 rounded-xl">
                                    <Users className="w-5 h-5 text-blue-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-600">Attendance</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                                {stats.attendanceCount}
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                                {stats.attendanceRate?.toFixed(1) || 0}% check-in rate
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-red-50 to-orange-50 p-5 rounded-2xl border border-red-100">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-red-100 rounded-xl">
                                    <ArrowUpRight className="w-5 h-5 text-red-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-600">Refunds</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                                {stats.refundedCount}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {stats.cancelledCount} cancelled
                            </p>
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Ticket Types Breakdown */}
                        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-purple-600" />
                                Tickets by Type
                            </h3>
                            {ticketTypeData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={ticketTypeData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis type="number" />
                                        <YAxis dataKey="name" type="category" width={80} />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '12px',
                                                border: 'none',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                            }}
                                        />
                                        <Bar dataKey="sold" stackId="a" fill="#8b5cf6" name="Sold" radius={[0, 0, 0, 0]} />
                                        <Bar dataKey="available" stackId="a" fill="#e5e7eb" name="Available" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-64 flex items-center justify-center text-gray-400">
                                    No ticket data available
                                </div>
                            )}
                        </div>

                        {/* Ticket Status Distribution */}
                        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-purple-600" />
                                Ticket Status
                            </h3>
                            {statusData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={statusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {statusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '12px',
                                                border: 'none',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                            }}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-64 flex items-center justify-center text-gray-400">
                                    No tickets yet
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Hourly Sales Heatmap */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-purple-600" />
                            Sales by Hour of Day
                        </h3>
                        <ResponsiveContainer width="100%" height={150}>
                            <BarChart data={stats.salesByHourOfDay || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="hour"
                                    tickFormatter={(h) => `${h}:00`}
                                    tick={{ fontSize: 10 }}
                                />
                                <YAxis hide />
                                <Tooltip
                                    formatter={(value) => [`$${parseFloat(value).toFixed(2)}`, 'Sales']}
                                    labelFormatter={(h) => `${h}:00 - ${h}:59`}
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <Bar dataKey="sales" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}
        </div>
    );
};

export default EventStatsPanel;
