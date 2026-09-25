package com.fleetiq.repository;

import com.fleetiq.model.CanonicalVehicleEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface CanonicalVehicleEventRepository extends JpaRepository<CanonicalVehicleEvent, String> {
    List<CanonicalVehicleEvent> findByVehicleIdOrderByTimestampDesc(String vehicleId);
    default List<CanonicalVehicleEvent> findRecentByVehicleId(String vehicleId) {
        return findByVehicleIdOrderByTimestampDesc(vehicleId);
    }
    List<CanonicalVehicleEvent> findTop50ByOrderByTimestampDesc();
    Page<CanonicalVehicleEvent> findAllByOrderByTimestampDesc(Pageable pageable);

    long countByEventType(String eventType);
    long countBySeverity(String severity);
    long countByStatus(String status);
    long countByTimestampAfter(Instant time);

    @Query("SELECT COUNT(e) FROM CanonicalVehicleEvent e WHERE e.timestamp >= :since AND e.severity = :severity")
    long countRecentBySeverity(@Param("since") Instant since, @Param("severity") String severity);

    @Query("SELECT e FROM CanonicalVehicleEvent e WHERE (:severity IS NULL OR e.severity = :severity) AND (:eventType IS NULL OR e.eventType = :eventType) ORDER BY e.timestamp DESC")
    Page<CanonicalVehicleEvent> filterEvents(@Param("severity") String severity, @Param("eventType") String eventType, Pageable pageable);
}
