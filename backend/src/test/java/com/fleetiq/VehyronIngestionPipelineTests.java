package com.fleetiq;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fleetiq.model.DataSource;
import com.fleetiq.model.RawIngestionRecord;
import com.fleetiq.repository.DataSourceRepository;
import com.fleetiq.repository.RawIngestionRecordRepository;
import com.fleetiq.repository.VehicleRepository;
import com.fleetiq.security.JwtTokenProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class VehyronIngestionPipelineTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private DataSourceRepository dataSourceRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private RawIngestionRecordRepository rawRecordRepository;

    @Test
    @DisplayName("Ingestion-01: Admin creates, tests handshake, and starts a Kafka telemetry connector")
    void testKafkaConnectorLifecycle() throws Exception {
        String adminToken = jwtTokenProvider.generateToken("admin", "ROLE_ADMIN");

        DataSource ds = new DataSource();
        ds.setName("Production European Fleet Stream");
        ds.setType("KAFKA");
        ds.setConfiguration("{\"brokerUrl\":\"kafka.telematics.internal:9092\",\"topic\":\"vehyron.telemetry.events\"}");
        ds.setCredentialReference("VAULT_KAFKA_SECRET");
        ds.setEnabled(true);

        // 1. Create Data Source
        String createRes = mockMvc.perform(post("/api/v1/ingestion/sources")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(ds)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.type").value("KAFKA"))
                .andReturn().getResponse().getContentAsString();

        String sourceId = objectMapper.readTree(createRes).get("id").asText();

        // 2. Test Connection Handshake
        mockMvc.perform(post("/api/v1/ingestion/sources/" + sourceId + "/test")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sourceId").value(sourceId))
                .andExpect(jsonPath("$.message").isNotEmpty());

        // 3. Start Ingestion Connector
        mockMvc.perform(post("/api/v1/ingestion/sources/" + sourceId + "/start")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONNECTED"));
    }

    @Test
    @DisplayName("Ingestion-02: Public Webhook receives multi-OEM payload and routes to vehicle pipeline")
    void testWebhookIngestionAndAutoRegistration() throws Exception {
        // Ensure webhook data source exists
        if (dataSourceRepository.findById("toyota-hardware-gw").isEmpty()) {
            DataSource ds = new DataSource();
            ds.setId("toyota-hardware-gw");
            ds.setName("Toyota Hardware Gateway");
            ds.setSourceType("WEBHOOK");
            ds.setStatus("CONNECTED");
            ds.setEnabled(true);
            dataSourceRepository.save(ds);
        }

        // Vehicle ID unique to this test
        String testVehicleId = "VH-TEST-" + System.currentTimeMillis();
        String jsonPayload = """
                {
                    "unit_id": "%s",
                    "vin": "1HGCR2F83HA009999",
                    "oem": "Toyota",
                    "battery": 11.2,
                    "oil_life": 4,
                    "tire_pressure": 27.5,
                    "mileage": 52140.0,
                    "timestamp": "2026-09-25T21:04:32Z"
                }
                """.formatted(testVehicleId);

        mockMvc.perform(post("/api/v1/ingestion/webhooks/toyota-hardware-gw")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.status").value("PROCESSED"))
                .andExpect(jsonPath("$.vehicleId").value(testVehicleId));

        // Verify vehicle was dynamically created and registered in database
        var vehicleOpt = vehicleRepository.findById(testVehicleId);
        assertTrue(vehicleOpt.isPresent(), "Ingested vehicle must be automatically registered in Fleet Asset Registry");
        assertEquals("Toyota", vehicleOpt.get().getMake());
        assertEquals("1HGCR2F83HA009999", vehicleOpt.get().getVin());
    }

    @Test
    @DisplayName("Ingestion-03: CSV batch dataset upload automatically infers columns and executes end-to-end ingestion")
    void testBatchCsvIngestion() throws Exception {
        String adminToken = jwtTokenProvider.generateToken("admin", "ROLE_ADMIN");

        String csvVehicleId = "VH-CSV-" + System.currentTimeMillis();
        String csvContent = "vehicle_id,vin,make,battery_voltage,oil_life,tire_pressure,mileage\n" +
                csvVehicleId + ",1HGCR2F83HA001111,Ford,12.6,85,32.0,14500.0\n";

        MockMultipartFile csvFile = new MockMultipartFile(
                "file",
                "test_fleet_dataset.csv",
                "text/csv",
                csvContent.getBytes(StandardCharsets.UTF_8)
        );

        // 1. Preview inspection
        mockMvc.perform(multipart("/api/v1/ingestion/upload/preview")
                        .file(csvFile)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRows").value(1))
                .andExpect(jsonPath("$.detectedMapping.vehicle_id").value("vehicleId"));

        // 2. Full Upload and Processing
        mockMvc.perform(multipart("/api/v1/ingestion/upload")
                        .file(csvFile)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.totalRecords").value(1))
                .andExpect(jsonPath("$.processedRecords").value(1));

        // Verify vehicle registration in DB
        var vehicleOpt = vehicleRepository.findById(csvVehicleId);
        assertTrue(vehicleOpt.isPresent(), "CSV ingested vehicle must appear in Fleet Asset Registry");
    }

    @Test
    @DisplayName("Ingestion-04: Operator is forbidden from uploading batch datasets (RBAC)")
    void testOperatorForbiddenFromUploadingDatasets() throws Exception {
        String operatorToken = jwtTokenProvider.generateToken("operator", "ROLE_OPERATOR");

        MockMultipartFile csvFile = new MockMultipartFile(
                "file",
                "forbidden.csv",
                "text/csv",
                "dummy,content\n".getBytes(StandardCharsets.UTF_8)
        );

        mockMvc.perform(multipart("/api/v1/ingestion/upload")
                        .file(csvFile)
                        .header("Authorization", "Bearer " + operatorToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Ingestion-05: Raw records dead-letter retry reprocesses through the normalization pipeline")
    void testDeadLetterReplay() throws Exception {
        String adminToken = jwtTokenProvider.generateToken("admin", "ROLE_ADMIN");

        // Save a mock failed raw record
        RawIngestionRecord raw = new RawIngestionRecord();
        raw.setSource("SIMULATED_BMW");
        raw.setStatus("FAILED");
        raw.setErrorMessage("Simulation transient socket timeout");
        raw.setRawPayload("{\"vehicle_id\":\"VH-REPLAY-999\",\"battery_voltage\":12.4,\"oil_life\":88.0,\"timestamp\":\"2026-09-25T21:00:00Z\"}");
        raw = rawRecordRepository.save(raw);

        // Replay record
        mockMvc.perform(post("/api/v1/ingestion/retry/" + raw.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        var updated = rawRecordRepository.findById(raw.getId()).orElseThrow();
        assertEquals("SUCCESS", updated.getStatus());
    }
}
