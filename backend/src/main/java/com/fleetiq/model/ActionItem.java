package com.fleetiq.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "fleet_actions")
public class ActionItem {

    @Id
    @Column(name = "action_id", length = 64)
    private String actionId;

    @Column(name = "decision_id", length = 64)
    private String decisionId;

    @Column(name = "vehicle_id", nullable = false, length = 32)
    private String vehicleId;

    @Column(name = "issue", nullable = false, length = 128)
    private String issue;

    @Column(name = "priority", nullable = false, length = 32)
    private String priority; // CRITICAL, HIGH, MEDIUM, LOW

    @Column(name = "severity", nullable = false, length = 32)
    private String severity; // CRITICAL, HIGH, MEDIUM, LOW

    @Column(name = "estimated_impact")
    private Double estimatedImpact;

    @Column(name = "recommended_action", nullable = false, length = 255)
    private String recommendedAction;

    @Column(name = "confidence")
    private Double confidence;

    @Column(name = "status", nullable = false, length = 32)
    private String status; // OPEN, IN_PROGRESS, RESOLVED, DISMISSED

    @Column(name = "decision_source", length = 64)
    private String decisionSource;

    @Column(name = "requires_human_review")
    private Boolean requiresHumanReview = false;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    public ActionItem() {}

    public ActionItem(String actionId, String decisionId, String vehicleId, String issue,
                      String priority, String severity, Double estimatedImpact,
                      String recommendedAction, Double confidence, String status,
                      String decisionSource, Boolean requiresHumanReview) {
        this.actionId = actionId;
        this.decisionId = decisionId;
        this.vehicleId = vehicleId;
        this.issue = issue;
        this.priority = priority;
        this.severity = severity;
        this.estimatedImpact = estimatedImpact;
        this.recommendedAction = recommendedAction;
        this.confidence = confidence;
        this.status = status != null ? status : "OPEN";
        this.decisionSource = decisionSource;
        this.requiresHumanReview = requiresHumanReview != null ? requiresHumanReview : false;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    // Getters and Setters
    public String getActionId() { return actionId; }
    public void setActionId(String actionId) { this.actionId = actionId; }

    public String getDecisionId() { return decisionId; }
    public void setDecisionId(String decisionId) { this.decisionId = decisionId; }

    public String getVehicleId() { return vehicleId; }
    public void setVehicleId(String vehicleId) { this.vehicleId = vehicleId; }

    public String getIssue() { return issue; }
    public void setIssue(String issue) { this.issue = issue; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public Double getEstimatedImpact() { return estimatedImpact; }
    public void setEstimatedImpact(Double estimatedImpact) { this.estimatedImpact = estimatedImpact; }

    public String getRecommendedAction() { return recommendedAction; }
    public void setRecommendedAction(String recommendedAction) { this.recommendedAction = recommendedAction; }

    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDecisionSource() { return decisionSource; }
    public void setDecisionSource(String decisionSource) { this.decisionSource = decisionSource; }

    public Boolean getRequiresHumanReview() { return requiresHumanReview; }
    public void setRequiresHumanReview(Boolean requiresHumanReview) { this.requiresHumanReview = requiresHumanReview; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public Instant getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(Instant resolvedAt) { this.resolvedAt = resolvedAt; }
}
