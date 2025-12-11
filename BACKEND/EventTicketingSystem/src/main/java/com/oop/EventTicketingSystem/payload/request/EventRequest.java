package com.oop.EventTicketingSystem.payload.request;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class EventRequest {
    private String name;
    private String description;
    private LocalDateTime date;
    private String venue;
    private String category;
    private String bannerImage;
    private List<TicketTypeRequest> ticketTypes;

    public static class TicketTypeRequest {
        private String name;
        private BigDecimal price;
        private int quantity;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
    }

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }
    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getBannerImage() { return bannerImage; }
    public void setBannerImage(String bannerImage) { this.bannerImage = bannerImage; }
    public List<TicketTypeRequest> getTicketTypes() { return ticketTypes; }
    public void setTicketTypes(List<TicketTypeRequest> ticketTypes) { this.ticketTypes = ticketTypes; }
}
