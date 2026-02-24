import React, { useState } from 'react';
import { Plus, Trash2, Loader2 } from 'lucide-react';

const LostFoundTab = ({ lostAndFound, onAdd, onDelete }) => {
    const [form, setForm] = useState({
        type: 'LOST',
        message: ''
    });
    const [isAdding, setIsAdding] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.message) return;

        setIsAdding(true);
        try {
            await onAdd(form);
            setForm({ type: 'LOST', message: '' });
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Post Lost & Found</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-4">
                        <select
                            value={form.type}
                            onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value }))}
                            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="LOST">Lost Item</option>
                            <option value="FOUND">Found Item</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Description of item..."
                            value={form.message}
                            onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                            required
                        />
                        <button
                            type="submit"
                            disabled={isAdding}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                        >
                            {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Post
                        </button>
                    </div>
                </form>
            </div>

            <div>
                <h4 className="font-medium text-gray-700 mb-3">Active Posts</h4>
                {lostAndFound?.length === 0 ? (
                    <p className="text-gray-500 text-sm">No posts yet.</p>
                ) : (
                    <div className="space-y-2">
                        {lostAndFound?.map(post => (
                            <div key={post.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <span className={`px-2 py-0.5 text-xs font-bold rounded ${post.type === 'LOST' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                        }`}>
                                        {post.type}
                                    </span>
                                    <span className="text-gray-900">{post.message}</span>
                                </div>
                                <button
                                    onClick={() => onDelete(post.id)}
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

export default LostFoundTab;
