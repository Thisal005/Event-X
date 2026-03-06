package com.oop.EventTicketingSystem.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.oop.EventTicketingSystem.model.Event;
import com.oop.EventTicketingSystem.payload.request.EventRequest;
import com.oop.EventTicketingSystem.security.UserPrincipal;
import com.oop.EventTicketingSystem.service.EventService;

@RestController
@RequestMapping("/api/events")
public class EventController {

    @Autowired
    private EventService eventService;

    @Autowired
    private com.oop.EventTicketingSystem.service.FileStorageService fileStorageService;

    @Autowired
    private ObjectMapper objectMapper;

    @GetMapping
    public List<Event> getAllEvents() {
        return eventService.getAllEvents();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    @PostMapping(consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<Event> createEvent(@RequestPart("event") String eventRequestStr, 
                                           @RequestPart(value = "file", required = false) MultipartFile file,
                                           @AuthenticationPrincipal UserPrincipal userPrincipal) throws JsonProcessingException {
        EventRequest eventRequest = objectMapper.readValue(eventRequestStr, EventRequest.class);
        
        if (file != null && !file.isEmpty()) {
            String fileUrl = fileStorageService.storeFile(file);
            eventRequest.setBannerImage(fileUrl);
        }

        // userPrincipal.getName() returns ID as String as per our UserPrincipal implementation
        Long organizerId = Long.parseLong(userPrincipal.getName());
        return ResponseEntity.ok(eventService.createEvent(eventRequest, organizerId));
    }

    @GetMapping("/my-events")
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public List<Event> getMyEvents(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        Long organizerId = Long.parseLong(userPrincipal.getName());
        return eventService.getOrganizerEvents(organizerId);
    }
    
    @PutMapping("/{id}/publish")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Event> publishEvent(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.publishEvent(id));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Event> approveEvent(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.approveEvent(id));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Event> rejectEvent(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.rejectEvent(id));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Event> getAllEventsForAdmin() {
        return eventService.getAllEventsForAdmin();
    }

    @PutMapping(value = "/{id}", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<Event> updateEvent(@PathVariable Long id, 
                                             @RequestPart("event") String eventRequestStr,
                                             @RequestPart(value = "file", required = false) MultipartFile file) throws JsonProcessingException {
        EventRequest eventRequest = objectMapper.readValue(eventRequestStr, EventRequest.class);
        
        if (file != null && !file.isEmpty()) {
            String fileUrl = fileStorageService.storeFile(file);
            eventRequest.setBannerImage(fileUrl);
        }
        
        return ResponseEntity.ok(eventService.updateEvent(id, eventRequest));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/stats")
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<?> getEventStats(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getEventStats(id));
    }

    @Autowired
    private com.oop.EventTicketingSystem.service.RefundService refundService;

    /**
     * Cancel an event and automatically refund all ticket holders.
     * This is the bulletproof refund endpoint - once called, every buyer gets refunded instantly.
     */
    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<?> cancelEvent(@PathVariable Long id,
                                         @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Long organizerId = Long.parseLong(userPrincipal.getName());
        
        com.oop.EventTicketingSystem.service.RefundService.RefundSummary summary = 
            refundService.processEventCancellation(id, organizerId);
        
        return ResponseEntity.ok(java.util.Map.of(
            "success", true,
            "message", summary.getMessage(),
            "ordersRefunded", summary.getOrdersRefunded(),
            "ticketsRefunded", summary.getTicketsRefunded(),
            "amountRefunded", summary.getAmountRefunded()
        ));
    }

    /**
     * Postpone an event with options:
     * - refundAll=true: Refund all tickets
     * - refundAll=false: Keep tickets valid for new date
     */
    @PostMapping("/{id}/postpone")
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<?> postponeEvent(@PathVariable Long id,
                                           @org.springframework.web.bind.annotation.RequestBody PostponeRequest request,
                                           @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Long organizerId = Long.parseLong(userPrincipal.getName());
        
        java.time.LocalDateTime newDate = null;
        if (request.getNewDate() != null && !request.getNewDate().isEmpty()) {
            newDate = java.time.LocalDateTime.parse(request.getNewDate());
        }
        
        com.oop.EventTicketingSystem.service.RefundService.RefundSummary summary = 
            refundService.processEventPostponement(id, organizerId, newDate, request.isRefundAll());
        
        return ResponseEntity.ok(java.util.Map.of(
            "success", true,
            "message", summary.getMessage(),
            "ordersRefunded", summary.getOrdersRefunded(),
            "ticketsRefunded", summary.getTicketsRefunded(),
            "amountRefunded", summary.getAmountRefunded()
        ));
    }

    /**
     * Request DTO for postponing an event.
     */
    public static class PostponeRequest {
        private String newDate;
        private boolean refundAll;

        public String getNewDate() { return newDate; }
        public void setNewDate(String newDate) { this.newDate = newDate; }
        public boolean isRefundAll() { return refundAll; }
        public void setRefundAll(boolean refundAll) { this.refundAll = refundAll; }
    }
}

