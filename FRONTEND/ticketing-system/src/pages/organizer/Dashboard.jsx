import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardHeader from '../../components/DashboardHeader';
import {
    Plus, Calendar, MapPin, Users, DollarSign,
    Search, Filter, MoreVertical, Clock, Tag, ArrowRight
} from 'lucide-react';
import { getMyEvents } from '../../api/eventService';

const OrganizerDashboard = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                // Simulate network delay for smooth skeleton transition
                // await new Promise(resolve => setTimeout(resolve, 800));
                const data = await getMyEvents();
                setEvents(data);
            } catch (error) {
                console.error("Failed to fetch events", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const stats = [
        {
            label: 'Total Events',
            value: events.length || '0',
            icon: Calendar,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            border: 'border-blue-100'
        },
        {
            label: 'Total Attendees',
            value: '1,234',
            icon: Users,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            border: 'border-purple-100'
        },
        {
            label: 'Total Revenue',
            value: '$12,450',
            icon: DollarSign,
            color: 'text-green-600',
            bg: 'bg-green-50',
            border: 'border-green-100'
        },
    ];

    const filteredEvents = events.filter(event =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.venue?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50/50">
            <DashboardHeader />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    {stats.map((stat, index) => (
                        <div key={index} className={`bg-white p-6 rounded-2xl shadow-sm border ${stat.border} hover:shadow-lg transition-all duration-300 group`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                                    <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight group-hover:scale-105 transition-transform origin-left">
                                        {stat.value}
                                    </h3>
                                </div>
                                <div className={`p-4 rounded-xl ${stat.bg} ${stat.color} transform group-hover:rotate-12 transition-transform duration-300`}>
                                    <stat.icon className="w-7 h-7" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Content Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Your Events</h1>
                        <p className="text-gray-500 text-sm mt-1">Manage and track all your upcoming events</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search events..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 w-64 transition-all shadow-sm hover:shadow-md"
                            />
                        </div>
                        <button className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:text-purple-600 hover:border-purple-200 hover:bg-purple-50 transition-all shadow-sm hover:shadow-md">
                            <Filter className="w-5 h-5" />
                        </button>
                        <Link
                            to="/dashboard/organizer/create-event"
                            className="hidden sm:flex items-center px-5 py-2.5 bg-purple-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-purple-500/30 hover:bg-purple-700 hover:shadow-purple-500/40 transform hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            New Event
                        </Link>
                    </div>
                </div>

                {/* Events Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-96 animate-pulse">
                                <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
                                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 border-dashed">
                        <div className="mx-auto w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                            <Calendar className="w-8 h-8 text-purple-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No events found</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mb-8">
                            {searchTerm ? "No events match your search criteria." : "Get started by creating your first event to start selling tickets."}
                        </p>
                        {!searchTerm && (
                            <Link
                                to="/dashboard/organizer/create-event"
                                className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 hover:bg-purple-700 hover:shadow-purple-500/50 transition-all transform hover:-translate-y-1"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Create First Event
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredEvents.map((event) => (
                            <div key={event.id} className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-100 overflow-hidden transition-all duration-300 transform hover:-translate-y-1">
                                {/* Image Container */}
                                <div className="relative h-48 overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <img
                                        src={event.bannerImage || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80'}
                                        alt={event.name}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute top-4 right-4 z-20">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide shadow-sm backdrop-blur-md
                                            ${event.status === 'PUBLISHED'
                                                ? 'bg-green-500/90 text-white'
                                                : 'bg-yellow-500/90 text-white'
                                            }`}>
                                            {event.status}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-4 left-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                        <span className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-white text-xs font-medium border border-white/30">
                                            <Tag className="w-3 h-3 mr-1.5" />
                                            {event.category || 'General'}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="text-xs font-bold text-purple-600 mb-1 uppercase tracking-wider">
                                                {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 leading-tight line-clamp-1 group-hover:text-purple-600 transition-colors">
                                                {event.name}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center mr-3 text-gray-400 group-hover:bg-purple-50 group-hover:text-purple-500 transition-colors">
                                                <MapPin className="w-4 h-4" />
                                            </div>
                                            <span className="font-medium line-clamp-1">{event.venue || 'No venue specified'}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center mr-3 text-gray-400 group-hover:bg-purple-50 group-hover:text-purple-500 transition-colors">
                                                <Clock className="w-4 h-4" />
                                            </div>
                                            <span className="font-medium">
                                                {new Date(event.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <span className="text-sm font-medium text-gray-500">
                                            <span className="font-bold text-gray-900">$0.00</span> raised
                                        </span>
                                        <Link
                                            to={`/dashboard/organizer/events/${event.id}`}
                                            className="inline-flex items-center text-sm font-bold text-purple-600 hover:text-purple-700 transition-colors"
                                        >
                                            Manage
                                            <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default OrganizerDashboard;
