import axios from 'axios';

const API_URL = 'http://localhost:8080/api/tickets';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
};

export const validateTicket = async (qrData) => {
    const response = await axios.post(`${API_URL}/validate`, { qrData }, getAuthHeader());
    return response.data;
};

export const redeemTicket = async (qrData) => {
    const response = await axios.post(`${API_URL}/redeem`, { qrData }, getAuthHeader());
    return response.data;
};
