package com.fleetiq.controller;

import com.fleetiq.dto.VehicleProfileDto;
import com.fleetiq.model.Vehicle;
import com.fleetiq.repository.VehicleRepository;
import com.fleetiq.service.dashboard.DashboardAggregationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleRepository vehicleRepository;
    private final DashboardAggregationService dashboardAggregationService;

    public VehicleController(VehicleRepository vehicleRepository,
                             DashboardAggregationService dashboardAggregationService) {
        this.vehicleRepository = vehicleRepository;
        this.dashboardAggregationService = dashboardAggregationService;
    }

    @GetMapping
    public ResponseEntity<List<Vehicle>> getVehicles(@RequestParam(required = false) String status,
                                                     @RequestParam(required = false) String make,
                                                     @RequestParam(required = false) String fuelType) {
        List<Vehicle> list;
        if (status != null && !status.isEmpty()) {
            list = vehicleRepository.findByStatus(status.toUpperCase());
        } else if (make != null && !make.isEmpty()) {
            list = vehicleRepository.findByMakeIgnoreCase(make);
        } else if (fuelType != null && !fuelType.isEmpty()) {
            list = vehicleRepository.findByFuelTypeIgnoreCase(fuelType);
        } else {
            list = vehicleRepository.findAll();
        }
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> getVehicleById(@PathVariable String id) {
        return vehicleRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/profile")
    public ResponseEntity<VehicleProfileDto> getVehicleProfile(@PathVariable String id) {
        try {
            VehicleProfileDto profile = dashboardAggregationService.getVehicleProfile(id);
            return ResponseEntity.ok(profile);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
