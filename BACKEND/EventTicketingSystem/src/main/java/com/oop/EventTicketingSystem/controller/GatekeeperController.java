package com.oop.EventTicketingSystem.controller;

import com.oop.EventTicketingSystem.model.Event;
import com.oop.EventTicketingSystem.model.EventGatekeeperToken;
import com.oop.EventTicketingSystem.payload.request.GatekeeperInviteRequest;
import com.oop.EventTicketingSystem.payload.request.GatekeeperLoginRequest;
import com.oop.EventTicketingSystem.payload.response.GatekeeperLoginResponse;
import com.oop.EventTicketingSystem.repository.EventRepository;
import com.oop.EventTicketingSystem.repository.GatekeeperRepository;
import com.oop.EventTicketingSystem.security.UserPrincipal;
import com.oop.EventTicketingSystem.service.GatekeeperService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class GatekeeperController {

    private static final Logger logger = LoggerFactory.getLogger(GatekeeperController.class);

    @Autowired
    private GatekeeperService gatekeeperService;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private GatekeeperRepository gatekeeperRepository;

    /**
     * Generate a magic link for a gatekeeper.
     * Only the event organizer can generate this link.
     */
    @PostMapping("/api/events/{eventId}/gatekeeper/invite")
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<?> inviteGatekeeper(
            @PathVariable Long eventId,
            @RequestBody GatekeeperInviteRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        // Validate request
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Email is required"));
        }

        // Verify the event exists and belongs to the current user
        Optional<Event> eventOpt = eventRepository.findById(eventId);
        if (eventOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Event event = eventOpt.get();
        
        // Check if the current user is the organizer of this event
        if (!event.getOrganizer().getId().equals(currentUser.getId())) {
            logger.warn("User {} attempted to create gatekeeper for event {} owned by {}", 
                    currentUser.getId(), eventId, event.getOrganizer().getId());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You are not the organizer of this event"));
        }

        try {
            String magicLink = gatekeeperService.generateMagicLink(eventId, request.getEmail());

            Map<String, Object> response = new HashMap<>();
            response.put("magicLink", magicLink);
            response.put("email", request.getEmail());
            response.put("eventId", eventId);
            response.put("eventName", event.getName());

            logger.info("Gatekeeper invite created for event {} by organizer {}", eventId, currentUser.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error creating gatekeeper invite: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Login with a gatekeeper magic link token.
     * This endpoint is PUBLIC - no authentication required.
     */
    @PostMapping("/api/auth/gatekeeper-login")
    public ResponseEntity<?> gatekeeperLogin(@RequestBody GatekeeperLoginRequest request) {
        // Validate request
        if (request.getToken() == null || request.getToken().trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Token is required"));
        }

        logger.info("Gatekeeper login attempt with token: {}", 
                request.getToken().substring(0, Math.min(8, request.getToken().length())) + "...");

        Optional<String> jwtOpt = gatekeeperService.validateAndLogin(request.getToken());

        if (jwtOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "error", "Invalid or expired token",
                            "message", "This link has already been used or has expired."
                    ));
        }

        // Get event info for the response
        Optional<EventGatekeeperToken> tokenEntity = gatekeeperRepository.findByToken(request.getToken());
        if (tokenEntity.isEmpty()) {
            // Token was just used, so it should exist
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Token processing error"));
        }

        Long eventId = tokenEntity.get().getEventId();
        String eventName = eventRepository.findById(eventId)
                .map(Event::getName)
                .orElse("Unknown Event");

        GatekeeperLoginResponse response = new GatekeeperLoginResponse(
                jwtOpt.get(),
                eventId,
                eventName
        );

        logger.info("Gatekeeper login successful for event {}", eventId);
        return ResponseEntity.ok(response);
    }

    /**
     * Get list of all gatekeeper tokens for an event.
     * Only the event organizer can view this.
     */
    @GetMapping("/api/events/{eventId}/gatekeepers")
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<?> getEventGatekeepers(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        Optional<Event> eventOpt = eventRepository.findById(eventId);
        if (eventOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Event event = eventOpt.get();
        if (!event.getOrganizer().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You are not the organizer of this event"));
        }

        List<EventGatekeeperToken> allTokens = gatekeeperService.getAllTokensForEvent(eventId);

        List<Map<String, Object>> tokenList = allTokens.stream()
                .map(t -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("email", t.getEmail());
                    m.put("expiresAt", t.getExpiresAt().toString());
                    m.put("createdAt", t.getCreatedAt().toString());
                    m.put("used", t.isUsed());
                    m.put("expired", t.isExpired());
                    
                    // Determine status
                    String status;
                    if (t.isUsed()) {
                        status = "USED";
                    } else if (t.isExpired()) {
                        status = "EXPIRED";
                    } else {
                        status = "ACTIVE";
                    }
                    m.put("status", status);
                    return m;
                })
                .toList();

        return ResponseEntity.ok(tokenList);
    }
}
