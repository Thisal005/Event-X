package com.oop.EventTicketingSystem.model;

import jakarta.persistence.Embeddable;

@Embeddable
public class BigScreenBackground {
    @jakarta.persistence.Column(name = "bg_type")
    private String type; // VIDEO, GRADIENT, IMAGE

    @jakarta.persistence.Column(name = "bg_url")
    private String url;  // URL or CSS value

    @jakarta.persistence.Column(name = "bg_loop")
    private boolean loop;

    @jakarta.persistence.Column(name = "bg_opacity")
    private float opacity;

    public BigScreenBackground() {}

    public BigScreenBackground(String type, String url, boolean loop, float opacity) {
        this.type = type;
        this.url = url;
        this.loop = loop;
        this.opacity = opacity;
    }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public boolean isLoop() { return loop; }
    public void setLoop(boolean loop) { this.loop = loop; }

    public float getOpacity() { return opacity; }
    public void setOpacity(float opacity) { this.opacity = opacity; }
}
