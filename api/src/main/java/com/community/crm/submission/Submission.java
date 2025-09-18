package com.community.crm.submission;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "submission")
public class Submission {
    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "place_id")
    private UUID placeId;

    @Column(name = "payload", columnDefinition = "jsonb")
    private String payload;

    @Column(name = "status", nullable = false)
    private String status = "pending";

    @Column(name = "submitted_by_email")
    private String submittedByEmail;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "reviewed_at")
    private OffsetDateTime reviewedAt;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getPlaceId() { return placeId; }
    public void setPlaceId(UUID placeId) { this.placeId = placeId; }
    public String getPayload() { return payload; }
    public void setPayload(String payload) { this.payload = payload; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getSubmittedByEmail() { return submittedByEmail; }
    public void setSubmittedByEmail(String submittedByEmail) { this.submittedByEmail = submittedByEmail; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(OffsetDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
}


