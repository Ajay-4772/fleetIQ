package com.fleetiq;

import com.fleetiq.dto.IngestionRequest;
import com.fleetiq.model.Role;
import com.fleetiq.model.Vehicle;
import com.fleetiq.repository.CanonicalVehicleEventRepository;
import com.fleetiq.repository.UserRepository;
import com.fleetiq.repository.VehicleRepository;
import com.fleetiq.security.JwtTokenProvider;
import com.fleetiq.service.EventProcessingService;
import com.fleetiq.service.user.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class VehyronProductionHardeningTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private EventProcessingService eventProcessingService;

    @Autowired
    private CanonicalVehicleEventRepository eventRepository;

    @Test
    @DisplayName("Hardening-01: Defensive Security Headers Present on HTTP Responses")
    void testSecurityHeadersPresentInResponse() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("X-Frame-Options", "SAMEORIGIN"));
    }

    @Test
    @DisplayName("Hardening-02: SQL Injection Payloads in Search are Neutralized Safely")
    void testSqlInjectionPayloadsInSearchAreNeutralized() throws Exception {
        String token = jwtTokenProvider.generateToken("operator", "ROLE_OPERATOR");

        // Attempt classic SQL injection in vehicle query
        mockMvc.perform(get("/api/v1/vehicles")
                        .param("make", "' OR '1'='1' --")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("Hardening-03: Path Traversal and Executable Uploads are Rejected")
    void testPathTraversalFileUploadIsRejected() throws Exception {
        String adminToken = jwtTokenProvider.generateToken("admin", "ROLE_ADMIN");

        // 1. Path traversal in filename
        MockMultipartFile traversalFile = new MockMultipartFile(
                "file",
                "../../etc/passwd",
                "text/csv",
                "vehicleId,vin\nVH-1,VIN1".getBytes(StandardCharsets.UTF_8)
        );

        mockMvc.perform(multipart("/api/v1/ingestion/upload/preview")
                        .file(traversalFile)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_ARGUMENT"));

        // 2. Disallowed executable extension
        MockMultipartFile exeFile = new MockMultipartFile(
                "file",
                "malware.exe",
                "application/octet-stream",
                "MZ\0\0".getBytes(StandardCharsets.UTF_8)
        );

        mockMvc.perform(multipart("/api/v1/ingestion/upload/preview")
                        .file(exeFile)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_ARGUMENT"));
    }

    @Test
    @DisplayName("Hardening-04: Out-of-Order Telemetry Does Not Regress Vehicle Live State")
    void testOutOfOrderEventDoesNotRegressState() {
        String vehicleId = "VH-HARDEN-" + System.currentTimeMillis();

        // 1. Ingest newer event (Time T = Now, Oil Life = 25%, Battery = 60%)
        Instant newerTime = Instant.now();
        IngestionRequest newerEvent = new IngestionRequest();
        newerEvent.setEventId("EVT-NEW-" + System.currentTimeMillis());
        newerEvent.setSource("BMW_OEM");
        newerEvent.setPayload(Map.of(
                "vehicleId", vehicleId,
                "oil_life", 25.0,
                "battery", 60.0,
                "timestamp", newerTime.toString()
        ));
        eventProcessingService.processEvent(newerEvent);

        Vehicle vAfterNewer = vehicleRepository.findById(vehicleId).orElseThrow();
        assertEquals(25.0, vAfterNewer.getOilLifePct(), 0.01);
        assertEquals(60.0, vAfterNewer.getBatteryHealthPct(), 0.01);

        // 2. Ingest older delayed event (Time T-1 Hour, Oil Life = 90%, Battery = 95%)
        Instant olderTime = newerTime.minus(1, ChronoUnit.HOURS);
        IngestionRequest olderEvent = new IngestionRequest();
        olderEvent.setEventId("EVT-OLD-" + System.currentTimeMillis());
        olderEvent.setSource("BMW_OEM");
        olderEvent.setPayload(Map.of(
                "vehicleId", vehicleId,
                "oil_life", 90.0,
                "battery", 95.0,
                "timestamp", olderTime.toString()
        ));
        eventProcessingService.processEvent(olderEvent);

        // 3. Verify vehicle live snapshot did NOT regress to the older 90% oil life!
        Vehicle vAfterOlder = vehicleRepository.findById(vehicleId).orElseThrow();
        assertEquals(25.0, vAfterOlder.getOilLifePct(), 0.01, "Live oil life must not regress from older delayed event");
        assertEquals(60.0, vAfterOlder.getBatteryHealthPct(), 0.01, "Live battery health must not regress from older delayed event");

        // But historical event was recorded
        assertTrue(eventRepository.findById(olderEvent.getEventId()).isPresent(), "Historical older event must still be persisted");
    }

    @Test
    @DisplayName("Hardening-05: Physically Impossible Sensor Readings are Rejected")
    void testPhysicallyImpossibleTelemetryIsRejected() {
        String vehicleId = "VH-IMPOSSIBLE-" + System.currentTimeMillis();

        // Negative oil life (-500%)
        IngestionRequest badOil = new IngestionRequest();
        badOil.setEventId("EVT-BADOIL-" + System.currentTimeMillis());
        badOil.setSource("TOYOTA_OEM");
        badOil.setPayload(Map.of(
                "vehicleId", vehicleId,
                "oil_life", -500.0
        ));

        assertThrows(IllegalArgumentException.class, () -> eventProcessingService.processEvent(badOil));

        // Absurd tire pressure (99999 PSI)
        IngestionRequest badTire = new IngestionRequest();
        badTire.setEventId("EVT-BADTIRE-" + System.currentTimeMillis());
        badTire.setSource("TOYOTA_OEM");
        badTire.setPayload(Map.of(
                "vehicleId", vehicleId,
                "tire_pressure", 99999.0
        ));

        assertThrows(IllegalArgumentException.class, () -> eventProcessingService.processEvent(badTire));
    }

    @Test
    @DisplayName("Hardening-06: Administrator Cannot Demote Their Own Account")
    void testAdminCannotDemoteSelf() {
        var adminUser = userRepository.findByRole(Role.ROLE_ADMIN).stream().findFirst().orElseThrow();

        assertThrows(IllegalArgumentException.class, () -> {
            userService.updateUserRole(adminUser.getId(), Role.ROLE_OPERATOR, adminUser.getUsername(), "127.0.0.1");
        }, "Admin must not be allowed to self-demote to prevent lockouts");
    }

    @Test
    @DisplayName("Hardening-07: Pagination Size is Strictly Bounded to Prevent Heap Exhaustion")
    void testPaginationSizeIsBounded() throws Exception {
        String token = jwtTokenProvider.generateToken("operator", "ROLE_OPERATOR");

        // Request excessive page size 100,000
        MvcResult res = mockMvc.perform(get("/api/v1/actions")
                        .param("page", "0")
                        .param("size", "100000")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();

        // Clamped size should not exceed 100
        String body = res.getResponse().getContentAsString();
        assertTrue(body.contains("\"size\":100") || body.contains("\"size\": 100"), "Page size must be clamped to max 100");
    }

    @Test
    @DisplayName("Hardening-08: Unauthenticated Users Receive 401 with Structured Error Envelope")
    void testUnauthenticatedAccessReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/vehicles"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    @Test
    @DisplayName("Hardening-09: Operator Forbidden from Accessing Admin Ingestion Config (403)")
    void testOperatorForbiddenFromAdminIngestion() throws Exception {
        String operatorToken = jwtTokenProvider.generateToken("operator", "ROLE_OPERATOR");

        mockMvc.perform(get("/api/v1/ingestion/sources")
                        .header("Authorization", "Bearer " + operatorToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.code").value("ACCESS_DENIED"));
    }
}
