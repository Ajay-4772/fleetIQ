package com.fleetiq.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.Instant;

@Entity
@Table(name = "vehicles")
public class Vehicle {

    @Id
    @Column(name = "id", length = 32)
    private String id;

    @Column(name = "vin", unique = true, nullable = false, length = 64)
    private String vin;

    @Column(name = "registration_number", length = 32)
    private String registrationNumber;

    @Column(name = "make", nullable = false, length = 32)
    private String make;

    @Column(name = "model", nullable = false, length = 64)
    private String model;

    @Column(name = "model_year")
    private Integer year;

    @Column(name = "fuel_type", length = 32)
    private String fuelType;

    @Column(name = "vehicle_type", length = 32)
    private String vehicleType;

    @Column(name = "mileage_km")
    private Long mileageKm;

    @Column(name = "status", length = 32)
    private String status; // ACTIVE, INACTIVE, MAINTENANCE

    @Column(name = "battery_health_pct")
    private Double batteryHealthPct;

    @Column(name = "oil_life_pct")
    private Double oilLifePct;

    @Column(name = "tire_pressure_psi")
    private Double tirePressurePsi;

    @Column(name = "avg_mpg")
    private Double avgMpg;

    @Column(name = "last_service_date")
    private LocalDate lastServiceDate;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public Vehicle() {}

    public Vehicle(String id, String vin, String registrationNumber, String make, String model,
                   Integer year, String fuelType, String vehicleType, Long mileageKm, String status,
                   Double batteryHealthPct, Double oilLifePct, Double tirePressurePsi, Double avgMpg,
                   LocalDate lastServiceDate) {
        this.id = id;
        this.vin = vin;
        this.registrationNumber = registrationNumber;
        this.make = make;
        this.model = model;
        this.year = year;
        this.fuelType = fuelType;
        this.vehicleType = vehicleType;
        this.mileageKm = mileageKm;
        this.status = status;
        this.batteryHealthPct = batteryHealthPct;
        this.oilLifePct = oilLifePct;
        this.tirePressurePsi = tirePressurePsi;
        this.avgMpg = avgMpg;
        this.lastServiceDate = lastServiceDate;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getVin() { return vin; }
    public void setVin(String vin) { this.vin = vin; }

    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }

    public String getMake() { return make; }
    public void setMake(String make) { this.make = make; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }

    public String getFuelType() { return fuelType; }
    public void setFuelType(String fuelType) { this.fuelType = fuelType; }

    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

    public Long getMileageKm() { return mileageKm; }
    public void setMileageKm(Long mileageKm) { this.mileageKm = mileageKm; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getBatteryHealthPct() { return batteryHealthPct; }
    public void setBatteryHealthPct(Double batteryHealthPct) { this.batteryHealthPct = batteryHealthPct; }

    public Double getOilLifePct() { return oilLifePct; }
    public void setOilLifePct(Double oilLifePct) { this.oilLifePct = oilLifePct; }

    public Double getTirePressurePsi() { return tirePressurePsi; }
    public void setTirePressurePsi(Double tirePressurePsi) { this.tirePressurePsi = tirePressurePsi; }

    public Double getAvgMpg() { return avgMpg; }
    public void setAvgMpg(Double avgMpg) { this.avgMpg = avgMpg; }

    public LocalDate getLastServiceDate() { return lastServiceDate; }
    public void setLastServiceDate(LocalDate lastServiceDate) { this.lastServiceDate = lastServiceDate; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
