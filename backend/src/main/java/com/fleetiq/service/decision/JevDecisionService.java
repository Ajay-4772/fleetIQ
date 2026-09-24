package com.fleetiq.service.decision;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fleetiq.model.CanonicalVehicleEvent;
import com.fleetiq.model.Decision;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service("jevDecisionService")
public class JevDecisionService implements DecisionService {

    private static final Logger log = LoggerFactory.getLogger(JevDecisionService.class);

    private final RuleBasedDecisionService ruleBasedDecisionService;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    @Value("${fleetiq.jev.enabled:false}")
    private boolean enabled;

    @Value("${fleetiq.jev.api-url:https://api.jev.ai/v1/decisions}")
    private String apiUrl;

    @Value("${fleetiq.jev.api-key:}")
    private String apiKey;

    @Value("${fleetiq.jev.confidence-threshold:0.80}")
    private double confidenceThreshold;

    public JevDecisionService(RuleBasedDecisionService ruleBasedDecisionService, ObjectMapper objectMapper) {
        this.ruleBasedDecisionService = ruleBasedDecisionService;
        this.objectMapper = objectMapper;
        this.restTemplate = new RestTemplate();
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    @Override
    public Decision evaluate(CanonicalVehicleEvent event, double estimatedImpact) {
        // If Jev AI is disabled, or API key is not configured, gracefully use rule engine fallback
        if (!enabled || apiKey == null || apiKey.trim().isEmpty()) {
            Decision fallback = ruleBasedDecisionService.evaluate(event, estimatedImpact);
            fallback.setDecisionSource("RULE_ENGINE_FALLBACK");
            fallback.setRationale("Jev AI not configured or offline; deterministic rule-based fallback applied.");
            fallback.setRequiresHumanReview(true);
            return fallback;
        }

        try {
            // Build strictly sanitized synthetic payload for Jev AI
            Map<String, Object> requestPayload = new HashMap<>();
            requestPayload.put("vehicle_id", event.getVehicleId());
            requestPayload.put("event_type", event.getEventType());
            requestPayload.put("severity", event.getSeverity());
            requestPayload.put("fault_code", event.getFaultCode());
            requestPayload.put("idle_minutes", event.getIdleMinutes());
            requestPayload.put("oil_life_pct", event.getOilLifePct());
            requestPayload.put("battery_health_pct", event.getBatteryHealthPct());
            requestPayload.put("estimated_impact", estimatedImpact);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestPayload, headers);
            ResponseEntity<String> response = restTemplate.exchange(apiUrl, HttpMethod.POST, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                if (!root.has("recommended_action") || !root.has("priority") || !root.has("confidence")) {
                    throw new IllegalStateException("Malformed response schema from Jev AI");
                }

                String recommendedAction = root.get("recommended_action").asText();
                String priority = root.get("priority").asText();
                double confidence = root.get("confidence").asDouble();
                boolean humanReview = confidence < confidenceThreshold;

                return new Decision(
                        "JEV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
                        event.getEventId(),
                        event.getVehicleId(),
                        event.getEventType(),
                        "AI_DIRECTIVE",
                        recommendedAction,
                        priority,
                        estimatedImpact,
                        confidence,
                        "JEV_AI",
                        "AI Decision generated with confidence " + Math.round(confidence * 100) + "%",
                        humanReview
                );
            } else {
                throw new RuntimeException("Jev AI returned non-2xx status: " + response.getStatusCode());
            }

        } catch (Exception e) {
            log.warn("Jev AI call failed or timed out ({}). Triggering deterministic rule-based fallback.", e.getMessage());
            Decision fallback = ruleBasedDecisionService.evaluate(event, estimatedImpact);
            fallback.setDecisionSource("RULE_ENGINE_FALLBACK");
            fallback.setRationale("Jev AI encountered an error (" + e.getMessage() + "); deterministic fallback executed.");
            fallback.setRequiresHumanReview(true);
            return fallback;
        }
    }
}
