package com.fleetiq.controller;

import com.fleetiq.dto.FleetQueryRequest;
import com.fleetiq.dto.FleetQueryResponse;
import com.fleetiq.service.query.FleetQueryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/fleet")
public class FleetQueryController {

    private final FleetQueryService fleetQueryService;

    public FleetQueryController(FleetQueryService fleetQueryService) {
        this.fleetQueryService = fleetQueryService;
    }

    @PostMapping("/query")
    public ResponseEntity<FleetQueryResponse> executeQuery(@RequestBody FleetQueryRequest request) {
        FleetQueryResponse response = fleetQueryService.executeQuery(request);
        return ResponseEntity.ok(response);
    }
}
