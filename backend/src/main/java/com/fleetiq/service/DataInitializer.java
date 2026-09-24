package com.fleetiq.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fleetiq.model.Vehicle;
import com.fleetiq.repository.VehicleRepository;
import com.fleetiq.service.simulator.FleetSimulatorService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final VehicleRepository vehicleRepository;
    private final FleetSimulatorService simulatorService;
    private final ObjectMapper objectMapper;

    public DataInitializer(VehicleRepository vehicleRepository,
                           FleetSimulatorService simulatorService,
                           ObjectMapper objectMapper) {
        this.vehicleRepository = vehicleRepository;
        this.simulatorService = simulatorService;
        this.objectMapper = objectMapper;
    }

    @Override
    public void run(String... args) {
        if (vehicleRepository.count() == 0) {
            log.info("Vehicle table is empty. Initializing synthetic vehicle fleet from seed-vehicles.json...");
            try {
                ClassPathResource resource = new ClassPathResource("seed-vehicles.json");
                if (resource.exists()) {
                    try (InputStream is = resource.getInputStream()) {
                        List<Map<String, Object>> list = objectMapper.readValue(is, new TypeReference<List<Map<String, Object>>>() {});
                        for (Map<String, Object> map : list) {
                            Vehicle v = new Vehicle();
                            v.setId((String) map.get("vehicleId"));
                            v.setVin((String) map.get("vin"));
                            v.setRegistrationNumber((String) map.get("registrationNumber"));
                            v.setMake((String) map.get("make"));
                            v.setModel((String) map.get("model"));
                            v.setYear((Integer) map.get("year"));
                            v.setFuelType((String) map.get("fuelType"));
                            v.setVehicleType((String) map.get("vehicleType"));
                            v.setMileageKm(map.get("mileageKm") != null ? ((Number) map.get("mileageKm")).longValue() : 50000L);
                            v.setStatus((String) map.get("status"));
                            v.setBatteryHealthPct(map.get("batteryHealthPct") != null ? ((Number) map.get("batteryHealthPct")).doubleValue() : 95.0);
                            v.setOilLifePct(map.get("oilLifePct") != null ? ((Number) map.get("oilLifePct")).doubleValue() : 80.0);
                            v.setTirePressurePsi(map.get("tirePressurePsi") != null ? ((Number) map.get("tirePressurePsi")).doubleValue() : 33.0);
                            v.setAvgMpg(map.get("avgMpg") != null ? ((Number) map.get("avgMpg")).doubleValue() : 28.0);
                            if (map.get("lastServiceDate") != null) {
                                v.setLastServiceDate(LocalDate.parse(map.get("lastServiceDate").toString()));
                            }
                            vehicleRepository.save(v);
                        }
                        log.info("Successfully seeded {} vehicles into database.", vehicleRepository.count());
                    }
                }
            } catch (Exception e) {
                log.error("Failed to seed initial vehicles: {}", e.getMessage(), e);
            }

            // Generate initial mixed fleet scenario
            log.info("Generating baseline demonstration fleet scenario...");
            simulatorService.runScenario("mixed_fleet", null);
            log.info("Baseline demonstration scenario initialized.");
        }
    }
}
