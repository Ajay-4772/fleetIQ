package com.fleetiq;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fleetiq.model.CanonicalVehicleEvent;
import com.fleetiq.service.normalization.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class NormalizationTests {

    private NormalizationService normalizationService;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        List<OemAdapter> adapters = List.of(
                new ToyotaAdapter(),
                new FordAdapter(),
                new BmwAdapter(),
                new TeslaEvAdapter()
        );
        normalizationService = new NormalizationService(adapters, objectMapper);
    }

    @Test
    @DisplayName("Case 1: Valid Toyota normalization")
    void testValidToyotaNormalization() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("vehicle_id", "VH-1001");
        payload.put("oil_life", 18.0);
        payload.put("fault", "P0301");
        payload.put("idle_minutes", 48);
        payload.put("battery_pct", 92.0);
        payload.put("odometer", 45000L);

        CanonicalVehicleEvent event = normalizationService.normalize("SIMULATED_TOYOTA", payload);

        assertNotNull(event);
        assertEquals("VH-1001", event.getVehicleId());
        assertEquals("P0301", event.getFaultCode());
        assertEquals(48, event.getIdleMinutes());
        assertEquals(18.0, event.getOilLifePct());
        assertEquals("SIMULATED_TOYOTA", event.getSource());
        assertEquals("NORMALIZED", event.getStatus());
    }

    @Test
    @DisplayName("Case 2: Valid Ford normalization")
    void testValidFordNormalization() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("vehicleIdentifier", "VH-1002");
        payload.put("oilLifePercentage", 15.0);
        payload.put("diagnosticCode", "P0420");
        payload.put("idleDuration", 35);
        payload.put("batteryState", 90.0);
        payload.put("mileage", 62000L);

        CanonicalVehicleEvent event = normalizationService.normalize("SIMULATED_FORD", payload);

        assertNotNull(event);
        assertEquals("VH-1002", event.getVehicleId());
        assertEquals("P0420", event.getFaultCode());
        assertEquals(35, event.getIdleMinutes());
        assertEquals(15.0, event.getOilLifePct());
        assertEquals("SIMULATED_FORD", event.getSource());
    }

    @Test
    @DisplayName("Case 3: Valid BMW normalization")
    void testValidBmwNormalization() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("vehicleIdentifier", "VH-1003");
        payload.put("oil_life_remaining", 12.0);
        payload.put("dtc", "P0300");
        payload.put("idlingTimeMinutes", 65);
        payload.put("batteryHealth", 88.0);
        payload.put("totalDistanceKm", 31000L);

        CanonicalVehicleEvent event = normalizationService.normalize("SIMULATED_BMW", payload);

        assertNotNull(event);
        assertEquals("VH-1003", event.getVehicleId());
        assertEquals("P0300", event.getFaultCode());
        assertEquals(65, event.getIdleMinutes());
        assertEquals(12.0, event.getOilLifePct());
        assertEquals("SIMULATED_BMW", event.getSource());
    }

    @Test
    @DisplayName("Case 4: Invalid payload rejection")
    void testInvalidPayloadRejection() {
        Map<String, Object> invalidPayload = new HashMap<>();
        invalidPayload.put("vehicle_id", ""); // empty id
        invalidPayload.put("oil_life", -50.0); // negative oil life

        assertThrows(IllegalArgumentException.class, () -> {
            normalizationService.normalize("SIMULATED_TOYOTA", invalidPayload);
        });
    }

    @Test
    @DisplayName("Case 5: Unknown source rejection")
    void testUnknownSourceRejection() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("unknown_field", "value");

        assertThrows(IllegalArgumentException.class, () -> {
            normalizationService.normalize("UNSUPPORTED_OEM_UNKNOWN", payload);
        });
    }

    @Test
    @DisplayName("Case 6: Canonical event validation")
    void testCanonicalEventValidation() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("vehicle_id", "VH-1005");
        payload.put("oil_life", 85.0);
        payload.put("idle_minutes", 10);

        CanonicalVehicleEvent event = normalizationService.normalize("SIMULATED_TOYOTA", payload);

        assertNotNull(event.getEventId());
        assertTrue(event.getEventId().startsWith("EVT-"));
        assertNotNull(event.getTimestamp());
        assertNotNull(event.getRawPayload());
        assertEquals("NORMALIZED", event.getStatus());
    }
}
