package com.fleetiq.service.simulator;

import com.fleetiq.dto.IngestionRequest;
import com.fleetiq.dto.LoadTestResponse;
import com.fleetiq.dto.SimulatorScenarioRequest;
import com.fleetiq.dto.SimulatorScenarioResponse;
import com.fleetiq.model.Vehicle;
import com.fleetiq.repository.VehicleRepository;
import com.fleetiq.service.EventProcessingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service
public class FleetSimulatorService {

    private static final Logger log = LoggerFactory.getLogger(FleetSimulatorService.class);

    private final EventProcessingService eventProcessingService;
    private final VehicleRepository vehicleRepository;

    @Value("${fleetiq.simulator.default-seed:20260925}")
    private long defaultSeed;

    public FleetSimulatorService(EventProcessingService eventProcessingService, VehicleRepository vehicleRepository) {
        this.eventProcessingService = eventProcessingService;
        this.vehicleRepository = vehicleRepository;
    }

    public SimulatorScenarioResponse runScenario(String scenarioName, SimulatorScenarioRequest customConfig) {
        long startTime = System.currentTimeMillis();
        long seed = (customConfig != null && customConfig.getSeed() != null) ? customConfig.getSeed().longValue() : defaultSeed;
        Random rng = new Random(seed);

        int count = 50;
        double faultRate = 0.20;
        double maintenanceRate = 0.20;
        double idleRate = 0.20;
        double lowUtilRate = 0.10;

        String name = (scenarioName != null ? scenarioName : "mixed_fleet").toLowerCase();

        switch (name) {
            case "healthy_fleet":
                count = 40;
                faultRate = 0.02;
                maintenanceRate = 0.05;
                idleRate = 0.05;
                lowUtilRate = 0.02;
                break;
            case "maintenance_spike":
                count = 50;
                faultRate = 0.05;
                maintenanceRate = 0.65;
                idleRate = 0.10;
                lowUtilRate = 0.05;
                break;
            case "critical_faults":
                count = 50;
                faultRate = 0.70;
                maintenanceRate = 0.10;
                idleRate = 0.05;
                lowUtilRate = 0.05;
                break;
            case "excessive_idle":
                count = 50;
                faultRate = 0.05;
                maintenanceRate = 0.10;
                idleRate = 0.80;
                lowUtilRate = 0.10;
                break;
            case "mixed_fleet":
            default:
                count = 60;
                faultRate = 0.25;
                maintenanceRate = 0.25;
                idleRate = 0.20;
                lowUtilRate = 0.15;
                break;
        }

        if (customConfig != null) {
            if (customConfig.getEventCount() != null && customConfig.getEventCount() > 0) count = customConfig.getEventCount().intValue();
            if (customConfig.getFaultRate() != null) faultRate = customConfig.getFaultRate().doubleValue();
            if (customConfig.getMaintenanceRate() != null) maintenanceRate = customConfig.getMaintenanceRate().doubleValue();
            if (customConfig.getIdleRate() != null) idleRate = customConfig.getIdleRate().doubleValue();
            if (customConfig.getLowUtilizationRate() != null) lowUtilRate = customConfig.getLowUtilizationRate().doubleValue();
        }

        List<Vehicle> vehicles = vehicleRepository.findAll();
        if (vehicles.isEmpty()) {
            return new SimulatorScenarioResponse(name, 0, 0, 0, 0, 0, 0, "No vehicles found in database to simulate");
        }

        int normalized = 0;
        int failed = 0;
        int decisionsCreated = 0;
        int actionsCreated = 0;

        for (int i = 0; i < count; i++) {
            Vehicle v = vehicles.get(i % vehicles.size());
            IngestionRequest req = buildSimulatedPayload(v, rng, faultRate, maintenanceRate, idleRate, lowUtilRate, i);

            try {
                var resp = eventProcessingService.processEvent(req);
                normalized++;
                decisionsCreated++;
                if (resp.getActionId() != null) {
                    actionsCreated++;
                }
            } catch (Exception e) {
                failed++;
                log.warn("Simulator event ingestion failed: {}", e.getMessage());
            }
        }

        long duration = System.currentTimeMillis() - startTime;
        return new SimulatorScenarioResponse(
                name,
                count,
                normalized,
                failed,
                decisionsCreated,
                actionsCreated,
                duration,
                "Executed scenario " + name + " successfully in " + duration + "ms with seed " + seed
        );
    }

    public LoadTestResponse runLoadTest(int level, Long customSeed) {
        long startTime = System.currentTimeMillis();
        long seed = customSeed != null ? customSeed.longValue() : defaultSeed;
        Random rng = new Random(seed);

        int targetEvents = level <= 0 ? 100 : level;
        List<Vehicle> vehicles = vehicleRepository.findAll();
        if (vehicles.isEmpty()) {
            return new LoadTestResponse(level, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        }

        List<Long> latencies = new ArrayList<>();
        int normalized = 0;
        int failed = 0;
        int actions = 0;

        for (int i = 0; i < targetEvents; i++) {
            Vehicle v = vehicles.get(i % vehicles.size());
            IngestionRequest req = buildSimulatedPayload(v, rng, 0.20, 0.20, 0.20, 0.10, i);

            long eventStart = System.nanoTime();
            try {
                var resp = eventProcessingService.processEvent(req);
                normalized++;
                if (resp.getActionId() != null) actions++;
            } catch (Exception e) {
                failed++;
            }
            long eventEnd = System.nanoTime();
            latencies.add((eventEnd - eventStart) / 1_000_000L); // ms
        }

        long totalTime = System.currentTimeMillis() - startTime;
        Collections.sort(latencies);

        double avgLatency = latencies.stream().mapToLong(Long::longValue).average().orElse(0.0);
        int p95Index = (int) (latencies.size() * 0.95);
        int p99Index = (int) (latencies.size() * 0.99);
        double p95 = latencies.isEmpty() ? 0 : latencies.get(Math.min(p95Index, latencies.size() - 1));
        double p99 = latencies.isEmpty() ? 0 : latencies.get(Math.min(p99Index, latencies.size() - 1));

        return new LoadTestResponse(
                targetEvents,
                targetEvents,
                normalized,
                failed,
                totalTime,
                Math.round(avgLatency * 100.0) / 100.0,
                p95,
                p99,
                normalized,
                0,
                actions
        );
    }

    private IngestionRequest buildSimulatedPayload(Vehicle v, Random rng, double faultRate,
                                                   double maintRate, double idleRate, double lowUtilRate, int step) {
        String make = v.getMake().toUpperCase();
        Map<String, Object> payload = new HashMap<>();
        String source;

        // Determine anomalies based on rates
        boolean hasFault = rng.nextDouble() < faultRate;
        boolean hasMaint = rng.nextDouble() < maintRate;
        boolean hasIdle = rng.nextDouble() < idleRate;
        boolean hasLowUtil = rng.nextDouble() < lowUtilRate;

        String faultCode = null;
        if (hasFault) {
            String[] faults = {"P0300", "P0301", "P0420", "P0562", "C0035", "U0100"};
            faultCode = faults[rng.nextInt(faults.length)];
        } else if (hasMaint) {
            faultCode = "OIL_DUE";
        }

        int idleMinutes = hasIdle ? (60 + rng.nextInt(60)) : (2 + rng.nextInt(15));
        double oilLife = hasMaint ? (2.0 + rng.nextInt(6)) : (35.0 + rng.nextInt(60));
        double battery = (faultCode != null && faultCode.equals("P0562")) ? (58.0 + rng.nextInt(8)) : (85.0 + rng.nextInt(14));
        long odometer = (v.getMileageKm() != null ? v.getMileageKm().longValue() : 40000L) + (step * 5L);
        String timestamp = Instant.now().minusSeconds((long) step * 30).toString();

        switch (make) {
            case "TOYOTA":
                source = "SIMULATED_TOYOTA";
                payload.put("vehicle_id", v.getId());
                payload.put("oil_life", oilLife);
                payload.put("fault", faultCode);
                payload.put("idle_minutes", idleMinutes);
                payload.put("battery_pct", battery);
                payload.put("odometer", odometer);
                payload.put("timestamp", timestamp);
                break;

            case "FORD":
                source = "SIMULATED_FORD";
                payload.put("vehicleIdentifier", v.getId());
                payload.put("oilLifePercentage", oilLife);
                payload.put("diagnosticCode", faultCode);
                payload.put("idleDuration", idleMinutes);
                payload.put("batteryState", battery);
                payload.put("mileage", odometer);
                payload.put("timestamp", timestamp);
                break;

            case "BMW":
                source = "SIMULATED_BMW";
                payload.put("vehicleIdentifier", v.getId());
                payload.put("oil_life_remaining", oilLife);
                payload.put("dtc", faultCode);
                payload.put("idlingTimeMinutes", idleMinutes);
                payload.put("batteryHealth", battery);
                payload.put("totalDistanceKm", odometer);
                payload.put("timestamp", timestamp);
                break;

            case "TESLA":
            default:
                source = "SIMULATED_TESLA";
                payload.put("vin_id", v.getId());
                payload.put("state_of_charge", battery);
                payload.put("alert_code", hasFault ? "BMS_028" : null);
                payload.put("idle_mins", idleMinutes);
                payload.put("odometer", odometer);
                payload.put("timestamp", timestamp);
                break;
        }

        return new IngestionRequest(source, payload);
    }
}
