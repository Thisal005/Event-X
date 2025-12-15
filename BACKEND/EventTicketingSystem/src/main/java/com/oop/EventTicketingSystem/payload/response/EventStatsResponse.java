package com.oop.EventTicketingSystem.payload.response;

import java.math.BigDecimal;
import java.util.List;

public class EventStatsResponse {
    private BigDecimal totalRevenue;
    private int totalTicketsSold;
    private int totalTickets;
    private List<DailySales> dailySales;
    private List<TicketTypeStat> ticketTypeStats;
    private List<HourlySales> salesByHourOfDay;
    
    // New fields for detailed stats
    private long attendanceCount;      // Tickets checked in
    private long refundedCount;        // Tickets refunded
    private long cancelledCount;       // Tickets cancelled
    private long totalOrders;          // Total number of orders
    private double attendanceRate;     // Percentage of sold tickets that checked in

    public EventStatsResponse(BigDecimal totalRevenue, int totalTicketsSold, int totalTickets, 
                            List<DailySales> dailySales, List<TicketTypeStat> ticketTypeStats,
                            List<HourlySales> salesByHourOfDay) {
        this.totalRevenue = totalRevenue;
        this.totalTicketsSold = totalTicketsSold;
        this.totalTickets = totalTickets;
        this.dailySales = dailySales;
        this.ticketTypeStats = ticketTypeStats;
        this.salesByHourOfDay = salesByHourOfDay;
    }
    
    // Extended constructor with all stats
    public EventStatsResponse(BigDecimal totalRevenue, int totalTicketsSold, int totalTickets, 
                            List<DailySales> dailySales, List<TicketTypeStat> ticketTypeStats,
                            List<HourlySales> salesByHourOfDay, long attendanceCount,
                            long refundedCount, long cancelledCount, long totalOrders) {
        this.totalRevenue = totalRevenue;
        this.totalTicketsSold = totalTicketsSold;
        this.totalTickets = totalTickets;
        this.dailySales = dailySales;
        this.ticketTypeStats = ticketTypeStats;
        this.salesByHourOfDay = salesByHourOfDay;
        this.attendanceCount = attendanceCount;
        this.refundedCount = refundedCount;
        this.cancelledCount = cancelledCount;
        this.totalOrders = totalOrders;
        this.attendanceRate = totalTicketsSold > 0 ? (double) attendanceCount / totalTicketsSold * 100 : 0;
    }

    // Getters and Setters
    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }

    public int getTotalTicketsSold() { return totalTicketsSold; }
    public void setTotalTicketsSold(int totalTicketsSold) { this.totalTicketsSold = totalTicketsSold; }

    public int getTotalTickets() { return totalTickets; }
    public void setTotalTickets(int totalTickets) { this.totalTickets = totalTickets; }

    public List<DailySales> getDailySales() { return dailySales; }
    public void setDailySales(List<DailySales> dailySales) { this.dailySales = dailySales; }

    public List<TicketTypeStat> getTicketTypeStats() { return ticketTypeStats; }
    public void setTicketTypeStats(List<TicketTypeStat> ticketTypeStats) { this.ticketTypeStats = ticketTypeStats; }

    public List<HourlySales> getSalesByHourOfDay() { return salesByHourOfDay; }
    public void setSalesByHourOfDay(List<HourlySales> salesByHourOfDay) { this.salesByHourOfDay = salesByHourOfDay; }
    
    // New getters and setters
    public long getAttendanceCount() { return attendanceCount; }
    public void setAttendanceCount(long attendanceCount) { this.attendanceCount = attendanceCount; }
    
    public long getRefundedCount() { return refundedCount; }
    public void setRefundedCount(long refundedCount) { this.refundedCount = refundedCount; }
    
    public long getCancelledCount() { return cancelledCount; }
    public void setCancelledCount(long cancelledCount) { this.cancelledCount = cancelledCount; }
    
    public long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(long totalOrders) { this.totalOrders = totalOrders; }
    
    public double getAttendanceRate() { return attendanceRate; }
    public void setAttendanceRate(double attendanceRate) { this.attendanceRate = attendanceRate; }

    public static class DailySales {
        private String date;
        private BigDecimal sales;

        public DailySales(String date, BigDecimal sales) {
            this.date = date;
            this.sales = sales;
        }

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public BigDecimal getSales() { return sales; }
        public void setSales(BigDecimal sales) { this.sales = sales; }
    }

    public static class TicketTypeStat {
        private String name;
        private int sold;
        private int quantity;

        public TicketTypeStat(String name, int sold, int quantity) {
            this.name = name;
            this.sold = sold;
            this.quantity = quantity;
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public int getSold() { return sold; }
        public void setSold(int sold) { this.sold = sold; }
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
    }

    public static class HourlySales {
        private int hour; // 0-23
        private BigDecimal sales;

        public HourlySales(int hour, BigDecimal sales) {
            this.hour = hour;
            this.sales = sales;
        }

        public int getHour() { return hour; }
        public void setHour(int hour) { this.hour = hour; }
        public BigDecimal getSales() { return sales; }
        public void setSales(BigDecimal sales) { this.sales = sales; }
    }
}
