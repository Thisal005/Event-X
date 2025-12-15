import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Menu, X, User, LogOut, Ticket, LayoutDashboard, Search } from 'lucide-react';
import { logout } from '../store/authSlice';

const Navbar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, isAuthenticated } = useSelector(state => state.auth);
    const [scrolled, setScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        setShowProfileMenu(false);
        navigate('/login');
    };

    return (
        <nav
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled
                ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 py-3'
                : 'bg-transparent py-5'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white p-2 rounded-xl shadow-lg shadow-purple-500/30 transform group-hover:scale-110 transition-transform duration-200">
                            <Ticket className="w-5 h-5" />
                        </div>
                        <span className={`text-xl font-bold tracking-tight transition-colors ${scrolled ? 'text-gray-900' : 'text-gray-900'}`}>
                            GoGather
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link to="/" className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors">
                            Explore
                        </Link>
                        {/* <Link to="/events" className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors">
                            Events
                        </Link> */}

                        {isAuthenticated ? (
                            <div className="flex items-center gap-4">
                                {(user?.role === 'ORGANIZER' || user?.role === 'ADMIN') && (
                                    <Link
                                        to="/dashboard/organizer"
                                        className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-semibold hover:bg-purple-100 transition-all"
                                    >
                                        <LayoutDashboard className="w-4 h-4" />
                                        Dashboard
                                    </Link>
                                )}

                                <div className="relative">
                                    <button
                                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                                        className="flex items-center gap-2 focus:outline-none"
                                    >
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 border-2 border-white shadow-md flex items-center justify-center text-purple-600">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 hidden lg:block">
                                            {user?.name || 'Account'}
                                        </span>
                                    </button>

                                    {/* Dropdown */}
                                    {showProfileMenu && (
                                        <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                            <div className="px-4 py-3 border-b border-gray-50">
                                                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                            </div>
                                            <Link
                                                to="/my-tickets"
                                                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                onClick={() => setShowProfileMenu(false)}
                                            >
                                                <Ticket className="w-4 h-4" />
                                                My Tickets
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Sign Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    to="/login"
                                    className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors px-4 py-2"
                                >
                                    Log in
                                </Link>
                                <Link
                                    to="/login" // Assuming login page handles signup or has a toggle
                                    className="px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-full shadow-lg shadow-gray-900/20 hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5 transition-all w-fit"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-gray-600"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-xl p-4 flex flex-col gap-4 animate-in slide-in-from-top-5">
                    <Link to="/" className="text-base font-medium text-gray-700 p-2">Explore</Link>
                    {isAuthenticated ? (
                        <>
                            <div className="border-t border-gray-100 pt-4 mt-2">
                                <div className="flex items-center gap-3 px-2 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{user?.name}</p>
                                        <p className="text-xs text-gray-500">{user?.role}</p>
                                    </div>
                                </div>
                                {(user?.role === 'ORGANIZER' || user?.role === 'ADMIN') && (
                                    <Link
                                        to="/dashboard/organizer"
                                        className="flex items-center gap-2 p-2 text-purple-600 font-medium"
                                    >
                                        <LayoutDashboard className="w-4 h-4" />
                                        Organizer Dashboard
                                    </Link>
                                )}
                                <Link to="/my-tickets" className="flex items-center gap-2 p-2 text-gray-700">
                                    <Ticket className="w-4 h-4" />
                                    My Tickets
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left flex items-center gap-2 p-2 text-red-600"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
                            <Link
                                to="/login"
                                className="w-full text-center py-2.5 rounded-xl border border-gray-200 font-bold text-gray-700"
                            >
                                Log In
                            </Link>
                            <Link
                                to="/login"
                                className="w-full text-center py-2.5 rounded-xl bg-purple-600 text-white font-bold shadow-lg shadow-purple-200"
                            >
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
