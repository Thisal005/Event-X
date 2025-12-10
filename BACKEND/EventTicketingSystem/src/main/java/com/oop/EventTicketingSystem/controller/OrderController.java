package com.oop.EventTicketingSystem.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
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
@CrossOrigin(origins = "http://localhost:5173")
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
}
