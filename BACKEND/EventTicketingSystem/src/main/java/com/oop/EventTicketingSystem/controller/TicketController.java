package com.oop.EventTicketingSystem.controller;

import com.oop.EventTicketingSystem.service.TicketValidationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private TicketValidationService ticketValidationService;

    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateTicket(@RequestBody Map<String, String> request) {
        String qrData = request.get("qrData");
        Map<String, Object> result = ticketValidationService.validateTicket(qrData);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/redeem")
    public ResponseEntity<Map<String, Object>> redeemTicket(@RequestBody Map<String, String> request) {
        String qrData = request.get("qrData");
        Map<String, Object> result = ticketValidationService.redeemTicket(qrData);
        return ResponseEntity.ok(result);
    }
}
