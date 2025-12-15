package com.oop.EventTicketingSystem.repository;

import com.oop.EventTicketingSystem.model.EventLiveData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EventLiveDataRepository extends JpaRepository<EventLiveData, Long> {
    
    Optional<EventLiveData> findByEventId(Long eventId);
    
    boolean existsByEventId(Long eventId);
}
