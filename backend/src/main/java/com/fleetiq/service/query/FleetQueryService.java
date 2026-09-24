package com.fleetiq.service.query;

import com.fleetiq.dto.FleetQueryRequest;
import com.fleetiq.dto.FleetQueryResponse;
import com.fleetiq.model.ActionItem;
import com.fleetiq.model.CanonicalVehicleEvent;
import com.fleetiq.model.Vehicle;
import com.fleetiq.repository.ActionItemRepository;
import com.fleetiq.repository.CanonicalVehicleEventRepository;
import com.fleetiq.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class FleetQueryService {

    private final VehicleRepository vehicleRepository;
    private final ActionItemRepository actionRepository;
    private final CanonicalVehicleEventRepository eventRepository;

    public FleetQueryService(VehicleRepository vehicleRepository,
                             ActionItemRepository actionRepository,
                             CanonicalVehicleEventRepository eventRepository) {
        this.vehicleRepository = vehicleRepository;
        this.actionRepository = actionRepository;
        this.eventRepository = eventRepository;
    }

    public FleetQueryResponse executeQuery(FleetQueryRequest request) {
        if (request == null || request.getIntent() == null || request.getIntent().trim().isEmpty()) {
            throw new IllegalArgumentException("Query intent must not be empty");
        }

        String intent = request.getIntent().toUpperCase().trim();
        Map<String, Object> params = request.getParameters() != null ? request.getParameters() : Collections.emptyMap();
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("executedAt", new Date().toString());
        metadata.put("intent", intent);

        switch (intent) {
            case "MAINTENANCE_REQUIRED": {
                List<Vehicle> list = vehicleRepository.findMaintenanceOverdue();
                String summary = "Found " + list.size() + " vehicle(s) requiring urgent maintenance or oil life depleted below 10%.";
                return new FleetQueryResponse(intent, summary, list.size(), list, metadata);
            }

            case "HIGH_RISK_VEHICLES": {
                List<Vehicle> batteryRisk = vehicleRepository.findBatteryAtRisk();
                List<ActionItem> criticalActions = actionRepository.findByStatusOrderByCreatedAtDesc("OPEN")
                        .stream().filter(a -> "CRITICAL".equalsIgnoreCase(a.getPriority())).toList();
                Set<String> riskIds = new HashSet<>();
                batteryRisk.forEach(v -> riskIds.add(v.getId()));
                criticalActions.forEach(a -> riskIds.add(a.getVehicleId()));
                List<Vehicle> riskVehicles = vehicleRepository.findAllById(riskIds);
                String summary = "Identified " + riskVehicles.size() + " high-risk vehicle(s) exhibiting critical faults or severe battery degradation.";
                return new FleetQueryResponse(intent, summary, riskVehicles.size(), riskVehicles, metadata);
            }

            case "LOW_UTILIZATION": {
                List<Vehicle> list = vehicleRepository.findByStatus("INACTIVE");
                String summary = "Identified " + list.size() + " inactive/low-utilization vehicle(s) ready for workload reassignment.";
                return new FleetQueryResponse(intent, summary, list.size(), list, metadata);
            }

            case "HIGH_UTILIZATION": {
                List<Vehicle> list = vehicleRepository.findAll().stream()
                        .sorted(Comparator.comparing(Vehicle::getMileageKm, Comparator.nullsLast(Comparator.reverseOrder())))
                        .limit(10)
                        .toList();
                String summary = "Retrieved top 10 highest-mileage utilized fleet assets.";
                return new FleetQueryResponse(intent, summary, list.size(), list, metadata);
            }

            case "ENGINE_FAULTS": {
                List<CanonicalVehicleEvent> events = eventRepository.findTop50ByOrderByTimestampDesc().stream()
                        .filter(e -> "ENGINE_FAULT".equalsIgnoreCase(e.getEventType()))
                        .toList();
                String summary = "Found " + events.size() + " recent engine diagnostic fault event(s).";
                return new FleetQueryResponse(intent, summary, events.size(), events, metadata);
            }

            case "BATTERY_WARNINGS": {
                List<CanonicalVehicleEvent> events = eventRepository.findTop50ByOrderByTimestampDesc().stream()
                        .filter(e -> "BATTERY_WARNING".equalsIgnoreCase(e.getEventType()))
                        .toList();
                String summary = "Found " + events.size() + " battery thermal or state-of-charge warning event(s).";
                return new FleetQueryResponse(intent, summary, events.size(), events, metadata);
            }

            case "EXCESSIVE_IDLE": {
                List<CanonicalVehicleEvent> events = eventRepository.findTop50ByOrderByTimestampDesc().stream()
                        .filter(e -> "EXCESSIVE_IDLE".equalsIgnoreCase(e.getEventType()))
                        .toList();
                String summary = "Detected " + events.size() + " event(s) exceeding maximum idling duration policy.";
                return new FleetQueryResponse(intent, summary, events.size(), events, metadata);
            }

            case "TOP_PRIORITY_ACTIONS": {
                List<ActionItem> actions = actionRepository.findByStatusOrderByCreatedAtDesc("OPEN").stream()
                        .filter(a -> "CRITICAL".equalsIgnoreCase(a.getPriority()) || "HIGH".equalsIgnoreCase(a.getPriority()))
                        .limit(20)
                        .toList();
                String summary = "Retrieved " + actions.size() + " unresolved CRITICAL/HIGH priority operational action(s).";
                return new FleetQueryResponse(intent, summary, actions.size(), actions, metadata);
            }

            case "VEHICLE_HEALTH": {
                String targetId = (String) params.get("vehicleId");
                if (targetId != null) {
                    Optional<Vehicle> v = vehicleRepository.findById(targetId);
                    if (v.isPresent()) {
                        return new FleetQueryResponse(intent, "Health metrics for vehicle " + targetId, 1, List.of(v.get()), metadata);
                    }
                }
                List<Vehicle> all = vehicleRepository.findAll();
                return new FleetQueryResponse(intent, "Fleet-wide vehicle health catalog", all.size(), all, metadata);
            }

            default:
                throw new IllegalArgumentException("Unsupported fleet query intent: " + intent +
                        ". Supported intents: MAINTENANCE_REQUIRED, HIGH_RISK_VEHICLES, LOW_UTILIZATION, HIGH_UTILIZATION, ENGINE_FAULTS, BATTERY_WARNINGS, EXCESSIVE_IDLE, TOP_PRIORITY_ACTIONS, VEHICLE_HEALTH");
        }
    }
}
