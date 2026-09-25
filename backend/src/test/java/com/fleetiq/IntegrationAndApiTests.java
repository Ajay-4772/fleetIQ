package com.fleetiq;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fleetiq.dto.ActionStatusUpdateRequest;
import com.fleetiq.dto.FleetQueryRequest;
import com.fleetiq.dto.IngestionRequest;
import com.fleetiq.model.Vehicle;
import com.fleetiq.repository.VehicleRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@org.springframework.security.test.context.support.WithMockUser(roles = {"ADMIN", "OPERATIONS_LEAD"})
public class IntegrationAndApiTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Case 22: Database persistence test")
    void testDatabasePersistence() {
        Vehicle v = new Vehicle("VH-TEST-22", "VIN-TEST-22", "REG-TEST-22", "Toyota", "Tacoma",
                2024, "GASOLINE", "TRUCK", 15000L, "ACTIVE", 95.0, 85.0, 34.0, 21.0, null);
        vehicleRepository.save(v);

        assertTrue(vehicleRepository.findById("VH-TEST-22").isPresent());
        Vehicle found = vehicleRepository.findById("VH-TEST-22").get();
        assertEquals("Tacoma", found.getModel());
    }

    @Test
    @DisplayName("Case 23: REST validation test")
    void testRestValidation() throws Exception {
        // Missing source and payload
        mockMvc.perform(post("/api/events/ingest")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value("FAILED"));
    }

    @Test
    @DisplayName("Case 24: Error handling on unknown route or bad action update")
    void testErrorHandling() throws Exception {
        ActionStatusUpdateRequest badReq = new ActionStatusUpdateRequest("INVALID_STATUS", "note");
        mockMvc.perform(patch("/api/actions/ACT-NON-EXISTENT/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(badReq)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Dashboard Summary API test")
    void testDashboardSummaryApi() throws Exception {
        mockMvc.perform(get("/api/dashboard/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalVehicles").isNumber())
                .andExpect(jsonPath("$.fleetHealthScore").isNumber());
    }

    @Test
    @DisplayName("Dashboard Health API test")
    void testDashboardHealthApi() throws Exception {
        mockMvc.perform(get("/api/dashboard/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.healthyPercentage").isNumber());
    }

    @Test
    @DisplayName("End-to-End Ingestion Flow test")
    void testEndToEndIngestion() throws Exception {
        Map<String, Object> payload = new HashMap<>();
        payload.put("vehicle_id", "VH-1001");
        payload.put("oil_life", 65.0);
        payload.put("idle_minutes", 12);
        payload.put("odometer", 48000L);

        IngestionRequest req = new IngestionRequest("SIMULATED_TOYOTA", payload);

        mockMvc.perform(post("/api/events/ingest")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PROCESSED"))
                .andExpect(jsonPath("$.eventId").isNotEmpty());
    }

    @Test
    @DisplayName("Controlled Fleet Query API test")
    void testFleetQueryApi() throws Exception {
        FleetQueryRequest req = new FleetQueryRequest("MAINTENANCE_REQUIRED", Collections.emptyMap());

        mockMvc.perform(post("/api/fleet/query")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.intent").value("MAINTENANCE_REQUIRED"))
                .andExpect(jsonPath("$.summary").isNotEmpty());
    }
}
