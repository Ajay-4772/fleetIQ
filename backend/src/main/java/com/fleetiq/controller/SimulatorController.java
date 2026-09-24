package com.fleetiq.controller;

import com.fleetiq.dto.LoadTestResponse;
import com.fleetiq.dto.SimulatorScenarioRequest;
import com.fleetiq.dto.SimulatorScenarioResponse;
import com.fleetiq.service.simulator.FleetSimulatorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/simulator")
public class SimulatorController {

    private final FleetSimulatorService simulatorService;

    public SimulatorController(FleetSimulatorService simulatorService) {
        this.simulatorService = simulatorService;
    }

    @PostMapping("/generate")
    public ResponseEntity<SimulatorScenarioResponse> generateTelemetry(
            @RequestBody(required = false) SimulatorScenarioRequest request) {
        String scenario = request != null && request.getScenarioName() != null ? request.getScenarioName() : "mixed_fleet";
        SimulatorScenarioResponse response = simulatorService.runScenario(scenario, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/scenario/{name}")
    public ResponseEntity<SimulatorScenarioResponse> triggerScenario(
            @PathVariable String name,
            @RequestBody(required = false) SimulatorScenarioRequest customConfig) {
        SimulatorScenarioResponse response = simulatorService.runScenario(name, customConfig);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/load-test")
    public ResponseEntity<LoadTestResponse> runLoadTest(
            @RequestParam(defaultValue = "100") int level,
            @RequestParam(required = false) Long seed) {
        LoadTestResponse response = simulatorService.runLoadTest(level, seed);
        return ResponseEntity.ok(response);
    }
}
