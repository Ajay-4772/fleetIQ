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

        // 5. Update Vehicle Telemetry Snapshot
        Optional<Vehicle> vOpt = vehicleRepository.findById(event.getVehicleId());
        String make = "Unknown";
        if (vOpt.isPresent()) {
            Vehicle v = vOpt.get();
            make = v.getMake();
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
        }

        // 6. Create Action Item if actionable
        ActionItem action = actionService.createActionFromDecision(decision, event.getSeverity());

        // 7. Publish to Real-Time SSE Stream
        DashboardEventDto sseEvent = new DashboardEventDto(
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
                event.getVehicleId(),
                event.getEventType(),
                event.getSeverity(),
                "PROCESSED",
                action != null ? action.getActionId() : null,
                decision.getPriority(),
                decision.getDecisionSource(),
                "Telemetry event ingested and processed successfully"
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
