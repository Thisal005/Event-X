import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import TicketTemplate from '../../../../components/TicketTemplate';

const TicketManagement = ({
    formData,
    addTicketType,
    removeTicketType,
    handleTicketChange,
    handleSave,
    eventId
}) => {
    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Ticket Management</h2>
                    <button
                        onClick={addTicketType}
                        className="flex items-center px-4 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-bold hover:bg-purple-100 transition-colors"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Ticket Type
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Quantity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sold</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {formData.ticketTypes.map((ticket, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="text"
                                            value={ticket.name}
                                            onChange={(e) => handleTicketChange(index, 'name', e.target.value)}
                                            className="block w-full border-0 border-b-2 border-transparent focus:border-purple-500 focus:ring-0 bg-transparent text-sm"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <span className="text-gray-500 mr-2">$</span>
                                            <input
                                                type="number"
                                                value={ticket.price}
                                                onChange={(e) => handleTicketChange(index, 'price', e.target.value)}
                                                className="block w-24 border-0 border-b-2 border-transparent focus:border-purple-500 focus:ring-0 bg-transparent text-sm"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="number"
                                            value={ticket.quantity}
                                            onChange={(e) => handleTicketChange(index, 'quantity', e.target.value)}
                                            className="block w-24 border-0 border-b-2 border-transparent focus:border-purple-500 focus:ring-0 bg-transparent text-sm"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {ticket.sold || 0}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => removeTicketType(index)}
                                            className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-6 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none transition-colors"
                    >
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Ticket Preview Section */}
            {formData.ticketTypes.length > 0 && (
                <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-hidden">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Ticket Preview</h3>
                    <p className="text-sm text-gray-500 mb-6">This is how the ticket will look to customers.</p>
                    <div className="flex flex-col gap-6">
                        {formData.ticketTypes.map((ticket, idx) => (
                            <div key={idx} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                                <h4 className="font-bold text-sm text-gray-500 mb-2 uppercase">{ticket.name || 'New Ticket'}</h4>
                                <div className="w-full overflow-x-auto">
                                    <div className="min-w-fit transform origin-top-left">
                                        <TicketTemplate
                                            event={{ ...formData, id: eventId }}
                                            ticket={ticket}
                                            type="preview"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};

export default TicketManagement;
