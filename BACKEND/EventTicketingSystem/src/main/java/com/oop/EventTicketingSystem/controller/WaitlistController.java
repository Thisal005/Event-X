package com.oop.EventTicketingSystem.controller;

import com.oop.EventTicketingSystem.model.TicketType;
import com.oop.EventTicketingSystem.model.User;
import com.oop.EventTicketingSystem.repository.TicketTypeRepository;
import com.oop.EventTicketingSystem.repository.UserRepository;
import com.oop.EventTicketingSystem.security.UserPrincipal;
import com.oop.EventTicketingSystem.service.WaitlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/waitlist")
@CrossOrigin(origins = "http://localhost:5173")
public class WaitlistController {

    @Autowired
    private WaitlistService waitlistService;

    @Autowired
    private TicketTypeRepository ticketTypeRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/join")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> joinWaitlist(@RequestParam Long ticketTypeId, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        TicketType ticketType = ticketTypeRepository.findById(ticketTypeId)
                .orElseThrow(() -> new RuntimeException("Ticket Type not found"));

        if (ticketType.getQuantity() > ticketType.getSold()) {
            return ResponseEntity.badRequest().body("Tickets are still available. No need to join waitlist.");
        }

        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            waitlistService.joinWaitlist(user, ticketType);
            return ResponseEntity.ok("Successfully joined the waitlist.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
