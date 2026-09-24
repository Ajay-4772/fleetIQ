package com.fleetiq.service.decision;

import com.fleetiq.model.CanonicalVehicleEvent;
import com.fleetiq.model.Decision;

import java.util.UUID;

public class MockDecisionService implements DecisionService {

    private String mockSource = "RULE_ENGINE";
    private double mockConfidence = 0.95;
    private boolean mockHumanReview = false;

    public MockDecisionService() {}

    public MockDecisionService(String mockSource, double mockConfidence, boolean mockHumanReview) {
        this.mockSource = mockSource;
        this.mockConfidence = mockConfidence;
        this.mockHumanReview = mockHumanReview;
    }

    @Override
    public Decision evaluate(CanonicalVehicleEvent event, double estimatedImpact) {
        return new Decision(
                "MOCK-" + UUID.randomUUID().toString().substring(0, 8),
                event.getEventId(),
                event.getVehicleId(),
                event.getEventType(),
                "MOCK_DIRECTIVE",
                "Mock Recommended Action for " + event.getEventType(),
                event.getSeverity() != null ? event.getSeverity() : "LOW",
                estimatedImpact,
                mockConfidence,
                mockSource,
                "Mock decision evaluation for testing",
                mockHumanReview
        );
    }
}
