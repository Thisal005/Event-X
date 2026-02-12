import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log(`[Axios] Attaching token to ${config.url}:`, token.substring(0, 20) + '...');
        } else {
            console.warn(`[Axios] No token found for ${config.url}`);
        }

        // If data is FormData, let the browser set Content-Type with proper boundary
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor to handle authentication errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const { status, config, data } = error.response;
            const requestUrl = config?.url || '';
            const requestMethod = config?.method || 'GET';

            // Log the error for debugging
            console.error(`API Error [${status}] ${requestMethod.toUpperCase()} ${requestUrl}:`, data);

            // Handle 403 Forbidden - authenticated but not authorized
            // Don't logout - user is authenticated, just lacks permission for this action
            if (status === 403) {
                console.warn('Access denied: You do not have permission for this action', { requestUrl });
            }

            // NOTE: We no longer auto-logout on 401 errors
            // Each component should handle authentication errors appropriately
            // This prevents aggressive logout during page loads when multiple API calls happen
        }
        return Promise.reject(error);
    }
);

export default api;
