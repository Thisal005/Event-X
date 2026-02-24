import api from './axios';
import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

/**
 * Generate a magic link for a gatekeeper to access the scanner
 * @param {number} eventId - The event ID
 * @param {string} email - The gatekeeper's email
 * @returns {Promise} - Response with magicLink, email, eventId, eventName
 */
export const inviteGatekeeper = async (eventId, email) => {
    const response = await api.post(`/events/${eventId}/gatekeeper/invite`, { email });
    return response.data;
};

/**
 * Login with a gatekeeper magic link token
 * This is a PUBLIC endpoint - no auth required
 * @param {string} token - The magic link token
 * @returns {Promise} - Response with accessToken, eventId, eventName
 */
export const gatekeeperLogin = async (token) => {
    // Use raw axios since this is a public endpoint (no auth header needed)
    const response = await axios.post(`${API_BASE}/auth/gatekeeper-login`, { token });
    return response.data;
};

/**
 * Get list of active gatekeepers for an event
 * @param {number} eventId - The event ID
 * @returns {Promise} - Array of gatekeeper tokens
 */
export const getEventGatekeepers = async (eventId) => {
    const response = await api.get(`/events/${eventId}/gatekeepers`);
    return response.data;
};

export default {
    inviteGatekeeper,
    gatekeeperLogin,
    getEventGatekeepers,
};
