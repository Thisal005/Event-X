package com.oop.EventTicketingSystem.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class TicketPool {
    private int maxTicketCapacity;
    private int totalTickets = 0;
    private int ticketsAdded = 0;
    private int sales = 0;
    public Configuration configuration;
    private final List<String> tickets;

    private final com.oop.EventTicketingSystem.repository.TicketRepository ticketRepository;

    public TicketPool(int maxTicketCapacity, com.oop.EventTicketingSystem.repository.TicketRepository ticketRepository) {
        this.maxTicketCapacity = maxTicketCapacity;
        this.ticketRepository = ticketRepository;
        this.tickets = null; // Unused in DB mode but keeping field if referenced elsewhere (checking below)
        // actually tickets field is used in logic, we should use DB count instead
    }

    public void setMaxTicketCapacity(int maxTicketCapacity) {
        this.maxTicketCapacity = maxTicketCapacity;
    }

    public int getMaxTicketCapacity() {
        return maxTicketCapacity;
    }

    public void addInitialTickets(int ticketsToAdd) {
        synchronized (this) {
            if (ticketsToAdd > maxTicketCapacity) {
                System.out.println("Cannot add initial tickets. Maximum capacity exceeded!");
                return;
            }

            for (int i = 0; i < ticketsToAdd; i++) {
                com.oop.EventTicketingSystem.model.Ticket ticket = new com.oop.EventTicketingSystem.model.Ticket("Ticket No: " + (totalTickets + 1), com.oop.EventTicketingSystem.model.Ticket.TicketStatus.VALID);
                ticketRepository.save(ticket);
                totalTickets++;
                ticketsAdded++;
            }

            System.out.println("Initial tickets added: " + ticketsToAdd);
        }
    }

    public void addTickets(int count) {
        synchronized (this) {
            // Case 1: If vendor tries to add more tickets than remaining capacity
            if (ticketsAdded + count > maxTicketCapacity) {
                int allowedTickets = maxTicketCapacity - ticketsAdded;

                // Add allowed tickets
                for (int j = 0; j < allowedTickets; j++) {
                    com.oop.EventTicketingSystem.model.Ticket ticket = new com.oop.EventTicketingSystem.model.Ticket("Ticket No: " + (totalTickets + 1), com.oop.EventTicketingSystem.model.Ticket.TicketStatus.VALID);
                    ticketRepository.save(ticket);
                    totalTickets++;
                    ticketsAdded = (int) ticketRepository.count(); // Sync with DB
                }

                // Show error message for tickets that couldn't be added
                System.out.println("Only " + allowedTickets + " tickets added. " +
                        (count - allowedTickets) + " tickets could not be added due to capacity limit.");
                return;
            }

            // Case 2 & 3: Check if total tickets added would exceed max capacity
            if (ticketsAdded == maxTicketCapacity) {
                System.out.println("Cannot add more tickets. Maximum ticket capacity reached!");
                return;
            }

            // Normal ticket addition
            for (int i = 0; i < count; i++) {
                com.oop.EventTicketingSystem.model.Ticket ticket = new com.oop.EventTicketingSystem.model.Ticket("Ticket No: " + (totalTickets + 1), com.oop.EventTicketingSystem.model.Ticket.TicketStatus.VALID);
                ticketRepository.save(ticket);
                totalTickets++;
                ticketsAdded++;
            }

            System.out.println("Added " + count + " tickets.");
            notifyAll();
        }
    }

    public boolean removeTickets(int count) {
        synchronized (this) {
            long availableTickets = ticketRepository.count();
            while (count > availableTickets) {
                if (ticketsAdded >= maxTicketCapacity) {
                    System.out.println("Sorry! There are no more tickets available.");
                    return false;
                }

                try {
                    wait();
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return false;
                }
                availableTickets = ticketRepository.count();
            }

            // Remove tickets (Simulate buy)
            java.util.List<com.oop.EventTicketingSystem.model.Ticket> available = ticketRepository.findAll();
            // This is simple but inefficient, ideally use a Custom Query to delete top N
            for (int i = 0; i < count && i < available.size(); i++) {
                ticketRepository.delete(available.get(i));
                totalTickets--;
                sales++;
            }
            notifyAll();
            return true;
        }
    }

    public int getRemainingCapacity() {
        return maxTicketCapacity - ticketsAdded;
    }

    public int getTotalTickets() {
        return totalTickets;
    }

    public int getSales() {
        return sales;
    }

    public int getTicketsAdded() {
        return ticketsAdded;
    }
}