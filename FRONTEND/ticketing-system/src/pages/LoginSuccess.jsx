import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/authSlice';
import { Loader } from 'lucide-react';
import api from '../api/axios';

const LoginSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [error, setError] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');

        const fetchUser = async (authToken) => {
            try {
                // Set token in localStorage first so the API client can use it
                localStorage.setItem('token', authToken);

                const response = await api.get('/auth/me');

                if (response.data) {
                    const user = response.data;
                    dispatch(loginSuccess({ token: authToken, user }));

                    // Check for redirect destination
                    const redirectPath = localStorage.getItem('redirectAfterLogin');
                    localStorage.removeItem('redirectAfterLogin');

                    // Redirect based on role or saved path
                    if (redirectPath && redirectPath !== '/login') {
                        navigate(redirectPath);
                    } else if (user.role === 'ADMIN') {
                        navigate('/dashboard/admin');
                    } else if (user.role === 'ORGANIZER') {
                        navigate('/dashboard/organizer');
                    } else {
                        navigate('/');
                    }
                } else {
                    throw new Error('Invalid user data received');
                }
            } catch (error) {
                console.error('Login failed:', error);
                localStorage.removeItem('token');
                setError('Authentication failed. Please try again.');
                setTimeout(() => navigate('/login'), 2000);
            }
        };

        if (token) {
            fetchUser(token);
        } else {
            navigate('/login');
        }
    }, [searchParams, navigate, dispatch]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="text-red-500 text-xl mb-4">⚠️</div>
                    <h2 className="text-xl font-semibold text-gray-900">{error}</h2>
                    <p className="mt-2 text-gray-500">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <Loader className="h-12 w-12 animate-spin text-purple-600 mx-auto" />
                <h2 className="mt-4 text-xl font-semibold text-gray-900">Logging you in...</h2>
            </div>
        </div>
    );
};

export default LoginSuccess;
