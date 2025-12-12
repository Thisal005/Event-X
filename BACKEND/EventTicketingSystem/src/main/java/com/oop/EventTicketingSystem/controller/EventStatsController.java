package com.oop.EventTicketingSystem.controller;

import com.oop.EventTicketingSystem.dto.EventStatsDTO;
import com.oop.EventTicketingSystem.service.EventStatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for event statistics endpoints used by the admin inspection dashboard.
 */
@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class EventStatsController {

    @Autowired
    private EventStatisticsService eventStatisticsService;

    /**
     * Get comprehensive statistics for a specific event.
     * Available to admins and the event's organizer.
     */
    @GetMapping("/{eventId}/stats")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER')")
    public ResponseEntity<EventStatsDTO> getEventStats(@PathVariable Long eventId) {
        EventStatsDTO stats = eventStatisticsService.getEventStats(eventId);
        return ResponseEntity.ok(stats);
    }

    /**
     * Manually trigger a stats refresh via WebSocket.
     * Useful for testing or forcing an update.
     */
    @PostMapping("/{eventId}/stats/refresh")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER')")
    public ResponseEntity<String> refreshStats(@PathVariable Long eventId) {
        eventStatisticsService.publishStatsUpdate(eventId);
        return ResponseEntity.ok("Stats refresh triggered for event " + eventId);
    }
}
