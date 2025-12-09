/*package com.oop.EventTicketingSystem;

import com.oop.EventTicketingSystem.service.ConfigurationService;
import com.oop.EventTicketingSystem.service.LoggerService;
import com.oop.EventTicketingSystem.service.TicketPoolService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

import java.util.InputMismatchException;
import java.util.Scanner;

@Component
public class TicketingSystemCLI implements CommandLineRunner {

    @Autowired
    private ConfigurationService configurationService;

    @Autowired
    private TicketPoolService ticketPoolService;

    @Override
    public void run(String... args) throws Exception {
        Scanner input = new Scanner(System.in);
        System.out.println("WELCOME TO TICKETING SYSTEM");
        System.out.print("Enter 1 to start system with saved configuration \nEnter 2 to start system with new configuration \nChoice : ");

        int choice = input.nextInt();
        input.nextLine();

        switch (choice) {
            case 1:
                ConfigurationService loadedConfig = ConfigurationService.loadFromJSON("data/Configuration.json");
                if (loadedConfig == null) {
                    System.out.println("Invalid configuration file. Please enter new configuration.");
                    choice = 2; // Force new configuration input
                } else {
                    configurationService = loadedConfig;
                    ticketPoolService.getTicketPool().setMaxTicketCapacity(configurationService.getMaxTicketCapacity());
                    System.out.println("Loaded configuration file.");
                }
                break;

            case 2:
                int totalTickets = inputChecker(input, "Enter total number of Tickets: ");
                int ticketReleaseRate = inputChecker(input, "Enter ticket release rate: ");
                int customerRetrievalRate = inputChecker(input, "Enter customer retrieval rate: ");
                int maxTicketCapacity = inputChecker(input, "Enter maximum ticket capacity: ");

                configurationService = new ConfigurationService(
                        totalTickets,
                        ticketReleaseRate,
                        customerRetrievalRate,
                        maxTicketCapacity
                );
                ticketPoolService.getTicketPool().setMaxTicketCapacity(configurationService.getMaxTicketCapacity());
                configurationService.saveConfiguration("data/Configuration.json");
                System.out.println("New configuration saved: " + configurationService);
                break;
            default:
                System.out.println("Invalid choice. Please try again.");
                return;
        }

        boolean running = true;
        while (running) {
            System.out.println("Enter command (start/stop) : ");
            String command = input.nextLine().trim().toLowerCase();

            switch (command) {
                case "start":
                    startSystem();
                    break;
                case "stop":
                    stopSystem();
                    running = false;
                    break;
                default:
                    System.out.println("Invalid command. Please try again.");
            }
        }

        input.close();
    }

    private void startSystem() {
        ticketPoolService.getTicketPool().addInitialTickets(configurationService.getTotalTickets());
        System.out.println("System started with " + configurationService.getTotalTickets() + " initial tickets.");
        LoggerService.log("System started with " + configurationService.getTotalTickets() + " initial tickets.");
    }

    private void stopSystem() {
        int totalTickets = ticketPoolService.getTotalTickets();

        // Update configuration with current ticket count
        configurationService.setTotalTickets(totalTickets);
        configurationService.saveConfiguration("data/Configuration.json");

        System.out.println("System stopped.");
        LoggerService.log("System stopped.");
    }
    private int inputChecker(Scanner input, String prompt) {
        while (true) {
            try {
                System.out.print(prompt);
                int value = input.nextInt();
                input.nextLine(); // Consume the newline character
                if (value > 0) {
                    return value;
                } else {
                    System.out.println("Please enter a valid positive integer!");
                }
            } catch (InputMismatchException e) {
                System.out.println("Please enter a valid integer!");
                input.next(); // Clear the invalid input
            }
        }
    }
}

 */
