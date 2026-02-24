import React, { useState } from 'react';
import { Check, X, Image, Loader2, Camera, CheckCheck, XCircle, Trash2, RefreshCw, Sparkles, User } from 'lucide-react';

const PhotosTab = ({
    pendingPhotos,
    pendingCount,
    isLoading,
    onApprove,
    onReject,
    onApproveAll,
    onRejectAll,
    onClearAll,
    onRefresh,
    isAutoRefreshEnabled = true
}) => {
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [processingIds, setProcessingIds] = useState(new Set());
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);

    // Handle individual photo approval with loading state
    const handleApprove = async (photoId) => {
        setProcessingIds(prev => new Set([...prev, photoId]));
        try {
            await onApprove(photoId);
        } finally {
            setProcessingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(photoId);
                return newSet;
            });
        }
    };

    // Handle individual photo rejection with loading state
    const handleReject = async (photoId) => {
        setProcessingIds(prev => new Set([...prev, photoId]));
        try {
            await onReject(photoId);
        } finally {
            setProcessingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(photoId);
                return newSet;
            });
        }
    };

    // Handle approve all with confirmation
    const handleApproveAll = async () => {
        if (!window.confirm(`Are you sure you want to approve all ${pendingPhotos.length} photos?`)) return;
        setIsBulkProcessing(true);
        try {
            await onApproveAll();
        } finally {
            setIsBulkProcessing(false);
        }
    };

    // Handle reject all with confirmation
    const handleRejectAll = async () => {
        if (!window.confirm(`Are you sure you want to reject all ${pendingPhotos.length} photos? This cannot be undone.`)) return;
        setIsBulkProcessing(true);
        try {
            await onRejectAll();
        } finally {
            setIsBulkProcessing(false);
        }
    };

    // Photo preview modal
    const PhotoPreviewModal = () => {
        if (!selectedPhoto) return null;
        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                onClick={() => setSelectedPhoto(null)}
            >
                <div className="relative max-w-4xl max-h-[90vh] p-2" onClick={e => e.stopPropagation()}>
                    <img
                        src={selectedPhoto.imageUrl}
                        alt="Preview"
                        className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
                    />
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                        <button
                            onClick={() => { handleApprove(selectedPhoto.id); setSelectedPhoto(null); }}
                            className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                        >
                            <Check className="w-5 h-5" />
                            Approve
                        </button>
                        <button
                            onClick={() => { handleReject(selectedPhoto.id); setSelectedPhoto(null); }}
                            className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                        >
                            <X className="w-5 h-5" />
                            Reject
                        </button>
                    </div>
                    <button
                        onClick={() => setSelectedPhoto(null)}
                        className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1.5 rounded-lg">
                        <p className="text-white text-sm flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {selectedPhoto.userName}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Photo Preview Modal */}
            <PhotoPreviewModal />

            {/* Header with Live Preview Indicator */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Camera className="w-6 h-6 text-purple-500" />
                        Photo Moderation
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Review and approve attendee photos for the live photo wall
                    </p>
                </div>

                {/* Live Status Indicator */}
                <div className="flex items-center gap-3">
                    {isAutoRefreshEnabled && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                            </span>
                            <span className="text-xs font-medium text-green-700">Live Updates</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-full">
                        <span className="text-xs font-bold text-purple-700">{pendingCount}</span>
                        <span className="text-xs text-purple-600">Pending</span>
                    </div>
                </div>
            </div>

            {/* Action Buttons Card */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    {/* Left side - Bulk Actions */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={handleApproveAll}
                            disabled={pendingPhotos.length === 0 || isBulkProcessing}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium text-sm transition-all hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {isBulkProcessing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <CheckCheck className="w-4 h-4" />
                            )}
                            Approve All
                        </button>
                        <button
                            onClick={handleRejectAll}
                            disabled={pendingPhotos.length === 0 || isBulkProcessing}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-medium text-sm transition-all hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {isBulkProcessing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <XCircle className="w-4 h-4" />
                            )}
                            Reject All
                        </button>
                    </div>

                    {/* Right side - Utility Actions */}
                    <div className="flex gap-2">
                        <button
                            onClick={onRefresh}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium text-sm transition-all"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <button
                            onClick={onClearAll}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-red-100 text-gray-700 hover:text-red-700 rounded-xl font-medium text-sm transition-all"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear Approved
                        </button>
                    </div>
                </div>
            </div>

            {/* Photos Grid */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    Pending Photos
                    {pendingPhotos.length > 0 && (
                        <span className="ml-auto text-xs font-normal text-gray-400">
                            Click to preview • Hover for quick actions
                        </span>
                    )}
                </h4>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-purple-200 rounded-full"></div>
                            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
                        </div>
                        <p className="mt-4 text-gray-500 text-sm">Loading photos...</p>
                    </div>
                ) : pendingPhotos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-4">
                            <Image className="w-10 h-10 text-purple-400" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-700 mb-1">No Photos Pending</h4>
                        <p className="text-sm text-gray-500 max-w-sm">
                            When attendees upload photos, they'll appear here for your review.
                            Approved photos will show on the live photo wall.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {pendingPhotos.map(photo => {
                            const isProcessing = processingIds.has(photo.id);
                            return (
                                <div
                                    key={photo.id}
                                    className="relative group cursor-pointer"
                                    onClick={() => !isProcessing && setSelectedPhoto(photo)}
                                >
                                    {/* Photo Image */}
                                    <div className="aspect-square overflow-hidden rounded-xl border-2 border-gray-100 group-hover:border-purple-300 transition-all shadow-sm group-hover:shadow-md">
                                        <img
                                            src={photo.imageUrl}
                                            alt="Pending"
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    </div>

                                    {/* Processing Overlay */}
                                    {isProcessing && (
                                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                            <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                                        </div>
                                    )}

                                    {/* Hover Overlay with Actions */}
                                    {!isProcessing && (
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl flex flex-col items-center justify-center gap-3">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleApprove(photo.id); }}
                                                    className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-all hover:scale-110 shadow-lg"
                                                    title="Approve"
                                                >
                                                    <Check className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleReject(photo.id); }}
                                                    className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all hover:scale-110 shadow-lg"
                                                    title="Reject"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                            <span className="text-white text-xs font-medium bg-black/40 px-2 py-1 rounded-full">
                                                Click to preview
                                            </span>
                                        </div>
                                    )}

                                    {/* User Badge */}
                                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent rounded-b-xl">
                                        <p className="text-white text-xs font-medium truncate flex items-center gap-1.5">
                                            <User className="w-3 h-3" />
                                            {photo.userName}
                                        </p>
                                    </div>

                                    {/* New Photo Indicator */}
                                    <div className="absolute top-2 right-2">
                                        <span className="relative flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500 border-2 border-white"></span>
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Stats Footer */}
            {pendingPhotos.length > 0 && (
                <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span>Approve = Shows on wall</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span>Reject = Delete forever</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PhotosTab;
