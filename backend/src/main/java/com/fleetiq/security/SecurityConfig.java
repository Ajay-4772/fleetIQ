package com.fleetiq.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;
    private final ApiKeyAuthenticationFilter apiKeyFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtFilter, ApiKeyAuthenticationFilter apiKeyFilter) {
        this.jwtFilter = jwtFilter;
        this.apiKeyFilter = apiKeyFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .headers(headers -> headers.frameOptions(frame -> frame.disable())) // For H2 console
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public Endpoints
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/v1/auth/**", "/api/auth/**").permitAll()
                        .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()
                        .requestMatchers("/api/v1/stream/**", "/api/dashboard/stream").permitAll()

                        // External Ingestion Endpoint (Requires API Key or Lead/Admin Role)
                        .requestMatchers(HttpMethod.POST, "/api/v1/events/ingest", "/api/events/ingest")
                        .hasAnyAuthority("ROLE_INGESTION", "ROLE_OPERATIONS_LEAD", "ROLE_ADMIN")

                        // Action Status Mutations (Operator, Ops Lead, Admin)
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/actions/**", "/api/actions/**")
                        .hasAnyAuthority("ROLE_OPERATOR", "ROLE_OPERATIONS_LEAD", "ROLE_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/actions/**", "/api/actions/**")
                        .hasAnyAuthority("ROLE_OPERATOR", "ROLE_OPERATIONS_LEAD", "ROLE_ADMIN")

                        // Simulator Management (Ops Lead, Admin)
                        .requestMatchers("/api/v1/simulator/**", "/api/simulator/**")
                        .hasAnyAuthority("ROLE_OPERATIONS_LEAD", "ROLE_ADMIN")

                        // System & Data Quality Administration (Admin)
                        .requestMatchers("/api/v1/system/**", "/api/system/**")
                        .hasAuthority("ROLE_ADMIN")

                        // Read endpoints and assistant queries (All authenticated users including Viewer)
                        .requestMatchers("/api/v1/**", "/api/**").authenticated()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(apiKeyFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-API-Key", "X-Requested-With", "Accept"));
        config.setExposedHeaders(Arrays.asList("Authorization", "Content-Disposition"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
