package com.oop.EventTicketingSystem.service;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.oop.EventTicketingSystem.model.Configuration;
import org.springframework.stereotype.Component;

import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.lang.reflect.Type;

@Component
public class ConfigurationService {
    private final com.oop.EventTicketingSystem.repository.ConfigurationRepository configurationRepository;

    @org.springframework.beans.factory.annotation.Autowired
    public ConfigurationService(com.oop.EventTicketingSystem.repository.ConfigurationRepository configurationRepository) {
        this.configurationRepository = configurationRepository;
    }

    private Configuration configuration;

    public void validateConfiguration(Configuration config) {
        if (config.getTotalTickets() <= 0 || config.getTicketReleaseRate() <= 0 || config.getCustomerRetrievalRate() <= 0 || config.getMaxTicketCapacity() <= 0) {
            throw new IllegalArgumentException("Configuration parameters must be positive integers.");
        }
    }

    public void saveConfiguration(Configuration config, String filename) {
        // Ignoring filename, saving to DB
        configurationRepository.save(config);
        System.out.println("Configuration saved to Database.");
        LoggerService.log("New configuration saved to Database");
        this.configuration = config;
    }

    public Configuration loadConfiguration(String filename) {
         // Ignoring filename, loading from DB (taking the last one or default)
         // For simplicity, we just find the last saved one or return null
         java.util.List<Configuration> configs = configurationRepository.findAll();
         if (!configs.isEmpty()) {
             Configuration config = configs.get(configs.size() - 1);
             this.configuration = config;
             return config;
         }
         return null;
    }

    public Configuration getConfiguration() {
        return configuration;
    }

    public void setConfiguration(Configuration configuration) {
        this.configuration = configuration;
    }
}