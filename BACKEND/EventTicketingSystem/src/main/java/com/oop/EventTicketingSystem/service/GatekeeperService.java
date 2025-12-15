package com.oop.EventTicketingSystem.service;

import com.oop.EventTicketingSystem.model.Event;
import com.oop.EventTicketingSystem.model.EventGatekeeperToken;
import com.oop.EventTicketingSystem.repository.EventRepository;
import com.oop.EventTicketingSystem.repository.GatekeeperRepository;
import com.oop.EventTicketingSystem.security.JwtUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
public class GatekeeperService {

    private static final Logger logger = LoggerFactory.getLogger(GatekeeperService.class);

    @Autowired
    private GatekeeperRepository gatekeeperRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    /**
     * Generate a magic link for a gatekeeper.
     * The link expires 48 hours after the event ends.
     */
    @Transactional
    public String generateMagicLink(Long eventId, String email) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        // Calculate expiry: event date + 48 hours
        LocalDateTime eventDate = event.getDate();
        Instant expiresAt = eventDate
                .atZone(ZoneId.systemDefault())
                .toInstant()
                .plus(48, ChronoUnit.HOURS);

        // Create token entity
        EventGatekeeperToken tokenEntity = new EventGatekeeperToken(eventId, email, expiresAt);
        tokenEntity = gatekeeperRepository.save(tokenEntity);

        String magicLink = frontendUrl + "/gatekeeper/login?token=" + tokenEntity.getToken();

        // Log the magic link (until email service is ready)
        logger.info("=== GATEKEEPER MAGIC LINK ===");
        logger.info("Event: {} (ID: {})", event.getName(), eventId);
        logger.info("Email: {}", email);
        logger.info("Link: {}", magicLink);
        logger.info("Expires: {}", expiresAt);
        logger.info("=============================");

        return magicLink;
    }

    /**
     * Validate a gatekeeper token and return a JWT if valid.
     */
    @Transactional
    public Optional<String> validateAndLogin(String token) {
        Optional<EventGatekeeperToken> optToken = gatekeeperRepository.findByToken(token);

        if (optToken.isEmpty()) {
            logger.warn("Gatekeeper token not found: {}", token);
            return Optional.empty();
        }

        EventGatekeeperToken tokenEntity = optToken.get();

        if (tokenEntity.isUsed()) {
            logger.warn("Gatekeeper token already used: {}", token);
            return Optional.empty();
        }

        if (tokenEntity.isExpired()) {
            logger.warn("Gatekeeper token expired: {}", token);
            return Optional.empty();
        }

        // Mark token as used
        tokenEntity.setUsed(true);
        gatekeeperRepository.save(tokenEntity);

        // Calculate JWT expiration (same as token expiration)
        long expirationMs = tokenEntity.getExpiresAt().toEpochMilli() - Instant.now().toEpochMilli();
        if (expirationMs <= 0) {
            expirationMs = 3600000; // 1 hour fallback
        }

        // Generate JWT with GATEKEEPER authority
        String jwt = jwtUtils.generateGatekeeperToken(
                tokenEntity.getEmail(),
                tokenEntity.getEventId(),
                expirationMs
        );

        logger.info("Gatekeeper logged in successfully for event {}", tokenEntity.getEventId());
        return Optional.of(jwt);
    }

    /**
     * Check if an authenticated gatekeeper has access to a specific event.
     * Used in @PreAuthorize expressions.
     */
    public boolean isValidForEvent(Authentication authentication, Long eventId) {
        if (authentication == null) {
            return false;
        }

        // Check if user has GATEKEEPER authority
        boolean isGatekeeper = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("GATEKEEPER"));

        if (!isGatekeeper) {
            return false;
        }

        // Get the gatekeeperEventId from the token
        Object principal = authentication.getPrincipal();
        if (principal instanceof org.springframework.security.core.userdetails.User) {
            // The gatekeeperEventId is stored as credentials when we create the auth
            Object credentials = authentication.getCredentials();
            if (credentials instanceof Long) {
                return eventId.equals(credentials);
            }
        }

        // Fallback: check if details contain the eventId
        if (authentication.getDetails() instanceof Long) {
            return eventId.equals(authentication.getDetails());
        }

        return false;
    }

    /**
     * Get all active (unused, not expired) gatekeeper tokens for an event.
     */
    public List<EventGatekeeperToken> getActiveTokensForEvent(Long eventId) {
        return gatekeeperRepository.findByEventIdAndUsedFalse(eventId).stream()
                .filter(t -> !t.isExpired())
                .toList();
    }

    /**
     * Get all gatekeeper tokens for an event (including used and expired).
     */
    public List<EventGatekeeperToken> getAllTokensForEvent(Long eventId) {
        return gatekeeperRepository.findByEventId(eventId);
    }

    /**
     * Clean up expired tokens (can be called by a scheduled task).
     */
    @Transactional
    public int cleanupExpiredTokens() {
        List<EventGatekeeperToken> expiredTokens = gatekeeperRepository
                .findByExpiresAtBefore(Instant.now());
        gatekeeperRepository.deleteAll(expiredTokens);
        return expiredTokens.size();
    }
}
