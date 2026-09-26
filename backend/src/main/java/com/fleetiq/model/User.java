package com.fleetiq.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 64)
    private String username;

    @Column(nullable = false, length = 128)
    private String password;

    @Column(nullable = false, length = 128)
    private String fullName;

    @Column(unique = true, length = 128)
    private String email;

    @Column(nullable = false)
    private boolean emailVerified = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private Role role;

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(nullable = false)
    private int failedAttempts = 0;

    @Column
    private Instant lockedUntil;

    @Column
    private Instant lastLoginAt;

    @Column(length = 128)
    private String organization;

    @Column(nullable = false, length = 32)
    private String status = "ACTIVE"; // ACTIVE, PENDING_APPROVAL, REJECTED, DEACTIVATED

    @Column(length = 32)
    private String requestedRole;

    @Column(length = 64)
    private String approvedBy;

    @Column
    private Instant approvedAt;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    public User() {}

    public User(String username, String password, String fullName, Role role) {
        this.username = username;
        this.password = password;
        this.fullName = fullName;
        this.role = role;
        this.enabled = true;
        this.emailVerified = false;
        this.failedAttempts = 0;
        this.createdAt = Instant.now();
    }

    public User(String username, String password, String fullName, String email, Role role, String organization) {
        this.username = username;
        this.password = password;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.organization = organization;
        this.enabled = true;
        this.emailVerified = false;
        this.failedAttempts = 0;
        this.createdAt = Instant.now();
    }

    public boolean isAccountNonLocked() {
        if (lockedUntil == null) {
            return true;
        }
        return Instant.now().isAfter(lockedUntil);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public boolean isEmailVerified() { return emailVerified; }
    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    public int getFailedAttempts() { return failedAttempts; }
    public void setFailedAttempts(int failedAttempts) { this.failedAttempts = failedAttempts; }

    public Instant getLockedUntil() { return lockedUntil; }
    public void setLockedUntil(Instant lockedUntil) { this.lockedUntil = lockedUntil; }

    public Instant getLastLoginAt() { return lastLoginAt; }
    public void setLastLoginAt(Instant lastLoginAt) { this.lastLoginAt = lastLoginAt; }

    public String getOrganization() { return organization; }
    public void setOrganization(String organization) { this.organization = organization; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRequestedRole() { return requestedRole; }
    public void setRequestedRole(String requestedRole) { this.requestedRole = requestedRole; }

    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }

    public Instant getApprovedAt() { return approvedAt; }
    public void setApprovedAt(Instant approvedAt) { this.approvedAt = approvedAt; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
