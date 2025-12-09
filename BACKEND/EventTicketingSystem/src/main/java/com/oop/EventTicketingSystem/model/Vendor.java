package com.oop.EventTicketingSystem.model;

import com.oop.EventTicketingSystem.service.LoggerService;

public class Vendor implements Runnable {
    private final String vendorID;
    private final int ticketsToAdd;
    private final int releaseInterval;
    private final int releaseRate;
    private final TicketPool pool;

    public Vendor(String vendorID, int ticketsToAdd, int releaseInterval, int releaseRate, TicketPool pool) {
        this.vendorID = vendorID;
        this.ticketsToAdd = ticketsToAdd;
        this.releaseInterval = releaseInterval;
        this.releaseRate = releaseRate;
        this.pool = pool;
    }

    @Override
    public void run() {
        int ticketsAdded = 0;

        while (ticketsAdded < ticketsToAdd) {
            int remainingCapacity = pool.getRemainingCapacity();
            if (remainingCapacity == 0) {
                System.out.println("Vendor " + vendorID + ": No remaining capacity to add tickets.");
                break;
            }

            int ticketsToRelease = Math.min(releaseRate, Math.min(ticketsToAdd - ticketsAdded, remainingCapacity));

            // Attempt to add tickets
            if (ticketsToRelease > 0) {
                pool.addTickets(ticketsToRelease);
                ticketsAdded += ticketsToRelease;

                System.out.println("Vendor " + vendorID + " added " + ticketsToRelease + " tickets.");
            } else {
                System.out.println("Cannot add that number of tickets. Maximum capacity exceeded!");
                break;
            }

            try {
                Thread.sleep(releaseInterval);
            } catch (InterruptedException e) {
                System.out.println("Vendor thread interrupted.");
                Thread.currentThread().interrupt();
                break;
            }
        }

        System.out.println("Vendor " + vendorID + " finished adding tickets.");
        LoggerService.log("Vendor " + vendorID + " added " + ticketsAdded + " tickets.");
        System.out.println("Total tickets now: " + pool.getTotalTickets());
    }
}