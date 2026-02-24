import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getLiveData, getHypeLevel, getApprovedPhotos } from '../api/eventLiveService';
import { getEventById } from '../api/eventService';
import { Loader2 } from 'lucide-react';

// Sub-components
import BigScreenBackground from '../components/BigScreenBackground';
import BigScreenEnergy from '../components/BigScreenEnergy';
import BigScreenMain from '../components/BigScreenMain'; // We need to extract this next

const LiveBigScreen = ({ role = 'MAIN' }) => {
    const { id: eventId } = useParams();
    const [event, setEvent] = useState(null);
    const [liveData, setLiveData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hypeLevel, setHypeLevel] = useState(0);
    const [energyPhase, setEnergyPhase] = useState('CALM');

    // Photo Wall state
    const [approvedPhotos, setApprovedPhotos] = useState([]);

    // Light Show state
    const [lightEffect, setLightEffect] = useState({ active: false, color: '#000000', type: 'SOLID' });

    const clientRef = useRef(null);

    // Initial Data Fetch
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [eventData, live, hype, photos] = await Promise.all([
                    getEventById(eventId),
                    getLiveData(eventId),
                    getHypeLevel(eventId),
                    getApprovedPhotos(eventId)
                ]);
                setEvent(eventData);
                setLiveData(live);
                setHypeLevel(hype.hypeLevel || 0);
                deriveEnergyPhase(hype.hypeLevel || 0);
                setApprovedPhotos(photos || []);
            } catch (error) {
                console.error('Failed to fetch data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [eventId]);

    const deriveEnergyPhase = (level) => {
        const max = 1000;
        const pct = (level / max) * 100;
        if (pct > 75) setEnergyPhase('INSANE');
        else if (pct > 50) setEnergyPhase('WILD');
        else if (pct > 25) setEnergyPhase('WARM');
        else setEnergyPhase('CALM');
    };

    // WebSocket Connection
    useEffect(() => {
        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            onConnect: () => {
                console.log(`BigScreen (${role}) connected to WebSocket`);
                client.subscribe(`/topic/event/${eventId}/live`, (message) => {
                    if (message.body) {
                        const update = JSON.parse(message.body);

                        if (update.type === 'HYPE_UPDATE') {
                            setHypeLevel(update.hypeLevel);
                            if (update.energyPhase) setEnergyPhase(update.energyPhase);
                            else deriveEnergyPhase(update.hypeLevel);
                        }

                        // Light Sync Updates
                        if (update.type === 'LIGHT_SYNC') {
                            setLightEffect({
                                active: true,
                                color: update.color,
                                type: update.effect || 'SOLID', // SOLID, PULSE, STROBE
                                speed: update.speed || 50,
                                intensity: update.intensity || 100
                            });
                        }

                        if (update.type === 'LIGHT_SYNC_STOP') {
                            setLightEffect({ active: false, color: '#000000', type: 'SOLID' });
                        }

                        // Layout updates - reload if role mismatch or specific layout logic needed
                        // For now we just update liveData to sync layoutMode state
                        // Layout or Background updates
                        if (update.type === 'LAYOUT_UPDATE') {
                            setLiveData(prev => ({ ...prev, layoutMode: update.layoutMode }));
                        }

                        if (update.type === 'BACKGROUND_UPDATE') {
                            const target = update.target || 'MAIN';
                            const config = update.config;
                            setLiveData(prev => {
                                const newData = { ...prev };
                                if (target === 'LEFT' || target === 'ALL') newData.leftBackground = config;
                                if (target === 'RIGHT' || target === 'ALL') newData.rightBackground = config;
                                if (target === 'MAIN' || target === 'ALL') newData.bigScreenBackground = config;
                                return newData;
                            });
                        }

                        if (update.type === 'PHOTO_APPROVED') {
                            setApprovedPhotos(prev => [update.photo, ...prev]);
                        }

                        if (update.type === 'PHOTOS_CLEARED') {
                            setApprovedPhotos([]);
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
    }, [eventId, role]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-16 h-16 text-purple-500 animate-spin" />
            </div>
        );
    }

    // specific background based on role
    const getBackgroundConfig = () => {
        if (!liveData) return null;
        if (role === 'ENERGY_LEFT') return liveData.leftBackground || liveData.bigScreenBackground;
        if (role === 'ENERGY_RIGHT') return liveData.rightBackground || liveData.bigScreenBackground;
        return liveData.bigScreenBackground;
    };

    // Determine what to render based on Role
    const renderContent = () => {
        // ENERGY screens always show visualization
        if (role.startsWith('ENERGY')) {
            return <BigScreenEnergy role={role} phase={energyPhase} hypeLevel={hypeLevel} />;
        }

        // MAIN screen shows content (Polls, Photos, Schedule)
        // Pass relevant data
        return (
            <BigScreenMain
                event={event}
                liveData={liveData}
                hypeLevel={hypeLevel}
                energyPhase={energyPhase}
                approvedPhotos={approvedPhotos}
            />
        );
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
            {/* 1. Global Background Layer */}
            <BigScreenBackground
                config={getBackgroundConfig()}
                energyPhase={energyPhase}
                lightEffect={lightEffect}
            />

            {/* 2. Main Content Layer */}
            <div className="relative z-10 w-full h-full">
                {renderContent()}
            </div>
        </div>
    );
};

export default LiveBigScreen;


