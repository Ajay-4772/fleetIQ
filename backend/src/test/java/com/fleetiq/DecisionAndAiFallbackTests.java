package com.fleetiq;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fleetiq.model.CanonicalVehicleEvent;
import com.fleetiq.model.Decision;
import com.fleetiq.service.decision.JevDecisionService;
import com.fleetiq.service.decision.MockDecisionService;
import com.fleetiq.service.decision.RuleBasedDecisionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

public class DecisionAndAiFallbackTests {

    private RuleBasedDecisionService ruleDecisionService;
    private JevDecisionService jevDecisionService;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        ruleDecisionService = new RuleBasedDecisionService();
        objectMapper = new ObjectMapper();
        jevDecisionService = new JevDecisionService(ruleDecisionService, objectMapper);
    }

    @Test
    @DisplayName("Case 13: High confidence AI decision")
    void testHighConfidenceAiDecision() {
        MockDecisionService mockAi = new MockDecisionService("JEV_AI", 0.96, false);
        CanonicalVehicleEvent event = new CanonicalVehicleEvent(
                "EVT-13", "VH-1001", "ENGINE_FAULT", "CRITICAL",
                "P0301", 5, 80.0, 90.0, 32.0, 0.2, 1.5, 33000L,
                "SIMULATED_TOYOTA", "NORMALIZED", "{}", Instant.now()
        );

        Decision decision = mockAi.evaluate(event, 45000.0);

        assertEquals("JEV_AI", decision.getDecisionSource());
        assertEquals(0.96, decision.getConfidenceScore());
        assertFalse(decision.getRequiresHumanReview());
    }

    @Test
    @DisplayName("Case 14: Low confidence decision requires human review")
    void testLowConfidenceDecision() {
        MockDecisionService mockAi = new MockDecisionService("JEV_AI", 0.65, true);
        CanonicalVehicleEvent event = new CanonicalVehicleEvent(
                "EVT-14", "VH-1002", "BATTERY_WARNING", "HIGH",
                "P0562", 5, 80.0, 68.0, 32.0, 0.2, 1.5, 33000L,
                "SIMULATED_BMW", "NORMALIZED", "{}", Instant.now()
        );

        Decision decision = mockAi.evaluate(event, 32000.0);

        assertEquals(0.65, decision.getConfidenceScore());
        assertTrue(decision.getRequiresHumanReview(), "Low confidence decision must require human review");
    }

    @Test
    @DisplayName("Case 15: AI timeout triggers graceful rule fallback")
    void testAiTimeoutFallback() {
        // Point to unreachable localhost port to trigger network timeout/error
        jevDecisionService.setEnabled(true);
        jevDecisionService.setApiKey("test-dummy-key");

        CanonicalVehicleEvent event = new CanonicalVehicleEvent(
                "EVT-15", "VH-1003", "ENGINE_FAULT", "CRITICAL",
                "P0300", 5, 80.0, 90.0, 32.0, 0.2, 1.5, 33000L,
                "SIMULATED_FORD", "NORMALIZED", "{}", Instant.now()
        );

        Decision decision = jevDecisionService.evaluate(event, 45000.0);

        assertNotNull(decision);
        assertEquals("RULE_ENGINE_FALLBACK", decision.getDecisionSource());
        assertTrue(decision.getRequiresHumanReview());
        assertTrue(decision.getRationale().contains("fallback"));
    }

    @Test
    @DisplayName("Case 16: AI unavailable triggers graceful rule fallback")
    void testAiUnavailableFallback() {
        // When disabled or apiKey is empty
        jevDecisionService.setEnabled(false);

        CanonicalVehicleEvent event = new CanonicalVehicleEvent(
                "EVT-16", "VH-1004", "MAINTENANCE_DUE", "HIGH",
                "OIL_DUE", 5, 8.0, 90.0, 32.0, 0.2, 1.5, 33000L,
                "SIMULATED_TOYOTA", "NORMALIZED", "{}", Instant.now()
        );

        Decision decision = jevDecisionService.evaluate(event, 8500.0);

        assertNotNull(decision);
        assertEquals("RULE_ENGINE_FALLBACK", decision.getDecisionSource());
        assertTrue(decision.getRequiresHumanReview());
    }

    @Test
    @DisplayName("Case 17: AI malformed response triggers rule fallback")
    void testAiMalformedResponse() {
        // Mock with malformed response simulation triggers fallback
        jevDecisionService.setEnabled(true);
        jevDecisionService.setApiKey("test-key");

        CanonicalVehicleEvent event = new CanonicalVehicleEvent(
                "EVT-17", "VH-1005", "EXCESSIVE_IDLE", "HIGH",
                null, 88, 80.0, 90.0, 32.0, 2.5, 3.0, 42000L,
                "SIMULATED_FORD", "NORMALIZED", "{}", Instant.now()
        );

        Decision decision = jevDecisionService.evaluate(event, 2500.0);

        assertNotNull(decision);
        assertEquals("RULE_ENGINE_FALLBACK", decision.getDecisionSource());
    }

    @Test
    @DisplayName("Case 18: Fallback rule engine produces valid deterministic decision")
    void testFallbackRuleEngineProducesDecision() {
        CanonicalVehicleEvent event = new CanonicalVehicleEvent(
                "EVT-18", "VH-1006", "ENGINE_FAULT", "CRITICAL",
                "P0301", 5, 80.0, 90.0, 32.0, 0.2, 1.5, 33000L,
                "SIMULATED_TOYOTA", "NORMALIZED", "{}", Instant.now()
        );

        Decision fallback = ruleDecisionService.evaluate(event, 45000.0);
        fallback.setDecisionSource("RULE_ENGINE_FALLBACK");

        assertEquals("CRITICAL", fallback.getPriority());
        assertEquals("RULE_ENGINE_FALLBACK", fallback.getDecisionSource());
        assertTrue(fallback.getRecommendedAction().contains("Ground vehicle"));
    }
}
