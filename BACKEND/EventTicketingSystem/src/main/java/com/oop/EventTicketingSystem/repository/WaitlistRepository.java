package com.oop.EventTicketingSystem.repository;

import com.oop.EventTicketingSystem.model.TicketType;
import com.oop.EventTicketingSystem.model.User;
import com.oop.EventTicketingSystem.model.Waitlist;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface WaitlistRepository extends JpaRepository<Waitlist, Long> {
    
    // Find people waiting for a specific ticket type, ordered by who joined first
    List<Waitlist> findByTicketTypeOrderByRequestedAtAsc(TicketType ticketType);

    // Find if a specific user is already in waitlist for a specific ticket
    Optional<Waitlist> findByUserAndTicketType(User user, TicketType ticketType);
    
    // Count how many valid reservations exist for this ticket type that are NOT expired
    // Actually, we need to check if *anyone* has a reservation active (reservationExpiry > now)
    long countByTicketTypeAndReservationExpiryAfter(TicketType ticketType, java.time.LocalDateTime now);
    
    // Find specific reservation for a user
    Optional<Waitlist> findByUserAndTicketTypeAndReservationExpiryAfter(User user, TicketType ticketType, java.time.LocalDateTime now);
}
