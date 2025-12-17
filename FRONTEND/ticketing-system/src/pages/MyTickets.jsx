import React, { useEffect, useState, useRef } from 'react';
import { getMyOrders } from '../api/orderService';
import Navbar from '../components/Navbar';
import InteractiveGridBackground from '../components/InteractiveGridBackground';
import { Calendar, MapPin, Receipt, ArrowRight, Ticket, Clock, Download, RefreshCw, Filter, Search, CheckCircle2, History, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import html2canvas from 'html2canvas';

const ITEMS_PER_PAGE = 5;

const MyTickets = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('latest');
    const [downloadingId, setDownloadingId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await getMyOrders();
                console.log("MyTickets: Fetched orders data:", data);
                if (Array.isArray(data)) {
                    setOrders(data);
                } else {
                    console.error("MyTickets: Received non-array data", data);
                    setOrders([]);
                }
            } catch (error) {
                console.error("Failed to fetch orders", error);
                setOrders([]);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    // Reset pagination when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filter]);

    const handleDownload = async (elementId, ticketName) => {
        setDownloadingId(elementId);
        const element = document.getElementById(elementId);
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true
            });

            const link = document.createElement('a');
            link.download = `${ticketName.replace(/\s+/g, '-').toLowerCase()}-ticket.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error("Download failed:", err);
        } finally {
            setDownloadingId(null);
        }
    };

    const getFilteredOrders = () => {
        let filtered = [...orders];
        const now = new Date();

        switch (filter) {
            case 'expired':
                return filtered.filter(order => {
                    const eventDate = order.orderItems?.[0]?.event?.date ? new Date(order.orderItems[0].event.date) : null;
                    return eventDate && eventDate < now;
                });
            case 'used':
                return filtered.filter(order =>
                    order.orderItems?.some(item =>
                        item.tickets?.some(t => t.status === 'USED')
                    )
                );
            case 'upcoming':
                return filtered.filter(order => {
                    const eventDate = order.orderItems?.[0]?.event?.date ? new Date(order.orderItems[0].event.date) : null;
                    return eventDate && eventDate >= now;
                });
            case 'latest':
            default:
                // Sort by order date descending
                return filtered.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
        }
    };

    const filteredOrders = getFilteredOrders();

    // Pagination Logic
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const totalSpent = Array.isArray(orders) ? orders.reduce((acc, order) => {
        const orderTotal = order.orderItems ? order.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;
        return acc + orderTotal;
    }, 0) : 0;

    const tabs = [
        { id: 'latest', label: 'All Tickets', icon: Ticket },
        { id: 'upcoming', label: 'Upcoming', icon: Calendar },
        { id: 'used', label: 'Used / Past', icon: History },
        { id: 'expired', label: 'Expired', icon: AlertCircle },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0c] relative text-white selection:bg-purple-500/30">
            <div className="fixed inset-0 bg-[#0a0a0c] z-[-1]" />
            <InteractiveGridBackground />

            <div className="relative z-10 w-full">
                <Navbar />

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28 ">
                    {/* Header Section */}
                    <div className='bg-white/95 backdrop-blur-xl p-8 rounded-[2rem] mb-8 border border-white/10 shadow-xl shadow-black/5'>
                        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
                                    My Tickets
                                </h1>
                                <p className="text-gray-500 text-lg max-w-2xl font-light">
                                    Manage your bookings, access your tickets, and track your event history all in one place.
                                </p>
                            </div>

                            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                                    <Receipt className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Total Spent</p>
                                    <p className="text-2xl font-bold text-gray-900">${totalSpent.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex flex-wrap items-center gap-2 bg-gray-100/50 p-1.5 rounded-2xl w-fit">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setFilter(tab.id)}
                                    className={`
                                    flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300
                                    ${filter === tab.id
                                            ? 'bg-white text-gray-900 shadow-sm scale-100 ring-1 ring-black/5'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'}
                                `}
                                >
                                    <tab.icon className={`w-4 h-4 ${filter === tab.id ? 'text-purple-600' : 'text-gray-400'}`} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid gap-6">
                            {[1, 2].map(i => (
                                <div key={i} className="bg-white/5 rounded-3xl p-8 border border-white/10 h-64 animate-pulse">
                                    <div className="flex gap-6 h-full">
                                        <div className="w-48 bg-white/5 rounded-2xl h-full" />
                                        <div className="flex-1 space-y-4 py-2">
                                            <div className="h-8 bg-white/5 rounded-lg w-1/3" />
                                            <div className="h-4 bg-white/5 rounded-lg w-1/4" />
                                            <div className="h-20 bg-white/5 rounded-lg w-full mt-8" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 bg-white/5 rounded-[2.5rem] border border-white/10 border-dashed text-center backdrop-blur-sm">
                            <div className="w-24 h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center mb-8 shadow-inner ring-1 ring-white/10">
                                <Ticket className="w-10 h-10 text-gray-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">No tickets found</h3>
                            <p className="text-gray-400 mb-8 max-w-md">
                                {filter === 'latest'
                                    ? "You haven't purchased any tickets yet. Time to explore some events!"
                                    : "No tickets match the selected filter."}
                            </p>
                            <Link
                                to="/"
                                className="px-8 py-3.5 bg-white text-black font-bold rounded-xl shadow-lg shadow-white/5 hover:bg-gray-200 transition-all hover:-translate-y-0.5 flex items-center gap-2"
                            >
                                <Search className="w-4 h-4" />
                                Explore Events
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-8">
                            {currentOrders.map((order) => {
                                const firstItem = order.orderItems?.[0];
                                const event = firstItem?.event;
                                const orderTotal = order.totalAmount || 0;
                                const isRefunded = order.status === 'REFUNDED';
                                const cardId = `ticket-card-${order.orderId}`;

                                return (
                                    <div
                                        key={order.orderId}
                                        id={cardId}
                                        className="group relative bg-[#121214] rounded-[2.5rem] border border-white/10 overflow-hidden hover:border-purple-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-900/10"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                        <div className="flex flex-col lg:flex-row">
                                            {/* Event Image Side */}
                                            <div className="lg:w-80 relative min-h-[16rem] lg:min-h-full overflow-hidden">
                                                {event?.bannerImage ? (
                                                    <img
                                                        src={event.bannerImage}
                                                        alt={event?.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-75 group-hover:brightness-100"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center">
                                                        <Ticket className="w-16 h-16 text-gray-600" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#121214] via-transparent to-transparent lg:bg-gradient-to-r" />

                                                {/* Date Badge */}
                                                <div className="absolute top-6 left-6 bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl text-center min-w-[4.5rem]">
                                                    <p className="text-xs font-bold text-purple-300 uppercase">
                                                        {event?.date ? new Date(event.date).toLocaleDateString('en-US', { month: 'short' }) : 'TBA'}
                                                    </p>
                                                    <p className="text-2xl font-black text-white">
                                                        {event?.date ? new Date(event.date).getDate() : '--'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Content Side */}
                                            <div className="flex-1 p-8 lg:p-10 flex flex-col relative">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div>
                                                        <h2 className="text-2xl lg:text-3xl font-black text-white mb-3 group-hover:text-purple-400 transition-colors">
                                                            {event?.name || 'Event Name Unavailable'}
                                                        </h2>
                                                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400">
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="w-4 h-4 text-purple-500" />
                                                                {event?.date ? new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Time TBA'}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <MapPin className="w-4 h-4 text-purple-500" />
                                                                {event?.venue || 'Venue TBA'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {isRefunded ? (
                                                        <span className="px-4 py-1.5 bg-red-500/10 text-red-500 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5 border border-red-500/20">
                                                            <RefreshCw className="w-3.5 h-3.5" />
                                                            Refunded
                                                        </span>
                                                    ) : (
                                                        <span className="px-4 py-1.5 bg-green-500/10 text-green-500 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5 border border-green-500/20">
                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                            Confirmed
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Ticket Items */}
                                                <div className="space-y-4 mb-8">
                                                    {order.orderItems.map((item, idx) => (
                                                        <div key={idx} className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                                            <div className="flex items-center gap-4">
                                                                <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm font-bold text-white">
                                                                    {item.quantity}×
                                                                </span>
                                                                <div>
                                                                    <p className="font-bold text-white">{item.ticketName} Ticket</p>
                                                                    <p className="text-xs text-gray-400">Standard Access</p>
                                                                </div>
                                                            </div>

                                                            {/* QR Codes */}
                                                            {item.tickets && item.tickets.length > 0 && (
                                                                <div className="flex flex-wrap gap-3">
                                                                    {item.tickets.map((ticket) => (
                                                                        <div key={ticket.ticketId} className="relative group/qr">
                                                                            <div className="bg-white p-2 rounded-xl">
                                                                                <img
                                                                                    src={`data:image/png;base64,${ticket.qrCode}`}
                                                                                    alt={`QR for Ticket ${ticket.ticketId}`}
                                                                                    className="w-16 h-16 object-contain"
                                                                                />
                                                                            </div>
                                                                            {/* Usage Status Badge */}
                                                                            {ticket.status === 'USED' && (
                                                                                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] rounded-xl flex items-center justify-center">
                                                                                    <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold uppercase">Used</span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="mt-auto px-6 py-4 bg-white/5 -mx-8 -mb-10 lg:-mx-10 lg:-mb-10 flex items-center justify-between border-t border-white/10">
                                                    <div>
                                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Order Total</p>
                                                        <div className="flex items-baseline gap-2">
                                                            <p className="text-xl font-bold text-white">${orderTotal.toFixed(2)}</p>
                                                            <p className="text-xs text-gray-500">
                                                                #{String(order.orderId).substring(0, 8)}...
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDownload(cardId, event?.name || 'ticket')}
                                                        disabled={downloadingId === cardId}
                                                        className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {downloadingId === cardId ? (
                                                            <>
                                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                                Saving...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Download className="w-4 h-4" />
                                                                Save Ticket
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center mt-8 gap-4 pb-3 bg-white rounded-2xl p-2">
                                    <button
                                        onClick={() => paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="p-3 rounded-xl bg-purple-600 border border-white/10 text-white  disabled:cursor-not-allowed hover:bg-purple-800 transition-all"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>

                                    <div className="flex items-center gap-2 ">
                                        {[...Array(totalPages)].map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => paginate(i + 1)}
                                                className={`
                                                    w-10 h-10 rounded-xl font-bold text-sm transition-all bg-purple-50 
                                                    ${currentPage === i + 1
                                                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50 scale-110'
                                                        : 'bg-grey-100 text-gray-400 hover:bg-grey-100 border border-white/10'}
                                                `}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => paginate(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="p-3 rounded-xl bg-purple-600 border border-white/10 text-white  disabled:cursor-not-allowed hover:bg-purple-800 transition-all"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyTickets;
