package com.oop.EventTicketingSystem.model;

import com.oop.EventTicketingSystem.service.LoggerService;

public class Customer implements Runnable {
    private final String customerID;
    private final int retrievalInterval;
    private final int noOfTickets;
    private final TicketPool pool;

    public Customer(String customerID, int retrievalInterval, int noOfTickets, TicketPool pool) {
        this.customerID = customerID;
        this.retrievalInterval = retrievalInterval;
        this.noOfTickets = noOfTickets;
        this.pool = pool;
    }

    @Override
    public void run() {
        int ticketsRetrieved = 0;

        while (ticketsRetrieved < noOfTickets) {
            if (pool.getTotalTickets() == 0) {
                System.out.println("Customer " + customerID + ": No remaining tickets to retrieve. Waiting for more tickets.");
            }

            if (!pool.removeTickets(1)) {
                System.out.println("Customer " + customerID + ": No more tickets available. Exiting.");
                break;
            }

            ticketsRetrieved++;

            System.out.println("Customer " + customerID + " retrieved ticket.");
            try {
                Thread.sleep(retrievalInterval);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }
        System.out.println("Customer " + customerID + " finished retrieving tickets.");
        LoggerService.log("Customer " + customerID + " bought " + ticketsRetrieved + " tickets.");
        System.out.println("Total tickets now: " + pool.getTotalTickets());
    }
}