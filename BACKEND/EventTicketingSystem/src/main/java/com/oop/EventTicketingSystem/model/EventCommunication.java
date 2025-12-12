package com.oop.EventTicketingSystem.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "event_communications")
public class EventCommunication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", unique = true, nullable = false)
    @JsonBackReference
    private Event event;

    // 7 Days Before
    private boolean reminder7dEnabled = false;
    private String reminder7dSubject = "Your event is in one week!";
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String reminder7dBody;
    private boolean isSent7d = false;

    // 48 Hours Before
    private boolean reminder48hEnabled = true;
    private String reminder48hSubject = "48 hours to go! Don't forget your ticket.";
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String reminder48hBody;
    private boolean isSent48h = false;

    // 2 Hours Before
    private boolean reminder2hEnabled = true;
    private String reminder2hSubject = "Doors open in 2 hours!";
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String reminder2hBody;
    private boolean isSent2h = false;

    public EventCommunication() {
    }

    public EventCommunication(Event event) {
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

    public boolean isReminder7dEnabled() {
        return reminder7dEnabled;
    }

    public void setReminder7dEnabled(boolean reminder7dEnabled) {
        this.reminder7dEnabled = reminder7dEnabled;
    }

    public String getReminder7dSubject() {
        return reminder7dSubject;
    }

    public void setReminder7dSubject(String reminder7dSubject) {
        this.reminder7dSubject = reminder7dSubject;
    }

    public String getReminder7dBody() {
        return reminder7dBody;
    }

    public void setReminder7dBody(String reminder7dBody) {
        this.reminder7dBody = reminder7dBody;
    }

    public boolean isSent7d() {
        return isSent7d;
    }

    public void setSent7d(boolean sent7d) {
        isSent7d = sent7d;
    }

    public boolean isReminder48hEnabled() {
        return reminder48hEnabled;
    }

    public void setReminder48hEnabled(boolean reminder48hEnabled) {
        this.reminder48hEnabled = reminder48hEnabled;
    }

    public String getReminder48hSubject() {
        return reminder48hSubject;
    }

    public void setReminder48hSubject(String reminder48hSubject) {
        this.reminder48hSubject = reminder48hSubject;
    }

    public String getReminder48hBody() {
        return reminder48hBody;
    }

    public void setReminder48hBody(String reminder48hBody) {
        this.reminder48hBody = reminder48hBody;
    }

    public boolean isSent48h() {
        return isSent48h;
    }

    public void setSent48h(boolean sent48h) {
        isSent48h = sent48h;
    }

    public boolean isReminder2hEnabled() {
        return reminder2hEnabled;
    }

    public void setReminder2hEnabled(boolean reminder2hEnabled) {
        this.reminder2hEnabled = reminder2hEnabled;
    }

    public String getReminder2hSubject() {
        return reminder2hSubject;
    }

    public void setReminder2hSubject(String reminder2hSubject) {
        this.reminder2hSubject = reminder2hSubject;
    }

    public String getReminder2hBody() {
        return reminder2hBody;
    }

    public void setReminder2hBody(String reminder2hBody) {
        this.reminder2hBody = reminder2hBody;
    }

    public boolean isSent2h() {
        return isSent2h;
    }

    public void setSent2h(boolean sent2h) {
        isSent2h = sent2h;
    }
}
