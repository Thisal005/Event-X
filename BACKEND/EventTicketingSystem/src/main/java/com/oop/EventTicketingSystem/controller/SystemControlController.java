package com.oop.EventTicketingSystem.controller;

import com.oop.EventTicketingSystem.model.Configuration;
import com.oop.EventTicketingSystem.service.ConfigurationService;
import com.oop.EventTicketingSystem.service.LoggerService;
import com.oop.EventTicketingSystem.service.SystemService;
import com.oop.EventTicketingSystem.service.TicketPoolService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/system")
public class SystemControlController {

    @Autowired
    private TicketPoolService ticketPoolService;

    @Autowired
    private ConfigurationService configurationService;

    @Autowired
    private SystemService systemService;

    @PostMapping("/start")
    public ResponseEntity<String> startSystem() {
        try {
            // Load the configuration from the file
            Configuration config = configurationService.loadConfiguration("data/Configuration.json");

            // Check if the configuration was successfully loaded
            if (config == null) {
                return ResponseEntity.badRequest().body("Failed to load configuration from file.");
            }

            // Log the loaded configuration
            LoggerService.log("Loaded configuration from file: " + config);

            // Validate the configuration
            configurationService.validateConfiguration(config);

            // Set the configuration in the configuration service
            configurationService.setConfiguration(config);

            // Start the system using the ticket pool service
            ticketPoolService.startSystem(config);

            // Return a success message
            return ResponseEntity.ok("System started.");
        } catch (Exception e) {
            LoggerService.log("Error starting system: " + e.getMessage());
            return ResponseEntity.status(500).body("Failed to start system: " + e.getMessage());
        }
    }

    @PostMapping("/stop")
    public ResponseEntity<String> stopSystem(@RequestBody Configuration config) {
        try {
            // Reset the configuration parameters
            config.setTotalTickets(0);
            config.setTicketReleaseRate(0);
            config.setCustomerRetrievalRate(0);
            config.setMaxTicketCapacity(0);

            // Save the reset configuration to the file
            configurationService.saveConfiguration(config, "data/Configuration.json");

            // Return a confirmation message
            return ResponseEntity.ok("System stopped.");
        } catch (Exception e) {
            LoggerService.log("Error stopping system: " + e.getMessage());
            return ResponseEntity.status(500).body("Failed to stop system: " + e.getMessage());
        }
    }
}