package com.fleetiq.service.detection;

import com.fleetiq.model.CanonicalVehicleEvent;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class IssueDetectionService {

    private static final Set<String> CRITICAL_FAULTS = Set.of("P0300", "P0301", "U0100", "B1800", "BMS_028");
    private static final Set<String> HIGH_FAULTS = Set.of("P0420", "C0035", "P0562");

    public void detectAndClassify(CanonicalVehicleEvent event) {
        String fault = event.getFaultCode();

        // 1. Critical Powertrain or System DTC Faults
        if (fault != null && CRITICAL_FAULTS.contains(fault)) {
            if ("BMS_028".equalsIgnoreCase(fault)) {
                event.setEventType("BATTERY_WARNING");
                event.setSeverity("CRITICAL");
            } else {
                event.setEventType("ENGINE_FAULT");
                event.setSeverity("CRITICAL");
            }
            return;
        }

        // 2. High severity diagnostic DTCs
        if (fault != null && HIGH_FAULTS.contains(fault)) {
            if ("P0562".equalsIgnoreCase(fault)) {
                event.setEventType("BATTERY_WARNING");
                event.setSeverity("HIGH");
            } else {
                event.setEventType("ENGINE_FAULT");
                event.setSeverity("HIGH");
            }
            return;
        }

        // 3. Maintenance Due Check
        if ("OIL_DUE".equalsIgnoreCase(fault) || (event.getOilLifePct() != null && event.getOilLifePct() <= 10.0)) {
            event.setEventType("MAINTENANCE_DUE");
            event.setSeverity(event.getOilLifePct() != null && event.getOilLifePct() <= 5.0 ? "CRITICAL" : "HIGH");
            return;
        }

        // 4. Battery Warning Check
        if (event.getBatteryHealthPct() != null && event.getBatteryHealthPct() <= 70.0) {
            event.setEventType("BATTERY_WARNING");
            event.setSeverity(event.getBatteryHealthPct() <= 60.0 ? "CRITICAL" : "HIGH");
            return;
        }

        // 5. Tire Pressure Low
        if ("TPMS_LOW".equalsIgnoreCase(fault) || (event.getTirePressurePsi() != null && event.getTirePressurePsi() <= 28.0)) {
            event.setEventType("TIRE_PRESSURE_LOW");
            event.setSeverity(event.getTirePressurePsi() != null && event.getTirePressurePsi() <= 24.0 ? "HIGH" : "MEDIUM");
            return;
        }

        // 6. Excessive Idling Check
        if (event.getIdleMinutes() != null && event.getIdleMinutes() >= 45) {
            event.setEventType("EXCESSIVE_IDLE");
            event.setSeverity(event.getIdleMinutes() >= 80 ? "HIGH" : "MEDIUM");
            return;
        }

        // 7. Generic / Medium DTCs
        if (fault != null && !fault.isEmpty()) {
            event.setEventType("ENGINE_FAULT");
            event.setSeverity("MEDIUM");
            return;
        }

        // 8. Low Utilization
        if (event.getOperatingHours() != null && event.getOperatingHours() > 0 && event.getOperatingHours() < 0.6) {
            event.setEventType("LOW_UTILIZATION");
            event.setSeverity("LOW");
            return;
        }

        // 9. Nominal Telemetry
        event.setEventType("TELEMETRY_NORMAL");
        event.setSeverity("LOW");
    }
}
