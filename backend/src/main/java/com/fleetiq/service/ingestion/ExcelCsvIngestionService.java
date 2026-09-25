package com.fleetiq.service.ingestion;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fleetiq.dto.IngestionRequest;
import com.fleetiq.dto.IngestionResponse;
import com.fleetiq.model.IngestionJob;
import com.fleetiq.repository.IngestionJobRepository;
import com.fleetiq.service.EventProcessingService;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.apache.poi.ss.usermodel.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;

@Service
public class ExcelCsvIngestionService {

    private static final Logger log = LoggerFactory.getLogger(ExcelCsvIngestionService.class);

    private final EventProcessingService eventProcessingService;
    private final IngestionJobRepository jobRepository;
    private final ObjectMapper objectMapper;

    // Standard Canonical Target Fields
    public static final Set<String> CANONICAL_FIELDS = Set.of(
            "vehicleId",
            "vin",
            "make",
            "model",
            "year",
            "timestamp",
            "batteryHealthPct",
            "oilLifePct",
            "tirePressurePsi",
            "odometerKm",
            "faultCode",
            "eventType",
            "severity",
            "idleMinutes",
            "fuelConsumedLiters",
            "operatingHours"
    );

    public ExcelCsvIngestionService(EventProcessingService eventProcessingService,
                                   IngestionJobRepository jobRepository,
                                   ObjectMapper objectMapper) {
        this.eventProcessingService = eventProcessingService;
        this.jobRepository = jobRepository;
        this.objectMapper = objectMapper;
    }

    /**
     * Inspect file headers, detect candidate column mappings, and return sample preview rows.
     */
    public Map<String, Object> previewFile(MultipartFile file) throws Exception {
        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "dataset.csv";
        boolean isCsv = filename.toLowerCase().endsWith(".csv");

        List<String> headers = new ArrayList<>();
        List<Map<String, String>> sampleRows = new ArrayList<>();

        if (isCsv) {
            try (Reader reader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8);
                 CSVParser parser = CSVFormat.DEFAULT.builder().setHeader().setSkipHeaderRecord(false).build().parse(reader)) {
                headers.addAll(parser.getHeaderNames());
                int count = 0;
                for (CSVRecord record : parser) {
                    if (count++ >= 5) break;
                    Map<String, String> row = new LinkedHashMap<>();
                    for (String h : headers) {
                        row.put(h, record.isMapped(h) ? record.get(h) : "");
                    }
                    sampleRows.add(row);
                }
            }
        } else {
            // Excel (.xlsx or .xls)
            try (InputStream is = file.getInputStream();
                 Workbook workbook = WorkbookFactory.create(is)) {
                Sheet sheet = workbook.getSheetAt(0);
                Row headerRow = sheet.getRow(0);
                if (headerRow != null) {
                    for (Cell cell : headerRow) {
                        headers.add(getCellValueAsString(cell).trim());
                    }
                }
                int count = 0;
                for (int r = 1; r <= sheet.getLastRowNum(); r++) {
                    if (count++ >= 5) break;
                    Row row = sheet.getRow(r);
                    if (row == null) continue;
                    Map<String, String> rowData = new LinkedHashMap<>();
                    for (int c = 0; c < headers.size(); c++) {
                        String h = headers.get(c);
                        Cell cell = row.getCell(c);
                        rowData.put(h, cell != null ? getCellValueAsString(cell) : "");
                    }
                    sampleRows.add(rowData);
                }
            }
        }

        Map<String, String> suggestedMapping = detectColumnMapping(headers);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("fileName", filename);
        result.put("fileType", isCsv ? "CSV" : "EXCEL");
        result.put("headers", headers);
        result.put("suggestedMapping", suggestedMapping);
        result.put("detectedMapping", suggestedMapping);
        result.put("sampleRows", sampleRows);
        result.put("totalRows", sampleRows.size());
        return result;
    }

    /**
     * Process entire file using confirmed or detected column mappings.
     */
    public IngestionJob processFile(MultipartFile file, Map<String, String> columnMapping, String uploadedBy) throws Exception {
        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "dataset.csv";
        boolean isCsv = filename.toLowerCase().endsWith(".csv");
        String sourceType = isCsv ? "CSV_IMPORT" : "EXCEL_IMPORT";

        String jobId = "JOB-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        IngestionJob job = new IngestionJob(jobId, "FILE_UPLOAD", filename, sourceType, "PROCESSING", uploadedBy);
        jobRepository.save(job);

        List<Map<String, String>> records = new ArrayList<>();

        if (isCsv) {
            try (Reader reader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8);
                 CSVParser parser = CSVFormat.DEFAULT.builder().setHeader().setSkipHeaderRecord(true).build().parse(reader)) {
                List<String> headers = parser.getHeaderNames();
                for (CSVRecord record : parser) {
                    Map<String, String> map = new LinkedHashMap<>();
                    for (String h : headers) {
                        if (record.isMapped(h)) {
                            map.put(h, record.get(h));
                        }
                    }
                    records.add(map);
                }
            }
        } else {
            try (InputStream is = file.getInputStream();
                 Workbook workbook = WorkbookFactory.create(is)) {
                Sheet sheet = workbook.getSheetAt(0);
                Row headerRow = sheet.getRow(0);
                List<String> headers = new ArrayList<>();
                if (headerRow != null) {
                    for (Cell cell : headerRow) {
                        headers.add(getCellValueAsString(cell).trim());
                    }
                }
                for (int r = 1; r <= sheet.getLastRowNum(); r++) {
                    Row row = sheet.getRow(r);
                    if (row == null) continue;
                    Map<String, String> rowData = new LinkedHashMap<>();
                    for (int c = 0; c < headers.size(); c++) {
                        String h = headers.get(c);
                        Cell cell = row.getCell(c);
                        rowData.put(h, cell != null ? getCellValueAsString(cell) : "");
                    }
                    records.add(rowData);
                }
            }
        }

        job.setTotalRecords(records.size());
        int processed = 0;
        int rejected = 0;
        int warnings = 0;

        // If no user mapping was supplied, detect automatically
        Map<String, String> finalMapping = (columnMapping != null && !columnMapping.isEmpty())
                ? columnMapping
                : detectColumnMapping(records.isEmpty() ? List.of() : new ArrayList<>(records.get(0).keySet()));

        for (Map<String, String> rawRecord : records) {
            try {
                Map<String, Object> canonicalPayload = new LinkedHashMap<>();
                for (Map.Entry<String, String> entry : rawRecord.entrySet()) {
                    String rawHeader = entry.getKey();
                    String rawVal = entry.getValue();
                    String canonicalKey = finalMapping.get(rawHeader);
                    if (canonicalKey != null && !canonicalKey.isBlank() && rawVal != null && !rawVal.isBlank()) {
                        canonicalPayload.put(canonicalKey, parseValue(canonicalKey, rawVal));
                    }
                }

                // Validation: Must contain vehicleId
                String vehicleId = (String) canonicalPayload.get("vehicleId");
                if (vehicleId == null || vehicleId.isBlank()) {
                    rejected++;
                    continue;
                }

                // Fill defaults if missing
                if (!canonicalPayload.containsKey("timestamp")) {
                    canonicalPayload.put("timestamp", Instant.now().toString());
                }
                if (!canonicalPayload.containsKey("eventType")) {
                    canonicalPayload.put("eventType", deriveEventType(canonicalPayload));
                }
                if (!canonicalPayload.containsKey("severity")) {
                    canonicalPayload.put("severity", deriveSeverity(canonicalPayload));
                }

                // Ingest through EventProcessingService
                String eventId = "EVT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                IngestionRequest req = new IngestionRequest(sourceType, canonicalPayload);
                req.setEventId(eventId);
                req.setVehicleId(vehicleId);
                req.setTimestamp(canonicalPayload.get("timestamp").toString());

                IngestionResponse res = eventProcessingService.processEvent(req);
                if ("DUPLICATE".equalsIgnoreCase(res.getStatus()) || "REJECTED".equalsIgnoreCase(res.getStatus())) {
                    warnings++;
                } else {
                    processed++;
                }
            } catch (Exception e) {
                log.warn("Record ingestion rejection: {}", e.getMessage());
                rejected++;
            }
        }

        job.setProcessedRecords(processed);
        job.setRejectedRecords(rejected);
        job.setWarningRecords(warnings);
        job.setCompletedAt(Instant.now());
        job.setStatus(rejected == records.size() && records.size() > 0 ? "FAILED" : (rejected > 0 ? "PARTIALLY_COMPLETED" : "COMPLETED"));
        jobRepository.save(job);

        return job;
    }

    /**
     * Intelligently maps incoming diverse header names to canonical schema targets.
     */
    public Map<String, String> detectColumnMapping(List<String> headers) {
        Map<String, String> mapping = new LinkedHashMap<>();
        for (String h : headers) {
            String norm = h.toLowerCase().replaceAll("[^a-z0-9]", "");

            if (norm.equals("vehicleid") || norm.equals("vehicle") || norm.equals("unitid") || norm.equals("assetid") || norm.equals("id")) {
                mapping.put(h, "vehicleId");
            } else if (norm.contains("vin") || norm.contains("chassis")) {
                mapping.put(h, "vin");
            } else if (norm.equals("make") || norm.equals("oem") || norm.equals("brand") || norm.equals("manufacturer")) {
                mapping.put(h, "make");
            } else if (norm.equals("model") || norm.equals("vehiclemodel")) {
                mapping.put(h, "model");
            } else if (norm.equals("year") || norm.equals("modelyear")) {
                mapping.put(h, "year");
            } else if (norm.contains("battery") || norm.equals("soc")) {
                mapping.put(h, "batteryHealthPct");
            } else if (norm.contains("oil")) {
                mapping.put(h, "oilLifePct");
            } else if (norm.contains("tire") || norm.contains("tpms") || norm.contains("psi")) {
                mapping.put(h, "tirePressurePsi");
            } else if (norm.contains("mileage") || norm.contains("odometer") || norm.contains("km") || norm.contains("distance")) {
                mapping.put(h, "odometerKm");
            } else if (norm.contains("fault") || norm.contains("dtc") || norm.contains("errorcode")) {
                mapping.put(h, "faultCode");
            } else if (norm.contains("time") || norm.contains("date")) {
                mapping.put(h, "timestamp");
            } else if (norm.contains("event") || norm.equals("type") || norm.equals("condition")) {
                mapping.put(h, "eventType");
            } else if (norm.contains("severity") || norm.contains("priority")) {
                mapping.put(h, "severity");
            } else if (norm.contains("idle")) {
                mapping.put(h, "idleMinutes");
            }
        }
        return mapping;
    }

    private Object parseValue(String field, String val) {
        val = val.trim();
        try {
            switch (field) {
                case "batteryHealthPct":
                case "oilLifePct":
                case "tirePressurePsi":
                case "fuelConsumedLiters":
                case "operatingHours":
                    return Double.parseDouble(val.replaceAll("[^0-9.]", ""));
                case "odometerKm":
                    return Long.parseLong(val.replaceAll("[^0-9]", ""));
                case "year":
                case "idleMinutes":
                    return Integer.parseInt(val.replaceAll("[^0-9]", ""));
                default:
                    return val;
            }
        } catch (Exception e) {
            return val;
        }
    }

    private String deriveEventType(Map<String, Object> payload) {
        if (payload.get("faultCode") != null && !payload.get("faultCode").toString().isBlank()) {
            return "ENGINE_FAULT";
        }
        if (payload.get("batteryHealthPct") instanceof Number n && n.doubleValue() < 80.0) {
            return "BATTERY_WARNING";
        }
        if (payload.get("oilLifePct") instanceof Number n && n.doubleValue() < 10.0) {
            return "MAINTENANCE_DUE";
        }
        if (payload.get("tirePressurePsi") instanceof Number n && n.doubleValue() < 30.0) {
            return "TIRE_PRESSURE_LOW";
        }
        if (payload.get("idleMinutes") instanceof Number n && n.intValue() > 30) {
            return "EXCESSIVE_IDLE";
        }
        return "TELEMETRY_LOG";
    }

    private String deriveSeverity(Map<String, Object> payload) {
        if (payload.get("faultCode") != null && !payload.get("faultCode").toString().isBlank()) {
            return "CRITICAL";
        }
        if (payload.get("batteryHealthPct") instanceof Number n && n.doubleValue() < 70.0) {
            return "CRITICAL";
        }
        if (payload.get("oilLifePct") instanceof Number n && n.doubleValue() < 5.0) {
            return "HIGH";
        }
        if (payload.get("tirePressurePsi") instanceof Number n && n.doubleValue() < 28.0) {
            return "HIGH";
        }
        return "NOMINAL";
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> DateUtil.isCellDateFormatted(cell)
                    ? cell.getLocalDateTimeCellValue().toString()
                    : String.valueOf(cell.getNumericCellValue()).replaceAll("\\.0$", "");
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> cell.getCellFormula();
            default -> "";
        };
    }
}
