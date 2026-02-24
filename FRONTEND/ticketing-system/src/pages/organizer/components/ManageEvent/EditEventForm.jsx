import React, { useState } from 'react';
import { AlertTriangle, Clock, Trash2 } from 'lucide-react';

const EditEventForm = ({
    formData,
    handleInputChange,
    handleSave,
    event,
    onDelete,
    onCancel,
    onPostpone,
    isCancelling,
    isPostponing
}) => {
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showPostponeModal, setShowPostponeModal] = useState(false);
    const [postponeData, setPostponeData] = useState({ newDate: '', refundAll: false });

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Event Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 space-y-4 md:space-y-0">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            name="description"
                            rows="4"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                            <option value="Music">Music</option>
                            <option value="Business">Business</option>
                            <option value="Tech">Tech</option>
                            <option value="Arts">Arts</option>
                        </select>
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                        <input
                            type="datetime-local"
                            name="date"
                            value={formData.date}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                        <input
                            type="text"
                            name="venue"
                            value={formData.venue}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image</label>
                        <input
                            type="file"
                            name="bannerImage"
                            accept="image/*"
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
                <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none transition-colors"
                >
                    Save Changes
                </button>
            </div>

            {/* Danger Zone */}
            <div className="mt-12 border-t border-red-200 pt-8">
                <h3 className="text-lg font-bold text-red-600 mb-4 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Danger Zone
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                    These actions are irreversible. Cancelling or postponing will notify all ticket holders automatically.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Postpone Event */}
                    <div className="border border-orange-200 rounded-lg p-4 bg-orange-50/50">
                        <h4 className="font-bold text-orange-700 mb-2 flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            Postpone Event
                        </h4>
                        <p className="text-sm text-gray-600 mb-4">
                            Reschedule to a new date. Choose to refund all tickets or keep them valid.
                        </p>
                        <button
                            onClick={() => setShowPostponeModal(true)}
                            disabled={event?.status === 'CANCELLED' || event?.status === 'POSTPONED'}
                            className="w-full px-4 py-2 border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-100 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Postpone Event
                        </button>
                    </div>

                    {/* Cancel Event */}
                    <div className="border border-red-200 rounded-lg p-4 bg-red-50/50">
                        <h4 className="font-bold text-red-700 mb-2 flex items-center">
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Cancel Event
                        </h4>
                        <p className="text-sm text-gray-600 mb-4">
                            Cancel and automatically refund all ticket holders instantly.
                        </p>
                        <button
                            onClick={() => setShowCancelModal(true)}
                            disabled={event?.status === 'CANCELLED'}
                            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {event?.status === 'CANCELLED' ? 'Already Cancelled' : 'Cancel & Refund All'}
                        </button>
                    </div>

                    {/* Delete Event */}
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                        <h4 className="font-bold text-gray-700 mb-2 flex items-center">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Event
                        </h4>
                        <p className="text-sm text-gray-600 mb-4">
                            Permanently remove this event from your dashboard.
                        </p>
                        <button
                            onClick={onDelete}
                            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 focus:outline-none transition-colors"
                        >
                            Delete Event
                        </button>
                    </div>
                </div>
            </div>

            {/* Cancel Event Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                        <div className="bg-red-600 px-6 py-4">
                            <h3 className="text-xl font-bold text-white flex items-center">
                                <AlertTriangle className="w-6 h-6 mr-2" />
                                Cancel Event & Refund All
                            </h3>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-700 mb-4">
                                Are you sure you want to cancel <strong>{event?.name}</strong>?
                            </p>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                <h4 className="font-bold text-red-800 mb-2">This will immediately:</h4>
                                <ul className="text-sm text-red-700 space-y-1">
                                    <li>• Mark the event as CANCELLED</li>
                                    <li>• Refund 100% of ticket price to all buyers</li>
                                    <li>• Send cancellation emails to all attendees</li>
                                    <li>• Update all tickets to REFUNDED status</li>
                                </ul>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowCancelModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    disabled={isCancelling}
                                >
                                    Go Back
                                </button>
                                <button
                                    onClick={() => {
                                        onCancel();
                                        setShowCancelModal(false);
                                    }}
                                    disabled={isCancelling}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
                                >
                                    {isCancelling ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        'Yes, Cancel & Refund'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Postpone Event Modal */}
            {showPostponeModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                        <div className="bg-orange-500 px-6 py-4">
                            <h3 className="text-xl font-bold text-white flex items-center">
                                <Clock className="w-6 h-6 mr-2" />
                                Postpone Event
                            </h3>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-700 mb-4">
                                Postpone <strong>{event?.name}</strong> to a new date.
                            </p>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        New Date & Time (optional)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={postponeData.newDate}
                                        onChange={(e) => setPostponeData({ ...postponeData, newDate: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Leave empty if new date is TBD</p>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={postponeData.refundAll}
                                            onChange={(e) => setPostponeData({ ...postponeData, refundAll: e.target.checked })}
                                            className="mt-1 w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                                        />
                                        <div>
                                            <span className="font-medium text-gray-900">Refund all tickets</span>
                                            <p className="text-sm text-gray-500">
                                                If unchecked, tickets remain valid for the new date. Buyers will be notified either way.
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowPostponeModal(false);
                                        setPostponeData({ newDate: '', refundAll: false });
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    disabled={isPostponing}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        onPostpone(postponeData);
                                        setShowPostponeModal(false);
                                    }}
                                    disabled={isPostponing}
                                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center"
                                >
                                    {isPostponing ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        postponeData.refundAll ? 'Postpone & Refund' : 'Postpone Event'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditEventForm;
