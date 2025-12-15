package com.oop.EventTicketingSystem.service;

import com.oop.EventTicketingSystem.payload.EventPulseStats;
import com.oop.EventTicketingSystem.repository.OrderRepository;
import com.oop.EventTicketingSystem.model.Order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;
import org.springframework.web.socket.messaging.SessionUnsubscribeEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class EventPulseService {

    private final SimpMessagingTemplate messagingTemplate;
    private final OrderRepository orderRepository;

    // Map of eventId -> Set of sessionIds subscribed
    private final ConcurrentHashMap<Long, Set<String>> eventViewers = new ConcurrentHashMap<>();
    
    // Map of sessionId -> eventId (for cleanup on disconnect)
    private final ConcurrentHashMap<String, Long> sessionToEvent = new ConcurrentHashMap<>();

    @Autowired
    public EventPulseService(SimpMessagingTemplate messagingTemplate, OrderRepository orderRepository) {
        this.messagingTemplate = messagingTemplate;
        this.orderRepository = orderRepository;
    }

    @EventListener
    public void handleSubscribeEvent(SessionSubscribeEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String destination = accessor.getDestination();
        String sessionId = accessor.getSessionId();

        if (destination != null && destination.startsWith("/topic/event/") && destination.endsWith("/stats")) {
            try {
                // Extract eventId from /topic/event/{id}/stats
                String[] parts = destination.split("/");
                if (parts.length >= 4) {
                    Long eventId = Long.parseLong(parts[3]);
                    
                    eventViewers.computeIfAbsent(eventId, k -> ConcurrentHashMap.newKeySet()).add(sessionId);
                    sessionToEvent.put(sessionId, eventId);
                    
                    System.out.println("[LivePulse] User subscribed to event " + eventId + ". Viewers: " + eventViewers.get(eventId).size());
                }
            } catch (NumberFormatException e) {
                // Ignore invalid event IDs
            }
        }
    }

    @EventListener
    public void handleUnsubscribeEvent(SessionUnsubscribeEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();
        
        removeViewer(sessionId);
    }

    @EventListener
    public void handleDisconnectEvent(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();
        
        removeViewer(sessionId);
    }

    private void removeViewer(String sessionId) {
        Long eventId = sessionToEvent.remove(sessionId);
        if (eventId != null) {
            Set<String> viewers = eventViewers.get(eventId);
            if (viewers != null) {
                viewers.remove(sessionId);
                System.out.println("[LivePulse] User left event " + eventId + ". Viewers: " + viewers.size());
                if (viewers.isEmpty()) {
                    eventViewers.remove(eventId);
                }
            }
        }
    }

    @Scheduled(fixedRate = 3000) // Push stats every 3 seconds
    public void broadcastPulseStats() {
        for (Long eventId : eventViewers.keySet()) {
            Set<String> viewers = eventViewers.get(eventId);
            if (viewers == null || viewers.isEmpty()) {
                continue;
            }

            int viewerCount = viewers.size();
            
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime oneMinuteAgo = now.minusMinutes(1);
            LocalDateTime tenMinutesAgo = now.minusMinutes(10);

            int salesLastMinute = orderRepository.countTicketsSoldSince(eventId, oneMinuteAgo);
            int salesLast10Minutes = orderRepository.countTicketsSoldSince(eventId, tenMinutesAgo);

            // Build sparkline data: sales per minute for last 10 minutes
            List<Integer> sparklineData = buildSparklineData(eventId, tenMinutesAgo, now);

            EventPulseStats stats = new EventPulseStats(viewerCount, salesLastMinute, salesLast10Minutes, sparklineData);
            
            messagingTemplate.convertAndSend("/topic/event/" + eventId + "/stats", stats);
        }
    }

    private List<Integer> buildSparklineData(Long eventId, LocalDateTime from, LocalDateTime to) {
        List<Order> recentOrders = orderRepository.findOrdersByEventIdSince(eventId, from);
        
        // Create 10 buckets, one for each minute
        int[] buckets = new int[10];
        
        for (Order order : recentOrders) {
            LocalDateTime orderDate = order.getOrderDate();
            long minutesAgo = java.time.Duration.between(orderDate, to).toMinutes();
            
            // minutesAgo 0-1 -> bucket 9, 1-2 -> bucket 8, etc.
            int bucketIndex = 9 - (int) Math.min(minutesAgo, 9);
            
            // Sum up the quantity from orderItems
            int quantity = order.getOrderItems().stream().mapToInt(oi -> oi.getQuantity()).sum();
            buckets[bucketIndex] += quantity;
        }

        List<Integer> result = new ArrayList<>();
        for (int bucket : buckets) {
            result.add(bucket);
        }
        return result;
    }

    // Manually trigger a pulse update (e.g., after a sale)
    public void triggerPulseUpdate(Long eventId) {
        if (!eventViewers.containsKey(eventId)) {
            return; // No one is watching
        }
        // The scheduled task will pick it up, or we can force an immediate push
        // For now, we rely on the scheduler.
    }
}
