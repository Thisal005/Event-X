package com.oop.EventTicketingSystem.aop;

import com.oop.EventTicketingSystem.security.UserPrincipal;
import com.oop.EventTicketingSystem.service.AuditLogService;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class LoggingAspect {

    @Autowired
    private AuditLogService auditLogService;


    // Pointcut to target all methods in Controller package
    @Pointcut("within(com.oop.EventTicketingSystem.controller..*)")
    public void controllerMethods() {}

    @AfterReturning(pointcut = "controllerMethods()", returning = "result")
    public void logAfterControllerMethod(JoinPoint joinPoint, Object result) {
        try {
            // Get method details
            String methodName = joinPoint.getSignature().getName();
            String className = joinPoint.getTarget().getClass().getSimpleName();
            
            // Only log modification methods (start with create, update, delete, approve, reject, start, end, publish)
            // Or log methods dealing with specific annotations if available.
            // For now, let's filter by generic "write" keywords in method names
            if (!isWriteOperation(methodName)) {
                return;
            }

            // Get Current User
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                return;
            }

            Object principal = auth.getPrincipal();
            Long userId = null;
            String userEmail = null;

            if (principal instanceof UserPrincipal) {
                UserPrincipal userPrincipal = (UserPrincipal) principal;
                userId = userPrincipal.getId();
                userEmail = userPrincipal.getEmail();
            }

            if (userEmail != null) {
                String action = className + "." + methodName;
                String details = "User " + userEmail + " performed " + methodName;
                
                // Try to capture arguments for more details
                Object[] args = joinPoint.getArgs();
                if (args.length > 0) {
                     details += " with args: " + truncate(args[0].toString(), 100);
                }

                auditLogService.logAction(action, details, userId, userEmail);
            }

        } catch (Exception e) {
            // Do not fail the request if logging fails
            System.err.println("Audit Log Failed: " + e.getMessage());
        }
    }

    private boolean isWriteOperation(String methodName) {
        String lower = methodName.toLowerCase();
        return lower.startsWith("create") || 
               lower.startsWith("add") ||
               lower.startsWith("update") || 
               lower.startsWith("delete") || 
               lower.startsWith("remove") || 
               lower.startsWith("approve") || 
               lower.startsWith("reject") ||
               lower.startsWith("publish") ||
               lower.startsWith("cancel") ||
               lower.startsWith("enable") ||
               lower.startsWith("disable") ||
               lower.startsWith("start") ||
               lower.startsWith("end") ||
               lower.startsWith("set");
    }

    private String truncate(String str, int width) {
        if (str == null) return null;
        if (str.length() <= width) return str;
        return str.substring(0, width) + "...";
    }
}
