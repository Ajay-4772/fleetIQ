package com.fleetiq.dto;

import com.fleetiq.model.ActionItem;
import com.fleetiq.model.CanonicalVehicleEvent;
import com.fleetiq.model.Decision;
import com.fleetiq.model.Vehicle;

import java.util.List;

public class VehicleProfileDto {
    private Vehicle vehicle;
    private List<CanonicalVehicleEvent> recentEvents;
    private List<ActionItem> activeActions;
    private List<Decision> decisions;

    public VehicleProfileDto() {}

    public VehicleProfileDto(Vehicle vehicle, List<CanonicalVehicleEvent> recentEvents,
                             List<ActionItem> activeActions, List<Decision> decisions) {
        this.vehicle = vehicle;
        this.recentEvents = recentEvents;
        this.activeActions = activeActions;
        this.decisions = decisions;
    }

    public Vehicle getVehicle() { return vehicle; }
    public void setVehicle(Vehicle vehicle) { this.vehicle = vehicle; }

    public List<CanonicalVehicleEvent> getRecentEvents() { return recentEvents; }
    public void setRecentEvents(List<CanonicalVehicleEvent> recentEvents) { this.recentEvents = recentEvents; }

    public List<ActionItem> getActiveActions() { return activeActions; }
    public void setActiveActions(List<ActionItem> activeActions) { this.activeActions = activeActions; }

    public List<Decision> getDecisions() { return decisions; }
    public void setDecisions(List<Decision> decisions) { this.decisions = decisions; }
}
