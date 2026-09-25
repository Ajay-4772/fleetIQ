package com.fleetiq;

import com.fleetiq.dto.DashboardEventDto;
import com.fleetiq.service.sse.SseEmitterService;
import io.micrometer.tracing.Tracer;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class DistributedTracingTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired(required = false)
    private Tracer tracer;

    @Autowired
    private SseEmitterService sseEmitterService;

    @Test
    @DisplayName("Tracer bean must be available and active in Spring context")
    void testTracerBeanAvailable() {
        assertNotNull(tracer, "OpenTelemetry Tracer must be initialized by Spring Boot");
    }

    @Test
    @DisplayName("Public HTTP request must return X-Trace-Id response header")
    void testTraceHeaderOnPublicEndpoint() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk())
                .andExpect(header().exists("X-Trace-Id"));
    }

    @Test
    @DisplayName("W3C traceparent header must be propagated into response X-Trace-Id")
    void testW3cTraceparentPropagation() throws Exception {
        // W3C traceparent: version(00)-traceId(32 hex)-parentId(16 hex)-flags(01)
        String incomingTraceId = "4bf92f3577b34da6a3ce929d0e0e4736";
        String traceparent = "00-" + incomingTraceId + "-00f067aa0ba902b7-01";

        mockMvc.perform(get("/actuator/info")
                        .header("traceparent", traceparent))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Trace-Id", incomingTraceId));
    }

    @Test
    @DisplayName("SSE broadcast correlates telemetry with active trace context")
    void testSseBroadcastTraceCorrelation() {
        assertNotNull(sseEmitterService);
        DashboardEventDto dto = new DashboardEventDto();
        dto.setEventType("TELEMETRY");
        dto.setVehicleId("VH-1001");

        // Broadcast event and ensure buffer stores event with trace/correlation ID
        sseEmitterService.broadcast("TELEMETRY", dto);

        assertNotNull(dto.getCorrelationId(), "Correlation ID must be generated");
    }
}
