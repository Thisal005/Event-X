package com.oop.EventTicketingSystem.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

@Service
public class QRCodeService {

    @Value("${app.qr.secret-salt}")
    private String secretSalt;

    public String generateTicketQR(Long ticketId) throws Exception {
        String payload = generatePayload(ticketId);
        return generateQRCodeImage(payload);
    }

    public String generatePayload(Long ticketId) {
        String hash = computeHash(ticketId);
        return ticketId + "." + hash;
    }

    public boolean validatePayload(String payload) {
        try {
            String[] parts = payload.split("\\.");
            if (parts.length != 2) return false;

            Long ticketId = Long.parseLong(parts[0]);
            String providedHash = parts[1];
            String expectedHash = computeHash(ticketId);

            return expectedHash.equals(providedHash);
        } catch (Exception e) {
            return false;
        }
    }

    public Long extractTicketId(String payload) {
        String[] parts = payload.split("\\.");
        return Long.parseLong(parts[0]);
    }

    private String computeHash(Long ticketId) {
        try {
            String input = ticketId + secretSalt;
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedhash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(encodedhash);
        } catch (Exception e) {
            throw new RuntimeException("Error computing hash", e);
        }
    }

    private String generateQRCodeImage(String text) throws Exception {
        QRCodeWriter barcodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = barcodeWriter.encode(text, BarcodeFormat.QR_CODE, 300, 300);

        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", bos);
        byte[] imageBytes = bos.toByteArray();

        return Base64.getEncoder().encodeToString(imageBytes);
    }

    private static String bytesToHex(byte[] hash) {
        StringBuilder hexString = new StringBuilder(2 * hash.length);
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
