package com.oop.EventTicketingSystem.controller;

import com.oop.EventTicketingSystem.model.*;
import com.oop.EventTicketingSystem.repository.EventRepository;
import com.oop.EventTicketingSystem.security.UserPrincipal;
import com.oop.EventTicketingSystem.service.EventLiveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/events/{eventId}/live")
public class EventLiveController {

    @Autowired
    private EventLiveService liveService;

    @Autowired
    private EventRepository eventRepository;

    // ==================== PUBLIC ENDPOINTS (for attendees) ====================

    /**
     * Get live data for an event (public for ticket holders)
     */
    @GetMapping
    public ResponseEntity<?> getLiveData(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }

        // Allow organizers or valid ticket holders
        if (!isOrganizer(eventId, userPrincipal) && !liveService.hasValidTicket(userPrincipal.getId(), eventId)) {
            return ResponseEntity.status(403).body(Map.of("error", "You must have a valid ticket to access this event's live mode"));
        }

        EventLiveData liveData = liveService.getLiveData(eventId);
        if (liveData == null) {
            return ResponseEntity.ok(Map.of(
                "eventId", eventId,
                "liveMessage", "",
                "schedule", List.of(),
                "lostAndFound", List.of(),
                "activePoll", null
            ));
        }
        return ResponseEntity.ok(liveData);
    }

    /**
     * Check if event is currently in live mode
     */
    @GetMapping("/status")
    public ResponseEntity<?> getLiveStatus(@PathVariable Long eventId) {
        boolean isLive = liveService.isEventLive(eventId);
        return ResponseEntity.ok(Map.of("isLive", isLive));
    }

    /**
     * Vote on active poll (any authenticated user can vote)
     */
    @PostMapping("/poll/vote")
    public ResponseEntity<?> votePoll(
            @PathVariable Long eventId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }
        
        String option = body.get("option");
        if (option == null || option.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Option is required"));
        }
        
        try {
            EventLiveData liveData = liveService.votePoll(eventId, option);
            return ResponseEntity.ok(liveData.getActivePoll());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== ORGANIZER ENDPOINTS ====================

    /**
     * Initialize or get live data (organizer only)
     */
    @PostMapping("/init")
    public ResponseEntity<?> initializeLiveData(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        if (!isOrganizer(eventId, userPrincipal)) {
            return ResponseEntity.status(403).body(Map.of("error", "Only the event organizer can manage live data"));
        }
        
        EventLiveData liveData = liveService.getOrCreateLiveData(eventId);
        return ResponseEntity.ok(liveData);
    }

    /**
     * Update "What's Happening Now" message
     */
    @PutMapping("/message")
    public ResponseEntity<?> updateMessage(
            @PathVariable Long eventId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        if (!isOrganizer(eventId, userPrincipal)) {
            return ResponseEntity.status(403).body(Map.of("error", "Only the event organizer can update messages"));
        }
        
        String message = body.get("message");
        EventLiveData liveData = liveService.updateLiveMessage(eventId, message);
        return ResponseEntity.ok(liveData);
    }

    @PutMapping("/layout")
    public ResponseEntity<?> updateLayout(
            @PathVariable Long eventId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        if (!isOrganizer(eventId, userPrincipal)) {
            return ResponseEntity.status(403).body(Map.of("error", "Only the event organizer can update layout"));
        }
        
        try {
            LayoutMode mode = LayoutMode.valueOf(body.get("mode"));
            EventLiveData liveData = liveService.updateLayoutMode(eventId, mode);
            return ResponseEntity.ok(liveData);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid layout mode"));
        }
    }

    @PutMapping("/background")
    public ResponseEntity<?> updateBackground(
            @PathVariable Long eventId,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        if (!isOrganizer(eventId, userPrincipal)) {
            return ResponseEntity.status(403).body(Map.of("error", "Only the event organizer can update background"));
        }
        
        try {
            // Manual mapping from Map to BigScreenBackground
            BigScreenBackground bg = new BigScreenBackground();
            bg.setType((String) body.get("type"));
            bg.setUrl((String) body.get("url"));
            if (body.get("loop") != null) bg.setLoop((Boolean) body.get("loop"));
            if (body.get("opacity") != null) bg.setOpacity(((Number) body.get("opacity")).floatValue());
            
            String target = (String) body.getOrDefault("target", "MAIN");
            
            EventLiveData liveData = liveService.updateBackground(eventId, bg, target);
            return ResponseEntity.ok(liveData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid background config: " + e.getMessage()));
        }
    }

    // ==================== SCHEDULE MANAGEMENT ====================

    @PostMapping("/schedule")
    public ResponseEntity<?> addScheduleItem(
            @PathVariable Long eventId,
            @RequestBody LiveScheduleItem item,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        if (!isOrganizer(eventId, userPrincipal)) {
            return ResponseEntity.status(403).body(Map.of("error", "Only the event organizer can manage schedule"));
        }
        
        EventLiveData liveData = liveService.addScheduleItem(eventId, item);
        return ResponseEntity.ok(liveData);
    }

    @PutMapping("/schedule/{itemId}")
    public ResponseEntity<?> updateScheduleItem(
            @PathVariable Long eventId,
            @PathVariable Long itemId,
            @RequestBody LiveScheduleItem item,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        if (!isOrganizer(eventId, userPrincipal)) {
            return ResponseEntity.status(403).body(Map.of("error", "Only the event organizer can manage schedule"));
        }
        
        EventLiveData liveData = liveService.updateScheduleItem(eventId, itemId, item);
        return ResponseEntity.ok(liveData);
    }

    @DeleteMapping("/schedule/{itemId}")
    public ResponseEntity<?> deleteScheduleItem(
            @PathVariable Long eventId,
            @PathVariable Long itemId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        if (!isOrganizer(eventId, userPrincipal)) {
            return ResponseEntity.status(403).body(Map.of("error", "Only the event organizer can manage schedule"));
        }
        
        EventLiveData liveData = liveService.removeScheduleItem(eventId, itemId);
        return ResponseEntity.ok(liveData);
    }

    // ==================== LOST & FOUND MANAGEMENT ====================

    @PostMapping("/lost-found")
    public ResponseEntity<?> addLostAndFoundPost(
            @PathVariable Long eventId,
            @RequestBody LostAndFoundPost post,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        if (!isOrganizer(eventId, userPrincipal)) {
            return ResponseEntity.status(403).body(Map.of("error", "Only the event organizer can manage lost & found"));
        }
        
        EventLiveData liveData = liveService.addLostAndFoundPost(eventId, post);
        return ResponseEntity.ok(liveData);
    }

    @DeleteMapping("/lost-found/{postId}")
    public ResponseEntity<?> deleteLostAndFoundPost(
            @PathVariable Long eventId,
            @PathVariable Long postId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        if (!isOrganizer(eventId, userPrincipal)) {
            return ResponseEntity.status(403).body(Map.of("error", "Only the event organizer can manage lost & found"));
        }
        
        EventLiveData liveData = liveService.removeLostAndFoundPost(eventId, postId);
        return ResponseEntity.ok(liveData);
    }

    // ==================== POLL MANAGEMENT ====================

    @PostMapping("/poll")
    public ResponseEntity<?> createPoll(
            @PathVariable Long eventId,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        if (!isOrganizer(eventId, userPrincipal)) {
            return ResponseEntity.status(403).body(Map.of("error", "Only the event organizer can manage polls"));
        }
        
        String question = (String) body.get("question");
        @SuppressWarnings("unchecked")
        List<String> options = (List<String>) body.get("options");
        
        if (question == null || options == null || options.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Question and options are required"));
        }
        
        try {
            EventLiveData liveData = liveService.createPoll(eventId, question, options);
            return ResponseEntity.ok(liveData);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/poll/close")
    public ResponseEntity<?> closePoll(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        if (!isOrganizer(eventId, userPrincipal)) {
            return ResponseEntity.status(403).body(Map.of("error", "Only the event organizer can manage polls"));
        }
        
        EventLiveData liveData = liveService.closePoll(eventId);
        return ResponseEntity.ok(liveData);
    }

    @DeleteMapping("/poll")
    public ResponseEntity<?> clearPoll(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        if (!isOrganizer(eventId, userPrincipal)) {
            return ResponseEntity.status(403).body(Map.of("error", "Only the event organizer can manage polls"));
        }
        
        EventLiveData liveData = liveService.clearPoll(eventId);
        return ResponseEntity.ok(liveData);
    }

    // ==================== LIVE MODE CONTROL ====================

    /**
     * Start live mode for the event
     */
    @PostMapping("/start")
    public ResponseEntity<?> startLive(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        if (!isOrganizer(eventId, userPrincipal)) {
            return ResponseEntity.status(403).body(Map.of("error", "Only the event organizer can start live mode"));
        }
        
        EventLiveData liveData = liveService.startLive(eventId);
        return ResponseEntity.ok(liveData);
    }

    /**
     * End live mode for the event
     */
    @PostMapping("/end")
    public ResponseEntity<?> endLive(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        if (!isOrganizer(eventId, userPrincipal)) {
            return ResponseEntity.status(403).body(Map.of("error", "Only the event organizer can end live mode"));
        }
        
        EventLiveData liveData = liveService.endLive(eventId);
        return ResponseEntity.ok(liveData);
    }

    // ==================== DIGITAL LIGHT SHOW ====================

    /**
     * Trigger Digital Light Show - sync all attendee phones to display a color
     */
    @PostMapping("/light-sync")
    public ResponseEntity<?> triggerLightSync(
            @PathVariable Long eventId,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        if (!isOrganizer(eventId, userPrincipal)) {
            return ResponseEntity.status(403).body(Map.of("error", "Only the event organizer can trigger light sync"));
        }
        
        String color = (String) body.get("color");
        String type = (String) body.getOrDefault("type", "SOLID");
        Integer duration = body.get("duration") != null ? ((Number) body.get("duration")).intValue() : 10000;
        Integer speed = body.get("speed") != null ? ((Number) body.get("speed")).intValue() : 50;
        Integer intensity = body.get("intensity") != null ? ((Number) body.get("intensity")).intValue() : 100;
        
        if (color == null || color.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Color is required"));
        }
        
        liveService.triggerLightSync(eventId, color, type, duration, speed, intensity);
        return ResponseEntity.ok(Map.of("success", true, "message", "Light sync triggered"));
    }

    /**
     * Stop Digital Light Show
     */
    @PostMapping("/light-sync/stop")
    public ResponseEntity<?> stopLightSync(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        if (!isOrganizer(eventId, userPrincipal)) {
            return ResponseEntity.status(403).body(Map.of("error", "Only the event organizer can stop light sync"));
        }
        
        liveService.stopLightSync(eventId);
        return ResponseEntity.ok(Map.of("success", true, "message", "Light sync stopped"));
    }

    // ==================== HYPE GAUGE (CLAP-O-METER) ====================

    /**
     * Add hype clicks (batched from frontend).
     * Any authenticated user can contribute to the hype.
     */
    @PostMapping("/hype")
    public ResponseEntity<?> addHype(
            @PathVariable Long eventId,
            @RequestBody Map<String, Integer> body,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }
        
        Integer count = body.get("count");
        if (count == null || count <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid count"));
        }

        // Check for ticket
        if (!isOrganizer(eventId, userPrincipal) && !liveService.hasValidTicket(userPrincipal.getId(), eventId)) {
            return ResponseEntity.status(403).body(Map.of("error", "Ticket required"));
        }
        
        // Limit individual batch size to prevent abuse
        int safeCount = Math.min(count, 50);
        
        int newHypeLevel = liveService.addHype(eventId, safeCount);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "hypeLevel", newHypeLevel,
            "added", safeCount
        ));
    }

    /**
     * Get current hype level for an event.
     */
    @GetMapping("/hype")
    public ResponseEntity<?> getHypeLevel(@PathVariable Long eventId) {
        int hypeLevel = liveService.getHypeLevel(eventId);
        return ResponseEntity.ok(Map.of("hypeLevel", hypeLevel, "maxHype", 1000));
    }

    // ==================== PHOTO WALL (SOCIAL PROOF) ====================

    /**
     * Upload a photo to the event's photo wall.
     * Any authenticated user can upload. Photos go to pending status.
     */
    @PostMapping("/photos")
    public ResponseEntity<?> uploadPhoto(
            @PathVariable Long eventId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "userName", required = false) String userName,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is required"));
        }

        // Check for ticket
        if (!isOrganizer(eventId, userPrincipal) && !liveService.hasValidTicket(userPrincipal.getId(), eventId)) {
            return ResponseEntity.status(403).body(Map.of("error", "Ticket required"));
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Only image files are allowed"));
        }

        try {
            com.oop.EventTicketingSystem.model.EventLivePhoto photo = liveService.uploadPhoto(
                eventId, 
                file, 
                userPrincipal.getId(),
                userName != null ? userName : "Attendee"
            );
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Photo uploaded and pending approval",
                "photo", photo
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get approved photos for public display (attendees + big screen).
     */
    @GetMapping("/photos/approved")
    public ResponseEntity<?> getApprovedPhotos(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }

        if (!isOrganizer(eventId, userPrincipal) && !liveService.hasValidTicket(userPrincipal.getId(), eventId)) {
            return ResponseEntity.status(403).body(Map.of("error", "Ticket required"));
        }

        var photos = liveService.getApprovedPhotos(eventId);
        return ResponseEntity.ok(photos);
    }

    /**
     * Get pending photos for moderation (organizer only).
     */
    @GetMapping("/photos/pending")
    public ResponseEntity<?> getPendingPhotos(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        if (!isOrganizer(eventId, userPrincipal)) {
            return ResponseEntity.status(403).body(Map.of("error", "Only the event organizer can view pending photos"));
        }

        var photos = liveService.getPendingPhotos(eventId);
        long pendingCount = liveService.getPendingPhotoCount(eventId);
        return ResponseEntity.ok(Map.of("photos", photos, "pendingCount", pendingCount));
    }

    /**
     * Approve a photo (organizer only).
     */
    @PutMapping("/photos/{photoId}/approve")
    public ResponseEntity<?> approvePhoto(
            @PathVariable Long eventId,
            @PathVariable Long photoId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        if (!isOrganizer(eventId, userPrincipal)) {
            return ResponseEntity.status(403).body(Map.of("error", "Only the event organizer can approve photos"));
        }

        try {
            var photo = liveService.approvePhoto(photoId);
            return ResponseEntity.ok(Map.of("success", true, "photo", photo));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Reject a photo (organizer only).
     */
    @PutMapping("/photos/{photoId}/reject")
    public ResponseEntity<?> rejectPhoto(
            @PathVariable Long eventId,
            @PathVariable Long photoId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        if (!isOrganizer(eventId, userPrincipal)) {
            return ResponseEntity.status(403).body(Map.of("error", "Only the event organizer can reject photos"));
        }

        try {
            var photo = liveService.rejectPhoto(photoId);
            return ResponseEntity.ok(Map.of("success", true, "photo", photo));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Clear all approved photos (organizer only).
     */
    @DeleteMapping("/photos/approved")
    public ResponseEntity<?> clearApprovedPhotos(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        if (!isOrganizer(eventId, userPrincipal)) {
            return ResponseEntity.status(403).body(Map.of("error", "Only the event organizer can clear photos"));
        }

        try {
            liveService.deleteAllApprovedPhotos(eventId);
            return ResponseEntity.ok(Map.of("success", true, "message", "All approved photos cleared"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Approve all pending photos (organizer only).
     */
    @PutMapping("/photos/approve-all")
    public ResponseEntity<?> approveAllPhotos(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        if (!isOrganizer(eventId, userPrincipal)) {
            return ResponseEntity.status(403).body(Map.of("error", "Only the event organizer can approve photos"));
        }

        try {
            int count = liveService.approveAllPhotos(eventId);
            return ResponseEntity.ok(Map.of("success", true, "message", count + " photos approved", "count", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Reject all pending photos (organizer only).
     */
    @PutMapping("/photos/reject-all")
    public ResponseEntity<?> rejectAllPhotos(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        if (!isOrganizer(eventId, userPrincipal)) {
            return ResponseEntity.status(403).body(Map.of("error", "Only the event organizer can reject photos"));
        }

        try {
            int count = liveService.rejectAllPhotos(eventId);
            return ResponseEntity.ok(Map.of("success", true, "message", count + " photos rejected", "count", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== HELPER METHODS ====================

    @PostMapping("/background/upload")
    public ResponseEntity<?> uploadBackgroundVideo(@PathVariable Long eventId, @RequestParam("file") MultipartFile file) {
        try {
            String videoUrl = liveService.uploadBackgroundVideo(eventId, file);
            return ResponseEntity.ok(Map.of("url", videoUrl));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private boolean isOrganizer(Long eventId, UserPrincipal userPrincipal) {
        if (userPrincipal == null) return false;
        
        return eventRepository.findById(eventId)
                .map(event -> event.getOrganizer().getId().equals(userPrincipal.getId()))
                .orElse(false);
    }
}
