package com.oop.EventTicketingSystem.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "flash_polls")
public class FlashPoll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String question;

    @ElementCollection
    @CollectionTable(name = "flash_poll_options", joinColumns = @JoinColumn(name = "poll_id"))
    @Column(name = "option_text")
    private List<String> options = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "flash_poll_votes", joinColumns = @JoinColumn(name = "poll_id"))
    @MapKeyColumn(name = "option_text")
    @Column(name = "vote_count")
    private Map<String, Integer> votes = new HashMap<>();

    private boolean closed = false;

    public FlashPoll() {
    }

    public FlashPoll(String question, List<String> options) {
        this.question = question;
        this.options = options;
        // Initialize votes for each option
        for (String option : options) {
            this.votes.put(option, 0);
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public List<String> getOptions() {
        return options;
    }

    public void setOptions(List<String> options) {
        this.options = options;
    }

    public Map<String, Integer> getVotes() {
        return votes;
    }

    public void setVotes(Map<String, Integer> votes) {
        this.votes = votes;
    }

    public boolean isClosed() {
        return closed;
    }

    public void setClosed(boolean closed) {
        this.closed = closed;
    }

    public void addVote(String option) {
        if (options.contains(option) && !closed) {
            votes.put(option, votes.getOrDefault(option, 0) + 1);
        }
    }
}
