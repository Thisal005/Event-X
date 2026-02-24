package com.oop.EventTicketingSystem.dto.response;

import com.oop.EventTicketingSystem.model.Event;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Response DTO for Event entity.
 * Hides internal implementation details and prevents entity exposure.
 */
public class EventResponse {

    private Long id;
    private String name;
    private String description;
    private LocalDateTime date;
    private String venue;
    private String bannerImage;
    private String category;
    private String status;
    private String approvalStatus;
    private OrganizerInfo organizer;
    private List<TicketTypeInfo> ticketTypes;

    public EventResponse() {
    }

    private EventResponse(Builder builder) {
        this.id = builder.id;
        this.name = builder.name;
        this.description = builder.description;
        this.date = builder.date;
        this.venue = builder.venue;
        this.bannerImage = builder.bannerImage;
        this.category = builder.category;
        this.status = builder.status;
        this.approvalStatus = builder.approvalStatus;
        this.organizer = builder.organizer;
        this.ticketTypes = builder.ticketTypes;
    }

    /**
     * Convert Event entity to EventResponse DTO.
     */
    public static EventResponse fromEntity(Event event) {
        if (event == null) {
            return null;
        }

        OrganizerInfo organizerInfo = null;
        if (event.getOrganizer() != null) {
            organizerInfo = new OrganizerInfo(
                    event.getOrganizer().getId(),
                    event.getOrganizer().getName(),
                    event.getOrganizer().getEmail()
            );
        }

        List<TicketTypeInfo> ticketTypeInfos = null;
        if (event.getTicketTypes() != null) {
            ticketTypeInfos = event.getTicketTypes().stream()
                    .map(tt -> new TicketTypeInfo(
                            tt.getId(),
                            tt.getName(),
                            tt.getPrice() != null ? tt.getPrice().doubleValue() : null,
                            tt.getQuantity(),
                            tt.getSold()
                    ))
                    .collect(Collectors.toList());
        }

        return EventResponse.builder()
                .id(event.getId())
                .name(event.getName())
                .description(event.getDescription())
                .date(event.getDate())
                .venue(event.getVenue())
                .bannerImage(event.getBannerImage())
                .category(event.getCategory())
                .status(event.getStatus() != null ? event.getStatus().name() : null)
                .approvalStatus(event.getApprovalStatus() != null ? event.getApprovalStatus().name() : null)
                .organizer(organizerInfo)
                .ticketTypes(ticketTypeInfos)
                .build();
    }

    public static Builder builder() {
        return new Builder();
    }

    // --- Getters ---

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public String getVenue() {
        return venue;
    }

    public String getBannerImage() {
        return bannerImage;
    }

    public String getCategory() {
        return category;
    }

    public String getStatus() {
        return status;
    }

    public String getApprovalStatus() {
        return approvalStatus;
    }

    public OrganizerInfo getOrganizer() {
        return organizer;
    }

    public List<TicketTypeInfo> getTicketTypes() {
        return ticketTypes;
    }

    // --- Nested DTOs ---

    public static class OrganizerInfo {
        private Long id;
        private String name;
        private String email;

        public OrganizerInfo() {
        }

        public OrganizerInfo(Long id, String name, String email) {
            this.id = id;
            this.name = name;
            this.email = email;
        }

        public Long getId() {
            return id;
        }

        public String getName() {
            return name;
        }

        public String getEmail() {
            return email;
        }
    }

    public static class TicketTypeInfo {
        private Long id;
        private String name;
        private Double price;
        private Integer quantity;
        private Integer soldCount;

        public TicketTypeInfo() {
        }

        public TicketTypeInfo(Long id, String name, Double price, Integer quantity, Integer soldCount) {
            this.id = id;
            this.name = name;
            this.price = price;
            this.quantity = quantity;
            this.soldCount = soldCount;
        }

        public Long getId() {
            return id;
        }

        public String getName() {
            return name;
        }

        public Double getPrice() {
            return price;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public Integer getSoldCount() {
            return soldCount;
        }
    }

    // --- Builder ---

    public static class Builder {
        private Long id;
        private String name;
        private String description;
        private LocalDateTime date;
        private String venue;
        private String bannerImage;
        private String category;
        private String status;
        private String approvalStatus;
        private OrganizerInfo organizer;
        private List<TicketTypeInfo> ticketTypes;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder description(String description) {
            this.description = description;
            return this;
        }

        public Builder date(LocalDateTime date) {
            this.date = date;
            return this;
        }

        public Builder venue(String venue) {
            this.venue = venue;
            return this;
        }

        public Builder bannerImage(String bannerImage) {
            this.bannerImage = bannerImage;
            return this;
        }

        public Builder category(String category) {
            this.category = category;
            return this;
        }

        public Builder status(String status) {
            this.status = status;
            return this;
        }

        public Builder approvalStatus(String approvalStatus) {
            this.approvalStatus = approvalStatus;
            return this;
        }

        public Builder organizer(OrganizerInfo organizer) {
            this.organizer = organizer;
            return this;
        }

        public Builder ticketTypes(List<TicketTypeInfo> ticketTypes) {
            this.ticketTypes = ticketTypes;
            return this;
        }

        public EventResponse build() {
            return new EventResponse(this);
        }
    }
}
