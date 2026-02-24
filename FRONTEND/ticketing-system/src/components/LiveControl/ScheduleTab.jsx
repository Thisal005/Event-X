import React, { useState } from 'react';
import { Plus, Trash2, Loader2 } from 'lucide-react';

const ScheduleTab = ({ schedule, onAdd, onDelete }) => {
    const [form, setForm] = useState({
        title: '',
        stage: '',
        startTime: ''
    });
    const [isAdding, setIsAdding] = useState(false);

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.startTime) return;

        setIsAdding(true);
        try {
            // Create a date object from the local datetime-local input
            const localDate = new Date(form.startTime);
            // Get the timezone offset in minutes and convert to milliseconds
            const offsetMs = localDate.getTimezoneOffset() * 60 * 1000;
            // Adjust the date to preserve the local time when converting to ISO
            const adjustedDate = new Date(localDate.getTime() - offsetMs);

            await onAdd({
                title: form.title,
                stage: form.stage,
                startTime: adjustedDate.toISOString()
            });
            setForm({ title: '', stage: '', startTime: '' });
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Add Schedule Item</h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                        type="text"
                        placeholder="Title"
                        value={form.title}
                        onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Stage/Location"
                        value={form.stage}
                        onChange={(e) => setForm(prev => ({ ...prev, stage: e.target.value }))}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                    <input
                        type="datetime-local"
                        value={form.startTime}
                        onChange={(e) => setForm(prev => ({ ...prev, startTime: e.target.value }))}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                        required
                    />
                    <button
                        type="submit"
                        disabled={isAdding}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                        {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Add
                    </button>
                </form>
            </div>

            <div>
                <h4 className="font-medium text-gray-700 mb-3">Current Schedule</h4>
                {schedule?.length === 0 ? (
                    <p className="text-gray-500 text-sm">No schedule items yet.</p>
                ) : (
                    <div className="space-y-2">
                        {schedule?.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                <div>
                                    <span className="font-medium text-gray-900">{item.title}</span>
                                    {item.stage && <span className="text-gray-500 ml-2">• {item.stage}</span>}
                                    <span className="text-purple-600 ml-2">@ {formatTime(item.startTime)}</span>
                                    {item.next && (
                                        <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">NEXT</span>
                                    )}
                                </div>
                                <button
                                    onClick={() => onDelete(item.id)}
                                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScheduleTab;
