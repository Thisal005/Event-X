import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { CgSpinner } from 'react-icons/cg';
import { FcGoogle } from 'react-icons/fc';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/authSlice';
import api from '../api/axios';

import InteractiveLiquidBackground from '../components/InteractiveLiquidBackground';
import InteractiveParticleBackground from '../components/InteractiveParticleBackground';
import login from '../assets/login.jpeg';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({ email: '', password: '' });
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleGoogleLogin = () => {
        setIsLoading(true);
        setError('');
        // Redirect to backend OAuth2 endpoint
        window.location.href = 'http://localhost:8080/oauth2/authorization/google';
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(''); // Clear error when user types
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/login', formData);
            const { token, id, email, name, role } = response.data;

            // Dispatch login success with user data
            dispatch(loginSuccess({
                token,
                user: { id, email, name, role }
            }));

            // Redirect based on role
            if (role === 'ADMIN') {
                navigate('/dashboard/admin');
            } else if (role === 'ORGANIZER') {
                navigate('/dashboard/organizer');
            } else {
                navigate('/');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data || 'Login failed. Please check your credentials.';
            setError(typeof errorMessage === 'string' ? errorMessage : 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 lg:p-6 font-sans relative">
            <InteractiveParticleBackground />
            <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col lg:flex-row min-h-[600px] border border-gray-100 relative z-10">

                {/* Left Side - Illustration */}
                <div className="hidden lg:flex lg:w-1/2 bg-indigo-900 items-center justify-center relative overflow-hidden">
                    <InteractiveLiquidBackground />

                    {/* Content over background */}
                    <div className="relative z-10 p-12 text-center flex flex-col items-center bg-gray-50    rounded-lg hoverp-3 shadow-lg shadow-gray-500 z-20 ">
                        <div className="relative w-full max-w-md mx-auto mb-6">
                            {/* Placeholder for the illustration if file missing, handled by alt */}
                            <div className="text-6xl text-purple-300 font-bold opacity-100 hover:text-white  hover:opacity-100 hover:cursor-pointer transition-all duration-200  ease-in-out bg-purple-500 text-white   rounded-lg p-3 shadow-lg hover:shadow-purple-500  z-20  ">
                                <h2>GoGather</h2>
                            </div>
                        </div>
                        <div className="space-y-4 max-w-xs mx-auto ">
                            <h3 className="text-2xl font-bold text-gray-800">Seamless Event Management</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Discover, book, and manage your events with our premium ticketing platform.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full lg:w-1/2 p-6 md:p-8 lg:p-12 flex flex-col justify-center bg-white">
                    <div className="max-w-md mx-auto w-full">
                        <div className="text-left mb-8">
                            <div className="mb-2">
                                <span className="text-purple-600 font-bold text-lg tracking-wide uppercase">GoGather</span>
                            </div>
                            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                                Welcome Back
                            </h2>
                            <p className="mt-2 text-sm text-gray-500">
                                Please sign in to your account
                            </p>
                        </div>

                        <form className="space-y-6" onSubmit={handleLogin}>
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-5">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Email Address
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 sm:text-sm bg-gray-50/50 hover:bg-white"
                                        placeholder="Enter your email"
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                            Password
                                        </label>
                                    </div>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="current-password"
                                            required
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 sm:text-sm bg-gray-50/50 hover:bg-white pr-10"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-purple-600 transition-colors focus:outline-none"
                                            onClick={togglePasswordVisibility}
                                        >
                                            {showPassword ? (
                                                <FiEyeOff className="h-5 w-5" />
                                            ) : (
                                                <FiEye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer transition-colors"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 cursor-pointer select-none">
                                        Remember me
                                    </label>
                                </div>

                                <div className="text-sm">
                                    <a href="#" className="font-medium text-purple-600 hover:text-purple-500 transition-colors">
                                        Forgot Password?
                                    </a>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <CgSpinner className="animate-spin h-5 w-5 mr-2" />
                                ) : (
                                    "Sign In"
                                )}
                            </button>
                        </form>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-gray-500 font-medium">
                                        Or continue with
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4">
                                <button
                                    type="button"
                                    onClick={handleGoogleLogin}
                                    className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-100 transition-all duration-200 transform hover:-translate-y-0.5"
                                >
                                    <FcGoogle className="h-5 w-5 mr-2" />
                                    Google
                                </button>

                            </div>

                            <p className="mt-4 text-center text-sm text-gray-600">
                                Don't have an account?{' '}
                                <Link to="/signup" className="font-bold text-purple-600 hover:text-purple-500 transition-colors">
                                    Sign Up
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
