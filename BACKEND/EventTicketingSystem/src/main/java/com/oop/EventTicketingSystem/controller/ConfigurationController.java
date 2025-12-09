package com.oop.EventTicketingSystem.controller;

import com.oop.EventTicketingSystem.model.Configuration;
import com.oop.EventTicketingSystem.service.ConfigurationService;
import com.oop.EventTicketingSystem.service.SystemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/config")
public class ConfigurationController {

    @Autowired
    private ConfigurationService configurationService;

    @Autowired
    private SystemService systemService;

    @PostMapping("/new")
    public String createNewConfig(@RequestBody Configuration config) {
        // Validate the configuration to ensure all values are positive numbers
        configurationService.validateConfiguration(config);

        // Save the configuration to a JSON file
        configurationService.saveConfiguration(config, "data/Configuration.json");

        // Return a success message
        return "New configuration saved!";
    }
}