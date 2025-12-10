package com.oop.EventTicketingSystem.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "price_rules")
public class PriceRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_type_id", nullable = false)
    @JsonIgnore
    private TicketType ticketType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConditionType conditionType;

    // For SOLD_COUNT: the number of tickets sold to trigger this rule
    // For DATE: not used (use triggerDate instead)
    private Integer soldThreshold;

    // For DATE condition: the date/time when this rule triggers
    private LocalDateTime triggerDate;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal newPrice;

    @Column(nullable = false)
    private boolean applied = false;

    // Priority for applying rules (lower = higher priority)
    private int priority = 0;

    // Display name for the pricing tier (e.g., "Early Bird", "General Admission")
    private String tierName;

    public enum ConditionType {
        SOLD_COUNT,  // Trigger when X tickets are sold
        DATE         // Trigger at a specific date/time
    }

    public PriceRule() {
    }

    public PriceRule(TicketType ticketType, ConditionType conditionType, BigDecimal newPrice) {
        this.ticketType = ticketType;
        this.conditionType = conditionType;
        this.newPrice = newPrice;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public TicketType getTicketType() {
        return ticketType;
    }

    public void setTicketType(TicketType ticketType) {
        this.ticketType = ticketType;
    }

    public ConditionType getConditionType() {
        return conditionType;
    }

    public void setConditionType(ConditionType conditionType) {
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

    public boolean isApplied() {
        return applied;
    }

    public void setApplied(boolean applied) {
        this.applied = applied;
    }

    public int getPriority() {
        return priority;
    }

    public void setPriority(int priority) {
        this.priority = priority;
    }

    public String getTierName() {
        return tierName;
    }

    public void setTierName(String tierName) {
        this.tierName = tierName;
    }
}
