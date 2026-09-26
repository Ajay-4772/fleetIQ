package com.fleetiq.controller;

import com.fleetiq.dto.*;
import com.fleetiq.model.CanonicalVehicleEvent;
import com.fleetiq.repository.CanonicalVehicleEventRepository;
import com.fleetiq.service.dashboard.DashboardAggregationService;
import com.fleetiq.service.sse.SseEmitterService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/dashboard", "/api/dashboard"})
public class DashboardController {

    private final DashboardAggregationService dashboardAggregationService;
    private final CanonicalVehicleEventRepository eventRepository;
    private final SseEmitterService sseEmitterService;

    public DashboardController(DashboardAggregationService dashboardAggregationService,
                               CanonicalVehicleEventRepository eventRepository,
                               SseEmitterService sseEmitterService) {
        this.dashboardAggregationService = dashboardAggregationService;
        this.eventRepository = eventRepository;
        this.sseEmitterService = sseEmitterService;
    }

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryDto> getSummary() {
        return ResponseEntity.ok(dashboardAggregationService.getSummary());
    }

    @GetMapping("/health")
    public ResponseEntity<FleetHealthDto> getHealth() {
        return ResponseEntity.ok(dashboardAggregationService.getHealth());
    }

    @GetMapping("/events")
    public ResponseEntity<Page<CanonicalVehicleEvent>> getEvents(
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) String eventType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Page<CanonicalVehicleEvent> events = eventRepository.filterEvents(severity, eventType, PageRequest.of(page, size));
        return ResponseEntity.ok(events);
    }

    @GetMapping("/trends")
    public ResponseEntity<List<TrendDataPointDto>> getTrends(@RequestParam(defaultValue = "24H") String range) {
        return ResponseEntity.ok(dashboardAggregationService.getTrends(range));
    }

    @GetMapping("/ingestion-throughput")
    public ResponseEntity<IngestionThroughputDto> getIngestionThroughput() {
        return ResponseEntity.ok(dashboardAggregationService.getIngestionThroughput());
    }

    @GetMapping("/issue-distribution")
    public ResponseEntity<IssueDistributionDto> getIssueDistribution() {
        return ResponseEntity.ok(dashboardAggregationService.getIssueDistribution());
    }

    @GetMapping("/weekly-utilization")
    public ResponseEntity<WeeklyUtilizationDto> getWeeklyUtilization() {
        return ResponseEntity.ok(dashboardAggregationService.getWeeklyUtilization());
    }

    @GetMapping("/safety-score")
    public ResponseEntity<SafetyScoreDto> getSafetyScore() {
        return ResponseEntity.ok(dashboardAggregationService.getSafetyScore());
    }

    @GetMapping("/stream-status")
    public ResponseEntity<StreamStatusDto> getStreamStatus() {
        return ResponseEntity.ok(dashboardAggregationService.getStreamStatus());
    }

    @GetMapping("/data-quality")
    public ResponseEntity<DataQualityDto> getDataQuality() {
        return ResponseEntity.ok(dashboardAggregationService.getDataQuality());
    }

    @GetMapping("/decision-metrics")
    public ResponseEntity<DecisionMetricsDto> getDecisionMetrics() {
        return ResponseEntity.ok(dashboardAggregationService.getDecisionMetrics());
    }

    @GetMapping("/impact")
    public ResponseEntity<ImpactMetricsDto> getImpact() {
        return ResponseEntity.ok(dashboardAggregationService.getImpactMetrics());
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribeStream() {
        return sseEmitterService.createEmitter();
    }
}
