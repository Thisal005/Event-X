import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCurrentUser } from '../store/authSlice';
import { Loader } from 'lucide-react';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, isAuthenticated, isLoading, token } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const location = useLocation();

    useEffect(() => {
        // Only fetch user data if we have a token but absolutely no user data
        // This prevents unnecessary API calls when user data is already available
        if (token && !user && !isLoading) {
            dispatch(fetchCurrentUser());
        }
    }, [token, dispatch]); // Removed user and isLoading from deps to prevent loops

    // Show loading while fetching user data
    if (isLoading || (token && !user)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader className="h-12 w-12 animate-spin text-purple-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Not authenticated - redirect to login
    if (!isAuthenticated || !token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check role-based access
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // User doesn't have required role - redirect to home
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
