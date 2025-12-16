package com.oop.EventTicketingSystem.service;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.oop.EventTicketingSystem.model.Event;
import com.oop.EventTicketingSystem.model.Order;
import com.oop.EventTicketingSystem.model.OrderItem;
import com.oop.EventTicketingSystem.model.Ticket;
import com.oop.EventTicketingSystem.model.TicketType;
import com.oop.EventTicketingSystem.repository.EventRepository;
import com.oop.EventTicketingSystem.repository.OrderRepository;
import com.oop.EventTicketingSystem.repository.TicketRepository;
import com.oop.EventTicketingSystem.repository.TicketTypeRepository;

/**
 * Service responsible for handling automated refunds when events are cancelled or postponed.
 * This is a critical trust feature that ensures buyers receive refunds instantly when an event is cancelled.
 */
@Service
public class RefundService {

    private static final Logger logger = LoggerFactory.getLogger(RefundService.class);

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private TicketTypeRepository ticketTypeRepository;

    @Autowired
    private EmailService emailService;

    /**
     * Processes event cancellation:
     * 1. Sets event status to CANCELLED
     * 2. Refunds all orders associated with this event
     * 3. Sends notification emails to all buyers
     * 
     * @param eventId The event to cancel
     * @param organizerId The organizer making the request (for authorization)
     * @return Summary of the refund operation
     */
    @Transactional
    public RefundSummary processEventCancellation(Long eventId, Long organizerId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found: " + eventId));

        // Verify organizer owns this event
        if (!event.getOrganizer().getId().equals(organizerId)) {
            throw new RuntimeException("Unauthorized: You do not own this event");
        }

        // Prevent double-cancellation
        if (event.getStatus() == Event.EventStatus.CANCELLED) {
            throw new RuntimeException("Event is already cancelled");
        }

        // Update event status
        event.setStatus(Event.EventStatus.CANCELLED);
        eventRepository.save(event);

        // Process all refunds
        return processRefundsForEvent(event, "Event Cancelled by Organizer");
    }

    /**
     * Processes event postponement:
     * Option A: Refund all if refundAll is true
     * Option B: Keep tickets valid for new date (just update event date)
     * 
     * @param eventId The event to postpone
     * @param organizerId The organizer making the request
     * @param newDate The new event date (optional, can be null if TBD)
     * @param refundAll If true, refund all tickets. If false, tickets remain valid for new date
     * @return Summary of the operation
     */
    @Transactional
    public RefundSummary processEventPostponement(Long eventId, Long organizerId, LocalDateTime newDate, boolean refundAll) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found: " + eventId));

        // Verify organizer owns this event
        if (!event.getOrganizer().getId().equals(organizerId)) {
            throw new RuntimeException("Unauthorized: You do not own this event");
        }

        // Update event status to POSTPONED
        event.setStatus(Event.EventStatus.POSTPONED);
        
        if (newDate != null) {
            event.setDate(newDate);
        }
        
        eventRepository.save(event);

        if (refundAll) {
            // Refund all tickets
            RefundSummary summary = processRefundsForEvent(event, "Event Postponed - Full Refund");
            
            // Send postponement emails with refund info
            sendPostponementNotifications(event, true, newDate);
            
            return summary;
        } else {
            // Keep tickets valid - just notify buyers about new date
            sendPostponementNotifications(event, false, newDate);
            
            return new RefundSummary(0, 0, 0, "Event postponed. Tickets remain valid for new date.");
        }
    }

    /**
     * Internal method to process refunds for all orders of an event.
     * This is the core refund logic.
     */
    private RefundSummary processRefundsForEvent(Event event, String reason) {
        List<Order> orders = orderRepository.findOrdersByEventId(event.getId());
        
        int totalOrdersRefunded = 0;
        int totalTicketsRefunded = 0;
        double totalAmountRefunded = 0;

        for (Order order : orders) {
            // Skip already refunded orders
            if (order.getStatus() == Order.OrderStatus.REFUNDED) {
                continue;
            }

            try {
                // Process refund for this order
                processOrderRefund(order, event, reason);
                
                totalOrdersRefunded++;
                totalAmountRefunded += order.getTotalAmount().doubleValue();
                
                // Count tickets in this order for this specific event
                for (OrderItem item : order.getOrderItems()) {
                    if (item.getTicketType().getEvent().getId().equals(event.getId())) {
                        totalTicketsRefunded += item.getQuantity();
                    }
                }
                
            } catch (Exception e) {
                logger.error("Failed to process refund for order {}: {}", order.getId(), e.getMessage());
                // Continue processing other orders
            }
        }

        String message = String.format("Successfully refunded %d orders, %d tickets, totaling $%.2f",
                totalOrdersRefunded, totalTicketsRefunded, totalAmountRefunded);
        
        logger.info("Event {} cancellation complete: {}", event.getId(), message);
        
        return new RefundSummary(totalOrdersRefunded, totalTicketsRefunded, totalAmountRefunded, message);
    }

    /**
     * Processes refund for a single order.
     */
    private void processOrderRefund(Order order, Event event, String reason) {
        // Update order status
        order.setStatus(Order.OrderStatus.REFUNDED);
        order.setRefundDate(LocalDateTime.now());
        order.setRefundReason(reason);
        
        // Update all tickets in this order to REFUNDED status
        for (OrderItem item : order.getOrderItems()) {
            // Only refund tickets for the cancelled event (order might have tickets from other events)
            if (item.getTicketType().getEvent().getId().equals(event.getId())) {
                // Restore inventory
                TicketType ticketType = item.getTicketType();
                ticketType.setSold(ticketType.getSold() - item.getQuantity());
                ticketTypeRepository.save(ticketType);
                
                // Update individual ticket statuses
                if (item.getTickets() != null) {
                    for (Ticket ticket : item.getTickets()) {
                        ticket.setStatus(Ticket.TicketStatus.REFUNDED);
                        ticketRepository.save(ticket);
                    }
                }
            }
        }
        
        orderRepository.save(order);
        
        // Send refund notification email (async to not block the transaction)
        sendRefundNotificationAsync(order, event);
    }

    /**
     * Sends refund notification email asynchronously.
     */
    @Async
    public void sendRefundNotificationAsync(Order order, Event event) {
        try {
            String to = order.getCustomer().getEmail();
            String subject = "Event Cancelled – Your Refund Has Been Processed";
            
            String htmlBody = buildRefundEmailHtml(order, event);
            
            emailService.sendHtmlEmail(to, subject, htmlBody);
            
            logger.info("Refund notification sent to {} for order {}", to, order.getId());
        } catch (Exception e) {
            logger.error("Failed to send refund notification for order {}: {}", order.getId(), e.getMessage());
        }
    }

    /**
     * Sends postponement notifications to all ticket holders.
     */
    @Async
    public void sendPostponementNotifications(Event event, boolean isRefunded, LocalDateTime newDate) {
        List<Order> orders = orderRepository.findOrdersByEventId(event.getId());
        
        for (Order order : orders) {
            try {
                String to = order.getCustomer().getEmail();
                String subject = isRefunded 
                    ? "Event Postponed – Your Refund Has Been Processed"
                    : "Event Postponed – Your Tickets Remain Valid";
                
                String htmlBody = buildPostponementEmailHtml(order, event, isRefunded, newDate);
                
                emailService.sendHtmlEmail(to, subject, htmlBody);
                
            } catch (Exception e) {
                logger.error("Failed to send postponement notification for order {}: {}", order.getId(), e.getMessage());
            }
        }
    }

    /**
     * Builds HTML email content for refund notification.
     */
    private String buildRefundEmailHtml(Order order, Event event) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; background: #1a1a2e; color: #ffffff; margin: 0; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #16213e 0%%, #1a1a2e 100%%); border-radius: 16px; padding: 40px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
                    .header { text-align: center; margin-bottom: 30px; }
                    .header h1 { color: #e94560; margin: 0; font-size: 28px; }
                    .badge { display: inline-block; background: linear-gradient(135deg, #e94560, #ff6b6b); color: white; padding: 8px 20px; border-radius: 20px; font-weight: bold; margin: 20px 0; }
                    .details { background: rgba(255,255,255,0.05); border-radius: 12px; padding: 24px; margin: 20px 0; }
                    .details h3 { color: #0f3460; margin-top: 0; }
                    .row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1); }
                    .row:last-child { border-bottom: none; }
                    .label { color: #888; }
                    .value { color: #ffffff; font-weight: 600; }
                    .amount { font-size: 32px; color: #4ade80; text-align: center; margin: 20px 0; font-weight: bold; }
                    .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Event Cancelled</h1>
                        <div class="badge">FULL REFUND ISSUED</div>
                    </div>
                    
                    <p>We're sorry to inform you that the following event has been cancelled:</p>
                    
                    <div class="details">
                        <div class="row">
                            <span class="label">Event</span>
                            <span class="value">%s</span>
                        </div>
                        <div class="row">
                            <span class="label">Original Date</span>
                            <span class="value">%s</span>
                        </div>
                        <div class="row">
                            <span class="label">Order ID</span>
                            <span class="value">#%d</span>
                        </div>
                    </div>
                    
                    <div class="amount">$%.2f Refunded</div>
                    
                    <p style="text-align: center; color: #888;">
                        Your refund has been processed and will be returned to your original payment method within 1-5 business days.
                    </p>
                    
                    <div class="footer">
                        <p>Thank you for your understanding.</p>
                        <p>If you have any questions, please contact our support team.</p>
                    </div>
                </div>
            </body>
            </html>
            """,
            event.getName(),
            event.getDate().toString(),
            order.getId(),
            order.getTotalAmount().doubleValue()
        );
    }

    /**
     * Builds HTML email content for postponement notification.
     */
    private String buildPostponementEmailHtml(Order order, Event event, boolean isRefunded, LocalDateTime newDate) {
        String newDateStr = newDate != null ? newDate.toString() : "To Be Announced";
        String statusMessage = isRefunded 
            ? "Your full refund of $" + String.format("%.2f", order.getTotalAmount().doubleValue()) + " has been processed."
            : "Your tickets remain valid for the new date.";
        
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; background: #1a1a2e; color: #ffffff; margin: 0; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #16213e 0%%, #1a1a2e 100%%); border-radius: 16px; padding: 40px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
                    .header { text-align: center; margin-bottom: 30px; }
                    .header h1 { color: #f59e0b; margin: 0; font-size: 28px; }
                    .badge { display: inline-block; background: linear-gradient(135deg, #f59e0b, #fbbf24); color: #1a1a2e; padding: 8px 20px; border-radius: 20px; font-weight: bold; margin: 20px 0; }
                    .details { background: rgba(255,255,255,0.05); border-radius: 12px; padding: 24px; margin: 20px 0; }
                    .row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1); }
                    .row:last-child { border-bottom: none; }
                    .label { color: #888; }
                    .value { color: #ffffff; font-weight: 600; }
                    .new-date { font-size: 24px; color: #4ade80; text-align: center; margin: 20px 0; font-weight: bold; background: rgba(74, 222, 128, 0.1); padding: 16px; border-radius: 12px; }
                    .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Event Postponed</h1>
                        <div class="badge">%s</div>
                    </div>
                    
                    <p>The following event has been postponed:</p>
                    
                    <div class="details">
                        <div class="row">
                            <span class="label">Event</span>
                            <span class="value">%s</span>
                        </div>
                        <div class="row">
                            <span class="label">Original Date</span>
                            <span class="value">%s</span>
                        </div>
                        <div class="row">
                            <span class="label">Order ID</span>
                            <span class="value">#%d</span>
                        </div>
                    </div>
                    
                    <div class="new-date">New Date: %s</div>
                    
                    <p style="text-align: center; color: #888;">%s</p>
                    
                    <div class="footer">
                        <p>Thank you for your patience.</p>
                        <p>If you have any questions, please contact our support team.</p>
                    </div>
                </div>
            </body>
            </html>
            """,
            isRefunded ? "REFUND ISSUED" : "TICKETS VALID",
            event.getName(),
            event.getDate().toString(),
            order.getId(),
            newDateStr,
            statusMessage
        );
    }

    /**
     * Summary of the refund operation.
     */
    public static class RefundSummary {
        private final int ordersRefunded;
        private final int ticketsRefunded;
        private final double amountRefunded;
        private final String message;

        public RefundSummary(int ordersRefunded, int ticketsRefunded, double amountRefunded, String message) {
            this.ordersRefunded = ordersRefunded;
            this.ticketsRefunded = ticketsRefunded;
            this.amountRefunded = amountRefunded;
            this.message = message;
        }

        public int getOrdersRefunded() { return ordersRefunded; }
        public int getTicketsRefunded() { return ticketsRefunded; }
        public double getAmountRefunded() { return amountRefunded; }
        public String getMessage() { return message; }
    }
}
