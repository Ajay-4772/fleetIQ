package com.fleetiq.service.sse;

import com.fleetiq.dto.DashboardEventDto;
import org.springframework.stereotype.Service;

@Service
public class DashboardEventPublisher {

    private final SseEmitterService sseEmitterService;

    public DashboardEventPublisher(SseEmitterService sseEmitterService) {
        this.sseEmitterService = sseEmitterService;
    }

    public void publishEvent(DashboardEventDto event) {
        sseEmitterService.broadcast(event.getEventType(), event);

        // If it's a critical severity event, also publish to CRITICAL_EVENT channel
        if ("CRITICAL".equalsIgnoreCase(event.getSeverity())) {
            sseEmitterService.broadcast("CRITICAL_EVENT", event);
        }
    }

    public void publishMetricUpdate(Object metrics) {
        sseEmitterService.broadcast("FLEET_METRIC_UPDATED", metrics);
    }

    public void publishSystemHealth(Object health) {
        sseEmitterService.broadcast("SYSTEM_HEALTH_CHANGED", health);
    }

    public void publishActionUpdate(Object action) {
        sseEmitterService.broadcast("ACTION_UPDATED", action);
    }

    public void publishFallbackOccurred(Object fallbackData) {
        sseEmitterService.broadcast("AI_FALLBACK", fallbackData);
    }
}
