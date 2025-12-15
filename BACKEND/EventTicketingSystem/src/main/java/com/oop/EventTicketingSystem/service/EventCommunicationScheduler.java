package com.oop.EventTicketingSystem.service;

import com.oop.EventTicketingSystem.model.Event;
import com.oop.EventTicketingSystem.model.EventCommunication;
import com.oop.EventTicketingSystem.model.Ticket;
import com.oop.EventTicketingSystem.repository.EventCommunicationRepository;
import com.oop.EventTicketingSystem.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.logging.Logger;

@Component
public class EventCommunicationScheduler {

    private static final Logger logger = Logger.getLogger(EventCommunicationScheduler.class.getName());

    @Autowired
    private EventCommunicationRepository eventCommunicationRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private EmailService emailService;

    @Scheduled(cron = "0 0/5 * * * ?") // Run every 5 minutes
    public void checkAndSendReminders() {
        logger.info("Running EventCommunicationScheduler...");
        List<EventCommunication> communications = eventCommunicationRepository.findAll();

        LocalDateTime now = LocalDateTime.now();

        for (EventCommunication comm : communications) {
            try {
                processCommunication(comm, now);
            } catch (Exception e) {
                logger.severe("Error processing communication for event " + comm.getEvent().getId() + ": " + e.getMessage());
            }
        }
    }

    private void processCommunication(EventCommunication comm, LocalDateTime now) {
        Event event = comm.getEvent();
        if (event == null || event.getStatus() != Event.EventStatus.PUBLISHED) {
            return;
        }

        LocalDateTime eventTime = event.getDate();
        if (eventTime.isBefore(now)) {
            // Event passed, maybe clean up or ignore
            return;
        }

        // 7 Days Reminder
        if (comm.isReminder7dEnabled() && !comm.isSent7d()) {
            long daysUntil = ChronoUnit.DAYS.between(now, eventTime);
            if (daysUntil <= 7) {
                sendEmails(comm, event, comm.getReminder7dSubject(), comm.getReminder7dBody());
                comm.setSent7d(true);
                eventCommunicationRepository.save(comm);
            }
        }

        // 48 Hours Reminder
        if (comm.isReminder48hEnabled() && !comm.isSent48h()) {
            long hoursUntil = ChronoUnit.HOURS.between(now, eventTime);
            if (hoursUntil <= 48) {
                sendEmails(comm, event, comm.getReminder48hSubject(), comm.getReminder48hBody());
                comm.setSent48h(true);
                eventCommunicationRepository.save(comm);
            }
        }

        // 2 Hours Reminder
        if (comm.isReminder2hEnabled() && !comm.isSent2h()) {
            long minutesUntil = ChronoUnit.MINUTES.between(now, eventTime);
            if (minutesUntil <= 120) {
                sendEmails(comm, event, comm.getReminder2hSubject(), comm.getReminder2hBody());
                comm.setSent2h(true);
                eventCommunicationRepository.save(comm);
            }
        }
    }

    private void sendEmails(EventCommunication comm, Event event, String subject, String bodyTemplate) {
        List<Ticket> tickets = ticketRepository.findByOrderItem_TicketType_Event_Id(event.getId());
        Set<String> sentEmails = new HashSet<>();

        logger.info("Sending '" + subject + "' to attendees of event: " + event.getName());

        for (Ticket ticket : tickets) {
            try {
                String email = ticket.getOrderItem().getOrder().getCustomer().getEmail();
                String name = ticket.getOrderItem().getOrder().getCustomer().getName(); // Using name as first name is not available
                
                if (sentEmails.contains(email)) {
                    continue; // Avoid duplicates per event
                }

                String personalizedBody = replacePlaceholders(bodyTemplate, event, name);
                emailService.sendHtmlEmail(email, subject, personalizedBody);
                sentEmails.add(email);
                
            } catch (Exception e) {
                logger.warning("Failed to send email to ticket " + ticket.getId() + ": " + e.getMessage());
            }
        }
    }

    private String replacePlaceholders(String template, Event event, String userName) {
        if (template == null) return "";
        String result = template;
        result = result.replace("{{name}}", userName != null ? userName : "Valued Guest");
        result = result.replace("{{event_name}}", event.getName());
        result = result.replace("{{event_date}}", event.getDate().toString()); 
        result = result.replace("{{venue}}", event.getVenue());
        return result;
    }
}
