package com.oop.EventTicketingSystem.service;

import com.oop.EventTicketingSystem.model.AuditLog;
import com.oop.EventTicketingSystem.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    public void logAction(String action, String details, Long userId, String userEmail) {
        AuditLog log = new AuditLog(action, details, userId, userEmail);
        auditLogRepository.save(log);
    }

    public List<AuditLog> getAllLogs() {
        return auditLogRepository.findAll();
    }
    
    public List<AuditLog> getLogsByUserId(Long userId) {
        return auditLogRepository.findByUserId(userId);
    }
}
