package com.oop.EventTicketingSystem.service;

import com.oop.EventTicketingSystem.model.Ticket;
import com.oop.EventTicketingSystem.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class TicketValidationService {

    @Autowired
    private QRCodeService qrCodeService;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    public Map<String, Object> validateTicket(String qrData) {
        Map<String, Object> response = new HashMap<>();

        if (!qrCodeService.validatePayload(qrData)) {
            response.put("valid", false);
            response.put("reason", "INVALID_SIGNATURE");
            return response;
        }

        Long ticketId = qrCodeService.extractTicketId(qrData);
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);

        if (ticketOpt.isEmpty()) {
            response.put("valid", false);
            response.put("reason", "TICKET_NOT_FOUND");
            return response;
        }

        Ticket ticket = ticketOpt.get();

        if (ticket.getStatus() == Ticket.TicketStatus.USED) {
            response.put("valid", false);
            response.put("reason", "ALREADY_USED");
            response.put("checkInTime", ticket.getCheckInTime());
            return response;
        }

        response.put("valid", true);
        response.put("ticketId", ticket.getId());
        response.put("ticketName", ticket.getTicketName());
        response.put("status", ticket.getStatus());
        
        // Add event details
        if (ticket.getOrderItem() != null && 
            ticket.getOrderItem().getTicketType() != null && 
            ticket.getOrderItem().getTicketType().getEvent() != null) {
            
            var event = ticket.getOrderItem().getTicketType().getEvent();
            response.put("eventName", event.getName());
            response.put("eventDate", event.getDate());
            response.put("eventVenue", event.getVenue());
            
            if (event.getOrganizer() != null) {
                response.put("organizerName", event.getOrganizer().getName());
            }
        }
        
        return response;
    }

    @Transactional
    public Map<String, Object> redeemTicket(String qrData) {
        Map<String, Object> validation = validateTicket(qrData);
        
        if (!(boolean) validation.get("valid")) {
            return validation; // Return the validation error directly
        }

        Long ticketId = (Long) validation.get("ticketId");
        Ticket ticket = ticketRepository.findById(ticketId).orElseThrow();

        ticket.setStatus(Ticket.TicketStatus.USED);
        ticket.setCheckInTime(LocalDateTime.now());
        ticketRepository.save(ticket);

        // Broadcast Check-In Update via WebSocket
        if (ticket.getOrderItem() != null && 
            ticket.getOrderItem().getTicketType() != null && 
            ticket.getOrderItem().getTicketType().getEvent() != null) {
            
            Long eventId = ticket.getOrderItem().getTicketType().getEvent().getId();
            Map<String, Object> update = new HashMap<>();
            update.put("type", "CHECK_IN");
            update.put("ticketId", ticket.getId());
            update.put("checkInTime", ticket.getCheckInTime());
            
            try {
                messagingTemplate.convertAndSend("/topic/event/" + eventId, update);
            } catch (Exception e) {
                System.err.println("Failed to send WebSocket update: " + e.getMessage());
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("ticketId", ticket.getId());
        response.put("checkInTime", ticket.getCheckInTime());
        return response;
    }
}
