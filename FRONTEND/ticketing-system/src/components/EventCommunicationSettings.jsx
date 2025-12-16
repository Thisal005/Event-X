import React, { useState, useEffect } from 'react';
import { Mail, Clock, Calendar, Check, X, Eye } from 'lucide-react';

const EventCommunicationSettings = ({ communication, onChange, eventDetails }) => {
    // Local state to manage the form, synced with parent via onChange
    const [settings, setSettings] = useState({
        reminder7dEnabled: false,
        reminder7dSubject: "Your event is in one week!",
        reminder7dBody: "Hi {{name}},\n\nJust a friendly reminder that {{event_name}} is coming up in 7 days at {{venue}}.\n\nWe can't wait to see you there!\n\nBest,\nThe Team",

        reminder48hEnabled: true,
        reminder48hSubject: "48 hours to go! Don't forget your ticket.",
        reminder48hBody: "Hi {{name}},\n\nOnly 2 days left until {{event_name}}!\n\nMake sure you have your tickets ready. Doors open at {{event_date}}.\n\nSee you soon!",

        reminder2hEnabled: true,
        reminder2hSubject: "Doors open in 2 hours!",
        reminder2hBody: "Hi {{name}},\n\nIt's almost time! {{event_name}} starts in just 2 hours.\n\nDon't forget to bring your ID and tickets.\n\nSafe travels!"
    });

    const [previewMode, setPreviewMode] = useState(null); // '7d', '48h', '2h' or null

    useEffect(() => {
        if (communication) {
            setSettings(prev => ({ ...prev, ...communication }));
        }
    }, [communication]);

    const handleChange = (field, value) => {
        const newSettings = { ...settings, [field]: value };
        setSettings(newSettings);
        onChange(newSettings);
    };

    const getPreviewContent = (type) => {
        let subject = "";
        let body = "";
        if (type === '7d') {
            subject = settings.reminder7dSubject;
            body = settings.reminder7dBody;
        } else if (type === '48h') {
            subject = settings.reminder48hSubject;
            body = settings.reminder48hBody;
        } else if (type === '2h') {
            subject = settings.reminder2hSubject;
            body = settings.reminder2hBody;
        }

        // Mock replacements
        const mockName = "John Doe";
        const mockEvent = eventDetails?.name || "Summer Music Festival";
        const mockVenue = eventDetails?.venue || "Grand Arena";
        const mockDate = eventDetails?.date ? new Date(eventDetails.date).toLocaleString() : "tomorrow at 8:00 PM";

        body = body.replace(/{{name}}/g, mockName);
        body = body.replace(/{{event_name}}/g, mockEvent);
        body = body.replace(/{{venue}}/g, mockVenue);
        body = body.replace(/{{event_date}}/g, mockDate);

        return { subject, body };
    };

    const PreviewModal = () => {
        if (!previewMode) return null;
        const { subject, body } = getPreviewContent(previewMode);

        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl overflow-hidden">
                    <div className="bg-gray-50 border-b p-4 flex justify-between items-center">
                        <h3 className="font-bold text-gray-700">Email Preview</h3>
                        <button onClick={() => setPreviewMode(null)} className="text-gray-400 hover:text-gray-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="p-6">
                        <div className="mb-4 border-b pb-4">
                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Subject</p>
                            <p className="text-gray-900 font-medium">{subject}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold mb-2">Body</p>
                            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 whitespace-pre-wrap font-sans">
                                {body}
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 p-4 text-right">
                        <button
                            onClick={() => setPreviewMode(null)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
                        >
                            Close Preview
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <PreviewModal />

            <div className="flex items-center gap-2 mb-6 text-gray-700">
                <Mail className="w-5 h-5" />
                <p>Configure automated emails sent to attendees before the event.</p>
            </div>

            {/* 7 Days Before */}
            <div className={`border rounded-xl p-6 transition-all ${settings.reminder7dEnabled ? 'bg-white border-purple-200 shadow-sm' : 'bg-gray-50 border-gray-200 opacity-75'}`}>
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">7 Days Before</h3>
                            <p className="text-xs text-gray-500">Weekly reminder</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setPreviewMode('7d')}
                            className="text-sm text-purple-600 hover:underline flex items-center"
                            disabled={!settings.reminder7dEnabled}
                        >
                            <Eye className="w-4 h-4 mr-1" /> Preview
                        </button>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={settings.reminder7dEnabled}
                                onChange={(e) => handleChange('reminder7dEnabled', e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                    </div>
                </div>

                {settings.reminder7dEnabled && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
                            <input
                                type="text"
                                value={settings.reminder7dSubject}
                                onChange={(e) => handleChange('reminder7dSubject', e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Message Body</label>
                            <textarea
                                value={settings.reminder7dBody}
                                onChange={(e) => handleChange('reminder7dBody', e.target.value)}
                                rows="4"
                                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none font-mono"
                            />
                            <p className="text-xs text-gray-500 mt-1">Available variables: {'{{name}}, {{event_name}}, {{event_date}}, {{venue}}'}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* 48 Hours Before */}
            <div className={`border rounded-xl p-6 transition-all ${settings.reminder48hEnabled ? 'bg-white border-purple-200 shadow-sm' : 'bg-gray-50 border-gray-200 opacity-75'}`}>
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">48 Hours Before</h3>
                            <p className="text-xs text-gray-500">Hype builder</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setPreviewMode('48h')}
                            className="text-sm text-purple-600 hover:underline flex items-center"
                            disabled={!settings.reminder48hEnabled}
                        >
                            <Eye className="w-4 h-4 mr-1" /> Preview
                        </button>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={settings.reminder48hEnabled}
                                onChange={(e) => handleChange('reminder48hEnabled', e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                    </div>
                </div>

                {settings.reminder48hEnabled && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
                            <input
                                type="text"
                                value={settings.reminder48hSubject}
                                onChange={(e) => handleChange('reminder48hSubject', e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Message Body</label>
                            <textarea
                                value={settings.reminder48hBody}
                                onChange={(e) => handleChange('reminder48hBody', e.target.value)}
                                rows="4"
                                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none font-mono"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* 2 Hours Before */}
            <div className={`border rounded-xl p-6 transition-all ${settings.reminder2hEnabled ? 'bg-white border-purple-200 shadow-sm ring-1 ring-purple-100' : 'bg-gray-50 border-gray-200 opacity-75'}`}>
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-red-100 p-2 rounded-lg text-red-600">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">2 Hours Before</h3>
                            <p className="text-xs text-gray-500">Crucial logistics info</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setPreviewMode('2h')}
                            className="text-sm text-purple-600 hover:underline flex items-center"
                            disabled={!settings.reminder2hEnabled}
                        >
                            <Eye className="w-4 h-4 mr-1" /> Preview
                        </button>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={settings.reminder2hEnabled}
                                onChange={(e) => handleChange('reminder2hEnabled', e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                    </div>
                </div>

                {settings.reminder2hEnabled && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="bg-purple-50 text-purple-700 p-3 rounded-lg text-sm flex items-start gap-2">
                            <Check className="w-4 h-4 mt-0.5" />
                            <p>This is the most important message! Include parking details, gate info, and what to bring.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
                            <input
                                type="text"
                                value={settings.reminder2hSubject}
                                onChange={(e) => handleChange('reminder2hSubject', e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Message Body</label>
                            <textarea
                                value={settings.reminder2hBody}
                                onChange={(e) => handleChange('reminder2hBody', e.target.value)}
                                rows="4"
                                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none font-mono"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventCommunicationSettings;
