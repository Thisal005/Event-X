package com.oop.EventTicketingSystem.payload.request;

import com.oop.EventTicketingSystem.model.PriceRule;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PriceRuleRequest {

    private Long ticketTypeId;
    private PriceRule.ConditionType conditionType;
    private Integer soldThreshold;
    private LocalDateTime triggerDate;
    private BigDecimal newPrice;
    private String tierName;
    private Integer priority;

    public Long getTicketTypeId() {
        return ticketTypeId;
    }

    public void setTicketTypeId(Long ticketTypeId) {
        this.ticketTypeId = ticketTypeId;
    }

    public PriceRule.ConditionType getConditionType() {
        return conditionType;
    }

    public void setConditionType(PriceRule.ConditionType conditionType) {
        this.conditionType = conditionType;
    }

    public Integer getSoldThreshold() {
        return soldThreshold;
    }

    public void setSoldThreshold(Integer soldThreshold) {
        this.soldThreshold = soldThreshold;
    }

    public LocalDateTime getTriggerDate() {
        return triggerDate;
    }

    public void setTriggerDate(LocalDateTime triggerDate) {
        this.triggerDate = triggerDate;
    }

    public BigDecimal getNewPrice() {
        return newPrice;
    }

    public void setNewPrice(BigDecimal newPrice) {
        this.newPrice = newPrice;
    }

    public String getTierName() {
        return tierName;
    }

    public void setTierName(String tierName) {
        this.tierName = tierName;
    }

    public Integer getPriority() {
        return priority;
    }

    public void setPriority(Integer priority) {
        this.priority = priority;
    }
}
