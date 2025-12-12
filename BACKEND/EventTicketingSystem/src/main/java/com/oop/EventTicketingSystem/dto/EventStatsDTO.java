package com.oop.EventTicketingSystem.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Data Transfer Object for event statistics used in the admin inspection dashboard.
 */
public class EventStatsDTO {

    private Long eventId;
    private String eventName;

    // Revenue Stats
    private BigDecimal totalRevenue;
    private BigDecimal netRevenue; // After refunds
    private Map<String, BigDecimal> revenueByTicketType;

    // Sales Stats
    private int totalTicketsSold;
    private int totalTicketsAvailable;
    private Map<String, TicketTypeSales> salesByTicketType;

    // Attendance Stats
    private int totalCheckIns;
    private double attendanceRate; // checkIns / sold * 100

    // Refund Stats
    private int totalRefunds;
    private BigDecimal totalRefundedAmount;
    private double refundRate; // refunds / sold * 100

    // Insights
    private List<HourlySales> hourlySalesTrend;
    private List<RecentActivity> recentActivities;
    private LocalDateTime lastUpdated;

    // Nested classes for structured data
    public static class TicketTypeSales {
        private String typeName;
        private int sold;
        private int available;
        private BigDecimal price;
        private BigDecimal revenue;

        public TicketTypeSales() {}

        public TicketTypeSales(String typeName, int sold, int available, BigDecimal price, BigDecimal revenue) {
            this.typeName = typeName;
            this.sold = sold;
            this.available = available;
            this.price = price;
            this.revenue = revenue;
        }

        // Getters and Setters
        public String getTypeName() { return typeName; }
        public void setTypeName(String typeName) { this.typeName = typeName; }
        public int getSold() { return sold; }
        public void setSold(int sold) { this.sold = sold; }
        public int getAvailable() { return available; }
        public void setAvailable(int available) { this.available = available; }
        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }
        public BigDecimal getRevenue() { return revenue; }
        public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }
    }

    public static class HourlySales {
        private LocalDateTime hour;
        private int ticketsSold;
        private BigDecimal revenue;

        public HourlySales() {}

        public HourlySales(LocalDateTime hour, int ticketsSold, BigDecimal revenue) {
            this.hour = hour;
            this.ticketsSold = ticketsSold;
            this.revenue = revenue;
        }

        public LocalDateTime getHour() { return hour; }
        public void setHour(LocalDateTime hour) { this.hour = hour; }
        public int getTicketsSold() { return ticketsSold; }
        public void setTicketsSold(int ticketsSold) { this.ticketsSold = ticketsSold; }
        public BigDecimal getRevenue() { return revenue; }
        public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }
    }

    public static class RecentActivity {
        private String type; // SALE, CHECK_IN, REFUND
        private LocalDateTime timestamp;
        private String description;
        private BigDecimal amount;

        public RecentActivity() {}

        public RecentActivity(String type, LocalDateTime timestamp, String description, BigDecimal amount) {
            this.type = type;
            this.timestamp = timestamp;
            this.description = description;
            this.amount = amount;
        }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
    }

    // Default constructor
    public EventStatsDTO() {}

    // Getters and Setters
    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }

    public String getEventName() { return eventName; }
    public void setEventName(String eventName) { this.eventName = eventName; }

    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }

    public BigDecimal getNetRevenue() { return netRevenue; }
    public void setNetRevenue(BigDecimal netRevenue) { this.netRevenue = netRevenue; }

    public Map<String, BigDecimal> getRevenueByTicketType() { return revenueByTicketType; }
    public void setRevenueByTicketType(Map<String, BigDecimal> revenueByTicketType) { this.revenueByTicketType = revenueByTicketType; }

    public int getTotalTicketsSold() { return totalTicketsSold; }
    public void setTotalTicketsSold(int totalTicketsSold) { this.totalTicketsSold = totalTicketsSold; }

    public int getTotalTicketsAvailable() { return totalTicketsAvailable; }
    public void setTotalTicketsAvailable(int totalTicketsAvailable) { this.totalTicketsAvailable = totalTicketsAvailable; }

    public Map<String, TicketTypeSales> getSalesByTicketType() { return salesByTicketType; }
    public void setSalesByTicketType(Map<String, TicketTypeSales> salesByTicketType) { this.salesByTicketType = salesByTicketType; }

    public int getTotalCheckIns() { return totalCheckIns; }
    public void setTotalCheckIns(int totalCheckIns) { this.totalCheckIns = totalCheckIns; }

    public double getAttendanceRate() { return attendanceRate; }
    public void setAttendanceRate(double attendanceRate) { this.attendanceRate = attendanceRate; }

    public int getTotalRefunds() { return totalRefunds; }
    public void setTotalRefunds(int totalRefunds) { this.totalRefunds = totalRefunds; }

    public BigDecimal getTotalRefundedAmount() { return totalRefundedAmount; }
    public void setTotalRefundedAmount(BigDecimal totalRefundedAmount) { this.totalRefundedAmount = totalRefundedAmount; }

    public double getRefundRate() { return refundRate; }
    public void setRefundRate(double refundRate) { this.refundRate = refundRate; }

    public List<HourlySales> getHourlySalesTrend() { return hourlySalesTrend; }
    public void setHourlySalesTrend(List<HourlySales> hourlySalesTrend) { this.hourlySalesTrend = hourlySalesTrend; }

    public List<RecentActivity> getRecentActivities() { return recentActivities; }
    public void setRecentActivities(List<RecentActivity> recentActivities) { this.recentActivities = recentActivities; }

    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
}
