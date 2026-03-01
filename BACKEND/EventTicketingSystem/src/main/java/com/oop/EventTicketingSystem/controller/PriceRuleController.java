package com.oop.EventTicketingSystem.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.oop.EventTicketingSystem.model.PriceRule;
import com.oop.EventTicketingSystem.payload.request.PriceRuleRequest;
import com.oop.EventTicketingSystem.security.UserPrincipal;
import com.oop.EventTicketingSystem.service.PriceRuleService;

@RestController
@RequestMapping("/api/price-rules")
public class PriceRuleController {

    @Autowired
    private PriceRuleService priceRuleService;

    /**
     * Create a new price rule for a ticket type.
     * Only the organizer who owns the event can create rules.
     */
    @PostMapping
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<PriceRule> createPriceRule(
            @RequestBody PriceRuleRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        boolean isAdmin = userPrincipal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        Long requesterId = userPrincipal.getId();
        
        // Verify ownership (skip for admin)
        if (!isAdmin) {
            priceRuleService.verifyTicketTypeOwnership(request.getTicketTypeId(), requesterId);
        }
        
        PriceRule rule = priceRuleService.createPriceRule(
                request.getTicketTypeId(),
                request.getConditionType(),
                request.getSoldThreshold(),
                request.getTriggerDate(),
                request.getNewPrice(),
                request.getTierName(),
                request.getPriority() != null ? request.getPriority() : 0
        );
        return ResponseEntity.ok(rule);
    }

    /**
     * Get all price rules for a ticket type.
     * Only the organizer who owns the event can view rules.
     */
    @GetMapping("/ticket-type/{ticketTypeId}")
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<List<PriceRule>> getRulesForTicketType(
            @PathVariable Long ticketTypeId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        boolean isAdmin = userPrincipal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        Long requesterId = userPrincipal.getId();
        
        // Verify ownership (skip for admin)
        if (!isAdmin) {
            priceRuleService.verifyTicketTypeOwnership(ticketTypeId, requesterId);
        }
        
        List<PriceRule> rules = priceRuleService.getRulesForTicketType(ticketTypeId);
        return ResponseEntity.ok(rules);
    }

    /**
     * Delete a price rule.
     * Only the organizer who owns the event can delete rules.
     */
    @DeleteMapping("/{ruleId}")
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteRule(
            @PathVariable Long ruleId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        boolean isAdmin = userPrincipal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        Long requesterId = userPrincipal.getId();
        
        // Verify ownership via the rule (skip for admin)
        if (!isAdmin) {
            priceRuleService.verifyRuleOwnership(ruleId, requesterId);
        }
        
        priceRuleService.deleteRule(ruleId);
        return ResponseEntity.ok().build();
    }

    /**
     * Get pricing urgency info for a ticket type (for FOMO display).
     * Public endpoint for customers.
     */
    @GetMapping("/urgency/{ticketTypeId}")
    public ResponseEntity<PriceRuleService.PricingUrgencyInfo> getUrgencyInfo(@PathVariable Long ticketTypeId) {
        PriceRuleService.PricingUrgencyInfo info = priceRuleService.getUrgencyInfo(ticketTypeId);
        return ResponseEntity.ok(info);
    }
}

