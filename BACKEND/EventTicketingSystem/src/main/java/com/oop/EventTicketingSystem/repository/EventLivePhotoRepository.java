package com.oop.EventTicketingSystem.repository;

import com.oop.EventTicketingSystem.model.EventLivePhoto;
import com.oop.EventTicketingSystem.model.EventLivePhoto.PhotoStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventLivePhotoRepository extends JpaRepository<EventLivePhoto, Long> {
    
    List<EventLivePhoto> findByEventIdAndStatusOrderByCreatedAtDesc(Long eventId, PhotoStatus status);
    
    List<EventLivePhoto> findByEventIdOrderByCreatedAtDesc(Long eventId);
    
    List<EventLivePhoto> findByEventIdAndStatusOrderByApprovedAtDesc(Long eventId, PhotoStatus status);
    
    long countByEventIdAndStatus(Long eventId, PhotoStatus status);

    long countByEventIdAndUserId(Long eventId, Long userId);

    @Modifying
    void deleteByEventIdAndStatus(Long eventId, PhotoStatus status);
}

