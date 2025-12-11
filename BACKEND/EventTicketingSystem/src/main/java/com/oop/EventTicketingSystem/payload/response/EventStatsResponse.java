package com.oop.EventTicketingSystem.payload.response;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class EventStatsResponse {
    private BigDecimal totalRevenue;
    private int totalTicketsSold;
    private int totalTickets;
    private List<DailySales> dailySales;
    private List<TicketTypeStat> ticketTypeStats;
    private List<HourlySales> salesByHourOfDay;

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
