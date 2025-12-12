package com.oop.EventTicketingSystem.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "event_live_data")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class EventLiveData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false, unique = true)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "ticketTypes", "organizer"})
    private Event event;

    @Column(length = 1000)
    private String liveMessage; // "What's Happening Now"

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "event_live_data_id")
    @OrderBy("sortOrder ASC, startTime ASC")
    private List<LiveScheduleItem> schedule = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "event_live_data_id")
    @OrderBy("postedAt DESC")
    private List<LostAndFoundPost> lostAndFound = new ArrayList<>();

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "active_poll_id")
    private FlashPoll activePoll; // null = no poll running

    private boolean isLive = false; // Organizer controls when live mode is active

    public EventLiveData() {
    }

    public EventLiveData(Event event) {
        this.event = event;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public String getLiveMessage() {
        return liveMessage;
    }

    public void setLiveMessage(String liveMessage) {
        this.liveMessage = liveMessage;
    }

    public List<LiveScheduleItem> getSchedule() {
        return schedule;
    }

    public void setSchedule(List<LiveScheduleItem> schedule) {
        this.schedule = schedule;
    }

    public List<LostAndFoundPost> getLostAndFound() {
        return lostAndFound;
    }

    public void setLostAndFound(List<LostAndFoundPost> lostAndFound) {
        this.lostAndFound = lostAndFound;
    }

    public FlashPoll getActivePoll() {
        return activePoll;
    }

    public void setActivePoll(FlashPoll activePoll) {
        this.activePoll = activePoll;
    }

    // Helper methods
    public void addScheduleItem(LiveScheduleItem item) {
        this.schedule.add(item);
    }

    public void removeScheduleItem(LiveScheduleItem item) {
        this.schedule.remove(item);
    }

    public void addLostAndFoundPost(LostAndFoundPost post) {
        this.lostAndFound.add(post);
    }

    public void removeLostAndFoundPost(LostAndFoundPost post) {
        this.lostAndFound.remove(post);
    }

    public boolean isLive() {
        return isLive;
    }

    public void setLive(boolean live) {
        isLive = live;
    }
}
