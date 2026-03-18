import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {
    initializeLiveData,
    getLiveStatus,
    updateLiveMessage,
    addScheduleItem,
    deleteScheduleItem,
    addLostAndFoundPost,
    deleteLostAndFoundPost,
    createPoll,
    closePoll,
    clearPoll,
    startLive,
    endLive,
    triggerLightSync,
    stopLightSync,
    getPendingPhotos,
    approvePhoto,
    rejectPhoto,
    deleteAllApprovedPhotos,
    approveAllPhotos,
    rejectAllPhotos,
    updateLayoutMode,
    updateBackground
} from '../api/eventLiveService';
import {
    Clock, MessageCircle, Search, BarChart3, Lightbulb, Camera, Loader2, Monitor, Layout
} from 'lucide-react';

// Import sub-components
import {
    LiveToggle,
    MessageTab,
    ScheduleTab,
    LostFoundTab,
    PollTab,
    LightShowTab,
    PhotosTab
} from './LiveControl';
import ScreenControlTab from './ScreenControlTab';

const LiveControlPanel = ({ eventId }) => {
    const [liveData, setLiveData] = useState(null);
    const [isLive, setIsLive] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('message');
    const clientRef = useRef(null);

    // Photo moderation state
    const [pendingPhotos, setPendingPhotos] = useState([]);
    const [pendingCount, setPendingCount] = useState(0);
    const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [data, statusData] = await Promise.all([
                    initializeLiveData(eventId),
                    getLiveStatus(eventId)
                ]);
                setLiveData(data);
                setIsLive(statusData.isLive);
            } catch (error) {
                console.error('Failed to fetch live data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [eventId]);

    // Fetch pending photos when photo tab is active
    useEffect(() => {
        if (activeTab === 'photos') {
            fetchPendingPhotos();
        }
    }, [activeTab, eventId]);

    // Memoized fetch function for photos to use in WebSocket callback
    const fetchPendingPhotosCallback = useCallback(async () => {
        setIsLoadingPhotos(true);
        try {
            const data = await getPendingPhotos(eventId);
            setPendingPhotos(data.photos || []);
            setPendingCount(data.pendingCount || 0);
        } catch (error) {
            console.error('Failed to fetch pending photos', error);
        } finally {
            setIsLoadingPhotos(false);
        }
    }, [eventId]);

    // WebSocket connection
    useEffect(() => {
        const client = new Client({
            webSocketFactory: () => new SockJS(import.meta.env.VITE_WS_URL || '/ws'),
            onConnect: () => {
                console.log('Organizer connected to Live WebSocket');
                client.subscribe(`/topic/event/${eventId}/live`, (msg) => {
                    if (msg.body) {
                        const update = JSON.parse(msg.body);
                        console.log('Live update received:', update.type);

                        if (update.type === 'LIVE_STATUS_UPDATE') {
                            setIsLive(update.data?.isLive || false);
                        }

                        // Auto-refresh photos when new photo is uploaded
                        if (update.type === 'PHOTO_PENDING') {
                            setPendingCount(prev => prev + 1);
                            // If currently on photos tab, auto-refresh the photo list
                            fetchPendingPhotosCallback();
                        }

                        // Also handle photo approval/rejection updates
                        if (update.type === 'PHOTO_APPROVED' || update.type === 'PHOTO_REJECTED') {
                            fetchPendingPhotosCallback();
                        }

                        if (update.type === 'LAYOUT_UPDATE') {
                            setLiveData(prev => ({ ...prev, layoutMode: update.layoutMode }));
                        }

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
    }, [eventId, fetchPendingPhotosCallback]);

    // Fetch pending photos
    const fetchPendingPhotos = async () => {
        setIsLoadingPhotos(true);
        try {
            const data = await getPendingPhotos(eventId);
            setPendingPhotos(data.photos || []);
            setPendingCount(data.pendingCount || 0);
        } catch (error) {
            console.error('Failed to fetch pending photos', error);
        } finally {
            setIsLoadingPhotos(false);
        }
    };

    // Toggle Live Mode
    const handleToggleLive = async () => {
        try {
            if (isLive) {
                await endLive(eventId);
                setIsLive(false);
            } else {
                await startLive(eventId);
                setIsLive(true);
            }
        } catch (error) {
            console.error('Failed to toggle live mode', error);
            alert('Failed to toggle live mode');
        }
    };

    // Message handlers
    const handleSaveMessage = async (message) => {
        await updateLiveMessage(eventId, message);
    };

    // Schedule handlers
    const handleAddSchedule = async (item) => {
        await addScheduleItem(eventId, item);
    };

    const handleDeleteSchedule = async (itemId) => {
        await deleteScheduleItem(eventId, itemId);
    };

    // Lost & Found handlers
    const handleAddLostFound = async (post) => {
        await addLostAndFoundPost(eventId, post);
    };

    const handleDeleteLostFound = async (postId) => {
        await deleteLostAndFoundPost(eventId, postId);
    };

    // Poll handlers
    const handleCreatePoll = async (question, options) => {
        await createPoll(eventId, question, options);
    };

    const handleClosePoll = async () => {
        await closePoll(eventId);
    };

    const handleClearPoll = async () => {
        await clearPoll(eventId);
    };

    // Light Show handlers
    const handleTriggerLight = async (options) => {
        await triggerLightSync(eventId, options);
    };

    const handleStopLight = async () => {
        await stopLightSync(eventId);
    };

    // Photo moderation handlers
    const handleApprovePhoto = async (photoId) => {
        try {
            await approvePhoto(eventId, photoId);
            setPendingPhotos(prev => prev.filter(p => p.id !== photoId));
            setPendingCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to approve photo', error);
            alert('Failed to approve photo');
        }
    };

    const handleRejectPhoto = async (photoId) => {
        try {
            await rejectPhoto(eventId, photoId);
            setPendingPhotos(prev => prev.filter(p => p.id !== photoId));
            setPendingCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to reject photo', error);
            alert('Failed to reject photo');
        }
    };

    const handleClearAllPhotos = async () => {
        if (!window.confirm('Are you sure you want to clear all approved photos? This cannot be undone.')) return;
        try {
            await deleteAllApprovedPhotos(eventId);
            alert('All approved photos have been cleared.');
        } catch (error) {
            console.error('Failed to clear photos', error);
            alert('Failed to clear photos');
        }
    };

    // Launch Big Screen in new tab
    const handleLaunchBigScreen = () => {
        const bigScreenUrl = `/event/${eventId}/live/big-screen`;
        window.open(bigScreenUrl, '_blank', 'noopener,noreferrer');
    };

    // Bulk approve all pending photos
    const handleApproveAllPhotos = async () => {
        try {
            const result = await approveAllPhotos(eventId);
            console.log('Approve all result:', result);
            setPendingPhotos([]);
            setPendingCount(0);
        } catch (error) {
            console.error('Failed to approve all photos', error);
            const errorMessage = error.response?.data?.error || error.message || 'Failed to approve all photos';
            alert(`Error: ${errorMessage}`);
        }
    };

    // Bulk reject all pending photos
    const handleRejectAllPhotos = async () => {
        try {
            const result = await rejectAllPhotos(eventId);
            console.log('Reject all result:', result);
            setPendingPhotos([]);
            setPendingCount(0);
        } catch (error) {
            console.error('Failed to reject all photos', error);
            const errorMessage = error.response?.data?.error || error.message || 'Failed to reject all photos';
            alert(`Error: ${errorMessage}`);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
        );
    }

    const tabs = [
        { id: 'message', label: 'Message', icon: MessageCircle },
        { id: 'schedule', label: 'Schedule', icon: Clock },
        { id: 'lostfound', label: 'Lost & Found', icon: Search },
        { id: 'poll', label: 'Poll', icon: BarChart3 },
        { id: 'lightshow', label: 'Light Show', icon: Lightbulb },
        { id: 'photos', label: 'Photos', icon: Camera, badge: pendingCount > 0 ? pendingCount : null },
        { id: 'screens', label: 'Screens', icon: Layout }
    ];

    return (
        <div className="space-y-6">
            {/* Live Toggle Header */}
            <LiveToggle isLive={isLive} onToggle={handleToggleLive} />

            {/* Launch Big Screen Button */}
            <div className="flex justify-center">
                <button
                    onClick={handleLaunchBigScreen}
                    className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                    <Monitor className="w-5 h-5" />
                    <span>Launch Big Screen</span>
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        {tab.badge && (
                            <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                                {tab.badge}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="bg-gray-50 rounded-xl p-6">
                {activeTab === 'message' && (
                    <MessageTab
                        message={liveData?.liveMessage}
                        onSave={handleSaveMessage}
                    />
                )}

                {activeTab === 'schedule' && (
                    <ScheduleTab
                        schedule={liveData?.schedule}
                        onAdd={handleAddSchedule}
                        onDelete={handleDeleteSchedule}
                    />
                )}

                {activeTab === 'lostfound' && (
                    <LostFoundTab
                        lostAndFound={liveData?.lostAndFound}
                        onAdd={handleAddLostFound}
                        onDelete={handleDeleteLostFound}
                    />
                )}

                {activeTab === 'poll' && (
                    <PollTab
                        activePoll={liveData?.activePoll}
                        onCreate={handleCreatePoll}
                        onClose={handleClosePoll}
                        onClear={handleClearPoll}
                    />
                )}

                {activeTab === 'lightshow' && (
                    <LightShowTab
                        onTrigger={handleTriggerLight}
                        onStop={handleStopLight}
                    />
                )}

                {activeTab === 'photos' && (
                    <PhotosTab
                        pendingPhotos={pendingPhotos}
                        pendingCount={pendingCount}
                        isLoading={isLoadingPhotos}
                        onApprove={handleApprovePhoto}
                        onReject={handleRejectPhoto}
                        onApproveAll={handleApproveAllPhotos}
                        onRejectAll={handleRejectAllPhotos}
                        onClearAll={handleClearAllPhotos}
                        onRefresh={fetchPendingPhotos}
                        isAutoRefreshEnabled={true}
                    />
                )}

                {activeTab === 'screens' && (
                    <ScreenControlTab
                        eventId={eventId}
                        currentLayout={liveData?.layoutMode || 'SINGLE'}
                        onUpdateLayout={async (mode) => {
                            await updateLayoutMode(eventId, mode);
                            // Optimistic update
                            setLiveData(prev => ({ ...prev, layoutMode: mode }));
                        }}
                        onUpdateBackground={async (bg, target) => {
                            await updateBackground(eventId, bg, target);
                        }}
                        onLaunch={() => {
                            const mode = liveData?.layoutMode || 'SINGLE';
                            const baseUrl = `${window.location.origin}/event/${eventId}/live/big-screen`;

                            if (mode === 'SINGLE') {
                                window.open(baseUrl, 'MainScreen', 'width=1920,height=1080');
                            } else if (mode === 'DUAL') {
                                window.open(`${baseUrl}/main`, 'MainScreen', 'width=960,height=1080,left=0');
                                window.open(`${baseUrl}/energy-right`, 'EnergyRight', 'width=960,height=1080,left=960');
                            } else if (mode === 'TRIPLE') {
                                window.open(`${baseUrl}/energy-left`, 'EnergyLeft', 'width=640,height=1080,left=0');
                                window.open(`${baseUrl}/main`, 'MainScreen', 'width=640,height=1080,left=640');
                                window.open(`${baseUrl}/energy-right`, 'EnergyRight', 'width=640,height=1080,left=1280');
                            }
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default LiveControlPanel;