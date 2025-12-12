package com.oop.EventTicketingSystem.payload.request;

public class GatekeeperLoginRequest {

    private String token;

    public GatekeeperLoginRequest() {
    }

    public GatekeeperLoginRequest(String token) {
        this.token = token;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
