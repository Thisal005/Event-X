package com.oop.EventTicketingSystem.repository;

import com.oop.EventTicketingSystem.model.EventCommunication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface EventCommunicationRepository extends JpaRepository<EventCommunication, Long> {
    Optional<EventCommunication> findByEventId(Long eventId);
}
