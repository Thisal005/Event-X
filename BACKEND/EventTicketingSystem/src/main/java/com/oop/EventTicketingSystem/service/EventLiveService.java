package com.oop.EventTicketingSystem.service;

import com.oop.EventTicketingSystem.model.*;
import com.oop.EventTicketingSystem.repository.EventLiveDataRepository;
import com.oop.EventTicketingSystem.repository.EventLivePhotoRepository;
import com.oop.EventTicketingSystem.repository.EventRepository;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class EventLiveService {

    @Autowired
    private EventLiveDataRepository liveDataRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private EventLivePhotoRepository photoRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private com.oop.EventTicketingSystem.repository.TicketRepository ticketRepository;

    private static final String LIVE_TOPIC = "/topic/event/%d/live";

    // In-memory hype levels for each event (eventId -> hypeLevel)
    private final ConcurrentHashMap<Long, AtomicInteger> hypeLevels = new ConcurrentHashMap<>();
    private static final double HYPE_DECAY_FACTOR = 0.7; // Decay by 30% each second
    private static final int MAX_HYPE_LEVEL = 1000; // Cap the maximum hype level

    // Get or create live data for an event
    @Transactional
    public EventLiveData getOrCreateLiveData(Long eventId) {
        Optional<EventLiveData> existing = liveDataRepository.findByEventId(eventId);
        if (existing.isPresent()) {
            return existing.get();
        }

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        EventLiveData liveData = new EventLiveData(event);
        return liveDataRepository.save(liveData);
    }

    // Get live data (read-only, for attendees)
    public EventLiveData getLiveData(Long eventId) {
        return liveDataRepository.findByEventId(eventId)
                .orElse(null);
    }

    // Update the "What's Happening Now" message
    @Transactional
    public EventLiveData updateLiveMessage(Long eventId, String message) {
        EventLiveData liveData = getOrCreateLiveData(eventId);
        liveData.setLiveMessage(message);
        liveData = liveDataRepository.save(liveData);
        broadcastUpdate(eventId, "MESSAGE_UPDATE", liveData);
        return liveData;
    }

    // Schedule Management
    @Transactional
    public EventLiveData addScheduleItem(Long eventId, LiveScheduleItem item) {
        EventLiveData liveData = getOrCreateLiveData(eventId);
        liveData.addScheduleItem(item);
        updateNextScheduleItem(liveData);
        liveData = liveDataRepository.save(liveData);
        broadcastUpdate(eventId, "SCHEDULE_UPDATE", liveData);
        return liveData;
    }

    @Transactional
    public EventLiveData updateScheduleItem(Long eventId, Long itemId, LiveScheduleItem updated) {
        EventLiveData liveData = getOrCreateLiveData(eventId);
        
        liveData.getSchedule().stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .ifPresent(item -> {
                    item.setTitle(updated.getTitle());
                    item.setStage(updated.getStage());
                    item.setStartTime(updated.getStartTime());
                    item.setEndTime(updated.getEndTime());
                    item.setSortOrder(updated.getSortOrder());
                });
        
        updateNextScheduleItem(liveData);
        liveData = liveDataRepository.save(liveData);
        broadcastUpdate(eventId, "SCHEDULE_UPDATE", liveData);
        return liveData;
    }

    @Transactional
    public EventLiveData removeScheduleItem(Long eventId, Long itemId) {
        EventLiveData liveData = getOrCreateLiveData(eventId);
        liveData.getSchedule().removeIf(item -> item.getId().equals(itemId));
        updateNextScheduleItem(liveData);
        liveData = liveDataRepository.save(liveData);
        broadcastUpdate(eventId, "SCHEDULE_UPDATE", liveData);
        return liveData;
    }

    private void updateNextScheduleItem(EventLiveData liveData) {
        LocalDateTime now = LocalDateTime.now();
        
        // Reset all to not next
        liveData.getSchedule().forEach(item -> item.setNext(false));
        
        // Find the next upcoming item
        liveData.getSchedule().stream()
                .filter(item -> item.getStartTime().isAfter(now))
                .min((a, b) -> a.getStartTime().compareTo(b.getStartTime()))
                .ifPresent(item -> item.setNext(true));
    }

    // Lost & Found Management
    @Transactional
    public EventLiveData addLostAndFoundPost(Long eventId, LostAndFoundPost post) {
        EventLiveData liveData = getOrCreateLiveData(eventId);
        post.setPostedAt(LocalDateTime.now());
        liveData.addLostAndFoundPost(post);
        liveData = liveDataRepository.save(liveData);
        broadcastUpdate(eventId, "LOST_FOUND_UPDATE", liveData);
        return liveData;
    }

    @Transactional
    public EventLiveData removeLostAndFoundPost(Long eventId, Long postId) {
        EventLiveData liveData = getOrCreateLiveData(eventId);
        liveData.getLostAndFound().removeIf(post -> post.getId().equals(postId));
        liveData = liveDataRepository.save(liveData);
        broadcastUpdate(eventId, "LOST_FOUND_UPDATE", liveData);
        return liveData;
    }

    // Flash Poll Management
    @Transactional
    public EventLiveData createPoll(Long eventId, String question, List<String> options) {
        if (options.size() > 5) {
            throw new IllegalArgumentException("Maximum 5 options allowed");
        }
        
        EventLiveData liveData = getOrCreateLiveData(eventId);
        
        // Close any existing poll
        if (liveData.getActivePoll() != null) {
            liveData.getActivePoll().setClosed(true);
        }
        
        FlashPoll poll = new FlashPoll(question, options);
        liveData.setActivePoll(poll);
        liveData = liveDataRepository.save(liveData);
        broadcastUpdate(eventId, "POLL_UPDATE", liveData);
        return liveData;
    }

    @Transactional
    public EventLiveData votePoll(Long eventId, String option) {
        EventLiveData liveData = getOrCreateLiveData(eventId);
        
        if (liveData.getActivePoll() == null) {
            throw new RuntimeException("No active poll");
        }
        
        if (liveData.getActivePoll().isClosed()) {
            throw new RuntimeException("Poll is closed");
        }
        
        liveData.getActivePoll().addVote(option);
        liveData = liveDataRepository.save(liveData);
        broadcastUpdate(eventId, "POLL_UPDATE", liveData);
        return liveData;
    }

    @Transactional
    public EventLiveData closePoll(Long eventId) {
        EventLiveData liveData = getOrCreateLiveData(eventId);
        
        if (liveData.getActivePoll() != null) {
            liveData.getActivePoll().setClosed(true);
            liveData = liveDataRepository.save(liveData);
            broadcastUpdate(eventId, "POLL_UPDATE", liveData);
        }
        
        return liveData;
    }

    @Transactional
    public EventLiveData clearPoll(Long eventId) {
        EventLiveData liveData = getOrCreateLiveData(eventId);
        liveData.setActivePoll(null);
        liveData = liveDataRepository.save(liveData);
        broadcastUpdate(eventId, "POLL_UPDATE", liveData);
        return liveData;
    }

    // Broadcast update to all connected clients
    private void broadcastUpdate(Long eventId, String updateType, EventLiveData liveData) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", updateType);
        payload.put("data", liveData);
        payload.put("timestamp", LocalDateTime.now().toString());
        
        String destination = String.format(LIVE_TOPIC, eventId);
        messagingTemplate.convertAndSend(destination, payload);
    }

    // Check if event is in live mode (organizer controlled)
    public boolean isEventLive(Long eventId) {
        EventLiveData liveData = liveDataRepository.findByEventId(eventId).orElse(null);
        return liveData != null && liveData.isLive();
    }

    // Start live mode
    @Transactional
    public EventLiveData startLive(Long eventId) {
        EventLiveData liveData = getOrCreateLiveData(eventId);
        liveData.setLive(true);
        liveData = liveDataRepository.save(liveData);
        broadcastUpdate(eventId, "LIVE_STATUS_UPDATE", liveData);
        return liveData;
    }

    // End live mode
    @Transactional
    public EventLiveData endLive(Long eventId) {
        EventLiveData liveData = getOrCreateLiveData(eventId);
        liveData.setLive(false);
        liveData = liveDataRepository.save(liveData);
        broadcastUpdate(eventId, "LIVE_STATUS_UPDATE", liveData);
        return liveData;
    }

    // Trigger light sync for Digital Light Show
    public void triggerLightSync(Long eventId, String color, String type, Integer duration, Integer speed, Integer intensity) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "LIGHT_SYNC");
        payload.put("color", color);
        payload.put("effect", type); // SOLID, PULSE, STROBE, WAVE, FADE
        payload.put("duration", duration != null ? duration : 10000); // default 10 seconds
        payload.put("speed", speed != null ? speed : 50); // 1-100, affects animation speed
        payload.put("intensity", intensity != null ? intensity : 100); // 1-100, affects brightness/opacity
        payload.put("timestamp", LocalDateTime.now().toString());
        
        String destination = String.format(LIVE_TOPIC, eventId);
        messagingTemplate.convertAndSend(destination, payload);
    }

    // Stop light sync
    public void stopLightSync(Long eventId) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "LIGHT_SYNC_STOP");
        payload.put("timestamp", LocalDateTime.now().toString());
        
        String destination = String.format(LIVE_TOPIC, eventId);
        messagingTemplate.convertAndSend(destination, payload);
    }

    // ==================== HYPE GAUGE (CLAP-O-METER) ====================

    /**
     * Add hype clicks from a user (batched).
     * Called when the frontend sends accumulated clicks.
     */
    public int addHype(Long eventId, int count) {
        AtomicInteger hypeCounter = hypeLevels.computeIfAbsent(eventId, k -> new AtomicInteger(0));
        int newValue = hypeCounter.addAndGet(count);
        
        // Cap at max level
        if (newValue > MAX_HYPE_LEVEL) {
            hypeCounter.set(MAX_HYPE_LEVEL);
            return MAX_HYPE_LEVEL;
        }
        
        return newValue;
    }

    /**
     * Get current hype level for an event.
     */
    public int getHypeLevel(Long eventId) {
        AtomicInteger hypeCounter = hypeLevels.get(eventId);
        return hypeCounter != null ? hypeCounter.get() : 0;
    }

    /**
     * Scheduled task to decay hype levels and broadcast updates.
     * Runs every 1 second.
     */
    @Scheduled(fixedRate = 1000)
    public void decayAndBroadcastHype() {
        hypeLevels.forEach((eventId, hypeCounter) -> {
            int currentHype = hypeCounter.get();
            
            if (currentHype > 0) {
                // Apply decay
                int newHype = (int) (currentHype * HYPE_DECAY_FACTOR);
                hypeCounter.set(newHype);
                
                // Broadcast to all clients
                broadcastHypeUpdate(eventId, newHype);
            }
        });
    }

    /**
     * Broadcast hype level update to all connected clients.
     */
    private void broadcastHypeUpdate(Long eventId, int hypeLevel) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "HYPE_UPDATE");
        payload.put("hypeLevel", hypeLevel);
        payload.put("maxHype", MAX_HYPE_LEVEL);
        payload.put("timestamp", LocalDateTime.now().toString());
        
        String destination = String.format(LIVE_TOPIC, eventId);
        messagingTemplate.convertAndSend(destination, payload);
    }

    // ==================== PHOTO WALL (SOCIAL PROOF) ====================

    /**
     * Upload a photo for an event. Photos start in PENDING status.
     */
    @Transactional
    public EventLivePhoto uploadPhoto(Long eventId, MultipartFile file, Long userId, String userName) {
        // Enforce 5 photos limit per user/ticket
        long userPhotoCount = photoRepository.countByEventIdAndUserId(eventId, userId);
        if (userPhotoCount >= 5) {
            throw new RuntimeException("You can only upload a maximum of 5 photos per ticket.");
        }

        // Store the file
        String fileName = fileStorageService.storeFile(file);
        String imageUrl = "http://localhost:8080/uploads/" + fileName;

        // Create photo record
        EventLivePhoto photo = new EventLivePhoto(eventId, imageUrl);
        photo.setUserId(userId);
        photo.setUserName(userName);
        photo = photoRepository.save(photo);

        // Notify moderators about new pending photo
        broadcastPhotoUpdate(eventId, "PHOTO_PENDING", photo);

        return photo;
    }

    /**
     * Get all pending photos for moderation.
     */
    public List<EventLivePhoto> getPendingPhotos(Long eventId) {
        return photoRepository.findByEventIdAndStatusOrderByCreatedAtDesc(
            eventId, EventLivePhoto.PhotoStatus.PENDING);
    }

    /**
     * Get all approved photos for display.
     */
    public List<EventLivePhoto> getApprovedPhotos(Long eventId) {
        return photoRepository.findByEventIdAndStatusOrderByApprovedAtDesc(
            eventId, EventLivePhoto.PhotoStatus.APPROVED);
    }

    /**
     * Approve a photo for display on the big screen and attendee feed.
     */
    @Transactional
    public EventLivePhoto approvePhoto(Long photoId) {
        EventLivePhoto photo = photoRepository.findById(photoId)
            .orElseThrow(() -> new RuntimeException("Photo not found"));

        photo.setStatus(EventLivePhoto.PhotoStatus.APPROVED);
        photo.setApprovedAt(LocalDateTime.now());
        photo = photoRepository.save(photo);

        // Broadcast to all clients (big screen + attendees)
        broadcastPhotoUpdate(photo.getEventId(), "PHOTO_APPROVED", photo);

        return photo;
    }

    /**
     * Reject a photo.
     */
    @Transactional
    public EventLivePhoto rejectPhoto(Long photoId) {
        EventLivePhoto photo = photoRepository.findById(photoId)
            .orElseThrow(() -> new RuntimeException("Photo not found"));

        photo.setStatus(EventLivePhoto.PhotoStatus.REJECTED);
        photo = photoRepository.save(photo);

        // Notify moderator panel only
        broadcastPhotoUpdate(photo.getEventId(), "PHOTO_REJECTED", photo);

        return photo;
    }

    /**
     * Get count of pending photos for moderation badge.
     */
    public long getPendingPhotoCount(Long eventId) {
        return photoRepository.countByEventIdAndStatus(eventId, EventLivePhoto.PhotoStatus.PENDING);
    }

    /**
     * Broadcast photo update to connected clients.
     */
    private void broadcastPhotoUpdate(Long eventId, String updateType, EventLivePhoto photo) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", updateType);
        payload.put("photo", photo);
        payload.put("timestamp", LocalDateTime.now().toString());

        String destination = String.format(LIVE_TOPIC, eventId);
        messagingTemplate.convertAndSend(destination, payload);
    }

    /**
     * Check if a user has a valid ticket for an event.
     */
    public boolean hasValidTicket(Long userId, Long eventId) {
        return ticketRepository.existsByOrderItem_Order_Customer_IdAndOrderItem_TicketType_Event_IdAndStatus(
            userId, eventId, Ticket.TicketStatus.VALID);
    }

    /**
     * Delete all approved photos for an event (Organizer only).
     */
    @Transactional
    public void deleteAllApprovedPhotos(Long eventId) {
        // Fetch photos first to get file names
        List<EventLivePhoto> approvedPhotos = photoRepository.findByEventIdAndStatusOrderByApprovedAtDesc(
            eventId, EventLivePhoto.PhotoStatus.APPROVED);

        // Delete physical files
        for (EventLivePhoto photo : approvedPhotos) {
            try {
                // Extract filename from URL (assuming format http://localhost:8080/uploads/filename)
                String fileUrl = photo.getImageUrl();
                String fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
                fileStorageService.deleteFile(fileName);
            } catch (Exception e) {
                // Log but continue deleting other photos/records
                System.err.println("Failed to delete file for photo " + photo.getId() + ": " + e.getMessage());
            }
        }

        // Delete records from DB
        photoRepository.deleteByEventIdAndStatus(eventId, EventLivePhoto.PhotoStatus.APPROVED);
        
        // Broadcast to all clients to clear their view
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "PHOTOS_CLEARED");
        payload.put("timestamp", LocalDateTime.now().toString());
        
        String destination = String.format(LIVE_TOPIC, eventId);
        messagingTemplate.convertAndSend(destination, payload);
    }

    /**
     * Approve all pending photos for an event (Organizer only).
     */
    @Transactional
    public int approveAllPhotos(Long eventId) {
        List<EventLivePhoto> pendingPhotos = photoRepository.findByEventIdAndStatusOrderByCreatedAtDesc(
            eventId, EventLivePhoto.PhotoStatus.PENDING);
        
        LocalDateTime now = LocalDateTime.now();
        for (EventLivePhoto photo : pendingPhotos) {
            photo.setStatus(EventLivePhoto.PhotoStatus.APPROVED);
            photo.setApprovedAt(now);
        }
        
        photoRepository.saveAll(pendingPhotos);
        
        // Broadcast bulk update
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "PHOTOS_BULK_APPROVED");
        payload.put("count", pendingPhotos.size());
        payload.put("timestamp", now.toString());
        
        String destination = String.format(LIVE_TOPIC, eventId);
        messagingTemplate.convertAndSend(destination, payload);
        
        return pendingPhotos.size();
    }

    /**
     * Reject all pending photos for an event (Organizer only).
     */
    @Transactional
    public int rejectAllPhotos(Long eventId) {
        List<EventLivePhoto> pendingPhotos = photoRepository.findByEventIdAndStatusOrderByCreatedAtDesc(
            eventId, EventLivePhoto.PhotoStatus.PENDING);
        
        // Delete physical files for rejected photos
        for (EventLivePhoto photo : pendingPhotos) {
            try {
                String fileUrl = photo.getImageUrl();
                String fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
                fileStorageService.deleteFile(fileName);
            } catch (Exception e) {
                System.err.println("Failed to delete file for photo " + photo.getId() + ": " + e.getMessage());
            }
        }
        
        // Delete all pending photos from DB
        photoRepository.deleteByEventIdAndStatus(eventId, EventLivePhoto.PhotoStatus.PENDING);
        
        // Broadcast bulk update
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "PHOTOS_BULK_REJECTED");
        payload.put("count", pendingPhotos.size());
        payload.put("timestamp", LocalDateTime.now().toString());
        
        String destination = String.format(LIVE_TOPIC, eventId);
        messagingTemplate.convertAndSend(destination, payload);
        
        return pendingPhotos.size();
    }
}
