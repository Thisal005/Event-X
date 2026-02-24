import api from './axios';

export const createEvent = async (eventData) => {
    // Content-Type handling for FormData is managed by the axios interceptor
    const response = await api.post('/events', eventData);
    return response.data;
};

export const getMyEvents = async () => {
    const response = await api.get('/events/my-events');
    return response.data;
};

export const getAllEvents = async () => {
    const response = await api.get('/events');
    return response.data;
};

export const publishEvent = async (id) => {
    const response = await api.put(`/events/${id}/publish`);
    return response.data;
};

export const getEventById = async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
};

export const updateEvent = async (id, eventData) => {
    const config = eventData instanceof FormData ? { headers: { 'Content-Type': null } } : {};
    const response = await api.put(`/events/${id}`, eventData, config);
    return response.data;
};

export const deleteEvent = async (id) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
};

export const getEventStats = async (id) => {
    const response = await api.get(`/events/${id}/stats`);
    return response.data;
};

/**
 * Cancel an event and automatically refund all ticket holders.
 * @param {number} id - Event ID
 * @returns {Promise<{success: boolean, message: string, ordersRefunded: number, ticketsRefunded: number, amountRefunded: number}>}
 */
export const cancelEvent = async (id) => {
    const response = await api.post(`/events/${id}/cancel`);
    return response.data;
};

/**
 * Postpone an event with options to refund or keep tickets valid.
 * @param {number} id - Event ID
 * @param {string|null} newDate - New date in ISO format (optional)
 * @param {boolean} refundAll - If true, refund all tickets. If false, keep tickets valid.
 * @returns {Promise<{success: boolean, message: string, ordersRefunded: number, ticketsRefunded: number, amountRefunded: number}>}
 */
export const postponeEvent = async (id, newDate, refundAll) => {
    const response = await api.post(`/events/${id}/postpone`, {
        newDate,
        refundAll
    });
    return response.data;
};

/**
 * Approve an event (Admin only).
 * Sets approval status to APPROVED and auto-publishes the event.
 * @param {number} id - Event ID
 * @returns {Promise<Event>}
 */
export const approveEvent = async (id) => {
    const response = await api.put(`/events/${id}/approve`);
    return response.data;
};

/**
 * Reject an event (Admin only).
 * Sets approval status to REJECTED.
 * @param {number} id - Event ID
 * @returns {Promise<Event>}
 */
export const rejectEvent = async (id) => {
    const response = await api.put(`/events/${id}/reject`);
    return response.data;
};

/**
 * Get all events for admin dashboard (includes pending/rejected).
 * @returns {Promise<Event[]>}
 */
export const getAllEventsForAdmin = async () => {
    const response = await api.get('/events/admin/all');
    return response.data;
};
