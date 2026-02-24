import React, { useState } from 'react';
import { Send, Loader2, Zap, Clock, Music, Coffee, Camera, Megaphone, MapPin, Gift, AlertTriangle, PartyPopper } from 'lucide-react';

const MessageTab = ({ message, onSave }) => {
    const [localMessage, setLocalMessage] = useState(message || '');
    const [isSaving, setIsSaving] = useState(false);

    // Pre-created quick messages for common event scenarios
    const quickMessages = [
        { icon: Music, text: "🎵 Main stage performance starting in 5 minutes!", category: "performance", color: "bg-purple-100 text-purple-700 hover:bg-purple-200" },
        { icon: Clock, text: "⏰ Event starting soon! Please find your seats.", category: "timing", color: "bg-blue-100 text-blue-700 hover:bg-blue-200" },
        { icon: Coffee, text: "☕ Break time! Refreshments available at the food court.", category: "break", color: "bg-amber-100 text-amber-700 hover:bg-amber-200" },
        { icon: Camera, text: "📸 Photo opportunity! Strike a pose for our photographers.", category: "photo", color: "bg-pink-100 text-pink-700 hover:bg-pink-200" },
        { icon: Megaphone, text: "📢 Important announcement coming up - please stay tuned!", category: "announcement", color: "bg-red-100 text-red-700 hover:bg-red-200" },
        { icon: MapPin, text: "📍 Please gather at the main entrance for the next activity.", category: "location", color: "bg-green-100 text-green-700 hover:bg-green-200" },
        { icon: Gift, text: "🎁 Giveaway time! Don't miss your chance to win exciting prizes.", category: "giveaway", color: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" },
        { icon: PartyPopper, text: "🎉 Thank you for attending! We hope you had a wonderful time.", category: "closing", color: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200" },
        { icon: AlertTriangle, text: "⚠️ Please follow staff instructions and stay in designated areas.", category: "safety", color: "bg-orange-100 text-orange-700 hover:bg-orange-200" },
        { icon: Zap, text: "⚡ Get ready! Something exciting is about to happen!", category: "hype", color: "bg-cyan-100 text-cyan-700 hover:bg-cyan-200" },
        { icon: Music, text: "🎤 Q&A session starting now - submit your questions!", category: "interactive", color: "bg-violet-100 text-violet-700 hover:bg-violet-200" },
        { icon: Clock, text: "⏳ Intermission - we'll be back in 15 minutes!", category: "break", color: "bg-slate-100 text-slate-700 hover:bg-slate-200" },
    ];

    const handleQuickMessageClick = (text) => {
        setLocalMessage(text);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(localMessage);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-bold text-gray-900">What's Happening Now</h3>
                <p className="text-sm text-gray-500 mt-1">
                    This message will be prominently displayed to all attendees in the live view.
                </p>
            </div>

            {/* Quick Messages Section */}
            <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-500" />
                    Quick Messages
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {quickMessages.map((msg, index) => {
                        const IconComponent = msg.icon;
                        return (
                            <button
                                key={index}
                                onClick={() => handleQuickMessageClick(msg.text)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm font-medium transition-all duration-200 ${msg.color}`}
                            >
                                <IconComponent className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">{msg.text}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Custom Message Input */}
            <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700">Custom Message</h4>
                <textarea
                    value={localMessage}
                    onChange={(e) => setLocalMessage(e.target.value)}
                    placeholder="Type your custom message or click a quick message above..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all duration-200"
                />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
                <button
                    onClick={handleSave}
                    disabled={isSaving || !localMessage.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Broadcast Message
                </button>
                {localMessage && (
                    <button
                        onClick={() => setLocalMessage('')}
                        className="px-4 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
                    >
                        Clear
                    </button>
                )}
            </div>
        </div>
    );
};

export default MessageTab;
