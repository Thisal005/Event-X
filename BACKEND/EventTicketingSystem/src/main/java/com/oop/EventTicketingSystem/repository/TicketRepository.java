package com.oop.EventTicketingSystem.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.oop.EventTicketingSystem.model.Ticket;
import com.oop.EventTicketingSystem.model.Ticket.TicketStatus;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    Long countByStatus(String status);
    
    java.util.List<Ticket> findByOrderItem_TicketType_Event_Id(Long eventId);
    
    java.util.List<Ticket> findByOrderItem_TicketType_Event_Organizer_Id(Long organizerId);
    
    // Count tickets by event and status
    long countByOrderItem_TicketType_Event_IdAndStatus(Long eventId, TicketStatus status);
    
    // Count checked-in attendees (tickets with checkInTime set)
    long countByOrderItem_TicketType_Event_IdAndCheckInTimeIsNotNull(Long eventId);
    
    // Count total tickets for an event
    long countByOrderItem_TicketType_Event_Id(Long eventId);
    // Check if user has a valid ticket for an event
    boolean existsByOrderItem_Order_Customer_IdAndOrderItem_TicketType_Event_IdAndStatus(Long userId, Long eventId, TicketStatus status);
}
