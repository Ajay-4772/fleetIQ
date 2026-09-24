package com.fleetiq.service.decision;

import com.fleetiq.model.CanonicalVehicleEvent;
import com.fleetiq.model.Decision;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Primary
@Service("hybridDecisionService")
public class HybridDecisionService implements DecisionService {

    private final RuleBasedDecisionService ruleEngine;
    private final JevDecisionService jevService;

    public HybridDecisionService(RuleBasedDecisionService ruleEngine, JevDecisionService jevService) {
        this.ruleEngine = ruleEngine;
        this.jevService = jevService;
    }

    @Override
    public Decision evaluate(CanonicalVehicleEvent event, double estimatedImpact) {
        // If event is critical powertrain/airbag safety, deterministic rules are authoritative
        if ("B1800".equalsIgnoreCase(event.getFaultCode()) || "U0100".equalsIgnoreCase(event.getFaultCode())) {
            Decision ruleDecision = ruleEngine.evaluate(event, estimatedImpact);
            ruleDecision.setDecisionSource("RULE_ENGINE");
            ruleDecision.setRationale("Safety-critical DTC requires immediate authoritative deterministic rule grounding.");
            return ruleDecision;
        }

        // Try Jev AI (which itself falls back to RULE_ENGINE_FALLBACK if offline/unconfigured)
        Decision decision = jevService.evaluate(event, estimatedImpact);

        // If it's a nominal event or normal rule
        if ("TELEMETRY_NORMAL".equalsIgnoreCase(event.getEventType())) {
            decision.setDecisionSource("RULE_ENGINE");
        }

        return decision;
    }

    // Helper for generating simulated hybrid intelligence during demo scenarios
    public Decision evaluateSimulatedHybrid(CanonicalVehicleEvent event, double estimatedImpact, String forcedSource) {
        Decision decision = ruleEngine.evaluate(event, estimatedImpact);
        if ("JEV_AI".equalsIgnoreCase(forcedSource)) {
            decision.setDecisionId("JEV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            decision.setDecisionSource("JEV_AI");
            decision.setConfidenceScore(0.94);
            decision.setRationale("Jev AI synthesized multi-signal engine metrics to recommend targeted servicing.");
            decision.setRequiresHumanReview(false);
        } else if ("HYBRID".equalsIgnoreCase(forcedSource)) {
            decision.setDecisionId("HYB-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            decision.setDecisionSource("HYBRID");
            decision.setConfidenceScore(0.86);
            decision.setRationale("Hybrid validation: deterministic safety boundary confirmed by AI anomaly classifier.");
            decision.setRequiresHumanReview(false);
        } else if ("RULE_ENGINE_FALLBACK".equalsIgnoreCase(forcedSource)) {
            decision.setDecisionId("FLB-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            decision.setDecisionSource("RULE_ENGINE_FALLBACK");
            decision.setConfidenceScore(0.72);
            decision.setRationale("AI Service timeout/unavailable; automated fallback to deterministic rule engine.");
            decision.setRequiresHumanReview(true);
        } else {
            decision.setDecisionSource("RULE_ENGINE");
        }
        return decision;
    }
}
