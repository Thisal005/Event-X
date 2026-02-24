import React, { useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import {
    getSystemHealthCurrent, getSystemHealthHistory, getAlertThresholds,
    updateAlertThresholds, getSystemInfo
} from '../../api/adminService';
import {
    Activity, Cpu, HardDrive, Database, AlertTriangle, CheckCircle,
    RefreshCw, Settings, Bell, Server, Clock, Zap, TrendingUp
} from 'lucide-react';

const SystemHealthPanel = () => {
    const [currentMetrics, setCurrentMetrics] = useState(null);
    const [metricsHistory, setMetricsHistory] = useState([]);
    const [systemInfo, setSystemInfo] = useState(null);
    const [thresholds, setThresholds] = useState(null);
    const [showSettings, setShowSettings] = useState(false);
    const [loading, setLoading] = useState(true);
    const [connected, setConnected] = useState(false);
    const [alertEmail, setAlertEmail] = useState('');
    const [saving, setSaving] = useState(false);
    const stompClientRef = useRef(null);

    useEffect(() => {
        fetchInitialData();
        connectWebSocket();

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };
    }, []);

    const fetchInitialData = async () => {
        try {
            const [currentData, historyData, infoData, thresholdData] = await Promise.all([
                getSystemHealthCurrent(),
                getSystemHealthHistory(),
                getSystemInfo(),
                getAlertThresholds()
            ]);
            setCurrentMetrics(currentData);
            setMetricsHistory(formatHistoryData(historyData));
            setSystemInfo(infoData);
            setThresholds(thresholdData);
            setAlertEmail(thresholdData?.alertEmail || '');
        } catch (error) {
            console.error('Failed to fetch initial data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatHistoryData = (data) => {
        return data.map((item, index) => ({
            ...item,
            time: new Date(item.timestamp).toLocaleTimeString(),
            index
        }));
    };

    const connectWebSocket = () => {
        const socket = new SockJS('http://localhost:8080/ws');
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                setConnected(true);
                client.subscribe('/topic/system-health', (message) => {
                    const newMetrics = JSON.parse(message.body);
                    setCurrentMetrics(newMetrics);
                    setMetricsHistory(prev => {
                        const updated = [...prev, {
                            ...newMetrics,
                            time: new Date(newMetrics.timestamp).toLocaleTimeString(),
                            index: prev.length
                        }];
                        // Keep last 60 data points
                        return updated.slice(-60);
                    });
                });
            },
            onDisconnect: () => setConnected(false),
            onStompError: (frame) => {
                console.error('STOMP error:', frame);
                setConnected(false);
            }
        });

        client.activate();
        stompClientRef.current = client;
    };

    const handleSaveThresholds = async () => {
        setSaving(true);
        try {
            await updateAlertThresholds({
                ...thresholds,
                alertEmail
            });
            setShowSettings(false);
        } catch (error) {
            console.error('Failed to save thresholds:', error);
        } finally {
            setSaving(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'HEALTHY': return 'text-emerald-500';
            case 'WARNING': return 'text-amber-500';
            case 'CRITICAL': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    const getStatusBg = (status) => {
        switch (status) {
            case 'HEALTHY': return 'bg-emerald-50 border-emerald-200';
            case 'WARNING': return 'bg-amber-50 border-amber-200';
            case 'CRITICAL': return 'bg-red-50 border-red-200';
            default: return 'bg-gray-50 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Activity className="w-6 h-6 text-purple-600" />
                        System Health Monitor
                    </h2>
                    <p className="text-sm text-gray-500">Real-time system metrics and alerts</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${connected ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                        {connected ? 'Live' : 'Disconnected'}
                    </div>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-purple-600" />
                        Alert Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CPU Threshold (%)</label>
                            <input
                                type="number"
                                value={thresholds?.cpuThreshold || 80}
                                onChange={(e) => setThresholds({ ...thresholds, cpuThreshold: parseFloat(e.target.value) })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Memory Threshold (%)</label>
                            <input
                                type="number"
                                value={thresholds?.memoryThreshold || 85}
                                onChange={(e) => setThresholds({ ...thresholds, memoryThreshold: parseFloat(e.target.value) })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Alert Email</label>
                            <input
                                type="email"
                                value={alertEmail}
                                onChange={(e) => setAlertEmail(e.target.value)}
                                placeholder="admin@example.com"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleSaveThresholds}
                                disabled={saving}
                                className="w-full px-4 py-2.5 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Banner */}
            {currentMetrics && (
                <div className={`rounded-2xl border-2 p-4 ${getStatusBg(currentMetrics.healthStatus)}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {currentMetrics.healthStatus === 'HEALTHY' ? (
                                <CheckCircle className="w-6 h-6 text-emerald-500" />
                            ) : (
                                <AlertTriangle className={`w-6 h-6 ${getStatusColor(currentMetrics.healthStatus)}`} />
                            )}
                            <div>
                                <p className={`font-bold ${getStatusColor(currentMetrics.healthStatus)}`}>
                                    System {currentMetrics.healthStatus}
                                </p>
                                {currentMetrics.alertMessage && (
                                    <p className="text-sm text-gray-600">{currentMetrics.alertMessage}</p>
                                )}
                            </div>
                        </div>
                        <p className="text-sm text-gray-500">
                            Last updated: {new Date(currentMetrics.timestamp).toLocaleTimeString()}
                        </p>
                    </div>
                </div>
            )}

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* CPU Usage */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-blue-50">
                            <Cpu className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className={`text-2xl font-bold ${currentMetrics?.processCpuLoad > 80 ? 'text-red-600' : 'text-gray-900'}`}>
                            {currentMetrics?.processCpuLoad?.toFixed(1) || 0}%
                        </span>
                    </div>
                    <p className="text-sm font-medium text-gray-500">CPU Usage</p>
                    <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${currentMetrics?.processCpuLoad > 80 ? 'bg-red-500' : currentMetrics?.processCpuLoad > 60 ? 'bg-amber-500' : 'bg-blue-500'}`}
                            style={{ width: `${Math.min(currentMetrics?.processCpuLoad || 0, 100)}%` }}
                        />
                    </div>
                </div>

                {/* Memory Usage */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-purple-50">
                            <HardDrive className="w-6 h-6 text-purple-600" />
                        </div>
                        <span className={`text-2xl font-bold ${currentMetrics?.heapMemoryUsagePercent > 85 ? 'text-red-600' : 'text-gray-900'}`}>
                            {currentMetrics?.heapMemoryUsagePercent?.toFixed(1) || 0}%
                        </span>
                    </div>
                    <p className="text-sm font-medium text-gray-500">Memory Usage</p>
                    <p className="text-xs text-gray-400 mt-1">
                        {currentMetrics?.heapMemoryUsed?.toFixed(0) || 0} MB / {currentMetrics?.heapMemoryMax?.toFixed(0) || 0} MB
                    </p>
                    <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${currentMetrics?.heapMemoryUsagePercent > 85 ? 'bg-red-500' : currentMetrics?.heapMemoryUsagePercent > 70 ? 'bg-amber-500' : 'bg-purple-500'}`}
                            style={{ width: `${Math.min(currentMetrics?.heapMemoryUsagePercent || 0, 100)}%` }}
                        />
                    </div>
                </div>

                {/* Active Threads */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-amber-50">
                            <Zap className="w-6 h-6 text-amber-600" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900">
                            {currentMetrics?.activeThreads || 0}
                        </span>
                    </div>
                    <p className="text-sm font-medium text-gray-500">Active Threads</p>
                    <p className="text-xs text-gray-400 mt-1">
                        {currentMetrics?.availableProcessors || 0} processors available
                    </p>
                </div>

                {/* Database Status */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-xl ${currentMetrics?.databaseConnected ? 'bg-emerald-50' : 'bg-red-50'}`}>
                            <Database className={`w-6 h-6 ${currentMetrics?.databaseConnected ? 'text-emerald-600' : 'text-red-600'}`} />
                        </div>
                        <span className={`text-sm font-bold px-3 py-1 rounded-full ${currentMetrics?.databaseConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {currentMetrics?.databaseConnected ? 'Connected' : 'Down'}
                        </span>
                    </div>
                    <p className="text-sm font-medium text-gray-500">Database</p>
                    <p className="text-xs text-gray-400 mt-1">
                        {currentMetrics?.activeConnections || 0} active connections
                    </p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* CPU Chart */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        CPU Usage Over Time
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={metricsHistory}>
                                <defs>
                                    <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#9ca3af" />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
                                    labelStyle={{ fontWeight: 'bold' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="processCpuLoad"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    fill="url(#cpuGradient)"
                                    name="CPU %"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Memory Chart */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <HardDrive className="w-5 h-5 text-purple-600" />
                        Memory Usage Over Time
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={metricsHistory}>
                                <defs>
                                    <linearGradient id="memoryGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#9ca3af" />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
                                    labelStyle={{ fontWeight: 'bold' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="heapMemoryUsagePercent"
                                    stroke="#a855f7"
                                    strokeWidth={2}
                                    fill="url(#memoryGradient)"
                                    name="Memory %"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* System Info */}
            {systemInfo && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Server className="w-5 h-5 text-gray-600" />
                        System Information
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-xs font-medium text-gray-500 uppercase">Java Version</p>
                            <p className="text-sm font-bold text-gray-900 mt-1">{systemInfo.javaVersion}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-xs font-medium text-gray-500 uppercase">Operating System</p>
                            <p className="text-sm font-bold text-gray-900 mt-1">{systemInfo.osName}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-xs font-medium text-gray-500 uppercase">Max Memory</p>
                            <p className="text-sm font-bold text-gray-900 mt-1">{systemInfo.maxMemoryMB} MB</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Uptime
                            </p>
                            <p className="text-sm font-bold text-gray-900 mt-1">
                                {Math.floor(systemInfo.uptimeSeconds / 3600)}h {Math.floor((systemInfo.uptimeSeconds % 3600) / 60)}m
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SystemHealthPanel;
