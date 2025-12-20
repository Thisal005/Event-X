import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import axios from 'axios';
import DashboardHeader from '../components/DashboardHeader';


const Reader = () => {
    const [data, setData] = useState('No result');
    const [scanResult, setScanResult] = useState(null);
    const [loading, setLoading] = useState(false);

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
            // Retrieve token from local storage (assuming organizer is logged in)
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

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader />
            <div className="max-w-md mx-auto pt-24 px-4 text-center">
                <h1 className="text-3xl font-bold mb-6">Ticket Reader</h1>

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

                                    {/* Event Details Section */}
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

                                    {/* Ticket Details */}
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

export default Reader;
