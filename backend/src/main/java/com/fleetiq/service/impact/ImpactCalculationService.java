package com.fleetiq.service.impact;

import com.fleetiq.model.CanonicalVehicleEvent;
import org.springframework.stereotype.Service;

@Service
public class ImpactCalculationService {

    public double calculateEstimatedCostImpact(CanonicalVehicleEvent event) {
        String eventType = event.getEventType();
        String fault = event.getFaultCode();

        if ("ENGINE_FAULT".equalsIgnoreCase(eventType)) {
            if ("P0300".equalsIgnoreCase(fault) || "P0301".equalsIgnoreCase(fault)) {
                return 45000.0;
            } else if ("U0100".equalsIgnoreCase(fault) || "B1800".equalsIgnoreCase(fault)) {
                return 55000.0;
            } else if ("P0420".equalsIgnoreCase(fault)) {
                return 35000.0;
            } else if ("C0035".equalsIgnoreCase(fault)) {
                return 22000.0;
            }
            return 18000.0;
        }

        if ("BATTERY_WARNING".equalsIgnoreCase(eventType)) {
            if ("BMS_028".equalsIgnoreCase(fault)) {
                return 75000.0;
            } else if ("P0562".equalsIgnoreCase(fault)) {
                return 32000.0;
            }
            return 28000.0;
        }

        if ("MAINTENANCE_DUE".equalsIgnoreCase(eventType)) {
            if (event.getOilLifePct() != null && event.getOilLifePct() <= 5.0) {
                return 14000.0;
            }
            return 8500.0;
        }

        if ("EXCESSIVE_IDLE".equalsIgnoreCase(eventType)) {
            int idle = event.getIdleMinutes() != null ? event.getIdleMinutes() : 45;
            // ~1.5 - 2.5 liters fuel per hour idling @ ~100 INR/liter + engine runtime wear
            double fuelWastedLiters = (idle / 60.0) * 2.2;
            return Math.round((fuelWastedLiters * 105.0 + 1500.0) * 100.0) / 100.0;
        }

        if ("TIRE_PRESSURE_LOW".equalsIgnoreCase(eventType)) {
            return 4500.0;
        }

        if ("LOW_UTILIZATION".equalsIgnoreCase(eventType)) {
            return 3200.0;
        }

        return 0.0;
    }
}
