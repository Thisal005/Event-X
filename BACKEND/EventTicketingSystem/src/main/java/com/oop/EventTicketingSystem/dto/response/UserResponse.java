package com.oop.EventTicketingSystem.dto.response;

import com.oop.EventTicketingSystem.model.Role;

import java.time.LocalDateTime;

/**
 * Response DTO for user information.
 * Excludes sensitive fields like password.
 */
public class UserResponse {

    private Long id;
    private String email;
    private String name;
    private String imageUrl;
    private Role role;
    private LocalDateTime createdAt;

    public UserResponse() {
    }

    private UserResponse(Builder builder) {
        this.id = builder.id;
        this.email = builder.email;
        this.name = builder.name;
        this.imageUrl = builder.imageUrl;
        this.role = builder.role;
        this.createdAt = builder.createdAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    // --- Getters ---

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getName() {
        return name;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public Role getRole() {
        return role;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    // --- Builder ---

    public static class Builder {
        private Long id;
        private String email;
        private String name;
        private String imageUrl;
        private Role role;
        private LocalDateTime createdAt;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder email(String email) {
            this.email = email;
            return this;
        }

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder imageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
            return this;
        }

        public Builder role(Role role) {
            this.role = role;
            return this;
        }

        public Builder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public UserResponse build() {
            return new UserResponse(this);
        }
    }
}
