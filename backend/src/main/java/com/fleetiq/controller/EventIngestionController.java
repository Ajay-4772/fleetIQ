package com.fleetiq.controller;

import com.fleetiq.dto.IngestionRequest;
import com.fleetiq.dto.IngestionResponse;
import com.fleetiq.service.EventProcessingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
public class EventIngestionController {

    private final EventProcessingService eventProcessingService;

    public EventIngestionController(EventProcessingService eventProcessingService) {
        this.eventProcessingService = eventProcessingService;
    }

    @PostMapping("/ingest")
    public ResponseEntity<IngestionResponse> ingestEvent(@RequestBody IngestionRequest request) {
        if (request == null || request.getSource() == null || request.getPayload() == null) {
            return ResponseEntity.badRequest().body(
                    new IngestionResponse(null, null, null, null, "FAILED", null, null, null, "Source and payload are required")
            );
        }

        try {
            IngestionResponse response = eventProcessingService.processEvent(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    new IngestionResponse(null, null, null, null, "FAILED", null, null, null, e.getMessage())
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new IngestionResponse(null, null, null, null, "FAILED", null, null, null, "Processing error: " + e.getMessage())
            );
        }
    }
}
