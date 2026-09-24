package com.fleetiq.repository;

import com.fleetiq.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, String> {
    long countByStatus(String status);
    List<Vehicle> findByStatus(String status);
    List<Vehicle> findByMakeIgnoreCase(String make);
    List<Vehicle> findByFuelTypeIgnoreCase(String fuelType);

    long countByOilLifePctLessThanEqual(Double oilThreshold);
    long countByBatteryHealthPctLessThanEqual(Double batteryThreshold);
    long countByTirePressurePsiLessThanEqual(Double tireThreshold);

    @Query("SELECT v FROM Vehicle v WHERE v.oilLifePct <= 10.0")
    List<Vehicle> findMaintenanceOverdue();

    @Query("SELECT v FROM Vehicle v WHERE v.batteryHealthPct <= 75.0")
    List<Vehicle> findBatteryAtRisk();

    @Query("SELECT v FROM Vehicle v WHERE v.tirePressurePsi <= 28.0")
    List<Vehicle> findTirePressureLow();
}
