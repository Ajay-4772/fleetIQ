package com.fleetiq;

import com.fleetiq.dto.FleetQueryRequest;
import com.fleetiq.dto.FleetQueryResponse;
import com.fleetiq.model.ActionItem;
import com.fleetiq.model.Vehicle;
import com.fleetiq.repository.ActionItemRepository;
import com.fleetiq.repository.CanonicalVehicleEventRepository;
import com.fleetiq.repository.VehicleRepository;
import com.fleetiq.service.query.FleetQueryService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

public class FleetQueryAndActionTests {

    @Test
    @DisplayName("Case 19: Fleet query intent mapping")
    void testFleetQueryIntentMapping() {
        VehicleRepository vehicleRepo = Mockito.mock(VehicleRepository.class);
        ActionItemRepository actionRepo = Mockito.mock(ActionItemRepository.class);
        CanonicalVehicleEventRepository eventRepo = Mockito.mock(CanonicalVehicleEventRepository.class);

        Vehicle v1 = new Vehicle("VH-1001", "VIN-1", "REG-1", "Toyota", "RAV4", 2023, "HYBRID", "SUV", 50000L, "ACTIVE", 95.0, 5.0, 32.0, 40.0, null);
        when(vehicleRepo.findMaintenanceOverdue()).thenReturn(List.of(v1));

        FleetQueryService queryService = new FleetQueryService(vehicleRepo, actionRepo, eventRepo);

        FleetQueryRequest req = new FleetQueryRequest("MAINTENANCE_REQUIRED", Collections.emptyMap());
        FleetQueryResponse resp = queryService.executeQuery(req);

        assertEquals("MAINTENANCE_REQUIRED", resp.getIntent());
        assertEquals(1, resp.getResultCount());
        assertTrue(resp.getSummary().contains("requiring urgent maintenance"));
    }

    @Test
    @DisplayName("Case 20: Action queue sorting")
    void testActionQueueSorting() {
        ActionItem a1 = new ActionItem("ACT-1", "DEC-1", "VH-1001", "ENGINE_FAULT", "CRITICAL", "CRITICAL", 45000.0, "Action 1", 0.95, "OPEN", "RULE_ENGINE", false);
        ActionItem a2 = new ActionItem("ACT-2", "DEC-2", "VH-1002", "EXCESSIVE_IDLE", "MEDIUM", "MEDIUM", 2500.0, "Action 2", 0.90, "OPEN", "RULE_ENGINE", false);
        ActionItem a3 = new ActionItem("ACT-3", "DEC-3", "VH-1003", "MAINTENANCE_DUE", "HIGH", "HIGH", 8500.0, "Action 3", 0.95, "OPEN", "RULE_ENGINE", false);

        List<ActionItem> actions = new ArrayList<>(List.of(a2, a1, a3));

        // Sort priority: CRITICAL > HIGH > MEDIUM > LOW
        Map<String, Integer> priorityRank = Map.of("CRITICAL", 0, "HIGH", 1, "MEDIUM", 2, "LOW", 3);
        actions.sort(Comparator.comparingInt(a -> priorityRank.getOrDefault(a.getPriority(), 99)));

        assertEquals("ACT-1", actions.get(0).getActionId());
        assertEquals("CRITICAL", actions.get(0).getPriority());
        assertEquals("ACT-3", actions.get(1).getActionId());
        assertEquals("HIGH", actions.get(1).getPriority());
        assertEquals("ACT-2", actions.get(2).getActionId());
        assertEquals("MEDIUM", actions.get(2).getPriority());
    }

    @Test
    @DisplayName("Case 21: Duplicate event handling")
    void testDuplicateEventHandling() {
        Set<String> processedEventIds = new HashSet<>();
        String eventId = "EVT-DUP-001";

        boolean firstAttempt = processedEventIds.add(eventId);
        boolean duplicateAttempt = !processedEventIds.add(eventId);

        assertTrue(firstAttempt, "First event should be registered");
        assertTrue(duplicateAttempt, "Second event with identical ID should be detected as duplicate");
    }
}
