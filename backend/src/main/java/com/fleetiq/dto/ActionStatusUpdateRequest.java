package com.fleetiq.dto;

public class ActionStatusUpdateRequest {
    private String status; // OPEN, IN_PROGRESS, RESOLVED, DISMISSED
    private String notes;

    public ActionStatusUpdateRequest() {}

    public ActionStatusUpdateRequest(String status, String notes) {
        this.status = status;
        this.notes = notes;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
