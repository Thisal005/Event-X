import React from 'react';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';

const EventOverview = ({ event, stats, salesData, ticketSalesData }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pending Approval Notice */}
            {event?.approvalStatus !== 'APPROVED' && (
                <div className={`col-span-1 md:col-span-3 p-4 rounded-xl border ${event?.approvalStatus === 'REJECTED'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-orange-50 border-orange-200'
                    }`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${event?.approvalStatus === 'REJECTED'
                            ? 'bg-red-100'
                            : 'bg-orange-100'
                            }`}>
                            <AlertTriangle className={`w-5 h-5 ${event?.approvalStatus === 'REJECTED'
                                ? 'text-red-600'
                                : 'text-orange-600'
                                }`} />
                        </div>
                        <div>
                            <h4 className={`font-bold ${event?.approvalStatus === 'REJECTED'
                                ? 'text-red-800'
                                : 'text-orange-800'
                                }`}>
                                {event?.approvalStatus === 'REJECTED'
                                    ? 'Event Rejected'
                                    : 'Pending Admin Approval'}
                            </h4>
                            <p className={`text-sm ${event?.approvalStatus === 'REJECTED'
                                ? 'text-red-700'
                                : 'text-orange-700'
                                }`}>
                                {event?.approvalStatus === 'REJECTED'
                                    ? 'Your event was rejected by an administrator. Please contact support for more details.'
                                    : 'Your event is awaiting admin approval. It will not be visible to the public until approved.'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
            {/* Quick Stats */}
            <div className="col-span-1 md:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Total Sales</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">
                        ${stats?.totalRevenue ? stats.totalRevenue.toLocaleString() : '0.00'}
                    </h3>
                    <span className="text-xs text-green-500 flex items-center mt-2">
                        <TrendingUp className="w-3 h-3 mr-1" /> Revenue
                    </span>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Tickets Sold</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">
                        {stats?.totalTicketsSold || '0'}
                    </h3>
                    <span className="text-xs text-purple-500 mt-2 block">
                        {stats?.totalTickets ? Math.round((stats.totalTicketsSold / stats.totalTickets) * 100) : 0}% of capacity
                    </span>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Available Tickets</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">
                        {stats ? (stats.totalTickets - stats.totalTicketsSold) : '0'}
                    </h3>
                    <span className="text-xs text-gray-400 mt-2 block">Left to sell</span>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Total Capacity</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">
                        {stats?.totalTickets || '0'}
                    </h3>
                    <span className="text-xs text-gray-400 mt-2 block">Seats</span>
                </div>
            </div>

            {/* Recent Sales Chart Preview */}
            <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Sales Overview</h3>
                <div className="h-64">
                    {salesData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesData}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip
                                    labelFormatter={(label, payload) => payload[0]?.payload.fullDate || label}
                                    formatter={(value) => [`$${value}`, 'Revenue']}
                                />
                                <Area type="monotone" dataKey="sales" stroke="#8884d8" fillOpacity={1} fill="url(#colorSales)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400">
                            No sales data yet
                        </div>
                    )}
                </div>
            </div>

            {/* Ticket Distribution */}
            <div className="col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Ticket Sales</h3>
                <div className="h-64">
                    {ticketSalesData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ticketSalesData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" fontSize={12} />
                                <Tooltip />
                                <Bar dataKey="sold" fill="#82ca9d" radius={[4, 4, 0, 0]} name="Sold" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400">
                            No ticket types
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventOverview;
