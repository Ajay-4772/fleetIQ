package com.fleetiq.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final com.fleetiq.repository.UserRepository userRepository;

    public JwtAuthenticationFilter(JwtTokenProvider tokenProvider, com.fleetiq.repository.UserRepository userRepository) {
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String token = resolveToken(request);

        if (StringUtils.hasText(token) && tokenProvider.validateToken(token)) {
            String username = tokenProvider.getUsernameFromToken(token);

            if (username != null) {
                // Real-time server-side authorization check against live DB:
                // 1. Instant session invalidation / deactivation if user.isEnabled() == false.
                // 2. Real-time role reflection: use role from DB so role promotions/demotions take effect immediately.
                var userOpt = userRepository.findByUsername(username);
                if (userOpt.isPresent()) {
                    var user = userOpt.get();
                    if (user.isEnabled()) {
                        String currentRole = user.getRole().name();
                        SimpleGrantedAuthority authority = new SimpleGrantedAuthority(
                                currentRole.startsWith("ROLE_") ? currentRole : "ROLE_" + currentRole);
                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(username, null, Collections.singletonList(authority));
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                    // If user is disabled, authentication remains unset in SecurityContext, blocking request immediately.
                } else {
                    // Fallback for system / token-only principals
                    String role = tokenProvider.getRoleFromToken(token);
                    if (role != null) {
                        SimpleGrantedAuthority authority = new SimpleGrantedAuthority(
                                role.startsWith("ROLE_") ? role : "ROLE_" + role);
                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(username, null, Collections.singletonList(authority));
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        // Support token as query parameter for SSE EventSource
        String tokenParam = request.getParameter("token");
        if (StringUtils.hasText(tokenParam)) {
            return tokenParam;
        }
        return null;
    }
}
