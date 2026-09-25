package com.fleetiq.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 128, message = "Full name must be between 2 and 128 characters")
    private String fullName;

    @NotBlank(message = "Corporate email is required")
    @Email(message = "Please provide a valid corporate email address")
    private String email;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 32, message = "Username must be between 3 and 32 characters")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 64, message = "Password must be at least 8 characters long")
    private String password;

    private String organization;

    private String requestedRole;

    @AssertTrue(message = "You must agree to the Terms of Service and Privacy Policy")
    private boolean termsAccepted;

    public RegisterRequest() {}

    public RegisterRequest(String fullName, String email, String username, String password, String organization, boolean termsAccepted) {
        this(fullName, email, username, password, organization, "OPERATOR", termsAccepted);
    }

    public RegisterRequest(String fullName, String email, String username, String password, String organization, String requestedRole, boolean termsAccepted) {
        this.fullName = fullName;
        this.email = email;
        this.username = username;
        this.password = password;
        this.organization = organization;
        this.requestedRole = requestedRole;
        this.termsAccepted = termsAccepted;
    }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getOrganization() { return organization; }
    public void setOrganization(String organization) { this.organization = organization; }

    public String getRequestedRole() { return requestedRole; }
    public void setRequestedRole(String requestedRole) { this.requestedRole = requestedRole; }

    public boolean isTermsAccepted() { return termsAccepted; }
    public void setTermsAccepted(boolean termsAccepted) { this.termsAccepted = termsAccepted; }
}
