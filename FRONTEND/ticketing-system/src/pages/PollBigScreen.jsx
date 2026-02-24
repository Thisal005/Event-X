import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getLiveData } from '../api/eventLiveService';
import { getEventById } from '../api/eventService';
import { BarChart3, Radio, Users, Loader2 } from 'lucide-react';

const PollBigScreen = () => {
    const { id: eventId } = useParams();
    const [event, setEvent] = useState(null);
    const [liveData, setLiveData] = useState(null);
    const [loading, setLoading] = useState(true);
    const clientRef = useRef(null);

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [eventData, live] = await Promise.all([
                    getEventById(eventId),
                    getLiveData(eventId)
                ]);
                setEvent(eventData);
                setLiveData(live);
            } catch (error) {
                console.error('Failed to fetch data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [eventId]);

    // WebSocket connection for real-time updates
    useEffect(() => {
        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            onConnect: () => {
                console.log('Big Screen connected to Live WebSocket');
                client.subscribe(`/topic/event/${eventId}/live`, (message) => {
                    if (message.body) {
                        const update = JSON.parse(message.body);
                        console.log('Live update received:', update.type);
                        setLiveData(update.data);
                    }
                });
            },
            onStompError: (frame) => {
                console.error('WebSocket error:', frame.headers['message']);
            },
        });

        client.activate();
        clientRef.current = client;

        return () => {
            client.deactivate();
        };
    }, [eventId]);

    const getTotalVotes = () => {
        if (!liveData?.activePoll?.votes) return 0;
        return Object.values(liveData.activePoll.votes).reduce((a, b) => a + b, 0);
    };

    const getVotePercentage = (option) => {
        const total = getTotalVotes();
        if (total === 0) return 0;
        return Math.round((liveData.activePoll.votes[option] / total) * 100);
    };

    const getMaxVotes = () => {
        if (!liveData?.activePoll?.votes) return 0;
        return Math.max(...Object.values(liveData.activePoll.votes), 1);
    };

    // Color palette for bars
    const barColors = [
        'from-purple-500 to-pink-500',
        'from-cyan-500 to-blue-500',
        'from-amber-500 to-orange-500',
        'from-emerald-500 to-teal-500',
        'from-rose-500 to-red-500',
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900 flex items-center justify-center">
                <Loader2 className="w-16 h-16 text-purple-400 animate-spin" />
            </div>
        );
    }

    const poll = liveData?.activePoll;
    const totalVotes = getTotalVotes();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900 text-white overflow-hidden relative">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-3xl" />
            </div>

            {/* Content */}
            <div className="relative z-10 min-h-screen flex flex-col p-8 lg:p-12">
                {/* Header */}
                <header className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 backdrop-blur-sm rounded-full border border-red-500/30">
                            <Radio className="w-5 h-5 text-red-400 animate-pulse" />
                            <span className="text-red-400 font-bold uppercase tracking-wider text-sm">Live Poll</span>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-white/90 truncate max-w-xl">
                            {event?.name || 'Event'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3 text-white/60">
                        <Users className="w-6 h-6" />
                        <span className="text-xl font-semibold">{totalVotes} votes</span>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 flex items-center justify-center">
                    {!poll ? (
                        <div className="text-center">
                            <BarChart3 className="w-24 h-24 mx-auto mb-6 text-white/20" />
                            <h2 className="text-3xl font-bold text-white/40">No Active Poll</h2>
                            <p className="text-lg text-white/30 mt-2">Waiting for the organizer to start a poll...</p>
                        </div>
                    ) : (
                        <div className="w-full max-w-5xl mx-auto">
                            {/* Question */}
                            <h2 className="text-4xl lg:text-5xl xl:text-6xl font-black text-center mb-12 bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent leading-tight">
                                {poll.question}
                            </h2>

                            {/* Bar Chart */}
                            <div className="space-y-6">
                                {poll.options.map((option, index) => {
                                    const voteCount = poll.votes[option] || 0;
                                    const percentage = getVotePercentage(option);
                                    const colorClass = barColors[index % barColors.length];
                                    const isLeading = voteCount === getMaxVotes() && voteCount > 0;

                                    return (
                                        <div
                                            key={option}
                                            className={`relative transition-all duration-500 ${isLeading ? 'scale-[1.02]' : ''}`}
                                        >
                                            {/* Option Label */}
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`text-xl lg:text-2xl font-bold ${isLeading ? 'text-white' : 'text-white/80'}`}>
                                                    {option}
                                                </span>
                                                <div className="flex items-baseline gap-3">
                                                    <span className={`text-3xl lg:text-4xl font-black ${isLeading ? 'text-white' : 'text-white/70'}`}>
                                                        {percentage}%
                                                    </span>
                                                    <span className="text-lg text-white/40">
                                                        ({voteCount})
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Bar Background */}
                                            <div className="relative h-16 lg:h-20 bg-white/5 rounded-2xl overflow-hidden backdrop-blur-sm border border-white/10">
                                                {/* Animated Bar */}
                                                <div
                                                    className={`absolute inset-y-0 left-0 bg-gradient-to-r ${colorClass} rounded-2xl transition-all duration-700 ease-out shadow-lg`}
                                                    style={{
                                                        width: `${percentage}%`,
                                                        boxShadow: isLeading ? '0 0 40px rgba(168, 85, 247, 0.4)' : 'none'
                                                    }}
                                                >
                                                    {/* Shine effect */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20 rounded-2xl" />
                                                </div>

                                                {/* Leading indicator */}
                                                {isLeading && (
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold text-white flex items-center gap-1">
                                                        🏆 Leading
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Poll Status */}
                            {poll.closed && (
                                <div className="mt-10 text-center">
                                    <span className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-400 font-bold text-lg">
                                        Poll Closed - Final Results
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </main>

                {/* Footer */}
                <footer className="mt-8 text-center">
                    <p className="text-white/30 text-sm">
                        Powered by Event-X • Real-time updates
                    </p>
                </footer>
            </div>

            {/* CSS for animations */}
            <style>{`
                @keyframes pulse-glow {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default PollBigScreen;
