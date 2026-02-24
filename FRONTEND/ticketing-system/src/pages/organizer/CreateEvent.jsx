import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEvent } from '../../api/eventService';
import {
    Calendar, MapPin, Image as ImageIcon, Ticket,
    Eye, Check, ArrowLeft, ArrowRight, Loader2
} from 'lucide-react';
import DashboardHeader from '../../components/DashboardHeader';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const CreateEvent = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('edit'); // 'edit' or 'preview'
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        date: '',
        venue: '',
        category: '',
        bannerImage: '',
        ticketTypes: [{ name: 'General', price: 0, quantity: 100 }]
    });

    const handleChange = (e) => {
        if (e.target.type === 'file') {
            setFormData({ ...formData, [e.target.name]: e.target.files[0] });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleTicketChange = (index, field, value) => {
        const newTickets = [...formData.ticketTypes];
        newTickets[index][field] = value;
        setFormData({ ...formData, ticketTypes: newTickets });
    };

    const addTicketType = () => {
        setFormData({
            ...formData,
            ticketTypes: [...formData.ticketTypes, { name: '', price: 0, quantity: 0 }]
        });
    };

    const removeTicketType = (index) => {
        if (formData.ticketTypes.length > 1) {
            const newTickets = formData.ticketTypes.filter((_, i) => i !== index);
            setFormData({ ...formData, ticketTypes: newTickets });
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Proceed with form submission

            const data = new FormData();

            const eventObj = {
                name: formData.name,
                description: formData.description,
                date: formData.date,
                venue: formData.venue,
                category: formData.category,
                // bannerImage ignored in JSON, sent as file
                ticketTypes: formData.ticketTypes
            };

            data.append('event', JSON.stringify(eventObj));

            if (formData.bannerImage instanceof File) {
                data.append('file', formData.bannerImage);
            }

            console.log("Submitting Event Data:", eventObj);
            console.log("Submitting FormData keys:", [...data.keys()]);

            await createEvent(data);
            navigate('/dashboard/organizer');
        } catch (error) {
            console.error("Failed to create event", error);

            if (error.response && error.response.status === 401) {
                alert("Session expired. Please login again.");
                navigate('/login');
                return;
            }

            alert("Failed to create event");
        } finally {
            setLoading(false);
        }
    };

    // Calculate minimum price for preview
    const minPrice = formData.ticketTypes.reduce((min, t) => (t.price < min ? t.price : min), formData.ticketTypes[0]?.price || 0);

    return (
        <div className="min-h-screen bg-gray-50/50">
            <DashboardHeader />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Page Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard/organizer')}
                            className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all text-gray-500 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create New Event</h1>
                            <p className="text-gray-500 text-sm mt-1">Fill in the details to publish your event</p>
                        </div>
                    </div>

                    {/* View Toggle */}
                    <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm flex items-center gap-1">
                        <button
                            onClick={() => setViewMode('edit')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'edit'
                                ? 'bg-purple-50 text-purple-700 shadow-sm ring-1 ring-purple-100'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            Edit Details
                        </button>
                        <button
                            onClick={() => setViewMode('preview')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'preview'
                                ? 'bg-purple-50 text-purple-700 shadow-sm ring-1 ring-purple-100'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            <Eye className="w-4 h-4" />
                            Preview
                        </button>
                    </div>
                </div>

                <div className="flex gap-8 items-start">
                    {/* Main Form Section */}
                    <div className={`flex-1 transition-all duration-300 ${viewMode === 'preview' ? 'opacity-50 pointer-events-none hidden md:block' : ''}`}>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-8 space-y-8">
                                {/* Basic Info */}
                                <section className="space-y-6">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-100">
                                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                                            1
                                        </div>
                                        Basic Information
                                    </h3>

                                    <div className="grid grid-cols-1 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Event Name <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                name="name"
                                                required
                                                placeholder="e.g. Summer Music Festival 2024"
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none"
                                                value={formData.name}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                            <div className="bg-white">
                                                <ReactQuill
                                                    theme="snow"
                                                    value={formData.description}
                                                    onChange={(value) => setFormData({ ...formData, description: value })}
                                                    className="h-64 mb-12"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                                <select
                                                    name="category"
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none appearance-none"
                                                    value={formData.category}
                                                    onChange={handleChange}
                                                >
                                                    <option value="">Select Category</option>
                                                    <option value="Music">Music</option>
                                                    <option value="Business">Business</option>
                                                    <option value="Tech">Tech</option>
                                                    <option value="Arts">Arts</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Date & Time <span className="text-red-500">*</span></label>
                                                <input
                                                    type="datetime-local"
                                                    name="date"
                                                    required
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none"
                                                    value={formData.date}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Venue / Location <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    name="venue"
                                                    placeholder="e.g. Grand Convention Center"
                                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none"
                                                    value={formData.venue}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Branding */}
                                <section className="space-y-6">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-100">
                                        <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center text-pink-600">
                                            2
                                        </div>
                                        Event Banner
                                    </h3>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Banner Image</label>
                                        <div className="relative">
                                            <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="file"
                                                name="bannerImage"
                                                accept="image/*"
                                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">Recommended size: 1200x600px</p>
                                    </div>
                                </section>

                                {/* Tickets */}
                                <section className="space-y-6">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-100">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                            3
                                        </div>
                                        Ticket Configuration
                                    </h3>

                                    <div className="space-y-4">
                                        {formData.ticketTypes.map((ticket, index) => (
                                            <div key={index} className="flex gap-4 items-start bg-gray-50 p-4 rounded-xl border border-gray-100 group hover:border-blue-200 transition-colors">
                                                <div className="flex-1 space-y-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ticket Name</label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. VIP Access"
                                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm"
                                                        value={ticket.name}
                                                        onChange={(e) => handleTicketChange(index, 'name', e.target.value)}
                                                    />
                                                </div>
                                                <div className="w-28 space-y-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Price (LKR)</label>
                                                    <input
                                                        type="number"
                                                        placeholder="0.00"
                                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm"
                                                        value={ticket.price}
                                                        onChange={(e) => handleTicketChange(index, 'price', parseFloat(e.target.value))}
                                                    />
                                                </div>
                                                <div className="w-28 space-y-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Qty</label>
                                                    <input
                                                        type="number"
                                                        placeholder="100"
                                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm"
                                                        value={ticket.quantity}
                                                        onChange={(e) => handleTicketChange(index, 'quantity', parseInt(e.target.value))}
                                                    />
                                                </div>
                                                <div className="pt-6">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTicketType(index)}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Remove Ticket Type"
                                                        disabled={formData.ticketTypes.length === 1}
                                                    >
                                                        <span className="sr-only">Remove</span>
                                                        &times;
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={addTicketType}
                                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-bold px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                                        >
                                            <Ticket className="w-4 h-4" />
                                            Add Another Ticket Type
                                        </button>
                                    </div>
                                </section>
                            </div>

                            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                                <button
                                    type="button"
                                    onClick={() => navigate('/dashboard/organizer')}
                                    className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-200 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('preview')}
                                    className="px-8 py-2.5 bg-gray-900 text-white font-bold rounded-xl shadow-lg shadow-gray-900/20 hover:bg-gray-800 transform hover:-translate-y-0.5 transition-all flex items-center gap-2"
                                >
                                    Review & Publish <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Preview / Sidebar Section */}
                    <div className={`w-full md:w-[400px] shrink-0 ${viewMode === 'edit' ? 'hidden md:block' : 'block mx-auto max-w-md'}`}>
                        <div className="sticky top-24 space-y-6">
                            <div className="flex items-center justify-between text-sm font-bold text-gray-400 uppercase tracking-wider">
                                <span>Live Preview</span>
                            </div>

                            {/* Card Details Preview */}
                            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
                                <div className="h-48 relative overflow-hidden bg-gray-100">
                                    <img
                                        src={formData.bannerImage instanceof File ? URL.createObjectURL(formData.bannerImage) : (formData.bannerImage || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80")}
                                        alt="Event Banner"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                                            {formData.category || 'Category'}
                                        </span>
                                    </div>
                                    <div className="absolute top-4 right-4">
                                        <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg shadow-purple-600/30">
                                            {minPrice > 0 ? `LKR ${minPrice}` : 'Free'}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center gap-2 text-sm text-purple-600 font-bold mb-3">
                                        <Calendar className="w-4 h-4" />
                                        <span>
                                            {formData.date
                                                ? new Date(formData.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                                : 'Date & Time'}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
                                        {formData.name || 'Event Name'}
                                    </h3>
                                    <div className="flex items-start gap-2 text-sm text-gray-500 mb-4 line-clamp-2">
                                        <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                                        <span>
                                            {formData.venue || 'Event Venue'}
                                        </span>
                                    </div>

                                    <div
                                        className="text-sm text-gray-500 border-t border-gray-100 pt-4 mt-4 line-clamp-3 prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{ __html: formData.description || 'Event description will appear here...' }}
                                    />

                                    {/* Action Buttons (Only visible in preview mode fully) */}
                                    {viewMode === 'preview' && (
                                        <div className="mt-6 flex flex-col gap-3">
                                            <button
                                                onClick={handleSubmit}
                                                disabled={loading}
                                                className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30 hover:bg-purple-700 active:scale-95 transition-all flex justify-center items-center gap-2"
                                            >
                                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                                                Confirm & Publish Event
                                            </button>
                                            <button
                                                onClick={() => setViewMode('edit')}
                                                className="w-full py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                                            >
                                                Back to Edit
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Ticket Summary (Sidebar only) */}
                            {viewMode === 'edit' && (
                                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Ticket Breakdown</h4>
                                    <div className="space-y-3">
                                        {formData.ticketTypes.map((t, i) => (
                                            <div key={i} className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600">{t.name || 'Ticket'}</span>
                                                <span className="font-bold text-gray-900">LKR {t.price} <span className="text-gray-400 font-normal">x {t.quantity}</span></span>
                                            </div>
                                        ))}
                                        <div className="border-t border-gray-100 pt-3 mt-3 flex justify-between items-center font-bold text-gray-900">
                                            <span>Total Capacity</span>
                                            <span>{formData.ticketTypes.reduce((acc, curr) => acc + (parseInt(curr.quantity) || 0), 0)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CreateEvent;
