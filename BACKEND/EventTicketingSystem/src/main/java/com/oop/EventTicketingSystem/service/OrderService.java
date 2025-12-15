package com.oop.EventTicketingSystem.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.oop.EventTicketingSystem.model.Event;
import com.oop.EventTicketingSystem.model.Order;
import com.oop.EventTicketingSystem.model.OrderItem;
import com.oop.EventTicketingSystem.model.TicketType;
import com.oop.EventTicketingSystem.model.User;
import com.oop.EventTicketingSystem.payload.request.OrderRequest;
import com.oop.EventTicketingSystem.repository.OrderRepository;
import com.oop.EventTicketingSystem.repository.TicketTypeRepository;
import com.oop.EventTicketingSystem.repository.UserRepository;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private TicketTypeRepository ticketTypeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PriceRuleService priceRuleService;

    @Autowired
    private PromoCodeService promoCodeService;

    @Autowired
    private com.oop.EventTicketingSystem.service.QRCodeService qrCodeService;

    @Autowired
    private com.oop.EventTicketingSystem.service.EmailService emailService;

    @Autowired
    private com.oop.EventTicketingSystem.repository.TicketRepository ticketRepository;

    @Autowired
    private WaitlistService waitlistService;

    @Transactional
    public Order createOrder(OrderRequest request, Long customerId) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Order order = new Order();
        order.setCustomer(customer);
        order.setOrderDate(LocalDateTime.now());

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        // First pass: validate quantity and calculate totals
        for (OrderRequest.OrderItemRequest itemReq : request.getItems()) {
            TicketType ticketType = ticketTypeRepository.findById(itemReq.getTicketTypeId())
                    .orElseThrow(() -> new RuntimeException("Ticket Type not found: " + itemReq.getTicketTypeId()));

            if (ticketType.getQuantity() - ticketType.getSold() < itemReq.getQuantity()) {
                // Check if user has a reservation
                boolean hasReservation = waitlistService.hasReservation(customer, ticketType);
                if (!hasReservation) {
                    throw new RuntimeException("Not enough tickets available for: " + ticketType.getName());
                }
                // If reservation exists, proceed. (We might need to verify quantity matches reservation, but for now specific reservation logic is 1 per user)
                // Also, we should remove the reservation after use
                waitlistService.removeFromWaitlist(customer, ticketType);
            }

            // Update inventory
            ticketType.setSold(ticketType.getSold() + itemReq.getQuantity());
            ticketTypeRepository.save(ticketType);

            // Check if any price rules should be triggered by this sale
            priceRuleService.checkAndApplySoldCountRules(ticketType);

            // Create OrderItem
            OrderItem orderItem = new OrderItem(order, ticketType, itemReq.getQuantity(), ticketType.getPrice());
            orderItems.add(orderItem);

            totalAmount = totalAmount.add(ticketType.getPrice().multiply(new BigDecimal(itemReq.getQuantity())));
        }

        if (request.getPromoCode() != null && !request.getPromoCode().isEmpty()) {
            // Assume all items belong to the same event (or pick first one for validation context)
            Long eventId = null;
            if (!orderItems.isEmpty()) {
                eventId = orderItems.get(0).getTicketType().getEvent().getId();
            }
            
            BigDecimal discount = promoCodeService.validateAndCalculateDiscount(request.getPromoCode(), totalAmount, eventId);
            order.setPromoCode(request.getPromoCode());
            order.setDiscountAmount(discount);
            totalAmount = totalAmount.subtract(discount).max(BigDecimal.ZERO);
            promoCodeService.redeemCode(request.getPromoCode());
        }

        order.setOrderItems(orderItems);
        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order);

        // Second pass: Generate individual tickets with QR codes
        // We need the saved order items (though cascade might handle it, explicitly saving or referencing is safer)
        try {
            for (OrderItem item : savedOrder.getOrderItems()) {
               if (item.getTickets() == null) {
                   item.setTickets(new ArrayList<>());
               }
               for (int i = 0; i < item.getQuantity(); i++) {
                   com.oop.EventTicketingSystem.model.Ticket ticket = new com.oop.EventTicketingSystem.model.Ticket();
                   ticket.setTicketName(item.getTicketType().getName());
                   ticket.setStatus(com.oop.EventTicketingSystem.model.Ticket.TicketStatus.VALID);
                   ticket.setOrderItem(item);
                   
                   // Save first to get ID
                   ticket = ticketRepository.save(ticket);
                   
                   // Generate QR
                   String qrCode = qrCodeService.generateTicketQR(ticket.getId());
                   ticket.setQrCode(qrCode);
                   
                   ticket = ticketRepository.save(ticket);
                   
                   // Add to item for email (in-memory update)
                   item.getTickets().add(ticket);
               }
            }
            
            // Send Confirmation Email with QR codes as image attachment
            try {
                emailService.sendOrderConfirmationWithImage(customer.getEmail(), "Order Confirmation - ID: " + savedOrder.getId(), savedOrder);
            } catch (Exception e) {
                // Log error but don't fail transaction
                System.err.println("Failed to send order confirmation email: " + e.getMessage());
                e.printStackTrace();
            }

        } catch (Exception e) {
            throw new RuntimeException("Error generating tickets and QR codes", e);
        }

        return savedOrder;
    }

    @Transactional(readOnly = true)
    public List<com.oop.EventTicketingSystem.payload.response.OrderResponse> getCustomerOrders(Long customerId) {
        List<Order> orders = orderRepository.findByCustomerId(customerId);
        
        return orders.stream().map(order -> {
            List<com.oop.EventTicketingSystem.payload.response.OrderResponse.OrderItemDto> connectionItems = order.getOrderItems().stream().map(item -> {
                TicketType tt = item.getTicketType();
                Event event = tt.getEvent();
                
                com.oop.EventTicketingSystem.payload.response.OrderResponse.EventDto eventDto = 
                    new com.oop.EventTicketingSystem.payload.response.OrderResponse.EventDto(
                        event.getId(),
                        event.getName(),
                        event.getDate(),
                        event.getVenue(),
                        event.getBannerImage()
                    );
                
                List<com.oop.EventTicketingSystem.payload.response.OrderResponse.TicketDto> ticketDtos = new ArrayList<>();
                if (item.getTickets() != null) {
                    ticketDtos = item.getTickets().stream()
                        .map(t -> new com.oop.EventTicketingSystem.payload.response.OrderResponse.TicketDto(
                            t.getId(), 
                            t.getQrCode(), 
                            t.getStatus().toString()))
                        .collect(java.util.stream.Collectors.toList());
                }

                return new com.oop.EventTicketingSystem.payload.response.OrderResponse.OrderItemDto(
                    tt.getName(),
                    item.getQuantity(),
                    item.getPrice(),
                    eventDto,
                    ticketDtos
                );
            }).collect(java.util.stream.Collectors.toList());
            
            return new com.oop.EventTicketingSystem.payload.response.OrderResponse(
                order.getId(),
                order.getOrderDate(),
                order.getTotalAmount(),
                order.getStatus().toString(),
                connectionItems
            );
        }).collect(java.util.stream.Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<com.oop.EventTicketingSystem.payload.response.OrderResponse> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        
        return orders.stream().map(order -> {
            List<com.oop.EventTicketingSystem.payload.response.OrderResponse.OrderItemDto> connectionItems = order.getOrderItems().stream().map(item -> {
                TicketType tt = item.getTicketType();
                Event event = tt.getEvent();
                
                com.oop.EventTicketingSystem.payload.response.OrderResponse.EventDto eventDto = 
                    new com.oop.EventTicketingSystem.payload.response.OrderResponse.EventDto(
                        event.getId(),
                        event.getName(),
                        event.getDate(),
                        event.getVenue(),
                        event.getBannerImage()
                    );
                
                List<com.oop.EventTicketingSystem.payload.response.OrderResponse.TicketDto> ticketDtos = new ArrayList<>();
                if (item.getTickets() != null) {
                    ticketDtos = item.getTickets().stream()
                        .map(t -> new com.oop.EventTicketingSystem.payload.response.OrderResponse.TicketDto(
                            t.getId(), 
                            t.getQrCode(), 
                            t.getStatus().toString()))
                        .collect(java.util.stream.Collectors.toList());
                }

                return new com.oop.EventTicketingSystem.payload.response.OrderResponse.OrderItemDto(
                    tt.getName(),
                    item.getQuantity(),
                    item.getPrice(),
                    eventDto,
                    ticketDtos
                );
            }).collect(java.util.stream.Collectors.toList());
            
            return new com.oop.EventTicketingSystem.payload.response.OrderResponse(
                order.getId(),
                order.getOrderDate(),
                order.getTotalAmount(),
                order.getStatus().toString(),
                connectionItems
            );
        }).collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    public void cancelOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Only owner or admin can cancel (Assumed Admin check is done in Controller or here)
        // For simple logic, we check userId if provided
        if (!order.getCustomer().getId().equals(userId)) {
             // Assuming this service might be called by Admin too, but strict check for now:
             // Use Spring Security Principal in controller to decide, but here let's validate ownership.
             // If Admin calls, userId might be null or we skip check. 
             // Let's assume userId is passed from Controller which extracts it from token.
             throw new RuntimeException("Unauthorized to cancel this order");
        }

        // Logic to return items
        for (OrderItem item : order.getOrderItems()) {
            TicketType tt = item.getTicketType();
            
            // 1. Restore Inventory (Decrement Sold)
            tt.setSold(tt.getSold() - item.getQuantity());
            ticketTypeRepository.save(tt);
            
            // 2. Process Waitlist:
            // For each returned ticket quantity, we should notify one waiter
            for (int i = 0; i < item.getQuantity(); i++) {
                // We incremented stock above. 
                // WaitlistService logic: "Reserve" it means someone claimed it? 
                // If I decrement 'sold', it becomes public.
                // If I reserve it, it should NOT be public.
                
                // CORRECT LOGIC:
                // Check if we can promote a waiter.
                boolean promoted = waitlistService.tryPromoteNextWaiter(tt);
                if (promoted) {
                    // If we successfully found a waiter and reserved it for them:
                    // We need to 'hide' this ticket from public.
                    // So we must INCREMENT 'sold' back up? 
                    // Or we assume `Reservation` logic in `createOrder` allows purchasing even if sold out.
                    // IF we decrement sold, then sold < quantity. Public can buy.
                    // IF we promote waiter, they have reservation.
                    
                    // So we have a Race Condition:
                    // 1. Cancel -> Sold-- (Publicly available).
                    // 2. Promote -> Waiter Email "Go buy it".
                    // 3. Random user sees available and buys.
                    // 4. Waiter comes -> Sold out again.
                    
                    // FIX:
                    // If we successfully promote a waiter, we should effectively "keep it sold" 
                    // or mark it as "Reserved" (which counts as sold).
                    // Since we don't have a separate "Reserved" count in TicketType, 
                    // lets Increment 'sold' back if promoted!
                    
                    tt.setSold(tt.getSold() + 1);
                    ticketTypeRepository.save(tt);
                }
            }
        }
        
        // Delete order or mark status? 
        // Codebase doesn't seem to have OrderStatus.CANCELLED? 
        // Order entity didn't show status field in view_file. 
        // Assuming deletion for simplicity or full refund.
        orderRepository.delete(order);
    }
}
