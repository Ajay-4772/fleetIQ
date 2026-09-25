package com.fleetiq.controller;

import com.fleetiq.model.ActionItem;
import com.fleetiq.model.CanonicalVehicleEvent;
import com.fleetiq.model.Vehicle;
import com.fleetiq.repository.ActionItemRepository;
import com.fleetiq.repository.CanonicalVehicleEventRepository;
import com.fleetiq.repository.VehicleRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/v1/search", "/api/search"})
public class SearchController {

    private final VehicleRepository vehicleRepository;
    private final ActionItemRepository actionRepository;
    private final CanonicalVehicleEventRepository eventRepository;

    public SearchController(VehicleRepository vehicleRepository,
                            ActionItemRepository actionRepository,
                            CanonicalVehicleEventRepository eventRepository) {
        this.vehicleRepository = vehicleRepository;
        this.actionRepository = actionRepository;
        this.eventRepository = eventRepository;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> search(@RequestParam String q) {
        if (q == null || q.trim().isEmpty()) {
            return ResponseEntity.ok(Map.of("query", "", "vehicles", List.of(), "actions", List.of(), "events", List.of(), "totalMatches", 0));
        }

        String term = q.trim().toLowerCase();

        // 1. Search vehicles by ID, VIN, Make, Model
        List<Vehicle> matchedVehicles = vehicleRepository.findAll().stream()
                .filter(v -> (v.getId() != null && v.getId().toLowerCase().contains(term)) ||
                        (v.getVin() != null && v.getVin().toLowerCase().contains(term)) ||
                        (v.getMake() != null && v.getMake().toLowerCase().contains(term)) ||
                        (v.getModel() != null && v.getModel().toLowerCase().contains(term)) ||
                        (v.getRegistrationNumber() != null && v.getRegistrationNumber().toLowerCase().contains(term)))
                .limit(10)
                .collect(Collectors.toList());

        // 2. Search actions by ID, vehicleId, issue
        List<ActionItem> matchedActions = actionRepository.findAll().stream()
                .filter(a -> (a.getActionId() != null && a.getActionId().toLowerCase().contains(term)) ||
                        (a.getVehicleId() != null && a.getVehicleId().toLowerCase().contains(term)) ||
                        (a.getIssue() != null && a.getIssue().toLowerCase().contains(term)))
                .limit(10)
                .collect(Collectors.toList());

        // 3. Search events by eventId, vehicleId, faultCode
        List<CanonicalVehicleEvent> matchedEvents = eventRepository.findAll().stream()
                .filter(e -> (e.getEventId() != null && e.getEventId().toLowerCase().contains(term)) ||
                        (e.getVehicleId() != null && e.getVehicleId().toLowerCase().contains(term)) ||
                        (e.getFaultCode() != null && e.getFaultCode().toLowerCase().contains(term)))
                .limit(10)
                .collect(Collectors.toList());

        int total = matchedVehicles.size() + matchedActions.size() + matchedEvents.size();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("query", q);
        result.put("totalMatches", total);
        result.put("vehicles", matchedVehicles);
        result.put("actions", matchedActions);
        result.put("events", matchedEvents);

        return ResponseEntity.ok(result);
    }
}
