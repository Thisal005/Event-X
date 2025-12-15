import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, LogOut, LayoutDashboard, User, QrCode } from 'lucide-react';

const DashboardHeader = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Implement logout logic here
        // localStorage.removeItem('token');
        // localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo Section */}
                    <div
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => navigate('/dashboard/organizer')}
                    >
                        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white p-2.5 rounded-xl shadow-lg shadow-purple-500/30 transform group-hover:scale-110 transition-transform duration-200">
                            <LayoutDashboard className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                                GoGather
                            </span>
                            <span className="text-xs font-medium text-gray-500 tracking-wider uppercase">
                                Organizer
                            </span>
                        </div>
                    </div>

                    {/* Navigation Actions */}
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-1 bg-gray-50/50 p-1 rounded-xl border border-gray-100">
                            <button className="px-4 py-2 text-sm font-medium text-purple-600 bg-white rounded-lg shadow-sm">
                                Dashboard
                            </button>
                            <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 rounded-lg transition-colors">
                                Analytics
                            </button>
                        </div>

                        <div className="h-8 w-px bg-gray-200 mx-2 hidden md:block"></div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-3 mr-2">
                                <div className="hidden sm:flex flex-col items-end">
                                    <span className="text-sm font-bold text-gray-900">Organizer</span>
                                    <span className="text-xs text-gray-500">View Profile</span>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center border-2 border-white shadow-md cursor-pointer hover:shadow-lg transition-all duration-200">
                                    <User className="w-5 h-5 text-purple-600" />
                                </div>
                            </div>

                            <Link
                                to="/dashboard/organizer/scanner"
                                className="hidden sm:flex items-center px-5 py-2.5 bg-white text-purple-600 border border-purple-200 text-sm font-bold rounded-xl shadow-sm hover:bg-purple-50 hover:shadow-md transform hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
                            >
                                <QrCode className="w-5 h-5 mr-2" />
                                Scan Tickets
                            </Link>

                            <Link
                                to="/dashboard/organizer/create-event"
                                className="hidden sm:flex items-center px-5 py-2.5 bg-purple-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-purple-500/30 hover:bg-purple-700 hover:shadow-purple-500/40 transform hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Create Event
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;
