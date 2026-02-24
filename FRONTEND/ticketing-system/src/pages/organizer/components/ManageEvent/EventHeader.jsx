import React from 'react';
import { Calendar, MapPin } from 'lucide-react';

const EventHeader = ({ event, formData, activeTab, setActiveTab }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
            <div className="relative h-48 md:h-64">
                <img
                    src={formData.bannerImage instanceof File ? URL.createObjectURL(formData.bannerImage) : (event?.bannerImage || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80')}
                    alt={event?.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-6 left-6 md:left-10 text-white">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-purple-500/90 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                            {event?.status || 'Draft'}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm ${event?.approvalStatus === 'APPROVED' ? 'bg-emerald-500/90 text-white'
                            : event?.approvalStatus === 'REJECTED' ? 'bg-red-500/90 text-white'
                                : 'bg-orange-500/90 text-white'
                            }`}>
                            {event?.approvalStatus || 'PENDING'}
                        </span>
                        <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                            {event?.category}
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">{event?.name}</h1>
                    <div className="flex items-center text-sm md:text-base opacity-90 gap-4">
                        <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> {new Date(event?.date).toLocaleDateString()}</span>
                        <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {event?.venue}</span>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex flex-wrap border-b border-gray-100 px-6 pt-4">
                {['overview', 'edit', 'tickets', 'pricing', 'promos', 'messages', 'staff', 'analytics', 'attendance', 'live'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`mr-8 pb-4 text-sm font-medium capitalize border-b-2 transition-colors ${activeTab === tab
                            ? 'border-purple-600 text-purple-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default EventHeader;
