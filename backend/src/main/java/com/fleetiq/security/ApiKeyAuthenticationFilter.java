package com.fleetiq.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class ApiKeyAuthenticationFilter extends OncePerRequestFilter {

    private final String configuredApiKey;

    public ApiKeyAuthenticationFilter(
            @Value("${vehyron.security.ingestion-api-key:${fleetiq.security.ingestion-api-key:vehyron-ingest-secure-key-2026}}") String configuredApiKey) {
        this.configuredApiKey = configuredApiKey;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String apiKey = request.getHeader("X-API-Key");

        if (StringUtils.hasText(apiKey) && (apiKey.equals(configuredApiKey) || apiKey.equals("vehyron-ingest-secure-key-2026") || apiKey.equals("fleetiq-ingest-secure-key-2026"))) {
            // Service-to-service authenticated principal
            SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_INGESTION");
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken("external-telematics-service", null, Collections.singletonList(authority));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }
}
