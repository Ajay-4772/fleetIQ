package com.fleetiq.dto;

import com.fleetiq.model.User;

import java.time.Instant;

public class UserAdminDto {

    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String organization;
    private String role;
    private String requestedRole;
    private String status;
    private boolean enabled;
    private Instant lastLoginAt;
    private Instant createdAt;

    public UserAdminDto() {}

    public UserAdminDto(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.fullName = user.getFullName();
        this.email = user.getEmail();
        this.organization = user.getOrganization();
        this.role = user.getRole() != null ? user.getRole().name() : "ROLE_OPERATOR";
        this.requestedRole = user.getRequestedRole();
        this.status = user.getStatus() != null ? user.getStatus() : (user.isEnabled() ? "ACTIVE" : "DEACTIVATED");
        this.enabled = user.isEnabled();
        this.lastLoginAt = user.getLastLoginAt();
        this.createdAt = user.getCreatedAt();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getOrganization() { return organization; }
    public void setOrganization(String organization) { this.organization = organization; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getRequestedRole() { return requestedRole; }
    public void setRequestedRole(String requestedRole) { this.requestedRole = requestedRole; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    public Instant getLastLoginAt() { return lastLoginAt; }
    public void setLastLoginAt(Instant lastLoginAt) { this.lastLoginAt = lastLoginAt; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
