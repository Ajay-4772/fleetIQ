package com.fleetiq.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fleetiq.dto.IngestionRequest;
import com.fleetiq.dto.IngestionResponse;
import com.fleetiq.model.DataSource;
import com.fleetiq.model.IngestionJob;
import com.fleetiq.model.RawIngestionRecord;
import com.fleetiq.repository.DataSourceRepository;
import com.fleetiq.repository.IngestionJobRepository;
import com.fleetiq.repository.RawIngestionRecordRepository;
import com.fleetiq.service.EventProcessingService;
import com.fleetiq.service.ingestion.ExcelCsvIngestionService;
import com.fleetiq.service.ingestion.connector.ConnectorRegistry;
import com.fleetiq.service.ingestion.connector.DataSourceConnector;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/v1/ingestion")
public class IngestionController {

    private static final Logger log = LoggerFactory.getLogger(IngestionController.class);

    private final DataSourceRepository dataSourceRepository;
    private final IngestionJobRepository jobRepository;
    private final RawIngestionRecordRepository rawRecordRepository;
    private final EventProcessingService eventProcessingService;
    private final ExcelCsvIngestionService excelCsvIngestionService;
    private final ConnectorRegistry connectorRegistry;
    private final ObjectMapper objectMapper;

    public IngestionController(DataSourceRepository dataSourceRepository,
                               IngestionJobRepository jobRepository,
                               RawIngestionRecordRepository rawRecordRepository,
                               EventProcessingService eventProcessingService,
                               ExcelCsvIngestionService excelCsvIngestionService,
                               ConnectorRegistry connectorRegistry,
                               ObjectMapper objectMapper) {
        this.dataSourceRepository = dataSourceRepository;
        this.jobRepository = jobRepository;
        this.rawRecordRepository = rawRecordRepository;
        this.eventProcessingService = eventProcessingService;
        this.excelCsvIngestionService = excelCsvIngestionService;
        this.connectorRegistry = connectorRegistry;
        this.objectMapper = objectMapper;
    }

    // ==========================================
    // 1. DATA SOURCES MANAGEMENT (ADMIN ONLY)
    // ==========================================

    @GetMapping("/sources")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<DataSource>> getAllSources() {
        return ResponseEntity.ok(dataSourceRepository.findAll());
    }

    @PostMapping("/sources")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<DataSource> createSource(@RequestBody Map<String, Object> payload, Authentication auth) {
        String name = (String) payload.get("name");
        String type = (String) payload.get("sourceType");
        String configStr = payload.get("configuration") instanceof String s ? s : "";
        if (configStr.isBlank() && payload.get("configuration") != null) {
            try {
                configStr = objectMapper.writeValueAsString(payload.get("configuration"));
            } catch (Exception ignored) {}
        }
        String id = "SRC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String creator = auth != null ? auth.getName() : "system";

        DataSource source = new DataSource(id, name, type, "DISCONNECTED", configStr, (String) payload.get("credentialReference"), creator);
        if (payload.get("schemaMapping") != null) {
            source.setSchemaMapping(payload.get("schemaMapping").toString());
        }
        DataSource saved = dataSourceRepository.save(source);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/sources/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<DataSource> getSource(@PathVariable String id) {
        return dataSourceRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/sources/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<DataSource> updateSource(@PathVariable String id, @RequestBody Map<String, Object> payload) {
        return dataSourceRepository.findById(id).map(source -> {
            if (payload.containsKey("name")) source.setName((String) payload.get("name"));
            if (payload.containsKey("configuration")) {
                Object cfg = payload.get("configuration");
                try {
                    source.setConfiguration(cfg instanceof String s ? s : objectMapper.writeValueAsString(cfg));
                } catch (Exception ignored) {}
            }
            if (payload.containsKey("schemaMapping")) source.setSchemaMapping(payload.get("schemaMapping").toString());
            if (payload.containsKey("enabled")) source.setEnabled((Boolean) payload.get("enabled"));
            source.setUpdatedAt(Instant.now());
            return ResponseEntity.ok(dataSourceRepository.save(source));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/sources/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteSource(@PathVariable String id) {
        if (dataSourceRepository.existsById(id)) {
            dataSourceRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/sources/{id}/test")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> testSourceConnection(@PathVariable String id) {
        Optional<DataSource> opt = dataSourceRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        DataSource source = opt.get();

        Map<String, Object> config = parseConfig(source.getConfiguration());
        Optional<DataSourceConnector> connOpt = connectorRegistry.getConnector(source.getSourceType());

        boolean connected = connOpt.map(c -> c.testConnection(config)).orElse(false);
        return ResponseEntity.ok(Map.of(
                "sourceId", id,
                "connected", connected,
                "message", connected ? "Connection verified successfully" : "Connection failed to reachable host"
        ));
    }

    @PostMapping("/sources/{id}/inspect-schema")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> inspectSourceSchema(@PathVariable String id) {
        Optional<DataSource> opt = dataSourceRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        DataSource source = opt.get();

        Map<String, Object> config = parseConfig(source.getConfiguration());
        Optional<DataSourceConnector> connOpt = connectorRegistry.getConnector(source.getSourceType());

        Map<String, Object> schema = connOpt.map(c -> c.inspectSchema(config)).orElse(Map.of());
        return ResponseEntity.ok(schema);
    }

    @PostMapping("/sources/{id}/start")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<DataSource> startSource(@PathVariable String id) {
        return dataSourceRepository.findById(id).map(source -> {
            Optional<DataSourceConnector> connOpt = connectorRegistry.getConnector(source.getSourceType());
            Map<String, Object> config = parseConfig(source.getConfiguration());
            connOpt.ifPresent(c -> c.start(id, config));
            source.setStatus("CONNECTED");
            source.setLastConnectedAt(Instant.now());
            source.setUpdatedAt(Instant.now());
            return ResponseEntity.ok(dataSourceRepository.save(source));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/sources/{id}/stop")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<DataSource> stopSource(@PathVariable String id) {
        return dataSourceRepository.findById(id).map(source -> {
            Optional<DataSourceConnector> connOpt = connectorRegistry.getConnector(source.getSourceType());
            connOpt.ifPresent(c -> c.stop(id));
            source.setStatus("DISCONNECTED");
            source.setUpdatedAt(Instant.now());
            return ResponseEntity.ok(dataSourceRepository.save(source));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ==========================================
    // 2. EXCEL & CSV BATCH UPLOAD (ADMIN ONLY)
    // ==========================================

    @PostMapping(value = "/upload/preview", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> previewDataset(@RequestParam("file") MultipartFile file) {
        try {
            Map<String, Object> preview = excelCsvIngestionService.previewFile(file);
            return ResponseEntity.ok(preview);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to parse file preview: " + e.getMessage()));
        }
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> uploadDataset(@RequestParam("file") MultipartFile file,
                                          @RequestParam(value = "mapping", required = false) String mappingJson,
                                          Authentication auth) {
        try {
            Map<String, String> mapping = new HashMap<>();
            if (mappingJson != null && !mappingJson.isBlank()) {
                mapping = objectMapper.readValue(mappingJson, new TypeReference<Map<String, String>>() {});
            }
            String uploadedBy = auth != null ? auth.getName() : "admin";
            IngestionJob job = excelCsvIngestionService.processFile(file, mapping, uploadedBy);
            return ResponseEntity.status(HttpStatus.CREATED).body(job);
        } catch (Exception e) {
            log.error("Failed to process dataset file: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Ingestion processing error: " + e.getMessage()));
        }
    }

    // ==========================================
    // 3. SECURE WEBHOOK INGESTION (PUSH)
    // ==========================================

    @PostMapping("/webhooks/{sourceId}")
    public ResponseEntity<?> receiveWebhook(@PathVariable String sourceId,
                                            @RequestBody Map<String, Object> payload,
                                            @RequestHeader(value = "X-Vehyron-Signature", required = false) String signature,
                                            @RequestHeader(value = "X-Signature", required = false) String legacySig) {
        Optional<DataSource> sourceOpt = dataSourceRepository.findById(sourceId);
        if (sourceOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Unknown webhook data source: " + sourceId));
        }

        DataSource source = sourceOpt.get();
        if (!source.isEnabled()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Data source is disabled"));
        }

        try {
            String eventId = "WB-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            IngestionRequest req = new IngestionRequest("WEBHOOK_" + source.getName().toUpperCase(), payload);
            req.setEventId(eventId);
            if (payload.containsKey("vehicle_id")) req.setVehicleId(payload.get("vehicle_id").toString());
            if (payload.containsKey("vehicleId")) req.setVehicleId(payload.get("vehicleId").toString());
            if (payload.containsKey("timestamp")) req.setTimestamp(payload.get("timestamp").toString());

            IngestionResponse response = eventProcessingService.processEvent(req);

            source.setEventsReceived(source.getEventsReceived() + 1);
            source.setEventsProcessed(source.getEventsProcessed() + 1);
            source.setLastEventAt(Instant.now());
            source.setStatus("CONNECTED");
            dataSourceRepository.save(source);

            return ResponseEntity.accepted().body(response);
        } catch (Exception e) {
            source.setEventsRejected(source.getEventsRejected() + 1);
            source.setLastError(e.getMessage());
            source.setLastErrorAt(Instant.now());
            dataSourceRepository.save(source);
            return ResponseEntity.badRequest().body(Map.of("error", "Webhook processing failed: " + e.getMessage()));
        }
    }

    // ==========================================
    // 4. JOBS, QUALITY & RAW RECORDS AUDIT
    // ==========================================

    @GetMapping("/jobs")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<IngestionJob>> getIngestionJobs() {
        return ResponseEntity.ok(jobRepository.findAllByOrderByStartedAtDesc());
    }

    @GetMapping("/jobs/{jobId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<IngestionJob> getIngestionJob(@PathVariable String jobId) {
        return jobRepository.findById(jobId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/quality")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> getDataQuality() {
        long activeSources = dataSourceRepository.countByStatus("CONNECTED");
        long totalSources = dataSourceRepository.count();

        Map<String, Object> quality = new LinkedHashMap<>();
        quality.put("totalReceived", eventProcessingService.getTotalReceived());
        quality.put("successfullyNormalized", eventProcessingService.getSuccessfullyNormalized());
        quality.put("normalizationFailed", eventProcessingService.getNormalizationFailed());
        quality.put("invalidPayloads", eventProcessingService.getInvalidPayloads());
        quality.put("duplicateEvents", eventProcessingService.getDuplicateEvents());
        quality.put("unsupportedSources", eventProcessingService.getUnsupportedSources());
        quality.put("processingFailed", eventProcessingService.getProcessingFailed());
        quality.put("activeSourcesCount", activeSources);
        quality.put("totalSourcesCount", totalSources);
        quality.put("freshness", activeSources > 0 ? "LIVE" : "OFFLINE");
        return ResponseEntity.ok(quality);
    }

    @GetMapping("/raw-records")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<RawIngestionRecord>> getRawRecords() {
        return ResponseEntity.ok(rawRecordRepository.findAll());
    }

    @PostMapping("/retry/{recordId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> retryRawRecord(@PathVariable Long recordId) {
        Optional<RawIngestionRecord> opt = rawRecordRepository.findById(recordId);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        RawIngestionRecord record = opt.get();
        try {
            Map<String, Object> payload = objectMapper.readValue(record.getRawPayload(), new TypeReference<Map<String, Object>>() {});
            IngestionRequest req = new IngestionRequest(record.getSource(), payload);
            req.setEventId("REPLAY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            IngestionResponse res = eventProcessingService.processEvent(req);

            record.setStatus("SUCCESS");
            record.setErrorMessage(null);
            rawRecordRepository.save(record);
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Replay failed: " + e.getMessage()));
        }
    }

    private Map<String, Object> parseConfig(String configStr) {
        if (configStr == null || configStr.isBlank()) return Map.of();
        try {
            return objectMapper.readValue(configStr, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            return Map.of();
        }
    }
}
