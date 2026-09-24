package com.fleetiq;

import com.fleetiq.model.CanonicalVehicleEvent;
import com.fleetiq.model.Decision;
import com.fleetiq.service.decision.RuleBasedDecisionService;
import com.fleetiq.service.detection.IssueDetectionService;
import com.fleetiq.service.impact.ImpactCalculationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

public class DetectionAndImpactTests {

    private IssueDetectionService issueDetectionService;
    private ImpactCalculationService impactCalculationService;
    private RuleBasedDecisionService ruleDecisionService;

    @BeforeEach
    void setUp() {
        issueDetectionService = new IssueDetectionService();
        impactCalculationService = new ImpactCalculationService();
        ruleDecisionService = new RuleBasedDecisionService();
    }

    @Test
    @DisplayName("Case 7: Maintenance detection")
    void testMaintenanceDetection() {
        CanonicalVehicleEvent event = new CanonicalVehicleEvent(
                "EVT-7", "VH-1001", "TELEMETRY_RAW", "LOW",
                null, 10, 4.0, 95.0, 32.0, 0.5, 2.0, 45000L,
                "SIMULATED_TOYOTA", "NORMALIZED", "{}", Instant.now()
        );

        issueDetectionService.detectAndClassify(event);

        assertEquals("MAINTENANCE_DUE", event.getEventType());
        assertEquals("CRITICAL", event.getSeverity());
    }

    @Test
    @DisplayName("Case 8: Excessive idle detection")
    void testExcessiveIdleDetection() {
        CanonicalVehicleEvent event = new CanonicalVehicleEvent(
                "EVT-8", "VH-1002", "TELEMETRY_RAW", "LOW",
                null, 92, 80.0, 90.0, 32.0, 3.5, 4.0, 52000L,
                "SIMULATED_FORD", "NORMALIZED", "{}", Instant.now()
        );

        issueDetectionService.detectAndClassify(event);

        assertEquals("EXCESSIVE_IDLE", event.getEventType());
        assertEquals("HIGH", event.getSeverity());
    }

    @Test
    @DisplayName("Case 9: Critical fault detection")
    void testCriticalFaultDetection() {
        CanonicalVehicleEvent event = new CanonicalVehicleEvent(
                "EVT-9", "VH-1003", "TELEMETRY_RAW", "LOW",
                "P0301", 5, 75.0, 92.0, 32.0, 0.2, 1.5, 33000L,
                "SIMULATED_BMW", "NORMALIZED", "{}", Instant.now()
        );

        issueDetectionService.detectAndClassify(event);

        assertEquals("ENGINE_FAULT", event.getEventType());
        assertEquals("CRITICAL", event.getSeverity());
    }

    @Test
    @DisplayName("Case 10: Low utilization detection")
    void testLowUtilizationDetection() {
        CanonicalVehicleEvent event = new CanonicalVehicleEvent(
                "EVT-10", "VH-1004", "TELEMETRY_RAW", "LOW",
                null, 0, 90.0, 98.0, 33.0, 0.1, 0.4, 12000L,
                "SIMULATED_TOYOTA", "NORMALIZED", "{}", Instant.now()
        );

        issueDetectionService.detectAndClassify(event);

        assertEquals("LOW_UTILIZATION", event.getEventType());
        assertEquals("LOW", event.getSeverity());
    }

    @Test
    @DisplayName("Case 11: Priority calculation")
    void testPriorityCalculation() {
        CanonicalVehicleEvent criticalEvent = new CanonicalVehicleEvent(
                "EVT-11", "VH-1001", "ENGINE_FAULT", "CRITICAL",
                "P0300", 5, 80.0, 90.0, 32.0, 0.2, 1.5, 33000L,
                "SIMULATED_BMW", "NORMALIZED", "{}", Instant.now()
        );

        Decision decision = ruleDecisionService.evaluate(criticalEvent, 45000.0);

        assertEquals("CRITICAL", decision.getPriority());
        assertTrue(decision.getRecommendedAction().contains("Ground vehicle"));
    }

    @Test
    @DisplayName("Case 12: Cost impact calculation")
    void testCostImpactCalculation() {
        CanonicalVehicleEvent engineFaultEvent = new CanonicalVehicleEvent(
                "EVT-12A", "VH-1001", "ENGINE_FAULT", "CRITICAL",
                "P0301", 5, 80.0, 90.0, 32.0, 0.2, 1.5, 33000L,
                "SIMULATED_TOYOTA", "NORMALIZED", "{}", Instant.now()
        );

        CanonicalVehicleEvent idleEvent = new CanonicalVehicleEvent(
                "EVT-12B", "VH-1002", "EXCESSIVE_IDLE", "HIGH",
                null, 90, 80.0, 90.0, 32.0, 3.5, 4.0, 52000L,
                "SIMULATED_FORD", "NORMALIZED", "{}", Instant.now()
        );

        double faultImpact = impactCalculationService.calculateEstimatedCostImpact(engineFaultEvent);
        double idleImpact = impactCalculationService.calculateEstimatedCostImpact(idleEvent);

        assertTrue(faultImpact >= 40000.0, "Engine fault impact should be >= 40,000 INR");
        assertTrue(idleImpact >= 1500.0, "Idle fuel waste impact should be >= 1,500 INR");
    }
}
