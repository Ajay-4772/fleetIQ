package com.fleetiq.dto;

import java.util.ArrayList;
import java.util.List;

public class WeeklyUtilizationDto {
    private boolean hasData;
    private List<DayUtilizationDto> days = new ArrayList<>();
    private String peakDay;
    private Long peakKm;
    private Double averageDailyKm;

    public WeeklyUtilizationDto() {}

    public WeeklyUtilizationDto(boolean hasData, List<DayUtilizationDto> days, String peakDay, Long peakKm, Double averageDailyKm) {
        this.hasData = hasData;
        this.days = days != null ? days : new ArrayList<>();
        this.peakDay = peakDay;
        this.peakKm = peakKm;
        this.averageDailyKm = averageDailyKm;
    }

    public boolean isHasData() { return hasData; }
    public void setHasData(boolean hasData) { this.hasData = hasData; }

    public List<DayUtilizationDto> getDays() { return days; }
    public void setDays(List<DayUtilizationDto> days) { this.days = days; }

    public String getPeakDay() { return peakDay; }
    public void setPeakDay(String peakDay) { this.peakDay = peakDay; }

    public Long getPeakKm() { return peakKm; }
    public void setPeakKm(Long peakKm) { this.peakKm = peakKm; }

    public Double getAverageDailyKm() { return averageDailyKm; }
    public void setAverageDailyKm(Double averageDailyKm) { this.averageDailyKm = averageDailyKm; }
}
