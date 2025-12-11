package com.oop.EventTicketingSystem.repository;

import com.oop.EventTicketingSystem.model.EventGatekeeperToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface GatekeeperRepository extends JpaRepository<EventGatekeeperToken, String> {

    Optional<EventGatekeeperToken> findByToken(String token);

    List<EventGatekeeperToken> findByEventId(Long eventId);

    List<EventGatekeeperToken> findByEventIdAndUsedFalse(Long eventId);

    // For cleanup of old tokens
    List<EventGatekeeperToken> findByExpiresAtBefore(Instant instant);
}
