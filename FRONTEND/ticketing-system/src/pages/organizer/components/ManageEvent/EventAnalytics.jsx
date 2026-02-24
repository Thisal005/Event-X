import React from 'react';
import SalesVelocityChart from '../../../../components/SalesVelocityChart';
import SmartInsightsPanel from '../../../../components/SmartInsightsPanel';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';

const EventAnalytics = ({ stats, ticketSalesData }) => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                    <SalesVelocityChart stats={stats} />
                </div>
                <div className="md:w-1/3">
                    <SmartInsightsPanel stats={stats} />
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6">
                <h3 className="font-bold text-gray-900 mb-6">Ticket Sales by Type</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={ticketSalesData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={100} />
                            <Tooltip />
                            <Bar dataKey="sold" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Sold" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default EventAnalytics;
