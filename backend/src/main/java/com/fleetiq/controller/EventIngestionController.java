package com.fleetiq.controller;

import com.fleetiq.dto.IngestionRequest;
import com.fleetiq.dto.IngestionResponse;
import com.fleetiq.service.EventProcessingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping({"/api/v1/events", "/api/events"})
public class EventIngestionController {

    private final EventProcessingService eventProcessingService;

    public EventIngestionController(EventProcessingService eventProcessingService) {
        this.eventProcessingService = eventProcessingService;
    }

    @PostMapping("/ingest")
    public ResponseEntity<IngestionResponse> ingestEvent(@RequestBody IngestionRequest request) {
        String correlationId = request != null && request.getCorrelationId() != null
                ? request.getCorrelationId()
                : UUID.randomUUID().toString();

        if (request == null || request.getSource() == null || request.getPayload() == null) {
            return ResponseEntity.badRequest().body(
                    IngestionResponse.rejected(
                            request != null ? request.getEventId() : null,
                            correlationId,
                            "Source and payload are required fields for telemetry ingestion"
                    )
            );
        }

        try {
            request.setCorrelationId(correlationId);
            IngestionResponse response = eventProcessingService.processEvent(request);

            if ("DUPLICATE".equals(response.getProcessingStatus())) {
                return ResponseEntity.status(HttpStatus.OK).body(response);
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    IngestionResponse.rejected(request.getEventId(), correlationId, e.getMessage())
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    IngestionResponse.rejected(request.getEventId(), correlationId, "Processing error: " + e.getMessage())
            );
        }
    }
}
