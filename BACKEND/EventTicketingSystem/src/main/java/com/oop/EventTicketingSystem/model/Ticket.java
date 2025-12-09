package com.oop.EventTicketingSystem.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String ticketName;
    private String status; // e.g., "AVAILABLE", "SOLD"

    public Ticket() {
    }

    public Ticket(String ticketName, String status) {
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    @Override
    public String toString() {
        return "Ticket{" +
                "id=" + id +
                ", ticketName='" + ticketName + '\'' +
                ", status='" + status + '\'' +
                '}';
    }
}
