import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

const LatestEvents = ({ events }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    // Filter only upcoming events and sort by ID (newest added first)
    const upcomingEvents = events
        .filter(event => new Date(event.date) >= new Date())
        .sort((a, b) => b.id - a.id)
        .slice(0, 5); // Take top 5

    useEffect(() => {
        if (upcomingEvents.length <= 1) return;

        const interval = setInterval(() => {
            handleNext();
        }, 5000); // Auto-slide every 5 seconds

        return () => clearInterval(interval);
    }, [currentIndex, upcomingEvents.length]);

    const handleNext = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentIndex((prev) => (prev + 1) % upcomingEvents.length);
        setTimeout(() => setIsAnimating(false), 500);
    };

    const handlePrev = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentIndex((prev) => (prev - 1 + upcomingEvents.length) % upcomingEvents.length);
        setTimeout(() => setIsAnimating(false), 500);
    };

    if (upcomingEvents.length === 0) return null;

    const currentEvent = upcomingEvents[currentIndex];

    return (
        <div className="w-full mb-12">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900">
                    Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Happenings</span>
                </h2>

                {upcomingEvents.length > 1 && (
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrev}
                            className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleNext}
                            className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>

            <div className="relative bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100 min-h-[400px] md:h-[450px]">
                {/* Background Blur Effect */}
                <div
                    className="absolute inset-0 bg-cover bg-center blur-3xl opacity-20 transform scale-110 transition-all duration-700"
                    style={{ backgroundImage: `url(${currentEvent.bannerImage || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80'})` }}
                ></div>

                <div className="relative h-full flex flex-col md:flex-row">
                    {/* Image Section */}
                    <div className="w-full md:w-3/5 h-64 md:h-full relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent z-10"></div>
                        <img
                            src={currentEvent.bannerImage || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80'}
                            alt={currentEvent.name}
                            className={`w-full h-full object-cover transition-transform duration-700 ${isAnimating ? 'scale-105' : 'scale-100 group-hover:scale-105'}`}
                        />
                        <div className="absolute top-6 left-6 z-20">
                            <span className="bg-white/90 backdrop-blur-md text-gray-900 text-sm font-bold px-4 py-2 rounded-xl shadow-lg">
                                {currentEvent.category}
                            </span>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="w-full md:w-2/5 p-8 md:p-12 flex flex-col justify-center bg-white/60 backdrop-blur-3xl md:bg-white relative">
                        {/* Slide Indicator */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
                            <div
                                className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-500 ease-out"
                                style={{ width: `${((currentIndex + 1) / upcomingEvents.length) * 100}%` }}
                            ></div>
                        </div>

                        <div className={`transition-all duration-500 transform ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                            <div className="flex items-center gap-2 text-purple-600 font-bold mb-4">
                                <Calendar className="w-5 h-5" />
                                <span>
                                    {new Date(currentEvent.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                                </span>
                            </div>

                            <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight line-clamp-2">
                                {currentEvent.name}
                            </h3>

                            <div className="space-y-3 mb-8 text-gray-600">
                                <div className="flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-gray-400" />
                                    <span>{new Date(currentEvent.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-gray-400" />
                                    <span className="line-clamp-1">{currentEvent.venue}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <Link
                                    to={`/events/${currentEvent.id}`}
                                    className="px-8 py-4 bg-gray-900 text-white font-bold rounded-xl shadow-xl shadow-gray-900/20 hover:bg-gray-800 transform hover:-translate-y-0.5 transition-all flex items-center gap-2"
                                >
                                    Book Now
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                                <div className="text-right flex-1">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Starting from</p>
                                    <p className="text-2xl font-extrabold text-gray-900">
                                        ${Math.min(...(currentEvent.ticketTypes?.map(t => t.price) || [0]))}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dots */}
            {upcomingEvents.length > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    {upcomingEvents.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setIsAnimating(true);
                                setCurrentIndex(idx);
                                setTimeout(() => setIsAnimating(false), 500);
                            }}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-purple-600' : 'bg-gray-300 hover:bg-gray-400'
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default LatestEvents;
