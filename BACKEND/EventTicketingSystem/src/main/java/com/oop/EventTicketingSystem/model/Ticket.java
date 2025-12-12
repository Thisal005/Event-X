package com.oop.EventTicketingSystem.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;

@Entity
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String ticketName;

    @Enumerated(EnumType.STRING)
    private TicketStatus status = TicketStatus.VALID;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String qrCode;

    private LocalDateTime checkInTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_item_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"tickets", "order", "hibernateLazyInitializer", "handler"})
    private OrderItem orderItem;

    public enum TicketStatus {
        VALID, USED, REFUNDED, CANCELLED
    }

    public Ticket() {
    }

    public Ticket(String ticketName, TicketStatus status) {
        this.ticketName = ticketName;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTicketName() {
        return ticketName;
    }

    public void setTicketName(String ticketName) {
        this.ticketName = ticketName;
    }

    public TicketStatus getStatus() {
        return status;
    }

    public void setStatus(TicketStatus status) {
        this.status = status;
    }

    public String getQrCode() {
        return qrCode;
    }

    public void setQrCode(String qrCode) {
        this.qrCode = qrCode;
    }

    public LocalDateTime getCheckInTime() {
        return checkInTime;
    }

    public void setCheckInTime(LocalDateTime checkInTime) {
        this.checkInTime = checkInTime;
    }

    public OrderItem getOrderItem() {
        return orderItem;
    }

    public void setOrderItem(OrderItem orderItem) {
        this.orderItem = orderItem;
    }

    @Override
    public String toString() {
        return "Ticket{" +
                "id=" + id +
                ", ticketName='" + ticketName + '\'' +
                ", status=" + status +
                ", qrCode='" + (qrCode != null ? "PRESENT" : "NULL") + '\'' +
                ", checkInTime=" + checkInTime +
                '}';
    }
}
