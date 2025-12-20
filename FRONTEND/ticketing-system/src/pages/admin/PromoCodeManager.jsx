import React, { useState, useEffect } from 'react';
import api from '../../api/axios'; // Adjust import path
import { useSelector } from 'react-redux';

const PromoCodeManager = () => {
    const { user } = useSelector(state => state.auth);
    const [codes, setCodes] = useState([]);
    const [events, setEvents] = useState([]);
    const [form, setForm] = useState({
        code: '',
        discountAmount: '',
        type: 'PERCENTAGE',
        maxUses: '',
        expiryDate: '',
        eventId: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Events
                const eventsUrl = user.role === 'ADMIN' ? '/events' : '/events/my-events';
                const eventsRes = await api.get(eventsUrl);
                setEvents(eventsRes.data);

                // Fetch Promo Codes
                const codesRes = await api.get('/promo-codes');
                setCodes(codesRes.data);
            } catch (err) {
                console.error("Failed to fetch data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user.role]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...form,
                discountAmount: parseFloat(form.discountAmount),
                maxUses: parseInt(form.maxUses),
                expiryDate: new Date(form.expiryDate).toISOString(),
                eventId: form.eventId ? parseInt(form.eventId) : null
            };
            if (!payload.eventId) delete payload.eventId;

            const res = await api.post('/promo-codes', payload);
            alert('Promo Code Created!');
            setCodes([...codes, res.data]); // Update list
            setForm({
                code: '',
                discountAmount: '',
                type: 'PERCENTAGE',
                maxUses: '',
                expiryDate: '',
                eventId: ''
            });
        } catch (error) {
            console.error(error);
            alert('Failed to create code: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8">
            <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4">Create Promo Code</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Code</label>
                        <input name="code" value={form.code} onChange={handleChange} required className="w-full border p-2 rounded" placeholder="e.g. SUMMER20" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Discount Amount</label>
                            <input name="discountAmount" type="number" step="0.01" value={form.discountAmount} onChange={handleChange} required className="w-full border p-2 rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Type</label>
                            <select name="type" value={form.type} onChange={handleChange} className="w-full border p-2 rounded">
                                <option value="PERCENTAGE">Percentage (%)</option>
                                <option value="FIXED">Fixed Amount ($)</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Max Uses</label>
                            <input name="maxUses" type="number" value={form.maxUses} onChange={handleChange} required className="w-full border p-2 rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                            <input name="expiryDate" type="datetime-local" value={form.expiryDate} onChange={handleChange} required className="w-full border p-2 rounded" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Event Scope</label>
                        <select name="eventId" value={form.eventId} onChange={handleChange} className="w-full border p-2 rounded">
                            <option value="">{user.role === 'ADMIN' ? 'Global (All Events)' : 'Select Event...'}</option>
                            {events.map(ev => (
                                <option key={ev.id} value={ev.id}>{ev.name}</option>
                            ))}
                        </select>
                        {user.role !== 'ADMIN' && !form.eventId && <p className="text-xs text-red-500">Organizers must select an event.</p>}
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700">
                        {loading ? 'Creating...' : 'Create Promo Code'}
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4">Active Promo Codes</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="p-2">Code</th>
                                <th className="p-2">Discount</th>
                                <th className="p-2">Uses</th>
                                <th className="p-2">Expiry</th>
                                <th className="p-2">Scope</th>
                            </tr>
                        </thead>
                        <tbody>
                            {codes.length === 0 ? (
                                <tr><td colSpan="5" className="p-4 text-center text-gray-500">No promo codes found</td></tr>
                            ) : (
                                codes.map(code => (
                                    <tr key={code.id} className="border-b hover:bg-gray-50">
                                        <td className="p-2 font-mono font-bold text-purple-600">{code.code}</td>
                                        <td className="p-2">
                                            {code.type === 'PERCENTAGE' ? `${code.discountAmount}%` : `$${code.discountAmount}`}
                                        </td>
                                        <td className="p-2">{code.currentUses} / {code.maxUses}</td>
                                        <td className="p-2">{new Date(code.expiryDate).toLocaleDateString()}</td>
                                        <td className="p-2">
                                            {code.event ? (
                                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Event: {code.event.name}</span>
                                            ) : (
                                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Global</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PromoCodeManager;

