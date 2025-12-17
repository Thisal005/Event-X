import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getAllUsers, deleteUser, getAdminStats, updateUser } from '../../api/adminService';
import { getAllEventsForAdmin, publishEvent, deleteEvent, approveEvent, rejectEvent } from '../../api/eventService';
import { getAllRoles } from '../../api/adminService';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import SystemHealthPanel from '../../components/admin/SystemHealthPanel';
import RoleManager from '../../components/admin/RoleManager';
import AuditLogViewer from '../../components/admin/AuditLogViewer';
import EventStatsPanel from '../../components/admin/EventStatsPanel';
import {
    Users, Calendar, Trash2, CheckCircle, Clock,
    DollarSign, TrendingUp, Ticket, BarChart3, PieChart,
    Search, ChevronRight, User, Shield, MapPin, ArrowUpRight, ArrowDownRight, XCircle, Edit2, Eye
} from 'lucide-react';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user, token } = useSelector(state => state.auth);
    const [activeSection, setActiveSection] = useState('overview');
    const [users, setUsers] = useState([]);
    const [events, setEvents] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedEventForStats, setSelectedEventForStats] = useState(null);

    useEffect(() => {
        // Only fetch data if we have a valid token
        if (token) {
            fetchAllData();
        }
    }, [token]);

    const [roles, setRoles] = useState([]); // Custom roles
    const [auditLogs, setAuditLogs] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [userFormData, setUserFormData] = useState({ role: '', customRoleId: '' });

    // ... stats state

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [usersData, eventsData, statsData, rolesData] = await Promise.all([
                getAllUsers(),
                getAllEventsForAdmin(),
                getAdminStats(),
                getAllRoles()
            ]);
            setUsers(usersData || []);
            setEvents(eventsData || []);
            setStats(statsData);
            setRoles(rolesData || []);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            try {
                await deleteUser(id);
                setUsers(users.filter(user => user.id !== id));
            } catch (error) {
                console.error("Failed to delete user", error);
                alert("Failed to delete user");
            }
        }
    };

    const handlePublishEvent = async (id) => {
        try {
            await publishEvent(id);
            setEvents(events.map(e => e.id === id ? { ...e, status: 'PUBLISHED' } : e));
            setStats({ ...stats, activeEvents: stats.activeEvents + 1 });
        } catch (error) {
            console.error("Failed to publish event", error);
            alert("Failed to publish event");
        }
    };

    const handleApproveEvent = async (id) => {
        try {
            await approveEvent(id);
            setEvents(events.map(e => e.id === id ? { ...e, approvalStatus: 'APPROVED', status: 'PUBLISHED' } : e));
            setStats({ ...stats, publishedEvents: (stats.publishedEvents || 0) + 1, pendingEvents: Math.max(0, (stats.pendingEvents || 0) - 1) });
        } catch (error) {
            console.error("Failed to approve event", error);
            alert("Failed to approve event");
        }
    };

    const handleRejectEvent = async (id) => {
        if (window.confirm("Are you sure you want to reject this event?")) {
            try {
                await rejectEvent(id);
                setEvents(events.map(e => e.id === id ? { ...e, approvalStatus: 'REJECTED' } : e));
                setStats({ ...stats, pendingEvents: Math.max(0, (stats.pendingEvents || 0) - 1) });
            } catch (error) {
                console.error("Failed to reject event", error);
                alert("Failed to reject event");
            }
        }
    };

    const navigateToPromos = () => {
        navigate('/dashboard/admin/promos');
    };

    const handleDeleteEvent = async (id) => {
        if (window.confirm("Are you sure you want to delete this event?")) {
            try {
                await deleteEvent(id);
                setEvents(events.filter(e => e.id !== id));
            } catch (error) {
                console.error("Failed to delete event", error);
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredEvents = events.filter(event =>
        event.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.venue?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const statsCards = [
        {
            label: 'Total Revenue',
            value: `$${(stats?.totalRevenue || 0).toLocaleString()}`,
            icon: DollarSign,
            trend: '+12.5%',
            trendUp: true,
            color: 'from-emerald-500 to-teal-600',
            bg: 'bg-emerald-50',
            iconColor: 'text-emerald-600'
        },
        {
            label: 'Total Events',
            value: stats?.totalEvents || '0',
            icon: Calendar,
            trend: '+8.2%',
            trendUp: true,
            color: 'from-purple-500 to-indigo-600',
            bg: 'bg-purple-50',
            iconColor: 'text-purple-600'
        },
        {
            label: 'Total Users',
            value: stats?.totalUsers || '0',
            icon: Users,
            trend: '+23.1%',
            trendUp: true,
            color: 'from-blue-500 to-cyan-600',
            bg: 'bg-blue-50',
            iconColor: 'text-blue-600'
        },
        {
            label: 'Tickets Sold',
            value: stats?.totalTicketsSold || '0',
            icon: Ticket,
            trend: '+15.3%',
            trendUp: true,
            color: 'from-amber-500 to-orange-600',
            bg: 'bg-amber-50',
            iconColor: 'text-amber-600'
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50/50 flex">
            {/* Sidebar - Fixed Position */}
            <AdminSidebar
                user={user}
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                handleLogout={handleLogout}
            />

            {/* Main Content - With left margin for fixed sidebar */}
            <div className="flex-1 flex flex-col min-w-0 lg:ml-72">
                {/* Header */}
                <AdminHeader
                    user={user}
                    activeSection={activeSection}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    setSidebarOpen={setSidebarOpen}
                />

                {/* Content Area */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
                                    <div className="h-10 w-10 bg-gray-200 rounded-xl mb-4" />
                                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                                    <div className="h-8 bg-gray-200 rounded w-3/4" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            {/* Overview Section */}
                            {activeSection === 'overview' && (
                                <div className="space-y-8">
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {statsCards.map((stat, index) => (
                                            <div
                                                key={index}
                                                className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300"
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className={`p-3 rounded-xl ${stat.bg}`}>
                                                        <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                                                    </div>
                                                    <div className={`flex items-center gap-1 text-xs font-bold ${stat.trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
                                                        {stat.trendUp ? (
                                                            <ArrowUpRight className="w-3 h-3" />
                                                        ) : (
                                                            <ArrowDownRight className="w-3 h-3" />
                                                        )}
                                                        {stat.trend}
                                                    </div>
                                                </div>
                                                <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                                                <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                                                    {stat.value}
                                                </h3>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Quick Insights */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Revenue Breakdown */}
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-lg font-bold text-gray-900">Revenue Overview</h3>
                                                <PieChart className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                                        <span className="text-sm font-medium text-gray-700">Total Revenue</span>
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-900">${(stats?.totalRevenue || 0).toLocaleString()}</span>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                                                        <span className="text-sm font-medium text-gray-700">Total Orders</span>
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-900">{stats?.totalOrders || 0}</span>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-3 h-3 rounded-full bg-purple-500" />
                                                        <span className="text-sm font-medium text-gray-700">Avg. Order Value</span>
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-900">
                                                        ${stats?.totalOrders > 0 ? ((stats?.totalRevenue || 0) / stats.totalOrders).toFixed(2) : '0.00'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* User Breakdown */}
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-lg font-bold text-gray-900">User Breakdown</h3>
                                                <Users className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                                            <User className="w-4 h-4 text-blue-600" />
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-700">Customers</span>
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-900">{stats?.customers || 0}</span>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                                                            <Calendar className="w-4 h-4 text-purple-600" />
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-700">Organizers</span>
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-900">{stats?.organizers || 0}</span>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                                                            <Shield className="w-4 h-4 text-amber-600" />
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-700">Admins</span>
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-900">
                                                        {(stats?.totalUsers || 0) - (stats?.customers || 0) - (stats?.organizers || 0)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Events Overview */}
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-lg font-bold text-gray-900">Events Status</h3>
                                                <BarChart3 className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                                                    <div className="flex items-center gap-3">
                                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                                        <span className="text-sm font-medium text-gray-700">Published</span>
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-900">{stats?.publishedEvents || 0}</span>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
                                                    <div className="flex items-center gap-3">
                                                        <Clock className="w-5 h-5 text-yellow-600" />
                                                        <span className="text-sm font-medium text-gray-700">Pending/Draft</span>
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-900">{stats?.pendingEvents || 0}</span>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                                    <div className="flex items-center gap-3">
                                                        <Calendar className="w-5 h-5 text-gray-600" />
                                                        <span className="text-sm font-medium text-gray-700">Total Events</span>
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-900">{stats?.totalEvents || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recent Events Table */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="p-6 border-b border-gray-100">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-lg font-bold text-gray-900">Recent Events</h3>
                                                <button
                                                    onClick={() => setActiveSection('events')}
                                                    className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1"
                                                >
                                                    View All
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-gray-50/50">
                                                    <tr>
                                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Event</th>
                                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {events.slice(0, 5).map((event) => (
                                                        <tr key={event.id} className="hover:bg-gray-50/50 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden">
                                                                        {event.bannerImage ? (
                                                                            <img src={event.bannerImage} alt="" className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                                <Calendar className="w-5 h-5" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-semibold text-gray-900">{event.name}</p>
                                                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                                                            <MapPin className="w-3 h-3" />
                                                                            {event.venue || 'No venue'}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                                {new Date(event.date).toLocaleDateString()}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex flex-col gap-1">
                                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${event.status === 'PUBLISHED'
                                                                        ? 'bg-green-50 text-green-700'
                                                                        : event.status === 'CANCELLED' ? 'bg-red-50 text-red-700'
                                                                            : 'bg-yellow-50 text-yellow-700'
                                                                        }`}>
                                                                        {event.status}
                                                                    </span>
                                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${event.approvalStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-700'
                                                                        : event.approvalStatus === 'REJECTED' ? 'bg-red-50 text-red-700'
                                                                            : 'bg-orange-50 text-orange-700'
                                                                        }`}>
                                                                        {event.approvalStatus || 'PENDING'}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    {event.approvalStatus === 'PENDING' && (
                                                                        <>
                                                                            <button
                                                                                onClick={() => handleApproveEvent(event.id)}
                                                                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                                                title="Approve Event"
                                                                            >
                                                                                <CheckCircle className="w-4 h-4" />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleRejectEvent(event.id)}
                                                                                className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                                                title="Reject Event"
                                                                            >
                                                                                <XCircle className="w-4 h-4" />
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                    <button
                                                                        onClick={() => setSelectedEventForStats(event)}
                                                                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                                        title="View Stats"
                                                                    >
                                                                        <Eye className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteEvent(event.id)}
                                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                        title="Delete"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Events Section */}
                            {activeSection === 'events' && (
                                <div className="space-y-6">
                                    {selectedEventForStats ? (
                                        /* Show Stats Panel when event is selected */
                                        <EventStatsPanel
                                            event={selectedEventForStats}
                                            onBack={() => setSelectedEventForStats(null)}
                                        />
                                    ) : (
                                        /* Show Event List */
                                        <>
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div>
                                                    <h2 className="text-xl font-bold text-gray-900">All Events</h2>
                                                    <p className="text-sm text-gray-500">Manage and monitor all platform events</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                        <input
                                                            type="text"
                                                            placeholder="Search events..."
                                                            value={searchTerm}
                                                            onChange={(e) => setSearchTerm(e.target.value)}
                                                            className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 w-64 transition-all shadow-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {filteredEvents.map((event) => (
                                                    <div key={event.id} className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
                                                        <div
                                                            className="relative h-40 overflow-hidden cursor-pointer"
                                                            onClick={() => setSelectedEventForStats(event)}
                                                        >
                                                            <img
                                                                src={event.bannerImage || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80'}
                                                                alt={event.name}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <span className="text-white font-medium flex items-center gap-2">
                                                                    <Eye className="w-5 h-5" />
                                                                    View Stats
                                                                </span>
                                                            </div>
                                                            <div className="absolute top-3 right-3 flex flex-col gap-1">
                                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold backdrop-blur-md ${event.status === 'PUBLISHED'
                                                                    ? 'bg-green-500/90 text-white'
                                                                    : event.status === 'CANCELLED' ? 'bg-red-500/90 text-white'
                                                                        : 'bg-yellow-500/90 text-white'
                                                                    }`}>
                                                                    {event.status}
                                                                </span>
                                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold backdrop-blur-md ${event.approvalStatus === 'APPROVED' ? 'bg-emerald-500/90 text-white'
                                                                    : event.approvalStatus === 'REJECTED' ? 'bg-red-500/90 text-white'
                                                                        : 'bg-orange-500/90 text-white'
                                                                    }`}>
                                                                    {event.approvalStatus || 'PENDING'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="p-5">
                                                            <h3
                                                                className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 cursor-pointer hover:text-purple-600 transition-colors"
                                                                onClick={() => setSelectedEventForStats(event)}
                                                            >
                                                                {event.name}
                                                            </h3>
                                                            <div className="space-y-2 mb-4">
                                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                                    <Calendar className="w-4 h-4 text-purple-600" />
                                                                    {new Date(event.date).toLocaleDateString()}
                                                                </div>
                                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                                    <MapPin className="w-4 h-4 text-purple-600" />
                                                                    {event.venue || 'No venue'}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                                                                {event.approvalStatus === 'PENDING' && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => handleApproveEvent(event.id)}
                                                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 font-medium rounded-xl hover:bg-emerald-100 transition-colors"
                                                                        >
                                                                            <CheckCircle className="w-4 h-4" />
                                                                            Approve
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleRejectEvent(event.id)}
                                                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-50 text-orange-700 font-medium rounded-xl hover:bg-orange-100 transition-colors"
                                                                        >
                                                                            <XCircle className="w-4 h-4" />
                                                                            Reject
                                                                        </button>
                                                                    </>
                                                                )}
                                                                <button
                                                                    onClick={() => setSelectedEventForStats(event)}
                                                                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-50 text-purple-700 font-medium rounded-xl hover:bg-purple-100 transition-colors"
                                                                    title="View Stats"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                    Stats
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteEvent(event.id)}
                                                                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 font-medium rounded-xl hover:bg-red-100 transition-colors"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Users Section */}
                            {activeSection === 'users' && (
                                <div className="space-y-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">All Users</h2>
                                            <p className="text-sm text-gray-500">Manage platform users and their roles</p>
                                        </div>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search users..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 w-64 transition-all shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-gray-50/50">
                                                    <tr>
                                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {filteredUsers.map((user) => (
                                                        <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${user.role === 'ADMIN' ? 'bg-gradient-to-br from-purple-500 to-indigo-600' :
                                                                        user.role === 'ORGANIZER' ? 'bg-gradient-to-br from-blue-500 to-cyan-600' :
                                                                            'bg-gradient-to-br from-emerald-500 to-teal-600'
                                                                        }`}>
                                                                        {user.name?.charAt(0) || 'U'}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                                                                        <p className="text-xs text-gray-500">ID: {user.id}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                                                            <td className="px-6 py-4">
                                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700' :
                                                                    user.role === 'ORGANIZER' ? 'bg-blue-50 text-blue-700' :
                                                                        'bg-green-50 text-green-700'
                                                                    }`}>
                                                                    {user.role}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <button
                                                                        onClick={() => {
                                                                            setEditingUser(user);
                                                                            setUserFormData({ role: user.role, customRoleId: user.customRole?.id || '' });
                                                                        }}
                                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                        title="Edit Role"
                                                                    >
                                                                        <Edit2 className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteUser(user.id)}
                                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                        title="Delete User"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Revenue Section */}
                            {activeSection === 'revenue' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Revenue & Accounting</h2>
                                        <p className="text-sm text-gray-500">Financial overview and transaction history</p>
                                    </div>

                                    {/* Revenue Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                                                    <DollarSign className="w-6 h-6" />
                                                </div>
                                                <span className="text-xs font-bold bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                                                    Total
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium text-emerald-100 mb-1">Total Revenue</p>
                                            <p className="text-3xl font-extrabold">${(stats?.totalRevenue || 0).toLocaleString()}</p>
                                        </div>

                                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                                                    <Ticket className="w-6 h-6" />
                                                </div>
                                                <span className="text-xs font-bold bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                                                    Sales
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium text-blue-100 mb-1">Tickets Sold</p>
                                            <p className="text-3xl font-extrabold">{stats?.totalTicketsSold || 0}</p>
                                        </div>

                                        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                                                    <TrendingUp className="w-6 h-6" />
                                                </div>
                                                <span className="text-xs font-bold bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                                                    Avg.
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium text-purple-100 mb-1">Avg. Order Value</p>
                                            <p className="text-3xl font-extrabold">
                                                ${stats?.totalOrders > 0 ? ((stats?.totalRevenue || 0) / stats.totalOrders).toFixed(2) : '0.00'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Summary Table */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                        <h3 className="text-lg font-bold text-gray-900 mb-6">Financial Summary</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                                <span className="text-sm font-medium text-gray-600">Total Orders</span>
                                                <span className="text-lg font-bold text-gray-900">{stats?.totalOrders || 0}</span>
                                            </div>
                                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                                <span className="text-sm font-medium text-gray-600">Total Tickets Sold</span>
                                                <span className="text-lg font-bold text-gray-900">{stats?.totalTicketsSold || 0}</span>
                                            </div>
                                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                                <span className="text-sm font-medium text-gray-600">Revenue per Event (Avg.)</span>
                                                <span className="text-lg font-bold text-gray-900">
                                                    ${stats?.totalEvents > 0 ? ((stats?.totalRevenue || 0) / stats.totalEvents).toFixed(2) : '0.00'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border-2 border-emerald-200">
                                                <span className="text-sm font-bold text-emerald-700">Net Revenue</span>
                                                <span className="text-xl font-extrabold text-emerald-700">${(stats?.totalRevenue || 0).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* System Health Section */}
                            {activeSection === 'system-health' && (
                                <SystemHealthPanel />
                            )}

                            {activeSection === 'roles' && (
                                <RoleManager />
                            )}

                            {activeSection === 'audit-logs' && (
                                <AuditLogViewer />
                            )}
                        </>
                    )}
                </main>

                {/* User Edit Modal */}
                {editingUser && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-900">Edit User Role</h3>
                                <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-600">
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Standard Role</label>
                                    <select
                                        value={userFormData.role}
                                        onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                                    >
                                        <option value="CUSTOMER">CUSTOMER</option>
                                        <option value="ORGANIZER">ORGANIZER</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Custom Role (Permissions)</label>
                                    <select
                                        value={userFormData.customRoleId}
                                        onChange={(e) => setUserFormData({ ...userFormData, customRoleId: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                                    >
                                        <option value="">None</option>
                                        {roles.map(role => (
                                            <option key={role.id} value={role.id}>{role.name}</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">Assign additional granular permissions</p>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button onClick={() => setEditingUser(null)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">
                                        Cancel
                                    </button>
                                    <button
                                        onClick={async () => {
                                            try {
                                                await updateUser(editingUser.id, userFormData);
                                                setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...userFormData, customRole: roles.find(r => r.id == userFormData.customRoleId) } : u));
                                                setEditingUser(null);
                                            } catch (e) {
                                                alert("Failed to update user");
                                            }
                                        }}
                                        className="px-6 py-2 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


            </div>
        </div>
    );
};

export default AdminDashboard;
