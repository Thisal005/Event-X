import api from './axios';

/**
 * Get attendees for a specific event
 * @param {number} eventId - The event ID
 * @returns {Promise<Array>} - List of attendees (tickets)
 */
export const getEventAttendees = async (eventId) => {
    const response = await api.get(`/attendees?eventId=${eventId}`);
    return response.data;
};

/**
 * Get attendees for a specific event using path parameter
 * @param {number} eventId - The event ID
 * @returns {Promise<Array>} - List of attendees (tickets)
 */
export const getEventAttendeesByPath = async (eventId) => {
    const response = await api.get(`/attendees/event/${eventId}`);
    return response.data;
};

/**
 * Get all attendees for the current user's events (or all if admin)
 * @returns {Promise<Array>} - List of all attendees
 */
export const getAllAttendees = async () => {
    const response = await api.get('/attendees');
    return response.data;
};

export default {
    getEventAttendees,
    getEventAttendeesByPath,
    getAllAttendees
};
