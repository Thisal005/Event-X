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
    public ResponseEntity<?> getLiveData(@PathVariable Long eventId) {
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

    // ==================== HELPER METHODS ====================

    private boolean isOrganizer(Long eventId, UserPrincipal userPrincipal) {
        if (userPrincipal == null) return false;
        
        return eventRepository.findById(eventId)
                .map(event -> event.getOrganizer().getId().equals(userPrincipal.getId()))
                .orElse(false);
    }
}
