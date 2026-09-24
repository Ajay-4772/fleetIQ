package com.fleetiq.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "fleet_decisions")
public class Decision {

    @Id
    @Column(name = "decision_id", length = 64)
    private String decisionId;

    @Column(name = "event_id", length = 64)
    private String eventId;

    @Column(name = "vehicle_id", nullable = false, length = 32)
    private String vehicleId;

    @Column(name = "issue_detected", nullable = false, length = 64)
    private String issueDetected;

    @Column(name = "decision_type", length = 64)
    private String decisionType;

    @Column(name = "recommended_action", nullable = false, length = 255)
    private String recommendedAction;

    @Column(name = "priority", nullable = false, length = 32)
    private String priority; // CRITICAL, HIGH, MEDIUM, LOW

    @Column(name = "estimated_cost_impact")
    private Double estimatedCostImpact;

    @Column(name = "confidence_score")
    private Double confidenceScore;

    @Column(name = "decision_source", nullable = false, length = 64)
    private String decisionSource; // RULE_ENGINE, JEV_AI, HYBRID, RULE_ENGINE_FALLBACK

    @Column(name = "rationale", columnDefinition = "TEXT")
    private String rationale;

    @Column(name = "requires_human_review")
    private Boolean requiresHumanReview = false;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    public Decision() {}

    public Decision(String decisionId, String eventId, String vehicleId, String issueDetected,
                    String decisionType, String recommendedAction, String priority,
                    Double estimatedCostImpact, Double confidenceScore, String decisionSource,
                    String rationale, Boolean requiresHumanReview) {
        this.decisionId = decisionId;
        this.eventId = eventId;
        this.vehicleId = vehicleId;
        this.issueDetected = issueDetected;
        this.decisionType = decisionType;
        this.recommendedAction = recommendedAction;
        this.priority = priority;
        this.estimatedCostImpact = estimatedCostImpact;
        this.confidenceScore = confidenceScore;
        this.decisionSource = decisionSource;
        this.rationale = rationale;
        this.requiresHumanReview = requiresHumanReview != null ? requiresHumanReview : false;
        this.createdAt = Instant.now();
    }

    // Getters and Setters
    public String getDecisionId() { return decisionId; }
    public void setDecisionId(String decisionId) { this.decisionId = decisionId; }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getVehicleId() { return vehicleId; }
    public void setVehicleId(String vehicleId) { this.vehicleId = vehicleId; }

    public String getIssueDetected() { return issueDetected; }
    public void setIssueDetected(String issueDetected) { this.issueDetected = issueDetected; }

    public String getDecisionType() { return decisionType; }
    public void setDecisionType(String decisionType) { this.decisionType = decisionType; }

    public String getRecommendedAction() { return recommendedAction; }
    public void setRecommendedAction(String recommendedAction) { this.recommendedAction = recommendedAction; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public Double getEstimatedCostImpact() { return estimatedCostImpact; }
    public void setEstimatedCostImpact(Double estimatedCostImpact) { this.estimatedCostImpact = estimatedCostImpact; }

    public Double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; }

    public String getDecisionSource() { return decisionSource; }
    public void setDecisionSource(String decisionSource) { this.decisionSource = decisionSource; }

    public String getRationale() { return rationale; }
    public void setRationale(String rationale) { this.rationale = rationale; }

    public Boolean getRequiresHumanReview() { return requiresHumanReview; }
    public void setRequiresHumanReview(Boolean requiresHumanReview) { this.requiresHumanReview = requiresHumanReview; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
