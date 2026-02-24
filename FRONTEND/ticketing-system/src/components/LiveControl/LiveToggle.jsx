import React from 'react';
import { Radio, Power, PowerOff } from 'lucide-react';

const LiveToggle = ({ isLive, onToggle }) => {
    return (
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
            <div className="flex items-center gap-3">
                {isLive ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded-full text-sm font-bold animate-pulse">
                        <Radio className="w-4 h-4" />
                        LIVE NOW
                    </div>
                ) : (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-400 text-white rounded-full text-sm font-bold">
                        <Radio className="w-4 h-4" />
                        OFFLINE
                    </div>
                )}
                <span className="text-sm text-gray-600">
                    {isLive ? 'Your event is live! Attendees can see updates in real-time.' : 'Go live to enable real-time features for attendees.'}
                </span>
            </div>
            <button
                onClick={onToggle}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${isLive
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
            >
                {isLive ? (
                    <>
                        <PowerOff className="w-4 h-4" /> End Live
                    </>
                ) : (
                    <>
                        <Power className="w-4 h-4" /> Go Live
                    </>
                )}
            </button>
        </div>
    );
};

export default LiveToggle;
