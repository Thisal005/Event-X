package com.oop.EventTicketingSystem.payload.request;

import com.oop.EventTicketingSystem.model.PromoCode;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PromoCodeRequest {
    private String code;
    private BigDecimal discountAmount;
    private PromoCode.DiscountType type;
    private int maxUses;
    private LocalDateTime expiryDate;
    private Long eventId; // Optional

    // Getters and Setters
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }

    public PromoCode.DiscountType getType() { return type; }
    public void setType(PromoCode.DiscountType type) { this.type = type; }

    public int getMaxUses() { return maxUses; }
    public void setMaxUses(int maxUses) { this.maxUses = maxUses; }

    public LocalDateTime getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDateTime expiryDate) { this.expiryDate = expiryDate; }

    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }
}
