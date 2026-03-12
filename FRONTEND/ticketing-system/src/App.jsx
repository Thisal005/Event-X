import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import LoginSuccess from './pages/LoginSuccess';
import Home from './pages/Home';
import EventDetails from './pages/EventDetails';
import MyTickets from './pages/MyTickets';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCurrentUser } from './store/authSlice';

import ProtectedRoute from './components/ProtectedRoute';
import OrganizerDashboard from './pages/organizer/Dashboard';
import CreateEvent from './pages/organizer/CreateEvent';
import ManageEvent from './pages/organizer/ManageEvent';
import Scanner from './pages/Scanner';
import EventScanner from './pages/EventScanner';
import AdminDashboard from './pages/admin/Dashboard';
import PromoCodeManager from './pages/admin/PromoCodeManager';
import OrderSuccess from './pages/OrderSuccess';
import GatekeeperLogin from './pages/GatekeeperLogin';
import LiveBigScreen from './pages/LiveBigScreen';

function App() {
    const { isAuthenticated, token, user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    // Fetch user data on app load ONLY if token exists but user data is completely missing
    // Don't fetch if we already have user data (e.g., from login or localStorage)
    useEffect(() => {
        if (token && !user) {
            dispatch(fetchCurrentUser());
        }
    }, [token, dispatch]); // Remove 'user' from dependencies to prevent re-fetching

    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
                <Routes>
                    <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
                    <Route path="/signup" element={!isAuthenticated ? <Signup /> : <Navigate to="/" />} />
                    <Route path="/login/success" element={<LoginSuccess />} />

                    {/* Gatekeeper Magic Link Login - PUBLIC */}
                    <Route path="/gatekeeper/login" element={<GatekeeperLogin />} />

                    <Route path="/" element={<Home />} />
                    <Route path="/events/:id" element={<EventDetails />} />

                    {/* Big Screen Display - PUBLIC for projection */}
                    <Route path="/event/:id/live/big-screen" element={<LiveBigScreen role="MAIN" />} />
                    <Route path="/event/:id/live/big-screen/main" element={<LiveBigScreen role="MAIN" />} />
                    <Route path="/event/:id/live/big-screen/energy-left" element={<LiveBigScreen role="ENERGY_LEFT" />} />
                    <Route path="/event/:id/live/big-screen/energy-right" element={<LiveBigScreen role="ENERGY_RIGHT" />} />

                    {/* Event Scanner - Accessible by Gatekeeper or Organizer */}
                    <Route path="/scanner/:eventId" element={<EventScanner />} />

                    {/* Customer Routes - Admin can also access */}
                    <Route element={<ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']} />}>
                        <Route path="/my-tickets" element={<MyTickets />} />
                        <Route path="/order-success" element={<OrderSuccess />} />
                    </Route>

                    {/* Organizer Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']} />}>
                        <Route path="/dashboard/organizer" element={<OrganizerDashboard />} />
                        <Route path="/dashboard/organizer/create-event" element={<CreateEvent />} />
                        <Route path="/dashboard/organizer/events/:id" element={<ManageEvent />} />
                        <Route path="/dashboard/organizer/promos" element={<PromoCodeManager />} />
                        <Route path="/dashboard/organizer/scanner" element={<Scanner />} />
                    </Route>

                    {/* Admin Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                        <Route path="/dashboard/admin" element={<AdminDashboard />} />
                        <Route path="/dashboard/admin/promos" element={<PromoCodeManager />} />
                    </Route>
                </Routes>
            </div>
        </Router>
    );
}

export default App;