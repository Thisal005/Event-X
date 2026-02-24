import api from './axios';

export const createOrder = async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
};

export const getMyOrders = async () => {
    const response = await api.get('/orders/my-orders');
    return response.data;
};

export const validateCoupon = async (code, amount, eventId) => {
    const response = await api.get(`/orders/validate-coupon?code=${code}&amount=${amount}&eventId=${eventId}`);
    return response.data;
};
