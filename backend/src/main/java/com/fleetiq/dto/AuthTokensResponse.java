package com.fleetiq.dto;

public class AuthTokensResponse {

    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    private long expiresInMs;
    private String username;
    private String fullName;
    private String email;
    private String role;
    private String organization;
    private String status = "ACTIVE";
    private String message;

    public AuthTokensResponse() {}

    public AuthTokensResponse(String accessToken, String refreshToken, long expiresInMs, String username, String fullName, String email, String role, String organization) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.tokenType = "Bearer";
        this.expiresInMs = expiresInMs;
        this.username = username;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.organization = organization;
        this.status = "ACTIVE";
    }

    public AuthTokensResponse(String accessToken, String refreshToken, long expiresInMs, String username, String fullName, String email, String role, String organization, String status, String message) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.tokenType = "Bearer";
        this.expiresInMs = expiresInMs;
        this.username = username;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.organization = organization;
        this.status = status;
        this.message = message;
    }

    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }

    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }

    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }

    public long getExpiresInMs() { return expiresInMs; }
    public void setExpiresInMs(long expiresInMs) { this.expiresInMs = expiresInMs; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getOrganization() { return organization; }
    public void setOrganization(String organization) { this.organization = organization; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
