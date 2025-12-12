package com.oop.EventTicketingSystem.payload.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderResponse {
    private Long orderId;
    private LocalDateTime orderDate;
    private BigDecimal totalAmount;
    private String status;
    private List<OrderItemDto> orderItems;

    public OrderResponse(Long orderId, LocalDateTime orderDate, BigDecimal totalAmount, String status, List<OrderItemDto> orderItems) {
        this.orderId = orderId;
        this.orderDate = orderDate;
        this.totalAmount = totalAmount;
        this.status = status;
        this.orderItems = orderItems;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<OrderItemDto> getOrderItems() {
        return orderItems;
    }

    public void setOrderItems(List<OrderItemDto> orderItems) {
        this.orderItems = orderItems;
    }

    public static class OrderItemDto {
        private String ticketName;
        private int quantity;
        private BigDecimal price;
        private EventDto event;
        private List<TicketDto> tickets;

        public OrderItemDto(String ticketName, int quantity, BigDecimal price, EventDto event, List<TicketDto> tickets) {
            this.ticketName = ticketName;
            this.quantity = quantity;
            this.price = price;
            this.event = event;
            this.tickets = tickets;
        }

        public String getTicketName() {
            return ticketName;
        }

        public void setTicketName(String ticketName) {
            this.ticketName = ticketName;
        }

        public int getQuantity() {
            return quantity;
        }

        public void setQuantity(int quantity) {
            this.quantity = quantity;
        }

        public BigDecimal getPrice() {
            return price;
        }

        public void setPrice(BigDecimal price) {
            this.price = price;
        }

        public EventDto getEvent() {
            return event;
        }

        public void setEvent(EventDto event) {
            this.event = event;
        }

        public List<TicketDto> getTickets() {
            return tickets;
        }

        public void setTickets(List<TicketDto> tickets) {
            this.tickets = tickets;
        }
    }

    public static class TicketDto {
        private Long ticketId;
        private String qrCode;
        private String status;

        public TicketDto(Long ticketId, String qrCode, String status) {
            this.ticketId = ticketId;
            this.qrCode = qrCode;
            this.status = status;
        }

        public Long getTicketId() {
            return ticketId;
        }

        public void setTicketId(Long ticketId) {
            this.ticketId = ticketId;
        }

        public String getQrCode() {
            return qrCode;
        }

        public void setQrCode(String qrCode) {
            this.qrCode = qrCode;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }

    public static class EventDto {
        private Long id;
        private String name;
        private LocalDateTime date;
        private String venue;
        private String bannerImage;

        public EventDto(Long id, String name, LocalDateTime date, String venue, String bannerImage) {
            this.id = id;
            this.name = name;
            this.date = date;
            this.venue = venue;
            this.bannerImage = bannerImage;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public LocalDateTime getDate() {
            return date;
        }

        public void setDate(LocalDateTime date) {
            this.date = date;
        }

        public String getVenue() {
            return venue;
        }

        public void setVenue(String venue) {
            this.venue = venue;
        }

        public String getBannerImage() {
            return bannerImage;
        }

        public void setBannerImage(String bannerImage) {
            this.bannerImage = bannerImage;
        }
    }
}
