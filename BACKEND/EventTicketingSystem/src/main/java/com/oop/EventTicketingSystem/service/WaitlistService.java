package com.oop.EventTicketingSystem.service;

import com.oop.EventTicketingSystem.model.TicketType;
import com.oop.EventTicketingSystem.model.User;
import com.oop.EventTicketingSystem.model.Waitlist;
import com.oop.EventTicketingSystem.repository.WaitlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class WaitlistService {

    @Autowired
    private WaitlistRepository waitlistRepository;
    
    @Autowired
    private EmailService emailService;

    // User joins the waitlist for a specific TicketType
    @Transactional
    public void joinWaitlist(User user, TicketType ticketType) {
        // Check if user is already in waitlist
        if (waitlistRepository.findByUserAndTicketType(user, ticketType).isPresent()) {
            throw new RuntimeException("User is already in the waitlist for this ticket type.");
        }

        Waitlist waitlist = new Waitlist(user, ticketType, LocalDateTime.now());
        waitlistRepository.save(waitlist);
        
        // Optional: Notify user they joined waitlist
    }

    // Check if a specific user has a valid reservation (not expired)
    public boolean hasReservation(User user, TicketType ticketType) {
        return waitlistRepository.findByUserAndTicketTypeAndReservationExpiryAfter(user, ticketType, LocalDateTime.now()).isPresent();
    }
    
    
    // We need to return strict boolean: Did we reserve it? 
    // If yes, OrderService knows NOT to decrement `sold`.
    @Transactional
    public boolean tryPromoteNextWaiter(TicketType ticketType) {
         List<Waitlist> waiters = waitlistRepository.findByTicketTypeOrderByRequestedAtAsc(ticketType);
         for (Waitlist waiter : waiters) {
            // Find someone waiting who doesn't have an active reservation
            if (waiter.getReservationExpiry() == null) {
                LocalDateTime expiry = LocalDateTime.now().plusMinutes(10);
                waiter.setReservationExpiry(expiry);
                waitlistRepository.save(waiter);
                
                // Notify
                try {
                    String subject = "Ticket Available! Reserved for 10 minutes";
                    String htmlBody = "<html><body>" +
                                        "<h2>Good news!</h2>" +
                                        "<p>A ticket for <strong>" + ticketType.getEvent().getName() + "'s " + ticketType.getName() + " category</strong> has become available.</p>" +
                                        "<p>It is reserved for you until: <strong>" + expiry + "</strong>.</p>" +
                                        "<p>Please log in and purchase it immediately.</p>" +
                                        "</body></html>";
                    emailService.sendHtmlEmail(waiter.getUser().getEmail(), subject, htmlBody);
                    System.out.println("Waitlist: Email sent to user " + waiter.getUser().getId());
                } catch (Exception e) {
                   System.err.println("Failed to send waitlist email: " + e.getMessage());
                }

                System.out.println("Waitlist: Reserved ticket for user " + waiter.getUser().getId() + " until " + expiry);
                return true; 
            }
             // If expiry is present but expired -> They missed their chance. 
             // Should we delete them? Or give them another chance? 
             // Usually, move to back or remove. Let's strictly skip them for now or assume cleanup job handles them.
             // If we skip them, we search next.
             if (waiter.getReservationExpiry().isBefore(LocalDateTime.now())) {
                 // Remove them to unblock queue? 
                 // Or just ignore.
                 // Let's remove them to keep list clean?
                 waitlistRepository.delete(waiter);
                 // Continue loop
             }
         }
         return false;
    }
    
    public void removeFromWaitlist(User user, TicketType ticketType) {
        Optional<Waitlist> entry = waitlistRepository.findByUserAndTicketType(user, ticketType);
        entry.ifPresent(waitlistRepository::delete);
    }
}
