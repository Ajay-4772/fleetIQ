package com.fleetiq.model;

/**
 * Strict 2-Role Enterprise Model for VEHYRON:
 * - ROLE_ADMIN: Full system governance, user directory, ingestion connectors, file upload, dead-letter retry.
 * - ROLE_OPERATOR: Connected vehicle operations, telemetry inspection, actions, alerts, copilot.
 */
public enum Role {
    ROLE_ADMIN,
    ROLE_OPERATOR;

    public static Role fromString(String roleStr) {
        if (roleStr == null) return ROLE_OPERATOR;
        String normalized = roleStr.trim().toUpperCase();
        if (normalized.equals("ADMIN") || normalized.equals("ROLE_ADMIN")) {
            return ROLE_ADMIN;
        }
        return ROLE_OPERATOR;
    }
}
