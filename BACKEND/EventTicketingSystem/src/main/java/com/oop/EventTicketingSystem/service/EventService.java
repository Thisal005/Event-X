package com.oop.EventTicketingSystem.service;

import com.oop.EventTicketingSystem.model.Event;
import com.oop.EventTicketingSystem.model.TicketType;
import com.oop.EventTicketingSystem.model.User;
import com.oop.EventTicketingSystem.payload.request.EventRequest;
import com.oop.EventTicketingSystem.repository.EventRepository;
import com.oop.EventTicketingSystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WaitlistService waitlistService;

    // @Autowired
    // private com.oop.EventTicketingSystem.repository.EventCommunicationRepository eventCommunicationRepository;

    private void updateEventCommunication(Event event, EventRequest.EventCommunicationRequest config) {
        if (config == null) return;
        
        com.oop.EventTicketingSystem.model.EventCommunication comm = event.getCommunication();
        if (comm == null) {
            comm = new com.oop.EventTicketingSystem.model.EventCommunication(event);
            event.setCommunication(comm);
        }

        comm.setReminder7dEnabled(config.isReminder7dEnabled());
        comm.setReminder7dSubject(config.getReminder7dSubject());
        comm.setReminder7dBody(config.getReminder7dBody());

        comm.setReminder48hEnabled(config.isReminder48hEnabled());
        comm.setReminder48hSubject(config.getReminder48hSubject());
        comm.setReminder48hBody(config.getReminder48hBody());

        comm.setReminder2hEnabled(config.isReminder2hEnabled());
        comm.setReminder2hSubject(config.getReminder2hSubject());
        comm.setReminder2hBody(config.getReminder2hBody());
    }

    @Transactional
    public Event createEvent(EventRequest request, Long organizerId) {
        User organizer = userRepository.findById(organizerId)
                .orElseThrow(() -> new RuntimeException("Organizer not found"));

        Event event = new Event(
                request.getName(),
                request.getDescription(),
                request.getDate(),
                request.getVenue(),
                request.getCategory(),
                organizer
        );
        event.setBannerImage(request.getBannerImage());
        event.setStatus(Event.EventStatus.DRAFT); // New events start as DRAFT
        event.setApprovalStatus(Event.ApprovalStatus.PENDING); // Requires admin approval

        List<TicketType> ticketTypes = new ArrayList<>();
        for (EventRequest.TicketTypeRequest tReq : request.getTicketTypes()) {
            TicketType type = new TicketType(tReq.getName(), tReq.getPrice(), tReq.getQuantity(), event);
            ticketTypes.add(type);
        }
        event.setTicketTypes(ticketTypes);

        updateEventCommunication(event, request.getCommunication());

        return eventRepository.save(event);
    }

    public List<Event> getAllEvents() {
        // Only return events that are both PUBLISHED and APPROVED
        // Only return events that are both PUBLISHED and APPROVED and in the future
        return eventRepository.findByStatusAndApprovalStatusAndDateAfter(
            Event.EventStatus.PUBLISHED, 
            Event.ApprovalStatus.APPROVED,
            java.time.LocalDateTime.now()
        );
    }

    public List<Event> getAllEventsForAdmin() {
        // Admin can see all events regardless of status
        return eventRepository.findAll();
    }

    public List<Event> getOrganizerEvents(Long organizerId) {
        return eventRepository.findByOrganizerId(organizerId);
    }

    @Autowired
    private com.oop.EventTicketingSystem.repository.OrderRepository orderRepository;

    public Event getEventById(Long id) {
        return eventRepository.findById(id).orElseThrow(() -> new RuntimeException("Event not found"));
    }
    
    // Admin method to approve event
    public Event approveEvent(Long eventId) {
        Event event = getEventById(eventId);
        event.setApprovalStatus(Event.ApprovalStatus.APPROVED);
        event.setStatus(Event.EventStatus.PUBLISHED); // Auto-publish on approval
        return eventRepository.save(event);
    }

    // Admin method to reject event
    public Event rejectEvent(Long eventId) {
        Event event = getEventById(eventId);
        event.setApprovalStatus(Event.ApprovalStatus.REJECTED);
        return eventRepository.save(event);
    }

    // Legacy publish method - now requires approval first
    public Event publishEvent(Long eventId) {
        Event event = getEventById(eventId);
        if (event.getApprovalStatus() != Event.ApprovalStatus.APPROVED) {
            throw new RuntimeException("Event must be approved by admin before publishing");
        }
        event.setStatus(Event.EventStatus.PUBLISHED);
        return eventRepository.save(event);
    }

    @Transactional
    public Event updateEvent(Long id, EventRequest request) {
        Event event = getEventById(id);
        
        event.setName(request.getName());
        event.setDescription(request.getDescription());
        event.setDate(request.getDate());
        event.setVenue(request.getVenue());
        event.setCategory(request.getCategory());
        event.setBannerImage(request.getBannerImage());

        // Simple ticket update logic: 
        // In a real app, we would match by ID. Here we assume names are unique or just add new ones?
        // For safety in this demo, we will NOT delete existing ticket types to prevent data loss.
        // We will add new ones found in request.
        
        List<TicketType> currentTypes = event.getTicketTypes();
        for (EventRequest.TicketTypeRequest tReq : request.getTicketTypes()) {
            boolean exists = false;
            for (TicketType existing : currentTypes) {
                if (existing.getName().equalsIgnoreCase(tReq.getName())) { // Match by name
                    int oldQuantity = existing.getQuantity();
                    int newQuantity = tReq.getQuantity();
                    
                    existing.setPrice(tReq.getPrice());
                    existing.setQuantity(newQuantity);
                    
                    // Check for waitlist promotion logic
                    if (newQuantity > oldQuantity) {
                         int added = newQuantity - oldQuantity;
                         int promotedCount = 0;
                         for (int i = 0; i < added; i++) {
                             boolean promoted = waitlistService.tryPromoteNextWaiter(existing);
                             if (promoted) {
                                 promotedCount++;
                             }
                         }
                         if (promotedCount > 0) {
                              existing.setSold(existing.getSold() + promotedCount);
                         }
                    }
                    
                    exists = true;
                    break;
                }
            }
            if (!exists) {
                currentTypes.add(new TicketType(tReq.getName(), tReq.getPrice(), tReq.getQuantity(), event));
            }
        }
        
        // Remove logic is risky without IDs, skipping for this iteration unless asked.
        event.setTicketTypes(currentTypes);

        updateEventCommunication(event, request.getCommunication());

        return eventRepository.save(event);
    }

    public void deleteEvent(Long id) {
        eventRepository.deleteById(id);
    }

    public com.oop.EventTicketingSystem.payload.response.EventStatsResponse getEventStats(Long id) {
        Event event = getEventById(id);
        List<com.oop.EventTicketingSystem.model.Order> orders = orderRepository.findOrdersByEventId(id);
        
        java.math.BigDecimal totalRevenue = java.math.BigDecimal.ZERO;
        java.util.Map<String, java.math.BigDecimal> dailySalesMap = new java.util.HashMap<>();
        java.util.Map<Integer, java.math.BigDecimal> hourlySalesMap = new java.util.HashMap<>();
        
        for (com.oop.EventTicketingSystem.model.Order order : orders) {
             for (com.oop.EventTicketingSystem.model.OrderItem item : order.getOrderItems()) {
                 if (item.getTicketType().getEvent().getId().equals(id)) {
                     java.math.BigDecimal itemTotal = item.getPrice().multiply(java.math.BigDecimal.valueOf(item.getQuantity()));
                     totalRevenue = totalRevenue.add(itemTotal);
                     
                     String dateKey = order.getOrderDate().toLocalDate().toString();
                     dailySalesMap.put(dateKey, dailySalesMap.getOrDefault(dateKey, java.math.BigDecimal.ZERO).add(itemTotal));
                     
                     int hourKey = order.getOrderDate().getHour();
                     hourlySalesMap.put(hourKey, hourlySalesMap.getOrDefault(hourKey, java.math.BigDecimal.ZERO).add(itemTotal));
                 }
             }
        }
        
        int totalTicketsSold = event.getTicketTypes().stream().mapToInt(TicketType::getSold).sum();
        int totalTickets = event.getTicketTypes().stream().mapToInt(TicketType::getQuantity).sum();
        
        List<com.oop.EventTicketingSystem.payload.response.EventStatsResponse.DailySales> dailySales = new java.util.ArrayList<>();
        dailySalesMap.forEach((date, sales) -> dailySales.add(new com.oop.EventTicketingSystem.payload.response.EventStatsResponse.DailySales(date, sales)));
        dailySales.sort(java.util.Comparator.comparing(com.oop.EventTicketingSystem.payload.response.EventStatsResponse.DailySales::getDate));

        List<com.oop.EventTicketingSystem.payload.response.EventStatsResponse.HourlySales> hourlySales = new java.util.ArrayList<>();
        // Fill 0-23
        for (int i = 0; i < 24; i++) {
            hourlySales.add(new com.oop.EventTicketingSystem.payload.response.EventStatsResponse.HourlySales(i, hourlySalesMap.getOrDefault(i, java.math.BigDecimal.ZERO)));
        }

        List<com.oop.EventTicketingSystem.payload.response.EventStatsResponse.TicketTypeStat> ticketStats = event.getTicketTypes().stream()
            .map(tt -> new com.oop.EventTicketingSystem.payload.response.EventStatsResponse.TicketTypeStat(tt.getName(), tt.getSold(), tt.getQuantity()))
            .collect(java.util.stream.Collectors.toList());

        // Calculate new stats: attendance, refunds, cancellations
        long attendanceCount = ticketRepository.countByOrderItem_TicketType_Event_IdAndCheckInTimeIsNotNull(id);
        long refundedCount = ticketRepository.countByOrderItem_TicketType_Event_IdAndStatus(id, com.oop.EventTicketingSystem.model.Ticket.TicketStatus.REFUNDED);
        long cancelledCount = ticketRepository.countByOrderItem_TicketType_Event_IdAndStatus(id, com.oop.EventTicketingSystem.model.Ticket.TicketStatus.CANCELLED);
        long totalOrders = orderRepository.countOrdersByEventId(id);

        return new com.oop.EventTicketingSystem.payload.response.EventStatsResponse(
            totalRevenue, 
            totalTicketsSold, 
            totalTickets, 
            dailySales, 
            ticketStats, 
            hourlySales,
            attendanceCount,
            refundedCount,
            cancelledCount,
            totalOrders
        );
    }
    @Autowired
    private com.oop.EventTicketingSystem.repository.TicketRepository ticketRepository;

    public List<com.oop.EventTicketingSystem.model.Ticket> getEventAttendees(Long eventId) {
        return ticketRepository.findByOrderItem_TicketType_Event_Id(eventId);
    }
}
