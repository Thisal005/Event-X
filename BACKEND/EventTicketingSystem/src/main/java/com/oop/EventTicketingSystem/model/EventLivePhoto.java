package com.oop.EventTicketingSystem.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entity representing a photo uploaded by an attendee during a live event.
 * Photos go through moderation before being displayed on the big screen.
 */
@Entity
@Table(name = "event_live_photos")
public class EventLivePhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long eventId;

    @Column
    private Long userId; // Can be null for anonymous uploads

    @Column
    private String userName; // Display name for the photo

    @Column(nullable = false)
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PhotoStatus status = PhotoStatus.PENDING;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column
    private LocalDateTime approvedAt;

    public enum PhotoStatus {
        PENDING,
        APPROVED,
        REJECTED
    }

    // Constructors
    public EventLivePhoto() {}

    public EventLivePhoto(Long eventId, String imageUrl) {
        this.eventId = eventId;
        this.imageUrl = imageUrl;
        this.status = PhotoStatus.PENDING;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public PhotoStatus getStatus() {
        return status;
    }

    public void setStatus(PhotoStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getApprovedAt() {
        return approvedAt;
    }

    public void setApprovedAt(LocalDateTime approvedAt) {
        this.approvedAt = approvedAt;
    }
}
