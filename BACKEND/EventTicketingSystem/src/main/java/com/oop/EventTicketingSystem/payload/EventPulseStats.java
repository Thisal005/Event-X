package com.oop.EventTicketingSystem.payload;

import java.util.List;

public class EventPulseStats {

    private int viewerCount;
    private int salesLastMinute;
    private int salesLast10Minutes;
    private List<Integer> sparklineData; // Sales per minute for the last 10 minutes

    public EventPulseStats() {
    }

    public EventPulseStats(int viewerCount, int salesLastMinute, int salesLast10Minutes, List<Integer> sparklineData) {
        this.viewerCount = viewerCount;
        this.salesLastMinute = salesLastMinute;
        this.salesLast10Minutes = salesLast10Minutes;
        this.sparklineData = sparklineData;
    }

    public int getViewerCount() {
        return viewerCount;
    }

    public void setViewerCount(int viewerCount) {
        this.viewerCount = viewerCount;
    }

    public int getSalesLastMinute() {
        return salesLastMinute;
    }

    public void setSalesLastMinute(int salesLastMinute) {
        this.salesLastMinute = salesLastMinute;
    }

    public int getSalesLast10Minutes() {
        return salesLast10Minutes;
    }

    public void setSalesLast10Minutes(int salesLast10Minutes) {
        this.salesLast10Minutes = salesLast10Minutes;
    }

    public List<Integer> getSparklineData() {
        return sparklineData;
    }

    public void setSparklineData(List<Integer> sparklineData) {
        this.sparklineData = sparklineData;
    }
}
