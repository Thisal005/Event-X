package com.oop.EventTicketingSystem.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private HtmlToImageService htmlToImageService;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendHtmlEmail(String to, String subject, String htmlBody) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true); // true indicates multipart message

        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlBody, true); // true indicates HTML

        mailSender.send(message);
    }

    public void sendOrderConfirmationEmail(String to, String subject, com.oop.EventTicketingSystem.model.Order order, java.util.Map<Long, byte[]> ticketImages) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);

        StringBuilder htmlContent = new StringBuilder();
        htmlContent.append("<!DOCTYPE html>");
        htmlContent.append("<html><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'></head>");
        htmlContent.append("<body style='margin: 0; padding: 0; background-color: #f5f5f7; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif;'>");
        
        // Email container
        htmlContent.append("<div style='max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);'>");
        
        // Header
        htmlContent.append("<div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;'>");
        htmlContent.append("<h1 style='margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;'>Order Confirmed! 🎉</h1>");
        htmlContent.append("<p style='margin: 12px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;'>Your tickets are ready</p>");
        htmlContent.append("</div>");
        
        // Content
        htmlContent.append("<div style='padding: 40px 30px;'>");
        
        // Greeting
        htmlContent.append("<p style='margin: 0 0 24px 0; color: #1d1d1f; font-size: 16px; line-height: 1.5;'>Hi there,</p>");
        htmlContent.append("<p style='margin: 0 0 32px 0; color: #1d1d1f; font-size: 16px; line-height: 1.5;'>Thank you for your order! Your tickets have been confirmed and are attached below.</p>");
        
        // Order Summary Box
        htmlContent.append("<div style='background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 32px;'>");
        htmlContent.append("<div style='margin-bottom: 12px;'>");
        htmlContent.append("<table style='width: 100%; border-collapse: collapse;'><tr>");
        htmlContent.append("<td style='color: #6b7280; font-size: 14px; text-align: left;'>Order ID</td>");
        htmlContent.append("<td style='color: #1d1d1f; font-size: 14px; font-weight: 600; text-align: right;'>#").append(order.getId()).append("</td>");
        htmlContent.append("</tr></table>");
        htmlContent.append("</div>");
        htmlContent.append("<div>");
        htmlContent.append("<table style='width: 100%; border-collapse: collapse;'><tr>");
        htmlContent.append("<td style='color: #6b7280; font-size: 14px; text-align: left;'>Total Amount</td>");
        htmlContent.append("<td style='color: #667eea; font-size: 18px; font-weight: 700; text-align: right;'>$").append(order.getTotalAmount()).append("</td>");
        htmlContent.append("</tr></table>");
        htmlContent.append("</div>");
        htmlContent.append("</div>");

        // Tickets Section
        htmlContent.append("<h2 style='margin: 0 0 20px 0; color: #1d1d1f; font-size: 20px; font-weight: 700;'>Your Tickets</h2>");

        // Map to store inline resources
        java.util.Map<String, byte[]> inlineImages = new java.util.HashMap<>();

        for (com.oop.EventTicketingSystem.model.OrderItem item : order.getOrderItems()) {
            com.oop.EventTicketingSystem.model.TicketType tt = item.getTicketType();
            com.oop.EventTicketingSystem.model.Event event = tt.getEvent();

            // Event Card
            htmlContent.append("<div style='border: 1px solid #e5e7eb; border-radius: 10px; margin-bottom: 24px; overflow: hidden;'>");
            
            // Event Header
            htmlContent.append("<div style='background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%); padding: 20px 24px; border-bottom: 1px solid #e5e7eb;'>");
            htmlContent.append("<h3 style='margin: 0 0 12px 0; color: #1d1d1f; font-size: 18px; font-weight: 700;'>").append(event.getName()).append("</h3>");
            htmlContent.append("<div style='margin-bottom: 6px;'>");
            htmlContent.append("<span style='color: #6b7280; font-size: 14px;'>📍 </span>");
            htmlContent.append("<span style='color: #6b7280; font-size: 14px;'>").append(event.getVenue()).append("</span>");
            htmlContent.append("</div>");
            htmlContent.append("<div>");
            htmlContent.append("<span style='color: #6b7280; font-size: 14px;'>📅 </span>");
            htmlContent.append("<span style='color: #6b7280; font-size: 14px;'>").append(event.getDate()).append("</span>");
            htmlContent.append("</div>");
            htmlContent.append("</div>");
            
            // Tickets
            if (item.getTickets() != null) {
                for (com.oop.EventTicketingSystem.model.Ticket ticket : item.getTickets()) {
                    String cid = "qr-" + ticket.getId();
                    
                    htmlContent.append("<div style='padding: 20px 24px; border-bottom: 1px dashed #e5e7eb;'>");
                    htmlContent.append("<table style='width: 100%; border-collapse: collapse;'><tr>");
                    
                    // Left side - Ticket info
                    htmlContent.append("<td style='vertical-align: middle;'>");
                    htmlContent.append("<div style='display: inline-block; background-color: #667eea; color: #ffffff; padding: 4px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;'>").append(tt.getName()).append("</div>");
                    htmlContent.append("<div style='color: #6b7280; font-size: 13px; margin-bottom: 4px;'>Ticket #").append(ticket.getId()).append("</div>");
                    htmlContent.append("<div style='color: #667eea; font-size: 18px; font-weight: 700;'>$").append(tt.getPrice()).append("</div>");
                    htmlContent.append("</td>");
                    
                    // Right side - QR Code
                    htmlContent.append("<td style='text-align: center; vertical-align: middle; width: 120px;'>");
                    if (ticket.getQrCode() != null) {
                        htmlContent.append("<div style='background-color: #ffffff; padding: 8px; border: 2px solid #e5e7eb; border-radius: 8px; display: inline-block;'>");
                        htmlContent.append("<img src='cid:").append(cid).append("' alt='QR Code' style='width: 80px; height: 80px; display: block;'/>");
                        htmlContent.append("</div>");
                        try {
                            byte[] imageBytes = java.util.Base64.getDecoder().decode(ticket.getQrCode());
                            inlineImages.put(cid, imageBytes);
                        } catch (IllegalArgumentException e) {
                            System.err.println("Failed to decode QR code for ticket " + ticket.getId());
                        }
                    }
                    htmlContent.append("</td>");
                    
                    htmlContent.append("</tr></table>");
                    htmlContent.append("</div>");
                }
            }
            
            htmlContent.append("</div>");
        }

        // Footer message
        htmlContent.append("<div style='margin-top: 32px; padding: 24px; background-color: #f9fafb; border-radius: 8px; text-align: center;'>");
        htmlContent.append("<p style='margin: 0 0 8px 0; color: #1d1d1f; font-size: 16px; font-weight: 600;'>Have an amazing time! 🎊</p>");
        htmlContent.append("<p style='margin: 0; color: #6b7280; font-size: 14px;'>Show your QR code at the venue entrance</p>");
        htmlContent.append("</div>");
        
        htmlContent.append("</div>");
        
        // Footer
        htmlContent.append("<div style='background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;'>");
        htmlContent.append("<p style='margin: 0 0 8px 0; color: #667eea; font-size: 16px; font-weight: 700;'>GoGather.COM</p>");
        htmlContent.append("<p style='margin: 0; color: #9ca3af; font-size: 12px;'>Questions? Contact our support team</p>");
        htmlContent.append("</div>");
        
        htmlContent.append("</div>");
        htmlContent.append("</body></html>");

        helper.setText(htmlContent.toString(), true);

        // Add inline images
        for (java.util.Map.Entry<String, byte[]> entry : inlineImages.entrySet()) {
            helper.addInline(entry.getKey(), new org.springframework.core.io.ByteArrayResource(entry.getValue()), "image/png");
        }

        mailSender.send(message);
    }


    /**
     * Sends the order confirmation as an image attachment.
     * Uses Playwright to render HTML to image.
     */
    public void sendOrderConfirmationWithImage(String to, String subject, com.oop.EventTicketingSystem.model.Order order) throws MessagingException {
        // Build the HTML content for the order confirmation
        String htmlContent = buildOrderConfirmationHtml(order);
        
        // Convert HTML to image using Playwright
        byte[] imageBytes = htmlToImageService.convertHtmlToImage(htmlContent, 700, 400);
        
        // Create email with image attachment
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        
        // Modern email body with updated styling
        String emailBody = "<!DOCTYPE html>" +
                "<html><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'></head>" +
                "<body style='margin: 0; padding: 0; background-color: #f5f5f7; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif;'>" +
                "<div style='max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);'>" +
                "<div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;'>" +
                "<h1 style='margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;'>Order Confirmed! 🎉</h1>" +
                "<p style='margin: 12px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;'>Your tickets are ready</p>" +
                "</div>" +
                "<div style='padding: 40px 30px;'>" +
                "<p style='margin: 0 0 24px 0; color: #1d1d1f; font-size: 16px; line-height: 1.5;'>Hi there,</p>" +
                "<p style='margin: 0 0 32px 0; color: #1d1d1f; font-size: 16px; line-height: 1.5;'>Thank you for your purchase! Your order confirmation is attached as an image.</p>" +
                "<div style='background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 32px;'>" +
                "<table style='width: 100%; border-collapse: collapse;'>" +
                "<tr><td style='color: #6b7280; font-size: 14px; padding-bottom: 12px;'>Order ID</td>" +
                "<td style='color: #1d1d1f; font-size: 14px; font-weight: 600; text-align: right;'>#" + order.getId() + "</td></tr>" +
                "<tr><td style='color: #6b7280; font-size: 14px;'>Total Amount</td>" +
                "<td style='color: #667eea; font-size: 18px; font-weight: 700; text-align: right;'>$" + order.getTotalAmount() + "</td></tr>" +
                "</table>" +
                "</div>" +
                "<div style='margin-top: 32px; padding: 24px; background-color: #f9fafb; border-radius: 8px; text-align: center;'>" +
                "<p style='margin: 0 0 8px 0; color: #1d1d1f; font-size: 16px; font-weight: 600;'>Have an amazing time! 🎊</p>" +
                "<p style='margin: 0; color: #6b7280; font-size: 14px;'>Show your QR code at the venue entrance</p>" +
                "</div>" +
                "</div>" +
                "<div style='background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;'>" +
                "<p style='margin: 0 0 8px 0; color: #667eea; font-size: 16px; font-weight: 700;'>GoGather.COM</p>" +
                "<p style='margin: 0; color: #9ca3af; font-size: 12px;'>Questions? Contact our support team</p>" +
                "</div>" +
                "</div>" +
                "</body></html>";
        
        helper.setText(emailBody, true);
        
        // Attach the order confirmation image
        helper.addAttachment("order_confirmation_" + order.getId() + ".png", 
                new org.springframework.core.io.ByteArrayResource(imageBytes), "image/png");

        mailSender.send(message);
    }

    /**
     * Builds a comprehensive HTML document for the order confirmation ticket.
     * This HTML will be converted to an image by Playwright.
     */
    private String buildOrderConfirmationHtml(com.oop.EventTicketingSystem.model.Order order) {
        StringBuilder html = new StringBuilder();
        
        // HTML document with embedded CSS for proper rendering
        html.append("<!DOCTYPE html>");
        html.append("<html><head><meta charset='UTF-8'>");
        html.append("<style>");
        html.append("body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }");
        html.append(".ticket-container { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.15); margin-bottom: 20px; max-width: 650px; }");
        html.append(".ticket-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; }");
        html.append(".ticket-header h1 { margin: 0; font-size: 24px; }");
        html.append(".ticket-body { display: flex; }");
        html.append(".ticket-info { flex: 1; padding: 20px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; }");
        html.append(".ticket-qr { width: 150px; padding: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: white; }");
        html.append(".ticket-qr img { width: 120px; height: 120px; }");
        html.append(".badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 12px; margin-bottom: 10px; }");
        html.append(".info-row { margin: 8px 0; font-size: 14px; }");
        html.append(".price { font-size: 28px; font-weight: bold; margin-top: 15px; }");
        html.append(".ticket-id { font-size: 12px; color: #666; margin-top: 8px; }");
        html.append("</style></head><body>");

        // Order header
        html.append("<div style='text-align: center; margin-bottom: 20px;'>");
        html.append("<h2 style='color: #333;'>Order #").append(order.getId()).append("</h2>");
        html.append("<p style='color: #666;'>Total: $").append(order.getTotalAmount()).append("</p>");
        html.append("</div>");

        // Generate ticket cards for each ticket
        for (com.oop.EventTicketingSystem.model.OrderItem item : order.getOrderItems()) {
            com.oop.EventTicketingSystem.model.TicketType tt = item.getTicketType();
            com.oop.EventTicketingSystem.model.Event event = tt.getEvent();

            if (item.getTickets() != null) {
                for (com.oop.EventTicketingSystem.model.Ticket ticket : item.getTickets()) {
                    html.append("<div class='ticket-container'>");
                    
                    // Header
                    html.append("<div class='ticket-header'>");
                    html.append("<h1>").append(event.getName()).append("</h1>");
                    html.append("</div>");
                    
                    html.append("<div class='ticket-body'>");
                    
                    // Info section
                    html.append("<div class='ticket-info'>");
                    html.append("<span class='badge'>").append(tt.getName()).append("</span>");
                    html.append("<div class='info-row'>📅 ").append(event.getDate()).append("</div>");
                    html.append("<div class='info-row'>📍 ").append(event.getVenue()).append("</div>");
                    html.append("<div class='price'>$").append(tt.getPrice()).append("</div>");
                    html.append("</div>");
                    
                    // QR Code section
                    html.append("<div class='ticket-qr'>");
                    if (ticket.getQrCode() != null) {
                        html.append("<img src='data:image/png;base64,").append(ticket.getQrCode()).append("' alt='QR Code'/>");
                    }
                    html.append("<div class='ticket-id'>Ticket #").append(ticket.getId()).append("</div>");
                    html.append("</div>");
                    
                    html.append("</div>"); // ticket-body
                    html.append("</div>"); // ticket-container
                }
            }
        }

        html.append("</body></html>");
        return html.toString();
    }

    public void sendTicketEmailWithAttachment(String to, String subject, String body, byte[] attachmentData, String filename) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(body, true);

        if (attachmentData != null && attachmentData.length > 0) {
            helper.addAttachment(filename, new org.springframework.core.io.ByteArrayResource(attachmentData));
        }

        mailSender.send(message);
    }
}