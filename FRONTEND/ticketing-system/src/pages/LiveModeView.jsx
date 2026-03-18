import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getLiveData, votePoll, sendHype, uploadPhoto, getApprovedPhotos } from '../api/eventLiveService';
import { useSelector } from 'react-redux';
import {
    Clock, MapPin, Calendar, ArrowLeft, Radio, MessageCircle,
    Search, BarChart3, ChevronRight, Loader2, Send, CheckCircle, X, Flame, Camera, Image, Upload
} from 'lucide-react';

const LiveModeView = ({ event }) => {
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector(state => state.auth);

    const [liveData, setLiveData] = useState({
        liveMessage: '',
        schedule: [],
        lostAndFound: [],
        activePoll: null
    });
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('schedule');
    const [countdown, setCountdown] = useState('');
    const [votedOption, setVotedOption] = useState(null);
    const [isVoting, setIsVoting] = useState(false);
    const clientRef = useRef(null);
    const wakeLockRef = useRef(null);

    // Light Sync state
    const [lightSync, setLightSync] = useState(null); // { color, effect, duration }

    // Hype Gauge (Clap-O-Meter) state
    const [hypeLevel, setHypeLevel] = useState(0);
    const [maxHype] = useState(1000);
    const [localClickCount, setLocalClickCount] = useState(0);
    const hypeIntervalRef = useRef(null);
    const [isHypeButtonPressed, setIsHypeButtonPressed] = useState(false);

    // Photo Wall state
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [approvedPhotos, setApprovedPhotos] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null); // 'pending', 'approved', 'rejected', null
    const [uploadedPhotoId, setUploadedPhotoId] = useState(null); // Track the user's uploaded photo
    const uploadedPhotoIdRef = useRef(null); // Ref for WebSocket handler
    const fileInputRef = useRef(null);

    // Access control state
    const [accessDenied, setAccessDenied] = useState(false);

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [data, photos] = await Promise.all([
                    getLiveData(event.id),
                    getApprovedPhotos(event.id)
                ]);
                console.log('Fetched approved photos:', photos);
                setLiveData(data);
                setApprovedPhotos(photos || []);
            } catch (error) {
                console.error('Failed to fetch live data', error);
                if (error.response?.status === 403) {
                    setAccessDenied(true);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [event.id]);

    // WebSocket connection
    useEffect(() => {
        const client = new Client({
            webSocketFactory: () => new SockJS(import.meta.env.VITE_WS_URL || '/ws'),
            onConnect: () => {
                console.log('Connected to Live WebSocket');
                client.subscribe(`/topic/event/${event.id}/live`, (message) => {
                    if (message.body) {
                        const update = JSON.parse(message.body);
                        console.log('Live update received:', update.type);

                        // Handle Light Sync messages
                        if (update.type === 'LIGHT_SYNC') {
                            setLightSync({
                                color: update.color,
                                effect: update.effect,
                                duration: update.duration,
                                speed: update.speed || 50,
                                intensity: update.intensity || 100
                            });
                            // Auto-dismiss after duration
                            setTimeout(() => setLightSync(null), update.duration);
                            return;
                        }

                        if (update.type === 'LIGHT_SYNC_STOP') {
                            setLightSync(null);
                            return;
                        }

                        // Handle Hype updates
                        if (update.type === 'HYPE_UPDATE') {
                            setHypeLevel(update.hypeLevel);
                            return;
                        }

                        // Handle Photo Wall updates
                        if (update.type === 'PHOTO_APPROVED') {
                            setApprovedPhotos(prev => [update.photo, ...prev]);
                            // Check if this is the user's uploaded photo (use ref for closure)
                            if (uploadedPhotoIdRef.current && update.photo.id === uploadedPhotoIdRef.current) {
                                setUploadStatus('approved');
                            }
                            return;
                        }

                        if (update.type === 'PHOTOS_CLEARED') {
                            setApprovedPhotos([]);
                            return;
                        }

                        if (update.type === 'PHOTO_REJECTED') {
                            // Check if this is the user's uploaded photo (use ref for closure)
                            if (uploadedPhotoIdRef.current && update.photo.id === uploadedPhotoIdRef.current) {
                                setUploadStatus('rejected');
                            }
                            return;
                        }

                        // Handle other updates
                        if (update.data) {
                            setLiveData(update.data);
                        }
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
    }, [event.id]);

    // Screen Wake Lock API - prevent screen from sleeping during light show
    useEffect(() => {
        const requestWakeLock = async () => {
            if (lightSync && 'wakeLock' in navigator) {
                try {
                    wakeLockRef.current = await navigator.wakeLock.request('screen');
                    console.log('Wake Lock acquired for Light Show');
                } catch (err) {
                    console.log('Wake Lock failed:', err.message);
                }
            }
        };

        const releaseWakeLock = async () => {
            if (wakeLockRef.current) {
                try {
                    await wakeLockRef.current.release();
                    wakeLockRef.current = null;
                    console.log('Wake Lock released');
                } catch (err) {
                    console.log('Wake Lock release failed:', err.message);
                }
            }
        };

        if (lightSync) {
            requestWakeLock();
        } else {
            releaseWakeLock();
        }

        return () => {
            releaseWakeLock();
        };
    }, [lightSync]);

    // Countdown timer for next schedule item
    useEffect(() => {
        const nextItem = liveData.schedule?.find(item => item.next);
        if (!nextItem) {
            setCountdown('');
            return;
        }

        const updateCountdown = () => {
            const now = new Date();
            const target = new Date(nextItem.startTime);
            const diff = target - now;

            if (diff <= 0) {
                setCountdown('Starting now!');
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            if (hours > 0) {
                setCountdown(`${hours}h ${minutes}m`);
            } else {
                setCountdown(`${minutes}m ${seconds}s`);
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [liveData.schedule]);

    // Hype Gauge: Batch clicks and send every 1 second
    useEffect(() => {
        hypeIntervalRef.current = setInterval(() => {
            if (localClickCount > 0) {
                sendHype(event.id, localClickCount)
                    .then(() => {
                        setLocalClickCount(0);
                    })
                    .catch((err) => {
                        console.error('Failed to send hype', err);
                    });
            }
        }, 1000);

        return () => {
            if (hypeIntervalRef.current) {
                clearInterval(hypeIntervalRef.current);
            }
        };
    }, [event.id, localClickCount]);

    // Handle hype button click
    const handleHypeClick = () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        setLocalClickCount((prev) => prev + 1);
        setIsHypeButtonPressed(true);
        setTimeout(() => setIsHypeButtonPressed(false), 100);
    };

    // Calculate hype percentage for gauge display
    const hypePercentage = Math.min((hypeLevel / maxHype) * 100, 100);
    const hypeColor = hypePercentage > 70 ? '#ef4444' : hypePercentage > 40 ? '#f97316' : '#eab308';

    const handleVote = async (option) => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (votedOption || isVoting) return;

        setIsVoting(true);
        try {
            await votePoll(event.id, option);
            setVotedOption(option);
        } catch (error) {
            console.error('Failed to vote', error);
            alert(error.response?.data?.error || 'Failed to submit vote');
        } finally {
            setIsVoting(false);
        }
    };

    // Photo upload handler
    const handlePhotoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        setIsUploading(true);
        setUploadStatus(null);
        setUploadedPhotoId(null);
        try {
            const response = await uploadPhoto(event.id, file);
            setUploadStatus('pending');
            // Store the uploaded photo ID to track approval/rejection
            if (response.photo?.id) {
                setUploadedPhotoId(response.photo.id);
                uploadedPhotoIdRef.current = response.photo.id; // Also set ref for WebSocket
            }
            // Clear the file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Failed to upload photo', error);
            alert(error.response?.data?.error || 'Failed to upload photo');
        } finally {
            setIsUploading(false);
        }
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatRelativeTime = (dateString) => {
        const now = new Date();
        const date = new Date(dateString);
        const diff = now - date;
        const minutes = Math.floor(diff / (1000 * 60));

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return date.toLocaleDateString();
    };

    const getTotalVotes = () => {
        if (!liveData.activePoll?.votes) return 0;
        return Object.values(liveData.activePoll.votes).reduce((a, b) => a + b, 0);
    };

    const getVotePercentage = (option) => {
        const total = getTotalVotes();
        if (total === 0) return 0;
        return Math.round((liveData.activePoll.votes[option] / total) * 100);
    };

    const nextItem = liveData.schedule?.find(item => item.next);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
            </div>
        );
    }

    if (accessDenied) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
                <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Radio className="w-10 h-10 text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">Ticket Required</h2>
                    <p className="text-white/60 mb-8">
                        This is an exclusive live experience for ticket holders only.
                        Please purchase a ticket to access this event's live features.
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate(`/events/${event.id}`)}
                            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
                        >
                            Get Tickets
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full px-6 py-3 bg-white/5 text-white font-medium rounded-xl hover:bg-white/10 transition-colors"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Light Sync Overlay - Full Screen */}
            {lightSync && (() => {
                // Calculate animation duration based on speed (1-100)
                // Higher speed = faster animation = shorter duration
                const baseDuration = (101 - (lightSync.speed || 50)) / 50;
                const strobeDuration = (101 - (lightSync.speed || 50)) / 200;
                const fadeDuration = (101 - (lightSync.speed || 50)) / 20;
                const intensityValue = (lightSync.intensity || 100) / 100;

                // Get animation based on effect type
                const getAnimation = () => {
                    switch (lightSync.effect) {
                        case 'PULSE':
                            return `lightPulse ${baseDuration}s ease-in-out infinite`;
                        case 'STROBE':
                            return `lightStrobe ${strobeDuration}s linear infinite`;
                        case 'WAVE':
                            return `lightWave ${baseDuration}s ease-in-out infinite`;
                        case 'FADE':
                            return `lightFade ${fadeDuration}s ease-in-out infinite`;
                        default:
                            return 'none';
                    }
                };

                return (
                    <div
                        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
                        style={{
                            backgroundColor: lightSync.color,
                            opacity: intensityValue,
                            animation: getAnimation()
                        }}
                    >
                        {/* Animated instruction text */}
                        <div className="text-center text-white drop-shadow-2xl animate-bounce">
                            <p className="text-4xl font-black mb-4 tracking-wider">
                                📱 HOLD YOUR PHONE UP! 📱
                            </p>
                            <p className="text-xl font-medium opacity-80">
                                Be part of the light show!
                            </p>
                        </div>

                        {/* Exit button */}
                        <button
                            onClick={() => setLightSync(null)}
                            className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 px-6 py-3 bg-black/40 backdrop-blur-md text-white rounded-full font-medium hover:bg-black/60 transition-all border border-white/20"
                        >
                            <X className="w-5 h-5" />
                            Exit Light Show
                        </button>

                        {/* CSS for animations with dynamic intensity */}
                        <style>{`
                            @keyframes lightPulse {
                                0%, 100% { opacity: ${intensityValue}; transform: scale(1); }
                                50% { opacity: ${intensityValue * 0.4}; transform: scale(0.99); }
                            }
                            @keyframes lightStrobe {
                                0%, 49% { opacity: ${intensityValue}; }
                                50%, 100% { opacity: ${intensityValue * 0.05}; }
                            }
                            @keyframes lightWave {
                                0%, 100% { 
                                    opacity: ${intensityValue}; 
                                    filter: brightness(1);
                                }
                                50% { 
                                    opacity: ${intensityValue * 0.7}; 
                                    filter: brightness(1.3);
                                }
                            }
                            @keyframes lightFade {
                                0%, 100% { opacity: ${intensityValue}; }
                                50% { opacity: ${intensityValue * 0.2}; }
                            }
                        `}</style>
                    </div>
                );
            })()}

            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
                {/* Header */}
                <div className="sticky top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/10">
                    <div className="max-w-lg mx-auto px-4 py-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center text-white/70 hover:text-white mb-2 text-sm"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" /> Back
                        </button>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs font-bold animate-pulse">
                                        <Radio className="w-3 h-3" /> LIVE
                                    </span>
                                </div>
                                <h1 className="text-lg font-bold truncate">{event.name}</h1>
                            </div>
                            <div className="text-right text-xs text-white/60">
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> {event.venue}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Next Up Banner */}
                {nextItem && (
                    <div className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 border-b border-white/10">
                        <div className="max-w-lg mx-auto px-4 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-purple-300 font-medium uppercase tracking-wider mb-1">
                                        Up Next
                                    </p>
                                    <h2 className="text-xl font-bold">{nextItem.title}</h2>
                                    <p className="text-white/60 text-sm">
                                        {nextItem.stage} • {formatTime(nextItem.startTime)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                                        {countdown}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* What's Happening Now */}
                {liveData.liveMessage && (
                    <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-b border-white/10">
                        <div className="max-w-lg mx-auto px-4 py-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-amber-500/30 rounded-full">
                                    <MessageCircle className="w-5 h-5 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-amber-300 font-medium uppercase tracking-wider mb-1">
                                        What's Happening
                                    </p>
                                    <p className="text-white font-medium">{liveData.liveMessage}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Section Tabs */}
                <div className="max-w-lg mx-auto px-4 pt-4">
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {[
                            { id: 'schedule', label: 'Schedule', icon: Clock },
                            { id: 'lostfound', label: 'Lost & Found', icon: Search },
                            { id: 'poll', label: 'Poll', icon: BarChart3, badge: liveData.activePoll && !liveData.activePoll.closed },
                            { id: 'photos', label: 'Photos', icon: Camera, badge: approvedPhotos.length > 0 }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveSection(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeSection === tab.id
                                    ? 'bg-white text-gray-900'
                                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                                {tab.badge && (
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-lg mx-auto px-4 py-6">
                    {/* Schedule Section */}
                    {activeSection === 'schedule' && (
                        <div className="space-y-3">
                            <h3 className="text-lg font-bold mb-4">Event Schedule</h3>
                            {liveData.schedule?.length === 0 ? (
                                <div className="text-center py-12 text-white/50">
                                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>No schedule items yet</p>
                                </div>
                            ) : (
                                liveData.schedule.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`p-4 rounded-xl border transition-all ${item.next
                                            ? 'bg-purple-500/20 border-purple-500/50'
                                            : 'bg-white/5 border-white/10'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    {item.next && (
                                                        <span className="px-2 py-0.5 bg-purple-500 text-white text-xs font-bold rounded-full">
                                                            NEXT
                                                        </span>
                                                    )}
                                                    <span className="text-purple-400 font-mono text-sm">
                                                        {formatTime(item.startTime)}
                                                    </span>
                                                </div>
                                                <h4 className="font-bold text-lg">{item.title}</h4>
                                                {item.stage && (
                                                    <p className="text-white/60 text-sm">{item.stage}</p>
                                                )}
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-white/30" />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Lost & Found Section */}
                    {activeSection === 'lostfound' && (
                        <div className="space-y-3">
                            <h3 className="text-lg font-bold mb-4">Lost & Found</h3>
                            {liveData.lostAndFound?.length === 0 ? (
                                <div className="text-center py-12 text-white/50">
                                    <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>No posts yet</p>
                                </div>
                            ) : (
                                liveData.lostAndFound.map((post) => (
                                    <div
                                        key={post.id}
                                        className="p-4 rounded-xl bg-white/5 border border-white/10"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-full ${post.type === 'LOST'
                                                ? 'bg-red-500/20 text-red-400'
                                                : 'bg-green-500/20 text-green-400'
                                                }`}>
                                                <Search className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-xs font-bold ${post.type === 'LOST' ? 'text-red-400' : 'text-green-400'
                                                        }`}>
                                                        {post.type}
                                                    </span>
                                                    <span className="text-white/40 text-xs">
                                                        {formatRelativeTime(post.postedAt)}
                                                    </span>
                                                </div>
                                                <p className="text-white">{post.message}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Poll Section */}
                    {activeSection === 'poll' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold mb-4">Flash Poll</h3>
                            {!liveData.activePoll ? (
                                <div className="text-center py-12 text-white/50">
                                    <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>No active poll</p>
                                </div>
                            ) : (
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                    <h4 className="text-xl font-bold mb-6">{liveData.activePoll.question}</h4>

                                    <div className="space-y-3">
                                        {liveData.activePoll.options.map((option) => {
                                            const percentage = getVotePercentage(option);
                                            const isVoted = votedOption === option;
                                            const showResults = votedOption || liveData.activePoll.closed;

                                            return (
                                                <button
                                                    key={option}
                                                    onClick={() => handleVote(option)}
                                                    disabled={votedOption || liveData.activePoll.closed || isVoting}
                                                    className={`w-full relative overflow-hidden rounded-xl border transition-all ${isVoted
                                                        ? 'border-purple-500 bg-purple-500/20'
                                                        : 'border-white/20 hover:border-white/40'
                                                        } ${votedOption || liveData.activePoll.closed ? 'cursor-default' : 'cursor-pointer'}`}
                                                >
                                                    {/* Progress bar background */}
                                                    {showResults && (
                                                        <div
                                                            className="absolute inset-0 bg-purple-500/20 transition-all duration-500"
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    )}

                                                    <div className="relative flex items-center justify-between p-4">
                                                        <div className="flex items-center gap-2">
                                                            {isVoted && <CheckCircle className="w-5 h-5 text-purple-400" />}
                                                            <span className="font-medium">{option}</span>
                                                        </div>
                                                        {showResults && (
                                                            <span className="font-bold text-purple-400">{percentage}%</span>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-4 text-center text-white/50 text-sm">
                                        {getTotalVotes()} votes
                                        {liveData.activePoll.closed && ' • Poll closed'}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Photos Section */}
                    {activeSection === 'photos' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold">Event Photos</h3>
                                <button
                                    onClick={() => setShowPhotoModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-sm font-bold text-white shadow-lg"
                                >
                                    <Camera className="w-4 h-4" />
                                    Share Moment
                                </button>
                            </div>

                            {approvedPhotos.length === 0 ? (
                                <div className="text-center py-12 text-white/50">
                                    <Image className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>No photos yet</p>
                                    <p className="text-sm mt-1">Be the first to share a moment!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    {approvedPhotos.map((photo) => (
                                        <div key={photo.id} className="relative rounded-xl overflow-hidden aspect-square">
                                            <img
                                                src={photo.imageUrl}
                                                alt="Event moment"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                                                <p className="text-white text-xs font-medium truncate">
                                                    {photo.userName || 'Attendee'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Hype Gauge Floating Action Button */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3">
                {/* Hype Level Gauge */}
                <div className="relative w-16 h-32 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 overflow-hidden shadow-2xl">
                    {/* Fill */}
                    <div
                        className="absolute bottom-0 left-0 right-0 transition-all duration-300 rounded-b-full"
                        style={{
                            height: `${hypePercentage}%`,
                            background: `linear-gradient(to top, ${hypeColor}, ${hypeColor}88)`
                        }}
                    />
                    {/* Label */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white font-bold text-xs drop-shadow-lg">
                            {Math.round(hypePercentage)}%
                        </span>
                    </div>
                    {/* Flames at top when high */}
                    {hypePercentage > 60 && (
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-2xl animate-bounce">
                            🔥
                        </div>
                    )}
                </div>

                {/* Make Noise Button */}
                <button
                    onClick={handleHypeClick}
                    onMouseDown={() => setIsHypeButtonPressed(true)}
                    onMouseUp={() => setIsHypeButtonPressed(false)}
                    onTouchStart={() => { handleHypeClick(); setIsHypeButtonPressed(true); }}
                    onTouchEnd={() => setIsHypeButtonPressed(false)}
                    className={`w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-red-600 shadow-2xl flex items-center justify-center transition-all active:scale-90 border-4 border-white/30 ${isHypeButtonPressed ? 'scale-90' : 'scale-100'
                        }`}
                    style={{
                        boxShadow: isHypeButtonPressed
                            ? '0 0 30px rgba(249, 115, 22, 0.8), inset 0 0 20px rgba(0,0,0,0.3)'
                            : '0 0 20px rgba(249, 115, 22, 0.5)'
                    }}
                >
                    <Flame className="w-10 h-10 text-white drop-shadow-lg" />
                </button>
                <span className="text-white/70 text-xs font-medium">MAKE NOISE!</span>
                {localClickCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                        +{localClickCount}
                    </span>
                )}
            </div>

            {/* Photo Upload Modal */}
            {showPhotoModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gradient-to-br from-gray-900 to-purple-900 rounded-2xl p-6 max-w-sm w-full border border-white/20">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">Share Moment</h3>
                            <button
                                onClick={() => {
                                    setShowPhotoModal(false);
                                    setUploadStatus(null);
                                }}
                                className="p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {uploadStatus === 'pending' ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                                </div>
                                <h4 className="text-lg font-bold text-white mb-2">Waiting for Approval</h4>
                                <p className="text-white/60 text-sm">
                                    Your photo is being reviewed by the event organizer
                                </p>
                                <button
                                    onClick={() => {
                                        setShowPhotoModal(false);
                                        setUploadStatus(null);
                                    }}
                                    className="mt-6 px-6 py-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        ) : uploadStatus === 'approved' ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <CheckCircle className="w-8 h-8 text-green-400" />
                                </div>
                                <h4 className="text-lg font-bold text-white mb-2">Photo Approved!</h4>
                                <p className="text-white/60 text-sm">
                                    Your photo is now live on the big screen
                                </p>
                                <button
                                    onClick={() => {
                                        setShowPhotoModal(false);
                                        setUploadStatus(null);
                                    }}
                                    className="mt-6 px-6 py-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        ) : uploadStatus === 'rejected' ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                                    <X className="w-8 h-8 text-red-400" />
                                </div>
                                <h4 className="text-lg font-bold text-white mb-2">Photo Declined</h4>
                                <p className="text-white/60 text-sm">
                                    This photo didn't meet our community guidelines
                                </p>
                                <button
                                    onClick={() => {
                                        setUploadStatus(null);
                                    }}
                                    className="mt-6 px-6 py-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-purple-500/50 hover:bg-white/5 transition-all cursor-pointer group"
                                >
                                    <div className="w-12 h-12 mx-auto mb-3 bg-white/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Upload className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <p className="font-medium text-white">Tap to upload photo</p>
                                    <p className="text-sm text-white/40 mt-1">JPG or PNG</p>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                    className="hidden"
                                />
                                {isUploading && (
                                    <div className="text-center text-sm text-purple-400 animate-pulse">
                                        Uploading...
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default LiveModeView;
