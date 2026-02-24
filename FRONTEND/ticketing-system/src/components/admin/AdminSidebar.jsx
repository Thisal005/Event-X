import React from 'react';
import { Link } from 'react-router-dom';
import {
    Users, Calendar, Home, LogOut,
    LayoutDashboard, DollarSign, Shield,
    ChevronRight, X, Activity
} from 'lucide-react';

const AdminSidebar = ({
    user,
    activeSection,
    setActiveSection,
    sidebarOpen,
    setSidebarOpen,
    handleLogout
}) => {
    const sidebarItems = [
        { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
        { id: 'events', icon: Calendar, label: 'Events' },
        { id: 'users', icon: Users, label: 'Users' },
        { id: 'roles', icon: Shield, label: 'Roles' },
        { id: 'audit-logs', icon: Shield, label: 'Audit Logs' },
        { id: 'revenue', icon: DollarSign, label: 'Revenue' },
        { id: 'system-health', icon: Activity, label: 'System Health' },
    ];

    return (
        <>
            {/* Mobile Menu Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="flex flex-col h-full">
                    {/* Logo Section */}
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <Link to="/" className="flex items-center gap-3 group">
                                <div className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white p-2.5 rounded-xl shadow-lg shadow-purple-500/30 transform group-hover:scale-110 transition-transform duration-200">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                                        GoGather
                                    </span>
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Admin Panel
                                    </span>
                                </div>
                            </Link>
                            <button
                                className="lg:hidden p-2 text-gray-500 hover:text-gray-700"
                                onClick={() => setSidebarOpen(false)}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1">
                        <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                            Main Menu
                        </p>
                        {sidebarItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveSection(item.id);
                                    setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeSection === item.id
                                    ? 'bg-purple-50 text-purple-700 shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${activeSection === item.id ? 'text-purple-600' : ''}`} />
                                {item.label}
                                {activeSection === item.id && (
                                    <ChevronRight className="w-4 h-4 ml-auto" />
                                )}
                            </button>
                        ))}

                        <div className="pt-6">
                            <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                                Settings
                            </p>
                            <Link
                                to="/"
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
                            >
                                <Home className="w-5 h-5" />
                                Back to Site
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
                            >
                                <LogOut className="w-5 h-5" />
                                Logout
                            </button>
                        </div>
                    </nav>

                    {/* User Section */}
                    <div className="p-4 border-t border-gray-100">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                                {user?.name?.charAt(0) || 'A'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                    {user?.name || 'Admin'}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {user?.email || 'admin@GoGather.com'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;
