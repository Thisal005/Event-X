import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Scanner } from '@yudiel/react-qr-scanner';
import axios from 'axios';
import DashboardHeader from '../components/DashboardHeader';

const EventScanner = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState('No result');
    const [scanResult, setScanResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [eventInfo, setEventInfo] = useState(null);

    // Check if this is gatekeeper mode
    const isGatekeeperMode = localStorage.getItem('gatekeeperMode') === 'true';
    const gatekeeperEventId = localStorage.getItem('gatekeeperEventId');
    const gatekeeperEventName = localStorage.getItem('gatekeeperEventName');

    useEffect(() => {
        // If gatekeeper, verify they're accessing the correct event
        if (isGatekeeperMode) {
            if (gatekeeperEventId !== eventId) {
                // Gatekeeper trying to access wrong event
                alert('You do not have access to this event.');
                navigate('/');
                return;
            }
            setEventInfo({ name: gatekeeperEventName });
        } else {
            // For organizers, fetch event info
            const fetchEventInfo = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const response = await axios.get(`http://localhost:8080/api/events/${eventId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setEventInfo(response.data);
                } catch (error) {
                    console.error('Failed to fetch event info:', error);
                }
            };
            fetchEventInfo();
        }
    }, [eventId, isGatekeeperMode, gatekeeperEventId, gatekeeperEventName, navigate]);

    const handleScan = (detectedCodes) => {
        if (detectedCodes && detectedCodes.length > 0) {
            const scannedText = detectedCodes[0].rawValue;
            setData(scannedText);
            validateTicket(scannedText);
        }
    };

    const handleError = (error) => {
        console.info('Scanner error:', error);
    };

    const validateTicket = async (qrData) => {
        if (loading) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const response = await axios.post('http://localhost:8080/api/tickets/validate', { qrData }, config);
            setScanResult(response.data);
        } catch (error) {
            console.error(error);
            setScanResult({ valid: false, reason: 'NETWORK_ERROR' });
        } finally {
            setLoading(false);
        }
    };

    const redeemTicket = async () => {
        if (!data) return;
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            const response = await axios.post('http://localhost:8080/api/tickets/redeem', { qrData: data }, config);
            setScanResult({ ...scanResult, status: 'USED', checkInTime: response.data.checkInTime });
            alert("Ticket Redeemed Successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to redeem ticket");
        }
    };

    const handleGatekeeperLogout = () => {
        // Clear all gatekeeper-related data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('gatekeeperMode');
        localStorage.removeItem('gatekeeperEventId');
        localStorage.removeItem('gatekeeperEventName');
        navigate('/');
    };

    // Gatekeeper Mode UI - Full screen, minimal
    if (isGatekeeperMode) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
                {/* Gatekeeper Header */}
                <div className="bg-purple-800/50 backdrop-blur-sm py-4 px-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-white">🚪 Gatekeeper Mode</h1>
                        <p className="text-purple-200 text-sm">{eventInfo?.name || 'Loading...'}</p>
                    </div>
                    <button
                        onClick={handleGatekeeperLogout}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition"
                    >
                        Logout
                    </button>
                </div>

                {/* Scanner Area */}
                <div className="max-w-lg mx-auto pt-8 px-4">
                    <div className="bg-white/10 backdrop-blur-lg p-4 rounded-2xl shadow-2xl mb-6">
                        <Scanner
                            onScan={handleScan}
                            onError={handleError}
                            constraints={{ facingMode: 'environment' }}
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-2xl">
                        <p className="text-purple-200 mb-2 text-sm">Scanned Data:</p>
                        <p className="font-mono text-sm break-all bg-black/30 p-2 rounded mb-4 text-white">{data}</p>

                        {scanResult && (
                            <div className={`p-4 rounded-lg ${scanResult.valid ? 'bg-green-500/20 border border-green-400' : 'bg-red-500/20 border border-red-400'}`}>
                                {scanResult.valid ? (
                                    <div>
                                        <h2 className="text-xl font-bold mb-4 text-green-400">✓ Valid Ticket</h2>

                                        {scanResult.eventName && (
                                            <div className="bg-white/10 rounded-lg p-3 mb-4 text-left">
                                                <h3 className="font-semibold text-lg text-white mb-2">{scanResult.eventName}</h3>
                                                <div className="space-y-1 text-sm text-gray-200">
                                                    {scanResult.eventDate && (
                                                        <p className="flex items-center gap-2">
                                                            <span>📅</span>
                                                            <span>{new Date(scanResult.eventDate).toLocaleString('en-US', {
                                                                weekday: 'short',
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}</span>
                                                        </p>
                                                    )}
                                                    {scanResult.eventVenue && (
                                                        <p className="flex items-center gap-2">
                                                            <span>📍</span>
                                                            <span>{scanResult.eventVenue}</span>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="border-t border-green-400/30 pt-3 text-left text-gray-200">
                                            <p className="text-sm"><span className="font-medium">Ticket ID:</span> {scanResult.ticketId}</p>
                                            <p className="text-sm"><span className="font-medium">Ticket Type:</span> {scanResult.ticketName}</p>
                                            <p className="text-sm">
                                                <span className="font-medium">Status:</span>{' '}
                                                <span className={`font-bold ${scanResult.status === 'USED' ? 'text-red-400' : 'text-green-400'}`}>
                                                    {scanResult.status}
                                                </span>
                                            </p>
                                        </div>

                                        {scanResult.status === 'VALID' && (
                                            <button
                                                onClick={redeemTicket}
                                                className="mt-4 w-full bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600 transition text-lg"
                                            >
                                                ✓ Redeem Ticket
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <h2 className="text-xl font-bold mb-2 text-red-400">✗ Invalid Ticket</h2>
                                        <p className="text-gray-200">Reason: {scanResult.reason}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Normal Organizer Mode UI
    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader />
            <div className="max-w-md mx-auto pt-24 px-4 text-center">
                <h1 className="text-3xl font-bold mb-2">Ticket Scanner</h1>
                {eventInfo && (
                    <p className="text-gray-600 mb-6">{eventInfo.name}</p>
                )}

                <div className="bg-white p-4 rounded-xl shadow-lg mb-6">
                    <Scanner
                        onScan={handleScan}
                        onError={handleError}
                        constraints={{ facingMode: 'environment' }}
                        style={{ width: '100%' }}
                    />
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <p className="text-gray-500 mb-2">Scanned Data:</p>
                    <p className="font-mono text-sm break-all bg-gray-100 p-2 rounded mb-4">{data}</p>

                    {scanResult && (
                        <div className={`p-4 rounded-lg ${scanResult.valid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {scanResult.valid ? (
                                <div>
                                    <h2 className="text-xl font-bold mb-4">✓ Valid Ticket</h2>

                                    {scanResult.eventName && (
                                        <div className="bg-white/50 rounded-lg p-3 mb-4 text-left">
                                            <h3 className="font-semibold text-lg text-green-900 mb-2">{scanResult.eventName}</h3>
                                            <div className="space-y-1 text-sm">
                                                {scanResult.eventDate && (
                                                    <p className="flex items-center gap-2">
                                                        <span>📅</span>
                                                        <span>{new Date(scanResult.eventDate).toLocaleString('en-US', {
                                                            weekday: 'short',
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}</span>
                                                    </p>
                                                )}
                                                {scanResult.eventVenue && (
                                                    <p className="flex items-center gap-2">
                                                        <span>📍</span>
                                                        <span>{scanResult.eventVenue}</span>
                                                    </p>
                                                )}
                                                {scanResult.organizerName && (
                                                    <p className="flex items-center gap-2">
                                                        <span>👤</span>
                                                        <span>Organized by: {scanResult.organizerName}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="border-t border-green-300 pt-3 text-left">
                                        <p className="text-sm"><span className="font-medium">Ticket ID:</span> {scanResult.ticketId}</p>
                                        <p className="text-sm"><span className="font-medium">Ticket Type:</span> {scanResult.ticketName}</p>
                                        <p className="text-sm">
                                            <span className="font-medium">Status:</span>{' '}
                                            <span className={`font-bold ${scanResult.status === 'USED' ? 'text-red-600' : 'text-green-600'}`}>
                                                {scanResult.status}
                                            </span>
                                        </p>
                                    </div>

                                    {scanResult.status === 'VALID' && (
                                        <button
                                            onClick={redeemTicket}
                                            className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition"
                                        >
                                            Redeem Ticket
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <h2 className="text-xl font-bold mb-2">Invalid Ticket</h2>
                                    <p>Reason: {scanResult.reason}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventScanner;
