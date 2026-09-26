package com.fleetiq.dto;

public class DayUtilizationDto {
    private String day; // Sun, Mon, Tue, Wed, Thu, Fri, Sat
    private long distanceKm;
    private int activeVehicles;
    private boolean isPeak;

    public DayUtilizationDto() {}

    public DayUtilizationDto(String day, long distanceKm, int activeVehicles, boolean isPeak) {
        this.day = day;
        this.distanceKm = distanceKm;
        this.activeVehicles = activeVehicles;
        this.isPeak = isPeak;
    }

    public String getDay() { return day; }
    public void setDay(String day) { this.day = day; }

    public long getDistanceKm() { return distanceKm; }
    public void setDistanceKm(long distanceKm) { this.distanceKm = distanceKm; }

    public int getActiveVehicles() { return activeVehicles; }
    public void setActiveVehicles(int activeVehicles) { this.activeVehicles = activeVehicles; }

    public boolean isPeak() { return isPeak; }
    public void setPeak(boolean peak) { isPeak = peak; }
}
