import api from './axios';

export const getAllUsers = async () => {
    const response = await api.get('/admin/users');
    return response.data;
};

export const deleteUser = async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
};

export const getAdminStats = async () => {
    try {
        // Fetch all required data for stats calculation
        const [usersResponse, eventsResponse, ordersResponse] = await Promise.all([
            api.get('/admin/users').catch((err) => {
                console.warn('Failed to fetch users:', err);
                return { data: [] };
            }),
            api.get('/events').catch((err) => {
                console.warn('Failed to fetch events:', err);
                return { data: [] };
            }),
            api.get('/orders').catch((err) => {
                console.warn('Failed to fetch orders:', err);
                return { data: [] };
            })
        ]);

        const users = usersResponse.data || [];
        const events = eventsResponse.data || [];
        const orders = ordersResponse.data || [];

        // Calculate stats
        const totalRevenue = orders.reduce((acc, order) => {
            const orderTotal = order.orderItems
                ? order.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
                : (order.totalAmount || 0);
            return acc + orderTotal;
        }, 0);

        const totalTicketsSold = orders.reduce((acc, order) => {
            const orderTickets = order.orderItems
                ? order.orderItems.reduce((sum, item) => sum + item.quantity, 0)
                : 0;
            return acc + orderTickets;
        }, 0);

        return {
            totalUsers: users.length,
            totalEvents: events.length,
            publishedEvents: events.filter(e => e.status === 'PUBLISHED').length,
            pendingEvents: events.filter(e => e.status === 'DRAFT').length,
            totalRevenue,
            totalTicketsSold,
            totalOrders: orders.length,
            organizers: users.filter(u => u.role === 'ORGANIZER').length,
            customers: users.filter(u => u.role === 'CUSTOMER').length
        };
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return {
            totalUsers: 0,
            totalEvents: 0,
            publishedEvents: 0,
            pendingEvents: 0,
            totalRevenue: 0,
            totalTicketsSold: 0,
            totalOrders: 0,
            organizers: 0,
            customers: 0
        };
    }
};

export const getAllOrders = async () => {
    const response = await api.get('/orders');
    return response.data;
};

// Admin can also use event service for fetching all events,
// but if we need specific admin-only event endpoints (like approve/reject), we'd add them here.

// ==================== SYSTEM HEALTH MONITORING ====================

export const getSystemHealthCurrent = async () => {
    const response = await api.get('/system-health/current');
    return response.data;
};

export const getSystemHealthHistory = async () => {
    const response = await api.get('/system-health/history');
    return response.data;
};

export const getAlertThresholds = async () => {
    const response = await api.get('/system-health/thresholds');
    return response.data;
};

export const updateAlertThresholds = async (thresholds) => {
    const response = await api.post('/system-health/thresholds', thresholds);
    return response.data;
};

export const getSystemInfo = async () => {
    const response = await api.get('/system-health/info');
    return response.data;
};

export const sendTestAlert = async (email) => {
    return response.data;
};

// ==================== AUDIT LOGS ====================

export const getAuditLogs = async () => {
    const response = await api.get('/admin/audit-logs');
    return response.data;
};

export const getUserAuditLogs = async (userId) => {
    const response = await api.get(`/admin/audit-logs/user/${userId}`);
    return response.data;
};

// ==================== CUSTOM ROLES ====================

export const getAllRoles = async () => {
    const response = await api.get('/admin/roles');
    return response.data;
};

export const createRole = async (roleData) => {
    const response = await api.post('/admin/roles', roleData);
    return response.data;
};

export const updateRole = async (id, roleData) => {
    const response = await api.put(`/admin/roles/${id}`, roleData);
    return response.data;
};

export const deleteRole = async (id) => {
    const response = await api.delete(`/admin/roles/${id}`);
    return response.data;
};

// ==================== USER MANAGEMENT ====================

export const updateUser = async (id, userData) => {
    // Requires a new endpoint in AdminController or updating User entity directly
    // Assuming backend endpoint PUT /api/admin/users/{id} exists or will be created
    // For now, let's assume we need to add this endpoint to AdminController if not present.
    // Wait, AdminController only had deleteUser. I need to check/add updateUser there too.
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
};
