package com.oop.EventTicketingSystem.scheduler;

import com.oop.EventTicketingSystem.model.Event;
import com.oop.EventTicketingSystem.payload.response.EventStatsResponse;
import com.oop.EventTicketingSystem.repository.EventRepository;
import com.oop.EventTicketingSystem.service.EventService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Scheduler that broadcasts event statistics via WebSocket for real-time updates.
 * Admins can "watch" events and receive stats every 10 seconds.
 */
@Component
@EnableScheduling
public class EventStatsScheduler {

    private static final Logger logger = LoggerFactory.getLogger(EventStatsScheduler.class);

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private EventService eventService;

    @Autowired
    private EventRepository eventRepository;

    // Track which events are being watched (subscribed to)
    private final Set<Long> watchedEventIds = ConcurrentHashMap.newKeySet();

    /**
     * Add an event to the watch list for real-time stats broadcasting.
     */
    public void watchEvent(Long eventId) {
        watchedEventIds.add(eventId);
        logger.info("Started watching event {} for real-time stats", eventId);
    }

    /**
     * Remove an event from the watch list.
     */
    public void unwatchEvent(Long eventId) {
        watchedEventIds.remove(eventId);
        logger.info("Stopped watching event {}", eventId);
    }

    /**
     * Broadcast stats every 10 seconds for watched events.
     */
    @Scheduled(fixedRate = 300000) // 5 minutes
    public void broadcastEventStats() {
        if (watchedEventIds.isEmpty()) {
            return; // No events being watched
        }

        for (Long eventId : watchedEventIds) {
            try {
                EventStatsResponse stats = eventService.getEventStats(eventId);
                messagingTemplate.convertAndSend("/topic/event/" + eventId + "/stats", stats);
                logger.debug("Broadcasted stats for event {}", eventId);
            } catch (Exception e) {
                logger.error("Failed to broadcast stats for event {}: {}", eventId, e.getMessage());
                // Remove invalid event from watch list
                watchedEventIds.remove(eventId);
            }
        }
    }

    /**
     * Also broadcast stats for recent/active events periodically (every 30 seconds).
     * This is for the admin overview dashboard showing live activity.
     */
    @Scheduled(fixedRate = 600000) // 10 minutes
    public void broadcastActiveEventsSummary() {
        try {
            // Get events happening within the next week or in the past week
            LocalDateTime now = LocalDateTime.now();
            List<Event> activeEvents = eventRepository.findByStatusAndApprovalStatus(
                Event.EventStatus.PUBLISHED, 
                Event.ApprovalStatus.APPROVED
            );

            // Filter to recent/upcoming events (within 7 days)
            List<Event> recentEvents = activeEvents.stream()
                .filter(e -> {
                    LocalDateTime eventDate = e.getDate();
                    return eventDate.isAfter(now.minusDays(7)) && eventDate.isBefore(now.plusDays(7));
                })
                .limit(10) // Max 10 events for overview
                .toList();

            // Broadcast summary for each recent event
            for (Event event : recentEvents) {
                try {
                    EventStatsResponse stats = eventService.getEventStats(event.getId());
                    messagingTemplate.convertAndSend("/topic/event/" + event.getId() + "/stats", stats);
                } catch (Exception e) {
                    logger.warn("Could not broadcast stats for event {}: {}", event.getId(), e.getMessage());
                }
            }
        } catch (Exception e) {
            logger.error("Failed to broadcast active events summary: {}", e.getMessage());
        }
    }

    /**
     * Get currently watched event IDs.
     */
    public Set<Long> getWatchedEventIds() {
        return Set.copyOf(watchedEventIds);
    }
}
