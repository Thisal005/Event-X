import React, { useState } from 'react';
import { BarChart3, X, Loader2 } from 'lucide-react';

const PollTab = ({ activePoll, onCreate, onClose, onClear }) => {
    const [form, setForm] = useState({
        question: '',
        options: ['', '']
    });
    const [isCreating, setIsCreating] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.question || form.options.filter(o => o.trim()).length < 2) return;

        setIsCreating(true);
        try {
            await onCreate(form.question, form.options.filter(o => o.trim()));
            setForm({ question: '', options: ['', ''] });
        } finally {
            setIsCreating(false);
        }
    };

    const addOption = () => {
        if (form.options.length < 5) {
            setForm(prev => ({ ...prev, options: [...prev.options, ''] }));
        }
    };

    const updateOption = (index, value) => {
        const newOptions = [...form.options];
        newOptions[index] = value;
        setForm(prev => ({ ...prev, options: newOptions }));
    };

    const removeOption = (index) => {
        if (form.options.length > 2) {
            setForm(prev => ({
                ...prev,
                options: prev.options.filter((_, i) => i !== index)
            }));
        }
    };

    if (activePoll) {
        const total = Object.values(activePoll.votes || {}).reduce((a, b) => a + b, 0);

        return (
            <div className="p-4 bg-white rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">{activePoll.question}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${activePoll.closed ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'
                        }`}>
                        {activePoll.closed ? 'Closed' : 'Active'}
                    </span>
                </div>
                <div className="space-y-2 mb-4">
                    {activePoll.options.map(option => {
                        const votes = activePoll.votes?.[option] || 0;
                        const percentage = total > 0 ? Math.round((votes / total) * 100) : 0;
                        return (
                            <div key={option} className="relative">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                                    <span>{option}</span>
                                    <span className="font-bold text-purple-600">{votes} ({percentage}%)</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="flex gap-2">
                    {!activePoll.closed && (
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                        >
                            Close Poll
                        </button>
                    )}
                    <button
                        onClick={onClear}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                        Clear Poll
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create Flash Poll</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    placeholder="Poll question..."
                    value={form.question}
                    onChange={(e) => setForm(prev => ({ ...prev, question: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                />
                <div className="space-y-2">
                    {form.options.map((option, index) => (
                        <div key={index} className="flex gap-2">
                            <input
                                type="text"
                                placeholder={`Option ${index + 1}`}
                                value={option}
                                onChange={(e) => updateOption(index, e.target.value)}
                                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                            />
                            {form.options.length > 2 && (
                                <button
                                    type="button"
                                    onClick={() => removeOption(index)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                {form.options.length < 5 && (
                    <button
                        type="button"
                        onClick={addOption}
                        className="text-purple-600 text-sm hover:underline"
                    >
                        + Add Option
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isCreating}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
                    Create Poll
                </button>
            </form>
        </div>
    );
};

export default PollTab;
