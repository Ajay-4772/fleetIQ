package com.fleetiq.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fleetiq.dto.DashboardEventDto;
import com.fleetiq.dto.IngestionRequest;
import com.fleetiq.dto.IngestionResponse;
import com.fleetiq.model.*;
import com.fleetiq.repository.*;
import com.fleetiq.service.action.ActionService;
import com.fleetiq.service.decision.DecisionService;
import com.fleetiq.service.detection.IssueDetectionService;
import com.fleetiq.service.impact.ImpactCalculationService;
import com.fleetiq.service.normalization.NormalizationService;
import com.fleetiq.service.sse.DashboardEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Service
public class EventProcessingService {

    private final NormalizationService normalizationService;
    private final IssueDetectionService issueDetectionService;
    private final ImpactCalculationService impactCalculationService;
    private final DecisionService decisionService;
    private final ActionService actionService;
    private final CanonicalVehicleEventRepository eventRepository;
    private final DecisionRepository decisionRepository;
    private final VehicleRepository vehicleRepository;
    private final RawIngestionRecordRepository rawRecordRepository;
    private final DashboardEventPublisher eventPublisher;
    private final ObjectMapper objectMapper;

    // In-memory data quality counters
    private long totalReceived = 0;
    private long successfullyNormalized = 0;
    private long normalizationFailed = 0;
    private long invalidPayloads = 0;
    private long duplicateEvents = 0;
    private long unsupportedSources = 0;
    private long processingFailed = 0;
    private final java.util.Set<String> processedIdempotencyKeys = java.util.concurrent.ConcurrentHashMap.newKeySet();

    public EventProcessingService(NormalizationService normalizationService,
                                  IssueDetectionService issueDetectionService,
                                  ImpactCalculationService impactCalculationService,
                                  DecisionService decisionService,
                                  ActionService actionService,
                                  CanonicalVehicleEventRepository eventRepository,
                                  DecisionRepository decisionRepository,
                                  VehicleRepository vehicleRepository,
                                  RawIngestionRecordRepository rawRecordRepository,
                                  DashboardEventPublisher eventPublisher,
                                  ObjectMapper objectMapper) {
        this.normalizationService = normalizationService;
        this.issueDetectionService = issueDetectionService;
        this.impactCalculationService = impactCalculationService;
        this.decisionService = decisionService;
        this.actionService = actionService;
        this.eventRepository = eventRepository;
        this.decisionRepository = decisionRepository;
        this.vehicleRepository = vehicleRepository;
        this.rawRecordRepository = rawRecordRepository;
        this.eventPublisher = eventPublisher;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public IngestionResponse processEvent(IngestionRequest request) {
        totalReceived++;
        String correlationId = request.getCorrelationId() != null ? request.getCorrelationId() : java.util.UUID.randomUUID().toString();

        // Check idempotency key if provided
        if (request.getIdempotencyKey() != null && !request.getIdempotencyKey().isBlank()) {
            if (processedIdempotencyKeys.contains(request.getIdempotencyKey())) {
                duplicateEvents++;
                return IngestionResponse.duplicate(request.getEventId(), correlationId, "Event with idempotency key already processed: " + request.getIdempotencyKey());
            }
            processedIdempotencyKeys.add(request.getIdempotencyKey());
        }

        // Check if event ID already exists
        if (request.getEventId() != null && eventRepository.findById(request.getEventId()).isPresent()) {
            duplicateEvents++;
            return IngestionResponse.duplicate(request.getEventId(), correlationId, "Event ID already processed: " + request.getEventId());
        }

        String source = request.getSource();
        String rawJson;

        try {
            rawJson = objectMapper.writeValueAsString(request.getPayload());
        } catch (Exception e) {
            rawJson = request.getPayload() != null ? request.getPayload().toString() : "";
        }

        // 1. Normalization
        CanonicalVehicleEvent event;
        try {
            event = normalizationService.normalize(source, request.getPayload());
            if (request.getEventId() != null && !request.getEventId().isBlank()) {
                event.setEventId(request.getEventId());
            }
            successfullyNormalized++;
        } catch (IllegalArgumentException e) {
            normalizationFailed++;
            if (e.getMessage() != null && e.getMessage().contains("Unsupported")) {
                unsupportedSources++;
            } else {
                invalidPayloads++;
            }
            rawRecordRepository.save(new RawIngestionRecord(source, rawJson, "FAILED", e.getMessage()));
            throw e;
        } catch (Exception e) {
            normalizationFailed++;
            processingFailed++;
            rawRecordRepository.save(new RawIngestionRecord(source, rawJson, "FAILED", e.getMessage()));
            throw new RuntimeException("Normalization error: " + e.getMessage(), e);
        }

        // 2. Issue Detection & Impact Calculation
        issueDetectionService.detectAndClassify(event);
        double impact = impactCalculationService.calculateEstimatedCostImpact(event);

        // 3. Decision Evaluation
        Decision decision = decisionService.evaluate(event, impact);

        // 4. Save Event & Decision
        eventRepository.save(event);
        decisionRepository.save(decision);
        rawRecordRepository.save(new RawIngestionRecord(source, rawJson, "SUCCESS", null));

        // 5. Update Vehicle Telemetry Snapshot & Auto-Register new Fleet Assets
        Optional<Vehicle> vOpt = vehicleRepository.findById(event.getVehicleId());
        Vehicle v = vOpt.orElseGet(() -> {
            Vehicle newV = new Vehicle();
            newV.setId(event.getVehicleId());
            String inferredVin = "VIN-" + event.getVehicleId();
            if (event.getRawPayload() != null && event.getRawPayload().contains("\"vin\"")) {
                try {
                    com.fasterxml.jackson.databind.JsonNode n = objectMapper.readTree(event.getRawPayload());
                    if (n.hasNonNull("vin")) inferredVin = n.get("vin").asText();
                } catch (Exception ignored) {}
            }
            newV.setVin(inferredVin);
            newV.setRegistrationNumber("REG-" + event.getVehicleId());

            String inferredMake = "Connected Vehicle";
            if (event.getRawPayload() != null) {
                try {
                    com.fasterxml.jackson.databind.JsonNode n = objectMapper.readTree(event.getRawPayload());
                    if (n.hasNonNull("oem")) inferredMake = n.get("oem").asText();
                    else if (n.hasNonNull("make")) inferredMake = n.get("make").asText();
                } catch (Exception ignored) {}
            }
            if ("Connected Vehicle".equals(inferredMake) && event.getSource() != null) {
                inferredMake = event.getSource().replace("SIMULATED_", "").replace("_IMPORT", "").replace("WEBHOOK_", "");
            }
            newV.setMake(inferredMake);
            newV.setModel("Fleet Vehicle");
            newV.setYear(2024);
            newV.setFuelType("Multi-OEM");
            newV.setVehicleType("Fleet Unit");
            newV.setStatus("ACTIVE");
            newV.setBatteryHealthPct(event.getBatteryHealthPct() != null ? event.getBatteryHealthPct().doubleValue() : 95.0);
            newV.setOilLifePct(event.getOilLifePct() != null ? event.getOilLifePct().doubleValue() : 80.0);
            newV.setTirePressurePsi(event.getTirePressurePsi() != null ? event.getTirePressurePsi().doubleValue() : 33.0);
            newV.setMileageKm(event.getOdometerKm() != null ? event.getOdometerKm().longValue() : 0L);
            newV.setCreatedAt(Instant.now());
            return newV;
        });

        String make = v.getMake() != null ? v.getMake() : "Multi-OEM";
        if (event.getOilLifePct() != null) v.setOilLifePct(event.getOilLifePct().doubleValue());
        if (event.getBatteryHealthPct() != null) v.setBatteryHealthPct(event.getBatteryHealthPct().doubleValue());
        if (event.getTirePressurePsi() != null) v.setTirePressurePsi(event.getTirePressurePsi().doubleValue());
        if (event.getOdometerKm() != null) {
            long currentMileage = v.getMileageKm() != null ? v.getMileageKm().longValue() : 0L;
            if (event.getOdometerKm().longValue() > currentMileage) {
                v.setMileageKm(event.getOdometerKm().longValue());
            }
        }
        if ("CRITICAL".equalsIgnoreCase(event.getSeverity())) {
            v.setStatus("MAINTENANCE");
        }
        v.setUpdatedAt(Instant.now());
        vehicleRepository.save(v);

        // 6. Create Action Item if actionable
        ActionItem action = actionService.createActionFromDecision(decision, event.getSeverity());

        // 7. Publish to Real-Time SSE Stream with correlation and entity envelopes
        DashboardEventDto sseEvent = new DashboardEventDto(
                event.getEventId(),
                correlationId,
                event.getVehicleId(),
                event.getEventType(),
                event.getTimestamp().toString(),
                event.getVehicleId(),
                make,
                event.getSeverity(),
                event.getSource(),
                decision.getRecommendedAction(),
                decision.getEstimatedCostImpact(),
                action != null ? action.getStatus() : "RECORDED",
                event
        );
        eventPublisher.publishEvent(sseEvent);

        return new IngestionResponse(
                event.getEventId(),
                correlationId,
                event.getVehicleId(),
                event.getEventType(),
                event.getSeverity(),
                "PROCESSED",
                "NORMALIZED",
                "PROCESSED",
                action != null ? action.getActionId() : null,
                decision.getPriority(),
                decision.getDecisionSource(),
                "Telemetry event ingested and processed successfully",
                null
        );
    }

    // Accessors for data quality
    public long getTotalReceived() { return totalReceived; }
    public long getSuccessfullyNormalized() { return successfullyNormalized; }
    public long getNormalizationFailed() { return normalizationFailed; }
    public long getInvalidPayloads() { return invalidPayloads; }
    public long getDuplicateEvents() { return duplicateEvents; }
    public long getUnsupportedSources() { return unsupportedSources; }
    public long getProcessingFailed() { return processingFailed; }
}
