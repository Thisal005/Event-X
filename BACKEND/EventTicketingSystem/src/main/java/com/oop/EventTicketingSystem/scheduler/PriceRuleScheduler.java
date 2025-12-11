package com.oop.EventTicketingSystem.scheduler;

import com.oop.EventTicketingSystem.service.PriceRuleService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduler that periodically checks for date-based price rules
 * and applies them when their trigger date has passed.
 */
@Component
public class PriceRuleScheduler {

    private static final Logger logger = LoggerFactory.getLogger(PriceRuleScheduler.class);

    @Autowired
    private PriceRuleService priceRuleService;

    /**
     * Run every minute to check for date-based price rules that should be applied.
     */
    @Scheduled(fixedRate = 60000) // Every 60 seconds
    public void checkDateBasedPriceRules() {
        try {
            priceRuleService.checkAndApplyDateRules();
        } catch (Exception e) {
            logger.error("Error checking date-based price rules", e);
        }
    }
}
