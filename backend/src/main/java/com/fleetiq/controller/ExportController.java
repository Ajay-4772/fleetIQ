package com.fleetiq.controller;

import com.fleetiq.model.ActionItem;
import com.fleetiq.model.CanonicalVehicleEvent;
import com.fleetiq.model.Vehicle;
import com.fleetiq.repository.ActionItemRepository;
import com.fleetiq.repository.CanonicalVehicleEventRepository;
import com.fleetiq.repository.VehicleRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping({"/api/v1/export", "/api/export"})
public class ExportController {

    private final VehicleRepository vehicleRepository;
    private final ActionItemRepository actionRepository;
    private final CanonicalVehicleEventRepository eventRepository;

    public ExportController(VehicleRepository vehicleRepository,
                            ActionItemRepository actionRepository,
                            CanonicalVehicleEventRepository eventRepository) {
        this.vehicleRepository = vehicleRepository;
        this.actionRepository = actionRepository;
        this.eventRepository = eventRepository;
    }

    @GetMapping("/vehicles")
    public ResponseEntity<byte[]> exportVehicles(@RequestParam(defaultValue = "csv") String format) {
        List<Vehicle> vehicles = vehicleRepository.findAll();

        if ("json".equalsIgnoreCase(format)) {
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"fleetiq-vehicles-" + Instant.now().toEpochMilli() + ".json\"")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(vehicles.toString().getBytes(StandardCharsets.UTF_8));
        }

        StringBuilder csv = new StringBuilder();
        csv.append("vehicleId,vin,registration,make,model,year,fuelType,status,mileageKm,batteryHealthPct,oilLifePct,tirePressurePsi\n");
        for (Vehicle v : vehicles) {
            csv.append(String.format("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",%d,\"%s\",\"%s\",%d,%.1f,%.1f,%.1f\n",
                    escape(v.getId()),
                    escape(v.getVin()),
                    escape(v.getRegistrationNumber()),
                    escape(v.getMake()),
                    escape(v.getModel()),
                    v.getYear() != null ? v.getYear() : 0,
                    escape(v.getFuelType()),
                    escape(v.getStatus()),
                    v.getMileageKm() != null ? v.getMileageKm() : 0,
                    v.getBatteryHealthPct() != null ? v.getBatteryHealthPct() : 0.0,
                    v.getOilLifePct() != null ? v.getOilLifePct() : 0.0,
                    v.getTirePressurePsi() != null ? v.getTirePressurePsi() : 0.0
            ));
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"fleetiq-vehicles-" + Instant.now().toEpochMilli() + ".csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csv.toString().getBytes(StandardCharsets.UTF_8));
    }

    @GetMapping("/actions")
    public ResponseEntity<byte[]> exportActions(@RequestParam(defaultValue = "csv") String format) {
        List<ActionItem> actions = actionRepository.findAll();

        StringBuilder csv = new StringBuilder();
        csv.append("actionId,vehicleId,priority,severity,status,issue,recommendedAction,estimatedImpact,confidence,requiresHumanReview,createdAt\n");
        for (ActionItem a : actions) {
            csv.append(String.format("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",%.2f,%.2f,%b,\"%s\"\n",
                    escape(a.getActionId()),
                    escape(a.getVehicleId()),
                    escape(a.getPriority()),
                    escape(a.getSeverity()),
                    escape(a.getStatus()),
                    escape(a.getIssue()),
                    escape(a.getRecommendedAction()),
                    a.getEstimatedImpact() != null ? a.getEstimatedImpact() : 0.0,
                    a.getConfidence() != null ? a.getConfidence() : 0.0,
                    Boolean.TRUE.equals(a.getRequiresHumanReview()),
                    a.getCreatedAt() != null ? a.getCreatedAt().toString() : ""
            ));
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"fleetiq-actions-" + Instant.now().toEpochMilli() + ".csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csv.toString().getBytes(StandardCharsets.UTF_8));
    }

    @GetMapping("/events")
    public ResponseEntity<byte[]> exportEvents(@RequestParam(defaultValue = "csv") String format) {
        List<CanonicalVehicleEvent> events = eventRepository.findAll();

        StringBuilder csv = new StringBuilder();
        csv.append("eventId,vehicleId,source,eventType,severity,faultCode,odometerKm,batteryHealthPct,oilLifePct,timestamp\n");
        for (CanonicalVehicleEvent e : events) {
            csv.append(String.format("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",%s,%s,%s,\"%s\"\n",
                    escape(e.getEventId()),
                    escape(e.getVehicleId()),
                    escape(e.getSource()),
                    escape(e.getEventType()),
                    escape(e.getSeverity()),
                    escape(e.getFaultCode()),
                    e.getOdometerKm() != null ? e.getOdometerKm().toString() : "",
                    e.getBatteryHealthPct() != null ? e.getBatteryHealthPct().toString() : "",
                    e.getOilLifePct() != null ? e.getOilLifePct().toString() : "",
                    e.getTimestamp() != null ? e.getTimestamp().toString() : ""
            ));
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"fleetiq-events-" + Instant.now().toEpochMilli() + ".csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csv.toString().getBytes(StandardCharsets.UTF_8));
    }

    private String escape(String val) {
        if (val == null) return "";
        return val.replace("\"", "\"\"");
    }
}
