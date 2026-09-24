package com.fleetiq.service.decision;

import com.fleetiq.model.CanonicalVehicleEvent;
import com.fleetiq.model.Decision;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service("ruleBasedDecisionService")
public class RuleBasedDecisionService implements DecisionService {

    @Override
    public Decision evaluate(CanonicalVehicleEvent event, double estimatedImpact) {
        String eventType = event.getEventType();
        String vehicleId = event.getVehicleId();
        String severity = event.getSeverity() != null ? event.getSeverity() : "LOW";
        String decisionId = "DEC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        String recommendedAction;
        String priority;
        double confidence = 0.95;
        String rationale;
        boolean humanReview = false;

        switch (eventType) {
            case "ENGINE_FAULT":
                if ("CRITICAL".equalsIgnoreCase(severity)) {
                    priority = "CRITICAL";
                    recommendedAction = "Ground vehicle " + vehicleId + " immediately for engine diagnostic inspection";
                    rationale = "Severe powertrain DTC (" + event.getFaultCode() + ") detected. Risk of catastrophic misfire or roadside breakdown.";
                } else if ("HIGH".equalsIgnoreCase(severity)) {
                    priority = "HIGH";
                    recommendedAction = "Schedule powertrain inspection within 24 hours for vehicle " + vehicleId;
                    rationale = "Diagnostic DTC (" + event.getFaultCode() + ") indicates emissions or sensor circuit irregularity.";
                } else {
                    priority = "MEDIUM";
                    recommendedAction = "Inspect sensor circuit on next routine maintenance";
                    rationale = "Minor DTC code logged.";
                }
                break;

            case "MAINTENANCE_DUE":
                if ("CRITICAL".equalsIgnoreCase(severity) || (event.getOilLifePct() != null && event.getOilLifePct() <= 5.0)) {
                    priority = "CRITICAL";
                    recommendedAction = "Schedule immediate oil and filter service; vehicle oil life critically depleted (" + (event.getOilLifePct() != null ? event.getOilLifePct() : 5) + "%)";
                    rationale = "Critical oil degradation threshold breached. Engine warranty and wear risk.";
                } else {
                    priority = "HIGH";
                    recommendedAction = "Schedule routine preventative maintenance within 5 days";
                    rationale = "Oil life below 15% threshold.";
                }
                break;

            case "BATTERY_WARNING":
                priority = "CRITICAL".equalsIgnoreCase(severity) ? "CRITICAL" : "HIGH";
                recommendedAction = "Dispatch battery diagnostics and cell balance test for vehicle " + vehicleId;
                rationale = "Low battery health or BMS alert detected (" + (event.getFaultCode() != null ? event.getFaultCode() : "Degraded SOH") + ").";
                if (event.getBatteryHealthPct() != null && event.getBatteryHealthPct() < 65.0) {
                    humanReview = true;
                }
                break;

            case "EXCESSIVE_IDLE":
                priority = "HIGH".equalsIgnoreCase(severity) ? "HIGH" : "MEDIUM";
                recommendedAction = "Dispatch operator idle reduction notification; review vehicle " + vehicleId + " idling telemetry";
                rationale = "Excessive idle duration (" + event.getIdleMinutes() + " mins) exceeding fleet fuel burn policy.";
                break;

            case "TIRE_PRESSURE_LOW":
                priority = "MEDIUM";
                recommendedAction = "Inspect tire pressure and recalibrate TPMS sensor on vehicle " + vehicleId;
                rationale = "Tire pressure below safety threshold (28 PSI).";
                break;

            case "LOW_UTILIZATION":
                priority = "LOW";
                recommendedAction = "Reallocate vehicle assignment or optimize route plan";
                rationale = "Daily operating hours below target benchmark.";
                break;

            case "TELEMETRY_NORMAL":
            default:
                priority = "LOW";
                recommendedAction = "Nominal telemetry recorded; no action required";
                rationale = "All monitored telemetry parameters within normal operational thresholds.";
                confidence = 1.0;
                break;
        }

        return new Decision(
                decisionId,
                event.getEventId(),
                vehicleId,
                eventType,
                "OPERATIONAL_DIRECTIVE",
                recommendedAction,
                priority,
                estimatedImpact,
                confidence,
                "RULE_ENGINE",
                rationale,
                humanReview
        );
    }
}
