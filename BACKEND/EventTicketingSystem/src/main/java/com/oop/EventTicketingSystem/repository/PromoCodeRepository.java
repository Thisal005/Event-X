package com.oop.EventTicketingSystem.repository;

import com.oop.EventTicketingSystem.model.PromoCode;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PromoCodeRepository extends JpaRepository<PromoCode, Long> {
    Optional<PromoCode> findByCode(String code);
    
    // For Organizer: Find codes for their events
    java.util.List<PromoCode> findByEvent_Organizer_Id(Long organizerId);
    
    // For Global codes (Admin)
    java.util.List<PromoCode> findByEventIsNull();

    // For Specific Event
    java.util.List<PromoCode> findByEvent_Id(Long eventId);
    
    // For Admin to see all? findAll() is standard.
}
