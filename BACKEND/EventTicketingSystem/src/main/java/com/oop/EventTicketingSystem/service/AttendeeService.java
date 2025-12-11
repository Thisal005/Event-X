package com.oop.EventTicketingSystem.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.oop.EventTicketingSystem.model.Event;
import com.oop.EventTicketingSystem.model.Ticket;
import com.oop.EventTicketingSystem.repository.EventRepository;
import com.oop.EventTicketingSystem.repository.TicketRepository;

@Service
public class AttendeeService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private EventRepository eventRepository;

    /**
     * Get all attendees (tickets) for an event.
     * If not admin, checks that the requester is the event organizer.
     */
    public List<Ticket> getEventAttendees(Long eventId, Long requesterId, boolean isAdmin) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + eventId));

        // Check ownership if not admin
        if (!isAdmin && !event.getOrganizer().getId().equals(requesterId)) {
            throw new RuntimeException("You are not authorized to view attendees for this event");
        }

        return ticketRepository.findByOrderItem_TicketType_Event_Id(eventId);
    }

    /**
     * Get all attendees for events owned by an organizer.
     */
    public List<Ticket> getOrganizerAttendees(Long organizerId) {
        return ticketRepository.findByOrderItem_TicketType_Event_Organizer_Id(organizerId);
    }

    /**
     * Get all attendees (admin only).
     */
    public List<Ticket> getAllAttendees() {
        return ticketRepository.findAll();
    }
}
