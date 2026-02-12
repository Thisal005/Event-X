package com.oop.EventTicketingSystem.dto.response;

import com.oop.EventTicketingSystem.model.Role;

/**
 * Response DTO for authentication (login/signup).
 */
public class AuthResponse {

    private String token;
    private Long id;
    private String email;
    private String name;
    private Role role;

    public AuthResponse() {
    }

    private AuthResponse(Builder builder) {
        this.token = builder.token;
        this.id = builder.id;
        this.email = builder.email;
        this.name = builder.name;
        this.role = builder.role;
    }

    public static Builder builder() {
        return new Builder();
    }

    // --- Getters ---

    public String getToken() {
        return token;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getName() {
        return name;
    }

    public Role getRole() {
        return role;
    }

    // --- Builder ---

    public static class Builder {
        private String token;
        private Long id;
        private String email;
        private String name;
        private Role role;

        public Builder token(String token) {
            this.token = token;
            return this;
        }

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

        public Builder role(Role role) {
            this.role = role;
            return this;
        }

        public AuthResponse build() {
            return new AuthResponse(this);
        }
    }
}
