import React from 'react';

const StaffManagement = ({
    gatekeeperEmail,
    setGatekeeperEmail,
    gatekeepers,
    isGeneratingLink,
    generatedLink,
    linkCopied,
    handleGenerateGatekeeperLink,
    handleCopyLink,
    onOpenScanner
}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                        🚪 Door Staff
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Generate one-time access links for gatekeepers to use the ticket scanner
                    </p>
                </div>
                <button
                    onClick={onOpenScanner}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-sm font-medium"
                >
                    Open Scanner
                </button>
            </div>

            {/* Generate Link Form */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
                <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase">Add Door Staff</h3>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <input
                            type="email"
                            placeholder="Enter staff email (e.g., door@venue.com)"
                            className="w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            value={gatekeeperEmail}
                            onChange={(e) => setGatekeeperEmail(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleGenerateGatekeeperLink}
                        disabled={isGeneratingLink || !gatekeeperEmail}
                        className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                        {isGeneratingLink ? 'Generating...' : '✨ Generate Magic Link'}
                    </button>
                </div>

                {/* Generated Link Display */}
                {generatedLink && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-700 font-medium mb-2">✓ Magic Link Generated!</p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                readOnly
                                value={generatedLink}
                                className="flex-1 p-2 bg-white border rounded font-mono text-xs text-gray-600"
                            />
                            <button
                                onClick={handleCopyLink}
                                className={`px-4 py-2 rounded font-medium text-sm transition ${linkCopied
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                {linkCopied ? '✓ Copied!' : 'Copy'}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            This link can only be used once and expires 48 hours after the event ends.
                        </p>
                    </div>
                )}
            </div>

            {/* All Gatekeepers List */}
            <div>
                <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase">All Staff Access</h3>
                {gatekeepers.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        No gatekeeper links generated yet. Generate one above.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b text-sm text-gray-500 bg-gray-50">
                                    <th className="p-3">Email</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Created</th>
                                    <th className="p-3">Expires</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {gatekeepers.map((gk, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="p-3 font-medium">{gk.email}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${gk.status === 'ACTIVE'
                                                ? 'bg-green-100 text-green-700'
                                                : gk.status === 'USED'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                {gk.status === 'ACTIVE' && '🟢 '}
                                                {gk.status === 'USED' && '✓ '}
                                                {gk.status === 'EXPIRED' && '⏰ '}
                                                {gk.status}
                                            </span>
                                        </td>
                                        <td className="p-3 text-sm text-gray-500">
                                            {new Date(gk.createdAt).toLocaleString()}
                                        </td>
                                        <td className="p-3 text-sm text-gray-500">
                                            {new Date(gk.expiresAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffManagement;
