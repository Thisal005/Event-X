import api from './axios';

// Get live data for an event
export const getLiveData = async (eventId) => {
    const response = await api.get(`/events/${eventId}/live`);
    return response.data;
};

// Check if event is in live mode
export const getLiveStatus = async (eventId) => {
    const response = await api.get(`/events/${eventId}/live/status`);
    return response.data;
};

// Initialize live data (organizer only)
export const initializeLiveData = async (eventId) => {
    const response = await api.post(`/events/${eventId}/live/init`);
    return response.data;
};

// Update "What's Happening Now" message
export const updateLiveMessage = async (eventId, message) => {
    const response = await api.put(`/events/${eventId}/live/message`, { message });
    return response.data;
};

// Update Screen Layout Mode
export const updateLayoutMode = async (eventId, mode) => {
    const response = await api.put(`/events/${eventId}/live/layout`, { mode });
    return response.data;
};

// Update Big Screen Background
export const updateBackground = async (eventId, background, target = 'MAIN') => {
    const payload = { ...background, target };
    const response = await api.put(`/events/${eventId}/live/background`, payload);
    return response.data;
};

// Upload Background Video
export const uploadBackgroundVideo = async (eventId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    // Let axios handle Content-Type
    const response = await api.post(`/events/${eventId}/live/background/upload`, formData);
    return response.data;
};

// Schedule Management
export const addScheduleItem = async (eventId, item) => {
    const response = await api.post(`/events/${eventId}/live/schedule`, item);
    return response.data;
};

export const updateScheduleItem = async (eventId, itemId, item) => {
    const response = await api.put(`/events/${eventId}/live/schedule/${itemId}`, item);
    return response.data;
};

export const deleteScheduleItem = async (eventId, itemId) => {
    const response = await api.delete(`/events/${eventId}/live/schedule/${itemId}`);
    return response.data;
};

// Lost & Found Management
export const addLostAndFoundPost = async (eventId, post) => {
    const response = await api.post(`/events/${eventId}/live/lost-found`, post);
    return response.data;
};

export const deleteLostAndFoundPost = async (eventId, postId) => {
    const response = await api.delete(`/events/${eventId}/live/lost-found/${postId}`);
    return response.data;
};

// Poll Management
export const createPoll = async (eventId, question, options) => {
    const response = await api.post(`/events/${eventId}/live/poll`, { question, options });
    return response.data;
};

export const votePoll = async (eventId, option) => {
    const response = await api.post(`/events/${eventId}/live/poll/vote`, { option });
    return response.data;
};

export const closePoll = async (eventId) => {
    const response = await api.post(`/events/${eventId}/live/poll/close`);
    return response.data;
};

export const clearPoll = async (eventId) => {
    const response = await api.delete(`/events/${eventId}/live/poll`);
    return response.data;
};

// Live Mode Control
export const startLive = async (eventId) => {
    const response = await api.post(`/events/${eventId}/live/start`);
    return response.data;
};

export const endLive = async (eventId) => {
    const response = await api.post(`/events/${eventId}/live/end`);
    return response.data;
};

// Digital Light Show
export const triggerLightSync = async (eventId, options = {}) => {
    const { color, type = 'SOLID', duration = 10000, speed = 50, intensity = 100 } = options;
    const response = await api.post(`/events/${eventId}/live/light-sync`, {
        color,
        type,
        duration,
        speed,
        intensity
    });
    return response.data;
};

export const stopLightSync = async (eventId) => {
    const response = await api.post(`/events/${eventId}/live/light-sync/stop`);
    return response.data;
};

// Hype Gauge (Clap-O-Meter)
export const sendHype = async (eventId, count) => {
    const response = await api.post(`/events/${eventId}/live/hype`, { count });
    return response.data;
};

export const getHypeLevel = async (eventId) => {
    const response = await api.get(`/events/${eventId}/live/hype`);
    return response.data;
};

// ==================== PHOTO WALL (SOCIAL PROOF) ====================

// Upload a photo to the event's photo wall
export const uploadPhoto = async (eventId, file, userName = 'Attendee') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userName', userName);

    console.log('Uploading photo:', { eventId, fileName: file.name, fileSize: file.size, fileType: file.type });
    console.log('Token:', localStorage.getItem('token')?.substring(0, 50) + '...');

    // Don't set Content-Type manually - axios will auto-set it with proper boundary for FormData
    const response = await api.post(`/events/${eventId}/live/photos`, formData);
    return response.data;
};

// Get approved photos for public display
export const getApprovedPhotos = async (eventId) => {
    const response = await api.get(`/events/${eventId}/live/photos/approved`);
    return response.data;
};

// Get pending photos for moderation (organizer only)
export const getPendingPhotos = async (eventId) => {
    const response = await api.get(`/events/${eventId}/live/photos/pending`);
    return response.data;
};

// Approve a photo (organizer only)
export const approvePhoto = async (eventId, photoId) => {
    const response = await api.put(`/events/${eventId}/live/photos/${photoId}/approve`);
    return response.data;
};

// Reject a photo (organizer only)
export const rejectPhoto = async (eventId, photoId) => {
    const response = await api.put(`/events/${eventId}/live/photos/${photoId}/reject`);
    return response.data;
};

// Clear all approved photos (organizer only)
export const deleteAllApprovedPhotos = async (eventId) => {
    const response = await api.delete(`/events/${eventId}/live/photos/approved`);
    return response.data;
};

// Approve all pending photos (organizer only)
export const approveAllPhotos = async (eventId) => {
    const response = await api.put(`/events/${eventId}/live/photos/approve-all`);
    return response.data;
};

// Reject all pending photos (organizer only)
export const rejectAllPhotos = async (eventId) => {
    const response = await api.put(`/events/${eventId}/live/photos/reject-all`);
    return response.data;
};
