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
    private EventCommunicationRequest communication;

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

    public static class EventCommunicationRequest {
        private boolean reminder7dEnabled;
        private String reminder7dSubject;
        private String reminder7dBody;
        
        private boolean reminder48hEnabled;
        private String reminder48hSubject;
        private String reminder48hBody;
        
        private boolean reminder2hEnabled;
        private String reminder2hSubject;
        private String reminder2hBody;

        // Getters and Setters
        public boolean isReminder7dEnabled() { return reminder7dEnabled; }
        public void setReminder7dEnabled(boolean reminder7dEnabled) { this.reminder7dEnabled = reminder7dEnabled; }
        public String getReminder7dSubject() { return reminder7dSubject; }
        public void setReminder7dSubject(String reminder7dSubject) { this.reminder7dSubject = reminder7dSubject; }
        public String getReminder7dBody() { return reminder7dBody; }
        public void setReminder7dBody(String reminder7dBody) { this.reminder7dBody = reminder7dBody; }

        public boolean isReminder48hEnabled() { return reminder48hEnabled; }
        public void setReminder48hEnabled(boolean reminder48hEnabled) { this.reminder48hEnabled = reminder48hEnabled; }
        public String getReminder48hSubject() { return reminder48hSubject; }
        public void setReminder48hSubject(String reminder48hSubject) { this.reminder48hSubject = reminder48hSubject; }
        public String getReminder48hBody() { return reminder48hBody; }
        public void setReminder48hBody(String reminder48hBody) { this.reminder48hBody = reminder48hBody; }

        public boolean isReminder2hEnabled() { return reminder2hEnabled; }
        public void setReminder2hEnabled(boolean reminder2hEnabled) { this.reminder2hEnabled = reminder2hEnabled; }
        public String getReminder2hSubject() { return reminder2hSubject; }
        public void setReminder2hSubject(String reminder2hSubject) { this.reminder2hSubject = reminder2hSubject; }
        public String getReminder2hBody() { return reminder2hBody; }
        public void setReminder2hBody(String reminder2hBody) { this.reminder2hBody = reminder2hBody; }
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
    public EventCommunicationRequest getCommunication() { return communication; }
    public void setCommunication(EventCommunicationRequest communication) { this.communication = communication; }
}
