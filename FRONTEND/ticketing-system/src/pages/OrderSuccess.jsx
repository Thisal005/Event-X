import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import api from '../api/axios';
import { getMyOrders } from '../api/orderService';
import TicketTemplate from '../components/TicketTemplate';
import Navbar from '../components/Navbar';
import InteractiveGridBackground from '../components/InteractiveGridBackground';
import { CheckCircle, Mail, Loader2, ArrowRight, Download } from 'lucide-react';

const OrderSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [order, setOrder] = useState(location.state?.order || null);
    const [loading, setLoading] = useState(!location.state?.order);
    const [emailing, setEmailing] = useState(false);
    const [emailStatus, setEmailStatus] = useState(null);
    const ticketsRef = useRef({}); // Refs for each ticket element

    const orderId = order ? (order.orderId || order.id) : null;

    // Keep track of whether we have a valid orderId from navigation state
    const navigationOrderId = location.state?.order?.id || location.state?.order?.orderId;

    useEffect(() => {
        // Always fetch the order from the API to get properly structured data with tickets
        const fetchOrder = async () => {
            setLoading(true);
            try {
                const orders = await getMyOrders();
                if (orders && orders.length > 0) {
                    // If we have an order ID from navigation, find that specific order
                    // Otherwise, get the latest order
                    let targetOrder;
                    if (navigationOrderId) {
                        targetOrder = orders.find(o => o.orderId === navigationOrderId);
                    }
                    if (!targetOrder) {
                        // Fallback to latest order
                        targetOrder = orders.sort((a, b) => b.orderId - a.orderId)[0];
                    }
                    setOrder(targetOrder);
                }
            } catch (err) {
                console.error("Failed to load order", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [navigationOrderId]);

    // Removed auto-email trigger since backend now handles emails

    const sendTicketsToEmail = async () => {
        if (!order || !orderId) return;
        setEmailing(true);
        setEmailStatus(null);

        try {
            // Small delay to ensure all refs are populated
            await new Promise(resolve => setTimeout(resolve, 500));

            const formData = new FormData();
            formData.append('orderId', orderId);

            let ticketCount = 0;

            // Iterate through items and tickets to capture images
            for (const item of order.orderItems) {
                if (item.tickets) {
                    for (const ticket of item.tickets) {
                        const tId = ticket.ticketId || ticket.id;
                        if (!tId) continue;

                        const ticketElement = ticketsRef.current[tId];
                        if (ticketElement) {
                            try {
                                const canvas = await html2canvas(ticketElement, {
                                    scale: 2,
                                    useCORS: true,
                                    logging: false,
                                    backgroundColor: '#ffffff'
                                });

                                const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                                formData.append('files', blob, `ticket-${tId}.png`);
                                formData.append('ticketIds', tId);
                                ticketCount++;
                            } catch (err) {
                                console.error(`Failed to capture ticket ${tId}`, err);
                            }
                        }
                    }
                }
            }

            if (ticketCount > 0) {
                await api.post('/orders/email-tickets', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setEmailStatus('sent');
            } else {
                console.warn("No tickets were captured for emailing.");
                setEmailStatus('error');
            }
        } catch (err) {
            console.error("Error sending tickets to email", err);
            setEmailStatus('error');
        } finally {
            setEmailing(false);
        }
    };

    const downloadTicket = async (ticketId) => {
        const ticketElement = ticketsRef.current[ticketId];
        if (!ticketElement) {
            console.error("Ticket element not found for download");
            return;
        }

        try {
            const canvas = await html2canvas(ticketElement, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const link = document.createElement('a');
            link.download = `ticket-${ticketId}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error("Failed to download ticket", err);
            alert("Failed to download ticket. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <h2 className="text-2xl font-bold mb-4">Order not found</h2>
                <button onClick={() => navigate('/')} className="text-purple-600 hover:underline">Return Home</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent relative">
            <InteractiveGridBackground />
            <div className="relative z-10">
                <Navbar />

                <div className="max-w-4xl mx-auto px-4 py-12 pt-24">
                    <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 text-center border border-gray-100">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Order Confirmed!</h1>
                        <p className="text-gray-500 text-lg mb-6">Order #{orderId}</p>

                        <div className="flex flex-col items-center gap-4 mb-6">
                            {emailing ? (
                                <span className="flex items-center text-purple-600 bg-purple-50 px-4 py-2 rounded-full text-sm font-medium">
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Sending ticket images to your email...
                                </span>
                            ) : emailStatus === 'sent' ? (
                                <span className="flex items-center text-green-600 bg-green-50 px-4 py-2 rounded-full text-sm font-medium">
                                    <Mail className="w-4 h-4 mr-2" />
                                    Ticket images sent to your email!
                                </span>
                            ) : emailStatus === 'error' ? (
                                <span className="text-red-500 text-sm">
                                    Failed to send email. Please try again or download your tickets.
                                </span>
                            ) : (
                                <p className="text-gray-500 text-sm">
                                    Your tickets are ready! Send them to your email or download below.
                                </p>
                            )}
                        </div>

                        <div className="flex flex-wrap justify-center gap-3">
                            {!emailStatus && !emailing && (
                                <button
                                    onClick={sendTicketsToEmail}
                                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center"
                                >
                                    <Mail className="w-4 h-4 mr-2" />
                                    Send Tickets to Email
                                </button>
                            )}
                            <button onClick={() => navigate('/my-tickets')} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                                View My Tickets
                            </button>
                            <button onClick={() => navigate('/')} className="px-6 py-2 bg-white/10 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center border border-gray-200">
                                Continue Exploring <ArrowRight className="w-4 h-4 ml-2" />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <h2 className="text-2xl font-bold text-white mb-6">Your Tickets</h2>
                        {order.orderItems.map((item, i) => (
                            <div key={i}>
                                {item.tickets && item.tickets.map((ticket) => {
                                    // Resolve the correct ID property (Entity uses 'id', DTO uses 'ticketId')
                                    const tId = ticket.ticketId || ticket.id;
                                    if (!tId) return null;

                                    return (
                                        <div key={tId} className="mb-8 transform hover:scale-[1.01] transition-transform duration-300">
                                            {/* Pass Ref to this component logic */}
                                            <TicketTemplate
                                                ref={el => ticketsRef.current[tId] = el}
                                                event={item.event}
                                                ticket={{
                                                    ...ticket,
                                                    ticketId: tId, // Ensure prop has consistent ID
                                                    price: item.price
                                                }}
                                                type="final"
                                            />
                                            <div className="flex justify-center items-center gap-4 mt-3">
                                                <span className="text-white/60 text-sm">Ticket #{tId}</span>
                                                <button
                                                    onClick={() => downloadTicket(tId)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    Download
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
