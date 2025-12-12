package com.oop.EventTicketingSystem.payload.response;

import java.time.LocalDateTime;

/**
 * DTO for System Health Metrics sent via WebSocket.
 */
public class SystemHealthMetrics {
    
    private LocalDateTime timestamp;
    
    // JVM Memory Metrics (in MB)
    private double heapMemoryUsed;
    private double heapMemoryMax;
    private double heapMemoryUsagePercent;
    
    // System Metrics
    private double systemCpuLoad;
    private double processCpuLoad;
    private int availableProcessors;
    
    // Application Metrics
    private long activeThreads;
    private long totalRequests;
    private double requestsPerSecond;
    private long errorCount;
    
    // Database Metrics
    private boolean databaseConnected;
    private int activeConnections;
    private long queryExecutionTimeMs;
    
    // Overall Status
    private String healthStatus; // HEALTHY, WARNING, CRITICAL
    private String alertMessage;
    
    public SystemHealthMetrics() {
        this.timestamp = LocalDateTime.now();
        this.healthStatus = "HEALTHY";
    }
    
    // Getters and Setters
    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public double getHeapMemoryUsed() {
        return heapMemoryUsed;
    }

    public void setHeapMemoryUsed(double heapMemoryUsed) {
        this.heapMemoryUsed = heapMemoryUsed;
    }

    public double getHeapMemoryMax() {
        return heapMemoryMax;
    }

    public void setHeapMemoryMax(double heapMemoryMax) {
        this.heapMemoryMax = heapMemoryMax;
    }

    public double getHeapMemoryUsagePercent() {
        return heapMemoryUsagePercent;
    }

    public void setHeapMemoryUsagePercent(double heapMemoryUsagePercent) {
        this.heapMemoryUsagePercent = heapMemoryUsagePercent;
    }

    public double getSystemCpuLoad() {
        return systemCpuLoad;
    }

    public void setSystemCpuLoad(double systemCpuLoad) {
        this.systemCpuLoad = systemCpuLoad;
    }

    public double getProcessCpuLoad() {
        return processCpuLoad;
    }

    public void setProcessCpuLoad(double processCpuLoad) {
        this.processCpuLoad = processCpuLoad;
    }

    public int getAvailableProcessors() {
        return availableProcessors;
    }

    public void setAvailableProcessors(int availableProcessors) {
        this.availableProcessors = availableProcessors;
    }

    public long getActiveThreads() {
        return activeThreads;
    }

    public void setActiveThreads(long activeThreads) {
        this.activeThreads = activeThreads;
    }

    public long getTotalRequests() {
        return totalRequests;
    }

    public void setTotalRequests(long totalRequests) {
        this.totalRequests = totalRequests;
    }

    public double getRequestsPerSecond() {
        return requestsPerSecond;
    }

    public void setRequestsPerSecond(double requestsPerSecond) {
        this.requestsPerSecond = requestsPerSecond;
    }

    public long getErrorCount() {
        return errorCount;
    }

    public void setErrorCount(long errorCount) {
        this.errorCount = errorCount;
    }

    public boolean isDatabaseConnected() {
        return databaseConnected;
    }

    public void setDatabaseConnected(boolean databaseConnected) {
        this.databaseConnected = databaseConnected;
    }

    public int getActiveConnections() {
        return activeConnections;
    }

    public void setActiveConnections(int activeConnections) {
        this.activeConnections = activeConnections;
    }

    public long getQueryExecutionTimeMs() {
        return queryExecutionTimeMs;
    }

    public void setQueryExecutionTimeMs(long queryExecutionTimeMs) {
        this.queryExecutionTimeMs = queryExecutionTimeMs;
    }

    public String getHealthStatus() {
        return healthStatus;
    }

    public void setHealthStatus(String healthStatus) {
        this.healthStatus = healthStatus;
    }

    public String getAlertMessage() {
        return alertMessage;
    }

    public void setAlertMessage(String alertMessage) {
        this.alertMessage = alertMessage;
    }
}
