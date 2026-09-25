package com.fleetiq.dto;

public class UserProfileDto {
    private String username;
    private String fullName;
    private String role;

    public UserProfileDto() {}

    public UserProfileDto(String username, String fullName, String role) {
        this.username = username;
        this.fullName = fullName;
        this.role = role;
    }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
