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

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('SINGLE', 'DUAL', 'TRIPLE') DEFAULT 'SINGLE'")
    private LayoutMode layoutMode = LayoutMode.SINGLE;

    @Embedded
    private BigScreenBackground bigScreenBackground;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "type", column = @Column(name = "bg_left_type")),
        @AttributeOverride(name = "url", column = @Column(name = "bg_left_url")),
        @AttributeOverride(name = "loop", column = @Column(name = "bg_left_loop")),
        @AttributeOverride(name = "opacity", column = @Column(name = "bg_left_opacity"))
    })
    private BigScreenBackground leftBackground;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "type", column = @Column(name = "bg_right_type")),
        @AttributeOverride(name = "url", column = @Column(name = "bg_right_url")),
        @AttributeOverride(name = "loop", column = @Column(name = "bg_right_loop")),
        @AttributeOverride(name = "opacity", column = @Column(name = "bg_right_opacity"))
    })
    private BigScreenBackground rightBackground;

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

    public LayoutMode getLayoutMode() {
        return layoutMode;
    }

    public void setLayoutMode(LayoutMode layoutMode) {
        this.layoutMode = layoutMode;
    }

    public BigScreenBackground getBigScreenBackground() {
        return bigScreenBackground;
    }

    public void setBigScreenBackground(BigScreenBackground bigScreenBackground) {
        this.bigScreenBackground = bigScreenBackground;
    }

    public BigScreenBackground getLeftBackground() {
        return leftBackground;
    }

    public void setLeftBackground(BigScreenBackground leftBackground) {
        this.leftBackground = leftBackground;
    }

    public BigScreenBackground getRightBackground() {
        return rightBackground;
    }

    public void setRightBackground(BigScreenBackground rightBackground) {
        this.rightBackground = rightBackground;
    }
}
