package com.oop.EventTicketingSystem.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.oop.EventTicketingSystem.model.Ticket;
import com.oop.EventTicketingSystem.security.UserPrincipal;
import com.oop.EventTicketingSystem.service.AttendeeService;

@RestController
@RequestMapping("/api/attendees")
public class AttendeeController {

    @Autowired
    private AttendeeService attendeeService;

    /**
     * Get attendees for a specific event.
     * Organizers can only see attendees for their own events.
     * Admins can see attendees for any event.
     */
    @GetMapping
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<List<Ticket>> getAttendees(
            @RequestParam(required = false) Long eventId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        boolean isAdmin = userPrincipal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        Long requesterId = Long.parseLong(userPrincipal.getName());

        if (eventId != null) {
            // Get attendees for specific event
            return ResponseEntity.ok(attendeeService.getEventAttendees(eventId, requesterId, isAdmin));
        }

        // Get all attendees based on role
        if (isAdmin) {
            return ResponseEntity.ok(attendeeService.getAllAttendees());
        } else {
            return ResponseEntity.ok(attendeeService.getOrganizerAttendees(requesterId));
        }
    }

    /**
     * Get attendees for a specific event by event ID in path.
     * This is an alternative endpoint format.
     */
    @GetMapping("/event/{eventId}")
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<List<Ticket>> getEventAttendees(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        boolean isAdmin = userPrincipal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        Long requesterId = Long.parseLong(userPrincipal.getName());

        return ResponseEntity.ok(attendeeService.getEventAttendees(eventId, requesterId, isAdmin));
    }
}
