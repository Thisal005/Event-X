package com.oop.EventTicketingSystem.payload.request;

/**
 * Request DTO for configuring alert thresholds.
 */
public class AlertThresholdRequest {
    
    private Double cpuThreshold;        // Percentage (0-100)
    private Double memoryThreshold;     // Percentage (0-100)
    private Long errorRateThreshold;    // Errors per minute
    private String alertEmail;          // Email to send alerts to
    private Boolean emailAlertsEnabled;
    
    public AlertThresholdRequest() {
        // Defaults
        this.cpuThreshold = 80.0;
        this.memoryThreshold = 85.0;
        this.errorRateThreshold = 10L;
        this.emailAlertsEnabled = true;
    }
    
    // Getters and Setters
    public Double getCpuThreshold() {
        return cpuThreshold;
    }

    public void setCpuThreshold(Double cpuThreshold) {
        this.cpuThreshold = cpuThreshold;
    }

    public Double getMemoryThreshold() {
        return memoryThreshold;
    }

    public void setMemoryThreshold(Double memoryThreshold) {
        this.memoryThreshold = memoryThreshold;
    }

    public Long getErrorRateThreshold() {
        return errorRateThreshold;
    }

    public void setErrorRateThreshold(Long errorRateThreshold) {
        this.errorRateThreshold = errorRateThreshold;
    }

    public String getAlertEmail() {
        return alertEmail;
    }

    public void setAlertEmail(String alertEmail) {
        this.alertEmail = alertEmail;
    }

    public Boolean getEmailAlertsEnabled() {
        return emailAlertsEnabled;
    }

    public void setEmailAlertsEnabled(Boolean emailAlertsEnabled) {
        this.emailAlertsEnabled = emailAlertsEnabled;
    }
}
