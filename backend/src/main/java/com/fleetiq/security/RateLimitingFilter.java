package com.fleetiq.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fleetiq.dto.ApiErrorResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitingFilter.class);

    private final ObjectMapper objectMapper;

    // In-memory sliding window counters: key -> RequestCounter
    private final Map<String, RequestCounter> counters = new ConcurrentHashMap<>();

    // Rate limits (requests per minute window)
    public static final int AUTH_LIMIT_PER_MINUTE = 15;
    public static final int ASSISTANT_LIMIT_PER_MINUTE = 40;
    public static final int INGESTION_LIMIT_PER_MINUTE = 300;
    public static final int GENERAL_LIMIT_PER_MINUTE = 600;

    public RateLimitingFilter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // Bypass static resources or health checks
        if (path.startsWith("/actuator") || path.startsWith("/h2-console") || "OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = resolveClientIp(request);
        String category = resolveCategory(path);
        int maxAllowed = getMaxAllowed(category);

        long currentMinute = System.currentTimeMillis() / 60000;
        String key = category + ":" + clientIp + ":" + currentMinute;

        RequestCounter counter = counters.computeIfAbsent(key, k -> new RequestCounter(currentMinute));
        int currentCount = counter.increment();

        // Passive cleanup of stale keys older than 2 minutes
        if (counters.size() > 5000) {
            cleanupStaleCounters(currentMinute);
        }

        if (currentCount > maxAllowed) {
            log.warn("Rate limit exceeded for IP {} on route {} [count: {}, limit: {}]", clientIp, path, currentCount, maxAllowed);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setHeader("Retry-After", "60");
            response.setHeader("X-RateLimit-Limit", String.valueOf(maxAllowed));
            response.setHeader("X-RateLimit-Remaining", "0");
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);

            ApiErrorResponse error = new ApiErrorResponse(
                    HttpStatus.TOO_MANY_REQUESTS.value(),
                    "Too Many Requests",
                    "RATE_LIMIT_EXCEEDED",
                    "Rate limit of " + maxAllowed + " requests per minute exceeded for this endpoint category. Please retry in 60 seconds.",
                    path,
                    response.getHeader("X-Trace-Id") != null ? response.getHeader("X-Trace-Id") : "N/A"
            );

            response.getWriter().write(objectMapper.writeValueAsString(error));
            return;
        }

        response.setHeader("X-RateLimit-Limit", String.valueOf(maxAllowed));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(Math.max(0, maxAllowed - currentCount)));

        filterChain.doFilter(request, response);
    }

    private String resolveCategory(String path) {
        if (path.contains("/auth/login")) {
            return "AUTH";
        } else if (path.contains("/assistant") || path.contains("/fleet/query")) {
            return "ASSISTANT";
        } else if (path.contains("/events/ingest")) {
            return "INGESTION";
        }
        return "GENERAL";
    }

    private int getMaxAllowed(String category) {
        return switch (category) {
            case "AUTH" -> AUTH_LIMIT_PER_MINUTE;
            case "ASSISTANT" -> ASSISTANT_LIMIT_PER_MINUTE;
            case "INGESTION" -> INGESTION_LIMIT_PER_MINUTE;
            default -> GENERAL_LIMIT_PER_MINUTE;
        };
    }

    private String resolveClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "127.0.0.1";
    }

    private void cleanupStaleCounters(long currentMinute) {
        counters.entrySet().removeIf(entry -> entry.getValue().minute < (currentMinute - 2));
    }

    private static class RequestCounter {
        final long minute;
        final AtomicInteger count = new AtomicInteger(0);

        RequestCounter(long minute) {
            this.minute = minute;
        }

        int increment() {
            return count.incrementAndGet();
        }
    }
}
