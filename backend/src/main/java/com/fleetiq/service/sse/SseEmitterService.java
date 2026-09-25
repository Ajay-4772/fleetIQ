package com.fleetiq.service.sse;

import com.fleetiq.dto.DashboardEventDto;
import io.micrometer.tracing.Tracer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class SseEmitterService {

    private static final Logger log = LoggerFactory.getLogger(SseEmitterService.class);
    private static final Long EMITTER_TIMEOUT = 180_000L; // 3 minutes timeout before reconnect

    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();
    private final List<DashboardEventDto> recentEventsBuffer = new CopyOnWriteArrayList<>();
    private static final int BUFFER_LIMIT = 50;

    private final ObjectProvider<Tracer> tracerProvider;

    public SseEmitterService(ObjectProvider<Tracer> tracerProvider) {
        this.tracerProvider = tracerProvider;
    }

    public SseEmitter createEmitter() {
        SseEmitter emitter = new SseEmitter(EMITTER_TIMEOUT);

        emitters.add(emitter);
        log.info("New SSE client subscribed. Active emitters count: {}", emitters.size());

        emitter.onCompletion(() -> {
            emitters.remove(emitter);
            log.info("SSE client completed. Active emitters: {}", emitters.size());
        });

        emitter.onTimeout(() -> {
            emitter.complete();
            emitters.remove(emitter);
            log.info("SSE client timed out. Active emitters: {}", emitters.size());
        });

        emitter.onError((e) -> {
            emitters.remove(emitter);
            log.debug("SSE client error: {}", e.getMessage());
        });

        // Send initial connection ACK
        try {
            emitter.send(SseEmitter.event()
                    .name("CONNECTED")
                    .data("{\"status\":\"CONNECTED\",\"activeClients\":" + emitters.size() + "}"));

            // Replay recent buffered events to new subscriber
            for (DashboardEventDto evt : recentEventsBuffer) {
                emitter.send(SseEmitter.event()
                        .name(evt.getEventType())
                        .data(evt));
            }
        } catch (IOException e) {
            emitters.remove(emitter);
        }

        return emitter;
    }

    public void broadcast(String eventName, Object data) {
        if (data instanceof DashboardEventDto) {
            DashboardEventDto dto = (DashboardEventDto) data;
            Tracer tracer = tracerProvider.getIfAvailable();
            if (tracer != null && tracer.currentSpan() != null) {
                String activeTraceId = tracer.currentSpan().context().traceId();
                if (activeTraceId != null && !activeTraceId.isBlank()) {
                    dto.setTraceId(activeTraceId);
                    if (dto.getCorrelationId() == null || dto.getCorrelationId().isBlank()) {
                        dto.setCorrelationId(activeTraceId);
                    }
                }
            }
            recentEventsBuffer.add(dto);
            if (recentEventsBuffer.size() > BUFFER_LIMIT) {
                recentEventsBuffer.remove(0);
            }
        }

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name(eventName)
                        .data(data));
            } catch (Exception e) {
                emitters.remove(emitter);
            }
        }
    }

    @Scheduled(fixedRate = 25000)
    public void sendHeartbeat() {
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name("HEARTBEAT").data("ping"));
            } catch (Exception e) {
                emitters.remove(emitter);
            }
        }
    }

    public int getActiveClientCount() {
        return emitters.size();
    }
}
