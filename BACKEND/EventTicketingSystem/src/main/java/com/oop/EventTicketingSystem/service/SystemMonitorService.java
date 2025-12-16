package com.oop.EventTicketingSystem.service;

import com.oop.EventTicketingSystem.payload.request.AlertThresholdRequest;
import com.oop.EventTicketingSystem.payload.response.SystemHealthMetrics;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.OperatingSystemMXBean;
import java.lang.management.ThreadMXBean;
import java.sql.Connection;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Service to monitor system health and broadcast metrics via WebSocket.
 */
@Service
public class SystemMonitorService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private EmailService emailService;

    @Autowired
    private DataSource dataSource;

    // Alert thresholds (configurable)
    private volatile double cpuThreshold = 80.0;
    private volatile double memoryThreshold = 85.0;
    private volatile long errorRateThreshold = 10;
    private volatile String alertEmail = null;
    private volatile boolean emailAlertsEnabled = true;

    // Metrics tracking
    private final AtomicLong totalRequests = new AtomicLong(0);
    private final AtomicLong errorCount = new AtomicLong(0);
    private volatile long lastRequestCount = 0;
    private volatile LocalDateTime lastAlertSent = null;

    // History for charts (keep last 60 data points = 5 minutes at 5s intervals)
    private final List<SystemHealthMetrics> metricsHistory = new ArrayList<>();
    private static final int MAX_HISTORY_SIZE = 60;

    /**
     * Scheduled task to collect and broadcast metrics every 5 seconds.
     */
    @Scheduled(fixedRate = 5000)
    public void collectAndBroadcastMetrics() {
        SystemHealthMetrics metrics = collectMetrics();
        
        // Check thresholds and set status
        checkThresholds(metrics);
        
        // Add to history
        synchronized (metricsHistory) {
            metricsHistory.add(metrics);
            if (metricsHistory.size() > MAX_HISTORY_SIZE) {
                metricsHistory.remove(0);
            }
        }
        
        // Broadcast to all subscribed clients
        messagingTemplate.convertAndSend("/topic/system-health", metrics);
    }

    /**
     * Collect current system metrics.
     */
    public SystemHealthMetrics collectMetrics() {
        SystemHealthMetrics metrics = new SystemHealthMetrics();
        metrics.setTimestamp(LocalDateTime.now());

        // Memory metrics
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        long heapUsed = memoryBean.getHeapMemoryUsage().getUsed();
        long heapMax = memoryBean.getHeapMemoryUsage().getMax();
        
        metrics.setHeapMemoryUsed(heapUsed / (1024.0 * 1024.0)); // Convert to MB
        metrics.setHeapMemoryMax(heapMax / (1024.0 * 1024.0));
        metrics.setHeapMemoryUsagePercent((heapUsed * 100.0) / heapMax);

        // CPU metrics
        OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
        metrics.setAvailableProcessors(osBean.getAvailableProcessors());
        double systemLoad = osBean.getSystemLoadAverage();
        metrics.setSystemCpuLoad(systemLoad >= 0 ? systemLoad : 0);
        
        // Process CPU (try to get via com.sun.management if available)
        if (osBean instanceof com.sun.management.OperatingSystemMXBean) {
            com.sun.management.OperatingSystemMXBean sunOsBean = 
                (com.sun.management.OperatingSystemMXBean) osBean;
            metrics.setProcessCpuLoad(sunOsBean.getProcessCpuLoad() * 100);
        }

        // Thread metrics
        ThreadMXBean threadBean = ManagementFactory.getThreadMXBean();
        metrics.setActiveThreads(threadBean.getThreadCount());

        // Request metrics
        long currentRequests = totalRequests.get();
        double requestsPerSecond = (currentRequests - lastRequestCount) / 5.0;
        lastRequestCount = currentRequests;
        metrics.setTotalRequests(currentRequests);
        metrics.setRequestsPerSecond(requestsPerSecond);
        metrics.setErrorCount(errorCount.get());

        // Database connectivity
        try (Connection conn = dataSource.getConnection()) {
            metrics.setDatabaseConnected(conn.isValid(2));
            // Try to get active connections if HikariCP
            metrics.setActiveConnections(1); // Simplified; would need HikariCP metrics for actual count
        } catch (Exception e) {
            metrics.setDatabaseConnected(false);
            metrics.setActiveConnections(0);
        }

        return metrics;
    }

    /**
     * Check thresholds and update health status.
     */
    private void checkThresholds(SystemHealthMetrics metrics) {
        List<String> alerts = new ArrayList<>();
        String status = "HEALTHY";

        // Check CPU
        if (metrics.getProcessCpuLoad() > cpuThreshold) {
            alerts.add(String.format("CPU usage is %.1f%% (threshold: %.1f%%)", 
                metrics.getProcessCpuLoad(), cpuThreshold));
            status = "CRITICAL";
        } else if (metrics.getProcessCpuLoad() > cpuThreshold * 0.8) {
            status = "WARNING";
        }

        // Check Memory
        if (metrics.getHeapMemoryUsagePercent() > memoryThreshold) {
            alerts.add(String.format("Memory usage is %.1f%% (threshold: %.1f%%)", 
                metrics.getHeapMemoryUsagePercent(), memoryThreshold));
            status = "CRITICAL";
        } else if (metrics.getHeapMemoryUsagePercent() > memoryThreshold * 0.9 && !"CRITICAL".equals(status)) {
            status = "WARNING";
        }

        // Check Database
        if (!metrics.isDatabaseConnected()) {
            alerts.add("Database connection is down!");
            status = "CRITICAL";
        }

        metrics.setHealthStatus(status);
        
        if (!alerts.isEmpty()) {
            metrics.setAlertMessage(String.join("; ", alerts));
            sendAlertEmail(alerts, status);
        }
    }

    /**
     * Send alert email (rate-limited to once every 5 minutes).
     */
    private void sendAlertEmail(List<String> alerts, String status) {
        if (!emailAlertsEnabled || alertEmail == null || alertEmail.isEmpty()) {
            return;
        }

        // Rate limit: don't send more than one alert every 5 minutes
        if (lastAlertSent != null && 
            lastAlertSent.plusMinutes(5).isAfter(LocalDateTime.now())) {
            return;
        }

        try {
            String subject = "[" + status + "] Event-X System Health Alert";
            String htmlBody = buildAlertEmailHtml(alerts, status);
            emailService.sendHtmlEmail(alertEmail, subject, htmlBody);
            lastAlertSent = LocalDateTime.now();
            LoggerService.log("System health alert email sent to: " + alertEmail);
        } catch (Exception e) {
            LoggerService.log("Failed to send alert email: " + e.getMessage());
        }
    }

    private String buildAlertEmailHtml(List<String> alerts, String status) {
        StringBuilder html = new StringBuilder();
        html.append("<html><body style='font-family: Arial, sans-serif;'>");
        html.append("<h2 style='color: ").append("CRITICAL".equals(status) ? "#dc2626" : "#f59e0b").append(";'>");
        html.append("⚠️ System Health Alert: ").append(status).append("</h2>");
        html.append("<p>The following issues were detected on your Event-X system:</p>");
        html.append("<ul>");
        for (String alert : alerts) {
            html.append("<li style='margin: 8px 0;'>").append(alert).append("</li>");
        }
        html.append("</ul>");
        html.append("<p style='color: #666;'>Time: ").append(LocalDateTime.now()).append("</p>");
        html.append("<p style='margin-top: 20px;'>Please check the admin dashboard for more details.</p>");
        html.append("</body></html>");
        return html.toString();
    }

    // Public methods for incrementing counters
    public void incrementRequestCount() {
        totalRequests.incrementAndGet();
    }

    public void incrementErrorCount() {
        errorCount.incrementAndGet();
    }

    // Configuration methods
    public void updateThresholds(AlertThresholdRequest request) {
        if (request.getCpuThreshold() != null) {
            this.cpuThreshold = request.getCpuThreshold();
        }
        if (request.getMemoryThreshold() != null) {
            this.memoryThreshold = request.getMemoryThreshold();
        }
        if (request.getErrorRateThreshold() != null) {
            this.errorRateThreshold = request.getErrorRateThreshold();
        }
        if (request.getAlertEmail() != null) {
            this.alertEmail = request.getAlertEmail();
        }
        if (request.getEmailAlertsEnabled() != null) {
            this.emailAlertsEnabled = request.getEmailAlertsEnabled();
        }
        LoggerService.log("Alert thresholds updated: CPU=" + cpuThreshold + 
            "%, Memory=" + memoryThreshold + "%, Email=" + alertEmail);
    }

    public AlertThresholdRequest getCurrentThresholds() {
        AlertThresholdRequest thresholds = new AlertThresholdRequest();
        thresholds.setCpuThreshold(cpuThreshold);
        thresholds.setMemoryThreshold(memoryThreshold);
        thresholds.setErrorRateThreshold(errorRateThreshold);
        thresholds.setAlertEmail(alertEmail);
        thresholds.setEmailAlertsEnabled(emailAlertsEnabled);
        return thresholds;
    }

    public List<SystemHealthMetrics> getMetricsHistory() {
        synchronized (metricsHistory) {
            return new ArrayList<>(metricsHistory);
        }
    }
}
