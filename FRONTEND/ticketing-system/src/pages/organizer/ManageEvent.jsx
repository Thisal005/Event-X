import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardHeader from '../../components/DashboardHeader';
import PriceRuleManager from '../../components/PriceRuleManager';
import LiveControlPanel from '../../components/LiveControlPanel';
import { getEventById, updateEvent, deleteEvent, getEventStats, cancelEvent, postponeEvent } from '../../api/eventService';
import { getEventAttendees } from '../../api/attendeeService';
import api from '../../api/axios';
import { inviteGatekeeper, getEventGatekeepers } from '../../api/gatekeeperService';

// Sub-components
import EventHeader from './components/ManageEvent/EventHeader';
import EventOverview from './components/ManageEvent/EventOverview';
import EditEventForm from './components/ManageEvent/EditEventForm';
import TicketManagement from './components/ManageEvent/TicketManagement';
import PromoCodeManager from './components/ManageEvent/PromoCodeManager';
import EventMessages from './components/ManageEvent/EventMessages';
import StaffManagement from './components/ManageEvent/StaffManagement';
import EventAnalytics from './components/ManageEvent/EventAnalytics';
import AttendeeList from './components/ManageEvent/AttendeeList';

import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const ManageEvent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [event, setEvent] = useState(null);
    const [stats, setStats] = useState(null);
    const [attendees, setAttendees] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [promoCodes, setPromoCodes] = useState([]);

    // Promo Code Form State
    const [promoForm, setPromoForm] = useState({
        code: '',
        discountAmount: '',
        type: 'PERCENTAGE',
        maxUses: '',
        expiryDate: ''
    });

    // Gatekeeper staff state
    const [gatekeeperEmail, setGatekeeperEmail] = useState('');
    const [generatedLink, setGeneratedLink] = useState('');
    const [gatekeepers, setGatekeepers] = useState([]);
    const [isGeneratingLink, setIsGeneratingLink] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);

    // Cancel/Postpone Loading state
    const [isCancelling, setIsCancelling] = useState(false);
    const [isPostponing, setIsPostponing] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        date: '',
        venue: '',
        category: '',
        bannerImage: '',
        ticketTypes: [], // { name, price, quantity, sold }
        communication: null // communication settings
    });

    useEffect(() => {
        // WebSocket Connection
        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            onConnect: () => {
                console.log('Connected to WebSocket');
                client.subscribe(`/topic/event/${id}`, (message) => {
                    if (message.body) {
                        const update = JSON.parse(message.body);
                        if (update.type === 'CHECK_IN') {
                            console.log("Received Check-In Update:", update);
                            // Update total sold count
                            setStats(prevStats => {
                                if (!prevStats) return prevStats;
                                return {
                                    ...prevStats,
                                    totalTicketsSold: (prevStats.totalTicketsSold || 0) + 1
                                };
                            });

                            // Update attendee list if open
                            setAttendees(prev => {
                                if (!Array.isArray(prev)) return [];
                                return prev.map(t => {
                                    if (t.id === update.ticketId) {
                                        return { ...t, status: 'USED', checkInTime: update.checkInTime };
                                    }
                                    return t;
                                });
                            });

                            // Optionally refresh full stats to ensure synchronization
                            fetchStatsData();
                        }
                    }
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
        });

        client.activate();

        return () => {
            client.deactivate();
        };
    }, [id]);

    useEffect(() => {
        fetchEventData();
        fetchStatsData();
        fetchPromoCodes();
        fetchAttendees();
        fetchGatekeepers();
    }, [id]);

    const fetchAttendees = async () => {
        try {
            let data = await getEventAttendees(id);

            // If data is a string (unexpectedly), try to parse it
            if (typeof data === 'string') {
                try {
                    data = JSON.parse(data);
                } catch (e) {
                    console.error("Failed to parse attendees JSON:", e);
                }
            }

            if (Array.isArray(data)) {
                setAttendees(data);
            } else {
                console.error("Fetched attendees is not an array:", data);
                setAttendees([]);
            }
        } catch (error) {
            console.error("Failed to fetch attendees", error);
            setAttendees([]);
        }
    };

    const fetchPromoCodes = async () => {
        try {
            const res = await api.get(`/promo-codes?eventId=${id}`);
            setPromoCodes(res.data);
        } catch (err) {
            console.error("Failed to fetch promo codes", err);
        }
    };

    const handleCreatePromo = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...promoForm,
                eventId: parseInt(id),
                discountAmount: parseFloat(promoForm.discountAmount),
                maxUses: parseInt(promoForm.maxUses),
                expiryDate: new Date(promoForm.expiryDate).toISOString(),
            };
            const res = await api.post('/promo-codes', payload);
            setPromoCodes([...promoCodes, res.data]);
            setPromoForm({
                code: '',
                discountAmount: '',
                type: 'PERCENTAGE',
                maxUses: '',
                expiryDate: ''
            });
            alert('Promo Code Created');
        } catch (err) {
            console.error(err);
            alert('Failed to create promo code');
        }
    };

    const handleDeletePromo = async (promoId) => {
        if (!window.confirm("Delete this promo code?")) return;
        try {
            await api.delete(`/promo-codes/${promoId}`);
            setPromoCodes(promoCodes.filter(p => p.id !== promoId));
        } catch (err) {
            console.error(err);
            alert('Failed to delete promo code');
        }
    };

    const fetchEventData = async () => {
        try {
            setLoading(true);
            const data = await getEventById(id);
            setEvent(data);
            setFormData({
                name: data.name,
                description: data.description,
                date: data.date,
                venue: data.venue,
                category: data.category,
                bannerImage: data.bannerImage,
                ticketTypes: data.ticketTypes || [],
                communication: data.communication
            });
        } catch (error) {
            console.error("Failed to fetch event details", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStatsData = async () => {
        try {
            const data = await getEventStats(id);
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch event stats", error);
        }
    };

    const handleInputChange = (e) => {
        const { name } = e.target;
        if (e.target.type === 'file') {
            setFormData(prev => ({ ...prev, [name]: e.target.files[0] }));
        } else {
            const { value } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleTicketChange = (index, field, value) => {
        const newTickets = [...formData.ticketTypes];
        newTickets[index][field] = value;
        setFormData(prev => ({ ...prev, ticketTypes: newTickets }));
    };

    const addTicketType = () => {
        setFormData(prev => ({
            ...prev,
            ticketTypes: [...prev.ticketTypes, { name: '', price: 0, quantity: 100, sold: 0 }]
        }));
    };

    const removeTicketType = (index) => {
        const newTickets = formData.ticketTypes.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, ticketTypes: newTickets }));
    };

    const handleSave = async () => {
        try {
            const data = new FormData();

            const eventObj = { ...formData };
            // If bannerImage is a file, we don't want to stringify it in the JSON event object
            // The backend handles the file separately
            if (eventObj.bannerImage instanceof File) {
                // If we are uploading a new file, we can omit the bannerImage in JSON
                // or set it to null. The backend will overwrite it with the new file URL.
                eventObj.bannerImage = null;
            }

            data.append('event', JSON.stringify(eventObj));

            if (formData.bannerImage instanceof File) {
                data.append('file', formData.bannerImage);
            }

            await updateEvent(id, data);

            // After save, if it was a file, we might want to refresh from server or 
            // assume success. Ideally fetchEventData() handles it.
            setEvent({ ...event, ...formData });
            setIsEditing(false);
            fetchEventData(); // Refresh to get any server-side updates
            // Also notify user?
            alert("Event saved successfully.");
        } catch (error) {
            console.error("Failed to update event", error);
            alert("Failed to update event details");
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
            try {
                await deleteEvent(id);
                navigate('/dashboard/organizer');
            } catch (error) {
                console.error("Failed to delete event", error);
            }
        }
    };

    // Gatekeeper Functions
    const fetchGatekeepers = async () => {
        try {
            const data = await getEventGatekeepers(id);
            setGatekeepers(data || []);
        } catch (error) {
            console.error("Failed to fetch gatekeepers", error);
            setGatekeepers([]);
        }
    };

    const handleGenerateGatekeeperLink = async () => {
        if (!gatekeeperEmail) return;

        setIsGeneratingLink(true);
        setLinkCopied(false);
        try {
            const response = await inviteGatekeeper(id, gatekeeperEmail);
            setGeneratedLink(response.magicLink);
            setGatekeeperEmail('');
            fetchGatekeepers(); // Refresh the list
        } catch (error) {
            console.error("Failed to generate gatekeeper link", error);
            alert(error.response?.data?.error || "Failed to generate magic link");
        } finally {
            setIsGeneratingLink(false);
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(generatedLink).then(() => {
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 3000);
        });
    };

    // Cancel Event Handler
    const handleCancelEvent = async () => {
        setIsCancelling(true);
        try {
            const result = await cancelEvent(id);
            // Result handling handled by props/alert below
            fetchEventData(); // Refresh to show cancelled status
            alert(`Event cancelled successfully! ${result.ticketsRefunded} tickets refunded, $${result.amountRefunded.toFixed(2)} returned to buyers.`);
        } catch (error) {
            console.error("Failed to cancel event", error);
            alert(error.response?.data?.message || "Failed to cancel event. Please try again.");
        } finally {
            setIsCancelling(false);
        }
    };

    // Postpone Event Handler
    const handlePostponeEvent = async (postponeData) => {
        setIsPostponing(true);
        try {
            const result = await postponeEvent(id, postponeData.newDate || null, postponeData.refundAll);
            fetchEventData(); // Refresh to show new date/status

            if (postponeData.refundAll) {
                alert(`Event postponed! ${result.ticketsRefunded} tickets refunded, $${result.amountRefunded.toFixed(2)} returned to buyers.`);
            } else {
                alert(`Event postponed! Tickets remain valid for the new date. Buyers have been notified.`);
            }
        } catch (error) {
            console.error("Failed to postpone event", error);
            alert(error.response?.data?.message || "Failed to postpone event. Please try again.");
        } finally {
            setIsPostponing(false);
        }
    };

    // Transform API stats to Chart Data for Overview
    const salesData = stats?.dailySales?.map(d => ({
        name: new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' }),
        fullDate: d.date,
        sales: d.sales
    })) || [];

    const ticketSalesData = stats?.ticketTypeStats?.map(t => ({
        name: t.name,
        sold: t.sold,
        remaining: t.quantity - t.sold
    })) || [];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50">
            <DashboardHeader />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <EventHeader
                    event={event}
                    formData={formData}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />

                {/* Content */}
                <div className="space-y-6">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <EventOverview
                            event={event}
                            stats={stats}
                            salesData={salesData}
                            ticketSalesData={ticketSalesData}
                        />
                    )}

                    {/* Edit Tab */}
                    {activeTab === 'edit' && (
                        <EditEventForm
                            formData={formData}
                            handleInputChange={handleInputChange}
                            handleSave={handleSave}
                            event={event}
                            onDelete={handleDelete}
                            onCancel={handleCancelEvent}
                            onPostpone={handlePostponeEvent}
                            isCancelling={isCancelling}
                            isPostponing={isPostponing}
                        />
                    )}

                    {/* Tickets Tab */}
                    {activeTab === 'tickets' && (
                        <TicketManagement
                            formData={formData}
                            addTicketType={addTicketType}
                            removeTicketType={removeTicketType}
                            handleTicketChange={handleTicketChange}
                            handleSave={handleSave}
                            eventId={id}
                        />
                    )}

                    {/* Pricing Tab */}
                    {activeTab === 'pricing' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Dynamic Pricing</h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Set up automatic price adjustments based on sales or time
                                    </p>
                                </div>
                            </div>
                            <PriceRuleManager
                                ticketTypes={formData.ticketTypes}
                                onRuleChange={fetchEventData}
                            />
                        </div>
                    )}

                    {/* Promos Tab */}
                    {activeTab === 'promos' && (
                        <PromoCodeManager
                            promoCodes={promoCodes}
                            promoForm={promoForm}
                            setPromoForm={setPromoForm}
                            handleCreatePromo={handleCreatePromo}
                            handleDeletePromo={handleDeletePromo}
                        />
                    )}

                    {/* Messages/Communication Tab */}
                    {activeTab === 'messages' && (
                        <EventMessages
                            formData={formData}
                            handleInputChange={handleInputChange}
                            handleSave={handleSave}
                            setFormData={setFormData}
                        />
                    )}

                    {/* Analytics Tab */}
                    {activeTab === 'analytics' && (
                        <EventAnalytics
                            stats={stats}
                            ticketSalesData={ticketSalesData}
                        />
                    )}

                    {/* Attendance Tab */}
                    {activeTab === 'attendance' && (
                        <AttendeeList
                            attendees={attendees}
                            fetchAttendees={fetchAttendees}
                        />
                    )}

                    {/* Staff Tab */}
                    {activeTab === 'staff' && (
                        <StaffManagement
                            gatekeeperEmail={gatekeeperEmail}
                            setGatekeeperEmail={setGatekeeperEmail}
                            gatekeepers={gatekeepers}
                            isGeneratingLink={isGeneratingLink}
                            generatedLink={generatedLink}
                            linkCopied={linkCopied}
                            handleGenerateGatekeeperLink={handleGenerateGatekeeperLink}
                            handleCopyLink={handleCopyLink}
                            onOpenScanner={() => navigate(`/scanner/${id}`)}
                        />
                    )}

                    {/* Live Control Tab */}
                    {activeTab === 'live' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                            <LiveControlPanel eventId={id} />
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default ManageEvent;
