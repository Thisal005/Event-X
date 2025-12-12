package com.oop.EventTicketingSystem.payload.response;

public class GatekeeperLoginResponse {

    private String accessToken;
    private Long eventId;
    private String eventName;
    private String tokenType = "Bearer";

    public GatekeeperLoginResponse(String accessToken, Long eventId, String eventName) {
        this.accessToken = accessToken;
        this.eventId = eventId;
        this.eventName = eventName;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public String getEventName() {
        return eventName;
    }

    public void setEventName(String eventName) {
        this.eventName = eventName;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }
}
