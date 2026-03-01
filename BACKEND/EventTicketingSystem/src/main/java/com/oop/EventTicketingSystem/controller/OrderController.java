package com.oop.EventTicketingSystem.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.oop.EventTicketingSystem.model.Order;
import com.oop.EventTicketingSystem.payload.request.OrderRequest;
import com.oop.EventTicketingSystem.security.UserPrincipal;
import com.oop.EventTicketingSystem.service.OrderService;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private com.oop.EventTicketingSystem.service.PromoCodeService promoCodeService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<Order> createOrder(@RequestBody OrderRequest orderRequest, 
                                           @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Long customerId = userPrincipal.getId();
        return ResponseEntity.ok(orderService.createOrder(orderRequest, customerId));
    }

    @PostMapping("/cancel/{id}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<?> cancelOrder(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            orderService.cancelOrder(id, userPrincipal.getId());
            return ResponseEntity.ok("Order cancelled successfully.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/validate-coupon")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<?> validateCoupon(@RequestParam String code, @RequestParam java.math.BigDecimal amount, @RequestParam Long eventId) {
        try {
            java.math.BigDecimal discount = promoCodeService.validateAndCalculateDiscount(code, amount, eventId);
            return ResponseEntity.ok(java.util.Map.of(
                "valid", true,
                "discountAmount", discount,
                "newTotal", amount.subtract(discount).max(java.math.BigDecimal.ZERO)
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("valid", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/my-orders")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public List<com.oop.EventTicketingSystem.payload.response.OrderResponse> getMyOrders(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        Long customerId = userPrincipal.getId();
        return orderService.getCustomerOrders(customerId);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<com.oop.EventTicketingSystem.payload.response.OrderResponse> getAllOrders() {
        return orderService.getAllOrders();
    }
    @Autowired
    private com.oop.EventTicketingSystem.service.EmailService emailService;

    @Autowired
    private com.oop.EventTicketingSystem.repository.OrderRepository orderRepository;

    @PostMapping("/email-tickets")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<?> sendTicketEmail(@RequestParam("files") org.springframework.web.multipart.MultipartFile[] files,
                                           @RequestParam("ticketIds") Long[] ticketIds,
                                           @RequestParam("orderId") Long orderId,
                                           @AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
            
            // Check ownership
            if (!order.getCustomer().getId().equals(userPrincipal.getId()) && 
                !userPrincipal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                return ResponseEntity.status(403).body("Unauthorized to access this order");
            }

            java.util.Map<Long, byte[]> ticketImages = new java.util.HashMap<>();
            // Match files to ticketIds (assuming order is preserved in frontend FormData append order)
            if (files.length == ticketIds.length) {
                for (int i = 0; i < files.length; i++) {
                     ticketImages.put(ticketIds[i], files[i].getBytes());
                }
            } else {
                 return ResponseEntity.badRequest().body("Mismatch between files and ticket IDs");
            }
            
            emailService.sendOrderConfirmationEmail(userPrincipal.getEmail(), "Order Confirmation - ID: " + orderId, order, ticketImages);
            
            return ResponseEntity.ok("Order confirmation email sent successfully.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to send email: " + e.getMessage());
        }
    }
}
