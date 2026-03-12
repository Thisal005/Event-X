import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Search, ArrowRight, Filter, Music, Briefcase, Monitor, Palette } from 'lucide-react';
import { getAllEvents } from '../api/eventService';
import Navbar from '../components/Navbar';
import InteractiveGridBackground from '../components/InteractiveGridBackground';

import LatestEvents from '../components/LatestEvents';

const Home = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await getAllEvents();
                setEvents(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Failed to fetch events", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const filteredEvents = events.filter(event =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (categoryFilter === 'All' || event.category === categoryFilter)
    );

    const categories = [
        { name: 'All', icon: null },
        { name: 'Music', icon: <Music className="w-4 h-4" /> },
        { name: 'Business', icon: <Briefcase className="w-4 h-4" /> },
        { name: 'Tech', icon: <Monitor className="w-4 h-4" /> },
        { name: 'Arts', icon: <Palette className="w-4 h-4" /> },
    ];

    return (
        <div className="min-h-screen bg-transparent flex flex-col relative">
            {/* Interactive Grid Background */}
            <InteractiveGridBackground />

            {/* Content Layer */}
            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                {/* Hero Section */}
                <div className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
                    {/* Background Blobs */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-purple-200/30 blur-3xl animate-blob"></div>
                        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-200/30 blur-3xl animate-blob animation-delay-2000"></div>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
                            Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Unforgettable</span><br className="hidden md:block" /> Experiences
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                            Find and book the best events in your city. From live music to tech conferences, we have it all.
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-2 flex flex-col md:flex-row items-center gap-2 border border-gray-100">
                            <div className="flex-1 w-full relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search for events, venues, or artists..."
                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-transparent focus:bg-gray-50 outline-none text-gray-800 placeholder-gray-400 transition-colors"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="h-8 w-px bg-gray-200 hidden md:block"></div>
                            <div className="w-full md:w-auto">
                                <button className="w-full md:w-auto px-8 py-3 bg-gray-900 text-white font-bold rounded-xl shadow-lg shadow-gray-900/20 hover:bg-gray-800 transform hover:-translate-y-0.5 transition-all">
                                    Search
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">

                    {/* Latest Events Slide Show */}
                    {!loading && events.length > 0 && <LatestEvents events={events} />}

                    {/* Filters */}
                    <div className="flex items-center gap-4 overflow-x-auto pb-8 scrollbar-hide">
                        {categories.map((cat) => (
                            <button
                                key={cat.name}
                                onClick={() => setCategoryFilter(cat.name)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${categoryFilter === cat.name
                                    ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                {cat.icon}
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Events Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-pulse">
                                    <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
                                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    ) : filteredEvents.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 border-dashed">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                <Search className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No events found</h3>
                            <p className="text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
                            <button
                                onClick={() => { setSearchTerm(''); setCategoryFilter('All'); }}
                                className="mt-6 text-purple-600 font-bold hover:text-purple-700 hover:underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredEvents.map((event) => (
                                <Link
                                    to={`/events/${event.id}`}
                                    key={event.id}
                                    className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 transform hover:-translate-y-1"
                                >
                                    <div className="aspect-[16/9] relative overflow-hidden bg-gray-100">
                                        <img
                                            src={event.bannerImage || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80'}
                                            alt={event.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute top-3 left-3">
                                            <span className="bg-white/90 backdrop-blur-md text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                                                {event.category}
                                            </span>
                                        </div>
                                        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="bg-white/90 backdrop-blur-md p-2 rounded-full shadow-lg">
                                                <ArrowRight className="w-5 h-5 text-gray-900" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex items-center gap-2 text-sm text-purple-600 font-bold mb-3">
                                            <Calendar className="w-4 h-4" />
                                            <span>
                                                {new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-purple-600 transition-colors">
                                            {event.name}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 line-clamp-1">
                                            <MapPin className="w-4 h-4 shrink-0" />
                                            <span>{event.venue || 'TBA'}</span>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Starting from</span>
                                            <span className="text-xl font-bold text-gray-900">
                                                ${Math.min(...(event.ticketTypes?.map(t => t.price) || [0]))}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </main>

                {/* Footer */}
                <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-100 py-12 mt-auto">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-center md:text-left">
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">GoGather</span>
                            <p className="text-sm text-gray-500 mt-2">© 2024 GoGather. All rights reserved.</p>
                        </div>
                        <div className="flex gap-8 text-sm text-gray-500 font-medium">
                            <a href="#" className="hover:text-gray-900 transition-colors">About</a>
                            <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
                            <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
                            <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default Home;
