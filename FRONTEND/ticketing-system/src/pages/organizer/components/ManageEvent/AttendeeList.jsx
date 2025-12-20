import React from 'react';
import { Users } from 'lucide-react';

const AttendeeList = ({ attendees, fetchAttendees }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <Users className="w-5 h-5 mr-2" /> Attendee List
                </h2>
                <div className="flex items-center gap-4">
                    <div className="bg-purple-50 px-4 py-2 rounded-lg border border-purple-100">
                        <span className="text-sm text-gray-500 mr-2">Total Attendance:</span>
                        <span className="text-lg font-bold text-purple-700">
                            {attendees.filter(a => a.status === 'USED').length}
                        </span>
                    </div>
                    <button onClick={fetchAttendees} className="text-sm text-purple-600 hover:text-purple-800 font-medium">
                        Refresh
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b text-sm text-gray-500 bg-gray-50">
                            <th className="p-3">Ticket ID</th>
                            <th className="p-3">Attendee Name</th>
                            <th className="p-3">Ticket Type</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Check-In Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {attendees.length === 0 ? (
                            <tr><td colSpan="5" className="p-4 text-center text-gray-500">No attendees found.</td></tr>
                        ) : (
                            attendees.map(ticket => (
                                <tr key={ticket.id} className="hover:bg-gray-50">
                                    <td className="p-3 font-mono text-sm">#{ticket.id}</td>
                                    <td className="p-3 font-medium text-gray-900">{ticket.ticketName}</td>
                                    <td className="p-3 text-sm text-gray-500">
                                        Standard
                                    </td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${ticket.status === 'USED'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {ticket.status === 'USED' ? 'CHECKED IN' : 'VALID'}
                                        </span>
                                    </td>
                                    <td className="p-3 text-sm text-gray-500">
                                        {ticket.checkInTime ? new Date(ticket.checkInTime).toLocaleString() : '-'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AttendeeList;
