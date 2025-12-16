package com.oop.EventTicketingSystem.service;

import com.oop.EventTicketingSystem.model.Configuration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class SystemService {

    @Autowired
    private TicketPoolService ticketPoolService;

    @Autowired
    private ConfigurationService configurationService;

    public void startSystem(Configuration config) {
        configurationService.validateConfiguration(config);
        ticketPoolService.startSystem(config);
        System.out.println("System started with configuration: " + config);
        LoggerService.log("System started with configuration: " + config);
    }




}