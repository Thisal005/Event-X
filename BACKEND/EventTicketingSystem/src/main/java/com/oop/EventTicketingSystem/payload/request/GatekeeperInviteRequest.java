package com.oop.EventTicketingSystem.payload.request;

public class GatekeeperInviteRequest {

    private String email;

    public GatekeeperInviteRequest() {
    }

    public GatekeeperInviteRequest(String email) {
        this.email = email;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
