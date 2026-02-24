import React from 'react';
import EventCommunicationSettings from '../../../../components/EventCommunicationSettings';

const EventMessages = ({
    formData,
    handleInputChange, // Not directly used in this snippet but commonly passed
    handleSave,
    setFormData
}) => {
    // Note: handleInputChange isn't used for the inner component here, but might be needed if there were other inputs.
    // The EventCommunicationSettings component uses an onChange callback.

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Automated Event Messages</h2>
            <p className="text-sm text-gray-500 mb-8">
                Setup automated emails to be sent to your attendees at specific times before the event.
            </p>

            <EventCommunicationSettings
                communication={formData.communication}
                eventDetails={formData}
                onChange={(newComm) => setFormData(prev => ({ ...prev, communication: newComm }))}
            />

            <div className="mt-8 flex justify-end">
                <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none transition-colors"
                >
                    Save Communication Settings
                </button>
            </div>
        </div>
    );
};

export default EventMessages;
