package com.oop.EventTicketingSystem.controller;

import com.oop.EventTicketingSystem.payload.request.AlertThresholdRequest;
import com.oop.EventTicketingSystem.payload.response.SystemHealthMetrics;
import com.oop.EventTicketingSystem.service.SystemMonitorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller for System Health Monitoring endpoints.
 * Restricted to ADMIN users only.
 */
@RestController
@RequestMapping("/api/system-health")
public class SystemHealthController {

    @Autowired
    private SystemMonitorService systemMonitorService;

    /**
     * Get current system health snapshot.
     */
    @GetMapping("/current")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SystemHealthMetrics> getCurrentHealth() {
        SystemHealthMetrics metrics = systemMonitorService.collectMetrics();
        return ResponseEntity.ok(metrics);
    }

    /**
     * Get historical metrics for charting (last 5 minutes).
     */
    @GetMapping("/history")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SystemHealthMetrics>> getMetricsHistory() {
        List<SystemHealthMetrics> history = systemMonitorService.getMetricsHistory();
        return ResponseEntity.ok(history);
    }

    /**
     * Get current alert thresholds.
     */
    @GetMapping("/thresholds")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AlertThresholdRequest> getThresholds() {
        return ResponseEntity.ok(systemMonitorService.getCurrentThresholds());
    }

    /**
     * Update alert thresholds.
     */
    @PostMapping("/thresholds")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateThresholds(@RequestBody AlertThresholdRequest request) {
        systemMonitorService.updateThresholds(request);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Alert thresholds updated successfully");
        response.put("thresholds", systemMonitorService.getCurrentThresholds());
        return ResponseEntity.ok(response);
    }

    /**
     * Manually trigger a test alert (for testing purposes).
     */
    @PostMapping("/test-alert")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> testAlert(@RequestBody Map<String, String> request) {
        String testEmail = request.get("email");
        Map<String, Object> response = new HashMap<>();
        
        if (testEmail == null || testEmail.isEmpty()) {
            response.put("success", false);
            response.put("message", "Email address is required");
            return ResponseEntity.badRequest().body(response);
        }
        
        // Temporarily set the email and trigger an alert
        AlertThresholdRequest tempThreshold = new AlertThresholdRequest();
        tempThreshold.setAlertEmail(testEmail);
        tempThreshold.setCpuThreshold(0.0); // Force trigger
        systemMonitorService.updateThresholds(tempThreshold);
        
        response.put("success", true);
        response.put("message", "Test alert will be sent to: " + testEmail);
        return ResponseEntity.ok(response);
    }

    /**
     * Get system info summary.
     */
    @GetMapping("/info")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getSystemInfo() {
        Map<String, Object> info = new HashMap<>();
        
        Runtime runtime = Runtime.getRuntime();
        info.put("javaVersion", System.getProperty("java.version"));
        info.put("osName", System.getProperty("os.name"));
        info.put("osArch", System.getProperty("os.arch"));
        info.put("availableProcessors", runtime.availableProcessors());
        info.put("maxMemoryMB", runtime.maxMemory() / (1024 * 1024));
        info.put("totalMemoryMB", runtime.totalMemory() / (1024 * 1024));
        info.put("freeMemoryMB", runtime.freeMemory() / (1024 * 1024));
        info.put("uptimeSeconds", java.lang.management.ManagementFactory.getRuntimeMXBean().getUptime() / 1000);
        
        return ResponseEntity.ok(info);
    }
}
