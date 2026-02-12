import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

// Async thunk to fetch current user data
export const fetchCurrentUser = createAsyncThunk(
    'auth/fetchCurrentUser',
    async (_, { rejectWithValue, getState }) => {
        try {
            const response = await api.get('/auth/me');
            return response.data;
        } catch (error) {
            // Don't remove token here - let the reducer decide based on error type
            const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to fetch user';
            return rejectWithValue({ 
                message: errorMessage,
                status: error.response?.status 
            });
        }
    }
);

// Helper to get initial user from localStorage
const getStoredUser = () => {
    try {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    } catch {
        return null;
    }
};

const initialState = {
    user: getStoredUser(),
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    isLoading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginSuccess: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            state.isLoading = false;
            state.error = null;
            localStorage.setItem('token', action.payload.token);
            localStorage.setItem('user', JSON.stringify(action.payload.user));
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.isLoading = false;
            state.error = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCurrentUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.user = action.payload;
                state.isAuthenticated = true;
                state.isLoading = false;
                localStorage.setItem('user', JSON.stringify(action.payload));
            })
            .addCase(fetchCurrentUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload?.message || 'Failed to fetch user';
                
                // Only clear auth state if it's a 401 error (actually unauthorized)
                // Don't clear if it's a network error or other issue
                if (action.payload?.status === 401) {
                    state.user = null;
                    state.token = null;
                    state.isAuthenticated = false;
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
                // For other errors, keep the existing user data if available
            });
    },
});

export const { loginSuccess, logout, setLoading, clearError } = authSlice.actions;
export default authSlice.reducer;
