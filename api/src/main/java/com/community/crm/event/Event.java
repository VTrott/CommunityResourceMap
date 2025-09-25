package com.community.crm.event;

// Temporarily comment out imports to fix circular dependency
// import com.community.crm.category.Category;
// import com.community.crm.place.Place;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

// Temporarily comment out @Entity to fix circular dependency
// @Entity
// @Table(name = "events")
public class Event {

    // Temporarily comment out JPA annotations
    // @Id
    // @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    // @Column(name = "name", nullable = false)
    private String name;

    // @Column(name = "description")
    private String description;

    // @Column(name = "start_date", nullable = false)
    private OffsetDateTime startDate;

    // @Column(name = "end_date")
    private OffsetDateTime endDate;

    // Temporarily comment out relationships to fix circular dependency
    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "place_id")
    // private Place place;

    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "category_id")
    // private Category category;

    // @Column(name = "source", nullable = false)
    private String source; // 'google', 'facebook', 'spotify', 'manual'

    // @Column(name = "external_id")
    private String externalId;

    // @Column(name = "external_url")
    private String externalUrl;

    // @Column(name = "is_recurring")
    private Boolean isRecurring = false;

    // @Column(name = "recurrence_pattern", columnDefinition = "jsonb")
    private String recurrencePattern;

    // @Column(name = "status")
    private String status = "active";

    // @Column(name = "created_at")
    private OffsetDateTime createdAt;

    // @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    // Constructors
    public Event() {}

    public Event(String name, String description, OffsetDateTime startDate, String source) {
        this.name = name;
        this.description = description;
        this.startDate = startDate;
        this.source = source;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public OffsetDateTime getStartDate() { return startDate; }
    public void setStartDate(OffsetDateTime startDate) { this.startDate = startDate; }

    public OffsetDateTime getEndDate() { return endDate; }
    public void setEndDate(OffsetDateTime endDate) { this.endDate = endDate; }

    // Temporarily comment out relationship methods
    // public Place getPlace() { return place; }
    // public void setPlace(Place place) { this.place = place; }

    // public Category getCategory() { return category; }
    // public void setCategory(Category category) { this.category = category; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getExternalId() { return externalId; }
    public void setExternalId(String externalId) { this.externalId = externalId; }

    public String getExternalUrl() { return externalUrl; }
    public void setExternalUrl(String externalUrl) { this.externalUrl = externalUrl; }

    public Boolean getIsRecurring() { return isRecurring; }
    public void setIsRecurring(Boolean isRecurring) { this.isRecurring = isRecurring; }

    public String getRecurrencePattern() { return recurrencePattern; }
    public void setRecurrencePattern(String recurrencePattern) { this.recurrencePattern = recurrencePattern; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Temporarily comment out JPA lifecycle methods
    // @PrePersist
    // void onCreate() {
    //     if (this.id == null) {
    //         this.id = UUID.randomUUID();
    //     }
    //     if (this.status == null) {
    //         this.status = "active";
    //     }
    //     if (this.isRecurring == null) {
    //         this.isRecurring = false;
    //     }
    //     OffsetDateTime now = OffsetDateTime.now();
    //     this.createdAt = now;
    //     this.updatedAt = now;
    // }

    // @PreUpdate
    // void onUpdate() {
    //     this.updatedAt = OffsetDateTime.now();
    // }
}
