package com.oop.EventTicketingSystem.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.oop.EventTicketingSystem.model.Ticket;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    Long countByStatus(String status);
    
    java.util.List<Ticket> findByOrderItem_TicketType_Event_Id(Long eventId);
    
    java.util.List<Ticket> findByOrderItem_TicketType_Event_Organizer_Id(Long organizerId);
}
