package com.fleetiq.controller;

import com.fleetiq.repository.DataSourceRepository;
import com.fleetiq.repository.UserRepository;
import com.fleetiq.service.EventProcessingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping({"/api/v1/system", "/api/system"})
public class SystemStatusController {

    private final UserRepository userRepository;
    private final DataSourceRepository dataSourceRepository;
    private final EventProcessingService eventProcessingService;

    public SystemStatusController(UserRepository userRepository,
                                  DataSourceRepository dataSourceRepository,
                                  EventProcessingService eventProcessingService) {
        this.userRepository = userRepository;
        this.dataSourceRepository = dataSourceRepository;
        this.eventProcessingService = eventProcessingService;
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getSystemStatus() {
        boolean dbHealthy;
        try {
            userRepository.count();
            dbHealthy = true;
        } catch (Exception e) {
            dbHealthy = false;
        }

        Map<String, Object> services = new LinkedHashMap<>();
        services.put("backend", Map.of("status", "HEALTHY", "service", "vehyron-backend", "version", "1.0.0"));
        services.put("database", Map.of("status", dbHealthy ? "HEALTHY" : "DOWN", "type", "PostgreSQL/H2"));
        services.put("ingestion", Map.of(
                "status", "HEALTHY",
                "activeSources", dataSourceRepository.countByStatus("CONNECTED"),
                "totalReceived", eventProcessingService.getTotalReceived()
        ));
        services.put("processor", Map.of(
                "status", "HEALTHY",
                "normalized", eventProcessingService.getSuccessfullyNormalized()
        ));
        services.put("sseStream", Map.of("status", "CONNECTED", "streamPath", "/api/v1/stream/dashboard"));
        services.put("aiEngine", Map.of("status", "HEALTHY", "provider", "Hybrid Rules + Grounded RAG"));

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("platform", "VEHYRON Connected Vehicle Intelligence Platform");
        response.put("overallStatus", dbHealthy ? "HEALTHY" : "DEGRADED");
        response.put("timestamp", Instant.now().toString());
        response.put("services", services);

        return ResponseEntity.ok(response);
    }
}
