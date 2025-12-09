package com.oop.EventTicketingSystem.controller;

import com.oop.EventTicketingSystem.model.TicketPool;
import com.oop.EventTicketingSystem.service.TicketPoolService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tickets")
public class TicketPoolController {

    private final TicketPoolService ticketPoolService;

    @Autowired
    public TicketPoolController(TicketPoolService ticketPoolService) {
        this.ticketPoolService = ticketPoolService;
    }

    @PostMapping("/startVendor")
    public String startVendor(@RequestParam String vendorID, @RequestParam int ticketsToAdd) {
        // Check if the system is initialized
        if (ticketPoolService.getConfiguration() == null) {
            return "System is not initialized. Please start the system with a configuration first.";
        }
        // Add tickets to the ticket pool for the specified vendor
        ticketPoolService.startVendor(vendorID, ticketsToAdd);
        // Return a success message
        return "Vendor " + vendorID + " started with " + ticketsToAdd + " tickets.";
    }

    @PostMapping("/startCustomer")
    public String startCustomer(@RequestParam String customerID, @RequestParam int noOfTickets) {
        // Check if the system is initialized
        if (ticketPoolService.getConfiguration() == null) {
            return "System is not initialized. Please start the system with a configuration first.";
        }
        // Remove tickets from the ticket pool for the specified customer
        ticketPoolService.startCustomer(customerID, noOfTickets);
        // Return a success message
        return "Customer " + customerID + " started to retrieve " + noOfTickets + " tickets.";
    }

    @GetMapping("/remaining-capacity")
    public int getRemainingCapacity() {
        // Check if the system is initialized
        if (ticketPoolService.getConfiguration() == null) {
            throw new IllegalStateException("System is not initialized. Please start the system with a configuration first.");
        }
        // Return the remaining capacity of the ticket pool
        return ticketPoolService.getRemainingCapacity();
    }


    @GetMapping("/maxTickets")
    public int getMaxTickets() {
        // Check if the system is initialized
        if (ticketPoolService.getConfiguration() == null) {
            throw new IllegalStateException("System is not initialized. Please start the system with a configuration first.");
        }
        // Return the maximum ticket capacity of the ticket pool
        return ticketPoolService.getMaxTicketCapacity();
    }

    @GetMapping("/total-tickets")
    public int getTotalTickets() {
        // Check if the system is initialized
        if (ticketPoolService.getConfiguration() == null) {
            throw new IllegalStateException("System is not initialized. Please start the system with a configuration first.");
        }
        // Return the total number of tickets in the ticket pool
        return ticketPoolService.getTotalTickets();
    }

    @GetMapping("/total-sales")
    public int getSales() {
        // Check if the system is initialized
        if (ticketPoolService.getConfiguration() == null) {
            throw new IllegalStateException("System is not initialized. Please start the system with a configuration first.");
        }
        // Return the total number of ticket sales
        return ticketPoolService.getSales();
    }
}