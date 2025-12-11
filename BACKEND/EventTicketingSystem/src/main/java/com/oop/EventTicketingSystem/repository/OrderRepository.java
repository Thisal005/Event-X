package com.oop.EventTicketingSystem.repository;

import com.oop.EventTicketingSystem.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerId(Long customerId);

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT o FROM Order o JOIN o.orderItems oi JOIN oi.ticketType tt WHERE tt.event.id = :eventId")
    List<Order> findOrdersByEventId(@org.springframework.data.repository.query.Param("eventId") Long eventId);
}
