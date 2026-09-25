package com.fleetiq.config;

import io.micrometer.tracing.Tracer;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 5)
public class TraceResponseFilter extends OncePerRequestFilter {

    public static final String TRACE_HEADER = "X-Trace-Id";
    private final ObjectProvider<Tracer> tracerProvider;

    public TraceResponseFilter(ObjectProvider<Tracer> tracerProvider) {
        this.tracerProvider = tracerProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String incomingTraceId = extractW3cTraceId(request.getHeader("traceparent"));

        try {
            filterChain.doFilter(request, response);
        } finally {
            if (!response.containsHeader(TRACE_HEADER)) {
                String traceId = resolveActiveTraceId();
                if (incomingTraceId != null && !incomingTraceId.isBlank()) {
                    traceId = incomingTraceId;
                }
                if (traceId != null && !traceId.isBlank()) {
                    response.setHeader(TRACE_HEADER, traceId);
                }
            }
        }
    }

    private String resolveActiveTraceId() {
        Tracer tracer = tracerProvider.getIfAvailable();
        if (tracer != null && tracer.currentSpan() != null) {
            return tracer.currentSpan().context().traceId();
        }
        return null;
    }

    private String extractW3cTraceId(String traceparent) {
        if (traceparent != null && traceparent.startsWith("00-")) {
            String[] parts = traceparent.split("-");
            if (parts.length >= 4 && parts[1].length() == 32) {
                return parts[1];
            }
        }
        return null;
    }
}
