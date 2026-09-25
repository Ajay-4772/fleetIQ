package com.fleetiq.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fleetiq.model.User;
import com.fleetiq.model.Vehicle;
import com.fleetiq.repository.UserRepository;
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
    private final UserRepository userRepository;
    private final FleetSimulatorService simulatorService;
    private final ObjectMapper objectMapper;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @org.springframework.beans.factory.annotation.Value("${vehyron.seed.enabled:${fleetiq.seed.enabled:false}}")
    private boolean seedEnabled;

    public DataInitializer(VehicleRepository vehicleRepository,
                           UserRepository userRepository,
                           FleetSimulatorService simulatorService,
                           ObjectMapper objectMapper,
                           org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        this.vehicleRepository = vehicleRepository;
        this.userRepository = userRepository;
        this.simulatorService = simulatorService;
        this.objectMapper = objectMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Seed initial platform governance accounts if empty
        if (userRepository.count() == 0) {
            log.info("Users table is empty. Initializing VEHYRON dual-role baseline accounts...");
            User admin = new com.fleetiq.model.User(
                    "admin",
                    passwordEncoder.encode("Admin@Vehyron2026"),
                    "VEHYRON Administrator",
                    "admin@vehyron.internal",
                    com.fleetiq.model.Role.ROLE_ADMIN,
                    "VEHYRON Platform Operations"
            );
            admin.setEmailVerified(true);
            userRepository.save(admin);

            User operator = new com.fleetiq.model.User(
                    "operator",
                    passwordEncoder.encode("Operator@Vehyron2026"),
                    "Fleet Operations Controller",
                    "operator@vehyron.internal",
                    com.fleetiq.model.Role.ROLE_OPERATOR,
                    "VEHYRON Connected Dispatch"
            );
            operator.setEmailVerified(true);
            userRepository.save(operator);

            log.info("Initialized 2 core role accounts: admin (ROLE_ADMIN) and operator (ROLE_OPERATOR).");
        }

        // Vehicle Data: Only seed if explicitly enabled via vehyron.seed.enabled=true (isolated dev/test profile)
        if (seedEnabled && vehicleRepository.count() == 0) {
            log.info("Synthetic seed profile enabled. Initializing vehicle fleet from seed-vehicles.json for local evaluation...");
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
                        log.info("Successfully seeded {} vehicles into database for local evaluation.", vehicleRepository.count());
                    }
                }
            } catch (Exception e) {
                log.error("Failed to seed initial vehicles: {}", e.getMessage(), e);
            }
        } else {
            log.info("VEHYRON production zero-static-data mode active: Database contains {} live vehicles.", vehicleRepository.count());
        }
    }
}
