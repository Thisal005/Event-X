import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { gatekeeperLogin } from '../api/gatekeeperService';

const GatekeeperLogin = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // 'loading' | 'error' | 'success'
    const [errorMessage, setErrorMessage] = useState('');
    const [eventInfo, setEventInfo] = useState(null);

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            setStatus('error');
            setErrorMessage('No access token provided.');
            return;
        }

        const handleLogin = async () => {
            try {
                const response = await gatekeeperLogin(token);

                // Store the JWT token for gatekeeper
                localStorage.setItem('token', response.accessToken);
                localStorage.setItem('gatekeeperMode', 'true');
                localStorage.setItem('gatekeeperEventId', response.eventId);
                localStorage.setItem('gatekeeperEventName', response.eventName);

                // Also store a minimal user object for compatibility
                const gatekeeperUser = {
                    role: 'GATEKEEPER',
                    email: 'gatekeeper@temp',
                    isGatekeeper: true,
                    gatekeeperEventId: response.eventId
                };
                localStorage.setItem('user', JSON.stringify(gatekeeperUser));

                setEventInfo({
                    eventId: response.eventId,
                    eventName: response.eventName
                });
                setStatus('success');

                // Redirect to scanner after a brief moment
                setTimeout(() => {
                    navigate(`/scanner/${response.eventId}`);
                }, 1500);

            } catch (error) {
                console.error('Gatekeeper login error:', error);
                setStatus('error');
                if (error.response?.data?.message) {
                    setErrorMessage(error.response.data.message);
                } else if (error.response?.data?.error) {
                    setErrorMessage(error.response.data.error);
                } else {
                    setErrorMessage('This link is invalid or has expired.');
                }
            }
        };

        handleLogin();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full mx-4 text-center">
                {status === 'loading' && (
                    <>
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-6"></div>
                        <h1 className="text-2xl font-bold text-white mb-2">Verifying Access...</h1>
                        <p className="text-gray-300">Please wait while we validate your access link.</p>
                    </>
                )}

                {status === 'success' && eventInfo && (
                    <>
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Access Granted!</h1>
                        <p className="text-gray-300 mb-4">Welcome to <span className="text-purple-400 font-semibold">{eventInfo.eventName}</span></p>
                        <p className="text-gray-400 text-sm">Redirecting to scanner...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
                        <p className="text-gray-300 mb-6">{errorMessage}</p>
                        <div className="space-y-3">
                            <p className="text-gray-400 text-sm">
                                If you believe this is an error, please contact the event organizer for a new access link.
                            </p>
                            <button
                                onClick={() => navigate('/')}
                                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
                            >
                                Go to Home
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default GatekeeperLogin;
