package com.oop.EventTicketingSystem.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "events")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "LONGTEXT")
    private String description;

    @Column(nullable = false)
    private LocalDateTime date;

    private String venue;

    private String bannerImage;

    @Column(nullable = false)
    private String category;

    @Enumerated(EnumType.STRING)
    private EventStatus status = EventStatus.DRAFT;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User organizer;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TicketType> ticketTypes = new ArrayList<>();

    @OneToOne(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("event")
    private EventCommunication communication;

    public enum EventStatus {
        DRAFT,
        PUBLISHED,
        CANCELLED,
        POSTPONED
    }

    public enum ApprovalStatus {
        PENDING,
        APPROVED,
        REJECTED
    }

    @Enumerated(EnumType.STRING)
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

    public Event() {
    }

    public Event(String name, String description, LocalDateTime date, String venue, String category, User organizer) {
        this.name = name;
        this.description = description;
        this.date = date;
        this.venue = venue;
        this.category = category;
        this.organizer = organizer;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public String getVenue() {
        return venue;
    }

    public void setVenue(String venue) {
        this.venue = venue;
    }

    public String getBannerImage() {
        return bannerImage;
    }

    public void setBannerImage(String bannerImage) {
        this.bannerImage = bannerImage;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public EventStatus getStatus() {
        return status;
    }

    public void setStatus(EventStatus status) {
        this.status = status;
    }

    public User getOrganizer() {
        return organizer;
    }

    public void setOrganizer(User organizer) {
        this.organizer = organizer;
    }

    public List<TicketType> getTicketTypes() {
        return ticketTypes;
    }

    public void setTicketTypes(List<TicketType> ticketTypes) {
        this.ticketTypes = ticketTypes;
    }

    public EventCommunication getCommunication() {
        return communication;
    }

    public void setCommunication(EventCommunication communication) {
        this.communication = communication;
    }

    public ApprovalStatus getApprovalStatus() {
        return approvalStatus;
    }

    public void setApprovalStatus(ApprovalStatus approvalStatus) {
        this.approvalStatus = approvalStatus;
    }
}
