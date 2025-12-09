package com.oop.EventTicketingSystem.controller;

import com.oop.EventTicketingSystem.model.Order;
import com.oop.EventTicketingSystem.payload.request.OrderRequest;
import com.oop.EventTicketingSystem.security.UserPrincipal;
import com.oop.EventTicketingSystem.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:5173")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Order> createOrder(@RequestBody OrderRequest orderRequest, 
                                           @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Long customerId = Long.parseLong(userPrincipal.getName());
        return ResponseEntity.ok(orderService.createOrder(orderRequest, customerId));
    }

    @GetMapping("/my-orders")
    @PreAuthorize("hasRole('CUSTOMER')")
    public List<com.oop.EventTicketingSystem.payload.response.OrderResponse> getMyOrders(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        Long customerId = Long.parseLong(userPrincipal.getName());
        return orderService.getCustomerOrders(customerId);
    }
}
