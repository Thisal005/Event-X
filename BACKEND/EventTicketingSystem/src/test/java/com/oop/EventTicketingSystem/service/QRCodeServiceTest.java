package com.oop.EventTicketingSystem.service;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class QRCodeServiceTest {

    @Autowired
    private QRCodeService qrCodeService;

    @Test
    public void testGenerateAndValidatePayload() throws Exception {
        Long ticketId = 12345L;
        
        // 1. Generate Payload
        String payload = qrCodeService.generatePayload(ticketId);
        assertNotNull(payload);
        System.out.println("Generated Payload: " + payload);

        // 2. Validate Payload
        boolean isValid = qrCodeService.validatePayload(payload);
        assertTrue(isValid, "Payload should be valid");

        // 3. Extract Ticket ID
        Long extractedId = qrCodeService.extractTicketId(payload);
        assertEquals(ticketId, extractedId, "Extracted Ticket ID should match original");
        
        // 4. Test Tampering
        String tamperedPayload = payload + "1";
        boolean isTamperedValid = qrCodeService.validatePayload(tamperedPayload);
        assertTrue(!isTamperedValid, "Tampered payload should be invalid");
    }
}
