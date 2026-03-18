import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById } from '../api/eventService';
import { createOrder, validateCoupon } from '../api/orderService';
import { getUrgencyInfo } from '../api/priceRuleService';
import { joinWaitlist } from '../api/waitlistService';
import { Calendar, MapPin, ArrowLeft, ShoppingCart, Loader2, Minus, Plus, CreditCard, Clock, Zap, TrendingUp, Bell, Eye, Activity } from 'lucide-react';
import { useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import InteractiveGridBackground from '../components/InteractiveGridBackground';
import LiveModeView from './LiveModeView';
import { getLiveStatus } from '../api/eventLiveService';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useSelector(state => state.auth);

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantities, setQuantities] = useState({});
    const [purchasing, setPurchasing] = useState(false);
    const [urgencyInfo, setUrgencyInfo] = useState({}); // Map of ticketTypeId -> urgency info
    const [promoCode, setPromoCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [promoMessage, setPromoMessage] = useState(null);
    const [isPromoValid, setIsPromoValid] = useState(false);
    const [joiningWaitlist, setJoiningWaitlist] = useState({});
    const [isLiveMode, setIsLiveMode] = useState(false);

    // Live Pulse state
    const [pulseStats, setPulseStats] = useState({
        viewerCount: 0,
        salesLastMinute: 0,
        salesLast10Minutes: 0,
        sparklineData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    });
    const stompClientRef = useRef(null);

    // Fetch urgency info for all ticket types
    const fetchUrgencyInfo = async (ticketTypes) => {
        const urgencyData = {};
        for (const ticketType of ticketTypes) {
            try {
                const info = await getUrgencyInfo(ticketType.id);
                urgencyData[ticketType.id] = info;
            } catch (error) {
                console.error(`Failed to fetch urgency info for ticket ${ticketType.id}`, error);
            }
        }
        setUrgencyInfo(urgencyData);
    };

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const data = await getEventById(id);
                setEvent(data);
                // Initialize quantities
                const initialQuantities = {};
                if (data.ticketTypes) {
                    data.ticketTypes.forEach(t => initialQuantities[t.id] = 0);
                    // Fetch urgency info for dynamic pricing display
                    fetchUrgencyInfo(data.ticketTypes);
                }
                setQuantities(initialQuantities);
            } catch (error) {
                console.error("Failed to fetch event", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    // Check if event is in live mode (organizer controlled)
    useEffect(() => {
        if (!event) return;

        const checkLiveMode = async () => {
            try {
                const status = await getLiveStatus(id);
                setIsLiveMode(status.isLive);
            } catch (error) {
                console.error('Failed to check live status', error);
                setIsLiveMode(false);
            }
        };

        checkLiveMode();
        // Re-check every 10 seconds
        const interval = setInterval(checkLiveMode, 10000);
        return () => clearInterval(interval);
    }, [event]);

    // Live Pulse WebSocket connection
    useEffect(() => {
        if (!id) return;

        const socket = new SockJS(import.meta.env.VITE_WS_URL || '/ws');
        const stompClient = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            onConnect: () => {
                console.log('[LivePulse] Connected to WebSocket');
                stompClient.subscribe(`/topic/event/${id}/stats`, (message) => {
                    try {
                        const stats = JSON.parse(message.body);
                        setPulseStats(stats);
                    } catch (e) {
                        console.error('[LivePulse] Failed to parse stats', e);
                    }
                });
            },
            onStompError: (frame) => {
                console.error('[LivePulse] Broker error', frame.headers['message']);
            }
        });

        stompClient.activate();
        stompClientRef.current = stompClient;

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };
    }, [id]);

    // Refresh urgency info every 30 seconds for countdown updates
    useEffect(() => {
        if (!event?.ticketTypes) return;
        const interval = setInterval(() => {
            fetchUrgencyInfo(event.ticketTypes);
        }, 30000);
        return () => clearInterval(interval);
    }, [event]);

    const handleQuantityChange = (ticketId, delta) => {
        setQuantities(prev => {
            const current = prev[ticketId] || 0;
            const ticket = event.ticketTypes.find(t => t.id === ticketId);
            const max = ticket.quantity - ticket.sold;
            const newValue = Math.max(0, Math.min(max, current + delta));
            return { ...prev, [ticketId]: newValue };
        });
    };

    // Format countdown timer for price change date
    const formatCountdown = (dateString) => {
        if (!dateString) return null;
        const targetDate = new Date(dateString);
        const now = new Date();
        const diff = targetDate - now;

        if (diff <= 0) return null;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 24) {
            const days = Math.floor(hours / 24);
            return `${days}d ${hours % 24}h`;
        }
        return `${hours}h ${minutes}m`;
    };

    const calculateTotal = () => {
        if (!event || !event.ticketTypes) return 0;
        return event.ticketTypes.reduce((total, ticket) => {
            return total + (ticket.price * (quantities[ticket.id] || 0));
        }, 0);
    };

    const handleApplyPromo = async () => {
        if (!promoCode) return;
        setPromoMessage(null);
        try {
            const total = calculateTotal();
            const response = await validateCoupon(promoCode, total, id);
            if (response.valid) {
                setDiscount(response.discountAmount);
                setIsPromoValid(true);
                setPromoMessage({ type: 'success', text: `Coupon applied! You saved LKR ${response.discountAmount}` });
            }
        } catch (error) {
            setDiscount(0);
            setIsPromoValid(false);
            setPromoMessage({ type: 'error', text: error.response?.data?.message || 'Invalid coupon code' });
        }
    };

    const handleJoinWaitlist = async (ticketTypeId) => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (user.role !== 'CUSTOMER') {
            alert("Only customers can join the waitlist.");
            return;
        }

        setJoiningWaitlist(prev => ({ ...prev, [ticketTypeId]: true }));
        try {
            const message = await joinWaitlist(ticketTypeId);
            alert(message || "Successfully joined the waitlist! We'll email you if a ticket becomes available.");
        } catch (error) {
            console.error("Failed to join waitlist", error);
            alert("Failed to join waitlist: " + (error.response?.data || error.message));
        } finally {
            setJoiningWaitlist(prev => ({ ...prev, [ticketTypeId]: false }));
        }
    };

    const scrollToTickets = () => {
        const section = document.getElementById('ticketing-section');
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleCheckout = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (user.role !== 'CUSTOMER') {
            alert("Only customers can purchase tickets. Please log in as a Customer.");
            return;
        }

        const items = Object.entries(quantities)
            .filter(([_, qty]) => qty > 0)
            .map(([ticketTypeId, quantity]) => ({
                ticketTypeId: parseInt(ticketTypeId),
                quantity
            }));

        const payload = { items };
        if (isPromoValid && promoCode) {
            payload.promoCode = promoCode;
        }

        if (items.length === 0) {
            alert("Please select at least one ticket.");
            return;
        }

        setPurchasing(true);
        try {
            const order = await createOrder(payload);
            // alert("Purchase Successful! Check your email for details."); // Moved to success page
            navigate('/order-success', { state: { order } });
        } catch (error) {
            console.error("Purchase failed", error);
            alert("Purchase failed: " + (error.response?.data?.message || error.message));
        } finally {
            setPurchasing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center relative">
                <InteractiveGridBackground />
                <Loader2 className="w-10 h-10 text-purple-600 animate-spin relative z-10" />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-transparent flex flex-col items-center justify-center relative">
                <InteractiveGridBackground />
                <div className="relative z-10 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Event not found</h2>
                    <button
                        onClick={() => navigate('/')}
                        className="text-purple-600 font-medium hover:underline"
                    >
                        Return to Home
                    </button>
                </div>
            </div>
        );
    }

    // Render Live Mode view if within time window
    if (isLiveMode) {
        return <LiveModeView event={event} />;
    }

    return (
        <div className="min-h-screen bg-transparent relative">
            <InteractiveGridBackground />

            <div className="relative z-10">
                <Navbar />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
                    <div className="mb-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Events
                        </button>
                    </div>

                    <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
                        {/* Header Image */}
                        <div className="h-[400px] w-full relative group">
                            <img
                                src={event.bannerImage || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80'}
                                alt={event.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-90"></div>

                            <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
                                <div className="max-w-4xl">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/20 mb-4">
                                        {event.category}
                                    </span>
                                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
                                        {event.name}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-6 text-white/90 font-medium text-lg">
                                        <div className="flex items-center">
                                            <Calendar className="w-5 h-5 mr-2 text-purple-400" />
                                            {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </div>
                                        <div className="flex items-center">
                                            <MapPin className="w-5 h-5 mr-2 text-purple-400" />
                                            {event.venue}
                                        </div>
                                    </div>
                                    <button
                                        onClick={scrollToTickets}
                                        className="mt-8 px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-purple-500/50 flex items-center gap-2 transform hover:-translate-y-1"
                                    >
                                        <CreditCard className="w-5 h-5" />
                                        Buy Now
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Live Pulse Section */}
                        <div className="px-8 md:px-12 py-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-100">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-6">
                                    {/* Viewers */}
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-400/30">
                                            <Eye className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">Viewing Now</p>
                                            <p className="text-lg font-bold text-gray-900">{pulseStats.viewerCount} <span className="text-sm font-normal text-gray-500">people</span></p>
                                        </div>
                                    </div>

                                    {/* Sales Last Minute */}
                                    <div className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg shadow-orange-400/30 ${pulseStats.salesLastMinute > 0 ? 'animate-pulse' : ''}`}>
                                            <Activity className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">Last Minute</p>
                                            <p className="text-lg font-bold text-gray-900">{pulseStats.salesLastMinute} <span className="text-sm font-normal text-gray-500">tickets sold</span></p>
                                        </div>
                                    </div>

                                    {/* 10 Minute Sales */}
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-400/30">
                                            <TrendingUp className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">Last 10 Min</p>
                                            <p className="text-lg font-bold text-gray-900">{pulseStats.salesLast10Minutes} <span className="text-sm font-normal text-gray-500">sold</span></p>
                                        </div>
                                    </div>
                                </div>

                                {/* Sparkline Chart */}
                                <div className="w-32 h-12">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={pulseStats.sparklineData.map((value, index) => ({ value }))}>                                            <Line
                                            type="monotone"
                                            dataKey="value"
                                            stroke="url(#pulseGradient)"
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                            <defs>
                                                <linearGradient id="pulseGradient" x1="0" y1="0" x2="1" y2="0">
                                                    <stop offset="0%" stopColor="#9333ea" />
                                                    <stop offset="100%" stopColor="#6366f1" />
                                                </linearGradient>
                                            </defs>
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 p-8 md:p-12">
                            {/* Event Info */}
                            <div className="lg:col-span-2 space-y-10">
                                <section>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Event</h2>
                                    <div
                                        className="text-gray-600 leading-relaxed text-lg prose prose-purple max-w-none event-description"
                                        dangerouslySetInnerHTML={{ __html: event.description || "No description provided." }}
                                    />
                                </section>

                                <section id="ticketing-section">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Ticketing</h2>
                                    <div className="space-y-4">
                                        {event.ticketTypes?.map((ticket) => {
                                            const remaining = ticket.quantity - ticket.sold;
                                            const ticketUrgency = urgencyInfo[ticket.id];
                                            const ticketsAtThisPrice = ticketUrgency?.ticketsLeftAtCurrentPrice;
                                            const priceChangeCountdown = formatCountdown(ticketUrgency?.priceChangeDate);

                                            return (
                                                <div
                                                    key={ticket.id}
                                                    className={`relative p-6 rounded-2xl border transition-all duration-300 ${quantities[ticket.id] > 0
                                                        ? 'border-purple-200 bg-purple-50/50 shadow-sm'
                                                        : 'border-gray-100 bg-white hover:border-gray-200'
                                                        }`}
                                                >
                                                    {/* Dynamic Pricing Urgency Badges */}
                                                    {(ticketsAtThisPrice || priceChangeCountdown) && (
                                                        <div className="flex flex-wrap gap-2 mb-3">
                                                            {ticketsAtThisPrice && ticketsAtThisPrice <= 20 && (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25 animate-pulse">
                                                                    <Zap className="w-3 h-3" />
                                                                    Only {ticketsAtThisPrice} left at this price!
                                                                </span>
                                                            )}
                                                            {priceChangeCountdown && (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/25">
                                                                    <Clock className="w-3 h-3" />
                                                                    Price goes up in {priceChangeCountdown}
                                                                </span>
                                                            )}
                                                            {ticketUrgency?.nextPrice && (
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                                    <TrendingUp className="w-3 h-3" />
                                                                    Next: LKR {ticketUrgency.nextPrice}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <h3 className="font-bold text-lg text-gray-900">{ticket.name}</h3>
                                                                <span className="text-xl font-bold text-purple-600">LKR {ticket.price}</span>
                                                            </div>
                                                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                                                {remaining > 0 ? (
                                                                    <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-md font-medium text-xs">Available</span>
                                                                ) : (
                                                                    <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded-md font-medium text-xs">Sold Out</span>
                                                                )}
                                                                <span className="text-gray-400 mx-1">•</span>
                                                                {remaining} seats left
                                                            </p>
                                                        </div>

                                                        <div className="flex items-center gap-4 ml-6">
                                                            {remaining > 0 ? (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleQuantityChange(ticket.id, -1)}
                                                                        disabled={!quantities[ticket.id]}
                                                                        className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                                    >
                                                                        <Minus className="w-4 h-4" />
                                                                    </button>
                                                                    <span className="w-8 text-center font-bold text-lg text-gray-900">
                                                                        {quantities[ticket.id] || 0}
                                                                    </span>
                                                                    <button
                                                                        onClick={() => handleQuantityChange(ticket.id, 1)}
                                                                        disabled={remaining === 0 || quantities[ticket.id] >= remaining}
                                                                        className="p-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-gray-900/20"
                                                                    >
                                                                        <Plus className="w-4 h-4" />
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleJoinWaitlist(ticket.id)}
                                                                    disabled={joiningWaitlist[ticket.id]}
                                                                    className="px-4 py-2 rounded-xl bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 transition-colors shadow-lg shadow-orange-600/20 flex items-center gap-2 "
                                                                    title="Join the waiting list in case a ticket becomes available"
                                                                >
                                                                    {joiningWaitlist[ticket.id] ? (
                                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                                    ) : (
                                                                        <>
                                                                            <Bell className="w-4 h-4" />
                                                                            Join Waitlist
                                                                        </>
                                                                    )}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            </div>

                            {/* Order Summary Sidebar */}
                            <div className="lg:col-span-1">
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 sticky top-24">
                                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        <ShoppingCart className="w-5 h-5 text-purple-600" />
                                        Order Summary
                                    </h3>

                                    <div className="space-y-4 mb-8">
                                        {event.ticketTypes?.map(ticket => {
                                            const qty = quantities[ticket.id] || 0;
                                            if (qty === 0) return null;
                                            return (
                                                <div key={ticket.id} className="flex justify-between items-center text-sm animate-in fade-in slide-in-from-left-2">
                                                    <div className="text-gray-600">
                                                        <span className="font-bold text-gray-900">{qty}x</span> {ticket.name}
                                                    </div>
                                                    <span className="font-medium text-gray-900">LKR {(qty * ticket.price).toFixed(2)}</span>
                                                </div>
                                            );
                                        })}

                                        {calculateTotal() === 0 && (
                                            <div className="text-center py-6 text-gray-400 text-sm italic">
                                                No tickets selected
                                            </div>
                                        )}

                                        <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                                            <span className="text-base font-bold text-gray-600">Total Amount</span>
                                            <span className="text-3xl font-extrabold text-gray-900">
                                            </span>
                                        </div>

                                        {/* Promo Code Input */}
                                        <div className="pt-4 border-t border-gray-100">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={promoCode}
                                                    onChange={(e) => {
                                                        setPromoCode(e.target.value);
                                                        if (isPromoValid) {
                                                            setIsPromoValid(false);
                                                            setDiscount(0);
                                                            setPromoMessage(null);
                                                        }
                                                    }}
                                                    placeholder="Promo Code"
                                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                                <button
                                                    onClick={handleApplyPromo}
                                                    disabled={!promoCode || calculateTotal() === 0}
                                                    className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
                                                >
                                                    Apply
                                                </button>
                                            </div>
                                            {promoMessage && (
                                                <p className={`text-xs mt-2 ${promoMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                                                    {promoMessage.text}
                                                </p>
                                            )}
                                        </div>

                                        {isPromoValid && (
                                            <div className="flex justify-between items-center text-green-600">
                                                <span className="text-sm font-medium">Discount</span>
                                                <span className="font-bold">-LKR {discount.toFixed(2)}</span>
                                            </div>
                                        )}

                                        <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                                            <span className="text-base font-bold text-gray-600">Final Total</span>
                                            <span className="text-3xl font-extrabold text-gray-900">
                                                LKR {(calculateTotal() - discount).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleCheckout}
                                        disabled={purchasing || calculateTotal() === 0}
                                        className={`w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none ${pulseStats.viewerCount > 5 || pulseStats.salesLastMinute > 0 ? 'animate-pulse ring-2 ring-purple-400 ring-offset-2' : ''}`}
                                    >
                                        {purchasing ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                {pulseStats.salesLastMinute > 0 && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full mr-2">🔥 Hot!</span>}
                                                CHECKOUT
                                                <CreditCard className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                    <p className="text-xs text-gray-400 text-center mt-4">
                                        Secure checkout powered by GoGather
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetails;
