package com.oop.EventTicketingSystem.repository;

import com.oop.EventTicketingSystem.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerId(Long customerId);

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT o FROM Order o JOIN o.orderItems oi JOIN oi.ticketType tt WHERE tt.event.id = :eventId")
    List<Order> findOrdersByEventId(@org.springframework.data.repository.query.Param("eventId") Long eventId);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(oi.quantity), 0) FROM Order o JOIN o.orderItems oi JOIN oi.ticketType tt WHERE tt.event.id = :eventId AND o.orderDate >= :since")
    int countTicketsSoldSince(@org.springframework.data.repository.query.Param("eventId") Long eventId, @org.springframework.data.repository.query.Param("since") LocalDateTime since);

    @org.springframework.data.jpa.repository.Query("SELECT o FROM Order o JOIN o.orderItems oi JOIN oi.ticketType tt WHERE tt.event.id = :eventId AND o.orderDate >= :since ORDER BY o.orderDate ASC")
    List<Order> findOrdersByEventIdSince(@org.springframework.data.repository.query.Param("eventId") Long eventId, @org.springframework.data.repository.query.Param("since") LocalDateTime since);

    // Count total orders for an event
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT o) FROM Order o JOIN o.orderItems oi JOIN oi.ticketType tt WHERE tt.event.id = :eventId")
    long countOrdersByEventId(@org.springframework.data.repository.query.Param("eventId") Long eventId);

    // Count orders by status for an event
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT o) FROM Order o JOIN o.orderItems oi JOIN oi.ticketType tt WHERE tt.event.id = :eventId AND o.status = :status")
    long countOrdersByEventIdAndStatus(@org.springframework.data.repository.query.Param("eventId") Long eventId, @org.springframework.data.repository.query.Param("status") com.oop.EventTicketingSystem.model.Order.OrderStatus status);
}
