package com.oop.EventTicketingSystem.service;

import com.oop.EventTicketingSystem.model.Configuration;
import com.oop.EventTicketingSystem.model.Customer;
import com.oop.EventTicketingSystem.model.TicketPool;
import com.oop.EventTicketingSystem.model.Vendor;
import org.springframework.stereotype.Service;

@Service
public class TicketPoolService {

    private final TicketPool ticketPool;
    private Configuration configuration;
    private final com.oop.EventTicketingSystem.repository.TicketRepository ticketRepository;

    @org.springframework.beans.factory.annotation.Autowired
    public TicketPoolService(com.oop.EventTicketingSystem.repository.TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
        this.ticketPool = new TicketPool(1000, ticketRepository); // Default max ticket capacity
    }

    public void startSystem(Configuration config) {
        this.configuration = config; // Initialize the configuration
        ticketPool.setMaxTicketCapacity(config.getMaxTicketCapacity());
        ticketPool.addInitialTickets(config.getTotalTickets()); // Only add the specified number of tickets
    }

    public Configuration getConfiguration() {
        return configuration;
    }

    public void startVendor(String vendorID, int ticketsToAdd) {
        if (configuration == null) {
            throw new IllegalStateException("System is not initialized. Please start the system with a configuration first.");
        }
        if (ticketsToAdd + ticketPool.getTotalTickets() > configuration.getMaxTicketCapacity()) {
            System.out.println("Vendor " + vendorID + " cannot add more tickets. Maximum capacity exceeded!");
            return;
        }

        Vendor vendor = new Vendor(vendorID, ticketsToAdd, 1000, configuration.getTicketReleaseRate(), ticketPool);
        Thread thread = new Thread(vendor);
        thread.start();
        System.out.println("Vendor " + vendorID + " thread started.");
    }

    public void startCustomer(String customerID, int noOfTickets) {
        if (configuration == null) {
            throw new IllegalStateException("System is not initialized. Please start the system with a configuration first.");
        }
        Customer customer = new Customer(customerID, configuration.getCustomerRetrievalRate(), noOfTickets, ticketPool);
        Thread thread = new Thread(customer);
        thread.start();
        System.out.println("Customer " + customerID + " thread started.");
    }

    public int getRemainingCapacity() {
        if (configuration == null) {
            throw new IllegalStateException("System is not initialized. Please start the system with a configuration first.");
        }
        return ticketPool.getRemainingCapacity();
    }

    public int getTotalTickets() {
        if (configuration == null) {
            throw new IllegalStateException("System is not initialized. Please start the system with a configuration first.");
        }
        return ticketPool.getTotalTickets();
    }

    public int getReleaseRate() {
        if (configuration == null) {
            throw new IllegalStateException("System is not initialized. Please start the system with a configuration first.");
        }
        return configuration.getTicketReleaseRate();
    }

    public int getMaxTicketCapacity() {
        if (configuration == null) {
            throw new IllegalStateException("System is not initialized. Please start the system with a configuration first.");
        }
        return configuration.getMaxTicketCapacity();
    }

    public int getSales() {
        if (configuration == null) {
            throw new IllegalStateException("System is not initialized. Please start the system with a configuration first.");
        }
        return ticketPool.getSales();
    }
}