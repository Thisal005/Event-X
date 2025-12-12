package com.oop.EventTicketingSystem.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "lost_and_found_posts")
public class LostAndFoundPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String message;

    @Column(nullable = false)
    private LocalDateTime postedAt;

    @Enumerated(EnumType.STRING)
    private PostType type = PostType.FOUND;

    public enum PostType {
        LOST,
        FOUND
    }

    public LostAndFoundPost() {
        this.postedAt = LocalDateTime.now();
    }

    public LostAndFoundPost(String message, PostType type) {
        this.message = message;
        this.type = type;
        this.postedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getPostedAt() {
        return postedAt;
    }

    public void setPostedAt(LocalDateTime postedAt) {
        this.postedAt = postedAt;
    }

    public PostType getType() {
        return type;
    }

    public void setType(PostType type) {
        this.type = type;
    }
}
