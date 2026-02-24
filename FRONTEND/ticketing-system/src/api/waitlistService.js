import api from './axios';

export const joinWaitlist = async (ticketTypeId) => {
    try {
        const response = await api.post('/waitlist/join', null, {
            params: { ticketTypeId }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};
