package com.oop.EventTicketingSystem.service;

import com.oop.EventTicketingSystem.model.PriceRule;
import com.oop.EventTicketingSystem.model.TicketType;
import com.oop.EventTicketingSystem.repository.PriceRuleRepository;
import com.oop.EventTicketingSystem.repository.TicketTypeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PriceRuleService {

    private static final Logger logger = LoggerFactory.getLogger(PriceRuleService.class);

    @Autowired
    private PriceRuleRepository priceRuleRepository;

    @Autowired
    private TicketTypeRepository ticketTypeRepository;

    /**
     * Check and apply any SOLD_COUNT rules that have been triggered by sales.
     * Called after each order is placed.
     */
    @Transactional
    public void checkAndApplySoldCountRules(TicketType ticketType) {
        List<PriceRule> triggeredRules = priceRuleRepository.findTriggeredSoldCountRules(
                ticketType.getId(), ticketType.getSold());

        for (PriceRule rule : triggeredRules) {
            applyRule(rule, ticketType);
        }
    }

    /**
     * Check and apply any DATE rules that have triggered.
     * Called by the scheduler.
     */
    @Transactional
    public void checkAndApplyDateRules() {
        LocalDateTime now = LocalDateTime.now();
        List<PriceRule> pendingRules = priceRuleRepository.findPendingDateRules(now);

        for (PriceRule rule : pendingRules) {
            TicketType ticketType = rule.getTicketType();
            applyRule(rule, ticketType);
        }

        if (!pendingRules.isEmpty()) {
            logger.info("Applied {} date-based price rules", pendingRules.size());
        }
    }

    /**
     * Apply a price rule - update the ticket type price and mark rule as applied.
     */
    private void applyRule(PriceRule rule, TicketType ticketType) {
        BigDecimal oldPrice = ticketType.getPrice();
        ticketType.setPrice(rule.getNewPrice());
        ticketTypeRepository.save(ticketType);

        rule.setApplied(true);
        priceRuleRepository.save(rule);

        logger.info("Applied price rule for TicketType '{}': {} -> {} (Rule: {}, Condition: {})",
                ticketType.getName(), oldPrice, rule.getNewPrice(),
                rule.getTierName() != null ? rule.getTierName() : rule.getId(),
                rule.getConditionType());
    }

    /**
     * Create a new price rule for a ticket type.
     */
    @Transactional
    public PriceRule createPriceRule(Long ticketTypeId, PriceRule.ConditionType conditionType,
                                      Integer soldThreshold, LocalDateTime triggerDate,
                                      BigDecimal newPrice, String tierName, int priority) {
        TicketType ticketType = ticketTypeRepository.findById(ticketTypeId)
                .orElseThrow(() -> new RuntimeException("TicketType not found: " + ticketTypeId));

        PriceRule rule = new PriceRule(ticketType, conditionType, newPrice);
        rule.setSoldThreshold(soldThreshold);
        rule.setTriggerDate(triggerDate);
        rule.setTierName(tierName);
        rule.setPriority(priority);

        return priceRuleRepository.save(rule);
    }

    /**
     * Get all price rules for a ticket type.
     */
    public List<PriceRule> getRulesForTicketType(Long ticketTypeId) {
        return priceRuleRepository.findByTicketTypeIdOrderByPriorityAsc(ticketTypeId);
    }

    /**
     * Delete a price rule.
     */
    @Transactional
    public void deleteRule(Long ruleId) {
        priceRuleRepository.deleteById(ruleId);
    }

    /**
     * Verify that the user is the organizer of the event containing this ticket type.
     * Throws AccessDeniedException if not authorized.
     */
    public void verifyTicketTypeOwnership(Long ticketTypeId, Long userId) {
        TicketType ticketType = ticketTypeRepository.findById(ticketTypeId)
                .orElseThrow(() -> new RuntimeException("TicketType not found: " + ticketTypeId));
        
        Long organizerId = ticketType.getEvent().getOrganizer().getId();
        if (!organizerId.equals(userId)) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "You are not authorized to manage pricing for this event");
        }
    }

    /**
     * Verify that the user is the organizer of the event containing this price rule's ticket type.
     * Throws AccessDeniedException if not authorized.
     */
    public void verifyRuleOwnership(Long ruleId, Long userId) {
        PriceRule rule = priceRuleRepository.findById(ruleId)
                .orElseThrow(() -> new RuntimeException("PriceRule not found: " + ruleId));
        
        Long organizerId = rule.getTicketType().getEvent().getOrganizer().getId();
        if (!organizerId.equals(userId)) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "You are not authorized to manage this price rule");
        }
    }

    /**
     * Get pricing urgency info for a ticket type (for FOMO display).
     * Returns info about when the price will change next.
     */
    public PricingUrgencyInfo getUrgencyInfo(Long ticketTypeId) {
        TicketType ticketType = ticketTypeRepository.findById(ticketTypeId)
                .orElseThrow(() -> new RuntimeException("TicketType not found: " + ticketTypeId));

        PricingUrgencyInfo info = new PricingUrgencyInfo();
        info.setCurrentPrice(ticketType.getPrice());
        info.setTicketsSold(ticketType.getSold());
        info.setTotalQuantity(ticketType.getQuantity());

        // Check for next SOLD_COUNT rule
        List<PriceRule> nextSoldRules = priceRuleRepository.findNextSoldCountRule(ticketTypeId);
        if (!nextSoldRules.isEmpty()) {
            PriceRule nextSoldRule = nextSoldRules.get(0);
            int ticketsLeftAtThisPrice = nextSoldRule.getSoldThreshold() - ticketType.getSold();
            if (ticketsLeftAtThisPrice > 0) {
                info.setTicketsLeftAtCurrentPrice(ticketsLeftAtThisPrice);
                info.setNextPrice(nextSoldRule.getNewPrice());
                info.setNextTierName(nextSoldRule.getTierName());
            }
        }

        // Check for next DATE rule
        List<PriceRule> nextDateRules = priceRuleRepository.findNextDateRule(ticketTypeId);
        if (!nextDateRules.isEmpty()) {
            PriceRule nextDateRule = nextDateRules.get(0);
            if (nextDateRule.getTriggerDate().isAfter(LocalDateTime.now())) {
                info.setPriceChangeDate(nextDateRule.getTriggerDate());
                if (info.getNextPrice() == null) {
                    info.setNextPrice(nextDateRule.getNewPrice());
                    info.setNextTierName(nextDateRule.getTierName());
                }
            }
        }

        return info;
    }

    /**
     * DTO for pricing urgency information displayed on frontend.
     */
    public static class PricingUrgencyInfo {
        private BigDecimal currentPrice;
        private int ticketsSold;
        private int totalQuantity;
        private Integer ticketsLeftAtCurrentPrice;
        private BigDecimal nextPrice;
        private String nextTierName;
        private LocalDateTime priceChangeDate;

        // Getters and Setters
        public BigDecimal getCurrentPrice() { return currentPrice; }
        public void setCurrentPrice(BigDecimal currentPrice) { this.currentPrice = currentPrice; }

        public int getTicketsSold() { return ticketsSold; }
        public void setTicketsSold(int ticketsSold) { this.ticketsSold = ticketsSold; }

        public int getTotalQuantity() { return totalQuantity; }
        public void setTotalQuantity(int totalQuantity) { this.totalQuantity = totalQuantity; }

        public Integer getTicketsLeftAtCurrentPrice() { return ticketsLeftAtCurrentPrice; }
        public void setTicketsLeftAtCurrentPrice(Integer ticketsLeftAtCurrentPrice) { this.ticketsLeftAtCurrentPrice = ticketsLeftAtCurrentPrice; }

        public BigDecimal getNextPrice() { return nextPrice; }
        public void setNextPrice(BigDecimal nextPrice) { this.nextPrice = nextPrice; }

        public String getNextTierName() { return nextTierName; }
        public void setNextTierName(String nextTierName) { this.nextTierName = nextTierName; }

        public LocalDateTime getPriceChangeDate() { return priceChangeDate; }
        public void setPriceChangeDate(LocalDateTime priceChangeDate) { this.priceChangeDate = priceChangeDate; }
    }
}
