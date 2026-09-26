package com.fleetiq.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fleetiq.model.Role;
import com.fleetiq.model.User;
import com.fleetiq.model.UserAuditLog;
import com.fleetiq.model.Vehicle;
import com.fleetiq.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final UserAuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;
    private final PasswordEncoder passwordEncoder;
    private final Environment environment;

    @Value("${vehyron.seed.enabled:false}")
    private boolean seedEnabled;

    @Value("${vehyron.bootstrap.admin-password:${BOOTSTRAP_ADMIN_PASSWORD:}}")
    private String configuredBootstrapPassword;

    public DataInitializer(VehicleRepository vehicleRepository,
                           UserRepository userRepository,
                           RefreshTokenRepository refreshTokenRepository,
                           PasswordResetTokenRepository passwordResetTokenRepository,
                           UserAuditLogRepository auditLogRepository,
                           ObjectMapper objectMapper,
                           PasswordEncoder passwordEncoder,
                           Environment environment) {
        this.vehicleRepository = vehicleRepository;
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.auditLogRepository = auditLogRepository;
        this.objectMapper = objectMapper;
        this.passwordEncoder = passwordEncoder;
        this.environment = environment;
    }

    @Override
    @Transactional
    public void run(String... args) {
        boolean isDev = isDevelopmentEnvironment();

        if (isDev) {
            resetAuthDevIfNecessary();
        } else {
            ensureAdminExists();
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

    public boolean isDevelopmentEnvironment() {
        String[] profiles = environment.getActiveProfiles();
        if (profiles == null || profiles.length == 0) {
            String defaultProfile = environment.getProperty("spring.profiles.default", "dev");
            return "dev".equalsIgnoreCase(defaultProfile) || "test".equalsIgnoreCase(defaultProfile);
        }
        for (String p : profiles) {
            if ("prod".equalsIgnoreCase(p) || "production".equalsIgnoreCase(p) || "staging".equalsIgnoreCase(p)) {
                return false;
            }
        }
        for (String p : profiles) {
            if ("dev".equalsIgnoreCase(p) || "development".equalsIgnoreCase(p) || "test".equalsIgnoreCase(p) || "local".equalsIgnoreCase(p)) {
                return true;
            }
        }
        return true;
    }

    public void resetAuthDevIfNecessary() {
        boolean ajayExists = userRepository.findByUsername("Ajay").isPresent() ||
                             userRepository.findByEmail("ajayalpha4772@vehryon.com").isPresent();

        List<String> legacyUsernames = List.of("admin", "operator", "viewer", "ops_lead");
        boolean hasLegacy = legacyUsernames.stream().anyMatch(u -> userRepository.findByUsername(u).isPresent());

        if (hasLegacy || !ajayExists) {
            log.info("Executing controlled development authentication reset...");

            // 1. Clear tokens
            try {
                refreshTokenRepository.deleteAll();
                passwordResetTokenRepository.deleteAll();
            } catch (Exception e) {
                log.warn("Token wipe encountered non-critical error: {}", e.getMessage());
            }

            // 2. Clear old demo accounts
            for (String legacy : legacyUsernames) {
                userRepository.findByUsername(legacy).ifPresent(userRepository::delete);
            }

            // 3. Create or update root admin Ajay
            String rawPassword = getBootstrapPassword();
            User rootAdmin = userRepository.findByUsername("Ajay")
                    .or(() -> userRepository.findByEmail("ajayalpha4772@vehryon.com"))
                    .orElseGet(User::new);

            rootAdmin.setUsername("Ajay");
            rootAdmin.setPassword(passwordEncoder.encode(rawPassword));
            rootAdmin.setFullName("M Ajay");
            rootAdmin.setEmail("ajayalpha4772@vehryon.com");
            rootAdmin.setOrganization("Vehryon Enterprise");
            rootAdmin.setRole(Role.ROLE_ADMIN);
            rootAdmin.setStatus("ACTIVE");
            rootAdmin.setEnabled(true);
            rootAdmin.setEmailVerified(true);
            rootAdmin.setRequestedRole("ADMIN");
            rootAdmin.setApprovedBy("SYSTEM_BOOTSTRAP");
            rootAdmin.setApprovedAt(Instant.now());
            userRepository.save(rootAdmin);

            auditLogRepository.save(new UserAuditLog(
                    "SYSTEM",
                    "RESET_AUTH_DEV",
                    "Ajay",
                    "Development authentication reset completed. Initial administrator bootstrapped.",
                    "127.0.0.1"
            ));

            log.info("Development authentication reset completed.");
            log.info("Initial administrator: {}", rootAdmin.getEmail());
            log.info("Role: {}", rootAdmin.getRole());
        }
    }

    private void ensureAdminExists() {
        if (userRepository.countByRoleAndEnabled(Role.ROLE_ADMIN, true) == 0) {
            log.warn("No active administrator detected in environment. Bootstrapping initial administrator...");
            String rawPassword = getBootstrapPassword();
            User rootAdmin = new User();
            rootAdmin.setUsername("Ajay");
            rootAdmin.setPassword(passwordEncoder.encode(rawPassword));
            rootAdmin.setFullName("M Ajay");
            rootAdmin.setEmail("ajayalpha4772@vehryon.com");
            rootAdmin.setOrganization("Vehryon Enterprise");
            rootAdmin.setRole(Role.ROLE_ADMIN);
            rootAdmin.setStatus("ACTIVE");
            rootAdmin.setEnabled(true);
            rootAdmin.setEmailVerified(true);
            rootAdmin.setRequestedRole("ADMIN");
            rootAdmin.setApprovedBy("SYSTEM_BOOTSTRAP");
            rootAdmin.setApprovedAt(Instant.now());
            userRepository.save(rootAdmin);

            log.info("Initial administrator bootstrapped: {}", rootAdmin.getEmail());
        }
    }

    public String getBootstrapPassword() {
        if (configuredBootstrapPassword != null && !configuredBootstrapPassword.isBlank()) {
            return configuredBootstrapPassword.trim();
        }
        String envPass = System.getenv("BOOTSTRAP_ADMIN_PASSWORD");
        if (envPass != null && !envPass.isBlank()) {
            return envPass.trim();
        }
        String sysProp = System.getProperty("vehyron.bootstrap.admin-password");
        if (sysProp != null && !sysProp.isBlank()) {
            return sysProp.trim();
        }
        return "VehyronRootAdmin@2026!";
    }
}
